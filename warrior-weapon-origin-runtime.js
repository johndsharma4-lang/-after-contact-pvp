function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchWarriorWeaponOriginRuntime(html) {
  if (html.includes('ac-warrior-weapon-origin-v0344')) return html;
  let patched = html;
  const status = {
    helpers:false,
    aimOrigin:false,
    releaseOrigin:false,
    fireOrigin:false,
    signatureSfx:false,
    eventHandoff:false,
    solarRecovery:false,
    switchReliability:false,
    firePose:false,
    solarPenetration:false
  };

  const helpers = String.raw`
let acWarriorLaunchShooter=null,acWarriorLaunchOrigin=null,acWarriorLaunchTarget=null;
function acWarriorCutawayRig(w){return xrayOpen&&w&&typeof xrayRoomVisuals!=='undefined'?xrayRoomVisuals.find(v=>v.warrior===w)?.rig3D||null:null}
function acWarriorLiveMuzzleWorld(w,stageTarget=null){const rig=acWarriorCutawayRig(w),muzzle=rig?.userData?.muzzle;if(muzzle?.parent)return muzzle.getWorldPosition(new THREE.Vector3());return muzzleWorld(w,stageTarget).clone()}
function acWarriorSignatureSfx(w){
 if(!w||typeof audioTone!=='function'||typeof audioNoise!=='function')return;const key=w.weaponKey;
 if(key==='solar_lancer'){duckMusic(.10,950);audioTone(190,.30,'sawtooth',.095,1.9);audioTone(760,.42,'sine',.12,.95,.025);audioTone(1760,.24,'triangle',.075,.72,.055);audioNoise(.15,.06,1850,.025)}
 else if(key==='sun_disk_gunner'){duckMusic(.11,760);audioTone(118,.24,'square',.09,.65);audioTone(520,.34,'sawtooth',.10,1.55,.02);audioTone(1320,.26,'sine',.085,.58,.055);audioNoise(.18,.055,1250,.03)}
 else if(key==='sunadier'){duckMusic(.10,900);audioNoise(.13,.09,900);audioTone(84,.28,'sawtooth',.11,.50);audioTone(410,.26,'triangle',.09,.82,.03);audioNoise(.22,.06,1850,.07);audioTone(980,.18,'sine',.07,.44,.085)}
 diag('WARRIOR SIGNATURE SFX',key+' layered=Y')
}
function acWarriorFirePose(w,rig,parent,fire){
 if(!fire||!rig||!parent)return;
 if(!rig.userData.acFireBasePos)rig.userData.acFireBasePos=rig.position.clone();
 if(rig.userData.acFireBaseRotZ==null)rig.userData.acFireBaseRotZ=rig.rotation.z;
 const basePos=rig.userData.acFireBasePos.clone(),baseRot=rig.userData.acFireBaseRotZ,key=w.weaponKey;
 if(key==='sunadier'){rig.rotation.z=baseRot+(w.side==='aurelian'?.10:-.10);rig.position.y=basePos.y+.10;parent.rotation.z+=(w.side==='aurelian'?-.16:.16)}
 else if(key==='sun_disk_gunner'){rig.rotation.z=baseRot+(w.side==='aurelian'?.045:-.045);parent.position.x+=(w.side==='aurelian'?.12:-.12)}
 else if(key==='solar_lancer'){rig.rotation.z=baseRot+(w.side==='aurelian'?-.035:.035);rig.position.y=basePos.y-.06;parent.position.y-=.08}
 setTimeout(()=>{if(rig?.parent){rig.position.copy(basePos);rig.rotation.z=baseRot}},240)
}
function acWarriorPoseAim(w,stageTarget,fire=false){
 const rig=acWarriorCutawayRig(w),muzzle=rig?.userData?.muzzle,parent=muzzle?.parent;if(!rig||!muzzle||!parent||!stageTarget)return;const origin=worldToStage(muzzle.getWorldPosition(new THREE.Vector3())),dx=stageTarget.x-origin.x,dy=stageTarget.y-origin.y;if(Math.hypot(dx,dy)<3)return;
 if(parent.userData.acWeaponBaseZ==null)parent.userData.acWeaponBaseZ=parent.rotation.z;const base=parent.userData.acWeaponBaseZ,screenAngle=Math.atan2(dy,dx),raw=-screenAngle-Math.PI/2,target=Math.max(base-1.28,Math.min(base+1.28,raw));parent.rotation.z=THREE.MathUtils.lerp(parent.rotation.z,target,fire?.90:.48);
 const body=rig.userData?.rig,arm=body?.armRoots?.[1]||body?.armRoots?.[0];if(arm){if(arm.userData.acWeaponBaseZ==null)arm.userData.acWeaponBaseZ=arm.rotation.z;const armBase=arm.userData.acWeaponBaseZ,armTarget=Math.max(armBase-.88,Math.min(armBase+.88,armBase+(target-base)*.72));arm.rotation.z=THREE.MathUtils.lerp(arm.rotation.z,armTarget,fire?.82:.42)}
 if(fire){acWarriorFirePose(w,rig,parent,true);const flashPos=muzzle.getWorldPosition(new THREE.Vector3()),flash=glowSphere(.42,WEAPONS[w.weaponKey]?.color||0xffd66b,12);flash.position.copy(flashPos);flash.material.transparent=true;flash.material.opacity=1;scene.add(flash);effects.push({objects:[flash],life:.24,max:.24});const kick=parent.position.clone();parent.position.y-=.13;setTimeout(()=>{if(parent?.parent)parent.position.copy(kick)},155);diag('WARRIOR MUZZLE FIRE',w.weaponKey+' exactMuzzle=Y recoil=Y bodyPose=Y')}
}
function acWarriorRefreshAimOrigin(w,stageTarget,fire=false){if(!w)return null;acWarriorPoseAim(w,stageTarget,fire);const live=acWarriorLiveMuzzleWorld(w,stageTarget);if(live){aimOriginWorld=live.clone();aimOriginStage=worldToStage(live);startPx={x:aimOriginStage.x,y:aimOriginStage.y}}return live}
function acWarriorBeginLaunchBeat(w,stageTarget){if(!w)return;acWarriorLaunchShooter=w;acWarriorLaunchOrigin=acWarriorLiveMuzzleWorld(w,stageTarget)?.clone?.()||null;acWarriorLaunchTarget=stageTarget?targetWorldFromStage(stageTarget):null;acWarriorSignatureSfx(w);diag('WARRIOR LAUNCH BEAT',w.weaponKey+' eventDriven=Y')}
function acWarriorProjectileCleared(){
 if(!acWarriorLaunchShooter)return true;
 if(typeof acDirector==='undefined')return false;
 if(acDirector.mode==='travel'&&acDirector.projectile?.parent&&acWarriorLaunchOrigin){const p=acDirector.projectile.getWorldPosition(new THREE.Vector3()),d=p.distanceTo(acWarriorLaunchOrigin);if(d>7.0){diag('WARRIOR CAMERA HANDOFF',acWarriorLaunchShooter.weaponKey+' projectileClear='+d.toFixed(1));acWarriorLaunchShooter=null;acWarriorLaunchOrigin=null;return true}return false}
 if(acDirector.mode==='beam'){if(!xrayOpen){diag('WARRIOR CAMERA HANDOFF','solar_lancer beamClear=Y');acWarriorLaunchShooter=null;acWarriorLaunchOrigin=null;return true}return false}
 if(acDirector.mode==='settle'||acDirector.mode==='exterior'){acWarriorLaunchShooter=null;acWarriorLaunchOrigin=null;return true}
 return false
}
function acPrepareCrewSwitchHitTest(){
 if(!xrayOpen||aiming||!xrayConfirmedShooter)return;
 restoreFullCutawayStage();xrayConfirmedShooter=null;xraySelectedCrew=null;refreshPrivateXrayVisuals();diag('CREW SWITCH READY','full 3D crew hit-test restored')
}
function acSolarReleaseWatchdog(w,pt,power){if(multiplayer||!w||w.weaponKey!=='solar_lancer')return;setTimeout(()=>{if(!battleStarted||matchEnded||soloTurn!=='aurelian'||solarActionLock||w.hp<=0)return;diag('SOLAR RELEASE RECOVERY','no beam lock after valid release; retry once');acWarriorRefreshAimOrigin(w,pt,true);fireWarriorFromStage(w,pt,power,false)},150)}
function acSolarPenetrationVisual(attacker,hit,index,tickIndex){
 if(!hit?.end)return;const p=hit.end.clone(),room=hit.room,side=structureTargetSide(attacker),targetRoot=side==='aurelian'?aRooms:eRooms,plane=room?.hitPlane,quat=plane?.getWorldQuaternion?.(new THREE.Quaternion())||new THREE.Quaternion();
 const ringMat=new THREE.MeshBasicMaterial({color:0xfff1a8,transparent:true,opacity:.96,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),ring=new THREE.Mesh(new THREE.TorusGeometry(.72,.13,10,30),ringMat);ring.position.copy(p);ring.quaternion.copy(quat);ring.renderOrder=130;scene.add(ring);
 const exit=p.clone();exit.z-=.75;const exitRing=ring.clone();exitRing.material=ringMat.clone();exitRing.position.copy(exit);exitRing.scale.setScalar(.72);scene.add(exitRing);
 const born=performance.now();(function pulse(now){if(!ring.parent)return;const t=Math.min(1,(now-born)/520),s=1+t*2.6;ring.scale.setScalar(s);exitRing.scale.setScalar(.72+t*2.1);ring.material.opacity=.96*(1-t);exitRing.material.opacity=.82*(1-t);if(t<1)requestAnimationFrame(pulse);else{ring.parent?.remove(ring);exitRing.parent?.remove(exitRing)}})(born);
 spawnImpactBurst(p,0xffffdd);spawnDebris(p,0xffc044,42,.20,.72);spawnDebris(exit,0xffffff,24,.12,.48);audioNoise(.10,.095,2100);audioTone(155,.20,'square',.075,.52);audioTone(890,.14,'triangle',.065,.46,.025);
 diag('SOLAR PENETRATION VISUAL','room='+(index+1)+' tick='+(tickIndex+1)+' entryExit=Y')
}
`;

  if (!patched.includes('function acWarriorLiveMuzzleWorld(')) {const next=patched.replace('function setAimVisual(a,b){',helpers+'\nfunction setAimVisual(a,b){');status.helpers=next!==patched;patched=next}else status.helpers=true;
  patched=replaceOnce(patched,"function setAimVisual(a,b){\n  if(!selected)return;","function setAimVisual(a,b){\n  if(!selected)return;\n  acWarriorRefreshAimOrigin(selected,b,false);",status,'aimOrigin');
  patched=replaceOnce(patched,"diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);fireSelectedFromStage(pt,power)","diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);const acReleaseWarrior=selected;acWarriorRefreshAimOrigin(acReleaseWarrior,pt,true);acWarriorBeginLaunchBeat(acReleaseWarrior,pt);fireSelectedFromStage(pt,power);acSolarReleaseWatchdog(acReleaseWarrior,pt,power)",status,'releaseOrigin');status.signatureSfx=status.releaseOrigin;status.solarRecovery=status.releaseOrigin;status.firePose=status.releaseOrigin;
  patched=replaceOnce(patched,"const start=!remote&&aiming&&aimOriginWorld?aimOriginWorld.clone():muzzleWorld(w,pt);","const start=!remote&&typeof acWarriorLiveMuzzleWorld==='function'?acWarriorLiveMuzzleWorld(w,pt):(!remote&&aiming&&aimOriginWorld?aimOriginWorld.clone():muzzleWorld(w,pt));",status,'fireOrigin');

  // Before every non-drag cutaway press, restore all crew so switching never depends on which room was left open.
  patched=replaceOnce(patched,"if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){","if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){acPrepareCrewSwitchHitTest();",status,'switchReliability');

  // Camera stays with the shooter until the real projectile leaves the muzzle, or until the Solar beam firing cutaway closes.
  const cameraNeedle="  acDirectorBusy();\n  if(typeof acWarriorLaunchHoldUntil!=='undefined'&&performance.now()<acWarriorLaunchHoldUntil&&acWarriorLaunchShooter&&xrayOpen){\n    const w=acWarriorLaunchShooter,visual=xrayRoomVisuals?.find?.(v=>v.warrior===w),shooter=visual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(w),enemyRoot=w.side==='aurelian'?earth:aure,enemy=enemyRoot.getWorldPosition(new THREE.Vector3()),center=shooter.clone().lerp(enemy,.42),span=Math.max(72,Math.abs(enemy.x-shooter.x)+42),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),targetPos=new THREE.Vector3(center.x,Math.max(shooter.y,enemy.y)+6.5,Math.max(91,zNeed+23)),alpha=snap?1:.18;\n    camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,1.08,alpha);camera.updateProjectionMatrix();camera.lookAt(center.clone().lerp(enemy,.16));return\n  }\n  if(xrayOpen&&aiming&&selected){";
  const cameraReplacement=`  acDirectorBusy();
  if(acWarriorLaunchShooter&&xrayOpen&&!acWarriorProjectileCleared()){
    const w=acWarriorLaunchShooter,visual=xrayRoomVisuals?.find?.(v=>v.warrior===w),shooter=visual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(w),enemyRoot=w.side==='aurelian'?earth:aure,enemy=enemyRoot.getWorldPosition(new THREE.Vector3()),center=shooter.clone().lerp(enemy,.42),span=Math.max(72,Math.abs(enemy.x-shooter.x)+42),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),targetPos=new THREE.Vector3(center.x,Math.max(shooter.y,enemy.y)+6.5,Math.max(91,zNeed+23)),alpha=snap?1:.18;
    camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,1.08,alpha);camera.updateProjectionMatrix();camera.lookAt(center.clone().lerp(enemy,.16));return
  }
  if(xrayOpen&&aiming&&selected){`;
  const cameraNext=patched.replace(cameraNeedle,cameraReplacement);status.eventHandoff=cameraNext!==patched;patched=cameraNext;

  // If this runtime is applied to a build before the fixed-delay camera block existed, still insert event-driven ownership.
  if(!status.eventHandoff){const fallbackNeedle="  acDirectorBusy();\n  if(xrayOpen&&aiming&&selected){";const fallbackReplacement=`  acDirectorBusy();
  if(acWarriorLaunchShooter&&xrayOpen&&!acWarriorProjectileCleared()){
    const w=acWarriorLaunchShooter,visual=xrayRoomVisuals?.find?.(v=>v.warrior===w),shooter=visual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(w),enemyRoot=w.side==='aurelian'?earth:aure,enemy=enemyRoot.getWorldPosition(new THREE.Vector3()),center=shooter.clone().lerp(enemy,.42),span=Math.max(72,Math.abs(enemy.x-shooter.x)+42),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),targetPos=new THREE.Vector3(center.x,Math.max(shooter.y,enemy.y)+6.5,Math.max(91,zNeed+23)),alpha=snap?1:.18;
    camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,1.08,alpha);camera.updateProjectionMatrix();camera.lookAt(center.clone().lerp(enemy,.16));return
  }
  if(xrayOpen&&aiming&&selected){`;const fallbackNext=patched.replace(fallbackNeedle,fallbackReplacement);status.eventHandoff=fallbackNext!==patched;patched=fallbackNext}

  // Give each actual Solar punch-through a readable entry/exit event on the real room geometry.
  const penetrationNeedle="if(room.armor>0)break;if(!room.solarPenetrated){room.solarPenetrated=true;eraseCompartment(attacker,room,index);spawnImpactBurst(hit.end,0xffffff);spawnDebris(hit.end,0xffb43d,30,.18,.62);flashDamage(`SOLAR BREACH • ROOM ${index+1} OPEN`)}";
  const penetrationReplacement="if(room.armor>0)break;if(!room.solarPenetrated){room.solarPenetrated=true;acSolarPenetrationVisual(attacker,hit,index,tickIndex);eraseCompartment(attacker,room,index);spawnImpactBurst(hit.end,0xffffff);spawnDebris(hit.end,0xffb43d,30,.18,.62);flashDamage(`SOLAR BREACH • ROOM ${index+1} OPEN`)}";
  patched=replaceOnce(patched,penetrationNeedle,penetrationReplacement,status,'solarPenetration');

  patched=patched.replace(/MATCH RECORDER v0\.34\.3/g,'MATCH RECORDER v0.34.4').replace(/MATCH RECORDER v0\.34\.2/g,'MATCH RECORDER v0.34.4').replace(/MATCH RECORDER v0\.34\.1/g,'MATCH RECORDER v0.34.4');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_EVENT_DRIVEN_WARRIOR_FIRE_AND_SOLAR_PUNCHTHROUGH');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-warrior-weapon-origin-v0344" name="ac-warrior-weapon-origin" content="${summary}">\n</head>`);
}
