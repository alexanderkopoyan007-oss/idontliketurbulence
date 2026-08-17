"use strict";
/* ══════════ VERTICAL CROSS-SECTION ═════════════════════════════════════ */
const FL_TOP = 470, FL_BOT = 0;

function edrAtFL(w, fl){
  const col = w.column; if (!col || !col.length) return 0;
  const ft = fl*100;
  let lo=null, hi=null;
  for (const c of col){ if (c.ft<=ft && (!lo||c.ft>lo.ft)) lo=c; if (c.ft>=ft && (!hi||c.ft<hi.ft)) hi=c; }
  if (lo && hi && hi.ft>lo.ft) return lerp(lo.edr, hi.edr, (ft-lo.ft)/(hi.ft-lo.ft));
  if (lo) return lo.edr * clamp(0.35 + 0.65*(ft/lo.ft), 0.3, 1);
  if (hi) return hi.edr * clamp(1 - (ft-hi.ft)/40000, 0.3, 1);
  return 0;
}
function fieldAtFL(w, fl, key){
  const col = w.column; if (!col) return null;
  const ft = fl*100; let best=null, bd=Infinity;
  for (const c of col){ if (!c.d) continue; const d=Math.abs(c.ft-ft); if (d<bd){bd=d;best=c;} }
  return best && best.d ? best.d[key] : null;
}
function sampleAtTime(t){
  const L = RES.live;
  if (t <= L[0].time) return {a:L[0], b:L[0], f:0};
  for (let i=1;i<L.length;i++) if (t <= L[i].time) return {a:L[i-1], b:L[i], f:(t-L[i-1].time)/(L[i].time-L[i-1].time||1)};
  return {a:L[L.length-1], b:L[L.length-1], f:0};
}

function plate(g, text, x, y, col){
  g.font = "500 9.5px "+MONO;
  const w = g.measureText(text).width;
  g.fillStyle = "rgba(7,11,20,.72)";
  g.fillRect(x-3, y-9, w+6, 12);
  g.fillStyle = col; g.fillText(text, x, y);
}
function drawXS(cursorFrac){
  const R = RES; if (!R) return;
  const wrap = $("#xsWrap"), c = $("#xs"), dpr = Math.min(2, devicePixelRatio||1);
  const W = wrap.clientWidth - 24;
  const H = Math.max(260, Math.min(420, W*0.62));
  c.style.width = W+"px"; c.style.height = H+"px";
  c.width = W*dpr; c.height = H*dpr;
  const g = c.getContext("2d"); g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,W,H);

  const ML=44, MR=12, MT=10, MB=30;
  const pw = W-ML-MR, ph = H-MT-MB;
  const t0 = R.live[0].time.getTime(), t1 = R.live[R.live.length-1].time.getTime(), span = t1-t0||1;
  const X = t => ML + (t-t0)/span*pw;
  const Y = fl => MT + (FL_TOP-fl)/(FL_TOP-FL_BOT)*ph;
  const flAtY = y => FL_TOP - (y-MT)/ph*(FL_TOP-FL_BOT);
  const tAtX  = x => t0 + (x-ML)/pw*span;

  /* ── heat field, built once and reused for the isopleths ── */
  const GW = Math.min(280, Math.max(140, Math.round(pw/2.6))), GH = 128;
  const grid = new Float32Array(GW*GH);
  for (let gx=0; gx<GW; gx++){
    const {a,b,f} = sampleAtTime(t0 + (gx+0.5)/GW*span);
    for (let gy=0; gy<GH; gy++){
      const fl = FL_TOP - (gy+0.5)/GH*(FL_TOP-FL_BOT);
      grid[gy*GW+gx] = lerp(edrAtFL(a,fl), edrAtFL(b,fl), f);
    }
  }
  const off = document.createElement("canvas"); off.width=GW; off.height=GH;
  const og = off.getContext("2d"), img = og.createImageData(GW, GH);
  for (let i=0;i<GW*GH;i++){
    const m = rampCol(grid[i]).match(/\d+/g), j = i*4;
    img.data[j]=+m[0]; img.data[j+1]=+m[1]; img.data[j+2]=+m[2]; img.data[j+3]=255;
  }
  og.putImageData(img,0,0);
  g.save(); g.beginPath(); g.rect(ML,MT,pw,ph); g.clip();
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
  g.drawImage(off, ML, MT, pw, ph);

  /* ── isopleths at the band thresholds, so the field reads as a chart ── */
  const gX = gx => ML + (gx+0.5)/GW*pw, gY = gy => MT + (gy+0.5)/GH*ph;
  const marching = (level, style, wdt) => {
    g.beginPath();
    for (let y=0; y<GH-1; y++) for (let x=0; x<GW-1; x++){
      const a=grid[y*GW+x], b=grid[y*GW+x+1], cc=grid[(y+1)*GW+x+1], d=grid[(y+1)*GW+x];
      const idx = (a>level?8:0)|(b>level?4:0)|(cc>level?2:0)|(d>level?1:0);
      if (idx===0 || idx===15) continue;
      const ex = (p,q,vp,vq) => p + (q-p)*clamp((level-vp)/((vq-vp)||1e-9),0,1);
      const T=[ex(x,x+1,a,b), y], Rg=[x+1, ex(y,y+1,b,cc)], B=[ex(x,x+1,d,cc), y+1], Lf=[x, ex(y,y+1,a,d)];
      const S = {1:[[Lf,B]],2:[[B,Rg]],3:[[Lf,Rg]],4:[[T,Rg]],5:[[T,Lf],[B,Rg]],6:[[T,B]],7:[[T,Lf]],
                 8:[[T,Lf]],9:[[T,B]],10:[[T,Rg],[Lf,B]],11:[[T,Rg]],12:[[Lf,Rg]],13:[[B,Rg]],14:[[Lf,B]]}[idx];
      for (const [u,v] of S){ g.moveTo(gX(u[0]), gY(u[1])); g.lineTo(gX(v[0]), gY(v[1])); }
    }
    g.strokeStyle = style; g.lineWidth = wdt; g.stroke();
  };
  marching(0.16, "rgba(7,11,20,.30)", 0.9);
  marching(0.26, "rgba(7,11,20,.48)", 1.1);
  marching(0.40, "rgba(7,11,20,.66)", 1.3);
  marching(0.58, "rgba(255,255,255,.55)", 1.2);

  /* ── jet-stream ribbon (wind ≥ 30 m/s) ── */
  const top=[], bot=[], core=[];
  R.live.forEach(w => {
    if (!w.C) return;
    const ls = w.C.filter(l => l && l.p<=450 && l.p>=120);
    if (!ls.length) return;
    const cr = ls.reduce((a,l)=> l.spd>a.spd?l:a, ls[0]);
    if (cr.spd < 30) return;
    let hiFL = cr.ft/100, loFL = cr.ft/100;
    for (const l of ls){ if (l.spd>=30){ hiFL = Math.max(hiFL, l.ft/100); loFL = Math.min(loFL, l.ft/100); } }
    const x = X(w.time);
    top.push([x, Y(hiFL+8)]); bot.push([x, Y(loFL-8)]); core.push([x, Y(cr.ft/100), cr.spd]);
  });
  if (top.length > 1){
    g.beginPath(); top.forEach(([x,y],i)=> i?g.lineTo(x,y):g.moveTo(x,y));
    for (let i=bot.length-1;i>=0;i--) g.lineTo(bot[i][0], bot[i][1]);
    g.closePath();
    g.fillStyle = "rgba(233,239,247,.07)"; g.fill();
    g.strokeStyle = "rgba(233,239,247,.22)"; g.lineWidth=1; g.setLineDash([3,3]); g.stroke(); g.setLineDash([]);
    g.beginPath(); core.forEach(([x,y],i)=> i?g.lineTo(x,y):g.moveTo(x,y));
    g.strokeStyle="rgba(233,239,247,.42)"; g.lineWidth=1.6; g.stroke();
    const pk = core.reduce((a,p)=> p[2]>a[2]?p:a, core[0]);
    const pkTop = top[core.indexOf(pk)] || top[0];
    plate(g, `JET ${kt(pk[2])} kt`, clamp(pk[0]-26, ML+4, ML+pw-70), (pkTop?pkTop[1]:pk[1])-6, "rgba(233,239,247,.78)");
  }

  /* ── tropopause ── */
  const tp = R.live.filter(w=>w.trop).map(w => [X(w.time), Y(w.trop.ft/100)]);
  if (tp.length > 1){
    g.beginPath(); tp.forEach(([x,y],i)=> i?g.lineTo(x,y):g.moveTo(x,y));
    g.strokeStyle="rgba(199,102,255,.55)"; g.lineWidth=1.3; g.setLineDash([6,4]); g.stroke(); g.setLineDash([]);
    plate(g, "TROPOPAUSE", ML+6, tp[0][1]-5, "rgba(216,150,255,.85)");
  }

  /* ── terrain ── */
  if (R.elev && R.elev.length){
    g.beginPath(); g.moveTo(ML, Y(0));
    R.elev.forEach((m,i) => {
      const f = i/(R.elev.length-1);
      g.lineTo(ML + f*pw, Y(Math.max(0,m)/FT/100));
    });
    g.lineTo(ML+pw, Y(0)); g.closePath();
    g.fillStyle="rgba(7,11,20,.92)"; g.fill();
    g.strokeStyle="rgba(141,160,184,.5)"; g.lineWidth=1; g.stroke();
  }
  g.restore();

  /* ── flight profile ── */
  g.beginPath();
  R.live.forEach((w,i) => { const x=X(w.time), y=Y(w.altFt/100); i?g.lineTo(x,y):g.moveTo(x,y); });
  g.strokeStyle="rgba(7,11,20,.85)"; g.lineWidth=5; g.lineJoin="round"; g.stroke();
  g.strokeStyle="#E9EFF7"; g.lineWidth=2.2; g.stroke();
  R.live.forEach(w => {
    const x=X(w.time), y=Y(w.altFt/100);
    g.beginPath(); g.arc(x,y,3.4,0,7); g.fillStyle="#070B14"; g.fill();
    g.beginPath(); g.arc(x,y,2.2,0,7); g.fillStyle=bandCol(w.edr); g.fill();
  });

  /* ── axes ── */
  g.strokeStyle="rgba(120,160,210,.16)"; g.lineWidth=1;
  g.fillStyle="#607289"; g.font="400 10px "+MONO; g.textAlign="right";
  for (let fl=50; fl<=450; fl+=50){
    const y=Math.round(Y(fl))+.5;
    g.beginPath(); g.moveTo(ML,y); g.lineTo(ML+pw,y); g.stroke();
    g.fillText("FL"+fl, ML-6, y+3.5);
  }
  g.textAlign="center";
  const hrs = span/3600e3, stepH = hrs>9?2:hrs>4?1:hrs>1.6?0.5:0.25;
  for (let h=0; h<=hrs+1e-6; h+=stepH){
    const t=t0+h*3600e3; if (t>t1+60e3) break;
    const x=Math.round(X(t))+.5;
    g.strokeStyle="rgba(120,160,210,.13)"; g.beginPath(); g.moveTo(x,MT); g.lineTo(x,MT+ph); g.stroke();
    g.fillStyle="#607289"; g.fillText(hhmmUTC(new Date(t)).replace("Z",""), x, H-11);
  }
  g.textAlign="left"; g.fillStyle="#607289"; g.font="400 9.5px "+MONO;
  g.fillText("UTC", ML, H-1);
  g.strokeStyle="rgba(120,160,210,.3)"; g.strokeRect(ML+.5, MT+.5, pw-1, ph-1);

  /* ── cursor ── */
  if (cursorFrac !== undefined){
    const x = ML + cursorFrac*pw;
    const el = $("#xsCur");
    el.style.display="block"; el.style.left=(x+12)+"px"; el.style.top=(MT+10)+"px"; el.style.height=ph+"px";
  }
  c._geom = {ML,MT,pw,ph,X,Y,flAtY,tAtX,t0,t1,W,H};
}

/* hover readout on the cross-section */
function xsHover(ev){
  const c = $("#xs"), tip = $("#xsTip"), gm = c._geom; if (!gm || !RES) return;
  const r = c.getBoundingClientRect();
  const px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
  const py = (ev.touches ? ev.touches[0].clientY : ev.clientY) - r.top;
  if (px < gm.ML || px > gm.ML+gm.pw || py < gm.MT || py > gm.MT+gm.ph){ tip.style.display="none"; return; }
  const t = gm.tAtX(px), fl = Math.round(gm.flAtY(py)/5)*5;
  const {a,b,f} = sampleAtTime(t);
  const e = lerp(edrAtFL(a,fl), edrAtFL(b,fl), f), bd = band(e);
  const w = f<0.5?a:b;
  const sh = fieldAtFL(w, fl, "vws"), ri = fieldAtFL(w, fl, "Ri"), sp = fieldAtFL(w, fl, "spd");
  tip.innerHTML =
    `<b>FL${fl}</b> · ${hhmmUTC(new Date(t))}<br>` +
    `<span style="color:${bd.col}">${bd.name}</span> · EDR ${e.toFixed(2)}<br>` +
    (sh!=null ? `shear ${sh.toFixed(1)} m/s per km<br>` : "") +
    (ri!=null && ri<50 ? `Ri ${ri.toFixed(1)}<br>` : "") +
    (sp!=null ? `wind ${kt(sp)} kt` : "");
  tip.style.display="block";
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  tip.style.left = clamp(px+14, 4, gm.W-tw-4) + 12 + "px";
  tip.style.top  = clamp(py-th-10, 4, gm.H-th-4) + 10 + "px";
}
