// Sign-in dialog: Apple, Google or an email link (Supabase Auth).
import { sb, deleteAccount, currentUser } from './backend.js';
import { NATIVE } from './native.js';

const TX = {
  en: { title: 'Sign in to Citydoku', help: 'Save your scores and streaks, pick a username, join friend leagues and play on any device.', apple: 'Continue with Apple', google: 'Continue with Google', facebook: 'Continue with Facebook', or: 'or', email: 'Email', send: 'Email me a sign-in link', cancel: 'Cancel', sent: 'Check your email for a sign-in link.', codeHelp: 'Opened the email on another device or app? Enter the 6-digit code from the email instead.', code: 'Sign-in code', verify: 'Sign in with code', codeBad: 'That code didn’t work. Check it, or request a new email.', rate: 'Too many sign-in emails. Wait a few minutes and try again.', expired: 'That sign-in link expired or was opened in a different browser. Request a new link and open it in the same browser you’re playing in.', bad: 'Enter a valid email address.', fail: 'Sign-in didn’t work. Try again in a moment.', privacy: 'Privacy policy', del: 'Delete account', delQ: 'Delete your account and all your scores? This can’t be undone.', delDone: 'Your account was deleted.' },
  fr: { title: 'Se connecter à Citydoku', help: 'Sauvegarde tes scores et tes séries, choisis un nom d’utilisateur, rejoins des ligues et joue sur tous tes appareils.', apple: 'Continuer avec Apple', google: 'Continuer avec Google', facebook: 'Continuer avec Facebook', or: 'ou', email: 'Courriel', send: 'M’envoyer un lien de connexion', cancel: 'Annuler', sent: 'Regarde tes courriels : on t’a envoyé un lien de connexion.', codeHelp: 'Tu as ouvert le courriel sur un autre appareil ou une autre appli? Entre plutôt le code à 6 chiffres du courriel.', code: 'Code de connexion', verify: 'Me connecter avec le code', codeBad: 'Ce code ne fonctionne pas. Vérifie-le ou demande un nouveau courriel.', rate: 'Trop de courriels envoyés. Attends quelques minutes et réessaie.', expired: 'Ce lien a expiré ou a été ouvert dans un autre navigateur. Demande un nouveau lien et ouvre-le dans le navigateur où tu joues.', bad: 'Entre une adresse courriel valide.', fail: 'La connexion n’a pas fonctionné. Réessaie dans un moment.', privacy: 'Politique de confidentialité', del: 'Supprimer mon compte', delQ: 'Supprimer ton compte et tous tes scores? C’est irréversible.', delDone: 'Ton compte a été supprimé.' },
  es: { title: 'Inicia sesión en Citydoku', help: 'Guarda tus puntajes y rachas, elige un nombre de usuario, únete a ligas y juega en cualquier dispositivo.', apple: 'Continuar con Apple', google: 'Continuar con Google', facebook: 'Continuar con Facebook', or: 'o', email: 'Correo electrónico', send: 'Enviarme un enlace de acceso', cancel: 'Cancelar', sent: 'Revisa tu correo: te enviamos un enlace de acceso.', codeHelp: '¿Abriste el correo en otro dispositivo o app? Escribe el código de 6 dígitos del correo.', code: 'Código de acceso', verify: 'Entrar con el código', codeBad: 'Ese código no funcionó. Revísalo o pide un correo nuevo.', rate: 'Demasiados correos. Espera unos minutos e inténtalo de nuevo.', expired: 'Ese enlace caducó o se abrió en otro navegador. Pide uno nuevo y ábrelo en el mismo navegador donde juegas.', bad: 'Escribe un correo válido.', fail: 'No se pudo iniciar sesión. Inténtalo de nuevo en un momento.', privacy: 'Política de privacidad', del: 'Eliminar cuenta', delQ: '¿Eliminar tu cuenta y todos tus puntajes? No se puede deshacer.', delDone: 'Tu cuenta fue eliminada.' },
};
const tx = (k) => (TX[window.CD?.LANG] || TX.en)[k];
const $ = (id) => document.getElementById(id);
const REDIRECT_NATIVE = 'app.citydoku.game://auth';

function fill() {
  $('authTitle').textContent = tx('title'); $('authHelp').textContent = tx('help');
  $('authApple').textContent = ' ' + tx('apple'); $('authGoogle').textContent = tx('google'); $('authFacebook').textContent = tx('facebook');
  $('authOr').textContent = tx('or'); $('authEmailL').textContent = tx('email');
  $('authSend').textContent = tx('send'); $('authCancel').textContent = tx('cancel');
  $('authPrivacy').textContent = tx('privacy'); $('authErr').textContent = '';
}

export function openSignIn() { fill(); $('authDlg').showModal(); }

async function oauth(provider) {
  try {
    if (NATIVE.isNative) {
      const { data, error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo: REDIRECT_NATIVE, skipBrowserRedirect: true } });
      if (error) throw error;
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: data.url });
    } else {
      const { error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin + location.pathname } });
      if (error) throw error;
    }
  } catch (e) { $('authErr').textContent = tx('fail'); }
}

// Providers kept off the sign-in dialog for now (remove 'facebook' to show it once the Meta app is published).
const HIDDEN_PROVIDERS = new Set(['facebook']);

// Only show the sign-in buttons for providers turned on in Supabase (Authentication → Providers).
async function showEnabledProviders() {
  const ids = { apple: 'authApple', google: 'authGoogle', facebook: 'authFacebook' };
  Object.values(ids).forEach((id) => { $(id).hidden = true; });
  $('authOr').parentElement.hidden = true;
  try {
    const url = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '') + '/auth/v1/settings';
    const res = await fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY } });
    const ext = (await res.json())?.external || {};
    let any = false;
    for (const [p, id] of Object.entries(ids)) if (ext[p] === true && !HIDDEN_PROVIDERS.has(p)) { $(id).hidden = false; any = true; }
    $('authOr').parentElement.hidden = !any;
  } catch { /* email sign-in still works */ }
}

// Email link opened in another browser/app can't finish (the sign-in key lives in the browser that asked), so also accept the code from the email.
function showCodeRow(email) {
  let row = $('authCodeRow');
  if (!row) {
    row = document.createElement('div'); row.id = 'authCodeRow'; row.style.cssText = 'display:flex;flex-direction:column;gap:6px';
    row.innerHTML = '<p class="foot" style="margin:0" id="authCodeHelp"></p><label for="authCode" style="font-weight:700" id="authCodeL"></label><input id="authCode" inputmode="numeric" autocomplete="one-time-code" maxlength="8" pattern="[0-9]*" placeholder="123456"><button class="btn" type="button" id="authVerify"></button>';
    $('authErr').insertAdjacentElement('beforebegin', row);
    $('authVerify').addEventListener('click', async () => {
      const token = $('authCode').value.replace(/\s+/g, '');
      if (!/^\d{6,8}$/.test(token)) { $('authErr').textContent = tx('codeBad'); return; }
      $('authVerify').disabled = true;
      try {
        const { error } = await sb.auth.verifyOtp({ email: row.dataset.email, token, type: 'email' });
        if (error) { console.warn('verifyOtp', error.status, error.code); $('authErr').textContent = tx('codeBad'); }
        else $('authDlg').close();
      } catch { $('authErr').textContent = tx('codeBad'); }
      finally { $('authVerify').disabled = false; }
    });
  }
  row.dataset.email = email;
  $('authCodeHelp').textContent = tx('codeHelp'); $('authCodeL').textContent = tx('code'); $('authVerify').textContent = tx('verify');
}

export function installAuthUI() {
  if (!sb) return;
  showEnabledProviders();
  $('authApple').addEventListener('click', () => oauth('apple'));
  $('authGoogle').addEventListener('click', () => oauth('google'));
  $('authFacebook').addEventListener('click', () => oauth('facebook'));
  $('authCancel').addEventListener('click', () => $('authDlg').close());
  $('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('authSend');
    const email = $('authEmail').value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $('authErr').textContent = tx('bad'); return; }
    if (btn.disabled) return;
    btn.disabled = true; $('authErr').textContent = '';
    try {
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: NATIVE.isNative ? REDIRECT_NATIVE : location.origin + location.pathname } });
      if (error) {
        console.warn('signInWithOtp', error.status, error.code, error.message);
        $('authErr').textContent = (error.code === 'over_email_send_rate_limit' || error.status === 429) ? tx('rate') : tx('fail');
      } else { $('authErr').textContent = tx('sent'); showCodeRow(email); }
    } catch (err) {
      $('authErr').textContent = tx('fail');
    } finally {
      setTimeout(() => { btn.disabled = false; }, 3000);
    }
  });
  // Buttons rendered by the game's account bar
  document.addEventListener('click', async (e) => {
    if (e.target.closest('#signInBtn')) openSignIn();
    if (e.target.closest('#signOutBtn')) await sb.auth.signOut({ scope: 'local' });
    if (e.target.closest('#deleteAcctBtn')) {
      if (!confirm(tx('delQ'))) return;
      try { await deleteAccount(); window.CD?.toast(tx('delDone')); } catch { window.CD?.toast(tx('fail')); }
    }
  });
  // Failed email link (expired, already used, or opened in another browser than it was requested from)
  const q = new URLSearchParams(location.search + '&' + location.hash.replace(/^#/, ''));
  if (q.get('error') || q.get('error_code') || (q.get('code') && !currentUser())) {
    history.replaceState(null, '', location.pathname);
    openSignIn();
    $('authErr').textContent = tx('expired');
  }
  // iOS: finish OAuth / email-link sign-in when the app is reopened from the redirect
  if (NATIVE.isNative) {
    import('@capacitor/app').then(({ App }) => App.addListener('appUrlOpen', async ({ url }) => {
      if (!url.startsWith(REDIRECT_NATIVE)) return;
      const code = new URL(url.replace(REDIRECT_NATIVE, 'https://x/auth')).searchParams.get('code');
      if (code) await sb.auth.exchangeCodeForSession(code);
      import('@capacitor/browser').then(({ Browser }) => Browser.close().catch(() => {}));
    }));
  }
}

