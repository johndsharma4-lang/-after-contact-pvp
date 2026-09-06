# AFTER CONTACT — Combat Lifecycle Authority

This document is the regression contract for combat presentation and firing.

## Ownership

- Input owns raw pointer coordinates only.
- Selection owns which warrior is active. Selection must not rewrite ballistics or enemy geometry.
- Warrior rig animation may visually articulate toward the pointer, but may not mutate the mathematical shot origin during drag.
- Ballistics owns a launch snapshot captured once at aim start/release and uses raw stage target coordinates.
- Camera observes combat state. Camera must not rewrite pointer coordinates, launch origin, target, damage, or turn state.
- Cutaway presentation observes selection/aim/travel state. It must not alter ballistic state.
- Damage/reveal owns enemy compartment exposure. Aiming alone must never open enemy compartments.
- Presentation director owns aim/travel/beam/settle camera handoff. No second camera authority may compete with it.
- Turn authority advances only after the authoritative attack and presentation settle.

## Lifecycle

1. Open local cutaway.
2. Select one local warrior.
3. Begin aim with a stable launch reference.
4. Drag raw pointer to aim; weapon rig may articulate visually.
5. Camera may reframe as an observer only.
6. Enemy hull remains closed during aim unless already exposed by gameplay state.
7. Release once; snapshot launch origin and target once.
8. Fire exactly one authoritative attack.
9. Projectile/beam clears firing ship; presentation director owns travel handoff.
10. Damage resolves through existing combat authority.
11. Enemy compartment reveal occurs only from legitimate damage/exposure rules.
12. Presentation settles and turn advances exactly once.
13. Next turn starts with clean selection/aim/presentation state.

## Regression gates

A combat change is not complete until these remain true:

- start menu -> deployment -> battle still works;
- local and AI turns still advance once;
- multiplayer/Durable Object wiring is untouched unless intentionally changed;
- selecting a warrior does not open enemy rooms;
- dragging does not move the mathematical launch origin;
- camera movement does not change ballistic target coordinates;
- release cannot re-enter the firing path through a retry watchdog;
- projectile/beam camera has one owner;
- impact/damage/reveal occurs once;
- cutaway cleanup does not mutate combat state;
- next turn is playable.
