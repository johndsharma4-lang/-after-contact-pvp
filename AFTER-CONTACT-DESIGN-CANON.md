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


## Faction Fortress and Cannon Ability Framework

**Status:** Locked design direction; these abilities are not yet implemented. Exact damage, HP, cooldown, Morale gain/loss, and shield values remain subject to gameplay testing unless explicitly fixed below.

- The intended combat identity is asymmetric and deliberately "dirty": factions use different frightening combinations rather than mirrored versions of the same abilities.
- Offensive fortress-scale special attacks belong to the faction's **cannon**.
- Defensive special abilities belong to the **fortress**, not the cannon.
- Cannons have their own HP and can be targeted and disabled.
- Destroying a cannon disables that faction's cannon abilities, but does not automatically disable its fortress defensive ability.
- The UI must keep cannon abilities, fortress defenses, and warrior abilities visually and mechanically distinct.

## Morale and Hidden Readiness

Morale controls access to both offensive and defensive faction abilities.

- A player sees their own Morale value live and accurately.
- The opponent sees a **one-turn-delayed** reading labeled as last-known Morale or otherwise clearly presented as delayed intelligence.
- The displayed opponent value is stale, not fabricated.
- The specific ability selected or armed remains hidden until it is visibly activated or triggered.
- Fortress defensive abilities require at least **50% Morale** when armed.
- Cannon offensive specials require a **full Morale bar** when activated.
- Once a defense has been legally armed, a later Morale decrease does not cancel it.
- Heavy battle damage lowers Morale. Successful combat, defense, repair, and other recovery rules for rebuilding Morale remain to be tuned.
- Morale loss must be tuned to avoid an unrecoverable snowball in which the losing player permanently loses access to all defensive play.
- Individual abilities retain their own once-per-battle, use-count, or cooldown restrictions in addition to Morale requirements.

### Information-warfare intent

Players can see that an opponent was approaching readiness one turn ago, but cannot know the opponent's exact current Morale or selected ability. The delay must create uncertainty without making the interface appear broken.

## Aurelian Cannon Abilities

The Aurelian cannon is a destructible combat system. Destroying it disables its cannon abilities and is the only way to terminate an active Solar Chain before its natural expiration.

### Solar Chain

**Role:** Capture / forced proximity / solar disorientation / escalating siege damage.

- The cannon fires a physical solar chain that anchors to the enemy fortress and pulls the enemy closer.
- The chain remains active for **three turns** unless the Aurelian cannon is destroyed.
- The chain itself is not a separately targetable break point. The enemy must destroy the Aurelian cannon to disconnect it early.
- Destroying the cannon ends further pulling, disorientation, breach growth, and new feedback damage from the chain.
- Solar fire already established on the target continues for its remaining duration after the cannon or chain connection is lost.
- The chain requires a substantial cooldown before it can be fired again. Exact cooldown is TBD.

#### Solar disorientation

Disorientation affects aiming for the first two chained turns only.

- **Turn 1 — total disorientation:** aiming is heavily scrambled. Controls may be inverted or displaced and the reticle may resist or drift away from intended input.
- **Turn 2 — 50% aiming recovery:** aiming responds more correctly but remains slower, unstable, and partially affected.
- **Turn 3 — recovered aiming:** normal aiming returns even though the chain remains attached for its final siege phase.
- The game must display a clear **SOLAR DISORIENTATION** status so intentional control interference is not mistaken for a software defect.
- Exact control transformations must be stable and testable rather than changing unpredictably every frame.

#### Progressive solar breach

- **Turn 1:** a large ring of solar fire forms around the chain's puncture and begins burning the exterior.
- **Turn 2:** the puncture and surrounding breach visibly expand.
- **Turn 3:** the hooked compartment and at least one adjacent compartment are burned open, leaving at least two compartments exposed and targetable.
- Exposing a compartment does not automatically execute its warrior.
- After the chain's third turn, solar fire remains in the affected area for **two additional turns** and applies damage over time.
- Lingering damage values and whether environmental damage can deliver a final blow remain TBD.

#### Solar Feedback Link

- While the chain is active, a percentage of direct weapon damage received by the Aurelian fortress is also transmitted through the chain to the attached enemy fortress.
- Aurelian still receives the original direct damage; the linked damage is an additional consequence for the enemy.
- Feedback damage is one-directional in favor of the Aurelian chain owner.
- Damage-over-time, fire, poison, radiation, crash damage, and reflected damage do not create additional feedback loops.
- Feedback is applied around the enemy chain attachment area and follows ordinary shield/hull resolution once that interaction is finalized.
- The exact feedback percentage is **TBD** and must be balance-tested; 25% is the initial test candidate, not a locked final number.

### Sun Disc Sabotage

**Role:** Targeted system sabotage rather than primary direct damage.

- The Aurelian cannon fires **three sun-shaped discs**.
- The discs attach around one selected enemy compartment/system in a triangular formation and link with visible solar energy.
- Together they charge a sabotage field that temporarily disables or interferes with the selected system.
- The enemy can stop activation by destroying **two of the three discs** before the charge completes.
- Only one Sun Disc sabotage array may be active at a time.
- Exact disc HP, charge duration, sabotage duration, and interactions with shields/countermeasures remain TBD.
- This fortress-scale ability is separate from the established Sun Disk Gunner warrior and must not overwrite or confuse that warrior's existing weapon canon.

## Aurelian Fortress Defense

### Solar Wall

**Role:** Hidden directional interception / disintegration.

- Solar Wall is activated from the Aurelian fortress, not its cannon.
- It requires at least 50% Morale when armed.
- It is an invisible directional wall rather than a permanent visible shield bubble.
- Once armed, it remains hidden and active across turns until an incoming attack finally crosses it.
- The first intersecting attack is disintegrated and reveals the wall as a brilliant solar plane.
- That first impact begins the wall's one-turn protection window.
- For the remainder of that enemy turn, additional attacks whose paths cross the revealed wall are also disintegrated.
- The wall expires at the end of that triggered enemy turn.
- Attacks that travel around the wall do not trigger it and do not get blocked by it.
- Solar Wall does not cleanse chains, mines, fire, radiation, acid, or other effects that were already attached or active before deployment.
- Exact facing controls, coverage, upgrade path, and number of uses per battle remain TBD.

## Earth Cannon Abilities

The Earth cannon has its own HP. Both Earth cannon specials require an operational cannon and can each be used only once per battle.

### Groundbreaker EMP

**Role:** Whole-fortress electronic disruption / grounding / setup.

- Groundbreaker EMP is fired from the Earth cannon and may be used **once per battle**.
- On impact it scrambles the enemy fortress's systems, shuts down flight, causes the fortress to fall, and applies crash/impact damage.
- **First affected enemy turn — grounded:** the fortress cannot move at all; ship systems are offline; only one of the three enemy warriors, chosen by that player, may shoot once.
- **Second affected enemy turn — groggy:** the fortress can move at approximately 50% capacity and visibly moves more slowly/unstably; only two of the three enemy warriors, chosen by that player, may shoot.
- **Following enemy turn — recovered:** normal movement, crew availability, and systems return.
- Exact effects on shields, repairs, basic cannon fire, special abilities, and partial recovery values remain subject to implementation testing.

### A-Bomb

**Role:** Earth's maximum single destructive cannon payload.

- The A-Bomb is fired from the Earth cannon and may be used **once per battle**.
- It is intended to produce severe visible exterior and multi-compartment destruction.
- It must not be an automatic full-health fortress or whole-crew execution.
- Exact blast damage, falloff, fallout, fire/radiation duration, interception, and shield interaction remain TBD.
- Earth is explicitly allowed to fire Groundbreaker EMP and then fire the A-Bomb on Earth's following turn if Morale and cannon-operational requirements are still satisfied.

### Earth kill-chain intent

Earth can build a high-risk, high-reward sequence:

1. The Combat Controller marks the enemy for the delayed C-130 strike.
2. The opponent receives its intervening turn and knows a strike has been called.
3. Earth fires Groundbreaker EMP, grounding the marked fortress.
4. The accurate delayed C-130 bombardment arrives against the grounded marked target.
5. During the grounded enemy turn, only one warrior can shoot; that warrior may attempt to damage or destroy Earth's cannon or lower Earth's Morale.
6. If Earth still has full Morale and an operational cannon, it may fire the A-Bomb on its following turn.

This sequence is intentionally frightening but not guaranteed. The opponent's intervening actions, Solar Chain feedback, Sun Disc sabotage, Solar Wall, cannon destruction, and Morale damage can interrupt the final stage.

General spatial friendly-fire behavior for the C-130 remains a future design option and is not locked by this entry. The currently locked consequence is the Solar Chain's feedback link: striking a chained Aurelian can transmit a percentage of that direct attack damage back into Earth.

## Earth Fortress Defense

### Countermeasure Flares

**Role:** Pre-armed projectile interception.

- Flares are activated from the Earth fortress, not its cannon.
- They may be used **twice per battle**.
- Earth arms the flares before the anticipated incoming attack; the activation choice remains hidden until they deploy.
- They automatically trigger against a qualifying incoming projectile attack during their armed response window.
- Each blocked projectile is counted individually. A ten-projectile barrage still lands every projectile beyond the current block limit.
- Upgrade progression:
  - **Level 1:** blocks 2 projectiles.
  - **Level 2:** blocks 3 projectiles.
  - **Level 3:** blocks 4 projectiles.
  - **Level 4:** blocks a maximum of 5 projectiles.
- Flares do not disable Earth's regular shield; qualifying surviving projectiles proceed to normal shield/hull resolution.
- The exact armed duration and definitive list of qualifying projectile types remain TBD.

## Shields and Resolution Order

The established shield system remains part of faction combat. The intended general defensive order is:

1. Eligible fortress countermeasure.
2. Shield.
3. Exterior armor/hull.
4. Compartment, system, or warrior effects.

Detailed shield interactions with Solar Chain, Sun Discs, EMP, A-Bomb, C-130 bombardment, and Solar Wall are **not yet fully locked** and must be resolved before implementation. Shields must remain meaningful without silently nullifying once-per-battle faction identity abilities.

## Mobile Contextual Ability Interface

- Tapping the player's own fortress opens its private physical cutaway.
- The open cutaway presents a bottom-corner action tray containing the player's three deployed warrior controls and the faction's fortress defense control.
- Warrior controls select the corresponding physical warrior in the cutaway.
- The fortress defense control is contextual to the local faction: Earth displays Countermeasure Flares and Aurelian displays Solar Wall.
- The defense control must clearly communicate unavailable, Morale-locked, ready, armed, and spent states once the underlying ability system is implemented.
- Cannon attacks remain in a separate dedicated Cannon interface. Opening that interface must never fire automatically.
- The tray must respect mobile safe areas and use comfortably tappable controls.
