# Optional Ko-fi support link (web only)

This creates a small support link below the in-app feedback button and above the footer. It contains **no third-party scripts or trackers**, and is hidden by default. The link does not appear in packaged Capacitor iOS builds.

## Enable

1. Create or identify your Ko-fi creator page URL, e.g. `https://ko-fi.com/yourcreatorname`.
2. In Vercel project settings, add `VITE_KOFI_URL=https://ko-fi.com/yourcreatorname` to the relevant environments (Production and, if wanted, Preview).
3. Redeploy the web app. Only HTTPS URLs on `ko-fi.com` or `www.ko-fi.com` with a single creator path are accepted. Do not put credentials, query parameters, or a hash in the value.
4. To disable the link, remove/empty the variable and redeploy.

This deliberately uses an external link with `rel="noopener noreferrer"` instead of embedding widgets. Ko-fi payments, terms, and processing occur on Ko-fi, not inside Citydoku.

## QA

- With no env var or an invalid URL, support slot is hidden.
- With a correct URL in a desktop/mobile web build, the link appears and opens Ko-fi in a new tab.
- With an iOS Capacitor build, support slot is hidden.
- Existing navigation, privacy, languages, and game play are unchanged.
