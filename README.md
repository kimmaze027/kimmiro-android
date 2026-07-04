# 정산 (Settlement) — Android App

Android app for tracking group settlements (정산): split expenses, see who owes what, and settle up within groups.

## Features
- Login (username/password + Google OAuth)
- Groups (list, create, invite/join, detail)
- Settlements (정산: create, balances/미수금, edit/delete, receipts)
- Nickname change (마이페이지)

## Download

The APK is distributed via GitHub Releases (not committed to the repo).

- Latest build (always points to the newest release):
  https://github.com/kimmaze027/kimmiro-android/releases/latest/download/kimmiro-android.apk
- All releases: https://github.com/kimmaze027/kimmiro-android/releases

The APK is debug-signed. Enable "Install unknown apps" for your browser, then open the downloaded file. Requires Android API 24+.

### Releasing a new version
```bash
# 1. build the APK
cd android && JAVA_HOME=<JDK21_PATH> ./gradlew assembleDebug
# 2. upload as a new versioned release (bump the tag)
gh release create v1.x.0 android/app/build/outputs/apk/debug/app-debug.apk \
  --repo kimmaze027/kimmiro-android \
  --title "v1.x.0" --notes "..."
```
The "latest" download URL above automatically resolves to the newest tag, so existing links never break.

## Build

### Prerequisites
- JDK 21
- Android SDK (API 34+)
- Node.js / Bun

### Steps
```bash
bun install
npx cap sync android
cd android
JAVA_HOME=<JDK21_PATH> ./gradlew assembleDebug
```

The APK is output to `android/app/build/outputs/apk/debug/app-debug.apk`.

## Config
Edit `capacitor.config.ts` to change the server URL or app settings.

```ts
server: {
  url: "https://www.kimmiro.com",
}
```
