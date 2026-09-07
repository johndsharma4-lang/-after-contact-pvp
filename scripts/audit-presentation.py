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
base = (root / 'index.html').read_text(encoding='utf-8')
compact_router = ''.join(router.split())

aim_start = director.find('if(xrayOpen&&aiming&&selected){')
aim_end = director.find("if(acDirector.mode==='travel'", aim_start)
aim_block = director[aim_start:aim_end] if aim_start >= 0 and aim_end > aim_start else ''

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
    'aim camera starts on physical shooter': 'standAnchor?.getWorldPosition' in aim_block and 'closePos=' in aim_block,
    'aim camera progressively reaches battlefield': 'battlePos=' in aim_block and '.lerp(battlePos,pullback)' in aim_block and 'framing=SHOOTER_TO_BATTLEFIELD' in aim_block,
    'enemy visible at full aim contract': 'enemyVisibleAtFullAim:Y' in director and "enemyVisible='+(progress>=.96?'Y':'N')" in aim_block,
    'aim camera synchronizes base focus': 'cameraLookTarget.copy(targetLook)' in aim_block,
    'lifecycle bridge does not rewrite camera': 'const oldCamera=' not in bridge and 'cameraChoreo' not in bridge and 'cameraOwner:PRESENTATION_DIRECTOR' in bridge,
    'live articulated muzzle reprojection preserved': 'acLiveMuzzle=acWarriorCutawayRig(selected)?.userData?.muzzle' in bridge and 'aimOriginWorld=acLiveMuzzle.getWorldPosition' in bridge and 'aimOriginStage=worldToStage(aimOriginWorld)' in bridge,
    'raw pointer drag owns release power': 'acRawStart=acDirector?.aimInputOrigin||startPx' in bridge and 'pt.x-acRawStart.x' in bridge,
    'single press shooter': 'xrayConfirmedShooter=w' in director and 'singlePress=Y' in director,
    'pre-aim target windows removed': 'patched.replace(/function acDirectorBuild3DWindow' in director and 'patched.replace(/acDirectorPreviewSolarWindows' in director and 'status.preAimClosed=' in director,
    'six physical bays shared by all factions': 'bayLocals=[]' in base and 'for(let row=1;row>=0;row--)for(let col=0;col<3;col++)' in base and 'physicalInterior=6/6 logicalRooms=9' in base,
    'nine logical combat rooms preserved': 'const logicalGroups=[[0,6],[1,7],[2,8],[3],[4],[5]]' in base and 'combatGrid=UNCHANGED' in base and 'logicalCombatRooms:NINE_UNCHANGED' in director,
    'three empty physical bays preserved': 'xrayRoomVisuals.length-crew.length' in base and 'physicalInterior:ALL_6_VISIBLE' in cutaway,
    'room cage edge geometry removed': 'const rim=null;' in base and 'new THREE.EdgesGeometry(new THREE.BoxGeometry(roomW,roomH,roomD))' not in base,
    'presentation director owns five-step bay seal': 'visuals.length!==6' in director and 'setCutawayBayOpen(visual,!shouldClose)' in director and "closed='+closeCount+'/'+order.length" in director,
    'lifecycle bridge does not replace seal authority': 'const oldSeal=' not in bridge and 'status.shellOwnership=patched.includes' in bridge,
    'cutaway recursively removes the exterior at its source': 'skin?.traverse?.(mesh=>' in base and 'protectedVisual' in base and 'xrayShellState.push({mesh,visible:mesh.visible})' in base,
    'aurelian closure uses actual exterior silhouette': "shell.name='AURELIAN_UNIFIED_EXTERIOR_HULL'" in base and 'skin.userData.acPrimaryHull=shell' in base and 'closureHull?.userData?.acHullRadii' in base,
    'aurelian closure uses exact hull depth and center': 'buildAurelianHullSector(cell.position)' in base and 'CUTAWAY_EXACT_EXTERIOR_HULL_SECTOR_' in base and 'hullRadiusZ*Math.sqrt(Math.max(0,1-rad*rad))' in base and 'hullCenter.z+surfaceZ-local.z' in base,
    'aurelian closure restores exact solar trim': 'CUTAWAY_EXACT_SOLAR_BAND_' in base and 'CUTAWAY_EXACT_HULL_SOLAR_CORE' in base,
    'localized original exterior details close by bay': 'shellDetailBuckets' in director and 'detailBuckets[best].push(entry)' in director and 'entry.mesh.visible=shouldClose' in director and 'localizedExteriorDetails:RESTORED' in director,
    'obsolete box closure decoration removed': 'CUTAWAY_FRONT_SHUTTER_SOLAR_RAIL_' not in base and 'CUTAWAY_FRONT_SHUTTER_SOLAR_NODE_' not in base,
    'six bays have faction-specific readable interiors': 'const bayPalette=' in base and 'CUTAWAY_BAY_INTERIOR_' in base and 'CUTAWAY_BAY_CONDUIT_' in base and 'CUTAWAY_BAY_CONSOLE_' in base and 'CUTAWAY_BAY_BACKLIGHT_' in base,
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
    'aim pose uses weapon-specific rest axes': "key==='solar_lancer'?Math.PI/2:key==='sun_disk_gunner'?-Math.PI/2" in weapon_origin and 'CHAIN_GRENADE_AXIS' in weapon_origin,
    'aim pose uses stable raw drag authority': 'inputOrigin=acDirector?.aimInputOrigin||startPx||liveOrigin' in weapon_origin and 'dx*direction<12' in weapon_origin and 'acStableAimAngle' in weapon_origin and 'source=RAW_DRAG_STABLE' in weapon_origin,
    'aim pose excludes invalid reverse target': "['solar_lancer','sun_disk_gunner','sunadier'].includes(key)" in weapon_origin and 'dragDistance<14' in weapon_origin,
    'aim pose coordinates full body': 'FEET>LEGS>HIPS>TORSO>SHOULDERS>HEAD>ARMS>WEAPON' in weapon_origin and 'leftLeg.rotation.z=' in weapon_origin and 'head.rotation.y=' in weapon_origin and 'shoulders.rotation.y=' in weapon_origin and 'cloth.rotation.y=' in weapon_origin,
    'aim pose has weight shift': 'weightShift=ACTIVE' in weapon_origin and 'pelvis.position.y=' in weapon_origin and 'rightLeg.position.y=' in weapon_origin,
    'aim pose has recoil and smooth recovery': 'recoil=FULL_BODY recovery=SMOOTH_390MS' in weapon_origin and 'duration=390' in weapon_origin and 'alpha*alpha*(3-2*alpha)' in weapon_origin,
    'release resamples posed muzzle': 'aimOriginWorld=flashPos.clone()' in weapon_origin and 'aimOriginStage=worldToStage(aimOriginWorld)' in weapon_origin,
    'aim pose recorder proof': "diag('WARRIOR AIM BODY'" in weapon_origin and 'muzzle=LIVE rawTarget=UNCHANGED' in weapon_origin,
    'aurelian model artwork upgraded': 'ac-aurelian-rebuilt-models-v0417' in rebuilt_models and 'solarCollar' in rebuilt_models and 'chestFiligree' in rebuilt_models and 'MOBILE_READABLE_MAJOR_SILHOUETTES' in rebuilt_models and 'SphereGeometry(.52,16,12)' in rebuilt_models,
    'aurelian rigs enlarged and relit': 'ac-aurelian-cutaway-composition-v0417' in cutaway_composition and 'multiplyScalar(.76)' in cutaway_composition and 'SIX_BAY_MOBILE_READABLE_MAJOR_SILHOUETTES' in cutaway_composition and 'scale.setScalar(1.08)' in cutaway_composition,
    'v0417 build marker': 'MATCH RECORDER v0.41.7' in director and '2026-09-07_CLEAN_HULL_STABLE_CREW_POSE' in director,
}
impact_start = director.find('function spawnImpactCompartmentReveal(attacker,hit,duration=1450)')
impact_end = director.find('const impactRegex=', impact_start)
impact_block = director[impact_start:impact_end] if impact_start >= 0 and impact_end > impact_start else ''
checks['enemy impact keeps hull closed'] = bool(impact_block) and 'hullClosed=Y compartmentReveal=N' in impact_block and 'module.visible=false' not in impact_block and 'removedPanels' not in impact_block
checks['enemy impact does not build interior'] = bool(impact_block) and 'new THREE.Group' not in impact_block and 'buildCutawayOnlyWarrior3D' not in impact_block and 'IMPACT 3D WINDOW' not in impact_block
checks['closed hull uses existing damage feedback'] = 'syncExteriorBattleScar(room)' in impact_block and 'feedback=SCAR+SPARKS+SMOKE+FIRE+HUD' in impact_block and 'enemyDamage:EXTERIOR_ONLY' in director
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(('OK   ' if ok else 'FAIL ') + name)
if failed:
    print('\nPresentation audit failed: ' + ', '.join(failed), file=sys.stderr)
    raise SystemExit(1)
print('\nPresentation audit passed.')
