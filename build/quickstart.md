---
layout: page
title: "Quickstart"
section: build
description: "Deploy your first Silverscript covenant on Kaspa in under 30 minutes. Clone repos, build from source, and deploy to a local vProgs testnet."
---

Get from zero to a deployed covenant on a local testnet in under 30 minutes. This guide covers cloning the repositories, building from source, and deploying a minimal Silverscript contract.

---

## Prerequisites

Before you begin, install the following:

| Tool | Version | Purpose |
|------|---------|---------|
| **Rust** | nightly (latest) | vProgs and Silverscript are Rust projects |
| **Git** | 2.40+ | Clone repositories |
| **protoc** | 3.21+ | Protocol Buffers compiler (used by vProgs node) |
| **cargo** | (ships with Rust) | Build system |

### Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup default nightly
rustup component add rust-src
```

Verify your installation:

```bash
rustc --version    # Should show nightly
cargo --version
```

### Install protoc

On Ubuntu/Debian:
```bash
sudo apt install -y protobuf-compiler
```

On macOS:
```bash
brew install protobuf
```

On Windows, download from [github.com/protocolbuffers/protobuf/releases](https://github.com/protocolbuffers/protobuf/releases).

---

## Clone the Repositories

You will need two repositories:

```bash
# vProgs framework (based computation on Kaspa)
git clone https://github.com/kaspanet/vprogs.git
cd vprogs

# In a separate directory, clone Silverscript (L1 covenant compiler)
git clone https://github.com/kaspanet/silverscript.git
```

---

## Repository Structure

### vProgs Monorepo

The vProgs repo is a layered Rust monorepo. Each layer has a single responsibility, and dependencies flow downward only:

```
vprogs/
  core/             # Fundamental types, traits, hashing, serialization
  storage/          # Persistent storage layer (database abstractions)
  state/            # State management, Merkle commitments
  scheduling/       # Transaction scheduling and ordering
  transaction-runtime/  # Transaction execution environment
  node/             # Full node binary, networking, RPC
```

Layer dependency chain:
```
core -> storage -> state -> scheduling -> transaction-runtime -> node
```

### Silverscript

```
silverscript/
  src/
    compiler/       # Silverscript-to-Kaspa-Script compiler
    parser/         # Language parser and AST
    codegen/        # Script code generation
    types/          # Type system
  examples/         # Example contracts
  tests/            # Compiler test suite
```

---

## Build from Source

### Build vProgs

```bash
cd vprogs
cargo build --release
```

This compiles the full node binary and all supporting crates. The first build takes several minutes as it compiles all dependencies.

### Build Silverscript

```bash
cd silverscript
cargo build --release
```

The compiler binary will be at `target/release/silverscript`.

---

## Run a Local Testnet

[Coming Soon] The local testnet tooling is under active development. In the meantime, you can connect to TN12 (the public Covenants++ testnet). See the [Testnet Guide](/build/testnet) for connection details.

To run a local simnet for development:

```bash
# Start a local vProgs node in simnet mode
cd vprogs
cargo run --release --bin vprogs-node -- --simnet
```

> **Note:** Local simnet support is preliminary. For the most stable experience, use TN12.

---

## Deploy Your First Covenant

Write a minimal Silverscript contract -- a time-locked vault:

```
pragma silverscript ^0.1.0;

contract SimpleVault(pubkey owner, int lockDuration) {
    entrypoint function spend(sig ownerSig) {
        require(checkSig(ownerSig, owner));
        require(this.age >= lockDuration);
    }
}
```

Save this as `vault.ss`.

### Compile

```bash
silverscript compile vault.ss --output vault.script
```

### Deploy to TN12

```bash
# [Coming Soon] CLI deployment tooling
# For now, use the kaspa-cli or RPC directly
# See the Testnet Guide for manual deployment steps
```

---

## Next Steps

- **[Dev Environment Setup](/build/dev-environment)** -- Configure IDE, toolchains, and debugging
- **[Your First vProg](/build/tutorials/first-vprog)** -- Build a full vProg with off-chain execution and ZK proving
- **[Silverscript Reference](/build/silverscript-reference)** -- Full language specification
- **[Testnet Guide](/build/testnet)** -- Connect to TN12 and get test KAS

---

## Troubleshooting

**Build fails with protobuf errors:**
Ensure `protoc` is installed and on your PATH. Run `protoc --version` to verify.

**Nightly Rust required:**
The vProgs repo uses nightly features. Run `rustup default nightly` or add a `rust-toolchain.toml` override.

**Slow first build:**
The initial compilation of all dependencies is expected to take 5-10 minutes. Subsequent incremental builds will be much faster.
