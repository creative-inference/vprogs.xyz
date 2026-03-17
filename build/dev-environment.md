---
layout: page
title: "Dev Environment Setup"
section: build
description: "Configure your Rust toolchain, protobuf compiler, and IDE for building vProgs and Silverscript smart contracts on Kaspa from scratch."
---

A complete guide to configuring your development environment for building vProgs and Silverscript contracts on Kaspa.

---

## Recommended Hardware

These specs cover running a local dev node, compiling the workspace, and generating ZK proofs during development.

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 4 cores / 8 threads | 8+ cores (e.g. AMD Ryzen 7 / Intel Core i7) |
| **RAM** | 16 GB | 32 GB |
| **Storage** | 50 GB SSD | 200 GB NVMe SSD |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 22.04 / 24.04 LTS |
| **Network** | 10 Mbps | 100 Mbps+ (for testnet sync) |

> **ZK proving note:** Generating ZK proofs locally is CPU-intensive. If you plan to run proving workloads frequently, 16+ cores and 64 GB RAM will significantly reduce proof generation times. For lighter development work (writing contracts, running unit tests), the minimum spec is sufficient.

> **macOS / Windows:** Development is supported on macOS (Apple Silicon or Intel) and Windows via WSL2. Native Windows builds are not currently supported.

---

## Rust Toolchain

vProgs and Silverscript are written in Rust and require the nightly toolchain.

### Install Rust via rustup

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Configure Nightly

```bash
source ~/.cargo/env   # Load rustup into the current shell
rustup default nightly
rustup component add rust-src rustfmt clippy
rustup target add wasm32-unknown-unknown  # For future WASM support
```

### Verify Installation

```bash
rustc --version   # rustc 1.96.0-nightly (...)
cargo --version   # cargo 1.96.0-nightly (...)
```

### Additional Build Dependencies

| Dependency | Install Command | Purpose |
|------------|----------------|---------|
| protoc | `apt install protobuf-compiler` | Protocol Buffers (vProgs node) |
| clang | `apt install clang` | C/C++ compiler (ZK dependencies) |
| pkg-config | `apt install pkg-config` | Library discovery |
| libssl-dev | `apt install libssl-dev` | TLS support |

---

## Repository Structure

The vProgs ecosystem is a **layered Rust monorepo** where each crate has a single responsibility. Dependencies flow strictly downward.

```
vprogs/
  core/                     # Fundamental types, hashing, serialization
    src/
      types.rs              # Core data types (AccountId, StateRoot, Proof)
      hash.rs               # Blake3 hashing primitives
      serialization.rs      # Borsh serialization
  storage/                  # Database abstraction layer
    src/
      db.rs                 # Storage traits
      rocksdb_backend.rs    # RocksDB implementation
  state/                    # State management and Merkle trees
    src/
      merkle.rs             # Hierarchical Merkle commitments
      account.rs            # Account state model
      commitment.rs         # State commitment generation
  scheduling/               # Transaction ordering and scheduling
    src/
      scheduler.rs          # DAG-aware transaction scheduler
      lane.rs               # KIP-21 lane management
  transaction-runtime/      # Execution environment
    src/
      runtime.rs            # Transaction execution
      vm.rs                 # State transition validation
  node/                     # Full node binary
    src/
      main.rs               # Entry point
      rpc/                  # RPC server
      network/              # P2P networking
```

### Key Architecture Principles

- **Layered dependencies:** `core -> storage -> state -> scheduling -> transaction-runtime -> node`
- **No upward imports:** Lower layers never depend on higher layers
- **Single responsibility:** Each crate owns exactly one concern
- **Trait-based abstraction:** Storage, networking, and proving are abstracted behind traits

---

## IDE Setup

### VS Code (Recommended)

Install these extensions:

| Extension | ID | Purpose |
|-----------|----|---------|
| rust-analyzer | `rust-lang.rust-analyzer` | Rust language server (completions, diagnostics, navigation) |
| Even Better TOML | `tamasfe.even-better-toml` | Cargo.toml editing |
| CodeLLDB | `vadimcn.vscode-lldb` | Debugging Rust binaries |
| Error Lens | `usernamehw.errorlens` | Inline error display |

#### Workspace Settings

Create `.vscode/settings.json` in the vProgs repo root:

```json
{
    "rust-analyzer.cargo.features": "all",
    "rust-analyzer.check.command": "clippy",
    "rust-analyzer.procMacro.enable": true,
    "rust-analyzer.imports.granularity.group": "module",
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
}
```

#### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "lldb",
            "request": "launch",
            "name": "Run vProgs Node (simnet)",
            "cargo": {
                "args": ["build", "--bin=vprogs-node", "--package=vprogs-node"],
                "filter": { "name": "vprogs-node", "kind": "bin" }
            },
            "args": ["--simnet"],
            "cwd": "${workspaceFolder}"
        },
        {
            "type": "lldb",
            "request": "launch",
            "name": "Run Tests",
            "cargo": {
                "args": ["test", "--no-run", "--lib"],
                "filter": { "kind": "lib" }
            },
            "cwd": "${workspaceFolder}"
        }
    ]
}
```

### Silverscript Extension

[Coming Soon] A VS Code extension for Silverscript syntax highlighting and diagnostics is under development. Track progress in the Silverscript repo.

A DAP (Debug Adapter Protocol) debugger for Silverscript is in active development (see [Silverscript repo](https://github.com/kaspanet/silverscript)).

---

## Local Testnet Configuration

### Connecting to TN12

TN12 is the public Covenants++ testnet. See the [Testnet Guide](/build/testnet) for full details.

```bash
# Run a vProgs node connected to TN12
cargo run --release --bin vprogs-node -- --testnet
```

### Local Simnet

[Coming Soon] For isolated development, a local simnet mode is available:

```bash
# Start a local simnet node
cargo run --release --bin vprogs-node -- --simnet --listen 127.0.0.1:16111

# In another terminal, connect a second node
cargo run --release --bin vprogs-node -- --simnet --connect 127.0.0.1:16111
```

---

## Useful CLI Commands

### Cargo Commands

```bash
# Build the entire workspace
cargo build --release

# Build a specific crate
cargo build -p vprogs-core

# Run all tests
cargo test

# Run tests for a specific crate
cargo test -p vprogs-state

# Check for compilation errors without building
cargo check

# Format code
cargo fmt

# Run clippy lints
cargo clippy -- -D warnings

# Generate documentation
cargo doc --open
```

### Silverscript CLI

```bash
# Compile a Silverscript contract
silverscript compile contract.ss --output contract.script

# Compile with debug info
silverscript compile contract.ss --debug

# Check syntax without compiling
silverscript check contract.ss

# [Coming Soon] Deploy to testnet
silverscript deploy contract.script --network testnet
```

### Git Workflow

The vProgs repo uses a standard PR-based workflow:

```bash
# Create a feature branch
git checkout -b feature/my-covenant

# After making changes
cargo fmt && cargo clippy -- -D warnings && cargo test

# Push and create PR
git push -u origin feature/my-covenant
```

---

## Project Configuration Files

### rust-toolchain.toml

If not already present, create this in the repo root:

```toml
[toolchain]
channel = "nightly"
components = ["rustfmt", "clippy", "rust-src"]
```

### .cargo/config.toml

Useful build optimizations:

```toml
[build]
# Use all available CPU cores
jobs = 0

[target.x86_64-unknown-linux-gnu]
rustflags = ["-C", "target-cpu=native"]
```

---

## Next Steps

- **[Quickstart](/build/quickstart)** -- Build and run your first project
- **[Your First vProg](/build/tutorials/first-vprog)** -- Write a complete vProg
- **[Testnet Guide](/build/testnet)** -- Connect to TN12
- **[Developer Tools](/build/tools)** -- CLI tools and debugging utilities
