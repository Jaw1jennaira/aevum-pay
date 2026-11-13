const { expect } = require("chai");
const { ethers } = require("hardhat");

// Test dasar AevumPay + MockUSD8 (6 decimals).
// Jalankan: npx hardhat test
describe("AevumPay (tUSD8)", function () {
  let token, pay, merchant, payer, other;
  const toUnits = (n) => BigInt(n) * 10n ** 6n; // tUSD8 6 decimals

  beforeEach(async function () {
    [merchant, payer, other] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockUSD8");
    token = await Mock.deploy();
    const Pay = await ethers.getContractFactory("AevumPay");
    pay = await Pay.deploy(await token.getAddress());
    // Payer ambil dari faucet lokal lalu approve AevumPay
    await token.connect(payer).faucet();
    await token.connect(payer).approve(await pay.getAddress(), toUnits(1_000_000));
  });

  it("buat invoice + bayar: dana sampai ke merchant, status PAID", async function () {
    const amount = toUnits(25); // 25 tUSD8
    await expect(pay.connect(merchant).createInvoice(payer.address, amount, "Laptop — DP", 3600))
      .to.emit(pay, "InvoiceCreated");
    const before = await token.balanceOf(merchant.address);
    await expect(pay.connect(payer).payInvoice(0)).to.emit(pay, "InvoicePaid");
    expect(await token.balanceOf(merchant.address)).to.equal(before + amount);
    expect(await pay.invoiceStatus(0)).to.equal(1); // PAID
  });

  it("invoice tidak bisa dibayar dua kali", async function () {
    await pay.connect(merchant).createInvoice(payer.address, toUnits(10), "Test", 0);
    await pay.connect(payer).payInvoice(0);
    await expect(pay.connect(payer).payInvoice(0)).to.be.revertedWithCustomError(pay, "NotOpen");
  });

  it("invoice dengan payer tertentu tidak bisa dibayar orang lain", async function () {
    await pay.connect(merchant).createInvoice(payer.address, toUnits(10), "Test", 0);
    await expect(pay.connect(other).payInvoice(0)).to.be.revertedWithCustomError(pay, "WrongPayer");
  });

  it("invoice publik (payer = 0x0) bisa dibayar siapa saja", async function () {
    await pay.connect(merchant).createInvoice(ethers.ZeroAddress, toUnits(5), "Donasi", 0);
    await token.connect(other).faucet();
    await token.connect(other).approve(await pay.getAddress(), toUnits(5));
    await expect(pay.connect(other).payInvoice(0)).to.emit(pay, "InvoicePaid");
  });

  it("creator bisa membatalkan invoice OPEN; setelah batal tidak bisa dibayar", async function () {
    await pay.connect(merchant).createInvoice(payer.address, toUnits(10), "Test", 0);
    await expect(pay.connect(merchant).cancelInvoice(0)).to.emit(pay, "InvoiceCancelled");
    await expect(pay.connect(payer).payInvoice(0)).to.be.revertedWithCustomError(pay, "NotOpen");
  });

  it("bukan creator tidak bisa membatalkan", async function () {
    await pay.connect(merchant).createInvoice(payer.address, toUnits(10), "Test", 0);
    await expect(pay.connect(other).cancelInvoice(0)).to.be.revertedWithCustomError(pay, "NotCreator");
  });

  it("payDirect: transfer langsung + event tercatat", async function () {
    await expect(pay.connect(payer).payDirect(other.address, toUnits(7), "Bayar kas"))
      .to.emit(pay, "DirectPayment");
    expect(await token.balanceOf(other.address)).to.equal(toUnits(7));
  });

  it("jumlah nol ditolak", async function () {
    await expect(
      pay.connect(merchant).createInvoice(payer.address, 0, "Nol", 0)
    ).to.be.revertedWithCustomError(pay, "ZeroAmount");
  });
});
