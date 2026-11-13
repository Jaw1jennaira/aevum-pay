# Design Doc — AevumPay

> Aplikasi pembayaran stablecoin di Aevum Testnet untuk Aevum Builder
> Challenge (16 Nov–11 Des 2026, hadiah $1.500 USDT).
> Status: rancangan + scaffold, 13 Nov 2026. Build penuh mulai 16 Nov.

## 1. Masalah & pengguna

Penjual/UMKM (contoh: toko laptop di Tasikmalaya) ingin menerima pembayaran
stablecoin tanpa ribet: buat tagihan, kirim link/QR ke pembeli, pembeli bayar
dari wallet-nya, penjual langsung terima dananya — semua tercatat on-chain
dan bisa diverifikasi di explorer. Di testnet Aevum, tokennya tUSD8.

Pengguna:
- **Merchant/penjual** — buat invoice, pantau status, terima dana.
- **Pembeli** — buka link/QR, approve + bayar, lihat bukti tx di explorer.
- **Juri** — buka repo + demo link, coba alur end-to-end tanpa setup rumit.

## 2. Keputusan arsitektur

| Keputusan | Alasan |
|---|---|
| Kontrak Solidity sendiri (`AevumPay.sol`), bukan x402/SDK QDay | Tooling pembayaran resmi QDay masih "coming" (FAQ §5). Kontrak ERC-20 standar selalu bisa jalan. |
| Dana invoice langsung ke merchant saat dibayar (tanpa escrow) | Paling sederhana + paling mudah dijelaskan ke juri; tidak ada dana mengendap, tidak ada risiko custody. Escrow opsional jadi fitur v2 bila waktu cukup. |
| Token address di-inject saat deploy, bukan hardcode | Alamat tUSD8 resmi belum terkonfirmasi — deploy script menerima `TOKEN_ADDRESS` dari env. |
| `MockUSD8` hanya untuk dev lokal | Supaya test + demo lokal jalan sebelum alamat resmi ada. JANGAN deploy mock ke testnet sebagai "tUSD8". |
| Frontend Vite + React + wagmi/viem | Stack standar EVM; chain Aevum didefinisikan sekali di `src/lib/aevum.js`. Tanpa backend/server — 100% client-side. |
| 6 decimals | Mengikuti konvensi USDC/USDT (dan MockUSD8). Bila tUSD8 resmi ternyata 18 decimals, ubah satu konstanta di frontend + test. |

## 3. Kontrak — `contracts/AevumPay.sol`

- `createInvoice(payer, amount, memo, dueInSeconds)` → `invoiceId`
  - `payer = 0x0` → invoice publik (siapa saja boleh bayar, cocok untuk QR/link).
  - `dueInSeconds = 0` → tanpa tenggat.
  - Event: `InvoiceCreated`.
- `payInvoice(invoiceId)` — butuh `approve()` dulu. Dana `transferFrom`
  pembayar → merchant dalam tx yang sama. Status → PAID.
  Event: `InvoicePaid`. Bayar 2x / payer salah / lewat tenggat → revert
  dengan custom error (`NotOpen` / `WrongPayer` / `PastDue`).
- `cancelInvoice(invoiceId)` — hanya creator, hanya saat OPEN.
- `payDirect(to, amount, memo)` — transfer langsung antar wallet, tercatat
  sebagai event `DirectPayment` (riwayat di frontend).
- `invoiceStatus(id)` (view) — OPEN yang lewat tenggat dilaporkan EXPIRED.
- Keamanan: tanpa custody (tidak ada `withdraw`), tanpa fee, tanpa owner/
  admin, tanpa upgrade — permukaan serangan minimal. Satu-satunya aset yang
  bergerak adalah token pembayar via `transferFrom` yang sudah di-approve.

## 4. Frontend — `frontend/`

Halaman satu layar, 2 tab + mode bayar via link:

1. **Buat Invoice** — form (jumlah, memo, pembayar opsional, tenggat) →
   tx → tampil link `?invoice=<id>` + QR code (siap dibagikan).
2. **Bayar Invoice** — buka `?invoice=<id>`: tampil detail + status →
   tombol Approve → tombol Bayar → link tx explorer.
3. **Kirim Langsung** — form alamat + jumlah + memo → `payDirect`.
4. Header: tombol connect wallet (MetaMask/injected), saldo tUSD8.
5. Bila alamat kontrak belum diisi: tampil banner setup, bukan alamat palsu.

Alur pengguna (demo untuk juri, 60 detik):
> Merchant connect wallet → buat invoice 25 tUSD8 "Laptop — DP" → salin
> link/QR → pembeli (wallet lain) buka link → Approve → Bayar → status
> PAID + saldo merchant bertambah → cek tx di explorer.

## 5. Fitur inti vs nice-to-have

**MVP (wajib, minggu 1–2):** invoice + bayar + batal + kirim langsung +
QR/link + saldo + status + deploy + verifikasi di explorer.
**v2 (bila waktu cukup, minggu 3–4):** riwayat invoice merchant (baca event
`InvoiceCreated`/`InvoicePaid`), daftar invoice saya, export CSV sederhana,
tampilan mobile rapi, halaman "cara pakai" + video demo 2–3 menit.
**Tidak dikerjakan:** escrow/settlement tertunda, multi-token, fiat on/off-ramp,
fitur x402/agent (menunggu tooling resmi QDay).

## 6. Testing & kualitas

- `test/AevumPay.test.js` — 8 test Hardhat: bayar sukses, anti-bayar-ganda,
  payer terkunci, invoice publik, batal (creator/bukan creator), payDirect,
  jumlah nol ditolak.
- Target sebelum submission: semua test hijau + deploy testnet + verifikasi
  Blockscout + uji manual 2 wallet (merchant & pembeli) + video demo.

## 7. Risiko & mitigasi

| Risiko | Mitigasi |
|---|---|
| Alamat tUSD8 resmi belum ada / faucet tUSD8 tidak jelas (16 Nov) | MockUSD8 untuk dev; deploy testnet pakai token resmi begitu diumumkan; bila tidak ada, fallback: deploy MockUSD8 ke testnet DENGAN label jelas "demo token" + jelaskan di README/submission. |
| x402/SDK QDay tiba-tiba jadi syarat | Desain kontrak tidak bergantung padanya; bila syarat berubah, tambah integrasi sebagai lapisan opsional. |
| Syarat submission (video/repo/form) belum diketahui | Cek kanal resmi QDay 16 Nov; siapkan repo publik + README + demo sejak minggu 1 supaya tinggal isi form. |
| RPC/faucet testnet tidak stabil | Deploy + klaim faucet di awal minggu 1; simpan cadangan tQDAY. |
