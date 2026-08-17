/* ══════════ NATIVE BRIDGE (Capacitor) ═══════════════════════════════════ */
const Native = (() => {
  const C = window.Capacitor;
  const P = p => (C && C.Plugins && C.Plugins[p]) || null;
  return {
    _last: -1,
    isApp: !!(C && C.isNativePlatform && C.isNativePlatform()),
    async boot(){
      if (!this.isApp) return;
      document.documentElement.classList.add("native");
      try{ await P("StatusBar")?.setStyle({ style:"DARK" }); }catch{}
      try{ await P("SplashScreen")?.hide(); }catch{}
    },
    /* a tick as the scrubber crosses into a rougher band — the tape becomes something you feel */
    bump(band){
      if (!P("Haptics") || band === this._last) return;
      const worse = band > this._last; this._last = band;
      if (!worse) return;
      try{ P("Haptics").impact({ style: band >= 4 ? "HEAVY" : band >= 3 ? "MEDIUM" : "LIGHT" }); }catch{}
    },
    async share(text, title){
      if (P("Share")){ try{ return await P("Share").share({ title, text, dialogTitle:"Share briefing" }); }catch{ return; } }
      if (navigator.share){ try{ return await navigator.share({ title, text }); }catch{ return; } }
      try{ await navigator.clipboard.writeText(text); toast("Briefing copied"); }catch{ toast("Could not share"); }
    },
    async remember(k, v){
      if (P("Preferences")){ try{ return await P("Preferences").set({ key:k, value:JSON.stringify(v) }); }catch{} }
      try{ localStorage.setItem(k, JSON.stringify(v)); }catch{}
    },
    async recall(k){
      try{
        if (P("Preferences")) return JSON.parse((await P("Preferences").get({ key:k })).value || "null");
        return JSON.parse(localStorage.getItem(k) || "null");
      }catch{ return null; }
    }
  };
})();

function toast(msg){
  let t = $("#toast");
  if (!t){ t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 2200);
}

function mountActions(){
  if ($("#acts")) return;
  const host = document.querySelector(".verdict"); if (!host) return;
  const d = document.createElement("div"); d.id = "acts"; d.className = "acts";
  d.innerHTML = `<button class="act" id="actShare">Share briefing</button>
                 <button class="act" id="actLink">Copy link</button>
                 <button class="act" id="actSave">Save this flight</button>`;
  host.appendChild(d);
  $("#actShare").onclick = () => {
    const R = RES; if (!R) return;
    const w = R.worst;
    Native.share(
      `${R.route.dep.iata} \u2192 ${R.route.arr.iata} \u00b7 ${fmtDur(R.totalMin)} at ${fmtFL(R.route.topFt)}\n` +
      `Ride score ${R.score}/100 \u2014 ${verdictFor(R.felt)[1]}\n` +
      (w ? `Roughest: ${hhmmUTC(w.time)} ${w.place.text}, ${w.band.name} (EDR ${w.edr.toFixed(2)})\n` : "") +
      `Forecast confidence ${R.confidence}%. Planning aid only \u2014 not an operational product.\n` +
      shareURL(),
      `Ride Report \u00b7 ${R.route.dep.iata}\u2192${R.route.arr.iata}`);
  };
  $("#actLink").onclick = copyShareLink;
  $("#actSave").onclick = async () => {
    const R = RES; if (!R) return;
    const saved = (await Native.recall("saved")) || [];
    saved.unshift({ dep:R.route.dep.iata, arr:R.route.arr.iata, when:R.whenLocal || null,
                    acft:(R.route.opts||{}).acft, scaleKm:+((R.route.opts||{}).scaleKm||90),
                    hash:shareState(), at:Date.now() });
    await Native.remember("saved", saved.slice(0,12));
    toast("Saved \u2014 it will be waiting next time");
  };
}
Native.boot();
mountCalmToggle();
mountJetlag();

/* A shared link carries the whole query — restore it and run. Last, so every
   module it touches is already wired up. */
restoreFromHash();

/* service worker, when served over http(s) */
if ("serviceWorker" in navigator && location.protocol.startsWith("http"))
  navigator.serviceWorker.register("sw.js").catch(()=>{});
