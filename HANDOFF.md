# HANDOFF — Google Login Force-Close (Settlement Android)

> This file is a self-contained investigation prompt. An agent with device/ADB access
> reads it top-to-bottom and executes it. The only missing input is the crash stack
> trace, supplied at run time. Delete this file once the issue is resolved.

## ROLE
You are a mobile debugging engineer resolving a production crash in an Android
(Capacitor 8) app. You have shell + edit + git + ADB access to a physical device that
reproduces the crash. Work autonomously to root-cause, fix, build, and release.

## ENVIRONMENT SPLIT (important)
- The build/agent machine is a remote Mac mini with the full repo + Android SDK.
  It has NO physical device.
- The user's phone (reproduces the crash) is USB-reachable from the user's MacBook.
- THEREFORE the crash stack must be captured on the device side (`adb logcat`,
  USB→MacBook) and the stack TEXT handed to the agent. The agent then fixes/builds/
  releases on the Mac mini.
- Do NOT reproduce on an emulator for this issue (Google Sign-In needs a real
  logged-in Google account + Play Services; unreliable).

## THE BUG (precise symptom)
App: "Settlement" (internal applicationId `com.kimmiro.app`), a Capacitor 8 Android
WebView wrapper. The WebView loads a bundled local `www/index.html` that calls the
backend at `https://api.kimmiro.com`.

Symptom: tap "Google 로그인" → system account picker opens → user picks an account
(appears to succeed) → the app FORCE-CLOSES immediately ("강제 종료"). Reopening the
app shows the LOGIN screen (not logged in).

Deduction (already confirmed by code reading): reopening shows the login screen means
the session cookie was NEVER set, i.e. the crash happens BEFORE
`POST /api/auth/google/token` completes. So the crash is in/around the native
`GoogleAuth.signIn()` result callback — NOT in later JS.

## REPO POINTER
- Repo: https://github.com/kimmaze027/Settlement  (public).
  NOTE: git `origin` is `kimmaze027/kimmiro-android.git` — GitHub 301-redirects it to
  `kimmaze027/Settlement`. Pushing to `origin main` lands on Settlement. Releases go to
  `--repo kimmaze027/Settlement`.
- Default branch: `main`. HEAD at handoff: `960bc89` (tag v1.1.2).
- Release tags: v1.0.0=eae3385, v1.1.0=ba82b0a, v1.1.1=b35266b, v1.1.2=960bc89.
- APK distribution: GitHub Releases only. Stable URL (auto-resolves to latest):
  https://github.com/kimmaze027/Settlement/releases/latest/download/settlement.apk
  Asset filename MUST be `settlement.apk`.

## KEY FILES / ANCHORS (on main)
- `www/index.html` → JS login flow. `googleLogin()` does:
  `GoogleAuth.initialize()` → `GoogleAuth.signIn()` → `result.authentication.idToken`
  → `POST https://api.kimmiro.com/api/auth/google/token {token:idToken}` (sets session
  cookie) → `init()` → `GET /api/auth/me`.
  Startup: `init()` at the bottom; v1.1.1 added `recoverGoogleLogin()` (Preferences
  flag `google_login_inflight` + `GoogleAuth.refresh()` recovery).
- `capacitor.config.ts` → GoogleAuth plugin config (scopes, serverClientId).
  v1.1.2 REMOVED `forceCodeForRefreshToken: true` (it forced re-consent every login and
  the app never used serverAuthCode). Verify it stays absent.
- `android/app/build.gradle` → `versionCode`/`versionName`. Bump each release.
- `android/app/src/main/AndroidManifest.xml` → MainActivity has `launchMode="singleTask"`.
- Plugin native source (prime crash location):
  `node_modules/@codetrix-studio/capacitor-google-auth/android/src/main/java/com/codetrixstudio/capacitor/GoogleAuth/GoogleAuth.java`
  Key methods: `signIn()` (`startActivityForResult`), `signInResult()`
  (`@ActivityCallback`; calls `GoogleSignIn.getSignedInAccountFromIntent(result.getData())`
  then an executor running `getAuthToken(account.getAccount(), ...)` via AccountManager),
  `refresh()`, `initialize()`/`loadSignInClient()`.

## ALREADY RULED OUT — DO NOT REDO
- Full history audit: NO code regression. `googleLogin` JS is byte-identical from
  v1.0.0 → v1.1.2. Plugin version (`3.4.0-rc.4`) and Capacitor (`8.4.1`) unchanged since
  the plugin was added. "It worked before" most likely predates the native plugin
  (pure-WebView era) or is environmental — not a tracked-code regression.
- v1.1.1 added process-death recovery (Preferences + `refresh()`).
  v1.1.2 removed `forceCodeForRefreshToken`. Both were HYPOTHESES. If the crash persists
  on v1.1.2, it is a genuine NATIVE crash that REQUIRES the stack trace. Do NOT ship
  another speculative fix without the stack — that path already failed twice.

## INVESTIGATION PROCEDURE (execute in order)
**STEP 1 — Capture the crash stack (MANDATORY; unblocks everything).**
On the MacBook with the phone USB-connected and USB debugging on:
```
adb logcat -c
adb logcat AndroidRuntime:E *:S
```
Then on the phone: open app → Google login → pick account → crash.
Copy the ENTIRE block starting at `AndroidRuntime: FATAL EXCEPTION ...` through the
`Caused by:` lines.
If `AndroidRuntime` shows nothing useful, re-run `adb logcat *:W` and grep for
`com.kimmiro.app | GoogleAuth | com.google.android.gms | android.accounts`.
Version sanity: `adb shell dumpsys package com.kimmiro.app | grep version`.

**STEP 2 — Map the stack to source.** Identify the top app-frame:
- `com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth` → which method?
  (`signIn`/`signInResult`/`getAuthToken`/`refresh`) Read it in the plugin `.java`.
- `com.google.android.gms.*` → GMS internal (Play Services / OAuth config).
- `android.accounts.AccountManager` → consent/auth-token path.
- `com.getcapacitor.*` → bridge / activity-result delivery (`singleTask` interaction).

**STEP 3 — Form ONE hypothesis from the stack and verify it against the exact method.**
Do not guess broadly.

**STEP 4 — Apply the MINIMAL fix at the source.** Prefer the real cause over more
try/catch/retry layers.

**STEP 5 — Build, verify, release** (see GUARDRAILS + RELEASE).

## HYPOTHESES TO VALIDATE/ELIMINATE (ranked)
1. Uncaught exception in plugin `signInResult`: `result==null` or `result.getData()==null`
   → NPE at `getSignedInAccountFromIntent`; OR `completedTask.getResult(ApiException.class)`
   throwing a non-`ApiException`. (The executor block is try/caught → rejects, not crashes —
   but the lines before the try, or a null `result`, are not caught.)
2. `googleSignInClient == null` in `signIn()` (process recreated / config not loaded) →
   NPE at `getSignInIntent()`.
3. `launchMode="singleTask"` + Capacitor `@ActivityCallback`: result delivered to a
   recreated/different activity instance; `call==null` path, or callback not firing →
   app killed mid-flight.
4. `@codetrix-studio/capacitor-google-auth 3.4.0-rc.4` is a RELEASE CANDIDATE — known
   bugs vs Capacitor 6/7/8 Activity Result API. If the stack is GMS/framework noise,
   consider pinning to the latest stable 3.x as the fix.
5. OAuth misconfiguration (`DEVELOPER_ERROR` = code 10) — UNLIKELY given "picker
   completes", but verify the Android OAuth client in Google Cloud Console has package
   `com.kimmiro.app` + SHA-1 `B9:2C:EE:BD:0D:B2:9D:AA:09:09:05:C1:A8:1F:AD:02:C1:97:47:17`.
6. Pure process-death during the backgrounded picker (NOT a true crash) — already
   mitigated by v1.1.1 recovery; only relevant if logcat shows NO FATAL EXCEPTION.

## GUARDRAILS (do not violate)
- SIGNING: the published APK is DEBUG-signed with `~/.android/debug.keystore`
  (storepass=android, alias=androiddebugkey). Every release cert SHA-256 MUST equal
  `fc2184118a456b15c61816ab10893277cdb5d1858e346a12fb007aba840106a2`. Never switch keys
  (would force every user to uninstall). Build with `assembleDebug` to preserve it.
- DO NOT change applicationId `com.kimmiro.app` (tied to the OAuth client + signing).
- DO NOT change the API/backend hosts (`api.kimmiro.com`).
- Every commit message / PR / release note / code comment MUST be English (repo policy).
  Korean is allowed only in user-facing UI strings.
- Never suppress a crash to make it "pass". Fix the root cause.
- Never commit `*.apk` (gitignored). Never commit `android/app/build/` or `assets/public/`
  (cap-sync build outputs). `www/*` is ignored except `www/index.html`.

## RELEASE (after fix verified)
```
1. bunx cap sync android                              # propagate www/ + config
2. cd android && ./gradlew assembleDebug --no-daemon
   -> output: android/app/build/outputs/apk/debug/app-debug.apk
3. VERIFY before releasing:
   - ~/Library/Android/sdk/build-tools/36.0.0/apksigner verify --print-certs <apk>
     must show SHA-256 == fc2184118a456b15c61816ab10893277cdb5d1858e346a12fb007aba840106a2
   - aapt2 dump badging <apk> -> versionCode/versionName bumped from previous
   - the fix is present in the bundled assets
4. git add <changed source: www/index.html, capacitor.config.ts, build.gradle, ...>
   git commit -m "<English summary (vX.Y.Z)>"
   git push origin main
5. cp <apk> settlement.apk
   gh release create vX.Y.Z settlement.apk --repo kimmaze027/Settlement \
     --title vX.Y.Z --notes "<English notes incl. root cause + how verified>"
6. curl -sI https://github.com/kimmaze027/Settlement/releases/latest/download/settlement.apk
   -> HTTP 200, resolves to the new tag
```

## DEFINITION OF DONE
- `adb logcat` stack captured; root cause stated in one sentence with file+method+line.
- Minimal source fix applied.
- APK rebuilt with the SAME debug key; version bumped; committed to `main`; published as
  the new "latest" release on `kimmaze027/Settlement`.
- User confirms: Google login completes AND the app stays open (lands on main screen).
