// Penghubung website <-> Google Spreadsheet (Apps Script).
// URL dan SECRET disimpan di Environment variables Netlify, tidak pernah dikirim ke browser.
//   GOOGLE_SHEETS_WEBHOOK_URL = https://script.google.com/macros/s/.../exec
//   GOOGLE_SHEETS_SECRET      = kata sandi yang sama dengan SECRET di Apps Script

const TABLES = new Set(['pekerjaan', 'tahapan', 'jurnal']);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export default async (req) => {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;
  if (!url || !secret) {
    return json({ ok: false, error: 'not_configured', message: 'Database spreadsheet belum diatur di Netlify.' }, 503);
  }

  try {
    if (req.method === 'GET') {
      const res = await fetch(`${url}?secret=${encodeURIComponent(secret)}&t=${Date.now()}`, {
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json();
      if (!data.ok) return json({ ok: false, error: data.error || 'sheet_error' }, 502);
      return json(data);
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => null);
      const ops = Array.isArray(body?.ops) ? body.ops : null;
      if (!ops || !ops.length || ops.length > 20) return json({ ok: false, error: 'bad_request' }, 400);
      for (const o of ops) {
        if (!TABLES.has(o?.table) || !['upsert', 'delete'].includes(o?.op) || !Array.isArray(o?.rows) || o.rows.length > 200) {
          return json({ ok: false, error: 'bad_request' }, 400);
        }
      }
      const res = await fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'content-type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ secret, ops }),
        signal: AbortSignal.timeout(25000),
      });
      const data = await res.json();
      if (!data.ok) return json({ ok: false, error: data.error || 'sheet_error' }, 502);
      return json(data);
    }

    return json({ ok: false, error: 'method_not_allowed' }, 405);
  } catch (err) {
    return json({ ok: false, error: 'upstream_failed', message: String(err?.message || err) }, 502);
  }
};
