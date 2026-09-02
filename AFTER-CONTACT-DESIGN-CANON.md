# AFTER CONTACT — DESIGN CANON

This file is the permanent source of truth for locked gameplay and presentation decisions. Do not replace established mechanics with invented alternatives.

## Aurelian Warriors

### Sun Disk Gunner

**Role:** Precision / penetration / solar detonation.

- Wears dedicated **solar disk-launcher gauntlets**. The disks fire from the gauntlets; they are not hand-thrown energy blobs.
- Fires a **large, clearly readable sun-shaped disk**. It must not be tiny.
- The projectile must visibly travel as a **thin spinning disk/saw-like plane**, not as a spherical blob or generic fireball.
- Flight behavior is visually comparable to the traveling cutting-disc concept of Dragon Ball's Destructo Disc: a distinct rotating disk crossing the battlefield.
- On reaching the targeted enemy compartment, the disk **slices through the compartment**.
- After the slice, it **detonates across three compartments** around the impact area.
- The affected compartments receive **stacking solar fire/burn damage**. Repeated hits intensify the burn.
- Visual identity: elegant Aurelian gold/white armor, specialized heavy gauntlets, radiant razor-edged solar disk.

### Sunadier

**Role:** Artillery / arcing solar grenade / scatter damage.

- Uses a **sun chain** with a substantial solar grenade attached to its end.
- The Sunadier physically **lobs/swings the chained grenade over the battlefield** in a high artillery arc.
- During the initial rise, the grenade remains attached to the chain.
- **At a defined height near the top of the arc, the chain releases/drops away from the grenade.** The grenade then continues its ballistic flight independently toward the enemy fortress.
- Immediately after release, the **chain snaps/retracts back to the Sunadier/player**. The chain does NOT remain attached all the way to impact.
- The grenade can land/bounce/scatter at the target area.
- On impact, it releases **multiple smaller solar grenades/explosions** around the impact zone, damaging/exposing multiple compartments.
- Affected compartments receive **stacking solar fire/burn damage**.
- Visual identity: artillery specialist distinct from the Sun Disk Gunner, with the chain-and-solar-grenade weapon as the defining silhouette.

### Locked visual distinction

The Sun Disk Gunner and Sunadier must not look like near-identical armor variants.

- **Sun Disk Gunner:** precision warrior; specialized disk-launcher gauntlets; large traveling flat solar disks.
- **Sunadier:** artillery warrior; visible sun chain and attached grenade; throwing/lobbing silhouette; chain releases near the apex and snaps back before grenade impact.

## Aurelian established class

### Solar Lancer

**Role:** Precision solar-lance marksman.

- The old sustained five-second beam aiming/firing structure is retired.
- Solar Lancer uses the **same mobile-friendly projected aiming concept as the Earth Sniper**: the player's finger stays nearer their own fortress while a distant crosshair/aim line is projected toward the enemy.
- Manual precision aim only. No auto-lock or endpoint snapping.
- On release, the Lancer fires an **immediate, needle-thin golden solar lance** along the chosen line rather than holding a prolonged burn beam.
- The shot can penetrate along its line through up to three compartments, with damage diminishing through successive compartments.
- It remains visually Aurelian: white-hot core, radiant gold sheath, solar impact flashes and penetration effects.
- It must remain mechanically and visually distinct from the Sun Disk Gunner's traveling physical disk and the Sunadier's arcing chained grenade.

## Structural Collapse and Warrior Fall Physics

This mechanic is causal and physical. A warrior does not move simply because a room was damaged; the game must be able to explain **what broke, why support was lost, how far the warrior fell, and what damage resulted**.

- **One compartment may contain at most one warrior.** Warriors must never stack in the same compartment.
- A warrior falls only when the structural support beneath their current compartment actually fails.
- A warrior does **not** automatically fall to the bottom of a column. Fall distance is determined by the amount of support/floor structure actually destroyed.
- If only one supporting floor fails, the warrior falls **one compartment level** and takes normal fall damage for that distance.
- If multiple consecutive supports fail from the same damaging event or structural collapse, the warrior may fall multiple levels. Fall damage scales with the actual distance fallen.
- A full-column or foundation collapse may cause a much larger fall only when the structural foundation supporting that entire vertical section has genuinely failed.
- Intact structural support stops a fall. Warriors must never pass through an intact compartment floor merely because another room above was destroyed.
- Before moving a falling warrior into the next lower compartment, the game checks whether that destination is occupied.
- If the next valid landing compartment is **empty**, the warrior falls into it, the room assignment is updated, and fall damage is applied.
- If the next landing compartment is **occupied by another warrior**, the falling warrior does **not** enter that compartment and does **not** stack. The fall is blocked and the falling warrior instead receives an additional **3% damage penalty** from the failed collapse/impact condition while remaining in their current compartment.
- The warrior already occupying the lower compartment is not displaced by this blocked fall.
- Player-controlled voluntary movement between compartments remains disabled. Any room change caused by this system is forced structural displacement only.
- Collapse visuals should communicate the causal chain whenever practical: support/floor cracking or failing, debris dropping, the warrior falling the correct physical distance, and a landing impact.
- The match recorder/debug log should preserve the causal chain, for example: `ROOM 3 FLOOR FAILED -> SUPPORT TO ROOM 6 LOST -> SOLAR LANCER FELL 1 LEVEL -> FALL DAMAGE 8`.

### Design intent

The player should be able to understand a collapse by looking at the vessel: **what was hit, which support broke, why the warrior moved, and why they took the resulting damage.** Collapse is a structural physics consequence, not a random room reassignment mechanic.
