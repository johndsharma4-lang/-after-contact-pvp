function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchCutawayLifecycleRuntime(html) {
  let patched = html;
  const status = { helper:false, singlePress:false, pressDrag:false, muzzleAim:false, shooterHold:false, soloTurn:false, mpTurn:false };

  const helper = `function acForceExteriorBattleView(reason='combat lifecycle'){
  if(!battleStarted||matchEnded)return false;
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
  parent.rotation.z=THREE.MathUtils.lerp(parent.rotation.z,desired,fire?.78:.38);
  const body=rig.userData?.rig,arm=body?.armRoots?.[1]||body?.armRoots?.[0],head=body?.headRoot;
  if(arm){if(arm.userData.acAimBaseZ==null)arm.userData.acAimBaseZ=arm.rotation.z;const armBase=arm.userData.acAimBaseZ,armTarget=Math.max(armBase-.72,Math.min(armBase+.72,armBase+(desired-base)*.62));arm.rotation.z=THREE.MathUtils.lerp(arm.rotation.z,armTarget,fire?.66:.32)}
  if(head){if(head.userData.acAimBaseZ==null)head.userData.acAimBaseZ=head.rotation.z;head.rotation.z=THREE.MathUtils.lerp(head.rotation.z,head.userData.acAimBaseZ+(desired-base)*.12,.18)}
  if(fire){const kickBase=parent.position.clone();parent.position.x+=selected.side==='aurelian'?.24:-.24;setTimeout(()=>{if(parent?.parent)parent.position.copy(kickBase)},140)}
}
function acHoldShooterCutaway(stagePoint){
  acPoseCutawayWeapon(stagePoint,true);
  setTimeout(()=>{if(xrayOpen)closePrivateXray('projectile cleared firing compartment')},650);
  diag('SHOOTER CUTAWAY HOLD',(selected?.weaponKey||'warrior')+' hold=650ms cameraOverride=N')
}
`;

  if (!patched.includes('function acPoseCutawayWeapon(')) {
    const next = patched.replace('function beginAimFromVesselGesture', helper + 'function beginAimFromVesselGesture');
    status.helper = next !== patched;
    patched = next;
  } else status.helper = true;

  const singlePressFn = `function selectXrayCrew(w){
  if(!xrayOpen||!w||!w.active||w.hp<=0||w.passive)return;
  xraySelectedCrew=w;
  xrayConfirmedShooter=w;
  restoreFullCutawayStage();
  selectWarrior(w);
  setCutawayFiringStage(w);
  refreshPrivateXrayVisuals();
  const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';
  statusEl.textContent=\`${'${'}name} • HOLD + DRAG TO AIM • RELEASE TO FIRE\`;
  diag('SHOOTER LOCK',\`${'${'}w.weaponKey} room=${'${'}w.roomIndex+1} confirmed=Y singlePress=Y otherRoomsClosed=Y\`)
}`;
  const selectRegex=/function selectXrayCrew\(w\)\{[\s\S]*?\n\}\nbindMobileAction/;
  const selectNext=patched.replace(selectRegex,singlePressFn+'\nbindMobileAction');
  status.singlePress=selectNext!==patched;
  patched=selectNext;

  const oldCrewPress = "const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);return}";
  const newCrewPress = "const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);vesselGesture={pointerId:e.pointerId,start:pt,current:pt,lockedShooter:true};try{canvas.setPointerCapture(e.pointerId)}catch{}diag('SHOOTER PRESS ARMED',`${crew.weaponKey} room=${crew.roomIndex+1} holdDrag=Y`);return}";
  patched = replaceOnce(patched, oldCrewPress, newCrewPress, status, 'pressDrag');

  patched = patched.replace("if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=28){", "if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=10){");

  if(!patched.includes('acPoseCutawayWeapon(b);')){
    const next=patched.replace("function setAimVisual(a,b){\n  if(!selected)return;", "function setAimVisual(a,b){\n  if(!selected)return;\n  acPoseCutawayWeapon(b);");
    status.muzzleAim=next!==patched;patched=next;
  } else status.muzzleAim=true;

  if(!patched.includes('acHoldShooterCutaway(pt);')){
    const needle="diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);fireSelectedFromStage(pt,power)";
    const replacement="diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);acHoldShooterCutaway(pt);fireSelectedFromStage(pt,power)";
    const next=patched.replace(needle,replacement);status.shooterHold=next!==patched;patched=next;
  } else status.shooterHold=true;

  // Do not close the shooter cutaway at fire-time. endSoloPlayerTurnAfterShot is entered while
  // long-running weapons are still resolving. The 650ms shooter hold above owns this close.
  patched=patched.replace(/function endSoloPlayerTurnAfterShot\(([^)]*)\)\{acForceExteriorBattleView\('solo turn handoff'\);/,"function endSoloPlayerTurnAfterShot($1){");
  status.soloTurn=!patched.includes("acForceExteriorBattleView('solo turn handoff')");

  // Multiplayer setMpTurn is an actual authoritative handoff, so exterior restoration remains safe there.
  if (!patched.includes("acForceExteriorBattleView('multiplayer turn handoff')")) {
    const next = patched.replace(/function setMpTurn\(([^)]*)\)\{/, "function setMpTurn($1){acForceExteriorBattleView('multiplayer turn handoff');");
    status.mpTurn = next !== patched;patched = next;
  } else status.mpTurn = true;

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.71');
  patched = patched.replace(/build=2026-09-(01|04)_[A-Z0-9_]+/g, 'build=2026-09-04_SINGLE_PRESS_SHOOTER_HOLD_FIXED');
  patched = patched.replaceAll('CUTAWAY • TAP A WARRIOR ONCE TO HIGHLIGHT • TAP AGAIN TO LOCK SHOOTER','CUTAWAY • PRESS A WARRIOR • HOLD + DRAG TO AIM • RELEASE TO FIRE');
  patched = patched.replaceAll('SELECT A WARRIOR • TAP AGAIN TO CONFIRM','PRESS A WARRIOR • HOLD + DRAG TO AIM');

  const summary = Object.entries(status).map(([key,value])=>`${key}:${value?'OK':'MISS'}`).join(' ');
  patched = patched.replace('</head>', `<meta name="ac-cutaway-lifecycle" content="${summary}">\n</head>`);
  return patched;
}
