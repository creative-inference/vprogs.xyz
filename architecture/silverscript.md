---
layout: page
title: "Silverscript"
description: "Learn about Silverscript, Kaspa's high-level smart contract language that compiles to native script -- handling local-state UTXO covenants alongside vProgs."
section: architecture
---

Silverscript is Kaspa's first high-level smart contract language and compiler. It compiles directly to native Kaspa Script -- no virtual machine, no intermediate representation. Designed by Ori Newman, it draws inspiration from CashScript (Bitcoin Cash) but adds loops, arrays, function calls, and a covenant declaration system. Silverscript is a complement and infrastructure layer for vProgs, handling local-state UTXO contracts while vProgs handle shared-state sovereign programs.

---

## Relationship to vProgs

This is the critical architectural distinction:

| | Silverscript | vProgs |
|---|---|---|
| **State model** | Local state (UTXO) | Shared state (accounts) |
| **Execution** | On-chain (L1 script validation) | Off-chain ([ZK proof verification](/architecture/zk-verification)) |
| **Scope** | Covenant spending conditions | Sovereign state machines |
| **Composability** | Transaction-level (inputs/outputs) | Cross-program atomic ([syncompo](/architecture/composability)) |
| **Compilation target** | Native Kaspa Script | ZK circuits (future) |

Silverscript and vProgs are **not competing** -- they occupy complementary roles in Kaspa's two-layer programmability model:

1. **Silverscript** handles **local-state contracts** -- enforcing spending conditions on individual UTXOs (vaults, multi-sig, time-locks, recurring payments, native assets)
2. **vProgs** handle **shared-state programs** -- sovereign execution environments with account-based state, settled via ZK proofs

```
+-------------------------------------------------------------------+
|                    vProgs Application Layer                         |
|              (DeFi protocols, DAOs -- FUTURE)                     |
+-------------------------------------------------------------------+
|              Synchronous Composability (Syncompo)                  |
|         (Cross-vProg atomicity -- FUTURE)                         |
+-------------------------------------------------------------------+
|    Silverscript                  |    CD Lane Update Rules          |
|    (Local state / UTXO           |    (Shared state / accounts     |
|     covenants -- ACTIVE)         |     via vProgs -- FUTURE)       |
+-------------------------------------------------------------------+
|           KIP-21: Partitioned Sequencing Commitment                |
|           (Lane-based commitments -- SPECIFIED)                    |
+-------------------------------------------------------------------+
|        Covenants++ (KIP-16, KIP-17, KIP-20)                       |
|        (Covenant IDs, opcodes -- ON TN12)                          |
+-------------------------------------------------------------------+
|           Kaspa L1 BlockDAG + DagKnight Consensus                  |
+-------------------------------------------------------------------+
```

In practice, a mature Kaspa dApp will likely use both:
- Silverscript for asset issuance, custody rules, time-locks, multi-sig
- vProgs for complex protocol logic, cross-program composability, DeFi engines

---

## Language Overview

### Repository and Status

| Property | Value |
|----------|-------|
| **Repository** | [github.com/kaspanet/silverscript](https://github.com/kaspanet/silverscript) |
| **Status** | Experimental, Testnet-12 only (as of March 2026) |
| **Language** | Rust (90.8%), with WASM support planned |
| **License** | ISC (permissive) |

### Contract Structure

Every Silverscript program defines a single contract with constructor parameters and entrypoint functions:

```
pragma silverscript ^0.1.0;

contract Vault(pubkey owner, int lockTime) {
    entrypoint function spend(sig ownerSig) {
        require(checkSig(ownerSig, owner));
        require(this.age >= lockTime);
    }
}
```

The `pragma` declaration specifies the compiler version. Constructor parameters (`owner`, `lockTime`) are baked into the compiled script at deployment time. Entrypoint functions define the ways the contract can be interacted with.

---

## Data Types

### Scalar Types

| Type | Size | Description |
|------|------|-------------|
| `int` | 64-bit signed | Numeric values, arithmetic |
| `bool` | 1 bit | Boolean logic |
| `string` | Variable | Text data |
| `byte` | 8 bits | Raw byte data |

### Cryptographic Types

| Type | Size | Description |
|------|------|-------------|
| `pubkey` | 32 bytes | Public key for signature verification |
| `sig` | 65 bytes | Schnorr signature |
| `datasig` | 64 bytes | Data signature (without sighash byte) |

### Collection Types

| Syntax | Description |
|--------|-------------|
| `type[]` | Dynamic-length array |
| `type[N]` | Fixed-size array (N known at compile time) |

### Unit Literals

**Value units:** `litras`, `grains`, `kas`
**Time units:** `seconds`, `minutes`, `hours`, `days`, `weeks`

Units provide human-readable syntax for common constants:
```
require(tx.outputs[0].value >= 10 kas);
require(this.age >= 7 days);
```

---

## Transaction Introspection API

Silverscript contracts can inspect the spending transaction via a built-in API that compiles to [KIP-10](/architecture/covenants) opcodes:

### Transaction Object

| Property | Returns | Underlying Opcode |
|----------|---------|-------------------|
| `tx.inputs.length` | Number of inputs | `OpTxInputCount` |
| `tx.outputs.length` | Number of outputs | `OpTxOutputCount` |
| `tx.inputs[i].value` | Input amount (sompis) | `OpTxInputAmount` |
| `tx.inputs[i].scriptPubKey` | Input script | `OpTxInputSpk` |
| `tx.outputs[i].value` | Output amount (sompis) | `OpTxOutputAmount` |
| `tx.outputs[i].scriptPubKey` | Output script | `OpTxOutputSpk` |

### Contract Context

| Property | Returns | Description |
|----------|---------|-------------|
| `this.activeInputIndex` | Current input index | Which input is being validated |
| `this.activeScriptPubKey` | Current script | The script being executed |
| `this.age` | UTXO age (seconds) | Time since UTXO was created |

### Example: Enforcing Output Destination

```
contract PaymentSplitter(pubkey alice, pubkey bob, int splitRatio) {
    entrypoint function split(sig aliceSig) {
        require(checkSig(aliceSig, alice));

        int total = tx.inputs[this.activeInputIndex].value;
        int aliceShare = total * splitRatio / 100;
        int bobShare = total - aliceShare;

        require(tx.outputs[0].value >= aliceShare);
        require(tx.outputs[1].value >= bobShare);
    }
}
```

---

## Cryptographic Primitives

| Function | Description | Use Case |
|----------|-------------|----------|
| `blake2b(data)` | BLAKE2b hash (native to Kaspa) | General hashing, commitments |
| `sha256(data)` | SHA-256 hash | Cross-chain compatibility |
| `checkSig(signature, publicKey)` | Schnorr signature verification | Authorization |

### Example: Hash-Locked Contract

```
contract HashLock(bytes32 secretHash, pubkey recipient) {
    entrypoint function claim(sig recipientSig, bytes32 secret) {
        require(checkSig(recipientSig, recipient));
        require(blake2b(secret) == secretHash);
    }
}
```

---

## Control Flow

### Conditionals

```
if (condition) {
    // true branch
} else {
    // false branch
}
```

### Assertions

```
require(condition);  // fails contract (and transaction) if false
```

### Loops

```
for (i, start, end, MAX_ITERATIONS) {
    // body executes (end - start) times
    // MAX_ITERATIONS is a compile-time bound for script unrolling
}
```

Loops are **unrolled at compile time** -- the MAX_ITERATIONS parameter sets the upper bound on how many iterations the compiler will generate. This ensures scripts have bounded execution time (no halting problem).

---

## Covenant Declaration System

The most powerful Silverscript feature is its **covenant declaration macro system**. Macros generate correct covenant entrypoints automatically, enforcing security-by-construction.

### Declaration Patterns

| Pattern | Syntax | Description | Use Case |
|---------|--------|-------------|----------|
| 1:1 transition | `#[covenant.singleton(mode = transition)]` | Single input, single output, computes new state | Counter, vault state update |
| 1:N verification | `#[covenant(from = 1, to = N)]` | Single input, multiple outputs, validates split | Token distribution, fan-out |
| N:M verification | `#[covenant(from = N, to = M)]` | Multiple inputs/outputs, validates transition | Merges, swaps, batch ops |
| N:M transition | `#[covenant(from = N, to = M, mode = transition)]` | Multiple inputs/outputs, computes new states | Complex multi-party flows |

### Verification vs. Transition Mode

**Verification mode:** The developer validates that proposed outputs are correct. The function receives the proposed new states and returns true/false.

```
#[covenant(from = 1, to = N)]
function split(State prev_state, State[] new_states, sig[] approvals) {
    // Developer checks: are these new_states valid given prev_state?
    int total = 0;
    for (i, 0, new_states.length, 10) {
        total = total + new_states[i].balance;
    }
    require(total == prev_state.balance);
}
```

**Transition mode:** The developer computes what the outputs should be. The compiler generates the validation code.

```
#[covenant.singleton(mode = transition)]
function bump(State prev_state, int delta) : (State new_state) {
    // Developer computes: what should the new state be?
    return State { counter: prev_state.counter + delta };
}
```

Transition mode is safer -- the compiler guarantees that the output matches the computed state, eliminating a class of bugs where developers forget to validate a field.

### Binding Modes

Binding modes determine how covenant context is tracked across inputs:

**Auth binding (`OpAuth*`):**
- Per-input authorization
- Default for 1:N patterns (one input, multiple outputs)
- Each input tracks its own authorization group
- Compiles to KIP-17 `OpAuth*` opcodes

**Cov binding (`OpCov*`):**
- Shared covenant context across multiple inputs
- Required for N:M patterns (multiple inputs and outputs)
- Covenant ID derived from `OpInputCovenantId` (KIP-20)
- Compiles to KIP-17 `OpCov*` opcodes

### Security by Construction

The compiler generates boilerplate for:

- **Prior state reconstruction** from transaction context
- **Output cardinality enforcement** (exactly the right number of outputs)
- **State validation** via `validateOutputState()` (KIP-17)
- **Covenant ID and lineage checks** (KIP-20)
- **Groups enforcement** (ensuring a covenant has exactly one continuation when `groups = single`)

This means security-by-construction -- the compiler enforces correct covenant patterns, preventing classes of bugs that manual script writing would introduce.

---

## The Covenant Foundation

Silverscript is built on top of Kaspa's [Covenants++](/architecture/covenants) hard fork, the same consensus infrastructure that KIP-21 proposes extending for vProgs:

```
Silverscript Source Code
         |
         | Compiler
         v
Native Kaspa Script
  (KIP-10 introspection opcodes)
  (KIP-17 auth/cov binding opcodes)
  (KIP-20 covenant ID opcodes)
         |
         | Execution
         v
Kaspa L1 Script Engine
```

The compiler abstracts the raw opcode complexity behind a high-level declaration system. Developers write policy functions instead of fighting raw opcodes.

---

## Local State Security Model

Silverscript's UTXO-local state model provides inherent security properties that contrast with EVM-style shared-state contracts:

| Property | Silverscript (UTXO) | EVM (Shared State) |
|----------|---------------------|-------------------|
| Reentrancy | Impossible -- each UTXO consumed exactly once | Systemic risk |
| Gas wars | No -- validation is deterministic and bounded | Common |
| State transitions | Explicit, compiler-enforced | Implicit, developer responsibility |
| Lineage | Native via KIP-20 Covenant IDs | No native equivalent |
| Storage collisions | Impossible -- no shared storage | Systemic risk |

---

## What You Can Build Today

Silverscript is usable now on TN12. Contracts you can write today:

### 1. Vaults

Time-locked custody with owner signatures:

```
contract Vault(pubkey owner, int lockDays) {
    entrypoint function spend(sig ownerSig) {
        require(checkSig(ownerSig, owner));
        require(this.age >= lockDays * 1 days);
    }
}
```

### 2. Multi-Sig Wallets

M-of-N signature schemes for shared custody.

### 3. Recurring Payments (Mecenas Pattern)

Periodic payout enforcement -- a UTXO that allows periodic withdrawals up to a limit.

### 4. Native Asset Rules

Issuance, transfer, and burn conditions for Kaspa native assets.

### 5. Escrow

Conditional release based on signatures, time, or hash conditions.

### 6. Auction Contracts

Bid/settle mechanics with state transitions tracking the current highest bid.

These covenant-level primitives will become the **infrastructure layer** that vProgs interact with once the CD specification lands.

---

## Timeline

| Milestone | Status | Date |
|-----------|--------|------|
| Silverscript experimental release | Live on TN12 | February 2026 |
| Covenants++ hard fork (mainnet) | Scheduled | May 5, 2026 |
| Silverscript mainnet readiness | Depends on hard fork | May 2026+ |
| WASM compilation support | Planned | TBD |
| vProgs CD specification | In progress | TBD |

---

## How Silverscript and vProgs Will Compose

In the mature Kaspa ecosystem, Silverscript and vProgs will work together:

```
Example: Token issuance + DeFi protocol

Silverscript covenant:
  - Defines token issuance rules (mint cap, burn conditions)
  - Enforces transfer constraints (KYC whitelist, time-locks)
  - Manages UTXO-level custody (multi-sig, vaults)

vProg:
  - Implements DEX order book logic
  - Manages liquidity pool state
  - Executes swaps with ZK-verified pricing
  - Composes with other vProgs atomically

Integration:
  - Silverscript native asset covenant issues tokens
  - Tokens enter vProg DEX via canonical bridge
  - DEX vProg composably interacts with lending vProg
  - Settlement flows back through covenant layer
```

The covenant layer manages the "plumbing" (asset rules, custody, spending conditions) while the vProg layer manages the "logic" (protocol mechanics, cross-program composition, complex state machines).

---

## Further Reading

- [Covenant Stack](/architecture/covenants) -- the KIP infrastructure Silverscript compiles to
- [Architecture Overview](/architecture/overview) -- how Silverscript fits in the vProgs architecture
- [ZK Verification](/architecture/zk-verification) -- the ZK layer that vProgs use (complementary to Silverscript)
- [L1 Sequencing (KIP-21)](/architecture/sequencing) -- the sequencing layer both systems share
- [Silverscript GitHub](https://github.com/kaspanet/silverscript)
- [Hail The Silverscript -- KasMedia](https://kasmedia.com/article/hail-the-silverscript)
