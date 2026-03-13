---
layout: page
title: "Proving Systems Analysis"
section: research
---

This document evaluates the zero-knowledge proving systems selected for Kaspa's three-tier ZK strategy. The analysis covers Noir, RISC Zero, SP1, and Cairo, examining proof times, circuit characteristics, aggregation strategies, and hash function tradeoffs. The tier assignments were finalized by Yonatan Sompolinsky (hashdag) in January 2026 and validated through subsequent PoC implementations.

---

## Three-Tier ZK Strategy

The vProgs architecture does not use a single proving system. Instead, it assigns different ZK stacks to different use cases based on their performance characteristics, trust assumptions, and suitability for the workload:

| Tier | Use case | ZK stack | Proof time | Proof size | Key property |
|------|----------|----------|------------|------------|-------------|
| **Tier 1: Inline ZK covenants** | Small contracts, wallets | Noir / Groth16 | ~1s mobile, ~6s mobile web | 10--20 KB (Noir), ~200 bytes (Groth16) | Per-transaction proving |
| **Tier 2: Based ZK apps** | Regular large applications | RISC Zero / SP1 | 10--30s | Variable (STARK) | Aggregated proving |
| **Tier 3: Based ZK rollups** | Meta-apps with user-defined logic | Cairo | Longer | Variable (STARK) | Provable metering and safety |

The tiers are not hierarchical in a quality sense --- each tier optimizes for different constraints. Tier selection depends on the application's requirements, not its importance.

---

## Tier 1: Noir and Groth16

### Noir

Noir is Aztec's domain-specific language for writing ZK circuits. It compiles to an intermediate representation (ACIR) that can target multiple backends.

**Why Noir for inline ZK:**

- **Mobile-grade performance.** Proof generation completes in approximately 1 second on mobile hardware and approximately 6 seconds in mobile web browsers. This is fast enough for per-transaction proving, where the user generates a proof as part of submitting each transaction.
- **Developer ergonomics.** Noir provides a Rust-like syntax that is substantially more accessible than raw circuit writing. This matters for Tier 1 because inline covenants will be written by a broad developer audience, not just ZK specialists.
- **Compact proofs.** Noir proofs are 10--20 KB, small enough for L1 inclusion without excessive storage mass.

**Limitations:**

- Circuit expressiveness is bounded by the ACIR target --- complex general-purpose computation may exceed practical circuit sizes
- Not suitable for applications requiring user-submitted arbitrary logic (that is Cairo's role)

### Groth16

Groth16 is a pairing-based SNARK with constant-size proofs (~200 bytes) and fast verification. It is used as an alternative backend for inline covenants where proof size minimization is critical.

**Tradeoffs vs. Noir native proofs:**

| Property | Noir (native) | Groth16 |
|----------|--------------|---------|
| Proof size | 10--20 KB | ~200 bytes |
| Verification time | Moderate | Very fast (constant) |
| Trusted setup | No | Yes (per-circuit) |
| Flexibility | Circuit updates easy | New setup per circuit change |

Groth16 is appropriate for stable, well-audited covenant contracts that will not change frequently. Noir's native backend is better for contracts under active development.

### Milestone 1 Integration

Inline ZK covenants (Milestone 1 on the Covenants++ roadmap) are the first ZK capability activated. Users submit covenant actions with ZK proofs as unified units:

- State transition function `f(state, action) -> new_state` is delegated to the ZK prover
- State hashes are opaque to L1 --- passed only to verification opcodes (KIP-16)
- L1 validates the proof without re-executing the computation

**Challenge identified:** BLAKE2b (Kaspa's native hash) is ZK-unfriendly. The mitigation is L1-side parent validation for user proofs, avoiding the need to prove BLAKE2b hashing inside the circuit.

---

## Tier 2: RISC Zero and SP1

### RISC Zero

RISC Zero provides a zkVM that executes standard RISC-V binaries and generates STARK proofs of correct execution. It is the primary Tier 2 proving system.

**Key properties:**

- **General-purpose execution.** Any Rust program that compiles to RISC-V can be proven. No circuit-specific development required.
- **STARK-based proofs.** No trusted setup. Proofs are larger than Groth16 but rely only on hash function security assumptions.
- **Proof aggregation.** RISC Zero supports recursive proof composition, enabling multiple execution traces to be aggregated into a single proof.
- **Precompile ecosystem.** RISC Zero provides hardware-accelerated precompiles for common cryptographic operations, including SHA-256, ECDSA verification, and critically for Kaspa, BLAKE2.

**Proof characteristics:**

| Metric | Typical value |
|--------|--------------|
| Proof generation time | 10--30 seconds (server hardware) |
| Proof size | ~200 KB (STARK), reducible via Groth16 wrapping |
| Verification cost | Moderate (STARK verification opcode on L1 via KIP-16) |
| Memory requirements | High (prover needs substantial RAM) |

**Demonstrated capability:** The ZK Covenant Rollup PoC (Milestone 3, completed February 2026 by Maxim Biryukov) used RISC Zero to prove a full deposit-transfer-withdraw cycle, including:

- Sparse Merkle Tree state transitions
- Sequence commitment chaining of L1 block data
- Both STARK (succinct) and Groth16-wrapped proof generation
- Full on-chain verification through kaspa-txscript

### SP1

SP1 (Succinct Processor 1) is Succinct Labs' zkVM, also targeting RISC-V execution with STARK proofs.

**Why SP1 as an alternative to RISC Zero:**

- **Performance competition.** SP1 and RISC Zero compete on proving speed, and the competitive pressure benefits the ecosystem
- **Different optimization tradeoffs.** SP1 uses different internal STARK arithmetization that may be faster for certain workloads
- **Native assets PoC.** Ori Newman (someone235) built the native assets ZK PoC using SP1, demonstrating its viability for Kaspa-specific workloads

**SP1 vs. RISC Zero comparison:**

| Property | RISC Zero | SP1 |
|----------|----------|-----|
| Architecture | RISC-V zkVM | RISC-V zkVM |
| Proof system | STARK | STARK |
| Precompiles | Extensive | Growing |
| Kaspa PoC usage | ZK Covenant Rollup | Native Assets |
| Maturity | More established | Newer, rapidly evolving |

Both are suitable for Tier 2. The choice between them is application-specific, and the KIP-16 verification opcodes support both.

### Milestone 2--3 Integration

Based ZK apps (Milestones 2--3) shift from inline to aggregated proving:

- Users submit actions via L1 transaction payloads targeting specific programs
- Provers aggregate multiple transactions into a single proof
- Proof covers all state transitions within an epoch
- Sequence commitment opcode (`OpChainblockSeqCommit`) anchors proofs to L1 block data

The shift from O(1) per-transaction proving (Tier 1) to O(n) aggregated proving (Tier 2) is what enables larger, more complex applications.

---

## Tier 3: Cairo

### Why Cairo for Rollups

Cairo occupies a unique position among ZK languages because of its **Sierra bytecode format**:

- **Provable metering.** Sierra provides gas metering that is itself provable --- the prover can attest not just that the program executed correctly but that it consumed the declared amount of gas. This is essential for meta-apps where users submit arbitrary logic.
- **Safety guarantees.** Sierra enforces type safety and memory safety at the bytecode level, preventing user-submitted programs from causing prover crashes or undefined behavior.
- **Deterministic execution.** Sierra's semantics are fully deterministic, eliminating nondeterminism-related proof failures.

No other ZK language currently provides both provable metering and safety --- this is why Cairo is the mandatory choice for Tier 3.

**Use case:** vProgs-Based Rollups (VBR), where a single ZK covenant on L1 represents an entire rollup that internally supports user-defined programs. The rollup must be able to prove that user-submitted logic executed correctly and consumed the correct gas, without trusting the user's code.

### Cairo Performance Characteristics

| Metric | Typical value |
|--------|--------------|
| Proof generation time | Minutes (depending on program complexity) |
| Proof size | Variable (STARK-based) |
| Language | Cairo (Rust-like syntax) |
| Bytecode | Sierra (safe intermediate representation) |
| Verification | STARK verification on L1 via KIP-16 |

Cairo's longer proof times are acceptable for Tier 3 because rollup proofs are generated less frequently (aggregating many transactions) and by dedicated proving infrastructure, not end-user devices.

---

## Hash Function Tradeoffs: BLAKE3 vs. BLAKE2s

### The Problem

Kaspa's sequencing commitment (KIP-15, KIP-21) uses BLAKE3, which must be computed inside ZK proofs to anchor state transitions to L1 block data. The efficiency of BLAKE3 in different ZK backends varies dramatically:

### Performance Comparison

| ZK Backend | BLAKE3 cost | BLAKE2s cost | Ratio |
|-----------|------------|-------------|-------|
| Cairo | Very high (no precompile) | Low (has precompile) | BLAKE3 is ~10x more costly |
| SP1 / RISC Zero | Moderate | Slightly higher | BLAKE3 is ~40% cheaper |

### Design Decision

The system adopted BLAKE3 for the sequencing commitment (KIP-21) despite its higher cost in Cairo, because:

1. **Tier 2 dominance.** Most applications will be Tier 2 (RISC Zero / SP1), where BLAKE3 is actually faster
2. **L1 alignment.** BLAKE3 is Kaspa's native hash function; using it for sequencing commitments avoids hash translation overhead
3. **Cairo mitigation.** For Tier 3 rollups, the BLAKE3 cost is amortized across many transactions in each proof, making the per-transaction overhead manageable
4. **Future optimization.** Cairo precompiles for BLAKE3 may be developed, closing the gap

Michael Sutton noted: "blake3 is 10x more costly [in Cairo] because blake2s has a precompile" and "the advantage of blake3 over blake2s on sp1/risc0 is more like 40%." The decision prioritizes the common case (Tier 2) over the specialized case (Tier 3).

---

## Proof Aggregation Strategies

### Single-vProg Aggregation

Within a single vProg, multiple transactions in an epoch are aggregated into one proof:

```
proof_epoch = Prove(
    input: C_p^{t-1},                    -- prior state commitment
    execution: [tx_1, tx_2, ..., tx_n],   -- all transactions in epoch
    output: C_p^t                         -- new state commitment
)
```

This is the basic aggregation mode. The proof attests to the correct execution of all `n` transactions and the resulting state transition.

### Cross-vProg Proof Coordination

When transactions span multiple vProgs, proof coordination is required:

1. **Independent proving.** Each vProg proves its own state transitions independently
2. **Witness verification.** Cross-vProg reads are verified via Merkle inclusion proofs against committed state
3. **Conditional chaining.** Proofs can be conditional on other vProgs' state commitments (see [Formal Model](/research/formal-model))

There is no global proof that spans all vProgs --- this would violate sovereignty. Instead, the system relies on the compositional correctness of independent proofs with verified cross-references.

### Recursive Composition

Both RISC Zero and SP1 support recursive proof composition:

```
meta_proof = Prove(
    input: [proof_1, proof_2, ..., proof_k],
    verification: verify each proof_i,
    output: single aggregated proof
)
```

Recursive composition enables:

- **Proof size reduction.** Multiple large STARK proofs can be compressed into one
- **Groth16 wrapping.** A STARK proof can be wrapped in a Groth16 proof for constant-size L1 verification
- **Hierarchical proving.** Large epochs can be split into sub-epochs, proven independently, and recursively composed

### L1 Verification Infrastructure

KIP-16 provides the L1 opcodes for verifying proofs:

| Verifier | Opcode | Supported tiers |
|----------|--------|-----------------|
| Groth16 verifier | KIP-16 opcode | Tier 1 (Noir/Groth16), Tier 2 (wrapped) |
| RISC Zero verifier | KIP-16 opcode | Tier 2 |
| STARK verifier | KIP-16 opcode | Tier 2, Tier 3 |

All verification opcodes were activated on TN12 (February 2026 reset) and are scheduled for mainnet with the Covenants++ hard fork.

---

## Selection Criteria Summary

| Criterion | Tier 1 (Noir/Groth16) | Tier 2 (RISC Zero/SP1) | Tier 3 (Cairo) |
|-----------|----------------------|----------------------|---------------|
| Proving latency | Sub-second to seconds | 10--30 seconds | Minutes |
| Prover hardware | Mobile/browser | Server | Dedicated infrastructure |
| Programming model | Domain-specific circuits | General-purpose Rust | Cairo language |
| Trusted setup | Groth16 only | None | None |
| User-submitted logic | No | No | Yes (Sierra safety) |
| Proof aggregation | Per-transaction | Per-epoch batch | Per-epoch batch |
| Primary bottleneck | Circuit size | Memory/compute | Proving time |

---

## References

- [Security Model](/research/security-model) -- proof withholding and verification attacks
- [Formal Computation Model](/research/formal-model) -- conditional proofs and pipelining
- [Gas and Resource Economics](/research/gas-economics) -- proving cost economics
- [ZK Covenant Rollup PoC](https://github.com/biryukovmaxim/rusty-kaspa/tree/zk-rollup-covenant-example) -- Maxim Biryukov
- [ZK Covenant Rollup Documentation](https://biryukovmaxim.github.io/rusty-kaspa/ch01-introduction.html)
- [KIP-16: ZK Verification Opcodes](https://github.com/kaspanet/kips)
