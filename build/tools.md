---
layout: page
title: "Developer Tools"
section: build
description: "Essential developer tools for vProgs and Silverscript on Kaspa. CLI compilers, testing frameworks, debuggers, and block explorers for covenant development."
---

Tools for building, testing, debugging, and monitoring vProgs and Silverscript contracts on Kaspa.

---

## CLI Tools

### Silverscript Compiler

The primary tool for covenant development. Compiles Silverscript source to native Kaspa Script.

```bash
# Compile a contract
silverscript compile contract.ss --output contract.script

# Check syntax without compiling
silverscript check contract.ss

# Compile with debug output (shows generated opcodes)
silverscript compile contract.ss --debug

# [Coming Soon] Deploy to network
silverscript deploy contract.script --network testnet
```

**Repository:** [github.com/kaspanet/silverscript](https://github.com/kaspanet/silverscript)

### vProgs Node CLI

The vProgs node binary includes built-in commands for development:

```bash
# Run in simnet mode (local development)
vprogs-node --simnet

# Connect to TN12
vprogs-node --testnet

# Specify custom data directory
vprogs-node --testnet --appdir ~/.vprogs-dev

# Enable verbose logging
vprogs-node --testnet --loglevel=debug
```

### Kaspa CLI (kaspa-cli)

General-purpose CLI for interacting with Kaspa nodes:

```bash
# Query DAG info
kaspa-cli getblockdaginfo

# Get UTXOs for an address
kaspa-cli getutxosbyaddresses kaspatest:qr...

# Submit a raw transaction
kaspa-cli submittransaction <hex>
```

---

## Proof Inspector

[Coming Soon] A tool for inspecting and debugging ZK proofs before submission.

**Planned features:**

| Feature | Description |
|---------|-------------|
| Proof validation | Verify a proof locally without submitting to L1 |
| Public input inspection | Display the public inputs embedded in a proof |
| Verification key matching | Check that a proof matches a given verification key |
| Proof size analysis | Report proof size and estimated verification cost |
| Backend detection | Identify whether a proof is Groth16, STARK, or other |

**Intended usage:**

```bash
# [Coming Soon]
vprogs-tools inspect-proof proof.bin

# Output:
# Backend: Groth16
# Public inputs: [0x1234..., 0x5678...]
# Proof size: 256 bytes
# Verification: VALID
```

---

## Covenant Debugger

### Silverscript DAP Debugger

A Debug Adapter Protocol (DAP) debugger for Silverscript contracts is in active development. It integrates with VS Code and other DAP-compatible editors.

**Planned capabilities:**

- Step through Silverscript execution
- Inspect stack state at each opcode
- View transaction introspection values (`tx.inputs`, `tx.outputs`, `this.age`)
- Set breakpoints on `require` statements
- Trace covenant state transitions

**Status:** In development. Track progress in the [Silverscript repo](https://github.com/kaspanet/silverscript).

### Script-Level Debugging

For lower-level debugging, you can inspect the compiled Kaspa Script directly:

```bash
# Compile with debug info to see opcode mapping
silverscript compile contract.ss --debug

# Output shows Silverscript source lines mapped to opcodes:
# Line 12: require(checkSig(ownerSig, owner))
#   -> OP_CHECKSIGVERIFY
# Line 13: require(this.age >= lockTime)
#   -> OP_CHECKSEQUENCEVERIFY
```

---

## Block Explorer Integration

[Coming Soon] Block explorer support for vProgs transactions, covenant state, and ZK proof verification.

**Planned features:**

| Feature | Description |
|---------|-------------|
| Covenant state viewer | Display current state of covenant UTXOs |
| ZK proof status | Show proof verification results for vProg transactions |
| Covenant lineage | Visualize UTXO lineage via Covenant IDs (KIP-20) |
| Lane activity | Display KIP-21 lane activity and state roots |
| Transaction decoder | Parse and display covenant transaction structure |

For now, use direct RPC queries to inspect chain state. See the [Testnet Guide](/build/testnet) for RPC examples.

---

## Monitoring

### Node Metrics

[Coming Soon] The vProgs node will expose Prometheus-compatible metrics:

```bash
# [Coming Soon]
vprogs-node --testnet --metrics-addr 127.0.0.1:9090
```

**Planned metrics:**

| Metric | Description |
|--------|-------------|
| `vprogs_proofs_verified_total` | Total ZK proofs verified |
| `vprogs_proofs_rejected_total` | Total ZK proofs rejected |
| `vprogs_state_root_updates` | State root update count per vProg |
| `vprogs_lane_activity` | Active lanes and transaction throughput |
| `vprogs_proof_verification_time_ms` | Proof verification latency |

### Log Analysis

The vProgs node uses structured logging:

```bash
# Filter logs for proof verification events
vprogs-node --testnet --loglevel=info 2>&1 | grep "proof_verified"

# Filter for state updates
vprogs-node --testnet --loglevel=debug 2>&1 | grep "state_root_updated"
```

---

## Testing Utilities

### Simnet for Unit Testing

Use the simnet mode for deterministic local testing:

```rust
// In your test harness
#[cfg(test)]
mod tests {
    use vprogs_test_utils::SimnetBuilder;

    #[tokio::test]
    async fn test_counter_increment() {
        let simnet = SimnetBuilder::new()
            .with_vprog(counter_vprog())
            .build()
            .await;

        // Submit a transition and verify
        let result = simnet.submit_transition(
            counter_vprog_id,
            increment_action(42),
        ).await;

        assert!(result.is_ok());
        assert_eq!(simnet.get_counter_value().await, 42);
    }
}
```

---

## Third-Party Tools

| Tool | Author | Description |
|------|--------|-------------|
| Silverscript VS Code Extension | IzioDev | Syntax highlighting and diagnostics [Coming Soon] |
| VCC v2 | IzioDev | Visual Covenant Composer [In Development] |
| ZK Rollup PoC | Maxim Biryukov | Reference ZK covenant rollup implementation |

---

## Related Resources

- **[Dev Environment Setup](/build/dev-environment)** -- IDE and toolchain configuration
- **[Testnet Guide](/build/testnet)** -- Connect to TN12
- **[API Reference](/build/api-reference)** -- RPC endpoints
- **[Example Projects](/build/examples)** -- Reference implementations
