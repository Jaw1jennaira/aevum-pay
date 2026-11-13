# Riset — Aevum Builder Challenge

> Diriset 13 Nov 2026 (sebelum build dibuka 16 Nov). Halaman resmi event
> ("Aevum Builder Challenge") TIDAK ditemukan lewat pencarian web publik —
> detail event (hadiah $1.500 USDT, periode 16 Nov–11 Des 2026) berasal dari
> daftar GAWE user. Semua yang di bawah ini soal testnet Aevum SUDAH
> terverifikasi dari sumber publik; syarat/pendaftaran event WAJIB dikonfirmasi
> ulang pada 16 Nov (lihat "Yang belum terverifikasi").

## 1. Apa itu Aevum

- Aevum = generasi berikutnya dari arsitektur QDay (Abelian L1 PoW
  quantum-resistant + Polygon CDK L2, skema rollup "pessimistic proof").
- Fokus QDay: payments, smart wallet, AI agent, fitur quantum-resistant.
- **EVM-compatible penuh**: Solidity, MetaMask, Remix, Foundry, Hardhat,
  ethers.js, viem, wagmi — semuanya bekerja seperti di Ethereum, tinggal
  arahkan ke RPC Aevum.

## 2. Parameter Aevum Testnet (terverifikasi)

| Item | Nilai |
|---|---|
| Chain ID | **44005** |
| Nama di wallet | QDay Aevum |
| RPC | https://rpc-test.qday.info |
| Explorer (Blockscout) | https://explorer-test.qday.info |
| API verifikasi | https://explorer-test.qday.info/api |
| Gas token | tQDAY (test $QDAY, tanpa nilai) |
| Gas model | EIP-1559 (base fee + priority fee) |
| Faucet | https://faucet.qday.info (klaim pertama, gas ditanggung faucet) + widget di QDay Wiki |
| Kontrak faucet | `0xE5074CBbd046AFb491EB8692abD6cF7ECCC6dEE5` |
| Faucet: cooldown per alamat, hanya EOA (bukan kontrak) | |
| Stablecoin | **USD8** — stablecoin patok USD milik QDay; versi testnet disebut **tUSD8**. Terdaftar sebagai ERC-20 test token di FAQ QDay §3.8. |

**JANGAN tertukar:**
- QDay Origin mainnet: chain 44001, RPC `https://rpc.qday.io`
- QDay Origin testnet: chain 44003
- Aevum Testnet: chain **44005** — ini yang dipakai.
- **AevaChain adalah proyek BERBEDA** (chain EVM 2382, token aeUSD, faucet
  faucet.aevachain.com) — jangan pakai parameternya.

## 3. Yang SUDAH bisa / BELUM bisa di testnet (FAQ QDay §5)

- Sudah: deploy kontrak Solidity standar, transfer ERC-20, verifikasi Blockscout.
- **Belum ada tooling publik (status "coming")**: fitur pembayaran stablecoin
  resmi, pengujian x402, agent wallet, registrasi agent, dan SDK resmi QDay.
  Artinya: aplikasi kita TIDAK boleh bergantung pada x402/SDK QDay — bangun
  dengan ERC-20 + kontrak sendiri (itulah yang dilakukan scaffold ini).
- Akun di Aevum saat ini masih ECDSA standar (migrasi post-quantum
  ML-DSA-65 masih rencana).

## 4. Yang belum terverifikasi (BLOCKER — cek 16 Nov)

1. **Halaman/peraturan resmi Aevum Builder Challenge**: link pendaftaran,
   syarat peserta (individu/tim?), format submission (repo publik? video
   demo? form?), kriteria penilaian, dan cara klaim hadiah $1.500 USDT.
2. **Alamat kontrak tUSD8 resmi di Aevum (44005)**: belum ditemukan di
   pencarian publik. Wajib ambil dari halaman "Official contract addresses"
   QDay Wiki / explorer. JANGAN pakai alamat dari chat/DM/situs tak dikenal.
   Scaffold memakai `MockUSD8` lokal sampai alamat ini dikonfirmasi.
3. Apakah ada faucet khusus tUSD8, atau tUSD8 harus di-mint/didapat lewat
   cara tertentu (faucet tQDAY hanya memberi gas).
4. Apakah ada grup/kanal resmi (Telegram/Discord) + tenggat submission
   (11 Des — jam berapa, zona waktu apa).
5. Apakah video call finalis 15 Des benar bagian dari event ini (dari daftar
   GAWE user — perlu konfirmasi; itu bagian user bila lolos).

## 5. Sumber

1. PQA Labs, "Aevum Testnet: How do I get started? — QDay", Medium,
   16 Okt 2026 — https://pqalabs.medium.com/aevum-testnet-how-do-i-get-started-qday-4dd0a6d64a34
   (chain ID, RPC, faucet, verifikasi Blockscout, status fitur "coming").
2. QDay — https://qday.io/ ("Aevum Testnet is live · Chain ID 44005",
   langkah 1-2-3: tambah network → faucet tQDAY → deploy).
3. USD8 Stablecoin Whitepaper v1.1, Nov 2025 (PDF) —
   https://d504c73e-6f94-4473-bb1b-9f4fa7986d0b.filesusr.com/ugd/d5191c_d9497dbf4886464384486f932d47ec62.pdf
   (USD8 = stablecoin patok USD di QDay/Abelian, ERC-20 di chain EVM).
4. Pencarian "Aevum Builder Challenge" (13 Nov 2026): tidak ada halaman
   resmi event yang muncul — hanya hasil generik (AI Builder Challenge dll.,
   BUKAN event ini).

## 6. Keamanan (aturan event + GAWE)

- Tim QDay tidak pernah DM duluan / minta seed phrase / private key — itu
  berlaku juga untuk "support" testnet.
- Hanya pakai alamat kontrak dari halaman resmi QDay / explorer.
- Wallet deploy HANYA testnet (tQDAY tanpa nilai), key di `.env`, tidak
  pernah di-commit.
