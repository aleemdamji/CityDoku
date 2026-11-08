import './style.css';
import './platform/native.js';
import './platform/kofi.js';
import { initAuth, installShim } from './platform/backend.js';
import { installAuthUI } from './platform/auth.js';

// Auth and the store shim must be ready before the game script boots.
await initAuth();
installShim();
await import('./game.js');
installAuthUI();
