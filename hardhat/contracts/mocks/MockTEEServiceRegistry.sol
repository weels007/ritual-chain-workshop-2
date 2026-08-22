// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * MockTEEServiceRegistry — local stand-in for Ritual Chain's TEE Service Registry.
 * Returns a fixed address for pickServiceByCapability.
 */
contract MockTEEServiceRegistry {
    address public fakeExecutor = address(0x000000000000000000000000000000000000bEEF);

    function pickServiceByCapability(
        uint8 capability,
        bool checkValidity,
        uint256 seed,
        uint256 maxProbes
    ) external view returns (address teeAddress, bool found) {
        return (fakeExecutor, true);
    }
}
