---
layout: page
title: "API Reference"
section: build
description: "Complete gRPC API reference for vProgs nodes on Kaspa. Covers RPC endpoints, data types, error codes, and connection examples in Rust."
---

> **Preliminary.** This API reference documents the intended RPC interface for vProgs nodes. The API is under active development and subject to change before mainnet launch. Endpoints marked with [Coming Soon] are not yet implemented.

This document covers RPC endpoints, data types, and error codes for interacting with vProgs nodes programmatically.

---

## Connection

vProgs nodes expose a gRPC API. Connect using any gRPC client:

```rust
use vprogs_client::VprogsClient;

let client = VprogsClient::connect("grpc://127.0.0.1:16210").await?;
```

Default ports:

| Network | gRPC Port | P2P Port |
|---------|-----------|----------|
| Mainnet | 16210 | 16211 |
| Testnet (TN12) | 16310 | 16311 |
| Simnet | 16410 | 16411 |

---

## Proof Submission

### `submit_proof`

Submit a ZK proof and state transition to L1 for verification.

**Request:**

| Field | Type | Description |
|-------|------|-------------|
| `program_id` | `ProgramId` | The vProg's unique identifier |
| `proof` | `bytes` | The serialized ZK proof |
| `old_state_root` | `StateRoot` | Merkle root of the state before transition |
| `new_state_root` | `StateRoot` | Merkle root of the state after transition |
| `public_inputs` | `bytes` | Public inputs to the ZK verifier |
| `lane_id` | `LaneId` | KIP-21 lane identifier |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `tx_id` | `TxId` | Transaction ID on L1 |
| `status` | `SubmitStatus` | `Accepted`, `Rejected`, or `Pending` |
| `rejection_reason` | `string?` | Reason if rejected |

**Example:**

```rust
let response = client.submit_proof(SubmitProofRequest {
    program_id: my_vprog_id,
    proof: proof_bytes,
    old_state_root: old_root,
    new_state_root: new_root,
    public_inputs: pub_inputs,
    lane_id: my_lane,
}).await?;

println!("TX: {} Status: {:?}", response.tx_id, response.status);
```

---

### `submit_composite_proof` [Coming Soon -- Phase 2]

Submit a composite proof spanning multiple vProgs for synchronous composability.

**Request:**

| Field | Type | Description |
|-------|------|-------------|
| `transitions` | `Vec<VprogTransition>` | Per-vProg state transitions |
| `composite_proof` | `bytes` | Stitched ZK proof covering all transitions |
| `read_set` | `Vec<AccountRef>` | Declared read accounts |
| `write_set` | `Vec<AccountRef>` | Declared write accounts |
| `witnesses` | `Vec<ConciseWitness>` | Merkle proofs for cross-vProg reads |

---

## State Queries

### `get_state`

Retrieve the current state of a vProg account.

**Request:**

| Field | Type | Description |
|-------|------|-------------|
| `program_id` | `ProgramId` | The vProg identifier |
| `account_id` | `AccountId` | The account to query |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `data` | `bytes` | Borsh-serialized account state |
| `state_root` | `StateRoot` | Current state Merkle root |
| `last_proof_height` | `u64` | DAA score of the last verified proof |
| `version` | `u64` | State version counter |

**Example:**

```rust
let state = client.get_state(GetStateRequest {
    program_id: counter_vprog_id,
    account_id: counter_account_id,
}).await?;

let counter: CounterState = borsh::from_slice(&state.data)?;
println!("Counter value: {}", counter.value);
```

---

### `get_state_proof`

Get a Merkle inclusion proof for a specific account's state.

**Request:**

| Field | Type | Description |
|-------|------|-------------|
| `program_id` | `ProgramId` | The vProg identifier |
| `account_id` | `AccountId` | The account to prove |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `state_root` | `StateRoot` | Root the proof is relative to |
| `proof` | `Vec<[u8; 32]>` | Merkle path from leaf to root |
| `leaf_data` | `bytes` | The account state data |

---

### `get_lane_proof`

Retrieve the KIP-21 lane proof for a specific vProg, enabling efficient ZK proving scoped to the vProg's own activity.

**Request:**

| Field | Type | Description |
|-------|------|-------------|
| `lane_id` | `LaneId` | The lane identifier (maps to a vProg) |
| `from_height` | `u64` | Start DAA score |
| `to_height` | `u64` | End DAA score |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `lane_root` | `[u8; 32]` | Lane Merkle root at `to_height` |
| `proof` | `Vec<LaneEntry>` | Lane activity entries |
| `seq_commitment` | `[u8; 32]` | Blake3 sequencing commitment |

---

### `get_program_info`

Query metadata about a registered vProg.

**Request:**

| Field | Type | Description |
|-------|------|-------------|
| `program_id` | `ProgramId` | The vProg identifier |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `program_id` | `ProgramId` | The vProg identifier |
| `lane_id` | `LaneId` | Associated KIP-21 lane |
| `state_root` | `StateRoot` | Current global state root |
| `last_proof_height` | `u64` | DAA score of last verified proof |
| `zk_backend` | `ZkBackend` | `Noir`, `RiscZero`, `SP1`, or `Cairo` |
| `gas_scale` | `GasScale` | vProg's custom gas pricing |
| `storm_constants` | `StormConstants` | State growth regulation parameters |

---

## Transaction Queries

### `get_transaction`

Retrieve a submitted transaction by ID.

**Request:**

| Field | Type | Description |
|-------|------|-------------|
| `tx_id` | `TxId` | Transaction identifier |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `tx_id` | `TxId` | Transaction identifier |
| `program_id` | `ProgramId` | Associated vProg |
| `status` | `TxStatus` | `Pending`, `Verified`, `Finalized`, `Rejected` |
| `proof_valid` | `bool` | Whether the ZK proof passed verification |
| `daa_score` | `u64?` | Block DAA score (if finalized) |
| `timestamp` | `u64?` | Block timestamp (if finalized) |

---

### `get_sequencing_commitment`

Retrieve the Blake3 sequencing commitment for a specific block.

**Request:**

| Field | Type | Description |
|-------|------|-------------|
| `block_hash` | `[u8; 32]` | Block hash |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `seq_commitment` | `[u8; 32]` | Blake3 sequencing commitment |
| `daa_score` | `u64` | Block DAA score |

---

## Data Types

### Core Types

```rust
/// 32-byte program identifier
type ProgramId = [u8; 32];

/// 32-byte account identifier
type AccountId = [u8; 32];

/// 32-byte Merkle root
type StateRoot = [u8; 32];

/// 32-byte transaction identifier
type TxId = [u8; 32];

/// KIP-21 lane identifier
type LaneId = u32;
```

### Enums

```rust
enum SubmitStatus {
    Accepted,       // Proof accepted, pending finality
    Rejected,       // Proof rejected (invalid proof, bad state root, etc.)
    Pending,        // Queued for verification
}

enum TxStatus {
    Pending,        // Submitted, not yet verified
    Verified,       // ZK proof verified, awaiting finality
    Finalized,      // Finalized via DagKnight consensus
    Rejected,       // Rejected by the network
}

enum ZkBackend {
    Noir,           // Inline ZK covenants (~1s proving)
    RiscZero,       // Based ZK apps (10-30s proving)
    SP1,            // Based ZK apps (10-30s proving)
    Cairo,          // Based ZK rollups (longer proving)
}
```

---

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| `1000` | `INVALID_PROOF` | ZK proof failed verification |
| `1001` | `STATE_ROOT_MISMATCH` | Submitted old state root does not match on-chain state |
| `1002` | `PROGRAM_NOT_FOUND` | No vProg registered with the given ID |
| `1003` | `ACCOUNT_NOT_FOUND` | Account does not exist in the vProg |
| `1004` | `LANE_NOT_FOUND` | KIP-21 lane not found or not active |
| `1005` | `PROOF_TOO_LARGE` | Proof exceeds maximum size |
| `1006` | `INSUFFICIENT_GAS` | Gas payment does not meet the vProg's gas scale |
| `2000` | `WRITE_CONFLICT` | Transaction writes conflict with a concurrent transaction |
| `2001` | `STALE_WITNESS` | Concise witness references outdated state |
| `2002` | `READ_SET_VIOLATION` | Transaction read an account not in its declared read set |
| `3000` | `INTERNAL_ERROR` | Internal node error |
| `3001` | `NODE_SYNCING` | Node is still syncing and cannot serve requests |

---

## Rate Limits

[Coming Soon] Rate limiting and authentication details will be documented once the RPC layer is finalized.

---

## Related Resources

- **[Testnet Guide](/build/testnet)** -- Connect to TN12 and test the API
- **[Developer Tools](/build/tools)** -- CLI tools for interacting with the API
- **[Your First vProg](/build/tutorials/first-vprog)** -- End-to-end tutorial using the API
