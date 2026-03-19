---
layout: page
title: "Kaspa Chess — Trustless Multiplayer Chess on TN12"
section: build
description: "Trustless multiplayer chess on Kaspa TN12. RISC Zero validates full FIDE rules off-chain. RISC0-Groth16 proof verified on-chain via KIP-16 OpZkPrecompile. KAS stakes, timeouts, draw offers — no server."
---

Trustless multiplayer chess on Kaspa's TN12 testnet. Move validation runs in a [RISC Zero](https://dev.risczero.com) guest program off-chain. The RISC0-Groth16 proof is verified on-chain via `OpZkPrecompile` (tag `0x20`, KIP-16). Stakes are locked in the game UTXO and released to the winner. No server. No arbitration. No trust.

[View on GitHub](https://github.com/creative-inference/kaspa-chess)

---

## How it works

### The game is a UTXO

Each active game is a single UTXO on Kaspa. Its 137-byte data field encodes the full game state — board position, whose turn it is, both players' public keys, and game metadata:

```
Bytes [0..63]    board (64 squares, piece encoding 0-12)
Byte  [64]       castling rights bitmask
Byte  [65]       en passant target square (255 = none)
Byte  [66]       whose turn (1=white, 0=black)
Bytes [67..68]   move counter (u16 LE)
Bytes [69..100]  white player pubkey (32 bytes, Schnorr)
Bytes [101..132] black player pubkey (32 bytes, Schnorr)
Byte  [133]      flags: bit0=stake active, bit1=white draw offer, bit2=black draw offer
Bytes [134..135] timeout in blocks (u16 LE, 0=no timeout)
Byte  [136]      last move block (for timeout enforcement)
```

Piece encoding: `0`=empty, `1-6`=white P/N/B/R/Q/K, `7-12`=black P/N/B/R/Q/K

### Making a move

1. The active player generates a proof locally: `./scripts/prove.sh state.json move.json`
2. The RISC Zero host executes the chess guest inside the zkVM, validating full FIDE rules
3. A compact RISC0-Groth16 proof is produced (140 sigops on L1)
4. The player builds a Kaspa transaction spending the game UTXO with three witnesses:
   - `witness[0]` — new game state (137 bytes)
   - `witness[1]` — Groth16 proof bytes
   - `witness[2]` — move encoding (from, to, promotion — 3 bytes)
5. The `chess_move` covenant verifies the active player's signature, checks the ZK proof, and enforces that pubkeys and stake carry forward
6. A new UTXO with the updated board is created on L1

### What the L1 does NOT do

- Re-execute chess logic
- Know the rules of chess
- Trust either player

It verifies one 140-sigop Groth16 proof. The rules live entirely in the RISC Zero guest.

---

## Covenants

| Covenant | Spending party | Purpose |
|---|---|---|
| `chess_new` | Challenger (Auth) | Create game UTXO with both pubkeys, optional KAS stake |
| `chess_move` | Active player (Cov + sig) | Submit legal move + ZK proof, stake carries forward |
| `chess_resign` | Either player (Auth) | Resign — winner receives full stake |
| `chess_draw_claim` | Either player (Auth) | Claim draw when both flags set — stake split 50/50 |
| `chess_timeout` | Waiting player (Auth) | Claim stake if opponent exceeds block-height time limit |

---

## KIP-16 OpZkPrecompile

KIP-16 adds native ZK proof verification opcodes to Kaspa's script engine. Implementation in [rusty-kaspa PR #775](https://github.com/kaspanet/rusty-kaspa/pull/775) by saefstroem.

| Tag | Proof system | Sigop cost | Notes |
|-----|-------------|-----------|-------|
| `0x20` | RISC0-Groth16 | 140 | Compact, fast L1 verification |
| `0x21` | RISC0-Succinct | 740 | STARK-based, quantum-resistant |

Both verify RISC Zero proofs attesting to correct RISC-V program execution. `MAX_SCRIPT_SIZE` raised to 250,000 bytes in the same PR — script size is not a constraint.

---

## Security properties

- **No illegal moves** — rejected by every Kaspa node via ZK proof verification
- **No impersonation** — only the active player's Schnorr signature can spend the UTXO
- **No stake theft** — stake value is covenant-enforced on every move
- **No stalling** — block-height timeout lets the waiting player claim if opponent disappears
- **No trusted server** — all game logic is client-side proving + on-chain verification

---

## This is the vProgs model

This application is buildable on TN12 today — before vProgs ship — because KIP-16 ZK verification is already live on testnet. It demonstrates the core principle directly:

| Component | Chess | vProgs (general) |
|---|---|---|
| State | Game UTXO (137 bytes) | Sovereign vProg account |
| Execution | RISC Zero guest (Rust) | Off-chain Rust / zkVM |
| Proof | RISC0-Groth16 | ZK validity proof |
| Verification | OpZkPrecompile `0x20` | KIP-16 verifier opcode |
| Composability | Single game UTXO | Cross-vProg atomic transactions |

When vProgs ship, a chess tournament vProg could atomically interact with a wagering vProg, leaderboard vProg, and prize pool vProg in a single transaction. That is synchronous composability.

---

## Project structure

```
kaspa-chess/
├── circuit/
│   ├── core/src/lib.rs     Chess logic: board, move validation, apply_move (pure Rust)
│   ├── guest/src/main.rs   RISC Zero guest — validates move, commits journal to proof
│   └── host/src/main.rs    Proof generation host — outputs proof.hex + journal.hex
├── covenant/
│   └── chess.ss            Silverscript covenants (move, resign, draw, timeout)
├── frontend/
│   ├── index.html          Browser chess UI
│   ├── chess.js            Game logic + Kaspa RPC stubs
│   └── styles.css
└── scripts/
    ├── setup.sh            Install RISC Zero toolchain, build circuit
    └── prove.sh            Generate proof from state.json + move.json
```

---

## Getting started

### Build the circuit

```bash
git clone https://github.com/creative-inference/kaspa-chess
cd kaspa-chess
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Installs `rzup`, builds the RISC Zero guest and host. Copy the printed Image ID into `CHESS_IMAGE_ID` in `covenant/chess.ss`.

### Run the frontend locally

```bash
cd frontend
python3 -m http.server 8080
# open http://localhost:8080
```

### Generate a proof

```json
// state.json — starting position
{
  "board": [4,2,3,5,6,3,2,4, 1,1,1,1,1,1,1,1,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            7,7,7,7,7,7,7,7, 10,8,9,11,12,9,8,10],
  "castling": 15, "ep_square": 255, "white_to_move": true
}

// move.json — e2 to e4
{ "from": 12, "to": 28, "promotion": 0 }
```

```bash
./scripts/prove.sh state.json move.json
# outputs: proof.hex, journal.hex
```

---

## Open questions

- **Silverscript binding** — `op_zk_precompile()` not yet in Silverscript repo; raw `OP_ZKPRECOMPILE` opcodes may be needed for now
- **Exact stack interface** — push order for proof bytes + tag needs confirmation from KIP-16 spec
- **Image ID redeployment** — covenant must be redeployed whenever the guest program changes
- **Checkmate covenant** — game termination currently adjudicated off-chain; a `chess_checkmate` covenant could enforce it on-chain
- **Full block height** — timeout currently uses low byte of block number; full 64-bit height needs KIP-10 introspection

---

## References

- [kaspa-chess on GitHub](https://github.com/creative-inference/kaspa-chess)
- [rusty-kaspa PR #775](https://github.com/kaspanet/rusty-kaspa/pull/775) — KIP-16 OpZkPrecompile
- [KIP-16 PR #31](https://github.com/kaspanet/kips/pull/31) — Specification
- [RISC Zero docs](https://dev.risczero.com)
- [Silverscript](https://github.com/kaspanet/silverscript)
- [Architecture: ZK Verification](/architecture/zk-verification)
- [Architecture: Covenants](/architecture/covenants)
