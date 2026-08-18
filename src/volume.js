"use strict";
/* ══════════ VOLUMETRIC ATMOSPHERE ═══════════════════════════════════════
   A WebGL2 raymarch through the field the engine already computed. Not a
   diagram: every voxel is interpolated from real per-level output.

   Axes, and an honest limit up front:
     X  along track      resolved — one column per waypoint
     Y  vertical         resolved — the ten pressure levels
     Z  across track     NOT RESOLVED for turbulence

   The analysis samples two points either side of track, but it spends them on
   the horizontal wind gradients Ellrod's index needs; it never computes a
   separate EDR there. So the corridor is rendered as a slab of constant
   cross-track value, which gives real depth and parallax but carries no
   cross-track information, and the UI says exactly that. Resolving Z properly
   means fetching a grid rather than a line, which is a request-count decision —
   hence the density control and its cost estimate. */

const VOL = {
  gl:null, prog:null, tex:null, canvas:null, raf:0,
  yaw:-0.6, pitch:0.28, dist:2.6, follow:false, t:0,
  steps:96, lastFrames:[], nx:0, ny:0, nz:0, meta:null,
};

/* ─── build the 3D texture from the analysis ─── */
const VOL_FL_TOP = 480;                       // render up to FL480

function buildVolume(R, nx = 96, ny = 64, nz = 24){
  const live = R.live;
  if (!live || live.length < 2) return null;
  const data = new Float32Array(nx*ny*nz*4);

  /* Sample the analysis at an arbitrary fraction along track and altitude. */
  const columnAtFrac = (f) => {
    const x = clamp(f, 0, 1) * (live.length - 1);
    const i = Math.min(live.length-2, Math.floor(x));
    return { a: live[i], b: live[i+1], t: x - i };
  };
  const edrAt = (f, ft) => {
    const { a, b, t } = columnAtFrac(f);
    const ea = columnAt(a.column, ft).edr, eb = columnAt(b.column, ft).edr;
    return lerp(ea, eb, t);
  };
  const spdAt = (f, ft) => {
    const { a, b, t } = columnAtFrac(f);
    const pick = (w) => {
      if (!w.C) return 0;
      let lo=null, hi=null;
      for (const l of w.C){ if (!l) continue;
        if (l.ft <= ft && (!lo || l.ft > lo.ft)) lo = l;
        if (l.ft >= ft && (!hi || l.ft < hi.ft)) hi = l; }
      if (lo && hi && hi.ft > lo.ft) return lerp(lo.spd, hi.spd, (ft-lo.ft)/(hi.ft-lo.ft));
      return (lo || hi || {spd:0}).spd;
    };
    return lerp(pick(a), pick(b), t);
  };

  for (let z=0; z<nz; z++){
    for (let y=0; y<ny; y++){
      const ft = (y/(ny-1)) * VOL_FL_TOP * 100;
      for (let x=0; x<nx; x++){
        const f = x/(nx-1);
        const i = 4*(z*ny*nx + y*nx + x);
        data[i]   = clamp(edrAt(f, ft), 0, 1);
        data[i+1] = clamp(spdAt(f, ft)/80, 0, 1);   // 80 m/s ≈ 155 kt full scale
        data[i+2] = 0;
        data[i+3] = 1;
      }
    }
  }

  /* Terrain and tropopause as height fields along track, plus the flight path. */
  const terrain = new Float32Array(nx), trop = new Float32Array(nx), path = new Float32Array(nx);
  for (let x=0; x<nx; x++){
    const f = x/(nx-1);
    if (R.elev && R.elev.length){
      const e = R.elev[Math.round(f*(R.elev.length-1))] || 0;
      terrain[x] = clamp((e/FT)/(VOL_FL_TOP*100), 0, 1);
    }
    const { a, b, t } = columnAtFrac(f);
    const ta = a.trop ? a.trop.ft : 36000, tb = b.trop ? b.trop.ft : 36000;
    trop[x] = clamp(lerp(ta, tb, t)/(VOL_FL_TOP*100), 0, 1);
    path[x] = clamp(lerp(a.altFt, b.altFt, t)/(VOL_FL_TOP*100), 0, 1);
  }
  return { data, nx, ny, nz, terrain, trop, path,
           distNM: R.route.distNM, topFL: VOL_FL_TOP };
}

/* ─── shaders ─── */
const VOL_VS = `#version 300 es
in vec2 p; out vec2 uv;
void main(){ uv = p*0.5+0.5; gl_Position = vec4(p,0.0,1.0); }`;

const VOL_FS = `#version 300 es
precision highp float; precision highp sampler3D;
in vec2 uv; out vec4 frag;
uniform sampler3D vol;
uniform sampler2D fields;      // r=terrain g=tropopause b=flight path
uniform vec3  camPos;
uniform mat3  camRot;
uniform float steps, jetThresh, aspect, showJet, showTrop, showTerr;

/* the app's EDR ramp, as anchors */
vec3 ramp(float e){
  vec3 c0=vec3(0.055,0.106,0.169), c1=vec3(0.071,0.412,0.373), c2=vec3(0.122,0.784,0.706);
  vec3 c3=vec3(0.608,0.851,0.247), c4=vec3(1.0,0.788,0.235), c5=vec3(1.0,0.541,0.239);
  vec3 c6=vec3(0.941,0.290,0.388), c7=vec3(0.780,0.400,1.0);
  float v=clamp(e,0.0,0.85);
  if(v<0.05) return mix(c0,c1,v/0.05);
  if(v<0.11) return mix(c1,c2,(v-0.05)/0.06);
  if(v<0.18) return mix(c2,c3,(v-0.11)/0.07);
  if(v<0.24) return mix(c3,c4,(v-0.18)/0.06);
  if(v<0.33) return mix(c4,c5,(v-0.24)/0.09);
  if(v<0.46) return mix(c5,c6,(v-0.33)/0.13);
  return mix(c6,c7,clamp((v-0.46)/0.16,0.0,1.0));
}

bool hitBox(vec3 ro, vec3 rd, out float t0, out float t1){
  vec3 inv = 1.0/rd;
  vec3 a = (vec3(-1.0)-ro)*inv, b = (vec3(1.0)-ro)*inv;
  vec3 lo = min(a,b), hi = max(a,b);
  t0 = max(max(lo.x,lo.y),lo.z); t1 = min(min(hi.x,hi.y),hi.z);
  return t1 > max(t0,0.0);
}

void main(){
  vec2 ndc = (uv*2.0-1.0); ndc.x *= aspect;
  vec3 rd = normalize(camRot * normalize(vec3(ndc, -1.6)));
  vec3 ro = camPos;
  float t0,t1;
  if(!hitBox(ro,rd,t0,t1)){ frag = vec4(0.027,0.043,0.078,1.0); return; }
  t0 = max(t0,0.0);
  float dt = (t1-t0)/steps;

  vec4 acc = vec4(0.0);
  float prevSpd = 0.0;
  for(float i=0.0; i<512.0; i+=1.0){
    if(i>=steps || acc.a>0.985) break;
    vec3 pw = ro + rd*(t0 + dt*(i+0.5));
    vec3 q  = pw*0.5+0.5;                       // [-1,1] -> [0,1]
    vec4 s  = texture(vol, q);
    float edr = s.r, spd = s.g;

    /* turbulence as emissive fog, thresholded so smooth air stays invisible */
    float dens = smoothstep(0.045, 0.55, edr);
    if(dens > 0.0){
      vec3 col = ramp(edr);
      float a = 1.0 - exp(-dens*dt*7.0);
      acc.rgb += (1.0-acc.a)*col*a;
      acc.a   += (1.0-acc.a)*a;
    }

    /* jet stream isosurface: where wind speed crosses the threshold */
    if(showJet > 0.5 && i > 0.0){
      float th = jetThresh/80.0;
      if((prevSpd - th)*(spd - th) < 0.0){
        vec3 jc = vec3(0.42,0.72,1.0);
        float a = 0.16;
        acc.rgb += (1.0-acc.a)*jc*a; acc.a += (1.0-acc.a)*a;
      }
    }
    prevSpd = spd;

    /* height fields, sampled along X */
    vec3 f = texture(fields, vec2(q.x, 0.5)).rgb;
    float hy = q.y;
    if(showTerr > 0.5 && hy < f.r){
      vec3 tc = vec3(0.16,0.20,0.27);
      float a = 1.0 - exp(-dt*22.0);
      acc.rgb += (1.0-acc.a)*tc*a; acc.a += (1.0-acc.a)*a;
    }
    if(showTrop > 0.5 && abs(hy - f.g) < 0.006){
      vec3 pc = vec3(0.55,0.62,0.78);
      float a = 0.09;
      acc.rgb += (1.0-acc.a)*pc*a; acc.a += (1.0-acc.a)*a;
    }
    if(abs(hy - f.b) < 0.0045 && abs(q.z-0.5) < 0.06){
      vec3 ac = vec3(1.0,0.69,0.23);
      float a = 0.5;
      acc.rgb += (1.0-acc.a)*ac*a; acc.a += (1.0-acc.a)*a;
    }
  }
  vec3 bg = vec3(0.027,0.043,0.078);
  frag = vec4(mix(bg, acc.rgb, min(acc.a,1.0)) + bg*(1.0-min(acc.a,1.0))*0.0, 1.0);
}`;

function volCompile(gl, type, src){
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error("shader: " + gl.getShaderInfoLog(s));
  return s;
}

function volInit(canvas, v){
  const gl = canvas.getContext("webgl2", { antialias:false, powerPreference:"high-performance" });
  if (!gl) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, volCompile(gl, gl.VERTEX_SHADER, VOL_VS));
  gl.attachShader(prog, volCompile(gl, gl.FRAGMENT_SHADER, VOL_FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    throw new Error("link: " + gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_3D, tex);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R])
    gl.texParameteri(gl.TEXTURE_3D, p, gl.CLAMP_TO_EDGE);
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA16F, v.nx, v.ny, v.nz, 0, gl.RGBA, gl.FLOAT, v.data);
  gl.uniform1i(gl.getUniformLocation(prog, "vol"), 0);

  /* height fields in a 1-row RGB texture */
  const fields = new Float32Array(v.nx*4);
  for (let i=0;i<v.nx;i++){ fields[i*4]=v.terrain[i]; fields[i*4+1]=v.trop[i]; fields[i*4+2]=v.path[i]; fields[i*4+3]=1; }
  const ftex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, ftex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, v.nx, 1, 0, gl.RGBA, gl.FLOAT, fields);
  gl.uniform1i(gl.getUniformLocation(prog, "fields"), 1);

  return { gl, prog, tex, ftex };
}

function volMatrix(yaw, pitch){
  const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
  /* column-major 3x3 for GLSL mat3 */
  return new Float32Array([
    cy, 0, -sy,
    sy*sp, cp, cy*sp,
    sy*cp, -sp, cy*cp,
  ]);
}

function volFrame(){
  const { gl, prog } = VOL;
  if (!gl) return;
  const c = VOL.canvas;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  /* A hidden or not-yet-laid-out canvas measures 0, which would make the aspect
     ratio NaN and paint nothing. Skip the frame and try again next tick. */
  const w = Math.max(1, Math.round(c.clientWidth*dpr));
  const h = Math.max(1, Math.round(c.clientHeight*dpr));
  if (c.clientWidth < 2 || c.clientHeight < 2){ VOL.raf = requestAnimationFrame(volFrame); return; }
  if (c.width !== w || c.height !== h){ c.width = w; c.height = h; }
  gl.viewport(0,0,c.width,c.height);

  const t = performance.now();
  if (VOL.follow) VOL.yaw += 0.0016;

  const d = VOL.dist;
  const cp = Math.cos(VOL.pitch), sp = Math.sin(VOL.pitch);
  const eye = [ Math.sin(VOL.yaw)*cp*d, sp*d, Math.cos(VOL.yaw)*cp*d ];
  gl.uniform3f(gl.getUniformLocation(prog,"camPos"), eye[0], eye[1], eye[2]);
  gl.uniformMatrix3fv(gl.getUniformLocation(prog,"camRot"), false, volMatrix(VOL.yaw, VOL.pitch));
  gl.uniform1f(gl.getUniformLocation(prog,"steps"), VOL.steps);
  gl.uniform1f(gl.getUniformLocation(prog,"jetThresh"), 30.0);
  gl.uniform1f(gl.getUniformLocation(prog,"aspect"), c.width/c.height);
  gl.uniform1f(gl.getUniformLocation(prog,"showJet"),  $("#volJet")  && $("#volJet").checked  ? 1 : 0);
  gl.uniform1f(gl.getUniformLocation(prog,"showTrop"), $("#volTrop") && $("#volTrop").checked ? 1 : 0);
  gl.uniform1f(gl.getUniformLocation(prog,"showTerr"), $("#volTerr") && $("#volTerr").checked ? 1 : 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  /* Adaptive quality: drop steps rather than frames on a weak GPU, raise them
     again when there is headroom. Integrated graphics were the target here. */
  const dtms = performance.now() - t;
  VOL.lastFrames.push(dtms);
  if (VOL.lastFrames.length > 30){
    const avg = VOL.lastFrames.reduce((a,b)=>a+b,0)/VOL.lastFrames.length;
    if (avg > 13 && VOL.steps > 32) VOL.steps = Math.max(32, VOL.steps - 12);
    else if (avg < 5 && VOL.steps < 192) VOL.steps = Math.min(192, VOL.steps + 8);
    VOL.lastFrames = [];
    const s = $("#volPerf");
    if (s) s.textContent = `${VOL.steps} steps · ${avg.toFixed(1)} ms/frame`;
  }
  VOL.raf = requestAnimationFrame(volFrame);
}

function mountVolume(){
  const host = $("#volCanvas"); if (!host) return;
  const btn = $("#volGo"); if (!btn) return;
  btn.addEventListener("click", () => {
    if (!RES) return volStatus("<span>No briefing yet</span><div>Build a ride briefing first — the volume is rendered from it.</div>", "err");
    startVolume();
  });
  ["volJet","volTrop","volTerr"].forEach(id => {
    const el = $("#"+id); if (el) el.addEventListener("change", () => {});
  });
  let drag = null;
  host.addEventListener("pointerdown", e => { drag = {x:e.clientX, y:e.clientY}; host.setPointerCapture(e.pointerId); });
  host.addEventListener("pointermove", e => {
    if (!drag) return;
    VOL.yaw   -= (e.clientX - drag.x)*0.008;
    VOL.pitch  = clamp(VOL.pitch + (e.clientY - drag.y)*0.006, -1.35, 1.35);
    drag = {x:e.clientX, y:e.clientY};
  });
  host.addEventListener("pointerup", () => { drag = null; });
  host.addEventListener("wheel", e => { e.preventDefault(); VOL.dist = clamp(VOL.dist*(1+e.deltaY*0.0011), 1.3, 6); }, {passive:false});
  const f = $("#volFollow");
  if (f) f.addEventListener("change", () => { VOL.follow = f.checked; });
}

function volStatus(html, cls){
  const el = $("#volStatus"); if (el) el.innerHTML = html ? `<div class="note ${cls||""}">${html}</div>` : "";
}

function startVolume(){
  const v = buildVolume(RES);
  if (!v) return volStatus("<span>Nothing to render</span><div>The briefing has too few sample points.</div>", "err");
  const c = $("#volCanvas");
  if (VOL.raf) cancelAnimationFrame(VOL.raf);
  let ctx;
  try { ctx = volInit(c, v); }
  catch(e){ return volStatus(`<span>WebGL error</span><div>${e.message}</div>`, "err"); }
  if (!ctx) return volStatus(
    "<span>No WebGL2</span><div>This browser cannot create a WebGL2 context, so the volume cannot be drawn. Everything else on the site still works.</div>", "err");
  Object.assign(VOL, ctx, { nx:v.nx, ny:v.ny, nz:v.nz, meta:v, steps:96, lastFrames:[] });
  volStatus("");
  $("#volWrap").hidden = false;
  $("#volMeta").textContent =
    `${v.nx}×${v.ny}×${v.nz} voxels · ${Math.round(v.distNM).toLocaleString()} nm × FL000–FL${v.topFL}`;
  VOL.raf = requestAnimationFrame(volFrame);
}

mountVolume();
