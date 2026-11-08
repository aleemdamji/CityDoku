// Optional, web-only Ko-fi link. No third-party scripts, cookies or embeds.
import { Capacitor } from '@capacitor/core';

const raw = (import.meta.env.VITE_KOFI_URL || 'https://ko-fi.com/citydoku').trim();
const section = document.getElementById('kofiSupport');
const anchor = document.getElementById('kofiSupportLink');

function isValidKofiUrl(input) {
  try {
    const url = new URL(input);
    return url.protocol === 'https:' &&
      (url.hostname === 'ko-fi.com' || url.hostname === 'www.ko-fi.com') &&
      /^\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname) &&
      url.username === '' && url.password === '' &&
      url.search === '' && url.hash === '';
  } catch {
    return false;
  }
}

// Do not show third-party support UI inside the packaged iOS app.
if (!Capacitor.isNativePlatform() && isValidKofiUrl(raw) && section && anchor) {
  anchor.href = raw;
  section.hidden = false;
}
