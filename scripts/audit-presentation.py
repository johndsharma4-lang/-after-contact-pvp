from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
router = (root / 'router-worker.js').read_text(encoding='utf-8')
director = (root / 'combat-presentation-director-runtime.js').read_text(encoding='utf-8')
bridge = (root / 'aim-lifecycle-bridge-runtime.js').read_text(encoding='utf-8')
cutaway = (root / 'aurelian-logical-cutaway-runtime.js').read_text(encoding='utf-8')
weapon_origin = (root / 'warrior-weapon-origin-runtime.js').read_text(encoding='utf-8')
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
    'presentation director owns five-step bay seal': 'visuals.length!==6' in director and 'frontShutter' in director and 'acAimClosed=shouldClose' in director and "closed='+closeCount+'/'+order.length" in director,
    'lifecycle bridge does not replace seal authority': 'const oldSeal=' not in bridge and 'status.shellOwnership=patched.includes' in bridge,
    'aurelian closure uses actual exterior silhouette': "shell.name='AURELIAN_UNIFIED_EXTERIOR_HULL'" in base and 'skin.userData.acPrimaryHull=shell' in base and 'closureHull?.userData?.acHullRadii' in base,
    'aurelian closure uses one curved hull equation': 'buildAurelianHullSector(local)' in base and 'CUTAWAY_CURVED_HULL_SECTOR_' in base and 'hullDepth*Math.sqrt(Math.max(0,1-rad*rad))' in base,
    'aurelian closure restores continuous solar trim': 'CUTAWAY_CONTINUOUS_SOLAR_BAND_' in base and 'CUTAWAY_HULL_SOLAR_CORE' in base,
    'obsolete box closure decoration removed': 'CUTAWAY_FRONT_SHUTTER_SOLAR_RAIL_' not in base and 'CUTAWAY_FRONT_SHUTTER_SOLAR_NODE_' not in base,
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
    'aim pose coordinates full body': 'LEGS>HIPS>TORSO>HEAD>ARMS>WEAPON' in weapon_origin and 'leftLeg.rotation.z=' in weapon_origin and 'head.rotation.y=' in weapon_origin and 'torso.position.x=' in weapon_origin,
    'aim pose has recoil and recovery': 'recoil=FULL_BODY' in weapon_origin and 'acWarriorRelaxPose' in weapon_origin and 'requestAnimationFrame(settle)' in weapon_origin,
    'release resamples posed muzzle': 'aimOriginWorld=flashPos.clone()' in weapon_origin and 'aimOriginStage=worldToStage(aimOriginWorld)' in weapon_origin,
    'aim pose recorder proof': "diag('WARRIOR AIM BODY'" in weapon_origin and 'muzzle=LIVE rawTarget=UNCHANGED' in weapon_origin,
    'v0415 build marker': 'MATCH RECORDER v0.41.5' in director and '2026-09-07_SIX_BAY_ALL_FACTIONS' in director,
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
