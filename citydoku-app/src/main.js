import './style.css';
import './platform/native.js';
import './platform/kofi.js';
import { initAuth, installShim } from './platform/backend.js';
import { installAuthUI } from './platform/auth.js';
import './quality/sync.js';

// Auth and the store shim must be ready before the game script boots.
await initAuth();
installShim();
await import('./game.js');
installAuthUI();

// Quality Lab extras load after the game so they can never block it.
import('./quality/features.js').then((m) => m.initFeatures()).catch((e) => console.warn('features', e));
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') import('./quality/qa.js').catch((e) => console.warn('qa', e));
if ('serviceWorker' in navigator && location.protocol === 'https:' && !(window.Capacitor && window.Capacitor.isNativePlatform?.())) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
