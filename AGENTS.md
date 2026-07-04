# Agent Operating Notes — Settlement

> **All commit messages, PR titles, PR descriptions, release notes, and documentation MUST be written in English.** No Korean in any project artifact. Code comments must be English only. Korean is allowed only for user-facing UI strings (app name, in-app labels) since this is a Korean app.

> Recurring problems and verified solutions for this repo. Every agent MUST read this file first.

## Language Policy

| Artifact | Language |
|----------|----------|
| Commit messages | English only |
| PR title | English only |
| PR description | English only |
| Release notes | English only |
| README.md | English only |
| AGENTS.md | English only |
| Code comments | English only |
| User-facing UI strings (app name, in-app labels) | Korean allowed |

## Release Management

- The APK is distributed via **GitHub Releases**, never committed to the repo (`*.apk` is gitignored). Do not commit `.apk` files.
- The "latest" download URL always resolves to the newest release tag, so existing links never break:
  `https://github.com/kimmaze027/Settlement/releases/latest/download/settlement.apk`
- To ship a new version: bump the tag (e.g. `v1.1.0`), build the APK, then `gh release create <tag> <apk> --title <tag> --notes "..."` (notes in English).

## App Identity

- App display name: **Settlement** (shown under the launcher icon). Set in BOTH `capacitor.config.ts` (`appName`) and `android/app/src/main/res/values/strings.xml` (`app_name`, `title_activity_main`) — they must match, or the next `npx cap sync android` will overwrite `strings.xml`.

## Project Basics

| Item | Value |
|------|-------|
| Repo | `kimmaze027/Settlement` (public) |
| App | Settlement |
| Stack | Capacitor 8 (Android WebView wrapper) |
| Backend | loads `https://www.kimmiro.com` |
