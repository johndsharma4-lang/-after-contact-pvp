function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchCutawayLifecycleRuntime(html) {
  let patched = html;
  const status = {
    helper:false,
    singlePress:false,
    pressDrag:false,
    muzzleAim:false,
    sunadierArc:false,
    aimCamera:false,
    projectileTrack:false,
    preImpact:false,
    scatterCamera:false,
    emptyImpactReveal:false,
    tacticalReset:false,
    actionFinish:false,
    soloTurn:false,
    mpTurn:false
  };

  const helper = `let acPresentation={phase:'idle',shooter:null,projectile:null,origin:null,target:null,hit:null,attacker:null,label:'',preImpact:false,start:0};
function acResetPresentation(reason='reset'){
  tacticalAimView=false;
  if(acPresentation?.shooter){const visual=xrayRoomVisuals?.find?.(v=>v.warrior===acPresentation.shooter),rig=visual?.rig3D;if(rig?.userData?.acPresentationBaseScale)rig.scale.copy(rig.userData.acPresentationBaseScale)}
  acPresentation={phase:'idle',shooter:null,projectile:null,origin:null,target:null,hit:null,attacker:null,label:'',preImpact:false,start:0};
  diag('PRESENTATION RESET',reason)
}
function acBeginAimPresentation(w){
  if(!w||!xrayOpen)return;
  acPresentation.phase='aim';acPresentation.shooter=w;acPresentation.projectile=null;acPresentation.origin=null;acPresentation.target=null;acPresentation.hit=null;acPresentation.attacker=w;acPresentation.preImpact=false;acPresentation.start=performance.now();tacticalAimView=true;
  const visual=xrayRoomVisuals.find(v=>v.warrior===w),rig=visual?.rig3D;if(rig){if(!rig.userData.acPresentationBaseScale)rig.userData.acPresentationBaseScale=rig.scale.clone();rig.scale.copy(rig.userData.acPresentationBaseScale).multiplyScalar(1.24)}
  diag('PRESENTATION AIM',w.weaponKey+' twoVessel=Y warriorReadable=Y')
}
function acBeginFirePresentation(stagePoint){
  if(!selected)return;
  acPresentation.phase='fire';acPresentation.shooter=selected;acPresentation.attacker=selected;acPresentation.projectile=null;acPresentation.origin=null;acPresentation.target=null;acPresentation.hit=null;acPresentation.preImpact=false;acPresentation.start=performance.now();tacticalAimView=false;acPoseCutawayWeapon(stagePoint,true);
  setTimeout(()=>{if(acPresentation.phase==='fire'){if(xrayOpen)closePrivateXray('untracked weapon cleared firing compartment');acPresentation.phase='impact'}},900);
  diag('PRESENTATION FIRE',selected.weaponKey+' cutawayHeldUntilProjectileExit=Y')
}
function acTrackProjectile(attacker,object,target,hit,duration=1800,label='PROJECTILE'){
  if(!attacker||attacker.side!==localWorldSide()||!object)return;
  const origin=object.getWorldPosition(new THREE.Vector3());acPresentation.phase='travel';acPresentation.shooter=attacker;acPresentation.attacker=attacker;acPresentation.projectile=object;acPresentation.origin=origin.clone();acPresentation.target=target?.clone?.()||null;acPresentation.hit=hit||null;acPresentation.preImpact=false;acPresentation.start=performance.now();acPresentation.label=label;acPresentation.duration=duration;tacticalAimView=false;
  diag('PRESENTATION PROJECTILE TRACK',label+' actualMesh=Y target='+(hit&&Number.isInteger(hit.roomIndex)?hit.roomIndex+1:'MISS'))
}
function acOpenPreImpact(){
  const p=acPresentation;if(!p||p.preImpact||!p.hit?.room||!Number.isInteger(p.hit.roomIndex)||!p.attacker)return false;p.preImpact=true;
  const side=structureTargetSide(p.attacker);if(typeof beginImpactFocus==='function')beginImpactFocus(side,p.hit.roomIndex,'INCOMING '+(p.label||'SHOT'),1250,true);if(typeof spawnImpactCompartmentReveal==='function')spawnImpactCompartmentReveal(p.attacker,p.hit,1350);
  diag('PRESENTATION PRE-IMPACT',`side=${side} room=${p.hit.roomIndex+1} beforeContact=Y`);return true
}
function acFinishPresentation(attacker,label='weapon complete'){
  if(attacker?.side!==localWorldSide())return;tacticalAimView=false;if(xrayOpen)closePrivateXray('weapon presentation complete');setTimeout(()=>acResetPresentation(label),120)
}
function acForceExteriorBattleView(reason='combat lifecycle'){
  if(!battleStarted||matchEnded)return false;
  const wasOpen=!!xrayOpen;if(wasOpen)closePrivateXray(reason);tacticalAimView=false;if(typeof updateBattleCamera==='function')updateBattleCamera(true);if(wasOpen)diag('CUTAWAY FORCE CLOSE',reason+' exterior=Y');return wasOpen
}
function acPoseCutawayWeapon(stagePoint,fire=false){
  if(!xrayOpen||!selected||!stagePoint)return;
  const visual=xrayRoomVisuals.find(v=>v.warrior===selected),rig=visual?.rig3D;if(!rig)return;
  const muzzle=rig.userData?.muzzle,parent=muzzle?.parent;if(!muzzle||!parent)return;
  const origin=worldToStage(muzzle.getWorldPosition(new THREE.Vector3())),dx=stagePoint.x-origin.x,dy=stagePoint.y-origin.y;if(Math.hypot(dx,dy)<4)return;
  if(!rig.userData.acPresentationBaseScale)rig.userData.acPresentationBaseScale=rig.scale.clone();if(aiming||acPresentation.phase==='aim'||acPresentation.phase==='fire')rig.scale.copy(rig.userData.acPresentationBaseScale).multiplyScalar(1.24);
  if(parent.userData.acAimBaseZ==null)parent.userData.acAimBaseZ=parent.rotation.z;
  const base=parent.userData.acAimBaseZ,screenAngle=Math.atan2(dy,dx),raw=-screenAngle-Math.PI/2,desired=Math.max(base-1.22,Math.min(base+1.22,raw));parent.rotation.z=THREE.MathUtils.lerp(parent.rotation.z,desired,fire?.86:.46);
  const body=rig.userData?.rig,arm=body?.armRoots?.[1]||body?.armRoots?.[0],head=body?.headRoot;
  if(arm){if(arm.userData.acAimBaseZ==null)arm.userData.acAimBaseZ=arm.rotation.z;const armBase=arm.userData.acAimBaseZ,armTarget=Math.max(armBase-.82,Math.min(armBase+.82,armBase+(desired-base)*.70));arm.rotation.z=THREE.MathUtils.lerp(arm.rotation.z,armTarget,fire?.76:.40)}
  if(head){if(head.userData.acAimBaseZ==null)head.userData.acAimBaseZ=head.rotation.z;head.rotation.z=THREE.MathUtils.lerp(head.rotation.z,head.userData.acAimBaseZ+(desired-base)*.14,.22)}
  if(fire){const kickBase=parent.position.clone();parent.position.x+=selected.side==='aurelian'?.30:-.30;setTimeout(()=>{if(parent?.parent)parent.position.copy(kickBase)},165)}
}
`;

  if (!patched.includes('let acPresentation=')) {
    const next = patched.replace('function beginAimFromVesselGesture', helper + 'function beginAimFromVesselGesture');
    status.helper = next !== patched;
    patched = next;
  } else status.helper = true;

  const singlePressFn = `function selectXrayCrew(w){
  if(!xrayOpen||!w||!w.active||w.hp<=0||w.passive)return;
  xraySelectedCrew=w;xrayConfirmedShooter=w;restoreFullCutawayStage();selectWarrior(w);setCutawayFiringStage(w);refreshPrivateXrayVisuals();
  const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=\`${'${'}name} • HOLD + DRAG TO AIM • RELEASE TO FIRE\`;diag('SHOOTER LOCK',\`${'${'}w.weaponKey} room=${'${'}w.roomIndex+1} confirmed=Y singlePress=Y otherRoomsClosed=Y\`)
}`;
  const selectRegex=/function selectXrayCrew\(w\)\{[\s\S]*?\n\}\nbindMobileAction/;
  const selectNext=patched.replace(selectRegex,singlePressFn+'\nbindMobileAction');status.singlePress=selectNext!==patched;patched=selectNext;

  const oldCrewPress="const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);return}";
  const newCrewPress="const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);vesselGesture={pointerId:e.pointerId,start:pt,current:pt,lockedShooter:true};try{canvas.setPointerCapture(e.pointerId)}catch{}diag('SHOOTER PRESS ARMED',`${crew.weaponKey} room=${crew.roomIndex+1} holdDrag=Y singlePress=Y`);return}";
  patched=replaceOnce(patched,oldCrewPress,newCrewPress,status,'pressDrag');
  patched=patched.replace("if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=28){","if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=10){");

  if(!patched.includes('acBeginAimPresentation(selected);')){
    const next=patched.replace("function setAimVisual(a,b){\n  if(!selected)return;","function setAimVisual(a,b){\n  if(!selected)return;\n  if(xrayOpen&&acPresentation.phase!=='aim')acBeginAimPresentation(selected);\n  acPoseCutawayWeapon(b);");status.muzzleAim=next!==patched;patched=next;
  }else status.muzzleAim=true;

  if(!patched.includes('acBeginFirePresentation(pt);')){
    const needle="diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);fireSelectedFromStage(pt,power)";
    const replacement="diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);acBeginFirePresentation(pt);fireSelectedFromStage(pt,power)";
    patched=patched.replace(needle,replacement);
  }

  // Sunadier high-lob control: upward drag has enough authority to visibly lift the grenade.
  const oldArc="dragX=Math.max(72,Math.abs(pt.x-startStage.x)),dragY=pt.y-startStage.y,slope=Math.max(-.46,Math.min(.58,dragY/dragX)),edgeX=toward>0?1340:-60,totalX=edgeX-startStage.x,span=Math.abs(totalX),unitPower=Math.max(.18,Math.min(1,(power||50)/100)),gravityDrop=500+(1-unitPower)*115";
  const newArc="dragX=Math.max(72,Math.abs(pt.x-startStage.x)),dragY=pt.y-startStage.y,rawSlope=dragY/dragX,slope=rawSlope<0?Math.max(-1.02,rawSlope*2):Math.min(.58,rawSlope),edgeX=toward>0?1340:-60,totalX=edgeX-startStage.x,span=Math.abs(totalX),unitPower=Math.max(.18,Math.min(1,(power||50)/100)),gravityDrop=430+(1-unitPower)*105";
  const arcNext=patched.replace(oldArc,newArc);status.sunadierArc=arcNext!==patched;patched=arcNext;

  // Expose the actual Aurelian projectile meshes to the presentation director.
  let trackNext=patched.replace("grenade.position.copy(start);scene.add(grenade);const chainMat","grenade.position.copy(start);scene.add(grenade);if(typeof acTrackProjectile==='function')acTrackProjectile(attacker,grenade,target,hit,2250,'SUNADIER');const chainMat");
  trackNext=trackNext.replace("const visual=makeSunDiskVisual(start),history=","const visual=makeSunDiskVisual(start);if(typeof acTrackProjectile==='function')acTrackProjectile(attacker,visual.group,(hits[0]?.end||terminal),hits[0]||null,3200,'SUN DISK');const history=");
  status.projectileTrack=trackNext!==patched;patched=trackNext;

  // One camera owner. Selection keeps its close-up; aiming uses an asymmetric two-vessel composition;
  // travel follows the real projectile mesh and opens the target compartment before contact.
  const cameraNeedle="if(xrayOpen){\n    // X-Ray is a tactical character-selection view. Focus the local vessel and keep its complete hull";
  const cameraReplacement=`if(acPresentation.phase==='travel'&&acPresentation.projectile?.parent){
    const projectilePoint=acPresentation.projectile.getWorldPosition(new THREE.Vector3()),targetPoint=acPresentation.target||projectilePoint,originPoint=acPresentation.origin||projectilePoint,cleared=projectilePoint.distanceTo(originPoint)>7.5,remaining=projectilePoint.distanceTo(targetPoint);
    if(cleared&&xrayOpen)closePrivateXray('actual projectile cleared firing compartment');if(!acPresentation.preImpact&&acPresentation.hit?.room&&remaining<18)acOpenPreImpact();
    const lead=projectilePoint.clone().lerp(targetPoint,.23);desiredPos=new THREE.Vector3(lead.x,lead.y+7.2,Math.max(74,lead.z+72));desiredLook=lead.clone().lerp(targetPoint,.16);desiredZoom=1.04;
  }else if(xrayOpen&&aiming){
    const visual=xrayRoomVisuals.find(v=>v.warrior===selected),shooter=visual?.rig3D?.getWorldPosition(new THREE.Vector3())||warriorWorld(selected),enemyRoot=selected?.side==='aurelian'?earth:aure,enemy=enemyRoot.getWorldPosition(new THREE.Vector3()),frameCenter=shooter.clone().lerp(enemy,.53),frameSpan=Math.abs(enemy.x-shooter.x)+31,aimZ=Math.max(66,(frameSpan*.5)/Math.max(.18,Math.tan(hHalf))+8);
    desiredPos=new THREE.Vector3(frameCenter.x,Math.max(shooter.y,enemy.y)+5.8,aimZ);desiredLook=new THREE.Vector3(frameCenter.x,(shooter.y+enemy.y)*.5+.8,2);desiredZoom=1.08;
  }else if(xrayOpen){
    // X-Ray is a tactical character-selection view. Focus the local vessel and keep its complete hull`;
  const cameraNext=patched.replace(cameraNeedle,cameraReplacement);status.aimCamera=cameraNext!==patched;patched=cameraNext;

  // Empty targeted rooms must still open before impact; the old helper refused to reveal them.
  const emptyNeedle="if(!occupant){diag('IMPACT CUTAWAY SKIP',`side=${targetSide} room=${hit.roomIndex+1} reason=NO_WARRIOR`);return false}clearImpactCompartmentReveal();";
  const emptyReplacement="if(!occupant)diag('IMPACT CUTAWAY',`side=${targetSide} room=${hit.roomIndex+1} warrior=NONE emptyRoomReveal=Y`);clearImpactCompartmentReveal();";
  const emptyNext=patched.replace(emptyNeedle,emptyReplacement);status.emptyImpactReveal=emptyNext!==patched;patched=emptyNext;

  // Secondary Sunadier plasma bounces still deal their full combat damage but may not steal camera ownership.
  const impactNeedle="const impactSide=structureTargetSide(attacker),impactStrength=Math.max(.45,Math.min(1.8,weapon.impactStrength||1)),focusHold=weapon.kind==='sunadier'?2300:weapon.kind==='solar_disk'?1900:weapon.kind==='laser'?1450:weapon.kind==='explosive'?1550:1750,he9=/^HE-9 MISSILE/.test(weapon.name||''),presentImpact=!he9||performance.now()>=groupedHe9ImpactUntil;if(presentImpact){if(he9)groupedHe9ImpactUntil=performance.now()+2400;beginImpactFocus(impactSide,hit.roomIndex,he9?'HE-9 BARRAGE':weapon.name,he9?2400:focusHold);spawnImpactCompartmentReveal(attacker,hit,he9?2400:focusHold)}";
  const impactReplacement="const impactSide=structureTargetSide(attacker),impactStrength=Math.max(.45,Math.min(1.8,weapon.impactStrength||1)),focusHold=weapon.kind==='sunadier'?2300:weapon.kind==='solar_disk'?1900:weapon.kind==='laser'?1450:weapon.kind==='explosive'?1550:1750,he9=/^HE-9 MISSILE/.test(weapon.name||''),secondaryScatter=(weapon.name||'')==='SUNADIER PLASMA SCATTER',presentationAlreadyOwns=typeof acPresentation!=='undefined'&&acPresentation.preImpact&&acPresentation.hit&&acPresentation.hit.roomIndex===hit.roomIndex,presentImpact=!secondaryScatter&&(!he9||performance.now()>=groupedHe9ImpactUntil);if(presentImpact&&!presentationAlreadyOwns){if(he9)groupedHe9ImpactUntil=performance.now()+2400;beginImpactFocus(impactSide,hit.roomIndex,he9?'HE-9 BARRAGE':weapon.name,he9?2400:focusHold);spawnImpactCompartmentReveal(attacker,hit,he9?2400:focusHold)}";
  const impactNext=patched.replace(impactNeedle,impactReplacement);status.scatterCamera=impactNext!==patched;status.preImpact=impactNext!==patched;patched=impactNext;

  // The weapon action ending, not secondary damage ticks, owns the return to normal battle framing.
  const finishNeedle="function finishAurelianWeaponAction(attacker,label){\n solarActionLock=false;refreshMovePad();diag('ACTION UNLOCK',(attacker.side===localWorldSide()?'LOCAL ':'REMOTE ')+label+' COMPLETE');";
  const finishReplacement="function finishAurelianWeaponAction(attacker,label){\n solarActionLock=false;refreshMovePad();diag('ACTION UNLOCK',(attacker.side===localWorldSide()?'LOCAL ':'REMOTE ')+label+' COMPLETE');if(typeof acFinishPresentation==='function')acFinishPresentation(attacker,label+' complete');";
  const finishNext=patched.replace(finishNeedle,finishReplacement);status.actionFinish=finishNext!==patched;patched=finishNext;

  // clearAim must never leave the tactical flag latched after the finger is released.
  if(!patched.includes("function clearAim(){tacticalAimView=false;")){
    const next=patched.replace('function clearAim(){','function clearAim(){tacticalAimView=false;');status.tacticalReset=next!==patched;patched=next;
  }else status.tacticalReset=true;

  // Do not close the shooter cutaway at fire-time; actual projectile departure owns that transition.
  patched=patched.replace(/function endSoloPlayerTurnAfterShot\(([^)]*)\)\{acForceExteriorBattleView\('solo turn handoff'\);/,"function endSoloPlayerTurnAfterShot($1){");status.soloTurn=!patched.includes("acForceExteriorBattleView('solo turn handoff')");

  if(!patched.includes("acForceExteriorBattleView('multiplayer turn handoff')")){
    const next=patched.replace(/function setMpTurn\(([^)]*)\)\{/,"function setMpTurn($1){acResetPresentation('multiplayer turn handoff');acForceExteriorBattleView('multiplayer turn handoff');");status.mpTurn=next!==patched;patched=next;
  }else status.mpTurn=true;

  patched=patched.replace(/MATCH RECORDER v0\.33\.\d+/g,'MATCH RECORDER v0.33.74');
  patched=patched.replace(/build=2026-09-(01|04)_[A-Z0-9_]+/g,'build=2026-09-04_UNIFIED_WARRIOR_SHOT_PRESENTATION');
  patched=patched.replaceAll('CUTAWAY • TAP A WARRIOR ONCE TO HIGHLIGHT • TAP AGAIN TO LOCK SHOOTER','CUTAWAY • PRESS A WARRIOR • HOLD + DRAG TO AIM • RELEASE TO FIRE');
  patched=patched.replaceAll('SELECT A WARRIOR • TAP AGAIN TO CONFIRM','PRESS A WARRIOR • HOLD + DRAG TO AIM');

  const summary=Object.entries(status).map(([key,value])=>`${key}:${value?'OK':'MISS'}`).join(' ');
  patched=patched.replace('</head>',`<meta name="ac-cutaway-lifecycle" content="${summary}">\n</head>`);
  return patched;
}
