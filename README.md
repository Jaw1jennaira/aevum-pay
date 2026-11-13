# AevumPay — Bayar Pakai tUSD8 di Aevum Testnet

Aplikasi pembayaran stablecoin sederhana untuk **Aevum Builder Challenge**
(16 Nov–11 Des 2026, hadiah $1.500 USDT). Dibangun di **Aevum Testnet**
(QDay, chain ID **44005**), token **tUSD8** (USD8 versi testnet).

> **Status:** scaffold siap (13 Nov 2026). Build penuh mulai 16 Nov saat
> pendaftaran dibuka. Baca `RESEARCH.md` untuk sumber + hal yang belum
> terverifikasi, `DESIGN.md` untuk rancangan, `PLAN.md` untuk rencana harian.

## Nama repo yang diusulkan

**`aevum-pay`** — pendek, jelas, mudah dicari juri.
Alternatif: `aevumpay` (tanpa strip) bila `aevum-pay` sudah dipakai.

## Apa yang dibangun

Penjual buat **invoice** (tagihan) → bagikan **link/QR** → pembeli bayar
dengan tUSD8 dari wallet-nya → dana langsung masuk ke penjual, tercatat
on-chain. Ada juga **kirim langsung** antar alamat.

- `contracts/AevumPay.sol` — invoice, bayar, batal, kirim langsung.
- `contracts/MockUSD8.sol` — token tiruan tUSD8, HANYA untuk dev lokal.
- `frontend/` — Vite + React + wagmi/viem (buat invoice, bayar, QR, saldo).

## Jaringan (Aevum Testnet)

| Item | Nilai |
|---|---|
| Chain ID | 44005 |
| RPC | https://rpc-test.qday.info |
| Explorer | https://explorer-test.qday.info |
| Gas token | tQDAY (faucet: https://faucet.qday.info) |
| Token bayar | tUSD8 — alamat resmi dikonfirmasi 16 Nov dari halaman Official Contract Addresses QDay / explorer |

## Cara jalanin (setelah 16 Nov)

```bash
# 1. Install
npm install
cd frontend && npm install && cd ..

# 2. Test kontrak (8 test, harus hijau)
npx hardhat test

# 3. Siapkan .env (salin dari .env.example)
#    - DEPLOYER_PRIVATE_KEY: wallet testnet saja (klaim tQDAY dulu di faucet)
#    - TOKEN_ADDRESS: alamat tUSD8 resmi

# 4. Deploy ke Aevum Testnet + verifikasi
npm run deploy:aevum
npx hardhat verify --network aevum <ALAMAT_AEVUMPAY> <ALAMAT_TOKEN>

# 5. Frontend (isi frontend/.env: VITE_TOKEN_ADDRESS + VITE_AEVUMPAY_ADDRESS)
npm run dev
```

## Struktur

```
aevum-payment/
├── README.md            # file ini
├── RESEARCH.md          # riset + sumber + yang belum terverifikasi
├── DESIGN.md            # design doc (arsitektur, fitur, risiko)
├── PLAN.md              # rencana build harian 16 Nov–11 Des
├── contracts/           # AevumPay.sol, MockUSD8.sol
├── test/                # AevumPay.test.js (8 test)
├── scripts/deploy.js    # deploy (lokal / Aevum, mock / token resmi)
├── hardhat.config.js    # network aevum (44005) + verifikasi Blockscout
├── frontend/            # Vite + React + wagmi/viem
└── .env.example         # contoh env (JANGAN commit .env)
```

## Aturan keamanan

- Semua token di sini TESTNET, tanpa nilai. Jangan kirim aset asli ke alamat
  testnet, jangan pernah masukkan private key/seed ke repo atau chat.
- Hanya pakai alamat kontrak dari sumber resmi QDay / explorer.
- Tim QDay tidak pernah DM duluan atau minta seed phrase.
