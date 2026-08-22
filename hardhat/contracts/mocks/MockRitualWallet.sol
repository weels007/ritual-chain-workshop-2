// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * MockRitualWallet — local stand-in for Ritual Chain's RitualWallet system contract.
 * Accepts deposits and tracks balances per address.
 */
contract MockRitualWallet {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lockBlocks;

    function deposit(uint256 lockDuration) external payable {
        balances[msg.sender] += msg.value;
        lockBlocks[msg.sender] = block.number + lockDuration;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function lockUntil(address account) external view returns (uint256) {
        return lockBlocks[account];
    }
}
