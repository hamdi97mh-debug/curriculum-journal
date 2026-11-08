# Jurnal Kurikulum

Jurnal harian dan papan pekerjaan tim kurikulum SRT 1 Serdang Bedagai.

- `public/index.html` — seluruh tampilan website (Beranda, Jurnal Harian, Pekerjaan, detail pekerjaan).
- `netlify/functions/api.mjs` — penghubung ke Google Spreadsheet (database).
- `netlify.toml` — pengaturan Netlify (tanpa proses build).

Data disimpan di Google Spreadsheet "Jurnal Harian Kurikulum" (tab `pekerjaan`, `tahapan`, `jurnal`)
melalui Apps Script. Environment variables di Netlify:

- `GOOGLE_SHEETS_WEBHOOK_URL` — URL aplikasi web Apps Script (berakhiran `/exec`)
- `GOOGLE_SHEETS_SECRET` — kata sandi yang sama dengan `SECRET` di Apps Script
