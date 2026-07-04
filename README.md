# kimmiro.com Android App

Android WebView app for **kimmiro.com** — scoped to Groups, Settlements (정산), and Nickname change.

## Features
- 🔐 Login (username/password + Google OAuth)
- 👥 Groups (list, create, invite/join, detail)
- 💰 Settlements (정산: create, balance/미수금, edit/delete, receipts)
- ✏️ Nickname change (마이페이지)

## How it works
A Capacitor WebView wrapper that loads `https://www.kimmiro.com` with CSS injection to hide non-essential navigation (Home, About, Projects), leaving only Groups + My Page.

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

## Pre-built APK
`kimmiro-android-debug.apk` in the repo root is a debug-signed APK ready to sideload.

## Config
Edit `capacitor.config.ts` to change the server URL or app settings.

```ts
server: {
  url: "https://www.kimmiro.com",
}
```
