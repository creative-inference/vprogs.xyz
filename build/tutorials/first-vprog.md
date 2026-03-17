---
layout: page
title: "Your First vProg"
section: build
description: "Build your first verifiable program on Kaspa. Define state, write Rust transition logic, generate a ZK proof, and submit to L1 for verification."
---

Build a complete verifiable program from scratch: define a state schema, write transition logic in Rust, execute off-chain, generate a ZK proof, and submit to L1 for verification.

This tutorial follows the vProgs execution model: **off-chain compute, on-chain verification**.

---

## What You Will Build

A simple **counter vProg** that maintains a global counter. Users can increment the counter by any positive amount. The state transition is executed off-chain and verified on-chain via a ZK proof.

---

## Prerequisites

- Completed [Dev Environment Setup](/build/dev-environment)
- vProgs repo cloned and built
- Basic Rust knowledge

---

## Step 1: Understand the Execution Model

Every vProg follows this flow:

```
1. Define state schema (what data the vProg owns)
2. Define transition function (how state changes)
3. Execute transition off-chain (prover runs the logic)
4. Generate ZK proof (attest to correct execution)
5. Submit proof + new state commitment to L1
6. L1 validates proof cryptographically (no re-execution)
7. State finalized via DagKnight consensus
```

The key insight: L1 never runs your code. It only checks the cryptographic proof that your code ran correctly.

---

## Step 2: Define the State Schema

Create a new crate for your vProg:

```bash
cd vprogs
cargo new --lib examples/counter-vprog
```

Define the account state in `examples/counter-vprog/src/lib.rs`:

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use vprogs_core::types::{AccountId, StateRoot};

/// The state of our counter vProg.
/// Each vProg owns exclusive accounts (S_p) and manages
/// its own state independently.
#[derive(BorshSerialize, BorshDeserialize, Clone, Debug)]
pub struct CounterState {
    /// The current counter value
    pub value: u64,
    /// Total number of increments performed
    pub num_increments: u64,
    /// The account that last modified the counter
    pub last_modifier: Option<AccountId>,
}

impl CounterState {
    pub fn new() -> Self {
        Self {
            value: 0,
            num_increments: 0,
            last_modifier: None,
        }
    }
}
```

---

## Step 3: Define the Transition Function

The transition function is the core logic of your vProg. It takes the current state and an action, and returns the new state.

```rust
use vprogs_core::types::AccountId;

/// Actions that can be performed on the counter
#[derive(BorshSerialize, BorshDeserialize, Clone, Debug)]
pub enum CounterAction {
    /// Increment the counter by a given amount
    Increment { amount: u64, caller: AccountId },
    /// Reset the counter (only allowed by the creator)
    Reset { caller: AccountId },
}

/// The state transition function.
/// This runs OFF-CHAIN in the prover. L1 never executes this code.
/// Instead, L1 verifies the ZK proof that this function was
/// executed correctly.
pub fn transition(
    state: &CounterState,
    action: &CounterAction,
) -> Result<CounterState, TransitionError> {
    match action {
        CounterAction::Increment { amount, caller } => {
            if *amount == 0 {
                return Err(TransitionError::InvalidAmount);
            }
            Ok(CounterState {
                value: state.value.checked_add(*amount)
                    .ok_or(TransitionError::Overflow)?,
                num_increments: state.num_increments + 1,
                last_modifier: Some(caller.clone()),
            })
        }
        CounterAction::Reset { caller } => {
            // In a real vProg, you would check authorization here
            Ok(CounterState {
                value: 0,
                num_increments: state.num_increments + 1,
                last_modifier: Some(caller.clone()),
            })
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum TransitionError {
    #[error("increment amount must be positive")]
    InvalidAmount,
    #[error("counter overflow")]
    Overflow,
}
```

---

## Step 4: Build the State Commitment

vProgs use hierarchical Merkle roots to commit to state. The commitment `C_p^t` is a Merkle root over per-step state roots since the last proof.

```rust
use vprogs_core::hash::blake3_hash;
use vprogs_core::types::StateRoot;

/// Compute a state commitment from the current state.
/// This commitment is what gets submitted to L1 alongside the proof.
pub fn compute_state_root(state: &CounterState) -> StateRoot {
    let serialized = borsh::to_vec(state)
        .expect("serialization should not fail");
    StateRoot(blake3_hash(&serialized))
}

/// Compute the transition commitment: hash of (old_state, action, new_state).
/// This binds the proof to a specific state transition.
pub fn compute_transition_commitment(
    old_root: &StateRoot,
    new_root: &StateRoot,
    action: &CounterAction,
) -> [u8; 32] {
    let action_bytes = borsh::to_vec(action)
        .expect("serialization should not fail");
    let mut hasher = blake3::Hasher::new();
    hasher.update(&old_root.0);
    hasher.update(&new_root.0);
    hasher.update(&action_bytes);
    *hasher.finalize().as_bytes()
}
```

---

## Step 5: Execute Off-Chain and Generate Proof

[Coming Soon] The proving infrastructure is under active development. The following shows the intended workflow using RISC Zero as the ZK backend (the "based ZK apps" tier):

```rust
// [Coming Soon] -- Proving API is not yet finalized.
// This pseudocode illustrates the intended workflow.

use vprogs_proving::{Prover, ProofRequest};

fn prove_transition(
    old_state: &CounterState,
    action: &CounterAction,
) -> Result<Proof, ProvingError> {
    // 1. Execute the transition
    let new_state = transition(old_state, action)?;

    // 2. Compute state roots
    let old_root = compute_state_root(old_state);
    let new_root = compute_state_root(&new_state);

    // 3. Build the proof request
    let request = ProofRequest {
        program_id: COUNTER_VPROG_ID,
        old_state_root: old_root,
        new_state_root: new_root,
        public_inputs: compute_transition_commitment(
            &old_root, &new_root, action
        ),
    };

    // 4. Generate the ZK proof
    // For based ZK apps, this uses RISC Zero / SP1
    // Expected proof time: 10-30 seconds
    let prover = Prover::new(ZkBackend::RiscZero);
    let proof = prover.prove(request)?;

    Ok(proof)
}
```

---

## Step 6: Submit to L1

The proof and state commitment are submitted to L1 as a transaction. L1 validates the proof cryptographically without re-executing your transition function.

```rust
// [Coming Soon] -- Submission API is not yet finalized.

use vprogs_client::VprogsClient;

async fn submit_to_l1(proof: Proof) -> Result<TxId, SubmitError> {
    let client = VprogsClient::connect("grpc://127.0.0.1:16210").await?;

    // Submit the proof. L1 will:
    // 1. Verify the ZK proof cryptographically (KIP-16 opcodes)
    // 2. Update the vProg's state commitment on-chain
    // 3. Finalize via DagKnight consensus (instant finality)
    let tx_id = client.submit_proof(proof).await?;

    println!("Transaction submitted: {}", tx_id);
    println!("State finalized on L1 with DagKnight consensus");

    Ok(tx_id)
}
```

---

## Step 7: Query State

After the proof is verified and finalized, the new state is accessible on-chain:

```rust
// [Coming Soon] -- RPC API is not yet finalized.

async fn query_counter(client: &VprogsClient) -> Result<CounterState, QueryError> {
    let state = client.get_state(
        COUNTER_VPROG_ID,
        COUNTER_ACCOUNT_ID,
    ).await?;

    let counter: CounterState = borsh::from_slice(&state.data)?;
    println!("Counter value: {}", counter.value);
    println!("Total increments: {}", counter.num_increments);

    Ok(counter)
}
```

---

## Putting It All Together

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Initialize state
    let state = CounterState::new();

    // 2. Define action
    let action = CounterAction::Increment {
        amount: 42,
        caller: my_account_id(),
    };

    // 3. Execute and prove (off-chain)
    let proof = prove_transition(&state, &action)?;

    // 4. Submit to L1 (on-chain verification)
    let tx_id = submit_to_l1(proof).await?;

    // 5. Query updated state
    let client = VprogsClient::connect("grpc://127.0.0.1:16210").await?;
    let updated = query_counter(&client).await?;
    assert_eq!(updated.value, 42);

    Ok(())
}
```

---

## Full Code

The complete `examples/counter-vprog/src/lib.rs` combining all steps above:

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use vprogs_core::types::{AccountId, StateRoot};

/// The state of our counter vProg.
#[derive(BorshSerialize, BorshDeserialize, Clone, Debug)]
pub struct CounterState {
    pub value: u64,
    pub num_increments: u64,
    pub last_modifier: Option<AccountId>,
}

impl CounterState {
    pub fn new() -> Self {
        Self {
            value: 0,
            num_increments: 0,
            last_modifier: None,
        }
    }
}

/// Actions that can be performed on the counter.
#[derive(BorshSerialize, BorshDeserialize, Clone, Debug)]
pub enum CounterAction {
    Increment { amount: u64, caller: AccountId },
    Reset { caller: AccountId },
}

#[derive(Debug, thiserror::Error)]
pub enum TransitionError {
    #[error("increment amount must be positive")]
    InvalidAmount,
    #[error("counter overflow")]
    Overflow,
}

/// State transition function — runs off-chain in the prover.
pub fn transition(
    state: &CounterState,
    action: &CounterAction,
) -> Result<CounterState, TransitionError> {
    match action {
        CounterAction::Increment { amount, caller } => {
            if *amount == 0 {
                return Err(TransitionError::InvalidAmount);
            }
            Ok(CounterState {
                value: state.value.checked_add(*amount)
                    .ok_or(TransitionError::Overflow)?,
                num_increments: state.num_increments + 1,
                last_modifier: Some(caller.clone()),
            })
        }
        CounterAction::Reset { caller } => {
            Ok(CounterState {
                value: 0,
                num_increments: state.num_increments + 1,
                last_modifier: Some(caller.clone()),
            })
        }
    }
}

use vprogs_core::hash::blake3_hash;

/// Compute a state commitment from the current state.
pub fn compute_state_root(state: &CounterState) -> StateRoot {
    let serialized = borsh::to_vec(state)
        .expect("serialization should not fail");
    StateRoot(blake3_hash(&serialized))
}

/// Compute the transition commitment: hash of (old_state, action, new_state).
pub fn compute_transition_commitment(
    old_root: &StateRoot,
    new_root: &StateRoot,
    action: &CounterAction,
) -> [u8; 32] {
    let action_bytes = borsh::to_vec(action)
        .expect("serialization should not fail");
    let mut hasher = blake3::Hasher::new();
    hasher.update(&old_root.0);
    hasher.update(&new_root.0);
    hasher.update(&action_bytes);
    *hasher.finalize().as_bytes()
}
```

---

## Run It

The proving and submission pipeline is [Coming Soon], but you can run the transition logic and state commitment code right now using Rust's built-in test runner.

Add the following test module to the bottom of `examples/counter-vprog/src/lib.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    fn dummy_account() -> AccountId {
        AccountId([1u8; 32])
    }

    #[test]
    fn test_increment() {
        let state = CounterState::new();
        let action = CounterAction::Increment {
            amount: 42,
            caller: dummy_account(),
        };
        let new_state = transition(&state, &action).unwrap();
        assert_eq!(new_state.value, 42);
        assert_eq!(new_state.num_increments, 1);
        assert_eq!(new_state.last_modifier, Some(dummy_account()));
    }

    #[test]
    fn test_increment_zero_rejected() {
        let state = CounterState::new();
        let action = CounterAction::Increment {
            amount: 0,
            caller: dummy_account(),
        };
        assert!(transition(&state, &action).is_err());
    }

    #[test]
    fn test_reset() {
        let mut state = CounterState::new();
        state.value = 100;
        let action = CounterAction::Reset { caller: dummy_account() };
        let new_state = transition(&state, &action).unwrap();
        assert_eq!(new_state.value, 0);
        assert_eq!(new_state.num_increments, 1);
    }

    #[test]
    fn test_state_commitment_changes_on_transition() {
        let state = CounterState::new();
        let action = CounterAction::Increment {
            amount: 1,
            caller: dummy_account(),
        };
        let new_state = transition(&state, &action).unwrap();
        let old_root = compute_state_root(&state);
        let new_root = compute_state_root(&new_state);
        assert_ne!(old_root.0, new_root.0);
    }
}
```

Run the tests from the repo root:

```bash
cargo test -p counter-vprog
```

Expected output:

```
running 4 tests
test tests::test_increment ... ok
test tests::test_increment_zero_rejected ... ok
test tests::test_reset ... ok
test tests::test_state_commitment_changes_on_transition ... ok

test result: ok. 4 passed; 0 failed; 0 ignored
```

This confirms your transition logic and state commitment are working correctly. When the proving infrastructure ships, these same functions slot directly into the prover — no changes needed.

---

## Key Concepts Recap

| Concept | Description |
|---------|-------------|
| **Sovereign state** | Your vProg owns exclusive accounts; no other vProg can modify them |
| **Off-chain execution** | Transition logic runs off-chain in the prover |
| **ZK proof** | Cryptographic attestation that the transition was executed correctly |
| **State commitment** | Merkle root representing the vProg's current state |
| **L1 verification** | L1 validates the proof without re-executing your code |
| **Instant finality** | DagKnight consensus provides immediate finality |

---

## Next Steps

- **[Create a Native Asset](/build/tutorials/native-asset)** -- Issue tokens using covenant primitives
- **[Inline ZK Covenant](/build/tutorials/zk-covenant)** -- Sub-second ZK proofs with Noir
- **[API Reference](/build/api-reference)** -- RPC endpoints for interacting with vProgs
