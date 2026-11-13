// Konfigurasi chain Aevum Testnet (QDay) — sumber: QDay Wiki + panduan PQA Labs.
// Chain ID 44005. JANGAN tertukar dengan QDay Origin mainnet (44001) / testnet (44003).
import { defineChain } from 'viem'

export const aevumTestnet = defineChain({
  id: 44005,
  name: 'QDay Aevum',
  nativeCurrency: { name: 'QDAY', symbol: 'QDAY', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-test.qday.info'] },
  },
  blockExplorers: {
    default: { name: 'Aevum Explorer', url: 'https://explorer-test.qday.info' },
  },
  testnet: true,
})

// Alamat kontrak — diisi dari .env setelah deploy (Vite: VITE_*).
// TOKEN_ADDRESS = alamat tUSD8 resmi (wajib dikonfirmasi di explorer 16 Nov).
// Kosong = frontend berjalan dalam mode "belum terhubung kontrak" (menampilkan
// panduan setup, bukan alamat palsu).
export const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS || ''
export const AEVUMPAY_ADDRESS = import.meta.env.VITE_AEVUMPAY_ADDRESS || ''
export const EXPLORER = 'https://explorer-test.qday.info'

// ABI minimal yang dipakai frontend (disimpan di sini supaya tidak perlu
// mengimpor artifact Hardhat ke Vite).
export const AEVUMPAY_ABI = [
  'function createInvoice(address payer, uint256 amount, string memo, uint256 dueInSeconds) returns (uint256)',
  'function payInvoice(uint256 invoiceId)',
  'function cancelInvoice(uint256 invoiceId)',
  'function payDirect(address to, uint256 amount, string memo)',
  'function invoices(uint256) view returns (address creator, address payer, uint256 amount, string memo, uint256 dueAt, uint8 status, address paidBy, uint256 paidAt)',
  'function invoiceStatus(uint256) view returns (uint8)',
  'function nextInvoiceId() view returns (uint256)',
  'event InvoiceCreated(uint256 indexed invoiceId, address indexed creator, address indexed payer, uint256 amount, string memo, uint256 dueAt)',
  'event InvoicePaid(uint256 indexed invoiceId, address indexed payer, uint256 amount, uint256 paidAt)',
  'event InvoiceCancelled(uint256 indexed invoiceId, address indexed creator)',
  'event DirectPayment(address indexed from, address indexed to, uint256 amount, string memo)',
]

export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]
