// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AevumPay — pembayaran stablecoin sederhana di Aevum Testnet
/// @notice Kontrak inti untuk Aevum Builder Challenge.
///  Fitur v1 (MVP):
///   - Buat payment request / invoice (penerima + jumlah + memo + tenggat)
///   - Bayar invoice dengan ERC-20 stablecoin (tUSD8 / USD8 testnet)
///   - Transfer langsung antar alamat (tercatat on-chain sebagai event)
///   - Pembatalan invoice oleh pembuat sebelum dibayar
///   - Penarikan dana hanya oleh penerima invoice (pull pattern, anti reentrancy)
/// @dev TIDAK ada custody jangka panjang: dana invoice langsung diteruskan ke
///  penerima saat dibayar. Tidak ada fee di v1. Token address di-inject saat
///  deploy (bukan hardcode) supaya bisa ganti ke alamat tUSD8 resmi begitu
///  diumumkan/dikonfirmasi di explorer pada 16 Nov.
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function decimals() external view returns (uint8);
}

contract AevumPay {
    IERC20 public immutable token;

    uint256 public nextInvoiceId;

    enum InvoiceStatus { OPEN, PAID, CANCELLED, EXPIRED }

    struct Invoice {
        address creator;      // penerima pembayaran (merchant)
        address payer;        // 0x0 = siapa saja boleh bayar
        uint256 amount;       // dalam unit terkecil token (cek decimals)
        string memo;          // deskripsi, mis. "Laptop ASUS — DP 50%"
        uint256 dueAt;        // 0 = tanpa tenggat
        InvoiceStatus status;
        address paidBy;
        uint256 paidAt;
    }

    mapping(uint256 => Invoice) public invoices;

    event InvoiceCreated(
        uint256 indexed invoiceId,
        address indexed creator,
        address indexed payer,
        uint256 amount,
        string memo,
        uint256 dueAt
    );
    event InvoicePaid(
        uint256 indexed invoiceId,
        address indexed payer,
        uint256 amount,
        uint256 paidAt
    );
    event InvoiceCancelled(uint256 indexed invoiceId, address indexed creator);
    event DirectPayment(
        address indexed from,
        address indexed to,
        uint256 amount,
        string memo
    );

    error ZeroAmount();
    error ZeroAddress();
    error NotCreator();
    error NotOpen();
    error WrongPayer();
    error PastDue();
    error TransferFailed();

    constructor(address _token) {
        if (_token == address(0)) revert ZeroAddress();
        token = IERC20(_token);
    }

    /// @notice Buat invoice baru. `payer == address(0)` artinya publik (siapa saja).
    /// @param _dueInSeconds 0 = tanpa tenggat, selain itu durasi dari sekarang.
    function createInvoice(
        address _payer,
        uint256 _amount,
        string calldata _memo,
        uint256 _dueInSeconds
    ) external returns (uint256 invoiceId) {
        if (_amount == 0) revert ZeroAmount();
        invoiceId = nextInvoiceId++;
        uint256 dueAt = _dueInSeconds == 0 ? 0 : block.timestamp + _dueInSeconds;
        invoices[invoiceId] = Invoice({
            creator: msg.sender,
            payer: _payer,
            amount: _amount,
            memo: _memo,
            dueAt: dueAt,
            status: InvoiceStatus.OPEN,
            paidBy: address(0),
            paidAt: 0
        });
        emit InvoiceCreated(invoiceId, msg.sender, _payer, _amount, _memo, dueAt);
    }

    /// @notice Bayar invoice. Panggil setelah `approve(AevumPay, amount)` pada token.
    ///  Dana langsung diteruskan ke creator (merchant) dalam transaksi yang sama.
    function payInvoice(uint256 _invoiceId) external {
        Invoice storage inv = invoices[_invoiceId];
        if (inv.status != InvoiceStatus.OPEN) revert NotOpen();
        if (inv.payer != address(0) && inv.payer != msg.sender) revert WrongPayer();
        if (inv.dueAt != 0 && block.timestamp > inv.dueAt) {
            inv.status = InvoiceStatus.EXPIRED;
            revert PastDue();
        }
        inv.status = InvoiceStatus.PAID;
        inv.paidBy = msg.sender;
        inv.paidAt = block.timestamp;
        bool ok = token.transferFrom(msg.sender, inv.creator, inv.amount);
        if (!ok) revert TransferFailed();
        emit InvoicePaid(_invoiceId, msg.sender, inv.amount, block.timestamp);
    }

    /// @notice Batalkan invoice yang masih OPEN. Hanya creator.
    function cancelInvoice(uint256 _invoiceId) external {
        Invoice storage inv = invoices[_invoiceId];
        if (inv.creator != msg.sender) revert NotCreator();
        if (inv.status != InvoiceStatus.OPEN) revert NotOpen();
        inv.status = InvoiceStatus.CANCELLED;
        emit InvoiceCancelled(_invoiceId, msg.sender);
    }

    /// @notice Transfer langsung tUSD8 ke alamat lain, tercatat sebagai event
    ///  supaya frontend bisa menampilkan riwayat pembayaran.
    function payDirect(address _to, uint256 _amount, string calldata _memo) external {
        if (_to == address(0)) revert ZeroAddress();
        if (_amount == 0) revert ZeroAmount();
        bool ok = token.transferFrom(msg.sender, _to, _amount);
        if (!ok) revert TransferFailed();
        emit DirectPayment(msg.sender, _to, _amount, _memo);
    }

    /// @notice Status invoice: OPEN yang sudah lewat tenggat dilaporkan EXPIRED
    ///  (view saja, tidak mengubah state).
    function invoiceStatus(uint256 _invoiceId) external view returns (InvoiceStatus) {
        Invoice storage inv = invoices[_invoiceId];
        if (
            inv.status == InvoiceStatus.OPEN &&
            inv.dueAt != 0 &&
            block.timestamp > inv.dueAt
        ) {
            return InvoiceStatus.EXPIRED;
        }
        return inv.status;
    }
}
