# AFTER CONTACT — CLEAN 3D REMAKE

This directory is the clean rebuild of AFTER CONTACT. The legacy root game remains untouched as a reference until the remake reaches feature parity.

## Non-negotiable architecture

1. Battle warriors are 3D objects only. No sprite or canvas-character rendering in combat.
2. Combat state is plain data and never depends on Three.js objects.
3. Every warrior has one identity ID and one matching render rig.
4. Ships, rooms, warriors, weapons, VFX, input and networking live in separate modules.
5. A warrior's room assignment is authoritative game state. Selecting a warrior never changes its room.
6. Destruction is stored by room and applied to the ship renderer; cutaway presentation never moves authoritative rooms.
7. The existing Durable Object multiplayer transport will be adapted only after the local combat core is stable.

## First milestone

The first remake milestone renders two modular 3D vessels, nine authoritative compartments per vessel, and three distinct 3D Aurelian warriors. Clicking a local warrior selects it without moving it. The renderer reads state; it does not own state.

Entry point: `/remake/`
