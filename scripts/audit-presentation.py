from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
router = (root / 'router-worker.js').read_text(encoding='utf-8')
director = (root / 'combat-presentation-director-runtime.js').read_text(encoding='utf-8')

checks = {
    'director imported once': router.count('patchCombatPresentationDirectorRuntime') == 2,
    'old cutaway lifecycle inactive': 'patchCutawayLifecycleRuntime' not in router,
    'old aim hard fix inactive': 'patchAimCameraHardFixRuntime' not in router,
    'unsafe reference fidelity startup patch inactive': 'patchAurelianReferenceFidelityRuntime' not in router,
    'durable object export preserved': "export { MyDurableObject } from './after-contact-worker.js';" in router,
    'root route preserved': "url.pathname === '/'" in router and "url.pathname === '/index.html'" in router,
    'legacy route preserved': "url.pathname === '/legacy/'" in router,
    'remake route preserved': "url.pathname === '/remake/'" in router,
    'start menu route header preserved': "headers.set('x-after-contact-route', 'start-menu')" in router,
    'deployment controller preserved': 'installSharedDeploymentController(html)' in router,
    'static assets preserved': 'env.ASSETS.fetch(request)' in router,
    'base worker fallback preserved': 'baseWorker.fetch(request, env, ctx)' in router,
    'single director state': director.count('let acDirector={') == 1,
    'live aiming owns camera': 'xrayOpen&&aiming&&selected' in director,
    'single press shooter': 'xrayConfirmedShooter=w' in director and 'singlePress=Y' in director,
    'solar 3d target windows': 'SOLAR 3D AIM WINDOWS' in director and '3D TARGET WINDOW' in director and 'sequential=Y' in director,
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
    'v0341 build marker': 'MATCH RECORDER v0.34.1' in director,
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
