"use strict";
/* ══════════ SHAREABLE STATE ═════════════════════════════════════════════
   The whole query lives in the URL hash, so a briefing can be linked, bookmarked
   and reopened. The hash is written with replaceState after a successful run —
   never pushState, which would turn the back button into an undo log of every
   forecast you asked for.

   Open Graph: the tags are updated live from the result, which covers anything
   that renders the page before scraping it. A crawler that reads raw HTML without
   executing scripts sees the static defaults instead — a static single file
   cannot produce per-URL previews on its own, and pretending otherwise would be
   the kind of confident-but-wrong claim this project avoids. Per-link previews
   need a server or a prerender step; that is a deployment decision, not a code
   one. */

const SHARE_KEYS = { r:"route", f:"flight", t:"time", a:"acft", fl:"level", s:"scale" };

function shareState(){
  if (!RES) return null;
  const rt = RES.route, o = rt.opts || {};
  const p = new URLSearchParams();
  if (RES.flightNo) p.set("f", RES.flightNo);
  else              p.set("r", `${rt.dep.iata}-${rt.arr.iata}`);
  const when = RES.whenLocal || "";
  if (when) p.set("t", when);
  if (o.acft && o.acft !== "narrow") p.set("a", o.acft);
  if (o.fl && o.fl !== "auto")       p.set("fl", o.fl);
  if (o.scaleKm && +o.scaleKm !== 90) p.set("s", String(o.scaleKm));
  return p.toString();
}

function shareURL(){
  const s = shareState();
  return location.origin + location.pathname + (s ? "#" + s : "");
}

/* One-line summary used for the share sheet, the OG description and the title. */
function shareSummary(R){
  const rt = R.route;
  const v  = verdictFor(R.felt);
  const d  = new Date(R.live[0].time);
  const day = `${d.getUTCDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()]}`;
  return `${rt.dep.iata}→${rt.arr.iata}, ${day} — ${v[1].toLowerCase()}, ride score ${R.score}/100`;
}

function setMeta(sel, attr, val){
  const el = document.querySelector(sel);
  if (el) el.setAttribute(attr, val);
}

function updateShareMeta(){
  if (!RES) return;
  const R = RES, rt = R.route;
  const summary = shareSummary(R);
  const detail =
    `${Math.round(rt.distNM).toLocaleString()} nm at ${fmtFL(rt.topFt)}, ${fmtDur(R.totalMin)}. ` +
    (R.roughMin >= 3 ? `About ${Math.round(R.roughMin)} min light or above. ` : "Smooth for essentially all of it. ") +
    `Forecast confidence ${R.confidence}%.`;

  document.title = `${summary} · Ride Report`;
  setMeta('meta[property="og:title"]',       "content", summary);
  setMeta('meta[property="og:description"]', "content", detail);
  setMeta('meta[name="twitter:title"]',       "content", summary);
  setMeta('meta[name="twitter:description"]', "content", detail);
  setMeta('meta[name="description"]',         "content", `${summary}. ${detail}`);
  const u = shareURL();
  setMeta('meta[property="og:url"]', "content", u);
  const link = document.querySelector('link[rel="canonical"]');
  if (link) link.setAttribute("href", u);
}

/* Write the hash without touching history depth. */
function writeShareHash(){
  const s = shareState();
  if (s == null) return;
  const next = "#" + s;
  if (location.hash === next) return;
  HASH_SELF_WRITE = true;
  history.replaceState(null, "", location.pathname + location.search + next);
}

let HASH_SELF_WRITE = false;

/* Restore from a hash on load or on a manual hash edit. Returns true if it
   started a run, so the caller knows not to leave the page idle. */
function restoreFromHash(){
  const raw = location.hash.replace(/^#/, "");
  if (!raw) return false;
  const p = new URLSearchParams(raw);
  const flight = p.get("f");
  const route  = p.get("r");
  if (!flight && !route) return false;

  const when  = p.get("t") || "";
  const acft  = p.get("a")  || "narrow";
  const level = p.get("fl") || "auto";
  const scale = p.get("s")  || "90";

  const scaleEl = $("#scale");
  if (scaleEl){ scaleEl.value = scale; scaleEl.dispatchEvent(new Event("input")); }

  if (flight){
    tab("flight");
    $("#fnum").value = flight;
    if (when) $("#dt2").value = when;
    if ($("#acft2")) $("#acft2").value = acft;
    $("#goFlight").click();
    return true;
  }

  const [a, b] = route.split("-");
  const dep = BY_IATA.get((a||"").toUpperCase()) || BY_ICAO.get((a||"").toUpperCase());
  const arr = BY_IATA.get((b||"").toUpperCase()) || BY_ICAO.get((b||"").toUpperCase());
  if (!dep || !arr){
    status(`<span>Bad link</span><div>That link names an airport this build does not carry (${route}). Enter the pair by hand.</div>`, "err");
    return false;
  }
  tab("route");
  AC_DEP.set(dep); AC_ARR.set(arr);
  if (when) $("#dt1").value = when;
  if ($("#acft")) $("#acft").value = acft;
  if ($("#fl"))   $("#fl").value   = level;
  $("#goRoute").click();
  return true;
}

addEventListener("hashchange", () => {
  if (HASH_SELF_WRITE){ HASH_SELF_WRITE = false; return; }
  restoreFromHash();
});

/* Copy-link button, added next to the native share action. */
async function copyShareLink(){
  const u = shareURL();
  try{
    await navigator.clipboard.writeText(u);
    toast("Link copied");
  }catch{
    /* Clipboard is permission-gated and blocked outright in some contexts.
       Fall back to selecting the text so the user can copy it themselves,
       rather than silently doing nothing. */
    const i = document.createElement("input");
    i.value = u; i.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(i); i.select();
    const ok = document.execCommand && document.execCommand("copy");
    i.remove();
    toast(ok ? "Link copied" : u);
  }
}
