"use strict";
/* ══════════ RECORD THIS FLIGHT ══════════════════════════════════════════
   The passenger-side recorder. Phone flat on the tray table, screen off, one
   observation per ten seconds.

   Local only. Nothing leaves the device: there is no upload, no account and no
   device id. A backend would need somewhere to put it, which is a deployment
   decision rather than a code one, and the prompt this was built from is
   explicit that the physics comes first. The export button hands you the JSON so
   the data is yours either way. */

const REC = {
  on: false, wake: null, bins: [], buf: [], t0: 0, fsEst: 0,
  lastPos: null, posWatch: null, listener: null, lastBinAt: 0,
};

/* Coarse position only — 0.1 degrees is roughly 11 km, enough to place an
   observation against a forecast grid box and not enough to place a person. */
const coarse = v => Math.round(v*10)/10;

function motionSupported(){
  return typeof DeviceMotionEvent !== "undefined" && typeof window.addEventListener === "function";
}
function needsPermission(){
  return typeof DeviceMotionEvent !== "undefined" &&
         typeof DeviceMotionEvent.requestPermission === "function";
}

/* iOS 13+ requires this from inside a user gesture, and it can only be asked
   once per page load — a denial sticks until reload, so say so rather than
   letting the button look broken. */
async function askMotionPermission(){
  if (!needsPermission()) return "granted";
  try{
    const r = await DeviceMotionEvent.requestPermission();
    return r;                                   // "granted" | "denied"
  }catch(e){
    return "error";
  }
}

async function acquireWakeLock(){
  try{
    if ("wakeLock" in navigator){
      const w = await navigator.wakeLock.request("screen");
      w.addEventListener("release", () => { if (REC.on) recStatus(); });
      return w;
    }
  }catch{ /* denied or unsupported */ }
  return null;
}

function recStatus(msg, cls){
  const el = $("#recStatus"); if (!el) return;
  if (msg){ el.innerHTML = `<div class="note ${cls||""}">${msg}</div>`; return; }
  const wl = REC.wake ? "screen kept awake" :
    ("wakeLock" in navigator ? "screen lock not granted — keep the screen on, or the browser will suspend sampling"
                             : "this browser has no wake lock — keep the screen on, or sampling pauses");
  el.innerHTML = `<div class="note"><span>Recording</span><div>
    ${REC.bins.length} observation${REC.bins.length===1?"":"s"} ·
    ${REC.fsEst ? REC.fsEst.toFixed(0)+" Hz" : "measuring rate…"} · ${wl}</div></div>`;
}

function onMotion(e){
  const a = e.accelerationIncludingGravity || e.acceleration;
  const g = e.accelerationIncludingGravity;
  if (!a) return;
  const now = performance.now();
  REC.buf.push({ t: now, x:a.x||0, y:a.y||0, z:a.z||0,
                 gx:(g&&g.x)||0, gy:(g&&g.y)||0, gz:(g&&g.z)||0 });

  if (now - REC.lastBinAt < MOTION_BIN_S*1000) return;
  REC.lastBinAt = now;
  flushBin();
}

/* Turn the buffer into one observation. The vertical channel is the axis
   gravity is on — the phone lies flat, so that is z, but we take the component
   along the measured gravity vector rather than assuming, which survives the
   phone being face-down or propped at a slight angle. */
function flushBin(){
  const b = REC.buf;
  REC.buf = [];
  if (b.length < 32) return;

  const span = (b[b.length-1].t - b[0].t)/1000;
  if (span <= 0) return;
  const fs = b.length/span;
  REC.fsEst = fs;

  /* project acceleration onto the gravity direction, then remove the DC term */
  const gm = b.map(s => Math.hypot(s.gx, s.gy, s.gz) || 1);
  const az = b.map((s,i) => (s.x*s.gx + s.y*s.gy + s.z*s.gz)/gm[i]);
  const mean = az.reduce((x,y)=>x+y,0)/az.length;
  const acc = az.map(v => v - mean);

  /* Welch needs a power-of-two segment; pad the tail off rather than resample,
     since resampling would smear the spectrum we are trying to measure. */
  const res = analyseWindow({
    az: acc, gx: b.map(s=>s.gx), gy: b.map(s=>s.gy), gz: b.map(s=>s.gz), fs
  });

  const rec = {
    t: Date.now(), fs: Math.round(fs*10)/10,
    lat: REC.lastPos ? coarse(REC.lastPos.lat) : null,
    lon: REC.lastPos ? coarse(REC.lastPos.lon) : null,
    alt: REC.lastPos && REC.lastPos.alt != null ? Math.round(REC.lastPos.alt) : null,
  };
  if (res.ok){
    Object.assign(rec, { index: res.index, slope: res.slope === null ? null : +res.slope.toFixed(2),
                         r2: +res.r2.toFixed(2), kolm: +res.kolmogorov.toFixed(2),
                         rms: +res.rms.toFixed(4) });
  } else {
    rec.rejected = res.reasons;
  }
  REC.bins.push(rec);
  saveBins();
  recStatus();
  drawRecordings();
}

function saveBins(){
  try { localStorage.setItem("rideReportMotion", JSON.stringify(REC.bins.slice(-2000))); }
  catch { /* quota or private mode — the in-memory copy still works */ }
}
function loadBins(){
  try { REC.bins = JSON.parse(localStorage.getItem("rideReportMotion") || "[]"); }
  catch { REC.bins = []; }
}

async function startRecording(){
  if (!motionSupported()) return recStatus(
    "<span>Not available</span><div>This browser does not expose DeviceMotion, so there is nothing to sample.</div>", "err");

  const perm = await askMotionPermission();
  if (perm === "denied") return recStatus(
    `<span>Permission denied</span><div>Motion access was refused. iOS only asks once per page load —
     reload the page to be asked again, or enable Motion &amp; Orientation Access in
     Settings → Safari.</div>`, "err");
  if (perm === "error") return recStatus(
    "<span>Could not ask</span><div>The permission request failed. It must be triggered by a tap; try the button again.</div>", "err");

  REC.wake = await acquireWakeLock();
  REC.on = true; REC.buf = []; REC.t0 = Date.now(); REC.lastBinAt = performance.now();
  REC.listener = onMotion;
  addEventListener("devicemotion", REC.listener);

  if (navigator.geolocation){
    REC.posWatch = navigator.geolocation.watchPosition(
      p => { REC.lastPos = { lat:p.coords.latitude, lon:p.coords.longitude, alt:p.coords.altitude }; },
      () => { REC.lastPos = null; },
      { enableHighAccuracy:false, maximumAge:60000, timeout:20000 });
  }

  $("#recStart").hidden = true; $("#recStop").hidden = false;
  recStatus();
}

async function stopRecording(){
  REC.on = false;
  if (REC.listener) removeEventListener("devicemotion", REC.listener);
  REC.listener = null;
  if (REC.posWatch != null && navigator.geolocation) navigator.geolocation.clearWatch(REC.posWatch);
  REC.posWatch = null;
  if (REC.wake){ try { await REC.wake.release(); } catch {} REC.wake = null; }
  flushBin();
  $("#recStart").hidden = false; $("#recStop").hidden = true;
  recStatus(`<span>Stopped</span><div>${REC.bins.length} observations held on this device.</div>`);
  drawRecordings();
}

function drawRecordings(){
  const host = $("#recOut"); if (!host) return;
  const good = REC.bins.filter(b => b.index !== undefined);
  if (!REC.bins.length){
    host.innerHTML = `<p class="sub">No observations yet. Lay the phone flat on the tray table and start —
      it samples for ten seconds at a time and discards anything that looks like being picked up.</p>`;
    return;
  }
  const idx = good.map(b => b.index);
  const worst = good.reduce((a,b) => b.index > a.index ? b : a, good[0] || {index:0});
  const rejected = REC.bins.length - good.length;
  const turb = good.filter(b => b.kolm >= 0.4).length;

  const spark = good.slice(-90).map(b => {
    const h = clamp(b.index, 0, 100);
    return `<i style="height:${Math.max(3,h)}%;background:${rampCol(h/100*0.6)}" title="${b.index}"></i>`;
  }).join("");

  host.innerHTML = `
    <div class="win-sum">
      <div><span>Observations</span><u>${good.length} kept, ${rejected} discarded</u></div>
      <div><span>Roughest</span><u>index ${worst.index || 0}${worst.slope!=null?` · slope ${worst.slope}`:""}</u></div>
      <div><span>Median index</span><u>${idx.length ? idx.slice().sort((a,b)=>a-b)[Math.floor(idx.length/2)] : "—"}</u></div>
      <div><span>Turbulence-shaped</span><u>${turb} of ${good.length}</u></div>
    </div>
    <div class="rec-spark">${spark}</div>
    <p class="rec-note"><b>This is not an EDR.</b> A phone on a tray table measures the cabin's
      response, not the atmosphere: between the eddies outside and the glass under your palm sit the
      wing, the fuselage, the seat rails and the tray hinge — a transfer function that differs by
      aircraft type and by where you are sitting. Converting back to an atmospheric EDR needs that
      response, which this app does not have and will not guess. The number is a relative index:
      a 60 is rougher than a 20, and that is all it claims.</p>
    <p class="rec-note">Phones sample near ${REC.fsEst ? REC.fsEst.toFixed(0) : "60"} Hz against the
      100 Hz-plus of aircraft instrumentation, so the fit band stops at 8 Hz, well under Nyquist.
      Energy above Nyquist aliases down into the band rather than vanishing, which is a further
      reason the level is indicative and the <em>slope</em> is the informative part: a spectrum near
      −5/3 is turbulence, a flat one is something else.</p>
    <div class="hm-acts">
      <button class="act" id="recExport">Export JSON</button>
      <button class="act ghost" id="recClear">Clear</button>
    </div>`;

  $("#recExport").onclick = () => {
    const blob = new Blob([JSON.stringify({ recorded: REC.bins }, null, 1)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ride-report-motion-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  $("#recClear").onclick = () => {
    REC.bins = []; saveBins(); drawRecordings();
    recStatus("<span>Cleared</span><div>All observations removed from this device.</div>");
  };
}

function mountRecorder(){
  if (!$("#recStart")) return;
  loadBins();
  $("#recStart").addEventListener("click", startRecording);
  $("#recStop").addEventListener("click", stopRecording);
  if (!motionSupported()){
    recStatus(`<span>No motion sensor</span><div>This browser or device does not expose DeviceMotion.
      The recorder needs a phone; everything else on the site works here.</div>`, "err");
    $("#recStart").disabled = true;
  }
  drawRecordings();
}
mountRecorder();
