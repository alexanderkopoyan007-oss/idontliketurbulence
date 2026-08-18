"use strict";
/* ══════════ DELAY PANEL ═════════════════════════════════════════════════ */

function drawDelay(){
  const host = $("#delayOut"); if (!host) return;
  const D = RES && RES.delay;
  if (!D){ host.innerHTML = `<p class="sub">No delay estimate for this run.</p>`; return; }

  const pct = Math.round(D.pDelay30*100);
  const col = D.pDelay30 < 0.25 ? "var(--s0)" : D.pDelay30 < 0.45 ? "var(--s2)"
            : D.pDelay30 < 0.6 ? "var(--s3)" : "var(--s4)";

  const rows = D.factors.length
    ? D.factors.map(f => `<div class="dly-row">
        <span>${f.label}</span>
        <i style="width:${clamp(f.minutes/40*100,3,100)}%"></i>
        <u>+${Math.round(f.minutes)} min</u>
        <em>${f.detail||""}</em></div>`).join("")
    : `<p class="sub">Nothing in the forecast at either end is pushing this flight late.</p>`;

  const conn = D.connection ? `
    <div class="dly-conn ${D.connection.verdict}">
      <b>${D.connection.minutes} min connection — ${D.connection.verdict}</b>
      <span>Risk of missing it: <b>${Math.round(D.connection.pMiss*100)}%</b>,
      against an expected arrival delay of ${Math.round(D.expectedMin)} min.</span>
    </div>` : "";

  host.innerHTML = `
    <div class="dly-head">
      <div class="dly-p" style="color:${col}">${pct}%</div>
      <div class="dly-lab"><b>chance of arriving more than 30 min late</b>
        <span>Expected delay about ${Math.round(D.expectedMin)} min</span></div>
    </div>
    <div class="dly-factors">${rows}</div>
    ${conn}
    <p class="dly-note"><b>This is a heuristic, not a model.</b> There is no labelled
      historical dataset behind it: the weights are judgements about how much each hazard
      tends to cost, not fitted coefficients. Treat it as "these are the things working
      against this flight, and roughly how much", not as a calibrated forecast.</p>
    <p class="dly-note"><b>Aircraft rotation is missing, and it is the strongest signal.</b>
      Whether the jet operating your flight is already late inbound predicts arrival delay
      better than any weather field, and most consumer tools ignore it. This one cannot reach
      it: OpenSky answers browsers from other origins with a restrictive
      <span class="mono">access-control-allow-origin</span>, adsb.lol sends no CORS header,
      and airplanes.live returns 403 cross-origin. All three work from a server. None from a
      page. Until there is somewhere to run a proxy, this is a weather-and-winds picture
      rather than a complete one.</p>`;
}

/* Predictions are logged locally so the heuristic can be checked against reality
   later. Without this there is no path from "physically-motivated guess" to
   anything better, and no honest way to claim it works. */
function logDelayPrediction(){
  const D = RES && RES.delay; if (!D) return;
  try{
    const log = JSON.parse(localStorage.getItem("rideReportDelayLog") || "[]");
    log.push({
      at: Date.now(),
      dep: RES.route.dep.iata, arr: RES.route.arr.iata,
      flight: RES.flightNo || null,
      departUTC: RES.live[0].time.toISOString(),
      pDelay30: +D.pDelay30.toFixed(3),
      expectedMin: Math.round(D.expectedMin),
      hazardMin: Math.round(D.hazardMin),
      factors: D.factors.map(f => [f.label, Math.round(f.minutes)]),
      rotationKnown: D.rotationKnown,
      outcome: null,                 // filled in by hand, or by a backend later
    });
    localStorage.setItem("rideReportDelayLog", JSON.stringify(log.slice(-500)));
  }catch{ /* private mode or quota — the estimate still displays */ }
}
