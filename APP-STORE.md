# Getting Ride Report onto the App Store

Read this first, because there is one thing I cannot do for you and one real risk of
rejection.

## What I could not do

I cannot build or submit an iOS app from here. Compiling for iOS requires **Xcode, which
only runs on macOS**, and submission requires **your** Apple Developer account and your
signing certificates. Nobody can do that step on your behalf without your credentials.

What you need:

- A **Mac**. If you don't own one: [MacStadium](https://www.macstadium.com/) or
  [Scaleway Mac mini](https://www.scaleway.com/en/hello-m1/) rent them by the hour, or
  Xcode Cloud can build from a repo once the project exists.
- The **Apple Developer Program** — **$99/year**, and approval takes a day or two.
  Individual enrolment is quicker; an organisation needs a D-U-N-S number and can take
  weeks.
- **Xcode 15 or later**.

Everything up to that point is done: the web app, the Capacitor configuration, the icons,
the splash screen, and the privacy manifest are all in this folder.

---

## The real risk: App Store Review Guideline 4.2

Apple rejects apps that are "primarily a repackaged website". This is the single most
common rejection for wrapped web apps, and Ride Report is a wrapped web app. Read
[Guideline 4.2 — Minimum Functionality](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality)
before you submit.

I have already built in several genuine native behaviours to argue against that, all
active only when running inside the wrapper:

- **Haptics.** The ride tape ticks through the Taptic Engine as you scrub into rougher air,
  escalating with severity. The forecast becomes something you feel, which is not
  reproducible in a browser.
- **Native share sheet** for the briefing summary.
- **Saved flights** in native `Preferences` storage.
- **Status bar and splash screen** control, safe-area insets.

That is a defensible position, not a guaranteed one. If you are rejected under 4.2, the
strongest additions would be a **home screen widget** showing the next saved flight's ride
score, **Live Activities** on the day of travel, and **background refresh** with a
notification if the forecast worsens materially. Those are genuinely native and would end
the argument — but they need Swift written in Xcode, outside what this project covers.

Also be aware: Apple scrutinises aviation and weather apps for safety claims. The
disclaimer is already prominent in the app and should stay there. Do not describe this as
an operational or flight-planning product anywhere in the listing.

---

## Build steps

```bash
cd ride-report
npm install
npx cap add ios
npx cap sync ios
npx cap open ios          # opens Xcode
```

Then, in Xcode:

1. Select the **App** target → **Signing & Capabilities** → choose your team. Change the
   bundle identifier from `com.yourcompany.ridereport` to something you own.
2. Drag **`PrivacyInfo.xcprivacy`** into `ios/App/App/` and tick the App target.
3. Set the app icon: use `resources/icon-1024.png` in the asset catalog's single-size slot.
4. Set **deployment target to iOS 14** or later.
5. Set the launch screen background to `#070B14` so the splash does not flash white.
6. **Product → Archive**, then **Distribute App → App Store Connect**.

Generating the splash and icon sets automatically:

```bash
npm i -g @capacitor/assets
npx capacitor-assets generate --ios     # reads resources/icon.png and resources/splash.png
```

### Info.plist

The app needs no permissions at all — no location, camera, contacts or microphone. Add
nothing. Requesting permissions you don't use is itself a rejection reason.

Airport search and forecasts work from typed input only. If you later add "use my
location", you must add `NSLocationWhenInUseUsageDescription` with a truthful explanation.

---

## App Store Connect checklist

| Item | Notes |
|---|---|
| App name | 30 characters max. "Ride Report" may be taken — check first |
| Subtitle | 30 characters, e.g. "Turbulence before you fly" |
| Category | Travel, secondary Weather |
| Age rating | 4+ |
| Privacy policy URL | **Mandatory.** Must be a live URL before you submit |
| Support URL | **Mandatory.** A simple contact page is enough |
| Screenshots | 6.9" iPhone required; 6.5" recommended. iPad sizes if you support iPad |
| Privacy nutrition label | Select **Data Not Collected** — accurate, the app has no analytics and no backend |
| Export compliance | Uses only standard HTTPS; answer that it uses exempt encryption |

Your privacy policy can be short and truthful: the app collects nothing, has no accounts,
no analytics and no server. Airport queries and forecast requests go directly from the
device to Open-Meteo and adsbdb; link their privacy policies.

---

## Before you submit, settle the licensing

This matters more than the technical work. **Open-Meteo's free tier is non-commercial.** A
paid app, or one with ads, needs their commercial plan. OpenFlights airline data is ODbL,
which carries share-alike obligations. CARTO's free basemap tier has usage limits that a
popular app would exceed.

A free app with attribution is fine. Anything monetised needs these resolved first — Apple
will not check, but the data providers can.

---

## The honest recommendation

Ship the PWA first. It is finished, it installs to the home screen, and it costs nothing.
Put it on a static host, use it for a few real flights, and find out whether the forecasts
match what you actually felt.

If it earns its place, spend the $99 and the Xcode time then — and by that point you will
know which native features are worth building, rather than guessing now.
