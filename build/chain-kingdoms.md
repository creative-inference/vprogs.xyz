---
layout: page
title: "Chain Kingdoms — Territory Control on Kaspa"
section: build
description: "Hex-grid territory control strategy game on Kaspa. Tiles are covenant UTXOs with coordinates. Claim, fortify, and attack — all on-chain. Map is global, visible to every client."
---

A persistent territory control game on a shared hex grid where every tile is a covenant UTXO. Claim land, gather resources, fortify positions, and wage war — all settled atomically on Kaspa L1. The map is the same for everyone. Built on [Kaspa World Protocol](/learn/kaspa-world-protocol/).

---

## How It Works

### The Map Is On-Chain

The world is a hex grid. Each tile is a Tile covenant UTXO encoding its position and state:

```
Tile UTXO (56 bytes)
├── q:          int16    — axial coordinate q
├── r:          int16    — axial coordinate r
├── owner:      bytes32  — controlling player's pubkey (0x00... = unclaimed)
├── terrain:    uint8    — plains/forest/mountain/water/desert
├── structure:  uint8    — none/outpost/fortress/citadel
├── garrison:   uint16   — troops stationed
├── resources:  uint32   — accumulated resources since last harvest
```

Terrain is set at world creation and never changes. Everything else evolves through player actions.

### Claiming Territory

To claim an unclaimed tile, a player submits a self-transition that sets `owner` to their pubkey and `structure` to outpost. The covenant enforces:

- Tile must be unclaimed (`owner == 0x00...`)
- Player must own an adjacent tile (checked via ICC with neighbor tile)
- Claim costs resources (deducted from an owned tile)

### Combat Is Multi-Entity ICC

Attacking a tile is a 3-input ICC transaction:

```
Input 0: [Attacker's source tile]    — garrison reduced
Input 1: [Defender's target tile]    — garrison/owner may change
Input 2: [Battle session covenant]   — created for this fight, consumed on resolution

Output 0: [Updated source tile]      — fewer troops
Output 1: [Updated target tile]      — new owner if attacker wins
Output 2: [Battle consumed]          — or minimal UTXO if draw
```

Combat resolution uses KWP-5 RNG seeded from block hash:

```
seed = block_tip_hash

attacker_rolls = garrison * rng.next(attack_bonus) for each unit
defender_rolls = garrison * rng.next(defense_bonus + structure_bonus) for each unit
```

Terrain and structure provide defense multipliers: forest +20%, fortress +50%, citadel +100%, mountain +30%.

### Resources Accumulate Over Time

Each tile generates resources based on terrain type and `this.age`:

```
resources_available = base_rate[terrain] * (this.age / 3600)
```

No server ticks needed. Resources are computed at harvest time from the UTXO's age on the DAG — protocol-native clock.

Harvesting is a self-transition that resets `resources` to 0 and transfers the accumulated value to a player's Resource covenant UTXO (separate from tiles).

---

## Entity Schema

Five entity types:

| Entity | Description | Covenant Type |
|--------|-------------|---------------|
| **Tile** | Hex grid position with terrain, owner, and garrison | Signed (owner actions) or Public (claim unclaimed) |
| **Player** | Player profile with total resources and stats | Signed |
| **Battle** | Ephemeral combat session | Public (timeout resolution) |
| **Alliance** | Multi-player group with shared vision and trade bonuses | Multi-sig (requires N-of-M member signatures) |
| **Season** | Global season timer and scoring | Public (read-only, resets via `this.age`) |

### Spatial Layout

The hex grid uses axial coordinates `(q, r)`. Neighbors of tile `(q, r)`:

```
(q+1, r)  (q-1, r)  (q, r+1)  (q, r-1)  (q+1, r-1)  (q-1, r+1)
```

Adjacency is validated on-chain: the ICC transaction includes both tiles as inputs, and the covenant checks that their `(q, r)` coordinates differ by exactly one valid hex step.

---

## What KWP Enables

| Feature | KWP Standard | How |
|---------|-------------|-----|
| Tile state encoding | KWP-1 State ABI | Packed coordinate + state fields |
| Tile type identification | KWP-2 Entity Schema | Script hash matching for tiles vs players vs battles |
| Finding all tiles in a region | KWP-3 Indexing | Filter by coordinate range — new spatial query pattern |
| Alliance coordination | KWP-4 Coordination | Multi-party signed messages for joint attacks |
| Combat resolution | KWP-5 Verifiable RNG | Deterministic battle outcomes from block hash |
| Attack ICC (3 inputs) | KWP-6 Transaction Templates | New: 3+ entity ICC pattern |
| Spatial queries | KWP-8 Spatial Schemas | New: coordinate systems, adjacency, range queries |

### New Standards Required

**KWP-7 (Collections):** A player owns many tiles. Enumeration and batch operations over owned entities.

**KWP-8 (Spatial Schemas):** Chain Kingdoms needs:

- **Coordinate system declaration** — hex axial, cartesian, or custom
- **Adjacency rules** — which positions are neighbors (validated on-chain)
- **Range queries** — "all tiles within 3 hexes of (5, 2)" as a KWP-3 indexer query
- **Spatial indexing** — efficient lookup by region, not just by owner

This is the standard that turns KWP from "game protocol" into "world protocol" — any application with spatial state (maps, floorplans, virtual real estate) needs coordinate systems.

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                    Kaspa L1                       │
│         Global hex grid — one source of truth     │
├────────┬────────┬────────┬────────┬──────────────┤
│ Tile   │ Player │ Battle │Alliance│ Season       │
│ (q,r)  │ profile│ session│ N-of-M │ timer        │
│ state  │ + res  │ + RNG  │ multi  │ + scoring    │
└────────┴────────┴────────┴────────┴──────────────┘
         ▲                    ▲
         │                    │
    ┌────┴──────────┐   ┌────┴──────────┐
    │ Strategy UI   │   │ Minimal CLI   │
    │ (hex map,     │   │ (text-based   │
    │  zoom, pan)   │   │  coordinate   │
    │               │   │  commands)    │
    └───────────────┘   └───────────────┘
         Same tiles. Same wars. Different views.
```

### Rendering Freedom

The map is just `(q, r)` coordinates with terrain types. Clients render however they want:

- **Isometric pixel art** — classic strategy game aesthetic
- **Satellite-style** — terrain textures, topographic shading
- **Abstract** — colored hexes with data overlays
- **Text mode** — coordinate grid with ASCII symbols

All clients see the same ownership, the same garrisons, the same battles. The presentation layer is entirely free.

---

## Try It

Schema: [`schemas/chain-kingdoms.json`](https://github.com/creative-inference/kwp) (coming soon)

Built with [Kaspa World Protocol](https://github.com/creative-inference/kwp) — bring your own frontend.
