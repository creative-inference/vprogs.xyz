---
layout: page
title: "ZK Verification"
section: architecture
---

Zero-knowledge proofs are the trust anchor of the vProgs architecture. Instead of re-executing computation on L1, nodes validate a compact cryptographic proof that computation was performed correctly. This page covers the three-tier ZK stack, KIP-16 verifier opcodes, and the full proof lifecycle from generation through finalization.

---

## Why ZK Verification

In traditional smart contract platforms (e.g., EVM), every full node re-executes every transaction to verify correctness. This creates a fundamental bottleneck: throughput is limited by what a single node can execute.

vProgs eliminate this bottleneck:

```
Traditional (EVM):                    vProgs:
  User submits tx                      User submits tx
  Every node re-executes               Off-chain prover executes
  N nodes * M computation              1 prover * M computation
  = N*M total work                     + N nodes * O(1) verification
                                       = M + N total work
```

ZK verification reduces L1 verification to **constant time** regardless of the computation's complexity. A proof attesting to a million state transitions is verified in the same time as a proof for a single transition.

---

## Three-Tier ZK Stack

The ZK strategy was finalized by Yonatan Sompolinsky in January 2026, establishing three tiers optimized for different use cases:

### Tier 1: Inline ZK Covenants (Noir / Groth16)

| Property | Value |
|----------|-------|
| **ZK Stack** | Noir circuits, Groth16 proofs |
| **Proof Time** | ~1 second on mobile, ~6 seconds on mobile web |
| **Use Case** | Small contracts, wallets, per-transaction proving |
| **Proving Model** | User proves their own transaction inline |

Inline ZK covenants are the lightest tier. The user generates a proof for their specific transaction and submits it as part of the transaction. No aggregation, no prover market -- the user is the prover.

**Ideal for:** Signature schemes, time-locks, simple spending conditions, wallet-level ZK proofs.

### Tier 2: Based ZK Applications (RISC Zero / SP1)

| Property | Value |
|----------|-------|
| **ZK Stack** | RISC Zero or SP1 (general-purpose zkVMs) |
| **Proof Time** | 10-30 seconds |
| **Use Case** | Regular large applications, aggregated proving |
| **Proving Model** | Permissionless prover market aggregates multiple transactions |

Based ZK applications are the standard vProgs tier. External provers aggregate multiple user transactions into a single proof, amortizing the proving cost across many operations.

**Ideal for:** DeFi protocols, token systems, DAOs, any application with steady transaction flow.

### Tier 3: Based ZK Rollups (Cairo)

| Property | Value |
|----------|-------|
| **ZK Stack** | Cairo (Sierra bytecode) |
| **Proof Time** | Longer (varies by complexity) |
| **Use Case** | Meta-applications with user-defined logic |
| **Proving Model** | Rollup prover processes arbitrary user-submitted programs |

Based ZK rollups handle the most complex case: applications where users themselves submit arbitrary logic (e.g., a DEX where users define custom trading strategies). Cairo's Sierra bytecode uniquely provides **provable metering and safety** -- the rollup can guarantee that user-submitted code terminates and consumes bounded resources.

**Ideal for:** General-purpose programmable environments, user-defined smart contracts within a vProg.

### Stack Selection Rationale

```
                    Complexity / Flexibility
                    ========================>

  Tier 1 (Noir)          Tier 2 (RISC Zero/SP1)      Tier 3 (Cairo)
  +-----------+          +------------------+         +------------+
  | Fast      |          | General-purpose  |         | Arbitrary  |
  | Simple    |          | Aggregated       |         | User logic |
  | Per-user  |          | Prover market    |         | Metered    |
  +-----------+          +------------------+         +------------+
  ~1s mobile             10-30s                       Longer
  Per-txn                Per-batch                    Per-epoch
```

**Key design decisions:**

- **Noir for inline ZK:** Fast enough for per-transaction proving, even on mobile devices
- **Cairo for rollups:** Sierra bytecode uniquely provides provable metering and safety -- essential for meta-apps where users submit arbitrary logic
- **BLAKE3 over BLAKE2s:** BLAKE3 is ~10x more costly in Cairo (BLAKE2s has a precompile), but ~40% better in SP1/RISC Zero. Since Tier 2 is the primary tier, BLAKE3 was chosen for KIP-21's hash functions

---

## KIP-16: ZK Verifier Opcodes

KIP-16 specifies the consensus-level bridge between covenants and vProgs, proposing opcodes for Kaspa's script engine that verify ZK validity proofs directly on L1.

### What KIP-16 Enables

- L1 script can verify zero-knowledge validity proofs from external execution environments
- Combined with KIP-17 covenant opcodes, enables "ZK covenants" -- UTXOs whose spending conditions include ZK proof verification
- External provers submit proofs; L1 validates cryptographically without re-execution
- Supports both Groth16 (Tier 1) and RISC Zero STARK (Tier 2) proof systems

### ZK Covenant Pattern

A ZK covenant combines KIP-16 verification with KIP-17 state management:

```
ZK Covenant UTXO:
  spending conditions:
    1. Provide a valid ZK proof (KIP-16 verification)
    2. Proof attests to state transition f(old_state, action) -> new_state
    3. Output must carry new_state (KIP-17 state validation)
    4. Covenant ID must be preserved (KIP-20 lineage)
```

This pattern is the building block for all vProg-L1 interaction.

### Proof Verification on TN12

Testnet-12 (reset February 9, 2026) includes ZK verify precompiles and opcodes for:

- **Groth16 proofs** -- fast, small proofs for inline ZK covenants
- **RISC Zero STARKs** -- general-purpose proofs for based ZK applications

---

## Proof Lifecycle

### Generation

The proof lifecycle begins with off-chain execution:

```
+-----------------+
| vProg State     |     1. Load current account states
| (accounts S_p)  |        from read set r(x)
+-----------------+
        |
        v
+-----------------+
| Execute Logic   |     2. Run vProg state transition function
| f(state, action)|        deterministically
+-----------------+
        |
        v
+-----------------+
| Execution Trace |     3. Record full execution trace
| (witness data)  |        for proof generation
+-----------------+
        |
        v
+-----------------+
| ZK Circuit      |     4. Compile trace into ZK circuit
| Compilation     |        (Noir, SP1/RiscZero, or Cairo)
+-----------------+
        |
        v
+-----------------+
| Proof Object    |     5. Generate proof object z_p^i:
| z_p^i           |        - ZK proof pi
|                 |        - State commitment C_p^t
|                 |        - Time reference t
+-----------------+
```

### State Commitment Structure

The state commitment `C_p^t` within the proof object is a hierarchical Merkle root:

```
C_p^t = MerkleRoot(
  state_root_step_1,    <-- state of all accounts after step 1
  state_root_step_2,    <-- state of all accounts after step 2
  ...
  state_root_step_n     <-- state of all accounts after step n
)
```

This structure enables **concise witnesses**: compact Merkle inclusion proofs of any account state at any intermediate step. Concise witnesses are the mechanism enabling [synchronous composability](/architecture/composability).

### Submission

The proof is submitted to L1 via a transaction targeting the vProg's L1 covenant:

1. Transaction includes the proof object in its payload
2. L1 script engine activates KIP-16 verifier opcodes
3. Proof is verified against the claimed state commitment
4. Sequencing commitment is updated via [KIP-21](/architecture/sequencing)

### Anchoring

Once verified, the proof creates a **trusted anchor point**:

```
Unproven state chain:
  s1 -> s2 -> s3 -> s4 -> s5 -> s6 -> s7

After proof anchors at s4:
  [proven: s1..s4] -> s5 -> s6 -> s7
       ^
       |
  Anchor point -- all state up to s4
  is cryptographically guaranteed.
  Future proofs only need scope from s4 onward.
```

Anchoring enables:
- **Scope reduction** for future proofs
- **State pruning** of pre-anchor history
- **Witness compression** -- the anchor state commitment replaces detailed history

### Finalization

The proof transaction is ordered by [DagKnight consensus](/architecture/dagknight) and achieves instant finality. Once finalized:

- The state commitment is authoritative
- The lane tip hash in [KIP-21](/architecture/sequencing) is updated
- Other vProgs can reference the proven state via concise witnesses

---

## Proof Aggregation

For Tier 2 and Tier 3, provers aggregate multiple transactions into a single proof:

```
User tx_1 ----+
User tx_2 ----+----> Prover aggregates ----> Single ZK proof
User tx_3 ----+      N transitions             submitted to L1
User tx_4 ----+
```

### Aggregation Benefits

- **Amortized verification cost:** L1 verifies one proof for N transactions
- **Reduced on-chain footprint:** One proof per batch instead of one per transaction
- **Prover efficiency:** Larger batches amortize fixed proving overhead
- **User cost reduction:** Verification gas is shared across batch participants

### Proof Stitching

For cross-vProg atomic transactions, proofs from multiple vProgs can be "stitched" together:

```
vProg A proof: states sA_1 -> sA_2 (reads sB from vProg B)
vProg B proof: states sB_1 -> sB_2

Stitched proof: atomically verifies both transitions
  + cross-references sB state via concise witness
```

Proof stitching is a Phase 2 capability, dependent on the full [synchronous composability](/architecture/composability) specification.

---

## Verification Cost Model

ZK verification on L1 is designed to be lightweight:

| Operation | Cost | Notes |
|-----------|------|-------|
| Groth16 verification | ~constant | Small proof, fast verification |
| RISC Zero STARK verification | ~constant | Larger proof, still fast verification |
| State commitment check | O(1) | Hash comparison |
| Lane tip update (KIP-21) | O(1) | Single hash computation |
| SMT inclusion proof | O(log N) | Logarithmic in active lanes |

The total verification cost is independent of the complexity of the proven computation. A proof covering a million state transitions costs the same to verify as a proof covering ten.

---

## Security Properties

### Soundness

A valid ZK proof guarantees that the claimed state transition was computed correctly. There is no trust assumption on the prover -- even a malicious prover cannot produce a valid proof for an incorrect transition.

### Zero-Knowledge

The proof reveals nothing about the execution beyond the public inputs (old state commitment, new state commitment, anchoring data). Internal computation details, intermediate states, and private inputs remain hidden.

### Non-Interactivity

All proof systems used (Groth16, RISC Zero STARKs, Cairo proofs) produce non-interactive proofs. The prover generates the proof independently; no interaction with the verifier is required.

### Finality Guarantees

Unlike optimistic rollups (which require challenge periods), ZK proofs provide **immediate finality**. Once the proof is verified and the transaction is ordered by DagKnight, the state transition is final -- no dispute window, no challenge games.

---

## Hash Function Selection

KIP-21 specifies BLAKE3 with explicit domain separation tags for all cryptographic hashing. The selection involved tradeoffs across ZK stacks:

| Hash | Cairo (Tier 3) | SP1/RISC Zero (Tier 2) | Decision |
|------|---------------|----------------------|----------|
| BLAKE2s | Precompile available (fast) | No precompile | Not chosen |
| BLAKE3 | ~10x more costly than BLAKE2s | ~40% better than BLAKE2s | **Chosen** |

Since Tier 2 (RISC Zero/SP1) is the primary proving tier for most applications, BLAKE3's superior performance in those stacks outweighed its higher cost in Cairo.

---

## Further Reading

- [Execution Model](/architecture/execution-model) -- the off-chain execution that produces proofs
- [L1 Sequencing (KIP-21)](/architecture/sequencing) -- how proofs anchor into the commitment chain
- [Covenant Stack](/architecture/covenants) -- the KIP infrastructure including KIP-16
- [Synchronous Composability](/architecture/composability) -- proof stitching and cross-vProg atomicity
- [KIP-16 specification](https://github.com/kaspanet/kips) -- verifier opcode details
