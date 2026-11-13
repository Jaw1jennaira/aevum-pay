// AevumPay — frontend minimal (Vite + React + wagmi/viem).
// Alur: connect wallet (MetaMask, chain Aevum 44005) -> buat invoice / bayar / kirim.
// QR: invoice publik diubah jadi link `?invoice=<id>` + QR code (qrcode.react).
// TODO 16 Nov: isi VITE_TOKEN_ADDRESS + VITE_AEVUMPAY_ADDRESS di frontend/.env
//   setelah deploy + konfirmasi alamat tUSD8 resmi di explorer.
import React, { useEffect, useState } from 'react'
import { http, createConfig, WagmiProvider, useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { formatUnits, parseUnits } from 'viem'
import { QRCodeSVG } from 'qrcode.react'
import { aevumTestnet, TOKEN_ADDRESS, AEVUMPAY_ADDRESS, AEVUMPAY_ABI, ERC20_ABI, EXPLORER } from './lib/aevum.js'

const config = createConfig({
  chains: [aevumTestnet],
  transports: { [aevumTestnet.id]: http() },
  connectors: [injected()],
})

function fmt(amount) {
  try { return formatUnits(BigInt(amount), 6) } catch { return '0' }
}

function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  if (!isConnected) {
    return <button onClick={() => connect({ connector: injected() })}>Hubungkan Wallet</button>
  }
  return (
    <span>
      {address?.slice(0, 6)}…{address?.slice(-4)}{' '}
      <button onClick={() => disconnect()}>Putuskan</button>
    </span>
  )
}

function CreateInvoice() {
  const { address } = useAccount()
  const [amount, setAmount] = useState('25')
  const [memo, setMemo] = useState('Pembayaran')
  const [payer, setPayer] = useState('')
  const [hours, setHours] = useState('24')
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })
  const [createdId, setCreatedId] = useState(null)

  // Ambil id invoice terbaru setelah tx sukses (sederhana: nextInvoiceId - 1)
  const { data: nextId } = useReadContract({
    address: AEVUMPAY_ADDRESS, abi: AEVUMPAY_ABI,
    functionName: 'nextInvoiceId', query: { enabled: isSuccess },
  })
  useEffect(() => {
    if (isSuccess && nextId !== undefined) setCreatedId(Number(nextId) - 1)
  }, [isSuccess, nextId])

  const submit = (e) => {
    e.preventDefault()
    writeContract({
      address: AEVUMPAY_ADDRESS, abi: AEVUMPAY_ABI, functionName: 'createInvoice',
      args: [payer || '0x0000000000000000000000000000000000000000', parseUnits(amount || '0', 6), memo, BigInt((Number(hours) || 0) * 3600)],
    })
  }
  const payLink = createdId !== null ? `${window.location.origin}${window.location.pathname}?invoice=${createdId}` : null
  return (
    <section>
      <h2>Buat Invoice (Tagihan)</h2>
      <form onSubmit={submit}>
        <label>Jumlah (tUSD8) <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" required /></label>
        <label>Memo <input value={memo} onChange={(e) => setMemo(e.target.value)} required /></label>
        <label>Pembayar spesifik (opsional, kosong = siapa saja) <input value={payer} onChange={(e) => setPayer(e.target.value)} placeholder="0x…" /></label>
        <label>Tenggat (jam, 0 = tanpa tenggat) <input value={hours} onChange={(e) => setHours(e.target.value)} inputMode="numeric" /></label>
        <button disabled={isPending || !address}>Buat Invoice</button>
      </form>
      {isSuccess && <p>Invoice dibuat! {hash && <a href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noreferrer">Lihat tx</a>}</p>}
      {payLink && (
        <div>
          <p>Link bayar: <a href={payLink}>{payLink}</a></p>
          <QRCodeSVG value={payLink} size={180} />
          <p>Bagikan QR/link ini ke pembayar.</p>
        </div>
      )}
    </section>
  )
}

function PayInvoice({ invoiceId }) {
  const { address } = useAccount()
  const { data: inv } = useReadContract({
    address: AEVUMPAY_ADDRESS, abi: AEVUMPAY_ABI, functionName: 'invoices',
    args: [BigInt(invoiceId)], query: { enabled: !!AEVUMPAY_ADDRESS },
  })
  const { data: allowance, refetch } = useReadContract({
    address: TOKEN_ADDRESS, abi: ERC20_ABI, functionName: 'allowance',
    args: [address, AEVUMPAY_ADDRESS], query: { enabled: !!address },
  })
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })
  useEffect(() => { if (isSuccess) refetch() }, [isSuccess])

  if (!inv) return <p>Memuat invoice #{invoiceId}…</p>
  const [creator, payer, amount, memo, dueAt, status, paidBy] = inv
  const statusText = ['OPEN', 'PAID', 'CANCELLED', 'EXPIRED'][Number(status)]
  const needApprove = allowance === undefined || allowance < amount
  return (
    <section>
      <h2>Bayar Invoice #{invoiceId}</h2>
      <p>Memo: {memo}</p>
      <p>Jumlah: {fmt(amount)} tUSD8</p>
      <p>Penerima: {creator}</p>
      <p>Status: {statusText}{paidBy !== '0x0000000000000000000000000000000000000000' ? ` (dibayar oleh ${paidBy})` : ''}</p>
      {statusText === 'OPEN' && (
        <>
          {needApprove && (
            <button disabled={isPending} onClick={() => writeContract({
              address: TOKEN_ADDRESS, abi: ERC20_ABI, functionName: 'approve',
              args: [AEVUMPAY_ADDRESS, amount],
            })}>1. Approve tUSD8</button>
          )}
          {!needApprove && (
            <button disabled={isPending} onClick={() => writeContract({
              address: AEVUMPAY_ADDRESS, abi: AEVUMPAY_ABI, functionName: 'payInvoice',
              args: [BigInt(invoiceId)],
            })}>2. Bayar {fmt(amount)} tUSD8</button>
          )}
        </>
      )}
      {hash && <p><a href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noreferrer">Lihat tx</a></p>}
    </section>
  )
}

function PayDirect() {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('10')
  const [memo, setMemo] = useState('')
  const { writeContract, data: hash, isPending } = useWriteContract()
  const submit = (e) => {
    e.preventDefault()
    writeContract({
      address: AEVUMPAY_ADDRESS, abi: AEVUMPAY_ABI, functionName: 'payDirect',
      args: [to, parseUnits(amount || '0', 6), memo || 'Pembayaran langsung'],
    })
  }
  return (
    <section>
      <h2>Kirim Langsung</h2>
      <form onSubmit={submit}>
        <label>Ke alamat <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="0x…" required /></label>
        <label>Jumlah (tUSD8) <input value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>
        <label>Memo <input value={memo} onChange={(e) => setMemo(e.target.value)} /></label>
        <button disabled={isPending}>Kirim</button>
      </form>
      {hash && <p><a href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noreferrer">Lihat tx</a></p>}
    </section>
  )
}

function Balance() {
  const { address } = useAccount()
  const { data } = useReadContract({
    address: TOKEN_ADDRESS, abi: ERC20_ABI, functionName: 'balanceOf',
    args: [address], query: { enabled: !!address && !!TOKEN_ADDRESS },
  })
  if (!address) return null
  return <p>Saldo tUSD8 kamu: {data !== undefined ? fmt(data) : '…'}</p>
}

export default function App() {
  const [tab, setTab] = useState('buat')
  const params = new URLSearchParams(window.location.search)
  const invoiceParam = params.get('invoice')
  const ready = TOKEN_ADDRESS && AEVUMPAY_ADDRESS
  return (
    <WagmiProvider config={config}>
      <main style={{ maxWidth: 640, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
        <h1>AevumPay</h1>
        <p>Bayar pakai stablecoin tUSD8 di Aevum Testnet (QDay, chain 44005). Uang testnet — tanpa nilai.</p>
        <ConnectButton />
        <Balance />
        {!ready && (
          <p style={{ background: '#fff3cd', padding: 12 }}>
            Kontrak belum terhubung: isi <code>VITE_TOKEN_ADDRESS</code> dan{' '}
            <code>VITE_AEVUMPAY_ADDRESS</code> di <code>frontend/.env</code> setelah deploy.
            Faucet tQDAY: <a href="https://faucet.qday.info" target="_blank" rel="noreferrer">faucet.qday.info</a>
          </p>
        )}
        {invoiceParam ? (
          <PayInvoice invoiceId={invoiceParam} />
        ) : (
          <>
            <nav>
              <button onClick={() => setTab('buat')}>Buat Invoice</button>{' '}
              <button onClick={() => setTab('kirim')}>Kirim Langsung</button>
            </nav>
            {tab === 'buat' ? <CreateInvoice /> : <PayDirect />}
          </>
        )}
        <footer>
          <p><small>
            Explorer: <a href={EXPLORER} target="_blank" rel="noreferrer">{EXPLORER}</a> ·
            Repo dibuat untuk Aevum Builder Challenge (16 Nov–11 Des 2026).
          </small></p>
        </footer>
      </main>
    </WagmiProvider>
  )
}
