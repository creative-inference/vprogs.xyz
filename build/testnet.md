---
layout: page
title: "Testnet Guide"
section: build
description: "Guide to Kaspa TN12, the public Covenants++ testnet. Connect, get test KAS, deploy Silverscript contracts, and verify ZK proofs before mainnet."
---

TN12 is the public Covenants++ testnet for Kaspa. It is the primary environment for testing Silverscript contracts, covenant operations, and ZK proof verification before mainnet launch.

---

## TN12 Overview

| Property | Value |
|----------|-------|
| **Name** | Testnet-12 (TN12) |
| **Launched** | January 5, 2026 |
| **Last Reset** | February 9, 2026 |
| **Block Rate** | 10 BPS |
| **Consensus** | DagKnight |
| **Purpose** | Covenants++ feature testing |

### What Is Live on TN12

The February 9 reset introduced significant new features:

| Feature | KIP | Status |
|---------|-----|--------|
| **Covenant IDs** | KIP-20 | Active |
| **Blake3 Sequencing Commitment** | KIP-21 | Active (`OpChainblockSeqCommit`, opcode `0xd4`) |
| **ZK Verify Precompiles** | KIP-16 | Active (Groth16 + RISC Zero) |
| **Extended Covenant Opcodes** | KIP-17 | Active (Auth/Cov binding) |
| **Transaction Introspection** | KIP-10 | Active |
| **Silverscript Compiler** | -- | Experimental |
| **Native Asset Testing** | -- | Active |

### Covenant ID Opcodes

| Opcode | Code | Description |
|--------|------|-------------|
| `OpInputCovenantId` | `0xcf` | Get covenant ID of an input |
| `OpCovOutputCount` | `0xd0` | Count outputs with same covenant ID |
| `OpCovOutputIndex` | `0xd1` | Get index of covenant output |
| `OpAuthOutputCount` | `0xd2` | Count auth-bound outputs |
| `OpAuthOutputIndex` | `0xd3` | Get index of auth-bound output |
| `OpChainblockSeqCommit` | `0xd4` | Blake3 sequencing commitment |

---

## Connecting to TN12

### Run a TN12 Node

```bash
# Clone rusty-kaspa (Kaspa's Rust node)
git clone https://github.com/kaspanet/rusty-kaspa.git
cd rusty-kaspa

# Checkout the covpp branch
git checkout covpp

# Build
cargo build --release

# Run a TN12 node
cargo run --release --bin kaspad -- --testnet
```

### Connect a vProgs Node to TN12

```bash
cd vprogs
cargo run --release --bin vprogs-node -- --testnet --kaspad-address 127.0.0.1:16311
```

### Default TN12 Ports

| Service | Port |
|---------|------|
| gRPC | 16310 |
| P2P | 16311 |
| wRPC (Borsh) | 17310 |
| wRPC (JSON) | 18310 |

---

## Getting Test KAS

### Faucet

[Coming Soon] A web faucet for TN12 is planned. In the meantime, mine testnet coins directly.

### Mining on TN12

You can mine test KAS by running a CPU miner against your TN12 node:

```bash
# Using the built-in miner (from rusty-kaspa)
cargo run --release --bin kaspad -- --testnet --utxoindex --mining-address kaspatest:qr...
```

Replace `kaspatest:qr...` with your testnet address.

---

## Submitting Transactions

### Using kaspa-cli

[Coming Soon] CLI transaction tooling is under development.

### Using RPC Directly

```bash
# Submit a raw transaction via gRPC
grpcurl -plaintext localhost:16310 protowire.RPC/SubmitTransaction \
    -d '{"transaction": {...}}'
```

### Using Silverscript

```bash
# Compile and deploy a covenant
silverscript compile vault.ss --output vault.script

# [Coming Soon] Deploy to TN12
silverscript deploy vault.script --network testnet
```

---

## Block Explorer

[Coming Soon] A TN12 block explorer with covenant and ZK proof visibility is planned. For now, you can query the node directly via RPC.

### Useful RPC Queries

```bash
# Get current DAA score (block height proxy)
grpcurl -plaintext localhost:16310 protowire.RPC/GetBlockDagInfo

# Get UTXO set for an address
grpcurl -plaintext localhost:16310 protowire.RPC/GetUtxosByAddresses \
    -d '{"addresses": ["kaspatest:qr..."]}'

# Get block by hash
grpcurl -plaintext localhost:16310 protowire.RPC/GetBlock \
    -d '{"hash": "...", "includeTransactions": true}'
```

---

## ZK Proof Testing

TN12 supports ZK verification via `OpZkPrecompile` (KIP-16, [rusty-kaspa PR #775](https://github.com/kaspanet/rusty-kaspa/pull/775)):

| Tag | System | Sigop cost | Status |
|-----|--------|-----------|--------|
| `0x20` | RISC0-Groth16 | 140 | Live on TN12 |
| `0x21` | RISC0-Succinct | 740 | Live on TN12 |

Both tags verify RISC Zero proofs attesting to correct RISC-V program execution.

> **Note on Noir:** The three-tier ZK strategy designates Noir/Groth16 as Tier 1 for inline covenants. Native Noir proof verification is a planned addition to `OpZkPrecompile` but is not in the current TN12 implementation. Noir circuits can be used today by wrapping them inside a RISC Zero guest program (recursive verification).

### RISC0-Groth16 (tag 0x20)

- Compact proof size, 140 sigops on L1
- Verifies any RISC Zero guest program
- Used for [kaspa-chess](https://github.com/creative-inference/kaspa-chess) and other TN12 apps

### RISC0-Succinct (tag 0x21)

- STARK-based, quantum-resistant
- Higher sigop cost (740), larger proofs
- Suitable where post-quantum security is required

### Testing a ZK Proof

```bash
# [Coming Soon] -- Full ZK testing workflow

# 1. Generate a proof locally
# 2. Construct a transaction with the proof in the script sig
# 3. Submit via RPC
# 4. Check verification status
```

For a working ZK covenant example, see the [ZK Covenant Rollup PoC](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html) by Maxim Biryukov.

---

## Known Limitations

| Limitation | Description |
|------------|-------------|
| **Experimental** | TN12 may be reset at any time; do not rely on persistent state |
| **No faucet** | Must mine test KAS directly |
| **Silverscript unstable** | Compiler API and syntax may change |
| **No deployment CLI** | Contract deployment requires manual transaction construction |
| **No block explorer** | Must use RPC for chain queries |
| **ZK proofs manual** | No integrated proving toolchain yet |
| **Single-node testing** | Multi-node testnet clusters require manual setup |

---

## Testnet vs. Mainnet Timeline

| Milestone | Target |
|-----------|--------|
| TN12 active (covenant testing) | Now |
| Covenants++ hard fork (mainnet) | May 5, 2026 |
| Silverscript mainnet readiness | May 2026+ |
| vProgs Phase 1 (standalone) | TBD |
| vProgs Phase 2 (syncompo) | TBD |

---

## Troubleshooting

**Node fails to sync:**
Ensure you are on the `covpp` branch of rusty-kaspa. The mainnet branch does not support TN12 features.

**Transaction rejected:**
Check that your transaction uses valid TN12 opcodes. Opcodes from the Covenants++ set (`0xcf`-`0xd4`) are only valid on TN12 until the mainnet hard fork.

**ZK proof verification fails:**
Ensure your proof was generated with the correct verification parameters. Groth16 and RISC Zero use different proof formats.

---

## Related Resources

- **[Quickstart](/build/quickstart)** -- Build from source and deploy your first contract
- **[Dev Environment Setup](/build/dev-environment)** -- Configure toolchains for TN12 development
- **[API Reference](/build/api-reference)** -- RPC endpoints for TN12 interaction
- **[ZK Covenant Rollup PoC](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html)** -- Working ZK example on TN12
