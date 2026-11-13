# Rencana Build Harian — Aevum Builder Challenge

> Periode: 16 Nov–11 Des 2026 (4 minggu). Deadline submission 11 Des
> (jam pasti dikonfirmasi 16 Nov). Finalis: video call 15 Des (bagian user).
> Rencana ini berasumsi syarat resmi dikonfirmasi 16 Nov — bila syarat
> berbeda (mis. ada track/kategori), sesuaikan minggu 1.

## Minggu 0 — 13 Nov (selesai, scaffold ini)

- [x] Riset testnet Aevum (chain 44005, RPC, faucet, explorer).
- [x] Design doc + arsitektur (kontrak + frontend).
- [x] Scaffold: kontrak, test, deploy script, frontend minimal, README.
- [ ] (Parent) Buat repo GitHub publik + push scaffold.

## Minggu 1 — 16–22 Nov: Pendaftaran + deploy pertama

- **Sen 16 Nov** — KONFIRMASI SYARAT (blocker #1): buka kanal resmi QDay
  (qday.io, wiki, @QDayOfficial, grup Telegram): link pendaftaran, format
  submission, kriteria penilaian, alamat tUSD8 resmi, faucet tUSD8.
  Daftar (bila pendaftaran butuh data user → minta ke user, jangan isi
  sendiri). Buat wallet testnet khusus deploy (baru, hanya tQDAY).
- **Sel 17 Nov** — Klaim tQDAY dari faucet.qday.info + dapatkan tUSD8
  (faucet/mint sesuai petunjuk resmi). `npm install` + `npx hardhat test`
  (8 test harus hijau).
- **Rab 18 Nov** — Deploy AevumPay ke Aevum Testnet dengan token resmi
  (`TOKEN_ADDRESS=... npm run deploy:aevum`). Verifikasi di Blockscout.
  Catat alamat kontrak di README + frontend `.env`.
- **Kam 19 Nov** — `npm install` frontend, isi `VITE_*`, jalankan `npm run dev`,
  uji alur end-to-end 2 wallet (buat invoice → approve → bayar → cek explorer).
- **Jum 20 Nov** — Perbaiki bug dari uji manual. Tulis README final
  (cara jalanin, alamat kontrak, link demo). Push ke repo publik.
- **Sab–Min 21–22 Nov** — Buffer: bila tUSD8 resmi belum ada, putuskan
  fallback (MockUSD8 di testnet berlabel demo) + catat di README.

## Minggu 2 — 23–29 Nov: Frontend lengkap

- Riwayat invoice merchant (baca event `InvoiceCreated`/`InvoicePaid`).
- Daftar "Invoice saya" + status (OPEN/PAID/CANCELLED/EXPIRED).
- Rapikan tampilan mobile; uji di MetaMask mobile.
- Tambah halaman "Cara pakai" singkat di frontend.
- Uji ulang end-to-end setelah tiap perubahan.

## Minggu 3 — 30 Nov–6 Des: Polish + demo

- Export riwayat (CSV sederhana) — opsional.
- Rekam video demo 2–3 menit (alur 60 detik merchant → pembeli → explorer).
- Tulis submission draft: deskripsi, masalah, solusi, arsitektur, link
  (repo, demo, kontrak di explorer, video).
- Minta review: jalankan checklist submission (lihat README).

## Minggu 4 — 7–11 Des: Submission

- **7–8 Des** — Final check: test hijau, kontrak terverifikasi, demo live,
  README lengkap, tidak ada secret di repo (`.env` tidak ter-commit).
- **9–10 Des** — Submit via kanal resmi (form/portal — JANGAN submit sebelum
  yakin semua link hidup). Simpan bukti submission (screenshot/tx/ID).
- **11 Des** — Deadline. Bila ada revisi diminta panitia, kerjakan di hari
  yang sama. Laporkan hasil submission ke user via Telegram.
- **15 Des** — Video call finalis (BAGIAN USER, bila lolos).

## Checklist submission (isi setelah syarat resmi diketahui)

- [ ] Repo GitHub publik (nama: lihat README) — link:
- [ ] Demo live (URL hosting) — link:
- [ ] Kontrak AevumPay terverifikasi di explorer — alamat:
- [ ] Token tUSD8 resmi — alamat:
- [ ] Video demo (2–3 mnt) — link:
- [ ] Form/portal submission — link + bukti:
