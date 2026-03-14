---
layout: page
title: "Covenant Stack"
description: "Understand Kaspa's covenant KIP stack from Crescendo through Covenants++ hard fork -- UTXO spending conditions that underpin Silverscript and vProgs."
section: architecture
---

Covenants are spending conditions that UTXOs carry forward. Instead of only checking *who* can spend a coin (via signature), a covenant enforces *how* the coin must be spent -- where funds go next, when they can move, and what the next transaction must look like. In Kaspa, covenants are the consensus layer that both [Silverscript](/architecture/silverscript) (local-state contracts) and vProgs (shared-state programs) build on top of.

This page covers the full KIP stack from the Crescendo foundation through the Covenants++ hard fork, the five milestones toward vProgs, and the current testing status on TN12.

---

## Two-Phase KIP Stack

Kaspa's covenant infrastructure is built across multiple KIPs, activated in two hard fork phases:

```
+-------------------------------------------------------------------+
|              COVENANTS++ HARD FORK -- May 5, 2026                  |
|   +------------+-------------+------------+--------------------+   |
|   | KIP-16     | KIP-17      | KIP-20     | KIP-21             |   |
|   | ZK verify  | Auth/Cov    | Covenant   | Lane SeqCommit     |   |
|   | opcodes    | opcodes     | IDs        |                    |   |
|   +------------+-------------+------------+--------------------+   |
+-------------------------------------------------------------------+
|              CRESCENDO HARD FORK -- Activated                      |
|   +------------+-------------+------------+--------------------+   |
|   | KIP-9      | KIP-10      | KIP-13     | KIP-15             |   |
|   | Storage    | Intro-      | Transient  | SeqCommit          |   |
|   | mass       | spection    | mass       | recurrence         |   |
|   +------------+-------------+------------+--------------------+   |
+-------------------------------------------------------------------+
|           Kaspa L1 BlockDAG (10 BPS) + DagKnight                   |
+-------------------------------------------------------------------+
```

---

## Phase 1: Crescendo Hard Fork (KIP-14) -- Activated

The Crescendo hard fork increased Kaspa from 1 BPS to 10 BPS and activated the foundational covenant KIPs:

| KIP | Title | What It Does |
|-----|-------|-------------|
| **KIP-9** | Extended Mass Formula | Mitigates UTXO state bloat via storage mass pricing. Transactions that create many small UTXOs pay proportionally higher fees. |
| **KIP-10** | Transaction Introspection Opcodes | Enables covenants -- scripts can inspect and enforce transaction structure. The bedrock of all covenant functionality. |
| **KIP-13** | Transient Storage Mass | Regulates short-term storage requirements. Complements KIP-9 for temporary state. |
| **KIP-15** | Sequencing Commitments | Recursive canonical transaction ordering. Renamed `AcceptedIDMerkleRoot` to `SequencingCommitment`. Foundation for L2 data availability. |

Crescendo also enabled **transaction payloads** for native (non-coinbase) transactions, allowing arbitrary data in the `payload` field -- the preliminary mechanism for L2 smart contract data availability.

---

## KIP-10: Transaction Introspection (The Foundation)

KIP-10 is the bedrock proposal -- it introduced the ability for Kaspa scripts to inspect the spending transaction. Without these introspection opcodes, no covenants are possible.

### Opcodes Introduced

**Transaction-level:**

| Opcode | Code | Returns |
|--------|------|---------|
| `OpTxInputCount` | `0xb3` | Total number of inputs |
| `OpTxOutputCount` | `0xb4` | Total number of outputs |
| `OpTxInputIndex` | `0xb9` | Index of current input being validated |

**Input/Output query:**

| Opcode | Code | Returns |
|--------|------|---------|
| `OpTxInputAmount` | `0xbe` | Amount of specified input (in sompis) |
| `OpTxInputSpk` | `0xbf` | Script public key of specified input |
| `OpTxOutputAmount` | `0xc2` | Amount of specified output |
| `OpTxOutputSpk` | `0xc3` | Script public key of specified output |

**Enhanced arithmetic:** 8-byte integer support (previously 4-byte), enabling precise financial calculations.

### What Introspection Enables

With introspection, a script can:

- Verify that outputs go to specific addresses
- Enforce minimum output amounts
- Require that change returns to the same contract
- Validate that transaction structure matches expected patterns

### Example: Threshold Covenant

A UTXO that can only be spent by adding value (threshold covenant):

```
OP_IF
   <owner_pubkey> OP_CHECKSIG
OP_ELSE
   // Verify output goes to same script address
   OP_TXINPUTINDEX OP_TXINPUTSPK
   OP_TXINPUTINDEX OP_TXOUTPUTSPK OP_EQUALVERIFY
   // Verify output value >= input value + threshold
   OP_TXINPUTINDEX OP_TXOUTPUTAMOUNT
   <threshold_value> OP_SUB
   OP_TXINPUTINDEX OP_TXINPUTAMOUNT
   OP_GREATERTHANOREQUAL
OP_ENDIF
```

---

## Phase 2: Covenants++ Hard Fork -- May 5, 2026

The upcoming hard fork extends covenants with four major KIPs:

### KIP-16: ZK Verification Opcodes

KIP-16 proposes the bridge between covenants and vProgs:

- Adds opcodes for verifying ZK validity proofs on L1
- External execution environments submit proofs; L1 validates cryptographically
- Supports Groth16 and RISC Zero STARK proof systems
- Combined with KIP-17, enables "ZK covenants" -- UTXOs whose spending conditions include ZK proof verification

See [ZK Verification](/architecture/zk-verification) for the full ZK stack architecture.

### KIP-17: Extended Covenant Opcodes

KIP-17 specifies the auth and covenant binding system that [Silverscript's](/architecture/silverscript) declaration macros compile to:

**Auth Binding (`OpAuth*`):**
- Per-input authorization
- Default for 1:N patterns (one input, multiple outputs)
- Tracks authorization groups per input

**Cov Binding (`OpCov*`):**
- Shared covenant context across multiple inputs
- Required for N:M patterns (multiple inputs and outputs)
- Covenant ID derived from `OpInputCovenantId`

**State Validation:**
- `validateOutputState(outputIndex, newState)` -- verifies that an output's `scriptPubKey` is P2SH paying to the same contract code with updated state
- `readInputState()` -- reconstructs prior state from transaction context

These opcodes make stateful UTXO contracts possible -- a covenant can carry state forward across transactions.

### KIP-20: Covenant IDs (Native Lineage)

Before KIP-20, proving that a UTXO descended from a specific covenant required recursive lineage proofs -- expensive and complex. KIP-20 proposes native covenant IDs at the protocol level:

- Each covenant UTXO carries an ID tracking its lineage
- The protocol enforces lineage without script-level recursion
- Enables `OpInputCovenantId` and `OpCovOutputCount`
- Critical for Silverscript's `groups = single` enforcement (ensuring a covenant has exactly one continuation)

### KIP-21: Partitioned Sequencing Commitment

KIP-21 proposes replacing the monolithic sequencing commitment with lane-based partitions:

- Each application lane maintains its own recursive tip hash
- Enables O(activity) ZK proving per application
- Forward-compatible with vProg lane families

See [L1 Sequencing (KIP-21)](/architecture/sequencing) for the full specification.

### Additional Covenants++ Features

The hard fork also introduces:

- **Native assets** -- first-class asset support on L1
- **CDAG** -- structured dependency tracking for vProgs
- **Miner payload commitments** -- coinbase payload data committed under `SeqCommit(B)`

---

## KIP-15 + KIP-21: Sequencing Commitment Evolution

The sequencing commitment has evolved across both hard forks:

**KIP-15 (Crescendo):** Introduced recursive sequencing commitments:

```
SeqCommit(B) = hash(SeqCommit(parent(B)), AcceptedIDMerkleRoot(B))
```

This secured transaction ordering for L2 use but was monolithic -- all transactions committed in one stream.

**KIP-21 (Covenants++):** Partitions the commitment into lanes, replacing the single `AcceptedIDMerkleRoot` with a layered structure:

```
SeqCommit(B) = H_seq(SeqCommit(parent(B)), SeqStateRoot(B))

SeqStateRoot(B) = H_seq(ActiveLanesRoot(B),
                        H_seq(MergesetContextHash(B),
                              MinerPayloadRoot(B)))
```

Together, these provide the **anchoring infrastructure** that ZK provers use to verify state transitions against L1.

---

## Five Milestones to vProgs

Michael Sutton's [Covenants++ milestones gist](https://gist.github.com/michaelsutton/5bd9ab358f692ee4f54ce2842a0815d1) outlines a phased path from covenants to full vProgs:

### Milestone 1: Inline ZK Covenant (WIP)

Users submit covenant actions with ZK proofs as unified units:

- State transition function `f(state, action) -> new_state` delegated to ZK prover
- State hashes opaque to L1 -- passed only to verification opcodes
- Challenge: blake2b is ZK-unfriendly; L1-side parent validation proposed for user proofs
- Uses Tier 1 ZK stack (Noir / Groth16)

### Milestone 2: Based ZK Covenant with Inefficient SeqCommit

Shift from inline to "based rollup" style:

- Users submit actions via payloads targeting specific programs
- Provers aggregate multiple user actions into single proofs
- Proving scales as O(global DAG activity) -- inefficient but functional
- Requires ZK-friendly Blake3 for seqcommit (adopted in KIP-21)
- `OpChainblockSeqCommit` opcode reads seqcommit from chain-block headers

### Milestone 3: Canonical Kaspa Bridge -- COMPLETE

The canonical bridge enables sovereign vProgs to settle on L1:

- Script engine access to Blake3-hash all transaction outputs for ZK public arguments
- Sovereign exit/settlement mechanism for standalone vProgs
- Solves the "many to const" bridging problem

**Status:** Completed February 19, 2026. Maxim Biryukov demonstrated a full ZK Covenant Rollup PoC including deposits via delegate script, L2 transfers, withdrawals via permission tree, both STARK and Groth16 proof generation + on-chain verification, sequence commitment chaining, sparse Merkle tree for L2 account state, and full on-chain script verification.

### Milestone 4: Native Asset Canonical Bridge

Extends the bridge to native assets:

- Requires Inter-Covenant Communication (ICC) protocol
- Async messaging between covenants (ZK covenant emits signals that asset covenants verify)
- Enables native asset deposits and withdrawals through the canonical bridge

### Milestone 5: Optimal SeqCommit (KIP-21)

Reduces proving from O(global activity) to O(vProg activity):

- Degenerate CD tracks program/subnet vertices instead of account-level fine-grained vertices
- This is what [KIP-21](/architecture/sequencing) delivers
- Enables the standalone vProgs deployment (Phase 1)

### Beyond the Milestones

**vProgs-Based Rollup (VBR):**
- Single ZK covenant on L1 represents entire VBR state
- Enables L2-internal synchronous composability
- Follows vProg programming model: global registration, account-based execution, read-write declarations
- Runtime: `hmoog/kas-l2` repository

**Full vProgs Specification (End Goal):**
- Synchronously composable sovereign vProgs
- Extended Computation DAG with per-account modeling
- CD-based scope gas calculations
- Global vProg state index
- Transaction v2 structure
- Data witness verification
- Global vProg code registry

---

## Milestone Progress Diagram

```
+-------------------------------------------------------------------+
|   Milestone 1: Inline ZK Covenant                    [WIP]         |
|   (User proves own transaction)                                    |
+-------------------------------------------------------------------+
                              |
+-------------------------------------------------------------------+
|   Milestone 2: Based ZK Covenant                     [WIP]         |
|   (Prover aggregates; O(DAG activity) proving)                     |
+-------------------------------------------------------------------+
                              |
+-------------------------------------------------------------------+
|   Milestone 3: Canonical Bridge                      [COMPLETE]    |
|   (KAS deposits/withdrawals via ZK proofs)                         |
|   Completed: Feb 19, 2026                                          |
+-------------------------------------------------------------------+
                              |
+-------------------------------------------------------------------+
|   Milestone 4: Native Asset Bridge                   [IN PROGRESS] |
|   (ICC protocol for native assets)                                 |
+-------------------------------------------------------------------+
                              |
+-------------------------------------------------------------------+
|   Milestone 5: Optimal SeqCommit (KIP-21)            [SPECIFIED]   |
|   (O(vProg activity) proving via lane partitions)                  |
+-------------------------------------------------------------------+
                              |
+-------------------------------------------------------------------+
|   vProgs-Based Rollup (VBR)                          [FUTURE]      |
|   (L2 syncompo via single ZK covenant)                             |
+-------------------------------------------------------------------+
                              |
+-------------------------------------------------------------------+
|   Full vProgs Specification                          [FUTURE]      |
|   (Syncompo, CD, registry, tx v2)                                  |
+-------------------------------------------------------------------+
```

---

## ZK Stack Selection

The ZK strategy was finalized in January 2026, establishing three tiers that map to the milestone progression:

| Tier | ZK Stack | Milestone | Proof Time |
|------|----------|-----------|------------|
| Inline ZK covenants | Noir / Groth16 | Milestone 1 | ~1s mobile |
| Based ZK apps | RISC Zero / SP1 | Milestone 2-5 | 10-30s |
| Based ZK rollups | Cairo | VBR+ | Longer |

**Key decisions:**
- **Noir for inline ZK:** Fast enough for per-transaction proving, even on mobile
- **Cairo for rollups:** Sierra bytecode provides provable metering and safety for user-submitted logic
- **BLAKE3 for commitments:** ~40% better than BLAKE2s in SP1/RISC Zero (the primary proving tier)

See [ZK Verification](/architecture/zk-verification) for full details.

---

## Testing: TN12

Testnet-12 is the experimental testnet for the Covenants++ hard fork.

### Timeline

| Event | Date |
|-------|------|
| TN12 launch | January 5, 2026 |
| TN12 reset (with new features) | February 9, 2026 |
| Covenants++ mainnet activation | May 5, 2026 |

### Features on TN12

The February 9 reset included:

- **Covenant IDs** (KIP-20) -- native lineage tracking
- **Blake3-based sequencing commitment** opcode (`OpChainblockSeqCommit`)
- **ZK verify precompiles + opcodes** for Groth16 and RISC Zero
- **KIP-17 covenant opcodes** (auth/cov binding)
- **Silverscript compiler** (experimental)
- **Native asset testing**

Opcode numbers agreed January 17, 2026: `0xcf-0xd3` for covenant ID ops, `0xd4` for seqcommit.

---

## How the Stack Fits Together

The complete architecture from base layer to application:

```
+-------------------------------------------------------------------+
|              Full vProgs (Syncompo, CD, Registry)                   |
|                        END GOAL                                    |
+-------------------------------------------------------------------+
|              vProgs-Based Rollup (VBR)                              |
|              (L2 syncompo via single ZK covenant)                  |
+-------------------------------------------------------------------+
|    Milestone 5           |    Milestone 3-4                        |
|    KIP-21 Optimal        |    Canonical Bridge                     |
|    SeqCommit             |    (KAS + Native Assets)                |
+-------------------------------------------------------------------+
|    Milestone 2: Based ZK Covenant                                  |
|    (Provers aggregate; O(DAG activity) proving)                    |
+-------------------------------------------------------------------+
|    Milestone 1: Inline ZK Covenant                                 |
|    (User submits proof + action as one unit)                       |
+-------------------------------------------------------------------+
|                COVENANTS++ HARD FORK -- May 5, 2026                |
|   +------------+-------------+------------+--------------------+   |
|   | KIP-16     | KIP-17      | KIP-20     | KIP-21             |   |
|   | ZK verify  | Auth/Cov    | Covenant   | Lane SeqCommit     |   |
|   | opcodes    | opcodes     | IDs        |                    |   |
|   +------------+-------------+------------+--------------------+   |
+-------------------------------------------------------------------+
|    Silverscript (compiles to KIP-10/17/20 covenant scripts)        |
+-------------------------------------------------------------------+
|                CRESCENDO HARD FORK -- Activated                    |
|   +------------+-------------+------------+--------------------+   |
|   | KIP-9      | KIP-10      | KIP-13     | KIP-15             |   |
|   | Storage    | Intro-      | Transient  | SeqCommit          |   |
|   | mass       | spection    | mass       | recurrence         |   |
|   +------------+-------------+------------+--------------------+   |
+-------------------------------------------------------------------+
|           Kaspa L1 BlockDAG (10 BPS) + DagKnight                   |
+-------------------------------------------------------------------+
```

---

## Further Reading

- [Architecture Overview](/architecture/overview) -- how the covenant stack fits the four-pillar architecture
- [Silverscript](/architecture/silverscript) -- the language that compiles to covenant scripts
- [ZK Verification](/architecture/zk-verification) -- KIP-16 verifier opcodes
- [L1 Sequencing (KIP-21)](/architecture/sequencing) -- partitioned sequencing commitment
- [Covenant++ Milestones (Sutton gist)](https://gist.github.com/michaelsutton/5bd9ab358f692ee4f54ce2842a0815d1)
- [KIP-14: Crescendo Hardfork](https://github.com/kaspanet/kips/blob/master/kip-0014.md)
- [KIP-10: Transaction Introspection](https://github.com/kaspanet/kips/blob/master/kip-0010.md)
- [ZK Rollup PoC (Biryukov)](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example)
