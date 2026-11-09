# Optional Ko-fi support link (web only)

A small support link sits below the feedback button and above the footer. It has **no third-party scripts or trackers** (a plain link). It never appears in the packaged Capacitor iOS app.

## Behaviour

- `VITE_KOFI_URL` unset: the link points to the default page, `https://ko-fi.com/citydoku`.
- `VITE_KOFI_URL=https://ko-fi.com/yourname`: the link points there. Only HTTPS URLs on `ko-fi.com` or `www.ko-fi.com` with a single creator path are accepted (no credentials, query or hash). Anything else hides the link.
- `VITE_KOFI_URL=` (set but empty): the link is hidden.

Set the variable in Vercel (Production and, if wanted, Preview) and redeploy.

The link uses `rel="noopener noreferrer"`. Payments, terms and processing happen on Ko-fi. The privacy policy mentions it.
