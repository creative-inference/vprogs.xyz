---
layout: page
title: "Architecture Overview"
section: architecture
---

Verifiable Programs (vProgs) are Kaspa's native Layer 1 mechanism for programmable computation. They deliver a synthesis that the blockchain ecosystem has struggled to achieve: sovereignty, cryptographic proof, and synchronous composability while maintaining a clean, fast L1 core. This page describes the four architectural pillars and how they compose into a unified system.

---

## The Smart Contract Trilemma

The blockchain ecosystem has faced a fundamental architectural choice between two unsatisfying options:

| Problem | Description | Consequence |
|---------|-------------|-------------|
| **L1 Monolithic Bloat** | Placing VMs (like EVM) on L1 | Computational stress, congestion, high fees, heavy node requirements, centralization pressure |
| **L2 Fragmentation** | Moving execution to rollups | Liquidity fragmentation, bridge risks, async finality delays, centralized sequencers |

vProgs represent a third path: **off-chain execution with on-chain ZK verification**, preserving unified L1 state and synchronous composability. The conscious rejection of the L2 rollup model confirms that unified state and atomic execution are the highest architectural priorities.

---

## Pillar 1: Sovereign State

A vProg `p` is defined as a state transition function combined with an exclusive set of accounts `S_p`. Each vProg:

- Functions as a "mini zkVM" with full autonomy over its state
- Is mutually trustless with all other vProgs -- state integrity is independent
- Defines its own resource constants (STORM parameters) and gas scales
- Cannot be burdened by the behavior of other programs on the network

This sovereignty is an architectural defense against bloat. By internalizing resource costs per application, no single vProg can overburden the network -- a problem endemic to shared-VM architectures where a single popular contract can congest the entire chain.

### Exclusive Write, Permissioned Read

The formal model defines a clear access control boundary:

- **Write access** to accounts in `S_p` is exclusive to the owning vProg
- **Read access** is permissioned across programs, enabling composability
- This separation allows sovereignty and composability to coexist

For a deeper treatment of the account model, see [Account Model & State](/architecture/account-model).

---

## Pillar 2: Off-Chain Compute

vProgs execute all complex logic off-chain. The L1 never re-runs any computation -- it only validates the cryptographic proof that computation was performed correctly.

### Execution Flow

```
1. User defines a state transition (transaction)
2. Off-chain prover executes the vProg logic
3. ZK proof generated attesting to correct execution
4. Proof + state commitment submitted to L1
5. L1 validates proof cryptographically (no re-execution)
6. State finalized with instant DAG finality
```

### Prover Market

The system scales horizontally via a decentralized, permissionless prover market:

- Any party can advance a vProg's state by generating valid proofs
- Provers compete on speed and cost
- Total system capacity is proportional to the aggregate prover market size
- No single prover is trusted -- correctness is guaranteed by the ZK proof itself

### State Commitments

The proof object `z_p^i` contains a state commitment `C_p^t` structured as a Merkle root over per-step state roots:

```
C_p^t = MerkleRoot(
  state_root_step_1,
  state_root_step_2,
  ...
  state_root_step_n
)
```

This hierarchical structure enables **concise witnesses** -- compact Merkle inclusion proofs of any account state at any intermediate time. These witnesses are the mechanism that makes [synchronous composability](/architecture/composability) possible.

For full details on the execution lifecycle, see [Execution Model](/architecture/execution-model).

---

## Pillar 3: L1 Sequencing

Kaspa's L1 shifts from universal executor to **immutable sequencing layer**. The BlockDAG consensus provides the global sequence of operations `T`, combining transactions and ZK proof submissions into a single ordered stream.

### The L1 as Traffic Controller

The L1's responsibilities are deliberately narrow:

1. **Order** transactions via BlockDAG consensus (GHOSTDAG/DagKnight)
2. **Verify** ZK proofs submitted by off-chain provers
3. **Commit** state transitions via sequencing commitments
4. **Finalize** state with instant DagKnight finality

The L1 does not interpret, execute, or reason about vProg logic. This separation is what preserves BlockDAG performance.

### KIP-21: Partitioned Lanes

KIP-21 proposes replacing the monolithic per-block sequencing commitment with partitioned application lanes. Each lane maintains:

- Its own recursive tip hash
- A last-touch blue score for activity tracking
- Membership in an active-lanes sparse Merkle tree

This partitioning enables **O(lane activity) proving** -- a vProg prover only needs to process transactions relevant to its own lane, not the entire chain.

For the full KIP-21 specification, see [L1 Sequencing (KIP-21)](/architecture/sequencing). For the mapping between KIP-21 concepts and vProgs abstractions, see [KIP-21 to vProgs Mapping](/architecture/sequencing-mapping).

---

## Pillar 4: ZK Verification

Zero-knowledge proofs are the trust anchor that makes the entire architecture work. Instead of re-executing computation (as in EVM), L1 nodes validate a compact cryptographic proof that the computation was performed correctly.

### Three-Tier ZK Stack

The ZK strategy, finalized in January 2026, establishes three tiers optimized for different use cases:

| Tier | Use Case | ZK Stack | Proof Time |
|------|----------|----------|------------|
| Inline ZK covenants | Small contracts, wallets | Noir / Groth16 | ~1s mobile, ~6s mobile web |
| Based ZK apps | Regular large applications | RISC Zero / SP1 | 10-30s |
| Based ZK rollups | Meta-apps with user-defined logic | Cairo | Longer |

### KIP-16: Verifier Opcodes

KIP-16 proposes opcodes for verifying ZK validity proofs directly on L1, bridging the gap between the covenant layer and vProgs -- UTXOs can carry spending conditions that require ZK proof verification.

For the complete ZK verification architecture, see [ZK Verification](/architecture/zk-verification).

---

## How the Pillars Compose

The four pillars are not independent features -- they form an integrated system where each pillar depends on and reinforces the others.

```
+-------------------------------------------------------------------+
|                        APPLICATION LAYER                           |
|    vProg A (DEX)    vProg B (Lending)    vProg C (Stablecoin)     |
+-------------------------------------------------------------------+
         |                    |                    |
         |    Synchronous Composability (Phase 2)  |
         |    Cross-vProg atomic transactions       |
         +--------------------+--------------------+
                              |
+-------------------------------------------------------------------+
|                     SOVEREIGN STATE LAYER                          |
|  Each vProg owns exclusive accounts S_p                           |
|  Mutually trustless state isolation                                |
|  Per-vProg resource regulation (STORM, gas scales)                |
+-------------------------------------------------------------------+
                              |
         +--------------------+--------------------+
         |                                         |
+------------------+                    +--------------------+
| OFF-CHAIN COMPUTE|                    | ZK VERIFICATION    |
| Prover market    |  ----> proofs ---> | KIP-16 opcodes     |
| Witness gen      |                    | State commitments  |
| Scope computation|                    | Merkle validation  |
+------------------+                    +--------------------+
         |                                         |
         +--------------------+--------------------+
                              |
+-------------------------------------------------------------------+
|                     L1 SEQUENCING LAYER                            |
|  KIP-21 partitioned lanes                                          |
|  SeqCommit(B) chained through selected-parent ancestry            |
|  DagKnight consensus for instant finality                          |
|  Pure PoW security                                                 |
+-------------------------------------------------------------------+
                              |
+-------------------------------------------------------------------+
|                  KASPA BLOCKDAG (10 BPS)                           |
|  Parallel block creation and confirmation                          |
|  GHOSTDAG/DagKnight ordering                                       |
+-------------------------------------------------------------------+
```

### Interaction Patterns

**Sovereign State + Off-Chain Compute:** Each vProg's prover operates on its own exclusive state. The sovereignty guarantee means provers for different vProgs can operate fully in parallel without coordination.

**Off-Chain Compute + ZK Verification:** Provers generate ZK proofs that L1 verifies. The proof object contains state commitments that L1 anchors into the sequencing chain.

**L1 Sequencing + ZK Verification:** The lane structure proposed in KIP-21 provides the anchoring points that provers use. The two-anchor proof model connects a lane's state at two points in the sequencing chain, proving all intermediate transitions.

**Sovereign State + Synchronous Composability:** Concise witnesses (Merkle inclusion proofs from state commitments) allow one vProg to trustlessly read another's state within a single atomic transaction, without compromising sovereignty.

---

## Node Function Shift

Under the vProgs architecture, full nodes transition from exhaustive transaction processing to:

- Efficient ZK proof validation (constant-time verification)
- State commitment indexing (Merkle root tracking)
- Sequencing commitment maintenance (KIP-21 lane updates)

This preserves decentralization by keeping node requirements low while enabling arbitrarily complex computation off-chain.

---

## Combined Scalability

The architecture produces multiplicative scalability:

```
DagKnight (parallel BlockDAG sequencing)
    +
vProgs (ZK computational offloading)
    =
30,000+ TPS with exponential scalability potential
```

The BlockDAG's parallel block confirmation handles sequencing throughput. vProgs entirely offload execution to the ZK computation layer. These two dimensions scale independently -- DAG throughput can increase without affecting prover requirements, and prover capacity can grow without affecting L1 node requirements.

---

## Implementation Challenges

| Challenge | Mitigation |
|-----------|------------|
| Network complexity | Lightweight, deterministic logic modules |
| Node resource burden | Off-chain computation; L1 only verifies proofs |
| Attack surfaces | Mutual trustlessness via ZK; isolated sovereign state |
| State bloat | Per-vProg resource regulation (STORM constants) |
| Witness storage | Transient vs. permanent storage conventions (open) |
| vProg vetting | Deployment prerequisites (open) |
| Source code availability | Enforcement mechanisms (open) |

---

## Deployment Phasing

The vProgs rollout follows a deliberate phasing strategy:

### Phase 1: Standalone vProgs

- Each vProg operates as an independent sovereign program
- Bridges to L1 via ZK proofs through the canonical bridge
- L1 has no notion of accounts -- only aware of the overall vProg entity through its L1 covenant
- The "degenerate" CD commit scheme groups activity by programs/subnets (not accounts)
- Proving in O(program activity) time via KIP-21

### Phase 2: Full Synchronous Composability

- Extended Computation DAG with per-account modeling
- Cross-vProg atomic transactions via concise witnesses
- Full CD with account-level state vertices
- Continuous Account Dependency mechanism
- Weighted Area gas model

---

## The Consensus Foundation

The vProgs architecture builds on two hard forks:

- **Crescendo (activated):** KIP-9 (storage mass), KIP-10 (introspection opcodes), KIP-13 (transient mass), KIP-15 (sequencing commitments), plus 10 BPS
- **Covenants++ (May 5, 2026):** KIP-16 (ZK verification), KIP-17 (covenant opcodes), KIP-20 (covenant IDs), KIP-21 (partitioned sequencing)

For the complete covenant infrastructure, see [Covenant Stack](/architecture/covenants).

---

## Further Reading

- [Architecture Index](/architecture/)
- [DagKnight Consensus](/architecture/dagknight)
- [Silverscript](/architecture/silverscript) -- Kaspa's L1 covenant language, complementary to vProgs
- [Concrete proposal for synchronously composable vProgs](https://research.kas.pa/t/concrete-proposal-for-a-synchronously-composable-verifiable-programs-architecture/387)
- [Formal backbone model for vProg computation DAG](https://research.kas.pa/t/zoom-in-a-formal-backbone-model-for-the-vprog-computation-dag/407)
