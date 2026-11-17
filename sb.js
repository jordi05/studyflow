/* StudyFlow fase 2 - cliente Supabase minimo, sin librerias externas.
   Mantiene la CSP script-src 'self'. Solo usa la clave publicable (segura en frontend).
   La clave secreta NUNCA va en este repo. */
'use strict';

const SB_URL = 'https://kyhmcyhgjljpgzckxsjf.supabase.co';
const SB_KEY = 'sb_publishable__uIs3Dh-2YWAMCJ_DNuISw_w9yUMdUJ';
const SB_SESSION_KEY = 'sf_sb_session';

function sbSession() {
  try {
    const raw = localStorage.getItem(SB_SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !s.access_token) return null;
    return s;
  } catch (e) { return null; }
}

function sbSetSession(s) {
  if (s) localStorage.setItem(SB_SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SB_SESSION_KEY);
}

function sbUser() {
  const s = sbSession();
  return s && s.user ? s.user : null;
}

async function sbAuthPost(path, body, token) {
  const res = await fetch(SB_URL + '/auth/v1' + path, {
    method: 'POST',
    headers: {
      'apikey': SB_KEY,
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    },
    body: JSON.stringify(body)
  });
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  return { ok: res.ok, status: res.status, data };
}

function sbErrorMsg(data, fallback) {
  if (!data) return fallback;
  const code = data.error_code || data.code || '';
  const msg = data.msg || data.message || data.error_description || '';
  if (code === 'user_already_exists' || /already registered/i.test(msg)) return 'Ya existe una cuenta con ese email.';
  if (code === 'invalid_credentials' || /invalid login/i.test(msg)) return 'Email o contrasena incorrectos.';
  if (/password/i.test(msg) && /(short|least|weak)/i.test(msg)) return 'La contrasena debe tener al menos 6 caracteres.';
  if (/valid email|invalid email/i.test(msg)) return 'Ese email no parece valido.';
  return msg || fallback;
}

/* URL a la que vuelven los enlaces de los emails (confirmacion y recuperacion) */
function sbRedirectTo() {
  return location.origin + location.pathname;
}

async function sbSignup(email, password) {
  const r = await sbAuthPost('/signup?redirect_to=' + encodeURIComponent(sbRedirectTo()), { email, password });
  if (!r.ok) return { ok: false, error: sbErrorMsg(r.data, 'No se pudo crear la cuenta.') };
  // Con la confirmacion por email desactivada, signup devuelve sesion directa.
  if (r.data && r.data.access_token) {
    sbSetSession({
      access_token: r.data.access_token,
      refresh_token: r.data.refresh_token,
      expires_at: Date.now() + (r.data.expires_in || 3600) * 1000,
      user: r.data.user
    });
    return { ok: true, user: r.data.user };
  }
  return { ok: true, user: r.data && r.data.user ? r.data.user : null, needsConfirm: true };
}

async function sbLogin(email, password) {
  const r = await sbAuthPost('/token?grant_type=password', { email, password });
  if (!r.ok) return { ok: false, error: sbErrorMsg(r.data, 'No se pudo iniciar sesion.') };
  sbSetSession({
    access_token: r.data.access_token,
    refresh_token: r.data.refresh_token,
    expires_at: Date.now() + (r.data.expires_in || 3600) * 1000,
    user: r.data.user
  });
  return { ok: true, user: r.data.user };
}

/* Sesion que Supabase deja en el hash al volver de un email (signup o recovery) */
function sbHashSession() {
  if (!location.hash || location.hash.length < 2) return null;
  const p = new URLSearchParams(location.hash.slice(1));
  const at = p.get('access_token');
  if (!at) return null;
  return {
    access_token: at,
    refresh_token: p.get('refresh_token') || '',
    expires_at: Date.now() + (parseInt(p.get('expires_in') || '3600', 10)) * 1000,
    type: p.get('type') || ''
  };
}

async function sbGetUser(token) {
  try {
    const res = await fetch(SB_URL + '/auth/v1/user', {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token }
    });
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    return res.ok && data && data.id ? data : null;
  } catch (e) { return null; }
}

/* Pide un email de recuperacion de contrasena */
async function sbRecover(email) {
  const r = await sbAuthPost('/recover?redirect_to=' + encodeURIComponent(sbRedirectTo()), { email });
  if (!r.ok) return { ok: false, error: sbErrorMsg(r.data, 'No se pudo enviar el correo.') };
  return { ok: true };
}

/* Cambia la contrasena con la sesion activa (tras el enlace de recuperacion) */
async function sbUpdatePassword(newPass) {
  const s = sbSession();
  if (!s) return { ok: false, error: 'Sin sesion.' };
  let res;
  try {
    res = await fetch(SB_URL + '/auth/v1/user', {
      method: 'PUT',
      headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.access_token },
      body: JSON.stringify({ password: newPass })
    });
  } catch (e) { return { ok: false, error: 'Sin conexion. Intentalo de nuevo.' }; }
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok) return { ok: false, error: sbErrorMsg(data, 'No se pudo cambiar la contrasena.') };
  return { ok: true, user: data };
}

async function sbRefresh() {
  const s = sbSession();
  if (!s || !s.refresh_token) return false;
  const r = await sbAuthPost('/token?grant_type=refresh_token', { refresh_token: s.refresh_token });
  if (!r.ok) { sbSetSession(null); return false; }
  sbSetSession({
    access_token: r.data.access_token,
    refresh_token: r.data.refresh_token,
    expires_at: Date.now() + (r.data.expires_in || 3600) * 1000,
    user: r.data.user
  });
  return true;
}

async function sbLogout() {
  const s = sbSession();
  if (s) {
    try {
      await fetch(SB_URL + '/auth/v1/logout', {
        method: 'POST',
        headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + s.access_token }
      });
    } catch (e) { /* mejor esfuerzo */ }
  }
  sbSetSession(null);
}

/* fetch a /rest/v1 con apikey + token del usuario, refrescando una vez si caduca */
async function sbRest(path, options, retried) {
  let s = sbSession();
  if (!s) return { ok: false, status: 401, data: null };
  if (s.expires_at && Date.now() > s.expires_at - 30000) {
    const ok = await sbRefresh();
    if (!ok) return { ok: false, status: 401, data: null };
    s = sbSession();
  }
  const res = await fetch(SB_URL + '/rest/v1' + path, {
    method: (options && options.method) || 'GET',
    headers: {
      'apikey': SB_KEY,
      'Authorization': 'Bearer ' + s.access_token,
      'Content-Type': 'application/json',
      ...(options && options.headers ? options.headers : {})
    },
    body: options && options.body ? JSON.stringify(options.body) : undefined
  });
  if (res.status === 401 && !retried) {
    const ok = await sbRefresh();
    if (ok) return sbRest(path, options, true);
    return { ok: false, status: 401, data: null };
  }
  let data = null;
  if (res.status !== 204) { try { data = await res.json(); } catch (e) { data = null; } }
  return { ok: res.ok, status: res.status, data };
}

/* Carga el payload de datos del usuario. null = sin fila todavia. */
async function sbLoadData() {
  const r = await sbRest('/userdata?select=payload');
  if (!r.ok) return { ok: false, error: 'No se pudieron cargar tus datos de la nube.' };
  if (Array.isArray(r.data) && r.data.length > 0) return { ok: true, payload: r.data[0].payload };
  return { ok: true, payload: null };
}

/* Sube (upsert) el payload completo del usuario. */
async function sbSaveData(payload) {
  const s = sbSession();
  if (!s || !s.user) return { ok: false, error: 'Sin sesion.' };
  const r = await sbRest('/userdata', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: { user_id: s.user.id, payload: payload, updated_at: new Date().toISOString() }
  });
  if (!r.ok) return { ok: false, error: 'No se pudieron guardar tus datos en la nube.' };
  return { ok: true };
}

/* Lee la marca Pro del perfil (solo lectura desde el cliente; se activa por Stripe). */
async function sbLoadProfile() {
  const r = await sbRest('/profiles?select=pro');
  if (!r.ok || !Array.isArray(r.data) || !r.data.length) return { ok: r.ok, pro: false };
  return { ok: true, pro: !!r.data[0].pro };
}
