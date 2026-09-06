function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAimLifecycleBridgeRuntime(html) {
  if (html.includes('ac-aim-lifecycle-bridge-v0403')) return html;
  let patched = html;
  const status = { liveStep:false, originDiag:false };

  // The director previously updated aimTargetProgress from pointer motion but relied on
  // updateBattleCamera() to advance the smoothed presentation. That left the hull seal
  // disconnected whenever the camera path did not own the current frame. Advance the
  // presentation from the authoritative aim gesture too; camera remains an observer.
  patched = replaceOnce(
    patched,
    "function acDirectorUpdateAimTarget(attacker,pt){acDirector.aimTargetProgress=acDirectorAimTarget(attacker,pt)}",
    "function acDirectorUpdateAimTarget(attacker,pt){acDirector.aimTargetProgress=acDirectorAimTarget(attacker,pt);acDirectorStepAimPresentation(performance.now())}",
    status,
    'liveStep'
  );

  // Instrument the actual two origins instead of guessing. AIM START's x/y is the finger
  // coordinate; startPx is the projected muzzle coordinate used by the canonical shot.
  // This makes any future mismatch explicit in the recorder without rebasing ballistics.
  patched = replaceOnce(
    patched,
    "aimOriginWorld=cutawayMuzzle?cutawayMuzzle.getWorldPosition(new THREE.Vector3()):muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};currentPx={x:pt.x,y:pt.y};setAimVisual(startPx,currentPx);return true",
    "aimOriginWorld=cutawayMuzzle?cutawayMuzzle.getWorldPosition(new THREE.Vector3()):muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};currentPx={x:pt.x,y:pt.y};diag('AIM ORIGIN AUTHORITY','weapon='+selected.weaponKey+' muzzle='+Math.round(startPx.x)+','+Math.round(startPx.y)+' pointer='+Math.round(pt.x)+','+Math.round(pt.y)+' source='+(cutawayMuzzle?'CUTAWAY_MUZZLE':'BASE_MUZZLE'));setAimVisual(startPx,currentPx);return true",
    status,
    'originDiag'
  );

  const summary = Object.entries(status).map(([k,v]) => k+':' +(v?'OK':'MISS')).join(' ');
  return patched.replace('</head>', '<meta id="ac-aim-lifecycle-bridge-v0403" name="ac-aim-lifecycle-bridge" content="'+summary+' ballistics:UNCHANGED camera:OBSERVER hullSeal:GESTURE_DRIVEN">\n</head>');
}
