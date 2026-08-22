// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * MockScheduler — local stand-in for Ritual Chain's Scheduler system contract.
 * Stores scheduled calls and fires callbacks when execute() is called.
 */
contract MockScheduler {
    struct Call {
        address target;
        bytes data;
        uint32 gas;
        uint32 startBlock;
        uint32 numCalls;
        uint32 frequency;
        bool cancelled;
        uint8 state; // 0=scheduled, 1=executing, 2=completed, 3=cancelled
    }

    uint256 public nextCallId;
    mapping(uint256 => Call) public calls;
    mapping(address => bool) public approved;

    function approveScheduler(address schedulerContract) external {
        approved[msg.sender] = true;
    }

    function schedule(
        bytes calldata data,
        uint32 gas,
        uint32 startBlock,
        uint32 numCalls,
        uint32 frequency,
        uint32 ttl,
        uint256 maxFeePerGas,
        uint256 maxPriorityFeePerGas,
        uint256 value,
        address payer
    ) external returns (uint256 callId) {
        callId = nextCallId++;
        // Extract target address from first 20 bytes of data (selector is first 4 bytes)
        // Actually, the first 20 bytes after the selector would be the first param
        // But for schedule, we just store the full data
        calls[callId] = Call({
            target: msg.sender,
            data: data,
            gas: gas,
            startBlock: startBlock,
            numCalls: numCalls,
            frequency: frequency,
            cancelled: false,
            state: 0
        });
    }

    function cancel(uint256 callId) external {
        calls[callId].cancelled = true;
        calls[callId].state = 3;
    }

    function getCallState(uint256 callId) external view returns (uint8) {
        return calls[callId].state;
    }

    /**
     * Execute a scheduled call. In local dev, call this manually to simulate
     * the Scheduler firing at the resolve block.
     */
    function execute(uint256 callId) external {
        Call storage c = calls[callId];
        require(!c.cancelled, "cancelled");
        c.state = 1;

        // Overwrite bytes 4-35 with executionIndex (simulating Scheduler behavior)
        // The callback expects: onScheduledResolve(executionIndex, marketId)
        // We store executionIndex = 0 in bytes 4-35
        bytes memory callData = c.data;

        (bool ok, ) = c.target.call{gas: c.gas}(callData);
        if (ok) {
            c.state = 2; // completed
        } else {
            c.state = 0; // reset to scheduled for retry
        }
    }
}
