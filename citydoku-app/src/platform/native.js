// iOS (Capacitor) helpers. On the web every call falls back or is skipped.
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

async function shareFile(filename, blob) {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');
  const b64 = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(blob); });
  const { uri } = await Filesystem.writeFile({ path: filename, data: b64, directory: Directory.Cache });
  await Share.share({ files: [uri], title: 'Citydoku' });
  return { status: 'saved' };
}

// One repeating local notification per day at hh:mm (device time).
async function scheduleDaily(hour, minute, title, body) {
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') throw new Error('denied');
  await LocalNotifications.cancel({ notifications: [{ id: 1001 }] }).catch(() => {});
  await LocalNotifications.schedule({
    notifications: [{ id: 1001, title, body, schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true } }],
  });
}

async function openExternal(url) {
  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ url });
}

export const NATIVE = { isNative, shareFile, scheduleDaily, openExternal };
window.NATIVE = NATIVE;

// In the iOS app, links meant for a new tab open in an in-app browser sheet.
if (isNative) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[target="_blank"]');
    if (!a) return;
    e.preventDefault();
    openExternal(a.href);
  });
}
