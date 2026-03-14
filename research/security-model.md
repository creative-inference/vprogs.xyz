---
layout: page
title: "Security Model"
section: research
description: "Threat model and security analysis for vProgs on Kaspa. Covers proof generation, state management, cross-vProg composability, and attack mitigations."
---

This document presents the threat model and security analysis for the vProgs architecture on Kaspa. It identifies attack surfaces across proof generation, state management, cross-vProg composability, and L1 interaction, and describes the structural and economic mechanisms that mitigate each class of attack.

The security model draws on properties established in the [Formal Computation Model](/research/formal-model), the [Composability Architecture Proposal](/research/composability-proposal), and the [Gas and Resource Economics](/research/gas-economics).

---

## Threat Model

### Actors

| Actor | Capabilities | Assumptions |
|-------|-------------|-------------|
| **Honest user** | Submits transactions, provides witnesses | Follows protocol; may be naive |
| **Malicious user** | Submits crafted transactions | Attempts to exploit composability, gas, or state access |
| **Honest prover** | Generates and submits validity proofs | At least one honest prover exists per vProg |
| **Malicious prover** | Withholds proofs, submits selectively | Cannot forge ZK proofs; may censor or delay |
| **L1 validator (miner)** | Orders transactions in BlockDAG | Follows Kaspa consensus; may attempt MEV extraction |
| **Colluding set** | Multiple actors coordinating | Bounded by economic cost of coordination |

### Trust Assumptions

1. **ZK soundness.** The underlying proving systems (Noir, RISC Zero, SP1, Cairo) are computationally sound --- a polynomial-time adversary cannot forge a valid proof for a false statement.
2. **L1 consensus.** Kaspa's BlockDAG consensus (DagKnight) provides eventual consistency and finality guarantees.
3. **Liveness.** At least one honest prover is willing to submit proofs for each active vProg within a bounded time.
4. **Hash function security.** BLAKE3 (used in sequencing commitments) and the hash functions within ZK circuits are collision-resistant.

---

## Attack Surface Analysis

### 1. Proof Withholding

**Attack:** A malicious prover (or cartel of provers) refuses to submit proofs for a vProg, causing scope to grow unboundedly.

**Impact:**

- Transaction costs increase as scope expands (more state transitions to re-prove)
- If epoch length exceeds the [Erdos-Renyi phase transition threshold](/research/formal-model#scalability-analysis) `F >= N/q`, the vProg's scope explodes and transactions become impractical
- Cross-vProg composability degrades because other vProgs reading from the stalled vProg face stale witnesses

**Mitigations:**

- **Permissionless prover sets.** Anyone can submit a proof for any vProg. A prover cartel cannot prevent an outsider from proving.
- **Economic incentive.** Accumulated gas revenue during the withholding period creates a growing bounty for any prover who submits a valid proof.
- **Scope-based gas escalation.** As scope grows, gas costs increase, further incentivizing proof submission.
- **No privileged provers.** The L1 covenant accepts the first valid proof from any source. There is no prover registration or permissioning that could be captured.

**Residual risk:** If proving cost for a specific vProg exceeds the accumulated gas revenue, no rational prover will submit a proof. This represents a liveness failure for that vProg but does not affect other vProgs or L1 consensus.

### 2. State Manipulation

**Attack:** An adversary attempts to modify vProg state in an unauthorized manner --- writing to accounts owned by another vProg, submitting false state commitments, or corrupting the Merkle tree.

**Mitigations:**

- **Exclusive write enforcement.** The account ownership model guarantees that only vProg `p` can write to accounts in `S_p`. This is enforced at the L1 covenant level, not by application logic.
- **ZK validity proofs.** Every state transition must be accompanied by a valid ZK proof. An attacker cannot submit a false state commitment because the proof would fail verification.
- **Merkle commitment integrity.** State commitments are hierarchical Merkle roots. Modifying any account state changes the root, making forgery detectable.
- **L1 covenant verification.** The opcodes proposed in KIP-16 verify proofs on-chain. The covenant script rejects transactions with invalid proofs --- there is no off-chain verification that could be bypassed.

**Residual risk:** A flaw in the ZK proving system's soundness would allow state manipulation. This is mitigated by using well-audited proving systems and the three-tier strategy (no single proving system failure compromises all vProgs).

### 3. MEV Extraction

**Attack:** L1 miners (or other transaction orderers) exploit their ability to observe pending transactions and reorder, insert, or censor transactions for profit.

**MEV vectors specific to vProgs:**

| Vector | Description |
|--------|-------------|
| **Cross-vProg sandwich** | Inserting transactions before and after a cross-vProg swap to extract value |
| **Witness frontrunning** | Observing a cross-vProg read and racing to update the read target |
| **Scope manipulation** | Strategically delaying proof submission to inflate scope and gas costs for competitors |
| **Proof racing** | Competing to submit proofs first to capture proving fees |

**Mitigations:**

- **Upfront declaration.** Transactions declare read/write sets before execution. This limits the scope of MEV because the transaction's behavior is deterministic given its declared dependencies.
- **Atomic execution.** Cross-vProg transactions execute atomically --- there is no intermediate state that a sandwich attacker can exploit between operations.
- **DagKnight ordering.** Kaspa's DAG-based consensus provides partial ordering that reduces the single-sequencer MEV advantage present in traditional blockchains.
- **Permissionless proving.** Proof racing is a form of competition, not extraction --- it benefits the system by reducing proof latency.

**Residual risk:** MEV extraction at the L1 ordering level remains possible to the extent that miners can influence transaction ordering. This is a general BlockDAG problem, not specific to vProgs.

### 4. Reorg Attacks

**Attack:** An adversary causes a reorganization of the L1 BlockDAG, invalidating previously submitted proofs and state commitments.

**Impact:**

- Proofs anchored to reorged blocks become invalid
- State commitments referencing reorged sequencing commitments must be recomputed
- Cross-vProg witnesses based on invalidated state may cause cascading failures

**Mitigations:**

- **Halving-based denoising.** The vProgs reorg filter (PR #10 in the vProgs repository) uses a halving-based denoising mechanism to distinguish genuine reorgs from DAG noise. This prevents the system from overreacting to minor DAG structure variations that do not represent true reorganizations.
- **Sequencing commitment anchoring.** Proofs are anchored to sequencing commitments (KIP-15/KIP-21) that recursively chain block data. A reorg that changes the sequencing commitment is detectable and the affected proofs can be re-generated.
- **DagKnight finality.** DagKnight provides probabilistic finality guarantees. Proofs submitted after sufficient confirmations are resilient to reorgs.
- **Rollback coordination.** The vProgs framework includes rollback and pruning coordination (PR #13) that handles state rollback when reorgs are detected.

**Residual risk:** Deep reorgs (beyond DagKnight finality bounds) could invalidate substantial proving work. The cost of such attacks scales with the attacker's hash rate, making them economically prohibitive.

### 5. Cross-vProg Read Failures

**Attack:** A transaction declares a cross-vProg read, but the read fails because the target vProg's state has changed between witness generation and transaction execution.

**Impact without safeguards:**

- Partial state mutation --- writes to the initiating vProg succeed while reads from the target are stale
- Inconsistent cross-vProg state
- Potential for economic exploitation if partial execution creates arbitrage opportunities

**Mitigations:**

The [Composability Proposal](/research/composability-proposal) defines two critical safeguards:

1. **Read-before-write ordering.** Transactions must execute all declared reads before performing any writes. If any read fails (stale witness, changed state), the entire transaction reverts. No partial mutation occurs.

2. **Gas commitment protection.** Gas commitments are structured so that transaction failure does not create negative economic consequences for any party:
   - The initiating vProg does not lose gas on a reverted transaction (beyond minimal validation costs)
   - The target vProg is not penalized for having its state change between witness generation and read attempt
   - This prevents griefing attacks where an adversary deliberately causes read failures to waste others' gas

### 6. Local State Security (No Reentrancy)

**Structural property:** The vProgs architecture eliminates reentrancy attacks by construction.

**Why reentrancy is impossible:**

- **Exclusive write access.** Only vProg `p` can modify accounts in `S_p`. A cross-vProg call cannot trigger a callback that modifies the caller's state, because the callee has no write access to the caller's accounts.
- **Upfront declaration.** All read/write sets are declared before execution. There are no dynamic calls that could introduce unexpected state modifications.
- **No recursive calls.** The execution model does not support one vProg calling back into another during the same transaction. Cross-vProg interaction is strictly read-then-write, not call-and-return.
- **Atomic execution.** Transactions execute atomically with predetermined state access patterns. There is no execution stack that could be manipulated for reentrancy.

This is a fundamental architectural advantage over EVM-style smart contract platforms, where reentrancy remains a persistent vulnerability class despite extensive mitigation efforts (reentrancy guards, checks-effects-interactions pattern, etc.).

---

## Scope-Based Security Properties

### Bounded Computation

The scope mechanism (defined in the [Formal Model](/research/formal-model)) provides computational bounds:

- Every transaction has a finite, deterministic scope
- Scope size is bounded by the epoch length and transaction rate
- The [gas model](/research/gas-economics) prices scope, creating economic disincentives for unbounded computation
- The Erdos-Renyi phase transition provides a hard structural bound

### Proof Pipeline Integrity

Conditional proofs (see [Formal Model](/research/formal-model)) create dependency chains:

```
proof_1 -> proof_2 (conditional on 1) -> proof_3 (conditional on 2)
```

**Security property:** If `proof_1` is invalidated, all dependent proofs are automatically invalidated. The system does not accept a conditional proof as final until its predecessor chain is fully verified. This prevents an attacker from exploiting a window between conditional acceptance and final verification.

### Anchor Point Permanence

Once a proof is verified on L1 and becomes an anchor point:

- The anchor point is as permanent as the L1 block it resides in
- Pruned state (removed after anchor creation) cannot be retroactively disputed
- The anchor point serves as a trust root for all subsequent scope computations

---

## Economic Security

### Cost of Attack

| Attack | Cost | Bottleneck |
|--------|------|-----------|
| Forge a ZK proof | Computationally infeasible | ZK soundness |
| Sustained proof withholding | Opportunity cost of foregone proving fees | Permissionless proving |
| Deep reorg | Hash rate proportional to network | DagKnight security |
| State manipulation via L1 | Requires breaking covenant scripts | Script engine security |
| Cross-vProg griefing | Gas cost of failed transactions | Read-fail safeguards |

### Incentive Compatibility

The security model is incentive-compatible:

- Honest behavior (submitting valid proofs, providing accurate witnesses) is the most profitable strategy for provers
- Dishonest behavior (withholding proofs, submitting invalid state) is either impossible (ZK soundness) or economically dominated (permissionless proving, gas incentives)
- Users are protected by atomic execution and read-fail safeguards --- even if they interact with a malicious vProg, their own state cannot be corrupted

---

## Comparison with Alternative Architectures

| Property | vProgs | Optimistic rollups | Monolithic L1 (EVM) |
|----------|--------|-------------------|-------------------|
| Reentrancy risk | Eliminated by construction | Present (EVM-based) | Present |
| Proof forgery | Computationally infeasible | N/A (fraud proofs) | N/A |
| Cross-app atomicity | Native | Requires bridges | Native but limited |
| MEV surface | Reduced (upfront declaration) | High (sequencer control) | High |
| Reorg handling | Halving-based denoising | Sequencer reorg policies | Fork choice rule |
| State sovereignty | Per-vProg | Per-rollup (but monolithic within) | None (shared state) |

---

## References

- [Formal Computation Model](/research/formal-model) -- scope, anchoring, and conditional proofs
- [Composability Architecture Proposal](/research/composability-proposal) -- read-fail safeguards, CAD
- [Gas and Resource Economics](/research/gas-economics) -- scope-based pricing, prover incentives
- [Proving Systems Analysis](/research/proving-systems) -- ZK soundness assumptions
- [Open Research Questions](/research/open-questions) -- unresolved security considerations
