function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchCutawayLifecycleRuntime(html) {
  let patched = html;
  const status = { helper:false, singlePress:false, pressDrag:false, muzzleAim:false, shotFollow:false, soloTurn:false, mpTurn:false };

  const helper = `let acShotFollow=null;
function acForceExteriorBattleView(reason='combat lifecycle'){
  if(!battleStarted||matchEnded)return false;
  const wasOpen=!!xrayOpen;
  if(wasOpen)closePrivateXray(reason);
  tacticalAimView=false;
  if(typeof updateBattleCamera==='function')updateBattleCamera();
  if(wasOpen)diag('CUTAWAY FORCE CLOSE',reason+' exterior=Y');
  return wasOpen
}
function acPoseCutawayWeapon(stagePoint,fire=false){
  if(!xrayOpen||!selected||!stagePoint)return;
  const visual=xrayRoomVisuals.find(v=>v.warrior===selected),rig=visual?.rig3D;if(!rig)return;
  const muzzle=rig.userData?.muzzle,parent=muzzle?.parent;if(!muzzle||!parent)return;
  const origin=worldToStage(muzzle.getWorldPosition(new THREE.Vector3())),dx=stagePoint.x-origin.x,dy=stagePoint.y-origin.y;
  if(Math.hypot(dx,dy)<4)return;
  if(parent.userData.acAimBaseZ==null)parent.userData.acAimBaseZ=parent.rotation.z;
  const screenAngle=Math.atan2(dy,dx),desired=-screenAngle-Math.PI/2;
  parent.rotation.z=THREE.MathUtils.lerp(parent.rotation.z,desired,fire?.48:.24);
  const body=rig.userData?.rig,arm=body?.armRoots?.[1]||body?.armRoots?.[0];
  if(arm){if(arm.userData.acAimBaseZ==null)arm.userData.acAimBaseZ=arm.rotation.z;arm.rotation.z=THREE.MathUtils.lerp(arm.rotation.z,Math.max(-1.25,Math.min(.95,desired*.42)),.22)}
  if(fire){const base=parent.position.clone();parent.position.x+=selected.side==='aurelian'?.14:-.14;setTimeout(()=>{if(parent?.parent)parent.position.copy(base)},90)}
}
function acBeginShotCameraFollow(stagePoint){
  if(!selected||!stagePoint)return;
  const visual=xrayOpen?xrayRoomVisuals.find(v=>v.warrior===selected):null,muzzle=visual?.rig3D?.userData?.muzzle;
  const from=(muzzle?muzzle.getWorldPosition(new THREE.Vector3()):(aimOriginWorld?.clone?.()||muzzleWorld(selected,stagePoint).clone()));
  const to=targetWorldFromStage(stagePoint);acShotFollow={from,to,start:performance.now(),duration:980};
  setTimeout(()=>{if(xrayOpen)closePrivateXray('projectile camera handoff')},135);
  diag('SHOT CAMERA FOLLOW',(selected.weaponKey||'warrior')+' duration=980ms')
}
`;

  if (!patched.includes('function acPoseCutawayWeapon(')) {
    const next = patched.replace('function beginAimFromVesselGesture', helper + 'function beginAimFromVesselGesture');
    status.helper = next !== patched;
    patched = next;
  } else status.helper = true;

  // One press selects and commits the living warrior. No second confirmation tap.
  const oldSelect = `function selectXrayCrew(w){
  if(!xrayOpen||!w||!w.active||w.hp<=0||w.passive)return;
  const same=xraySelectedCrew===w;
  if(!same){
    xraySelectedCrew=w;xrayConfirmedShooter=null;restoreFullCutawayStage();selectWarrior(w);refreshPrivateXrayVisuals();
    const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=\`${'${'}name} HIGHLIGHTED • TAP AGAIN TO CONFIRM\`;diag('3D CUTAWAY HIGHLIGHT',\`${'${'}w.weaponKey} room=${'${'}w.roomIndex+1} confirmed=N\`);return
  }
  // Second tap on the same highlighted living warrior commits the shooter.
  xrayConfirmedShooter=w;selectWarrior(w);setCutawayFiringStage(w);refreshPrivateXrayVisuals();
  const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=\`SHOOTER LOCKED • ${'${'}name} • ROOM ${'${'}w.roomIndex+1} • DRAG FROM OPEN COMPARTMENT TO AIM\`;
  diag('SHOOTER LOCK',\`${'${'}w.weaponKey} room=${'${'}w.roomIndex+1} confirmed=Y otherRoomsClosed=Y\`)
}`;
  const newSelect = `function selectXrayCrew(w){
  if(!xrayOpen||!w||!w.active||w.hp<=0||w.passive)return;
  xraySelectedCrew=w;xrayConfirmedShooter=w;restoreFullCutawayStage();selectWarrior(w);setCutawayFiringStage(w);refreshPrivateXrayVisuals();
  const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=\`${'${'}name} • HOLD + DRAG TO AIM • RELEASE TO FIRE\`;
  diag('SHOOTER LOCK',\`${'${'}w.weaponKey} room=${'${'}w.roomIndex+1} confirmed=Y singlePress=Y otherRoomsClosed=Y\`)
}`;
  patched = replaceOnce(patched, oldSelect, newSelect, status, 'singlePress');

  // The same pointer-down that selects the warrior becomes the aiming gesture.
  const oldCrewPress = "const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);return}";
  const newCrewPress = "const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);vesselGesture={pointerId:e.pointerId,start:pt,current:pt,lockedShooter:true};try{canvas.setPointerCapture(e.pointerId)}catch{}diag('SHOOTER PRESS ARMED',`${crew.weaponKey} room=${crew.roomIndex+1} holdDrag=Y`);return}";
  patched = replaceOnce(patched, oldCrewPress, newCrewPress, status, 'pressDrag');

  // During aiming keep the cutaway warrior visible and articulate the actual 3D muzzle/weapon rig.
  if(!patched.includes('acPoseCutawayWeapon(b);')){
    const next=patched.replace("function setAimVisual(a,b){\n  if(!selected)return;", "function setAimVisual(a,b){\n  if(!selected)return;\n  acPoseCutawayWeapon(b);");
    status.muzzleAim=next!==patched;patched=next;
  }else status.muzzleAim=true;

  // On release, show the weapon firing from the open compartment, then smoothly hand the camera to the shot.
  if(!patched.includes('acBeginShotCameraFollow(pt);')){
    const needle="diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);fireSelectedFromStage(pt,power)";
    const replacement="diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);acPoseCutawayWeapon(pt,true);acBeginShotCameraFollow(pt);fireSelectedFromStage(pt,power)";
    const next=patched.replace(needle,replacement);status.shotFollow=next!==patched;patched=next;
  }else status.shotFollow=true;

  // Camera follows from the shooter's muzzle toward the target after release. The cutaway closes only
  // after the projectile has visibly left the firing compartment, not when aiming begins.
  if(!patched.includes("acShotFollow&&performance.now()-acShotFollow.start")){
    const next=patched.replace("function updateBattleCamera(snap=false,frameDt=null){\n  if(!battleStarted||typeof camera==='undefined')return;", `function updateBattleCamera(snap=false,frameDt=null){
  if(!battleStarted||typeof camera==='undefined')return;
  if(acShotFollow&&performance.now()-acShotFollow.start<acShotFollow.duration){
    const t=Math.max(0,Math.min(1,(performance.now()-acShotFollow.start)/acShotFollow.duration)),e=1-Math.pow(1-t,2.2),focus=acShotFollow.from.clone().lerp(acShotFollow.to,e),desired=focus.clone().add(new THREE.Vector3(0,7,58));
    camera.position.lerp(desired,snap?1:.18);camera.lookAt(focus);return
  }else if(acShotFollow){acShotFollow=null}
`);
    status.shotFollow=status.shotFollow&&(next!==patched);patched=next;
  }

  // The cutaway must still be gone for AI/opponent turns and the next turn.
  if (!patched.includes("acForceExteriorBattleView('solo turn handoff')")) {
    const next = patched.replace(/function endSoloPlayerTurnAfterShot\(([^)]*)\)\{/, "function endSoloPlayerTurnAfterShot($1){acForceExteriorBattleView('solo turn handoff');");
    status.soloTurn = next !== patched;
    patched = next;
  } else status.soloTurn = true;

  if (!patched.includes("acForceExteriorBattleView('multiplayer turn handoff')")) {
    const next = patched.replace(/function setMpTurn\(([^)]*)\)\{/, "function setMpTurn($1){acForceExteriorBattleView('multiplayer turn handoff');");
    status.mpTurn = next !== patched;
    patched = next;
  } else status.mpTurn = true;

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.66');
  patched = patched.replace(/build=2026-09-(01|04)_[A-Z0-9_]+/g, 'build=2026-09-04_PRESS_DRAG_CUTAWAY_SHOT_FOLLOW');
  patched = patched.replaceAll('CUTAWAY • TAP A WARRIOR ONCE TO HIGHLIGHT • TAP AGAIN TO LOCK SHOOTER','CUTAWAY • PRESS A WARRIOR • HOLD + DRAG TO AIM • RELEASE TO FIRE');
  patched = patched.replaceAll('SELECT A WARRIOR • TAP AGAIN TO CONFIRM','PRESS A WARRIOR • HOLD + DRAG TO AIM');

  const summary = Object.entries(status).map(([key,value])=>`${key}:${value?'OK':'MISS'}`).join(' ');
  patched = patched.replace('</head>', `<meta name="ac-cutaway-lifecycle" content="${summary}">\n</head>`);
  return patched;
}
