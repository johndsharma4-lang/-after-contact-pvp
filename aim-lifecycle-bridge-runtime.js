function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAimLifecycleBridgeRuntime(html) {
  if (html.includes('ac-aim-lifecycle-bridge-v0415')) return html;
  let patched = html;
  const status = { liveStep:false, originDiag:false, cutawayEntry:false, shellOwnership:false, aimHook:false, rawRelease:false, stableAimEntry:false };

  patched = replaceOnce(patched,"function acDirectorUpdateAimTarget(attacker,pt){acDirector.aimTargetProgress=acDirectorAimTarget(attacker,pt)}","function acDirectorUpdateAimTarget(attacker,pt){acDirector.aimTargetProgress=acDirectorAimTarget(attacker,pt);acDirectorStepAimPresentation(performance.now())}",status,'liveStep');

  // Sealing now belongs directly to the presentation director. This bridge only
  // wires input and live-muzzle lifecycle into that established authority.
  status.shellOwnership=patched.includes("physicalBays='+visuals.length")&&patched.includes("closed='+closeCount+'/'+order.length");

  // Pose first, then sample the articulated muzzle from the resulting skeleton. The
  // pointer target stays untouched; only the visible/physical launch origin follows
  // the moving weapon while the director's captured input origin owns drag power.
  if(!patched.includes("if(aiming&&acLiveMuzzle)aimOriginWorld=acLiveMuzzle.getWorldPosition")){
    const hookNeedle='acDirectorBeginAim(selected);acDirectorUpdateAimTarget(selected,b);';
    const hookReplacement="const acLiveMuzzle=acWarriorCutawayRig(selected)?.userData?.muzzle;if(aiming&&acLiveMuzzle)aimOriginWorld=acLiveMuzzle.getWorldPosition(new THREE.Vector3());if(aiming&&aimOriginWorld){aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};a=startPx}\n  "+hookNeedle;
    patched=replaceOnce(patched,hookNeedle,hookReplacement,status,'aimHook');
  }else status.aimHook=true;

  patched=replaceOnce(patched,"const pt=currentPx||eventStagePoint(e),dist=startPx?Math.hypot(pt.x-startPx.x,pt.y-startPx.y):0;","const pt=currentPx||eventStagePoint(e),acRawStart=acDirector?.aimInputOrigin||startPx,dist=acRawStart?Math.hypot(pt.x-acRawStart.x,pt.y-acRawStart.y):0;",status,'rawRelease');

  // The old entry path changed camera state before aiming=true, so updateBattleCamera()
  // executed the normal/tactical branch first and moved the camera before the physical
  // muzzle was captured. Enter live aim first, then let the aim-owned camera frame once.
  patched=replaceOnce(patched,"tacticalAimView=true;updateBattleCamera();showCombatRange(4000);aiming=true;aimHud.classList.add('live');pointerId=e.pointerId;","tacticalAimView=true;aiming=true;updateBattleCamera();showCombatRange(4000);aimHud.classList.add('live');pointerId=e.pointerId;",status,'stableAimEntry');

  patched=replaceOnce(patched,"aimOriginWorld=cutawayMuzzle?cutawayMuzzle.getWorldPosition(new THREE.Vector3()):muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};currentPx={x:pt.x,y:pt.y};setAimVisual(startPx,currentPx);return true","aimOriginWorld=cutawayMuzzle?cutawayMuzzle.getWorldPosition(new THREE.Vector3()):muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};currentPx={x:pt.x,y:pt.y};diag('AIM ORIGIN AUTHORITY','weapon='+selected.weaponKey+' muzzle='+Math.round(startPx.x)+','+Math.round(startPx.y)+' pointer='+Math.round(pt.x)+','+Math.round(pt.y)+' source='+(cutawayMuzzle?'CUTAWAY_MUZZLE':'BASE_MUZZLE'));setAimVisual(startPx,currentPx);return true",status,'originDiag');

  patched=replaceOnce(patched,"if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){","if(aiming)return;const pt=eventStagePoint(e);\n  if(!xrayOpen&&localWorldSide()==='aurelian'){openPrivateXray('authoritative warrior firing entry');diag('AIM ENTRY ROUTE','EXTERIOR->CUTAWAY noFire=Y');return}\n  if(xrayOpen){",status,'cutawayEntry');

  const summary=Object.entries(status).map(([k,v])=>k+':' +(v?'OK':'MISS')).join(' ');
  return patched.replace('</head>','<meta id="ac-aim-lifecycle-bridge-v0415" name="ac-aim-lifecycle-bridge" content="'+summary+' aimAuthority:LIVE_ARTICULATED_MUZZLE rawInput:CAPTURED_POINTER_DRAG cameraOwner:PRESENTATION_DIRECTOR hullSeal:SIX_PHYSICAL_BAYS logicalCombatRooms:9_UNCHANGED aurelianFireEntry:CUTAWAY_ONLY">\n</head>');
}
