function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchCombatPresentationDirectorRuntime(html) {
  if (html.includes('ac-presentation-director-v0402')) return html;

  let patched = html;
  const status = {director:false,singlePress:false,pressDrag:false,camera:false,turnSolo:false,turnMp:false,impact3d:false,scatterCamera:false,sunadierTrack:false,diskTrack:false,beamTrack:false,clearAim:false,turnVfxGate:false,preAimClosed:false,aimSeal:false};

  const helpers = String.raw`
let acDirector={mode:'exterior',projectile:null,target:null,origin:null,hit:null,attacker:null,label:'',settleUntil:0,travelTotal:1,aimTargetProgress:0,aimVisualProgress:0,aimLastTs:0,sealedRooms:0};
function acDirectorLocalTurn(){return multiplayer?currentTurn===localSide:soloTurn==='aurelian'}
function acDirectorReset(reason='reset'){acDirector.mode='exterior';acDirector.projectile=null;acDirector.target=null;acDirector.origin=null;acDirector.hit=null;acDirector.attacker=null;acDirector.label='';acDirector.settleUntil=0;acDirector.aimTargetProgress=0;acDirector.aimVisualProgress=0;acDirector.aimLastTs=0;acDirector.sealedRooms=0;tacticalAimView=false;if(xrayOpen&&!acDirectorLocalTurn())closePrivateXray('director '+reason);diag('PRESENTATION DIRECTOR RESET',reason)}
function acDirectorBusy(){
 const now=performance.now();
 if(acDirector.mode==='travel'&&!acDirector.projectile?.parent){acDirector.mode='settle';acDirector.settleUntil=Math.max(acDirector.settleUntil,now+430);diag('DIRECTOR SETTLE','projectile complete')}
 if(acDirector.mode==='beam'&&now>=acDirector.settleUntil){acDirector.mode='settle';acDirector.settleUntil=now+430;diag('DIRECTOR SETTLE','beam complete')}
 if(acDirector.mode==='settle'&&now>=acDirector.settleUntil){acDirectorReset('presentation complete');return false}
 return acDirector.mode==='travel'||acDirector.mode==='beam'||acDirector.mode==='settle'
}
function acDirectorWaitForPresentation(done,label){
 if(!acDirectorBusy())return false;
 diag('TURN VFX HOLD',(label||acDirector.label||'WEAPON')+' mode='+acDirector.mode);
 const wait=()=>{if(!battleStarted||matchEnded)return;if(acDirectorBusy()){setTimeout(wait,70);return}diag('TURN VFX RELEASE',label||'WEAPON');done()};setTimeout(wait,70);return true
}
function acDirectorAimTarget(attacker,pt){
 if(!attacker||!pt||!startPx)return 0;
 const direction=attacker.side==='aurelian'?1:-1,forward=(pt.x-startPx.x)*direction;
 return THREE.MathUtils.clamp((forward-18)/260,0,1)
}
function acDirectorApplyAimSeal(attacker,progress){
 if(!xrayOpen||!attacker)return;
 const side=localXraySide(),skin=side==='aurelian'?factionSkinA:factionSkinE,rooms=localXrayRooms()?.userData?.rooms||[],modules=skin?.userData?.damageModules||[],shooter=attacker.roomIndex;
 if(!Number.isInteger(shooter)||!modules.length)return;
 const sr=Math.floor(shooter/3),sc=shooter%3,order=[];
 for(let i=0;i<modules.length;i++)if(i!==shooter)order.push(i);
 order.sort((a,b)=>{const ar=Math.floor(a/3),ac=a%3,br=Math.floor(b/3),bc=b%3,ad=Math.abs(ar-sr)+Math.abs(ac-sc),bd=Math.abs(br-sr)+Math.abs(bc-sc);return bd-ad||a-b});
 const closeCount=Math.min(order.length,Math.floor(THREE.MathUtils.clamp(progress,0,1)*order.length+.001)),closed=new Set(order.slice(0,closeCount));
 for(let i=0;i<modules.length;i++){const module=modules[i],room=rooms[i];if(!module)continue;if(room)syncRoomStructuralDamage(room);module.visible=i!==shooter&&closed.has(i)&&!room?.erased&&(room?.breach??0)<100}
 const chosen=xrayRoomVisuals?.find?.(v=>v.warrior===attacker);if(chosen?.nativeRoom){chosen.nativeRoom.visible=true;chosen.nativeRoom.userData.firingStage=true}
 if(closeCount!==acDirector.sealedRooms){acDirector.sealedRooms=closeCount;diag('AIM HULL SEAL','visual='+Math.round(progress*100)+'% target='+Math.round(acDirector.aimTargetProgress*100)+'% closed='+closeCount+'/'+order.length+' shooterRoom='+(shooter+1))}
}
function acDirectorBeginAim(attacker){
 if(!attacker)return;
 if(acDirector.mode!=='aim'){acDirector.aimTargetProgress=0;acDirector.aimVisualProgress=0;acDirector.aimLastTs=performance.now();acDirector.sealedRooms=0;restoreFullCutawayStage()}
 acDirector.mode='aim';acDirector.attacker=attacker;tacticalAimView=true
}
function acDirectorUpdateAimTarget(attacker,pt){acDirector.aimTargetProgress=acDirectorAimTarget(attacker,pt)}
function acDirectorStepAimPresentation(now=performance.now()){
 if(acDirector.mode!=='aim'||!acDirector.attacker)return acDirector.aimVisualProgress||0;
 const last=acDirector.aimLastTs||now,dt=Math.min(.05,Math.max(0,(now-last)/1000));acDirector.aimLastTs=now;
 const delta=acDirector.aimTargetProgress-acDirector.aimVisualProgress,rate=delta>=0?1.75:2.2,step=Math.sign(delta)*Math.min(Math.abs(delta),rate*dt);
 acDirector.aimVisualProgress=THREE.MathUtils.clamp(acDirector.aimVisualProgress+step,0,1);acDirectorApplyAimSeal(acDirector.attacker,acDirector.aimVisualProgress);return acDirector.aimVisualProgress
}
function acDirectorForceFiringStage(attacker){if(!attacker)return;acDirector.aimTargetProgress=1;acDirector.aimVisualProgress=1;acDirectorApplyAimSeal(attacker,1)}
function acDirectorTrackProjectile(attacker,projectile,target,hit,label){if(!attacker||attacker.side!==localWorldSide()||!projectile)return;acDirectorForceFiringStage(attacker);acDirector.mode='travel';acDirector.attacker=attacker;acDirector.projectile=projectile;acDirector.origin=projectile.getWorldPosition(new THREE.Vector3());acDirector.target=target?.clone?.()||null;acDirector.travelTotal=Math.max(1,acDirector.target?acDirector.origin.distanceTo(acDirector.target):1);acDirector.hit=hit||null;acDirector.label=label||'PROJECTILE';acDirector.settleUntil=0;tacticalAimView=false;diag('DIRECTOR PROJECTILE',acDirector.label+' target='+(Number.isInteger(hit?.roomIndex)?hit.roomIndex+1:'MISS'))}
function acDirectorBeginBeam(attacker,start,beamPath){if(!attacker||attacker.side!==localWorldSide())return;acDirectorForceFiringStage(attacker);acDirector.mode='beam';acDirector.attacker=attacker;acDirector.origin=start.clone();acDirector.target=(beamPath?.path?.at?.(-1)?.end||beamPath?.end||start).clone();acDirector.hit=beamPath?.path?.[0]||null;acDirector.label='SOLAR LANCER';acDirector.settleUntil=performance.now()+1450;tacticalAimView=false;setTimeout(()=>{if(acDirector.mode==='beam'&&xrayOpen)closePrivateXray('beam visibly cleared firing compartment')},520);diag('DIRECTOR BEAM','two-vessel framing=Y turnHeld=Y')}
function acDirectorPreImpact(){if(acDirector.mode!=='travel'||!acDirector.hit?.room||acDirector.hit._directorOpened)return;acDirector.hit._directorOpened=true;if(typeof spawnImpactCompartmentReveal==='function')spawnImpactCompartmentReveal(acDirector.attacker,acDirector.hit,1450);if(typeof beginImpactFocus==='function')beginImpactFocus(structureTargetSide(acDirector.attacker),acDirector.hit.roomIndex,'INCOMING '+acDirector.label,1250,true);diag('DIRECTOR PREIMPACT','room='+(acDirector.hit.roomIndex+1)+' primaryPriority=Y')}
`;

  if (!patched.includes('let acDirector=')) {const next=patched.replace('let cameraLastUpdate=performance.now();',helpers+'\nlet cameraLastUpdate=performance.now();');status.director=next!==patched;patched=next}else status.director=true;

  const selectBody="function selectXrayCrew(w){\n  if(!xrayOpen||!w||!w.active||w.hp<=0||w.passive)return;\n  xraySelectedCrew=w;xrayConfirmedShooter=w;restoreFullCutawayStage();selectWarrior(w);refreshPrivateXrayVisuals();\n  const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=name+' • HOLD + DRAG TO AIM • RELEASE TO FIRE';diag('SHOOTER LOCK',w.weaponKey+' room='+(w.roomIndex+1)+' confirmed=Y fullStagePreserved=Y')\n}\n";
  const selectNext=patched.replace(/function selectXrayCrew\(w\)\{[\s\S]*?\n\}\nbindMobileAction\(xrayExitBtn/,selectBody+'bindMobileAction(xrayExitBtn');status.singlePress=selectNext!==patched;patched=selectNext;
  patched=replaceOnce(patched,"const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);return}","const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);vesselGesture={pointerId:e.pointerId,start:pt,current:pt,lockedShooter:true};try{canvas.setPointerCapture(e.pointerId)}catch{}diag('SHOOTER PRESS ARMED',crew.weaponKey+' room='+(crew.roomIndex+1)+' holdDrag=Y singlePress=Y');return}",status,'pressDrag');patched=patched.replace("if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=28){","if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=10){");

  const beforePreview=patched;
  patched=patched.replace(/function acDirectorBuild3DWindow\([\s\S]*?function acDirectorBeginAim\(attacker\)\{/,'function acDirectorBeginAim(attacker){');
  patched=patched.replace(/acDirectorPreviewSolarWindows\(selected,b\);/g,'');
  patched=patched.replace(/if\(selected\.weaponKey==='solar_lancer'\)return;/g,'');
  status.preAimClosed=patched!==beforePreview;

  const aimNeedle="function setAimVisual(a,b){\n  if(!selected)return;";
  const aimReplacement="function setAimVisual(a,b){\n  if(!selected)return;\n  acDirectorBeginAim(selected);acDirectorUpdateAimTarget(selected,b);";
  patched=replaceOnce(patched,aimNeedle,aimReplacement,status,'aimSeal');

  const cameraNeedle="function updateBattleCamera(snap=false,frameDt=null){\n  if(!battleStarted||typeof camera==='undefined')return;";
  const cameraReplacement=`function updateBattleCamera(snap=false,frameDt=null){
  if(!battleStarted||typeof camera==='undefined')return;
  acDirectorBusy();
  if(xrayOpen&&aiming&&selected){
    const progress=acDirectorStepAimPresentation(performance.now()),visual=xrayRoomVisuals?.find?.(v=>v.warrior===selected),shooter=visual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(selected),enemyRoot=selected.side==='aurelian'?earth:aure,enemy=enemyRoot.getWorldPosition(new THREE.Vector3()),blend=.18+progress*.32,center=shooter.clone().lerp(enemy,blend),span=THREE.MathUtils.lerp(58,Math.max(82,Math.abs(enemy.x-shooter.x)+54),progress),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),targetPos=new THREE.Vector3(center.x,THREE.MathUtils.lerp(shooter.y+5,Math.max(shooter.y,enemy.y)+7.5,progress),Math.max(74,THREE.MathUtils.lerp(78,zNeed+28,progress))),targetLook=shooter.clone().lerp(enemy,.12+progress*.38),alpha=snap?1:.14;
    camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,THREE.MathUtils.lerp(1.12,1.02,progress),alpha);camera.updateProjectionMatrix();camera.lookAt(targetLook);return
  }
  if(acDirector.mode==='travel'&&acDirector.projectile?.parent){
    const p=acDirector.projectile.getWorldPosition(new THREE.Vector3()),target=acDirector.target||p,origin=acDirector.origin||p,remaining=p.distanceTo(target),progress=Math.max(0,Math.min(1,1-remaining/Math.max(1,acDirector.travelTotal))),cleared=p.distanceTo(origin)>7;
    if(cleared&&xrayOpen)closePrivateXray('projectile visibly cleared firing compartment');if(progress>.70||remaining<18)acDirectorPreImpact();
    const enemyBias=.38+progress*.48,center=p.clone().lerp(target,enemyBias),span=Math.max(42,Math.abs(target.x-p.x)+30),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),targetPos=new THREE.Vector3(center.x,Math.max(p.y,target.y)+6,Math.max(76,zNeed+20+(1-progress)*12)),alpha=snap?1:.12;
    camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,1.02+progress*.08,alpha);camera.updateProjectionMatrix();camera.lookAt(center.clone().lerp(target,.18+progress*.34));return
  }
  if(acDirector.mode==='beam'&&acDirector.origin&&acDirector.target){
    const a=acDirector.origin,b=acDirector.target,center=a.clone().lerp(b,.62),span=Math.max(68,Math.abs(b.x-a.x)+42),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),targetPos=new THREE.Vector3(center.x,Math.max(a.y,b.y)+6.5,Math.max(96,zNeed+25)),alpha=snap?1:.12;
    camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,1.01,alpha);camera.updateProjectionMatrix();camera.lookAt(center.clone().lerp(b,.16));return
  }`;
  patched=replaceOnce(patched,cameraNeedle,cameraReplacement,status,'camera');

  const releaseNeedle="diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);fireSelectedFromStage(pt,power)";
  patched=patched.replace(releaseNeedle,"diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);if(selected)acDirectorForceFiringStage(selected);fireSelectedFromStage(pt,power)");

  patched=replaceOnce(patched,"grenade.position.copy(start);scene.add(grenade);const chainMat","grenade.position.copy(start);scene.add(grenade);acDirectorTrackProjectile(attacker,grenade,target,hit,'SUNADIER');const chainMat",status,'sunadierTrack');
  patched=replaceOnce(patched,"const visual=makeSunDiskVisual(start),history=","const visual=makeSunDiskVisual(start);acDirectorTrackProjectile(attacker,visual.group,terminal,hits[0]||null,'SUN DISK');const history=",status,'diskTrack');
  patched=replaceOnce(patched,"function spawnSolarLancerBeam(attacker,start,beamPath,weapon){\n  const localAction=","function spawnSolarLancerBeam(attacker,start,beamPath,weapon){\n  acDirectorBeginBeam(attacker,start,beamPath);\n  const localAction=",status,'beamTrack');

  const impact3d=String.raw`function spawnImpactCompartmentReveal(attacker,hit,duration=1450){
  if(!hit?.room||!Number.isInteger(hit.roomIndex))return false;clearImpactCompartmentReveal();const room=hit.room,targetSide=structureTargetSide(attacker),targetCrew=opposing(attacker),occupant=targetCrew.find(w=>w.active&&w.hp>0&&w.roomIndex===hit.roomIndex)||null,skin=targetSide==='aurelian'?factionSkinA:factionSkinE,module=skin?.userData?.damageModules?.[hit.roomIndex]||null,moduleWasVisible=!!module?.visible,removedPanels=[],hidden=[];
  if(module)module.visible=false;const removePanel=mesh=>{if(!mesh||mesh===module||mesh.visible===false||mesh.userData?.healthVisual||mesh.userData?.xrayVisual||removedPanels.some(x=>x.mesh===mesh))return;removedPanels.push({mesh,visible:mesh.visible});mesh.visible=false};if(hit.hullObject&&isDescendantOf(hit.hullObject,skin))removePanel(hit.hullObject);
  const group=new THREE.Group(),point=room.hitPlane.getWorldPosition(new THREE.Vector3()),quat=room.hitPlane.getWorldQuaternion(new THREE.Quaternion()),aurelianTarget=factionForSide(targetSide)==='aurelian';group.position.copy(point);group.quaternion.copy(quat);group.renderOrder=116;scene.add(group);
  const metal=new THREE.MeshStandardMaterial({color:aurelianTarget?0x70451f:0x344954,metalness:.5,roughness:.62}),inside=new THREE.MeshStandardMaterial({color:0x050b11,metalness:.16,roughness:.92});const back=new THREE.Mesh(new THREE.BoxGeometry(5.7,3.95,.30),inside),floor=new THREE.Mesh(new THREE.BoxGeometry(5.7,.23,2.18),inside),ceiling=new THREE.Mesh(new THREE.BoxGeometry(5.7,.19,2.08),inside),leftWall=new THREE.Mesh(new THREE.BoxGeometry(.19,3.95,2.08),metal),rightWall=leftWall.clone();back.position.z=-.86;floor.position.set(0,-1.84,.06);ceiling.position.set(0,1.84,-.03);leftWall.position.set(-2.74,0,-.04);rightWall.position.set(2.74,0,-.04);group.add(back,floor,ceiling,leftWall,rightWall);
  const panels=[];for(const side of[-1,1]){const panel=new THREE.Mesh(new THREE.BoxGeometry(2.84,4.04,.26),metal.clone());panel.position.set(side*1.42,0,.25);panel.userData.closed=panel.position.clone();panel.userData.open=new THREE.Vector3(side*3.46,.10,.78);panel.userData.openRot=side*.82;group.add(panel);panels.push(panel)}
  if(occupant){try{const rig=buildCutawayOnlyWarrior3D(occupant.weaponKey);if(rig){rig.position.set(0,-.52,.40);rig.renderOrder=118;group.add(rig);occupant.impactRevealGroup=group;occupant.impactRevealUntil=performance.now()+duration}}catch(err){diag('IMPACT 3D RIG ERROR',String(err?.message||err))}}
  const born=performance.now();(function open(now){if(!group.parent)return;const t=Math.min(1,(now-born)/410),e=1-Math.pow(1-t,3);for(const panel of panels){panel.position.copy(panel.userData.closed).lerp(panel.userData.open,e);panel.rotation.y=panel.userData.openRot*e}if(t<1)requestAnimationFrame(open)})(born);
  const timer=setTimeout(()=>{if(activeImpactCompartmentReveal?.group===group)clearImpactCompartmentReveal()},duration+220);activeImpactCompartmentReveal={group,room,module,moduleWasVisible,removedPanels,hidden,occupant,timer};diag('IMPACT 3D WINDOW','side='+targetSide+' room='+(hit.roomIndex+1)+' warrior='+(occupant?.weaponKey||'NONE')+' primaryPriority=Y sprite=N');return true
}
`;
  const impactRegex=/function spawnImpactCompartmentReveal\(attacker,hit,duration=1450\)\{[\s\S]*?\n\}\n\s*(?=let acDirector=)/;const impactNext=patched.replace(impactRegex,impact3d);status.impact3d=impactNext!==patched;patched=impactNext;
  patched=replaceOnce(patched,"presentImpact=!he9||performance.now()>=groupedHe9ImpactUntil;if(presentImpact){","secondaryScatter=(weapon.name||'')==='SUNADIER PLASMA SCATTER',presentImpact=!secondaryScatter&&(!he9||performance.now()>=groupedHe9ImpactUntil);if(presentImpact){",status,'scatterCamera');

  const finishNeedle="function finishAurelianWeaponAction(attacker,label){\n solarActionLock=false;refreshMovePad();diag('ACTION UNLOCK',(attacker.side===localWorldSide()?'LOCAL ':'REMOTE ')+label+' COMPLETE');\n if(!multiplayer&&battleStarted&&!matchEnded&&attacker.side==='aurelian'&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()\n}";
  const finishReplacement="function finishAurelianWeaponAction(attacker,label){\n const finishNow=()=>{solarActionLock=false;refreshMovePad();diag('ACTION UNLOCK',(attacker.side===localWorldSide()?'LOCAL ':'REMOTE ')+label+' COMPLETE');if(!multiplayer&&battleStarted&&!matchEnded&&attacker.side==='aurelian'&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()};\n if(attacker.side===localWorldSide()&&acDirectorWaitForPresentation(finishNow,label))return;finishNow()\n}";
  patched=replaceOnce(patched,finishNeedle,finishReplacement,status,'turnVfxGate');

  if(!patched.includes("function clearAim(){if(acDirector.mode==='aim')")){const next=patched.replace('function clearAim(){',"function clearAim(){if(acDirector.mode==='aim'){acDirector.mode=xrayOpen?'cutaway':'exterior';acDirector.aimTargetProgress=0;acDirector.aimVisualProgress=0;acDirector.aimLastTs=0;acDirector.sealedRooms=0;if(xrayOpen)restoreFullCutawayStage()}tacticalAimView=false;");status.clearAim=next!==patched;patched=next}else status.clearAim=true;
  patched=replaceOnce(patched,"soloTurn='earth';movePending=false;refreshMovePad();","acDirectorReset('solo handoff');setSoloTurn('earth');movePending=false;refreshMovePad();",status,'turnSolo');
  if(!patched.includes("scheduleXrayForTurn('solo transition')"))patched=patched.replace("soloTurn=side;\n  if(previous!==side&&battleStarted)advanceSupportTurn(side);","soloTurn=side;\n  if(battleStarted)scheduleXrayForTurn('solo transition');\n  if(previous!==side&&battleStarted)advanceSupportTurn(side);");
  patched=replaceOnce(patched,"mpTurn.classList.add('show');const mine=side===localSide;","mpTurn.classList.add('show');const mine=side===localSide;if(battleStarted&&!matchEnded)scheduleXrayForTurn('multiplayer transition');if(!mine)acDirectorReset('multiplayer opponent turn');",status,'turnMp');
  patched=patched.replace("statusEl.textContent='CUTAWAY • TAP A WARRIOR ONCE TO HIGHLIGHT • TAP AGAIN TO LOCK SHOOTER'","statusEl.textContent='CUTAWAY • PRESS A WARRIOR • HOLD + DRAG TO AIM • RELEASE TO FIRE'");
  patched=patched.replace(/MATCH RECORDER v0\.3[34]\.\d+/g,'MATCH RECORDER v0.40.2');
  patched=patched.replace(/build=2026-09-(01|04|05)_[A-Z0-9_]+/g,'build=2026-09-05_SMOOTH_PROGRESSIVE_AIM_SEAL');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-presentation-director-v0402" name="ac-presentation-director" content="${summary} aimTarget:RAW_READ_ONLY aimVisual:SMOOTH hullSeal:FURTHEST_FIRST shooterRoom:PROTECTED preAimEnemyHull:CLOSED impactReveal:POST_HIT_ONLY">\n</head>`);
}
