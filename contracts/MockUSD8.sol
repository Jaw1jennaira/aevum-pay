// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MockUSD8 — token ERC-20 tiruan tUSD8 untuk pengembangan lokal
/// @notice HANYA untuk test lokal / demo. Di Aevum Testnet, pakai token tUSD8
///  resmi (alamat dikonfirmasi dari halaman Official Contract Addresses QDay
///  / explorer pada 16 Nov), BUKAN token ini. Jangan deploy MockUSD8 ke
///  testnet sebagai "tUSD8" — juri bisa menganggap itu pemalsuan token.
///  6 decimals, mengikuti konvensi USDC/USDT.
contract MockUSD8 {
    string public name = "Test USD8";
    string public symbol = "tUSD8";
    uint8 public decimals = 6;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    /// @notice Faucet lokal: siapa saja boleh mint 10.000 tUSD8 sekali panggil
    ///  (dibatasi per alamat supaya tidak spam supply di demo).
    mapping(address => uint256) public minted;
    uint256 public constant FAUCET_AMOUNT = 10_000 * 10 ** 6;
    uint256 public constant FAUCET_CAP = 100_000 * 10 ** 6;

    error FaucetCapReached();

    function faucet() external {
        if (minted[msg.sender] + FAUCET_AMOUNT > FAUCET_CAP) revert FaucetCapReached();
        minted[msg.sender] += FAUCET_AMOUNT;
        totalSupply += FAUCET_AMOUNT;
        balanceOf[msg.sender] += FAUCET_AMOUNT;
        emit Transfer(address(0), msg.sender, FAUCET_AMOUNT);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "saldo kurang");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "saldo kurang");
        require(allowance[from][msg.sender] >= amount, "allowance kurang");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
