from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
router = (root / 'router-worker.js').read_text(encoding='utf-8')
director = (root / 'combat-presentation-director-runtime.js').read_text(encoding='utf-8')
bridge = (root / 'aim-lifecycle-bridge-runtime.js').read_text(encoding='utf-8')
cutaway = (root / 'aurelian-logical-cutaway-runtime.js').read_text(encoding='utf-8')
weapon_origin = (root / 'warrior-weapon-origin-runtime.js').read_text(encoding='utf-8')
rebuilt_models = (root / 'aurelian-rebuilt-models-runtime.js').read_text(encoding='utf-8')
cutaway_composition = (root / 'aurelian-cutaway-composition-runtime.js').read_text(encoding='utf-8')
solar_lancer = (root / 'solar-lancer-runtime.js').read_text(encoding='utf-8')
game_patcher = (root / 'game-html-patcher.js').read_text(encoding='utf-8')
reference_polish = (root / 'aurelian-reference-polish-runtime.js').read_text(encoding='utf-8')
destruction = (root / 'destruction-cinematic-runtime.js').read_text(encoding='utf-8')
base = (root / 'index.html').read_text(encoding='utf-8')
worker = (root / 'after-contact-worker.js').read_text(encoding='utf-8')
deployment = (root / 'deployment-controller-v03313.js').read_text(encoding='utf-8')
compact_router = ''.join(router.split())

aim_start = director.find('if(xrayOpen&&aiming&&selected){')
aim_end = director.find("if(acDirector.mode==='travel'", aim_start)
aim_block = director[aim_start:aim_end] if aim_start >= 0 and aim_end > aim_start else ''
solar_resolve_start = base.find('function resolveSolarBurnTick(')
solar_resolve_end = base.find('\nfunction spawnSolarLancerBeam(', solar_resolve_start)
solar_resolve_block = base[solar_resolve_start:solar_resolve_end] if solar_resolve_start >= 0 and solar_resolve_end > solar_resolve_start else ''
solar_animate_start = base.find("}else if(q.solarBeam){", base.find('function animate()'))
solar_animate_end = base.find("}else if(q.laser){", solar_animate_start)
solar_animate_block = base[solar_animate_start:solar_animate_end] if solar_animate_start >= 0 and solar_animate_end > solar_animate_start else ''
solar_aim_start = base.find('function projectedPrecisionAimPoint(')
solar_aim_end = base.find('\nfunction clearAim(', solar_aim_start)
solar_aim_block = base[solar_aim_start:solar_aim_end] if solar_aim_start >= 0 and solar_aim_end > solar_aim_start else ''

checks = {
    'director imported once': router.count('patchCombatPresentationDirectorRuntime') == 2,
    'old cutaway lifecycle inactive': 'patchCutawayLifecycleRuntime' not in router,
    'old aim hard fix inactive': 'patchAimCameraHardFixRuntime' not in router,
    'unsafe reference fidelity startup patch inactive': 'patchAurelianReferenceFidelityRuntime' not in router,
    'durable object export preserved': "export{MyDurableObject}from'./after-contact-worker.js';" in compact_router,
    'root route preserved': "url.pathname==='/'" in compact_router and "url.pathname==='/index.html'" in compact_router,
    'legacy route preserved': "url.pathname==='/legacy/'" in compact_router,
    'remake route preserved': "url.pathname==='/remake/'" in compact_router,
    'start menu route header preserved': "headers.set('x-after-contact-route','start-menu')" in compact_router,
    'deployment controller preserved': 'installSharedDeploymentController(html)' in router,
    'static assets preserved': 'env.ASSETS.fetch(request)' in router,
    'base worker fallback preserved': 'baseWorker.fetch(request,env,ctx)' in compact_router,
    'single director state': director.count('let acDirector={') == 1,
    'live aiming owns camera': bool(aim_block),
    'aim camera uses fixed two vessel frame': 'battlePos=' in aim_block and 'camera.position.copy(battlePos)' in aim_block and 'framing=FIXED_TWO_VESSEL' in aim_block,
    'aim camera projection is stable through release': 'aimCamera:FIXED_TWO_VESSEL_POINTERDOWN_TO_RELEASE' in director and 'pointerProjection=STABLE' in aim_block and 'smoothstep(progress' not in aim_block,
    'aim camera synchronizes base focus': 'cameraLookTarget.copy(battleLook)' in aim_block,
    'lifecycle bridge does not rewrite camera': 'const oldCamera=' not in bridge and 'cameraChoreo' not in bridge and 'cameraOwner:PRESENTATION_DIRECTOR' in bridge,
    'live articulated muzzle reprojection preserved': 'acLiveMuzzle=acWarriorCutawayRig(selected)?.userData?.muzzle' in bridge and 'aimOriginWorld=acLiveMuzzle.getWorldPosition' in bridge and 'aimOriginStage=worldToStage(aimOriginWorld)' in bridge,
    'raw pointer drag owns release power': 'acRawStart=acDirector?.aimInputOrigin||startPx' in bridge and 'pt.x-acRawStart.x' in bridge,
    'single press shooter': 'xraySelectedCrew=w;xrayConfirmedShooter=w' in base and 'singleTap=Y aimSurface=FULL_BATTLEFIELD' in base,
    'locked shooter frames both ships before drag': 'if(xrayOpen&&xrayConfirmedShooter&&!aiming)' in director and 'camera.position.copy(battlePos)' in director and 'updateBattleCamera(true)' in base,
    'full battlefield is the aim surface': 'surface=FULL_BATTLEFIELD' in base and 'radius=150px' not in base and '>=10){' in base,
    'pre-aim target windows removed': 'patched.replace(/function acDirectorBuild3DWindow' in director and 'patched.replace(/acDirectorPreviewSolarWindows' in director and 'status.preAimClosed=' in director,
    'six physical bays preserved for all factions': 'bayLocals=[]' in base and 'for(let row=1;row>=0;row--)for(let col=0;col<3;col++)' in base and 'physicalInterior=6/6 logicalRooms=9' in base,
    'aurelian uses player sketch layout': 'buildAurelianDirectorHull' in base and "layout=${sketchLayout?.length===6?'PLAYER_SKETCH_STACKED':'2x3'}" in base and 'acCutawayBayLayout=specs.map' in base and 'points:s.points.map' in base,
    'aurelian pressure hull uses segmented front architecture': 'acAurelianModuleCollarGeometry' in base and 'AURELIAN_PRESSURE_COLLAR_' in base and 'acSegmentedFrontArchitecture=true' in base and 'acAurelianHullFrameGeometry' not in base,
    'rear hull follows angular pressure contour': 'function acAurelianOuterHullShape' in base and 'acAurelianRearHullGeometry()' in base and "new THREE.SphereGeometry(8.1,40,22)" not in base,
    'obsolete exposed brace scaffold removed': "AURELIAN_CENTRAL_WAIST" not in base and "const brace=box(9.0,.64,4.4" not in base,
    'six modules have deep exact exterior skins': 'acAurelianModuleGeometry(spec.points,2.72)' in base and 'AURELIAN_CURVED_ARMOR_CROWN_' in base and 'acCutawayBayPanel=true' in base,
    'pilot cockpit and solar cannon modules exist': 'AURELIAN_PILOT_OVAL_WINDOW' in base and 'AURELIAN_PILOT_SILHOUETTE_BODY' in base and 'AURELIAN_PILOT_WINDOW_FRAME' in base and 'AURELIAN_SOLAR_CANNON_BREECH' in base and 'AURELIAN_SOLAR_CANNON_BARREL' in base and 'AURELIAN_SOLAR_CANNON_MUZZLE' in base and 'AURELIAN_SOLAR_CANNON_CRADLE' in base,
    'nine logical combat rooms preserved': 'const logicalGroups=[[0,6],[1,7],[2,8],[3],[4],[5]]' in base and 'combatGrid=UNCHANGED' in base and 'logicalCombatRooms:NINE_UNCHANGED' in director,
    'three empty physical bays preserved': 'xrayRoomVisuals.length-crew.length' in base and 'physicalInterior:ALL_6_SEGMENTED_DEEP_ROLE_DRESSED' in cutaway,
    'cutaway action tray follows private cutaway': 'id="cutawayActionTray"' in base and "const show=!!(xrayOpen&&battleStarted&&!matchEnded)" in base and 'refreshCutawayActionTray();refreshMoraleHud();if(!xrayCrewCard)return' in base,
    'cutaway tray exposes real three-warrior team': "localXrayWarriors().filter(w=>!w.passive).slice(0,3)" in base and "button.dataset.crewIndex" in base and "selectXrayCrew(w);refreshCutawayActionTray()" in base,
    'fortress defense is contextual and stateful': "key:'solar_wall',name:'SOLAR WALL',uses:1" in base and "key:'countermeasure_flares',name:'COUNTERMEASURE FLARES',uses:2" in base and 'state.armed=true;state.usesRemaining--' in base and 'ARMED • HIDDEN' in base,
    'solar wall and flares intercept only canonical attacks': "key==='solar_wall'?{triggered:true,blocked:true,blockCount:0}" in base and "key==='countermeasure_flares'&&weaponKey==='bombardier'?{triggered:true,blocked:false,blockCount:2}" in base and 'ATTACK COMPLETELY BLOCKED' in base and 'spawnFortressDefenseTrigger' in base,
    'multiplayer defense state is private and authoritative': 'defenseView(side)' in worker and "m.type==='arm_defense'" in worker and 'morale<50' in worker and 'defense.usesRemaining-1' in worker and 'defenseTrigger' in worker,
    'network interception suppresses weapon resolution': "if(m.blocked&&m.defenseTrigger)" in base and "else fireWarriorFromStage(w,m.point,m.power,true,routed)" in base,
    'countermeasure flares block two missiles individually': 'flareBlocks=pendingDefenseInterception' in base and 'intercepted=q.flareBlocks>0' in base and "diag('COUNTERMEASURE INTERCEPT'" in base and 'blockCount:2' in worker,
    'cutaway tray is mobile safe-area aware': '#cutawayActionTray' in base and 'env(safe-area-inset-right)' in base and 'env(safe-area-inset-bottom)' in base,
    'morale starts at twenty five with locked thresholds': 'const MORALE_START=25,MORALE_DEFENSE_THRESHOLD=50,MORALE_CANNON_THRESHOLD=100' in base and 'LOCKED • MORALE ${morale}/${MORALE_DEFENSE_THRESHOLD}' in base,
    'morale hud separates live and stale intelligence': 'id="ownMoraleValue"' in base and 'LAST KNOWN ENEMY' in base and 'opponentMoraleIntel' in base,
    'morale hud is contextual and corner sized': 'battleStarted&&!matchEnded&&xrayOpen&&mine' in base and '.moraleSide:first-child{left:' in base and '.moraleSide.intel{right:' in base and 'width:104px' in base,
    'cutaway controls leave battlefield clear': '.cutawayCrewBtn{position:relative;width:40px;height:40px' in base and '#stageShell.cutawayOpen #movePad' in base,
    'targetable breach removes module persistently': 'breach<EXPOSURE_THRESHOLDS.targetable&&!room.solarPenetrated' in base and 'ensureStructureLossVoid(room)' in base,
    'destroyed compartment preserves exposed survivor': 'function exposeCrewInErasedCompartment' in base and 'relocation=NONE' in base and 'directTarget=Y' in base and 'relocateCrewFromErasedCompartment' not in base,
    'exposed survivor wins direct aim before erased room filtering': 'const exposedWarrior=warriors.filter' in base and 'exposedCrew:true' in base and 'exposedWarriorScreenRect' in base,
    'direct attacks damage crew in erased bays': 'EXPOSED CREW DIRECT HIT' in base and 'hit.room.erased&&hit.warrior' in base and 'DIRECT CREW HIT' in base,
    'earth sniper can target exposed crew': "placement:'EXPOSED CREW'" in (root / 'game-html-patcher.js').read_text(encoding='utf-8'),
    'solar lancer uses canonical heavy staged sniper damage': "damage:52,armorDamage:80" in base and 'duration:3.60,stageInterval:.88,maxCompartments:3' in base and 'projected-sniper-aim separate-penetration-traces' in solar_lancer and 'heavy-sustained-penetration' not in solar_lancer,
    'solar lancer preview and release share one projection solver': 'function projectedPrecisionAimPoint(origin,pointer)' in solar_aim_block and "precisionPoint=wp.kind==='laser'?projectedPrecisionAimPoint(a,b):b" in solar_aim_block and 'renderEnemyAimOutlines(precisionPoint)' in solar_aim_block and 'projectedPrecisionAimPoint(aimOriginStage,pt)' in game_patcher and "selected?.weaponKey==='solar_lancer'" in solar_lancer,
    'solar lancer obsolete cyan fan is removed': 'solarFanAimGuide' not in base and 'replace its preview' in solar_lancer,
    'solar lancer shows projected cabin targeting': "solar=selected.weaponKey==='solar_lancer',precision=sniper||solar" in solar_aim_block and "hotStroke=solar?'#fff0a6'" in solar_aim_block and "precisionCrosshair=document.getElementById('sniperCrosshair')" in solar_aim_block,
    'solar lancer resolves exactly one cabin per stage': 'const hit=path[stageIndex]' in solar_resolve_block and 'for(const hit of path)' not in solar_resolve_block and 'b.stage<b.path.length' in solar_animate_block and 'if(!matchEnded&&!b.blocked' in solar_animate_block and 'while(!matchEnded&&b.tick<10' not in base,
    'solar lance visibly extends between cabin contacts': 'beam.visualFrom.copy(beam.visualEnd)' in solar_resolve_block and 'beam.extensionProgress=0' in solar_resolve_block and 'b.visualEnd.copy(b.visualFrom).lerp(b.end,e)' in solar_animate_block,
    'solar lance renders separate persistent cabin traces': 'function makeSolarPenetrationTrace' in base and 'beam.segments.push(makeSolarPenetrationTrace' in solar_resolve_block and 'for(const trace of b.segments||[])' in solar_animate_block and 'trace.length*ease' in solar_animate_block,
    'solar lancer damage diminishes across three cabins': 'const falloff=[1,.72,.50][stageIndex]' in solar_resolve_block and 'stageIndex===0?absorbShieldHit' in solar_resolve_block and 'later stages are already inside the envelope' in solar_resolve_block,
    'solar lancer mobile description matches immediate attack': 'immediate lance that visibly stages through up to three cabins' in deployment and 'sustained penetrating solar laser' not in deployment,
    'solar lancer multiplayer lock matches presentation': "allowedWeapon==='solar_lancer'?3900" in worker and 'settleUntil=performance.now()+3600' in director,
    'solar lancer camera safely frames both vessels': "center=a.clone().lerp(b,.50)" in director and "Math.abs(b.x-a.x)+58" in director and 'camera.lookAt(center)' in director,
    'solar lancer preserves release muzzle for beam life': 'const beamStart=b.start.clone(),beamEnd=b.visualEnd.clone()' in base and 'muzzleWorld(b.attacker' not in base,
    'targetable cabin removes opaque scar': 'room.erased||breach>=EXPOSURE_THRESHOLDS.targetable' in base and 'if(room.exteriorScar)room.exteriorScar.visible=false' in base and 'room.erasureVoid=makeCompartmentVoid(room,room.local.y)' in base,
    'exposed survivor renders above wreck cavity': 'acNativeTransparent' in base and 'material.transparent=exposed?true' in base and 'o.renderOrder=exposed?78' in base and 'EXPOSED_WARRIOR_BRACKETS_' in base,
    'combat survivors use official character artwork': 'const COMBAT_CHARACTER_ART=Object.freeze' in base and 'function attachCombatCharacterArt' in base and 'ACTUAL_CHARACTER_ART_' in base and "w.sprite=model.userData.combatCharacterSprite||null" in base and all(path in base for path in ['/bombardier.webp','/earth-sniper.webp','/combat-controller.webp','/solar-lancer.webp','/sun-disk-gunner-hq.webp','/sunadier-hq.webp']),
    'exposed survivor cue follows room and visibility': 'if(w.exposureBeacon)w.exposureBeacon.position.copy(room.local)' in base and 'w.exposureBeacon.visible=!!(combatExposed&&show&&w.active&&w.hp>0)' in base and 'animateExposedWarriorBeacons();' in base,
    'multiplayer morale view is private and authoritative': 'moraleView(side)' in worker and 'broadcastWithMorale' in worker and 'moraleView:this.moraleView(side)' in worker,
    'morale resets on solo and network battle lifecycle': base.count('resetMoraleState()') >= 3 and 'applyMoraleView(m.moraleView' in base,
    'morale settles once per completed action': "finalizeMoraleAction('turn complete')" in base and 'gain=action.totalDamage>0?Math.min(15,10+' in base and 'action.structureDamage>=120?15:action.structureDamage>=60?10' in base,
    'shield structure and unit damage feed morale ledger': "recordMoraleDamage(attacker,absorbed,'shield')" in base and "recordMoraleDamage(attacker,dealt,'structure')" in base and "recordMoraleDamage(attacker,dealt,'unit')" in base and 'STRUCTURAL FIRE|ACID STACK' in base,
    'multiplayer morale result is shot bound and capped': "type:'morale_result',shotId:action.shotId" in base and "m.type==='morale_result'" in worker and 'pending.shotId!==shotId' in worker and 'Math.min(15' in worker,
    'room cage edge geometry removed': 'const rim=null;' in base and 'new THREE.EdgesGeometry(new THREE.BoxGeometry(roomW,roomH,roomD))' not in base,
    'presentation director owns five-step bay seal': 'visuals.length!==6' in director and 'setCutawayBayOpen(visual,!shouldClose)' in director and "closed='+closeCount+'/'+order.length" in director,
    'lifecycle bridge does not replace seal authority': 'const oldSeal=' not in bridge and 'status.shellOwnership=patched.includes' in bridge,
    'aurelian cutaway hides only its six exterior modules': 'acCutawayBayPanels?.length===6' in base and 'for(const panel of skin.userData.acCutawayBayPanels)hide(panel)' in base and 'structuralHull=VISIBLE' in base,
    'aurelian closure restores exact module objects': 'if(visual.exteriorPanel)visual.exteriorPanel.visible=!open' in base and 'exteriorAuthority=UNIFIED_PRESSURE_HULL_EXACT_MODULES' in director and 'exactExteriorModules=' in director,
    'generated replacement hull sectors removed': 'buildAurelianHullSector' not in base and 'CUTAWAY_EXACT_EXTERIOR_HULL_SECTOR_' not in base and 'shellDetailBuckets' not in director,
    'obsolete box closure decoration removed': 'CUTAWAY_FRONT_SHUTTER_SOLAR_RAIL_' not in base and 'CUTAWAY_FRONT_SHUTTER_SOLAR_NODE_' not in base,
    'six bays have faction-specific readable interiors': 'const bayPalette=' in base and 'CUTAWAY_BAY_INTERIOR_' in base and 'CUTAWAY_BAY_CONDUIT_' in base and 'CUTAWAY_BAY_CONSOLE_' in base and 'CUTAWAY_BAY_BACKLIGHT_' in base,
    'aurelian interiors follow exterior shapes': 'acAurelianBayBackGeometry(layoutSpec.points' in base and 'aurelianBay?Math.max(5.3,layoutSpec.w*.84)' in base and 'cell.userData.acModuleRole' in base,
    'aurelian interior walls follow aperture polygons': 'CUTAWAY_BAY_SHAPED_WALL_' in base and 'edgePoints=layoutSpec.points.map' in base and 'edge.rotation.z=Math.atan2(dy,dx)' in base and 'SIX_SEGMENTED_DEEP_PRESSURE_BAYS' in director,
    'six aurelian interiors have distinct roles': 'acDressAurelianBay(interiorRoot,layoutSpec.role' in base and all(name in base for name in ['CUTAWAY_PILOT_COMMAND_CONSOLE','CUTAWAY_SOLAR_REACTOR','CUTAWAY_ARMORY_RACK','CUTAWAY_TARGETING_TABLE','CUTAWAY_SOLAR_CANNON_CORE']),
    'cabinet door back panels removed': 'CUTAWAY_BAY_RECESSED_WALL_' not in base,
    'closed bay hides complete interior root': 'function setCutawayBayOpen(visual,open)' in base and 'interior.visible=!!open' in base and 'shutter.visible=!open' in base and 'closedBayInterior:HIDDEN' in director,
    'sunadier primary tracked': 'acDirectorTrackProjectile(attacker,grenade' in director,
    'sun disk tracked': 'acDirectorTrackProjectile(attacker,visual.group' in director,
    'solar beam tracked': 'acDirectorBeginBeam(attacker,start,beamPath)' in director,
    'scatter cannot steal camera': 'SUNADIER PLASMA SCATTER' in director and 'presentImpact=!secondaryScatter' in director,
    'projectile camera biases enemy': 'enemyBias=.38+progress*.48' in director,
    'turn waits for VFX': 'acDirectorWaitForPresentation' in director and 'TURN VFX HOLD' in director and 'TURN VFX RELEASE' in director,
    'presentation settle phase': "acDirector.mode='settle'" in director,
    'solo canonical handoff': "setSoloTurn('earth')" in director,
    'multiplayer transition cleanup': "scheduleXrayForTurn('multiplayer transition')" in director,
    'release seals firing stage': 'acDirectorForceFiringStage(selected)' in director and 'releaseSeal:false' in director,
    'release pose follows authoritative point': 'acWarriorPoseAim(acReleaseWarrior,releasePt,true)' in weapon_origin,
    'weapon attachments follow elbow hierarchy': 'elbow.add(emitter)' in base and 'const hand=elbowRoots[1]' in base,
    'aim pose uses weapon-specific projected solvers': 'LANCE_PROJECTED_AXIS' in weapon_origin and 'DUAL_FOREARM_IK' in weapon_origin and 'CHAIN_PROJECTED_AXIS' in weapon_origin and 'acAimAlignProjected' in weapon_origin,
    'aim pose uses stable raw drag authority': 'inputOrigin=acDirector?.aimInputOrigin||startPx||liveOrigin' in weapon_origin and 'dx*direction<12' in weapon_origin and 'acStableAimAngle' in weapon_origin and 'source=RAW_DRAG_STABLE' in weapon_origin,
    'aim pose excludes invalid reverse target': "['solar_lancer','sun_disk_gunner','sunadier'].includes(key)" in weapon_origin and 'dragDistance<14' in weapon_origin,
    'aim pose coordinates full body': 'FEET>LEGS>HIPS>TORSO>SHOULDERS>HEAD>ARMS>WEAPON' in weapon_origin and 'leftLeg.rotation.z=' in weapon_origin and 'head.rotation.y=' in weapon_origin and 'shoulders.rotation.y=' in weapon_origin and 'cloth.rotation.y=' in weapon_origin,
    'aim arms use real rebuilt elbow joints': 'body.elbowL||body.elbowRoots?.[0]' in weapon_origin and 'body.elbowR||body.elbowRoots?.[1]' in weapon_origin and 'acAimSolveArm' in weapon_origin,
    'aim pose has weight shift': 'weightShift=ACTIVE' in weapon_origin and 'pelvis.position.y=' in weapon_origin and 'rightLeg.position.y=' in weapon_origin,
    'aim pose has recoil and smooth recovery': 'recoil=FULL_BODY_BRACED recovery=SMOOTH_460MS' in weapon_origin and 'duration=460' in weapon_origin and 'alpha*alpha*(3-2*alpha)' in weapon_origin,
    'release resamples posed muzzle': 'aimOriginWorld=flashPos.clone()' in weapon_origin and 'aimOriginStage=worldToStage(aimOriginWorld)' in weapon_origin,
    'aim pose recorder proof': "diag('WARRIOR AIM BODY'" in weapon_origin and 'muzzle=LIVE rawTarget=UNCHANGED' in weapon_origin,
    'aurelian model artwork upgraded': 'ac-aurelian-rebuilt-models-v0419' in rebuilt_models and 'curvedBreastplate' in rebuilt_models and 'helmetSolarCrest' in rebuilt_models and 'chestSunRay' in rebuilt_models and 'solarBackWing' in rebuilt_models and 'diskScale=sx>0?1.20:.84' in rebuilt_models and 'SphereGeometry(.64,22,16)' in rebuilt_models,
    'reference ship art uses layered bronze and gold': 'ac-aurelian-reference-polish-v0490' in reference_polish and 'AURELIAN_DOOR_STEPPED_BEZEL_' in reference_polish and 'AURELIAN_REFERENCE_DORSAL_ARMOR' in reference_polish and 'referenceMatch:HERO_BRONZE_GOLD_LAYERED' in reference_polish,
    'hero ship pass has large interlocking armor masses': 'AURELIAN_HERO_DORSAL_CROWN_A' in reference_polish and 'AURELIAN_HERO_VENTRAL_KEEL_B' in reference_polish and 'AURELIAN_HERO_PROW_CAP' in reference_polish,
    'hero ship pass has breakaway bay armor': 'AURELIAN_BREAKAWAY_ARMOR_LEAF_' in reference_polish and 'armor:BREAKAWAY_LEAVES' in reference_polish,
    'hero ship pass has deep engine architecture': 'AURELIAN_HERO_ENGINE_COWL_UPPER' in reference_polish and 'AURELIAN_HERO_ENGINE_VANE' in reference_polish and 'AURELIAN_HERO_ENGINE_CORE' in reference_polish,
    'breach stages shed angular armor chunks': 'function spawnArmorBreakaway(room,stage=3)' in destruction and 'THREE.ExtrudeGeometry(shape' in destruction and 'spawnArmorBreakaway(room,5)' in destruction,
    'reference cockpit is elongated and glazed': 'AURELIAN_COCKPIT_ARMORED_SLED' in reference_polish and 'AURELIAN_COCKPIT_GLAZING' in reference_polish and 'AURELIAN_COCKPIT_AFT_SPEAR' in reference_polish,
    'reference cannon and prow are integrated': 'AURELIAN_CANNON_ARMORED_CRADLE' in reference_polish and 'AURELIAN_CANNON_CONTAINED_ENERGY' in reference_polish and 'AURELIAN_PROW_LENS_CORE' in reference_polish,
    'reference engine silhouette is triple cowled': "for(const y of[-4.8,0,4.8])" in reference_polish and 'AURELIAN_REFERENCE_ENGINE_FAIRING' in reference_polish and 'engines:TRIPLE_DEEP_COWLED' in reference_polish,
    'aurelian rigs composed, enlarged and relit': 'ac-aurelian-cutaway-composition-v0419' in cutaway_composition and 'multiplyScalar(.92)' in cutaway_composition and 'multiplyScalar(aurelianBay?1.16:1.04)' in base and 'SIX_BAY_ARTICULATED_HIGH_DETAIL_SILHOUETTES' in cutaway_composition and 'restPose:CAPTURED' in cutaway_composition,
    'natural idle animation is connected': 'function acAnimateAurelianWarriorIdle' in rebuilt_models and "typeof acAnimateAurelianWarriorIdle==='function'" in base and 'acAimActiveUntil' in weapon_origin,
    'v0421 build marker': 'MATCH RECORDER v0.42.1' in director and '2026-09-07_SEGMENTED_MODULE_HULL_DEEP_BAYS' in director,
}
impact_start = director.find('function spawnImpactCompartmentReveal(attacker,hit,duration=1450)')
impact_end = director.find('const impactRegex=', impact_start)
impact_block = director[impact_start:impact_end] if impact_start >= 0 and impact_end > impact_start else ''
checks['enemy impact follows persistent breach state'] = bool(impact_block) and 'PERSISTENT BREACH FEEDBACK' in impact_block and 'crewExposureTier(room)>=3' in impact_block and 'syncWarriorConcealment(occ)' in impact_block
checks['enemy impact does not build interior'] = bool(impact_block) and 'new THREE.Group' not in impact_block and 'buildCutawayOnlyWarrior3D' not in impact_block and 'IMPACT 3D WINDOW' not in impact_block
checks['damage feedback preserves open breach'] = 'syncExteriorBattleScar(room)' in impact_block and 'feedback=SCAR+VOID+DEBRIS+CREW' in impact_block and 'enemyDamage:PROGRESSIVE_PERSISTENT_BREACH' in director
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(('OK   ' if ok else 'FAIL ') + name)
if failed:
    print('\nPresentation audit failed: ' + ', '.join(failed), file=sys.stderr)
    raise SystemExit(1)
print('\nPresentation audit passed.')
