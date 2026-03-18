---
layout: page
title: "Kaspa Chess — Trustless ZK-verified Chess on TN12"
section: build
description: "A fully trustless chess game on Kaspa TN12. Chess move validation runs in a Noir ZK circuit off-chain, with the Kaspa covenant verifying only the proof on-chain via KIP-16."
---

A fully trustless chess game running on Kaspa's TN12 testnet. Chess move validation runs in a Noir ZK circuit off-chain. The Kaspa covenant only verifies the proof on-chain using KIP-16 opcodes. No trusted server. No arbitration. Math enforces the rules.

---

## How It Works

### Board state lives in a UTXO

Each game is a UTXO on Kaspa. The UTXO's data field encodes the full game state:

```
Bytes [0..63]  — board (64 squares, piece encoding 0-12)
Byte  [64]     — castling rights bitmask
Byte  [65]     — en passant target square (255 = none)
Byte  [66]     — whose turn (1=white, 0=black)
Bytes [67..68] — move counter
```

Piece encoding: `0`=empty, `1`=wP, `2`=wN, `3`=wB, `4`=wR, `5`=wQ, `6`=wK, `7`=bP, `8`=bN, `9`=bB, `10`=bR, `11`=bQ, `12`=bK

### Making a move

1. The moving player runs the Noir chess circuit locally, computing a ZK proof that:
   - Their move is legal (piece movement, captures, check detection, castling, en passant)
   - The resulting board state is correctly computed
   - The game state transition (turn flip, castling rights, EP square) is correct
2. They build a Kaspa transaction spending the game UTXO with witness:
   - `witness[0]` — new game state bytes (69 bytes)
   - `witness[1]` — Noir proof bytes
   - `witness[2]` — move encoding (from, to, promotion)
3. The Silverscript covenant calls `zkVerify(proof, CHESS_VK, public_inputs)` via KIP-16
4. If the proof is valid, the UTXO is spent and a new UTXO with the updated board is created

### What the L1 does NOT do

- Does not re-execute chess logic
- Does not know the rules of chess
- Does not trust either player

It only verifies a ZK proof. The chess rules live entirely in the Noir circuit.

---

## This Is the vProgs Model

This application is a direct demonstration of the architecture that vProgs generalise:

| Component        | Chess game          | vProgs (general)       |
|------------------|---------------------|------------------------|
| State            | Board UTXO          | Sovereign vProg account|
| Execution        | Noir circuit        | Off-chain Rust/zkVM    |
| Proof            | Noir proof          | ZK validity proof      |
| Verification     | KIP-16 `zkVerify`   | KIP-16 verifier opcode |
| L1 settlement    | Covenant spend      | Lane-sequenced proof   |

---

## Project Structure

```
apps/chess/
├── circuit/           Noir ZK chess circuit
│   ├── Nargo.toml
│   └── src/
│       ├── main.nr    Circuit entry point — proves move legality
│       ├── board.nr   Board representation and helpers
│       ├── pieces.nr  Per-piece move validation
│       └── check.nr   Check/attack detection
├── covenant/
│   └── chess.ss       Silverscript KIP-16 covenant
├── frontend/
│   ├── index.html     Chess UI
│   ├── chess.js       JS game logic + prover stubs
│   └── styles.css     Cypherpunk styling
└── scripts/
    ├── setup.sh       Install Noir, compile circuit, generate VK
    └── prove.sh       Generate proof for a given move
```

---

## Setup

### Prerequisites

- Rust toolchain (`rustup`)
- Git
- Bash (macOS/Linux/WSL)

### 1. Compile the Noir circuit

```bash
cd apps/chess
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This installs `nargo`, compiles the circuit to `circuit/target/kaspa_chess.json`, and generates the verification key at `circuit/target/kaspa_chess.vk`.

### 2. Wire the verification key into the covenant

After compilation, extract the VK bytes and update the `CHESS_VK` constant in `covenant/chess.ss`.

### 3. Run the frontend locally

```bash
cd apps/chess/frontend
python3 -m http.server 8080
# open http://localhost:8080
```

The frontend runs as a fully functional local chess game. Kaspa RPC integration (proof submission) is stubbed — see `TODO: wire Kaspa RPC` in `chess.js`.

### 4. Wire Kaspa RPC (TN12)

To play on-chain:

1. Confirm the KIP-16 `zkVerify` opcode interface with saefstroem or the KIP-16 spec
2. Compile and deploy `covenant/chess.ss` with the Silverscript compiler
3. Implement `submitProofToKaspa()` in `chess.js` using the Kaspa SDK
4. Create a game UTXO with the initial board state

---

## Generating a Proof Manually

```bash
./scripts/prove.sh <from_square> <to_square> [promotion_piece]

# Example: e2-e4 (square 12 -> square 28)
./scripts/prove.sh 12 28

# Example: pawn promotion to queen (square 52 -> square 60, piece=5)
./scripts/prove.sh 52 60 5
```

Edit `circuit/Prover.toml` with actual board state before proving.

---

## Open Questions / TODOs

- **KIP-16 interface** — Confirm exact `zkVerify` opcode calling convention with saefstroem
- **Silverscript `zkVerify` macro** — Confirm Silverscript exposes KIP-16 at this level or whether raw opcodes are needed
- **Proof size** — Measure Noir proof size vs Kaspa witness size limits
- **Proof time** — Benchmark Noir proof generation time for the full chess circuit
- **Game termination** — Checkmate/stalemate detection for clean game ending (currently adjudicated off-chain)
- **Timeouts** — Add time control via block height
- **Stakes** — Add KAS wagering to the covenant

---

## Connection to vProgs

This application is buildable on TN12 today — before vProgs ship — because KIP-16 ZK verification is already live. It demonstrates the core principle: complex logic off-chain, trustless verification on L1, no trusted intermediaries.

When vProgs ship, this architecture becomes dramatically more powerful: the chess engine could interact atomically with a wagering vProg, a tournament vProg, and a leaderboard vProg in a single transaction. That is synchronous composability.

See the [Architecture Overview](/architecture/overview/) for the full design.
