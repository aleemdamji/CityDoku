// Supabase-backed implementation of the small store API the game uses
// (originally the Claude artifact `db` / `user` / `downloads` capabilities).
// Tables: players(id uuid = auth user, data jsonb), feedback(data jsonb). See supabase/schema.sql.
import { createClient } from '@supabase/supabase-js';
import { NATIVE } from './native.js';

const URL_ = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const sb = URL_ && KEY
  ? createClient(URL_, KEY, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: !NATIVE.isNative } })
  : null;

let session = null;

export async function initAuth() {
  if (!sb) return;
  const { data } = await sb.auth.getSession();
  session = data.session;
  sb.auth.onAuthStateChange((_ev, s) => {
    const before = session?.user?.id || null;
    session = s;
    // Sign-in / sign-out changes who the game writes as: reload to start clean.
    if ((s?.user?.id || null) !== before) location.reload();
  });
}

export const currentUser = () => session?.user || null;

const mapErr = (e) => {
  if (!e) return null;
  if (e.code === '23505') return { code: 'taken', message: e.message };          // unique username
  if (e.code === '42501' || e.code === 'PGRST301') return { code: 'invalid_argument', message: e.message }; // RLS
  return { code: 'unavailable', message: e.message };
};

// ---- live "plays" collection: initial load + realtime changes ----
const rows = new Map();
const listeners = new Set();
let channel = null;
const snapshot = () => ({
  metadata: { fromCache: false, hasPendingWrites: false },
  docs: [...rows.entries()].map(([id, d]) => ({ id, exists: true, data: () => d })),
});
// Batch live updates so a burst of changes re-renders at most twice a second.
let emitTimer = null;
const emitNow = () => { emitTimer = null; listeners.forEach((fn) => fn(snapshot())); };
const emit = () => { if (!emitTimer) emitTimer = setTimeout(emitNow, 500); };

async function loadPlayers(limit) {
  const { data, error } = await sb.from('players').select('id,data').order('updated_at', { ascending: false }).limit(limit);
  if (error) throw mapErr(error);
  rows.clear();
  data.forEach((r) => rows.set(r.id, r.data || {}));
}

function subscribePlayers(limit, next, onErr) {
  listeners.add(next);
  loadPlayers(limit).then(emitNow).catch((e) => onErr && onErr(e));
  if (!channel) {
    channel = sb.channel('players-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, (p) => {
        if (p.eventType === 'DELETE') rows.delete(p.old.id);
        else if (p.new && p.new.data && typeof p.new.data === 'object') rows.set(p.new.id, p.new.data);
        else return;
        emit();
      })
      .subscribe();
  }
  return () => listeners.delete(next);
}

function playerDoc(id) {
  return {
    id,
    async get() {
      const { data, error } = await sb.from('players').select('data').eq('id', id).maybeSingle();
      if (error) throw mapErr(error);
      return { id, exists: !!data, data: () => data?.data };
    },
    async set(v) { return this.update(v); },
    // Merge on the server (merge_my_data), so two devices saving at once never erase each other's days.
    async update(v) {
      const { data, error } = await sb.rpc('merge_my_data', { patch: v });
      if (error) throw mapErr(error);
      if (data && typeof data === 'object') rows.set(id, data);
      emitNow();
    },
  };
}

const db = {
  doc(path) { const [col, id] = path.split('/'); if (col !== 'plays') throw new TypeError('unknown doc ' + path); return playerDoc(id); },
  collection(path) {
    if (path === 'plays') return { limit: (n) => ({ onSnapshot: (next, err) => subscribePlayers(n, next, err) }) };
    if (path.startsWith('feedback/')) {
      return { async add(v) { const { error } = await sb.from('feedback').insert({ data: v }); if (error) throw mapErr(error); return {}; } };
    }
    if (path === 'leagues') {
      return {
        // Register a new league code; names can't be changed afterwards.
        async create(code, name) { const { error } = await sb.from('leagues').insert({ code, name }); if (error) throw mapErr(error); return true; },
        async name(code) { const { data, error } = await sb.rpc('league_name', { p_code: code }); if (error) throw mapErr(error); return data || null; },
      };
    }
    throw new TypeError('unknown collection ' + path);
  },
};

const user = {
  id: async () => session?.user?.id || null,
};

// File saving: browser download on the web, share sheet in the iOS app.
const downloads = {
  async save({ filename, data }) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: filename.endsWith('.ics') ? 'text/calendar' : 'application/octet-stream' });
    if (NATIVE.isNative) return NATIVE.shareFile(filename, blob);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return { status: 'saved' };
  },
};

// The game asks for capabilities through window.claude.use(name).
export function installShim() {
  window.claude = {
    use: async (name) => {
      if (name === 'db') return sb ? db : null;
      if (name === 'user') return user;
      if (name === 'downloads') return downloads;
      return null;
    },
  };
}

export async function deleteAccount() {
  const { error } = await sb.rpc('delete_my_account');
  if (error) throw error;
  try { localStorage.clear(); } catch {}
  await sb.auth.signOut({ scope: 'local' });
}
