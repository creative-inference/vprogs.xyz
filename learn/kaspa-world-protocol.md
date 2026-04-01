---
layout: page
title: "Kaspa World Protocol"
section: learn
description: "How Kaspa L1 with covenants and vProgs lays the foundation for persistent, trustless shared worlds with consensus-enforced rules and open frontends."
---

Every attempt at persistent virtual worlds shares the same fatal flaw: a company owns the world. The server is someone's database. The rules change when the board meets. Your assets exist at the pleasure of a terms-of-service update. Participants don't inhabit a world — they rent space in someone else's.

A real shared reality requires something no company can provide: **a single source of truth that no one controls.**

The Kaspa World Protocol (KWP) defines how to build persistent, trustless, globally participatory worlds on top of Kaspa's L1 — where the BlockDAG is the server, covenants are the physics, and anyone can bring their own eyes.

---

## Why Kaspa

Kaspa isn't just another L1. Its architecture was built for exactly this problem — parallel, high-throughput consensus with deterministic finality — before anyone thought to call it a "world protocol."

- **BlockDAG** — blocks produced in parallel, not single-file. Throughput scales with the network, not against it.
- **DagKnight consensus** — parameterless, adaptive, near-instant finality. Every participant converges on the same ordering.
- **Pure proof-of-work** — no staking oligarchy, no trusted validators. Security comes from physics, not economics.
- **Covenants** — UTXO spending rules enforced by consensus. The chain doesn't just record what happened — it enforces what's allowed to happen.
- **vProgs** — sovereign programs with off-chain execution and on-chain ZK verification. Complex logic without L1 bloat.

Every piece of this stack was designed for speed, decentralization, and verifiability. KWP is the recognition that those same properties are exactly what shared worlds need.

---

## The KWP Stack

### Layer 0 — The BlockDAG (Consensus Reality)

Kaspa's BlockDAG + [DagKnight consensus](/architecture/dagknight/) is the foundation: a high-throughput, low-latency, pure PoW sequencing layer with near-instant finality.

This is the physics engine. Every event in the world is sequenced, timestamped, and finalized by decentralized consensus — not by a game server, not by a centralized sequencer, not by a staking cartel.

Properties that matter for shared worlds:

- **10+ blocks per second** — enough throughput for real-time interaction
- **Sub-second finality** via DagKnight — actions resolve instantly
- **Pure proof-of-work** — no privileged validators, no staking oligarchy
- **Deterministic ordering** — everyone agrees on what happened and when
- **Unbiasable randomness** — PoW block hashes provide entropy no participant can predict or influence

### Layer 1 — Covenants as World Rules

[Covenants](/architecture/covenants/) are spending conditions that UTXOs carry forward. In KWP terms: **covenants are the laws of physics.**

A covenant doesn't just say *who* can act — it says *how* the action must resolve. Every spend is a state transition. Every output is the next state. The rules are self-enforcing and consensus-validated.

```
Player UTXO (HP: 80, Gold: 150, Level: 5)
    │
    ├─ [Forest covenant] → Combat state transition → Updated Player UTXO
    ├─ [Shop covenant]   → Purchase state transition → Updated Player + Shop UTXOs
    ├─ [Arena covenant]  → PvP state transition → Updated Player A + Player B UTXOs
    └─ [Inn covenant]    → Rest state transition → Updated Player UTXO (HP restored)
```

What makes this different from smart contract platforms:

- **No VM overhead.** Covenants compile to native Kaspa Script. No gas auctions, no block space competition between unrelated applications.
- **UTXO isolation.** Your entity state is *your* UTXO. No shared global state to contend over. No "noisy neighbor" from unrelated protocols congesting the world.
- **Inter-Covenant Calls (ICC).** Multiple covenant UTXOs participate in a single atomic transaction — PvP combat updates both players simultaneously, or the transaction fails entirely.

[SilverScript](/architecture/silverscript/) — Kaspa's covenant language — makes the rules ergonomic to write:

```
contract Player(byte[32] owner, int hp, int gold, int level) {
    entrypoint function update(sig owner_sig, pubkey owner_pk,
                               int newHp, int newGold, int newLevel) {
        require(owner_pk == owner);
        require(checkSig(owner_sig, owner_pk));
        require(newHp >= 0 && newGold >= 0 && newLevel >= level);
        validateOutputState(0, { owner, hp: newHp, gold: newGold, level: newLevel });
    }
}
```

The compiler generates correct covenant patterns. Kaspa enforces them. No server validates your move — **consensus does.**

### Layer 2 — vProgs as Sovereign World Systems

Covenants handle local state — individual players, items, contracts. But a living world needs more: complex physics, AI-driven NPCs, procedural generation, economic simulations, cross-system composition.

[vProgs](/learn/what-are-vprogs/) are **sovereign state machines** — each with its own accounts, gas economics, and execution logic — verified on L1 by [zero-knowledge proofs](/architecture/zk-verification/), never re-executed by the chain.

```
┌─────────────────────────────────────────────────────────┐
│                      Kaspa L1                            │
│         Sequences, finalizes, verifies ZK proofs         │
├───────────┬───────────┬───────────┬─────────────────────┤
│ vProg:    │ vProg:    │ vProg:    │ vProg:              │
│ Combat    │ Economy   │ Terrain   │ Governance          │
│ Engine    │ Simulator │ Generator │ & Rulemaking        │
│           │           │           │                     │
│ - Physics │ - Markets │ - Procgen │ - DAO voting        │
│ - AI NPCs│ - Trade   │ - Weather │ - Rule amendments   │
│ - Loot   │ - Crafting│ - Biomes  │ - Dispute resolution│
│ tables   │ - Auctions│ - Events  │                     │
└───────────┴───────────┴───────────┴─────────────────────┘
```

Each vProg:

- **Owns exclusive state** — sovereign accounts, no shared contention
- **Executes off-chain** — complex logic runs on a decentralized prover market
- **Proves on-chain** — ZK proofs submitted to L1 attest to correct execution
- **Composes atomically** — [synchronous composability](/architecture/composability/) means a single transaction can touch Combat + Economy + Terrain vProgs simultaneously

Kaspa never runs world logic. It only verifies that the world logic was run correctly. **World complexity scales with prover market capacity, not block size.**

### Layer 3 — Bring Your Own Frontend

This is the core principle of the Kaspa World Protocol.

Because all world state lives on Kaspa — readable by anyone, writable by anyone who follows the rules — **the client is just a view.**

The same canonical world state supports:

- A **terminal roguelike** rendering the world as ASCII
- A **3D rendered MMO** with full spatial graphics
- A **mobile companion app** for inventory and trading
- A **strategy overlay** analyzing patterns and economics
- An **accessibility client** with screen readers and simplified controls
- A **spectator dashboard** streaming live world events
- A **bot** executing programmatic strategies within the rules

No permission needed. No API keys. No platform approval. The state is public. The rules are public. The proofs are public. **Fork the client, not the world.**

```
                    ┌──────────────────────┐
                    │       Kaspa L1        │
                    │  Canonical World State │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐ ┌──────▼───────┐ ┌──────▼───────┐
    │  Terminal UI    │ │  3D Client   │ │  Mobile App  │
    │  (roguelike)   │ │  (Unity/UE)  │ │  (companion) │
    └────────────────┘ └──────────────┘ └──────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                    All read same state.
                    All submit valid txs.
                    All follow same rules.
```

This is what openness actually means — not a company promising interoperability, but a protocol where interoperability is structural. Kaspa doesn't care what your client looks like. It only cares that your state transitions are valid.

---

## What BYOF Actually Requires

"Bring your own frontend" doesn't happen for free. The chain provides the raw capability — public state, permissionless writes — but practical interoperability requires deliberate protocol design on top of it.

### 1. A State ABI Standard

Raw UTXO script hex is meaningless without an agreed encoding format. A Player covenant stores `(owner, hp, gold, level)` as int64LE fields in a specific byte layout. Every frontend that wants to read or write Player state needs to parse that layout identically.

Without a shared ABI, BYOF is "theoretically possible but nobody will bother." The standard defines:

- How covenant state fields are serialized (types, byte order, offsets)
- A schema registry mapping covenant script hashes to their field layouts
- Versioning rules for when schemas evolve

This is the equivalent of ERC standards for tokens — except applied to arbitrary world entities. SilverScript's compiler already produces deterministic script from contract definitions, so the schema can be derived from the contract source. The missing piece is a canonical format for publishing and discovering those schemas.

### 2. An Indexing Standard

"Find all Player covenant UTXOs" isn't a native chain operation. Kaspa nodes serve UTXOs by address, but a world client needs to query by *type* — show me all players, all shops, all active arena challenges.

This requires either:

- A standard query interface for covenant UTXO discovery by script pattern
- KIP-20 Covenant IDs that make type-based UTXO scanning native at the consensus level

KIP-20 is the long-term answer — covenant lineage tracking built into the protocol. Until then, community indexers fill the gap, but each one is a soft centralization point that the ecosystem needs to be honest about.

### 3. A Coordination Protocol for Multi-Step Interactions

Not every interaction is a single atomic transaction. PvP combat has turns. Auctions have bidding rounds. Trade negotiations go back and forth. These require off-chain coordination before on-chain settlement.

A BYOF-compatible approach needs:

- A peer-to-peer or pubsub protocol for multi-step interaction negotiation
- Standardized message formats so any client can participate in any interaction type
- Timeout enforcement on-chain (`this.age`) so coordination failures resolve deterministically

The key constraint: the coordination layer must be replaceable. If switching relay providers requires code changes, it's not really open.

### 4. The Canonical vs. Cosmetic Boundary

The chain stores state: HP, coordinates, inventory IDs, gold balances. It doesn't store textures, sounds, animations, or flavor text.

KWP needs a clear line between:

- **Canonical state** — on-chain, authoritative, every client must agree
- **Derived state** — computed from canonical state (e.g., "player is in combat" derived from an active Game covenant UTXO)
- **Presentation** — entirely client-side, creative freedom (how combat *looks*, what the shop *sounds* like, whether the world renders as ASCII or Unreal Engine 5)

This separation is a feature, not a limitation. It's what makes BYOF interesting — the same world can look completely different through different eyes. But world designers need to be intentional about what goes on-chain (and is therefore universal) versus what lives in the client (and is therefore diverse).

---

## KWP Guarantees

A world with bring-your-own-frontend only works if the rules are inviolable. The Kaspa World Protocol inherits these guarantees from the chain itself.

### Consensus-Enforced Invariants

The rules aren't guidelines — they're **consensus-enforced constraints**:

| Rule | Enforcement |
|------|-------------|
| Entities can't create resources from nothing | Covenant validates conservation across ICC |
| Interactions follow the physics | ZK proof of correct execution (RISC Zero guest) |
| Turn-based actions have timeouts | `require(this.age > 300)` — protocol-native clock |
| Periodic resets are automatic | `require(this.age > 86400)` — no server clock |
| Assets have consistent properties | Covenant state encoding is deterministic |
| Consequences are real | Covenant enforces state changes on loss conditions |
| Markets clear fairly | vProg validates matching with ZK proof |

No client can cheat. No modified frontend can bypass rules. A 3D client and a terminal client produce identical state transitions because **Kaspa validates the transition, not the client.**

### Verifiable Randomness

PoW block hashes provide **unbiasable, unpredictable randomness** revealed *after* transaction sequencing. Loot drops, critical hits, procedural terrain — all seeded from consensus-produced entropy that no participant could have predicted or influenced. No oracles. No commit-reveal schemes. No trusted randomness beacons.

### Atomic Multi-System Interactions

With [synchronous composability](/architecture/composability/), a single transaction atomically:

1. **Combat vProg** resolves a boss fight, drops legendary item
2. **Economy vProg** mints the item as a tradeable asset
3. **Terrain vProg** updates the dungeon state (boss defeated, area cleared)
4. **Governance vProg** records the achievement for seasonal rankings

All atomic. All in one L1 transaction. All verified by ZK proofs. If any step fails, everything reverts. No inconsistent state. No duplication exploits from race conditions between isolated systems.

---

## The Composability Flywheel

The Kaspa World Protocol isn't specific to games. It's a general-purpose framework for shared reality where participants agree on rules and state.

### Systems Compose Into Worlds

Individual mechanics are sovereign vProgs. Through synchronous composability, they interact atomically:

```
Combat vProg + Economy vProg = Loot economy
Economy vProg + Governance vProg = Player-run markets with community rules
Terrain vProg + Combat vProg = Location-based encounters
All four = A living world with emergent complexity
```

New vProgs compose with existing ones without modification. A "Weather vProg" that affects combat modifiers reads the Combat vProg's state through concise witnesses. The world grows by accretion, not by monolithic updates pushed by a central team.

### Worlds Compose on Shared Settlement

Because all vProgs share Kaspa L1 settlement:

- **Assets move between worlds atomically** — no bridges, no wrapping, no custodians
- **Reputation spans worlds** — achievements in World A are verifiable in World B on the same chain
- **Economies interact** — arbitrage between world economies happens naturally through unified liquidity
- **Governance experiments propagate** — what works in one world informs others

Every world shares one settlement layer. Every asset is natively interoperable — not because a company decided to support cross-world items, but because **Kaspa makes fragmentation structurally impossible.**

---

## DAG Gate: KWP in Practice

[DAG Gate](https://dagknight.xyz) — the on-chain BBS RPG running on Kaspa TN12 — is the first Kaspa World Protocol application, proving the architecture works with today's technology:

- **Entity state** lives as covenant UTXOs, not in a database
- **Interaction math** is verifiable via seeded RNG from block hashes
- **Multi-entity settlement** happens atomically through Inter-Covenant Calls
- **The frontend** is a static page on GitHub Pages — no backend server
- **Time-based mechanics** use `this.age` — protocol time, not server time
- **The BlockDAG is the server**

> "If Kaspa's covenant stack can run a multiplayer RPG with persistent state, daily resets, PvP combat, and an economy — it can run anything."

DAG Gate demonstrates at small scale what the full KWP stack enables at world scale. Same principles. Same architecture. More sovereign programs composing over the same chain.

### More KWP Demos

Three additional games built on KWP, each demonstrating different protocol capabilities:

- [DAG Cards](/games/cards/) — Collectible card battler. Cards as covenant UTXOs, KWP-5 verifiable RNG battles, peer-to-peer atomic trades. Demonstrates **KWP-7 Collections**.
- [Chain Kingdoms](/games/kingdoms/) — Hex territory control. Spatial state on-chain, multi-entity ICC combat, resource generation via UTXO age. Demonstrates **KWP-8 Spatial Schemas**.
- [Proof of Craft](/games/craft/) — Crafting economy. Gather materials, craft items via recipe covenants, trade on an open marketplace. Demonstrates **KWP-9 Recipes**.

---

## Roadmap: Building Kaspa Worlds

| Phase | Infrastructure | KWP Capability |
|-------|---------------|----------------|
| **Now** | Covenants on TN12, SilverScript | Local-state worlds (DAG Gate), covenant-enforced rules |
| **Covenants++ HF** | KIP-16 (ZK opcodes), KIP-20 (Covenant IDs), native assets | On-chain assets, verifiable interactions, ZK-proven world logic |
| **vProgs Phase 1** | Standalone sovereign programs, ZK proving pipeline | Independent world systems (combat, economy, terrain, governance) |
| **vProgs Phase 2** | Synchronous composability, concise witnesses | Atomic cross-system interactions, emergent world complexity |
| **DagKnight** | Adaptive consensus, instant finality | Real-time participation at global scale |

Each phase is additive. Worlds built on covenants today gain ZK verification when Covenants++ ships. Standalone vProgs gain cross-program composition in Phase 2. The stack doesn't break and rebuild — it layers.

---

## The Kaspa World Thesis

Every previous attempt at shared virtual worlds failed because they centralized the source of truth. The company that runs the server controls reality. When the company pivots, the world dies. When the company censors, participants lose agency. When the company sells, the community has no recourse.

The Kaspa World Protocol inverts this entirely:

- **The source of truth is Kaspa.** No company, no server, no single point of failure.
- **The rules are covenants.** Enforced by proof-of-work, not terms of service.
- **The compute is decentralized.** Prover markets execute logic; L1 verifies proofs.
- **The clients are open.** Anyone builds a frontend; everyone shares the world.
- **Participation is permissionless.** No accounts to create, no platforms to join, no approval to seek.

This is not a product announcement. It's a protocol pattern — one that emerges naturally from the infrastructure Kaspa is already building. Covenants give you enforceable rules. vProgs give you sovereign complexity. DagKnight gives you global finality. Kaspa gives you a single source of truth.

The rest is just choosing what world to build.

**Kaspa is the server. The covenants are the physics. The proofs are the trust. Bring your own eyes.**
