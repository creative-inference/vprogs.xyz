---
layout: page
title: "KWP Game Demos"
section: build
description: "Playable game demos built on the Kaspa World Protocol. Each game demonstrates different KWP capabilities."
---

Three playable games built on [Kaspa World Protocol](https://github.com/creative-inference/kwp). Each runs entirely in your browser using KWP for state encoding, verifiable RNG, and entity schemas. No backend. No accounts. Just play.

---

## The Games

### [DAG Cards](/games/cards/) — Collectible Card Battler

Open packs, collect cards, battle opponents. Every card has an element, stats, and XP. Combat damage is deterministic from KWP-5 verifiable RNG.

**KWP features demonstrated:** KWP-5 (Verifiable RNG), KWP-7 (Collections)

---

### [Chain Kingdoms](/games/kingdoms/) — Hex Territory Control

Claim hexes, build fortifications, wage war on a shared map. Garrison troops, harvest resources, and conquer AI kingdoms. ASCII hex grid rendered from coordinate state.

**KWP features demonstrated:** KWP-8 (Spatial Schemas), KWP-5 (Verifiable RNG), KWP-7 (Collections)

---

### [Proof of Craft](/games/craft/) — Crafting Economy

Gather materials, combine them with recipes, sell on the market. Quality scales with crafter skill. Every item carries permanent crafter provenance.

**KWP features demonstrated:** KWP-9 (Recipes), KWP-7 (Collections), KWP-5 (Verifiable RNG)

---

## How They Work

All three games share the same architecture:

1. **KWP browser bundle** loaded from CDN — provides state ABI, entity schemas, and verifiable RNG
2. **Shared terminal engine** — BBS-style text rendering (same aesthetic as [DAG Gate](https://dagknight.xyz/game/))
3. **localStorage persistence** — state saved locally, ready to migrate on-chain when covenants ship
4. **Zero backend** — all logic runs client-side, all randomness is deterministic and replayable

These are Phase 0 demos — client-side prototypes that validate KWP patterns before deploying covenants to Kaspa TN12. The same entity schemas will drive real on-chain state when the games go live.

Source: [github.com/creative-inference/kwp](https://github.com/creative-inference/kwp)
