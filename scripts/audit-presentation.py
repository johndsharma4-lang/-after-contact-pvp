from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
router = (root / 'router-worker.js').read_text(encoding='utf-8')
director = (root / 'combat-presentation-director-runtime.js').read_text(encoding='utf-8')
bridge = (root / 'aim-lifecycle-bridge-runtime.js').read_text(encoding='utf-8')
cutaway = (root / 'aurelian-logical-cutaway-runtime.js').read_text(encoding='utf-8')
weapon_origin = (root / 'warrior-weapon-origin-runtime.js').read_text(encoding='utf-8')
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
    'aim camera fixed on physical shooter': 'standAnchor?.getWorldPosition' in aim_block and 'camera.position.copy(targetPos)' in aim_block and 'fixedDuringPointer=Y' in aim_block,
    'aim camera has no enemy framing': 'enemyRoot' not in aim_block and '.lerp(enemy' not in aim_block and 'enemyFraming=N' in aim_block,
    'aim camera synchronizes base focus': 'cameraLookTarget.copy(targetLook)' in aim_block,
    'lifecycle bridge does not rewrite camera': 'const oldCamera=' not in bridge and 'cameraChoreo' not in bridge and 'cameraOwner:PRESENTATION_DIRECTOR' in bridge,
    'physical muzzle reprojection preserved': 'aimOriginStage=worldToStage(aimOriginWorld)' in bridge,
    'single press shooter': 'xrayConfirmedShooter=w' in director and 'singlePress=Y' in director,
    'pre-aim target windows removed': 'patched.replace(/function acDirectorBuild3DWindow' in director and 'patched.replace(/acDirectorPreviewSolarWindows' in director and 'status.preAimClosed=' in director,
    'aurelian room cage rims hidden': 'v.rim.visible=false' in cutaway and 'roomCageRimsHidden=' in cutaway,
    'real 3d warrior window': 'buildCutawayOnlyWarrior3D' in director,
    'impact window is 3d': 'IMPACT 3D WINDOW' in director,
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
    'v0411 build marker': 'MATCH RECORDER v0.41.1' in director and '2026-09-07_AIM_DIRECTOR_SHOOTER_LOCK' in director,
}
impact_start = director.find('function spawnImpactCompartmentReveal(attacker,hit,duration=1450)')
impact_end = director.find('const impactRegex=', impact_start)
impact_block = director[impact_start:impact_end] if impact_start >= 0 and impact_end > impact_start else ''
checks['impact room window has no THREE.Sprite'] = bool(impact_block) and 'THREE.Sprite' not in impact_block and 'CanvasTexture' not in impact_block
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(('OK   ' if ok else 'FAIL ') + name)
if failed:
    print('\nPresentation audit failed: ' + ', '.join(failed), file=sys.stderr)
    raise SystemExit(1)
print('\nPresentation audit passed.')
