// Sign-in dialog: Apple, Google or an email link (Supabase Auth).
import { sb, deleteAccount } from './backend.js';
import { NATIVE } from './native.js';

const TX = {
  en: { title: 'Sign in to Citydoku', help: 'Save your scores and streaks, pick a username, join friend leagues and play on any device.', apple: 'Continue with Apple', google: 'Continue with Google', or: 'or', email: 'Email', send: 'Email me a sign-in link', cancel: 'Cancel', sent: 'Check your email for a sign-in link.', bad: 'Enter a valid email address.', fail: 'Sign-in didn’t work. Try again in a moment.', privacy: 'Privacy policy', del: 'Delete account', delQ: 'Delete your account and all your scores? This can’t be undone.', delDone: 'Your account was deleted.' },
  fr: { title: 'Se connecter à Citydoku', help: 'Sauvegarde tes scores et tes séries, choisis un nom d’utilisateur, rejoins des ligues et joue sur tous tes appareils.', apple: 'Continuer avec Apple', google: 'Continuer avec Google', or: 'ou', email: 'Courriel', send: 'M’envoyer un lien de connexion', cancel: 'Annuler', sent: 'Regarde tes courriels : on t’a envoyé un lien de connexion.', bad: 'Entre une adresse courriel valide.', fail: 'La connexion n’a pas fonctionné. Réessaie dans un moment.', privacy: 'Politique de confidentialité', del: 'Supprimer mon compte', delQ: 'Supprimer ton compte et tous tes scores? C’est irréversible.', delDone: 'Ton compte a été supprimé.' },
  es: { title: 'Inicia sesión en Citydoku', help: 'Guarda tus puntajes y rachas, elige un nombre de usuario, únete a ligas y juega en cualquier dispositivo.', apple: 'Continuar con Apple', google: 'Continuar con Google', or: 'o', email: 'Correo electrónico', send: 'Enviarme un enlace de acceso', cancel: 'Cancelar', sent: 'Revisa tu correo: te enviamos un enlace de acceso.', bad: 'Escribe un correo válido.', fail: 'No se pudo iniciar sesión. Inténtalo de nuevo en un momento.', privacy: 'Política de privacidad', del: 'Eliminar cuenta', delQ: '¿Eliminar tu cuenta y todos tus puntajes? No se puede deshacer.', delDone: 'Tu cuenta fue eliminada.' },
};
const tx = (k) => (TX[window.CD?.LANG] || TX.en)[k];
const $ = (id) => document.getElementById(id);
const REDIRECT_NATIVE = 'app.citydoku.game://auth';

function fill() {
  $('authTitle').textContent = tx('title'); $('authHelp').textContent = tx('help');
  $('authApple').textContent = ' ' + tx('apple'); $('authGoogle').textContent = tx('google');
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

export function installAuthUI() {
  if (!sb) return;
  $('authApple').addEventListener('click', () => oauth('apple'));
  $('authGoogle').addEventListener('click', () => oauth('google'));
  $('authCancel').addEventListener('click', () => $('authDlg').close());
  $('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('authEmail').value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $('authErr').textContent = tx('bad'); return; }
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: NATIVE.isNative ? REDIRECT_NATIVE : location.origin + location.pathname } });
    $('authErr').textContent = error ? tx('fail') : tx('sent');
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

export const authText = tx;
