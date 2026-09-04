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
  acShotFollow=null;
  const wasOpen=!!xrayOpen;
  if(wasOpen)closePrivateXray(reason);
  tacticalAimView=false;
  if(typeof updateBattleCamera==='function')updateBattleCamera(true);
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
  const base=parent.userData.acAimBaseZ,screenAngle=Math.atan2(dy,dx),raw=-screenAngle-Math.PI/2,desired=Math.max(base-1.15,Math.min(base+1.15,raw));
  parent.rotation.z=THREE.MathUtils.lerp(parent.rotation.z,desired,fire?.72:.38);
  const body=rig.userData?.rig,arm=body?.armRoots?.[1]||body?.armRoots?.[0],head=body?.headRoot;
  if(arm){if(arm.userData.acAimBaseZ==null)arm.userData.acAimBaseZ=arm.rotation.z;const armBase=arm.userData.acAimBaseZ,armTarget=Math.max(armBase-.72,Math.min(armBase+.72,armBase+(desired-base)*.62));arm.rotation.z=THREE.MathUtils.lerp(arm.rotation.z,armTarget,fire?.58:.32)}
  if(head){if(head.userData.acAimBaseZ==null)head.userData.acAimBaseZ=head.rotation.z;head.rotation.z=THREE.MathUtils.lerp(head.rotation.z,head.userData.acAimBaseZ+(desired-base)*.12,.18)}
  if(fire){const kickBase=parent.position.clone();parent.position.x+=selected.side==='aurelian'?.20:-.20;setTimeout(()=>{if(parent?.parent)parent.position.copy(kickBase)},110)}
}
function acBeginShotCameraFollow(stagePoint){
  if(!selected||!stagePoint)return;
  const visual=xrayOpen?xrayRoomVisuals.find(v=>v.warrior===selected):null,muzzle=visual?.rig3D?.userData?.muzzle;
  const from=(muzzle?muzzle.getWorldPosition(new THREE.Vector3()):(aimOriginWorld?.clone?.()||muzzleWorld(selected,stagePoint).clone()));
  const to=targetWorldFromStage(stagePoint);acShotFollow={from,to,start:performance.now(),duration:1250};
  setTimeout(()=>{if(xrayOpen)closePrivateXray('projectile cleared firing room')},320);
  diag('SHOT CAMERA FOLLOW',(selected.weaponKey||'warrior')+' duration=1250ms cutawayHold=320ms')
}
`;

  if (!patched.includes('function acPoseCutawayWeapon(')) {
    const next = patched.replace('function beginAimFromVesselGesture', helper + 'function beginAimFromVesselGesture');
    status.helper = next !== patched;
    patched = next;
  } else status.helper = true;

  const oldSelect = `function selectXrayCrew(w){
  if(!xrayOpen||!w||!w.active||w.hp<=0||w.passive)return;
  const same=xraySelectedCrew===w;
  if(!same){
    xraySelectedCrew=w;xrayConfirmedShooter=null;restoreFullCutawayStage();selectWarrior(w);refreshPrivateXrayVisuals();
    const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=\`${'${'}name} HIGHLIGHTED • TAP AGAIN TO CONFIRM\`;diag('3D CUTAWAY HIGHLIGHT',\`${'${'}w.weaponKey} room=${'${'}w.roomIndex+1} confirmed=N\`);return
  }
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

  const oldCrewPress = "const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);return}";
  const newCrewPress = "const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);vesselGesture={pointerId:e.pointerId,start:pt,current:pt,lockedShooter:true};try{canvas.setPointerCapture(e.pointerId)}catch{}diag('SHOOTER PRESS ARMED',`${crew.weaponKey} room=${crew.roomIndex+1} holdDrag=Y`);return}";
  patched = replaceOnce(patched, oldCrewPress, newCrewPress, status, 'pressDrag');

  // Make the same press become aiming with only a small drag instead of a second deliberate gesture.
  patched = patched.replace("if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=28){", "if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=10){");

  if(!patched.includes('acPoseCutawayWeapon(b);')){
    const next=patched.replace("function setAimVisual(a,b){\n  if(!selected)return;", "function setAimVisual(a,b){\n  if(!selected)return;\n  acPoseCutawayWeapon(b);");
    status.muzzleAim=next!==patched;patched=next;
  }else status.muzzleAim=true;

  if(!patched.includes('acBeginShotCameraFollow(pt);')){
    const needle="diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);fireSelectedFromStage(pt,power)";
    const replacement="diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);acPoseCutawayWeapon(pt,true);acBeginShotCameraFollow(pt);fireSelectedFromStage(pt,power)";
    const next=patched.replace(needle,replacement);status.shotFollow=next!==patched;patched=next;
  }else status.shotFollow=true;

  if(!patched.includes("acShotFollow&&performance.now()-acShotFollow.start")){
    const next=patched.replace("function updateBattleCamera(snap=false,frameDt=null){\n  if(!battleStarted||typeof camera==='undefined')return;", `function updateBattleCamera(snap=false,frameDt=null){
  if(!battleStarted||typeof camera==='undefined')return;
  if(acShotFollow&&performance.now()-acShotFollow.start<acShotFollow.duration){
    const t=Math.max(0,Math.min(1,(performance.now()-acShotFollow.start)/acShotFollow.duration)),e=t*t*(3-2*t),focus=acShotFollow.from.clone().lerp(acShotFollow.to,e),lead=acShotFollow.to.clone().sub(acShotFollow.from).normalize(),desired=focus.clone().add(new THREE.Vector3(0,6.5,64)).addScaledVector(lead,-5);
    camera.position.lerp(desired,snap?1:.12);camera.lookAt(focus.clone().addScaledVector(lead,2.4));return
  }else if(acShotFollow){acShotFollow=null}
`);
    status.shotFollow=status.shotFollow&&(next!==patched);patched=next;
  }

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

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.67');
  patched = patched.replace(/build=2026-09-(01|04)_[A-Z0-9_]+/g, 'build=2026-09-04_PRESS_DRAG_AIM_CAMERA_RECENTER');
  patched = patched.replaceAll('CUTAWAY • TAP A WARRIOR ONCE TO HIGHLIGHT • TAP AGAIN TO LOCK SHOOTER','CUTAWAY • PRESS A WARRIOR • HOLD + DRAG TO AIM • RELEASE TO FIRE');
  patched = patched.replaceAll('SELECT A WARRIOR • TAP AGAIN TO CONFIRM','PRESS A WARRIOR • HOLD + DRAG TO AIM');

  const summary = Object.entries(status).map(([key,value])=>`${key}:${value?'OK':'MISS'}`).join(' ');
  patched = patched.replace('</head>', `<meta name="ac-cutaway-lifecycle" content="${summary}">\n</head>`);
  return patched;
}
