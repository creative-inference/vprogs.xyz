---
layout: page
title: "Cross-vProg Transaction"
section: build
---

> **Phase 2 -- Coming Soon.** This tutorial describes synchronous composability, which requires the extended Computation DAG with per-account modeling. Phase 1 (standalone vProgs) must ship first. The concepts and architecture described here are based on the published research and are subject to change.

Compose multiple vProgs in a single atomic L1 transaction: borrow from a lending vProg, swap on a DEX vProg, and stake on a staking vProg. No bridges, no delays, no fragmentation.

---

## What You Will Build

A single transaction that atomically:

1. **Borrows** 10,000 KAS from a lending vProg
2. **Swaps** KAS for a stablecoin on a DEX vProg
3. **Stakes** the stablecoin on a yield vProg
4. Repays the lending vProg with interest

All four operations execute as one atomic unit. If any step fails, the entire transaction reverts.

---

## Why This Matters

Without synchronous composability, this flow requires:

```
Traditional L2 approach:
  1. Borrow on Rollup A         -> Wait for finality
  2. Bridge to Rollup B         -> Wait for bridge (minutes to hours)
  3. Swap on Rollup B           -> Wait for finality
  4. Bridge to Rollup C         -> Wait for bridge
  5. Stake on Rollup C          -> Wait for finality
  Total: 5 transactions, bridge risk, liquidity fragmentation
```

With vProgs synchronous composability:

```
vProgs approach:
  1. Compute all operations off-chain
  2. Generate combined ZK proof (proof stitching)
  3. Submit single atomic transaction to L1
  4. Instant finality via DagKnight
  Total: 1 transaction, zero bridge risk, unified liquidity
```

---

## Prerequisites

- Completed all previous tutorials
- Understanding of the vProgs account model
- Familiarity with concise witnesses (see below)

---

## Key Concept: Concise Witnesses

Synchronous composability is enabled by **concise witnesses**:

1. Each vProg maintains state as hierarchical Merkle roots
2. The commitment `C_p^t` is a Merkle root over per-step state roots since the last proof
3. Any intermediate account state can be proven with a compact Merkle inclusion proof
4. vProg A can instantly verify vProg B's state in the same transaction

This means cross-vProg reads are cheap: just a Merkle inclusion proof, not a full state transfer.

---

## Step 1: Declare Read/Write Sets

Every vProgs transaction declares its account dependencies upfront, similar to Solana's account model:

```rust
// [Phase 2 -- Coming Soon]
// Pseudocode illustrating the intended API

let tx = CrossVprogTransaction::new()
    // Read accounts (r(x)) -- state we need to inspect
    .read(lending_vprog, borrower_account)
    .read(dex_vprog, kas_stable_pool)
    .read(staking_vprog, stable_vault)

    // Write accounts (w(x)) -- state we will modify
    // Constraint: w(x) must be a subset of r(x)
    .write(lending_vprog, borrower_account)
    .write(dex_vprog, kas_stable_pool)
    .write(staking_vprog, stable_vault)

    // Witness set -- dependency resolution data
    .witness(lending_vprog, lending_state_proof)
    .witness(dex_vprog, dex_state_proof)
    .witness(staking_vprog, staking_state_proof);
```

Pre-declaring read/write sets enables parallel processing on the BlockDAG. Transactions with non-overlapping write sets can execute concurrently.

---

## Step 2: Define the Composite Operation

```rust
// [Phase 2 -- Coming Soon]

/// Execute a borrow-swap-stake operation across three vProgs.
/// All operations are computed off-chain; only the proof goes to L1.
fn borrow_swap_stake(
    // Current state of all involved accounts
    lending_state: &LendingAccountState,
    dex_state: &DexPoolState,
    staking_state: &StakingVaultState,
    // Operation parameters
    borrow_amount: u64,
    min_stable_out: u64,
) -> Result<CompositeTransition, TransitionError> {

    // Step 1: Borrow from lending vProg
    let (new_lending_state, borrowed_kas) = lending_transition(
        lending_state,
        LendingAction::Borrow {
            amount: borrow_amount,
            collateral_ratio: 150,  // 150% collateralized
        },
    )?;

    // Step 2: Swap KAS -> stablecoin on DEX vProg
    let (new_dex_state, stable_received) = dex_transition(
        dex_state,
        DexAction::Swap {
            input_token: Token::KAS,
            input_amount: borrowed_kas,
            output_token: Token::KUSD,
            min_output: min_stable_out,
        },
    )?;

    // Step 3: Stake stablecoin on yield vProg
    let (new_staking_state, stake_receipt) = staking_transition(
        staking_state,
        StakingAction::Stake {
            token: Token::KUSD,
            amount: stable_received,
        },
    )?;

    // Return the composite transition
    Ok(CompositeTransition {
        transitions: vec![
            (LENDING_VPROG_ID, new_lending_state),
            (DEX_VPROG_ID, new_dex_state),
            (STAKING_VPROG_ID, new_staking_state),
        ],
        receipt: stake_receipt,
    })
}
```

---

## Step 3: Generate the Combined Proof

```rust
// [Phase 2 -- Coming Soon]

/// Generate a single ZK proof covering all three state transitions.
/// Proof stitching combines individual transition proofs into one
/// composite proof that L1 can verify in constant time.
fn prove_composite(
    composite: &CompositeTransition,
    witnesses: &[ConciseWitness],
) -> Result<Proof, ProvingError> {
    let prover = Prover::new(ZkBackend::RiscZero);

    // Each vProg transition is proven independently
    let lending_proof = prover.prove_transition(
        &composite.transitions[0],
        &witnesses[0],
    )?;
    let dex_proof = prover.prove_transition(
        &composite.transitions[1],
        &witnesses[1],
    )?;
    let staking_proof = prover.prove_transition(
        &composite.transitions[2],
        &witnesses[2],
    )?;

    // Stitch proofs together into a single composite proof
    let composite_proof = prover.stitch(vec![
        lending_proof,
        dex_proof,
        staking_proof,
    ])?;

    Ok(composite_proof)
}
```

---

## Step 4: Submit to L1

```rust
// [Phase 2 -- Coming Soon]

async fn submit_composite(
    client: &VprogsClient,
    tx: CrossVprogTransaction,
    proof: Proof,
) -> Result<TxId, SubmitError> {
    // L1 validates:
    // 1. All read/write set declarations are consistent
    // 2. Concise witnesses prove correct prior state
    // 3. ZK proof attests to correct execution of ALL transitions
    // 4. No conflicting writes with concurrent transactions
    let tx_id = client.submit_composite_proof(tx, proof).await?;

    // DagKnight provides instant finality
    println!("Composite transaction finalized: {}", tx_id);
    Ok(tx_id)
}
```

---

## Safety Mechanisms

Cross-vProg transactions include two critical safety features:

### Read-Fail Safeguards

1. Transactions must begin by reading all declared-read accounts
2. If any read fails (e.g., stale witness), the entire transaction is rejected before any writes occur

### Gas Commitments

- Gas must be paid to each vProg whose state is modified
- Each vProg controls its own gas scales and STORM constants
- Gas commitments prevent "failure to write" from causing negative consequences

---

## Architecture Requirements (Phase 2)

Synchronous composability requires infrastructure beyond Phase 1:

| Component | Status | Description |
|-----------|--------|-------------|
| Extended Computation DAG | Research | Per-account modeling in the CDAG |
| Concise witnesses | Specified | Merkle inclusion proofs for cross-vProg reads |
| Proof stitching | Research | Combining multiple transition proofs |
| CD-based scope gas | Research | Gas calculations based on computational scope |
| Global vProg registry | Research | Registration and discovery of vProgs |
| Transaction v2 | Research | New transaction format with read/write declarations |

---

## Next Steps

- **[API Reference](/build/api-reference)** -- RPC endpoints for vProgs interaction
- **[Example Projects](/build/examples)** -- Reference implementations
- **[Silverscript Reference](/build/silverscript-reference)** -- Covenant programming for local state
