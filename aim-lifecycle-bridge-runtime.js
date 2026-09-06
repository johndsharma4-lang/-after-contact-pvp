function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAimLifecycleBridgeRuntime(html) {
  if (html.includes('ac-aim-lifecycle-bridge-v0404')) return html;
  let patched = html;
  const status = { liveStep:false, originDiag:false, cutawayEntry:false };

  // Hull choreography must advance from the authoritative aim gesture, not only from
  // whichever camera branch happens to own a frame.
  patched = replaceOnce(
    patched,
    "function acDirectorUpdateAimTarget(attacker,pt){acDirector.aimTargetProgress=acDirectorAimTarget(attacker,pt)}",
    "function acDirectorUpdateAimTarget(attacker,pt){acDirector.aimTargetProgress=acDirectorAimTarget(attacker,pt);acDirectorStepAimPresentation(performance.now())}",
    status,
    'liveStep'
  );

  // Keep explicit telemetry for the physical muzzle versus the finger position.
  patched = replaceOnce(
    patched,
    "aimOriginWorld=cutawayMuzzle?cutawayMuzzle.getWorldPosition(new THREE.Vector3()):muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};currentPx={x:pt.x,y:pt.y};setAimVisual(startPx,currentPx);return true",
    "aimOriginWorld=cutawayMuzzle?cutawayMuzzle.getWorldPosition(new THREE.Vector3()):muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};currentPx={x:pt.x,y:pt.y};diag('AIM ORIGIN AUTHORITY','weapon='+selected.weaponKey+' muzzle='+Math.round(startPx.x)+','+Math.round(startPx.y)+' pointer='+Math.round(pt.x)+','+Math.round(pt.y)+' source='+(cutawayMuzzle?'CUTAWAY_MUZZLE':'BASE_MUZZLE'));setAimVisual(startPx,currentPx);return true",
    status,
    'originDiag'
  );

  // Retire the old Aurelian exterior-fire entrance. A tap on the local vessel now enters
  // the physical cutaway first; aiming cannot begin until a real cutaway warrior has
  // been selected and locked. This gives presentation, camera and muzzle one owner.
  patched = replaceOnce(
    patched,
    "if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){",
    "if(aiming)return;const pt=eventStagePoint(e);\n  if(!xrayOpen&&localWorldSide()==='aurelian'){openPrivateXray('authoritative warrior firing entry');diag('AIM ENTRY ROUTE','EXTERIOR->CUTAWAY noFire=Y');return}\n  if(xrayOpen){",
    status,
    'cutawayEntry'
  );

  const summary = Object.entries(status).map(([k,v]) => k+':' +(v?'OK':'MISS')).join(' ');
  return patched.replace('</head>', '<meta id="ac-aim-lifecycle-bridge-v0404" name="ac-aim-lifecycle-bridge" content="'+summary+' ballistics:UNCHANGED camera:OBSERVER hullSeal:GESTURE_DRIVEN aurelianFireEntry:CUTAWAY_ONLY">\n</head>');
}
