function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchCombatPresentationDirectorRuntime(html) {
  if (html.includes('ac-presentation-director-v0340')) return html;

  let patched = html;
  const status = {
    director:false,
    singlePress:false,
    pressDrag:false,
    camera:false,
    turnSolo:false,
    turnMp:false,
    solar3dPreview:false,
    impact3d:false,
    scatterCamera:false,
    sunadierTrack:false,
    diskTrack:false,
    beamTrack:false,
    clearAim:false
  };

  const helpers = String.raw`
let acDirector={mode:'exterior',projectile:null,target:null,origin:null,hit:null,attacker:null,label:'',aimWindows:[],aimSignature:'',lastPreviewAt:0};
function acDirectorLocalTurn(){return multiplayer?currentTurn===localSide:soloTurn==='aurelian'}
function acDirectorRestoreAimWindows(){
  for(const state of acDirector.aimWindows||[]){
    if(state?.module)state.module.visible=state.moduleWasVisible&&!state.room?.erased&&!state.module.userData?.structureHpHidden;
    if(state?.group?.parent)state.group.parent.remove(state.group)
  }
  acDirector.aimWindows=[];acDirector.aimSignature=''
}
function acDirectorReset(reason='reset'){
  acDirectorRestoreAimWindows();
  acDirector.mode='exterior';acDirector.projectile=null;acDirector.target=null;acDirector.origin=null;acDirector.hit=null;acDirector.attacker=null;acDirector.label='';tacticalAimView=false;
  if(xrayOpen&&!acDirectorLocalTurn())closePrivateXray('director '+reason);
  diag('PRESENTATION DIRECTOR RESET',reason)
}
function acDirectorBuild3DWindow(attacker,hit,order=0){
  if(!hit?.room||!Number.isInteger(hit.roomIndex))return null;
  const room=hit.room,targetSide=structureTargetSide(attacker),skin=targetSide==='aurelian'?factionSkinA:factionSkinE,module=skin?.userData?.damageModules?.[hit.roomIndex]||null,moduleWasVisible=!!module?.visible;
  if(module)module.visible=false;
  const group=new THREE.Group(),point=room.hitPlane.getWorldPosition(new THREE.Vector3()),quat=room.hitPlane.getWorldQuaternion(new THREE.Quaternion());group.position.copy(point);group.quaternion.copy(quat);group.renderOrder=116;scene.add(group);
  const aurelianTarget=factionForSide(targetSide)==='aurelian',metal=new THREE.MeshStandardMaterial({color:aurelianTarget?0x6d421f:0x344853,metalness:.48,roughness:.62,transparent:true,opacity:.98,depthWrite:true}),inside=new THREE.MeshStandardMaterial({color:0x050b11,metalness:.18,roughness:.92}),edgeMat=new THREE.MeshBasicMaterial({color:aurelianTarget?0xffc95c:0x93e5ff,transparent:true,opacity:.82,depthWrite:false});
  const back=new THREE.Mesh(new THREE.BoxGeometry(5.25,3.58,.28),inside),floor=new THREE.Mesh(new THREE.BoxGeometry(5.25,.22,2.0),inside),ceiling=new THREE.Mesh(new THREE.BoxGeometry(5.25,.18,1.9),inside),leftWall=new THREE.Mesh(new THREE.BoxGeometry(.18,3.58,1.9),metal),rightWall=leftWall.clone();back.position.z=-.82;floor.position.set(0,-1.67,.06);ceiling.position.set(0,1.67,-.04);leftWall.position.set(-2.52,0,-.05);rightWall.position.set(2.52,0,-.05);group.add(back,floor,ceiling,leftWall,rightWall);
  const rim=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.38,3.72,.52)),new THREE.LineBasicMaterial({color:edgeMat.color,transparent:true,opacity:.72,depthWrite:false}));rim.position.z=-.02;group.add(rim);
  const panels=[];for(const side of[-1,1]){const panel=new THREE.Mesh(new THREE.BoxGeometry(2.62,3.70,.24),metal.clone());panel.position.set(side*1.31,0,.24);panel.userData.closed=panel.position.clone();panel.userData.open=new THREE.Vector3(side*3.08,.08,.74);panel.userData.openRot=side*.76;group.add(panel);panels.push(panel)}
  const occupant=opposing(attacker).find(w=>w.active&&w.hp>0&&w.roomIndex===hit.roomIndex)||null;
  if(occupant){try{let rig=buildCutawayOnlyWarrior3D(occupant.weaponKey);if(rig){rig.position.set(0,-.52,.36);rig.scale.multiplyScalar(.58);rig.renderOrder=118;group.add(rig)}}catch(err){diag('3D WINDOW RIG FALLBACK',String(err?.message||err))}}
  const born=performance.now();(function open(now){if(!group.parent)return;const t=Math.min(1,(now-born)/360),e=1-Math.pow(1-t,3);for(const panel of panels){panel.position.copy(panel.userData.closed).lerp(panel.userData.open,e);panel.rotation.y=panel.userData.openRot*e}if(t<1)requestAnimationFrame(open)})(born);
  diag('3D TARGET WINDOW','room='+(hit.roomIndex+1)+' order='+(order+1)+' occupant='+(occupant?.weaponKey||'NONE')+' sprite=N');
  return{group,room,module,moduleWasVisible,roomIndex:hit.roomIndex}
}
function acDirectorPreviewSolarWindows(attacker,pt){
  if(!attacker||attacker.weaponKey!=='solar_lancer'||!aiming)return;
  const now=performance.now();if(now-acDirector.lastPreviewAt<90)return;acDirector.lastPreviewAt=now;
  const solution=solarBeamPathFromStage(attacker,pt,3),path=solution.path||[],signature=path.map(h=>h.roomIndex).join(',');
  if(signature===acDirector.aimSignature)return;acDirectorRestoreAimWindows();acDirector.aimSignature=signature;
  acDirector.aimWindows=path.map((hit,i)=>acDirectorBuild3DWindow(attacker,hit,i)).filter(Boolean);
  diag('SOLAR 3D AIM WINDOWS',signature?signature.split(',').map(i=>Number(i)+1).join('>'):'MISS')
}
function acDirectorBeginAim(attacker){if(!attacker)return;acDirector.mode='aim';acDirector.attacker=attacker;tacticalAimView=true}
function acDirectorTrackProjectile(attacker,projectile,target,hit,label){
  if(!attacker||attacker.side!==localWorldSide()||!projectile)return;
  acDirector.mode='travel';acDirector.attacker=attacker;acDirector.projectile=projectile;acDirector.origin=projectile.getWorldPosition(new THREE.Vector3());acDirector.target=target?.clone?.()||null;acDirector.hit=hit||null;acDirector.label=label||'PROJECTILE';tacticalAimView=false;
  diag('DIRECTOR PROJECTILE',acDirector.label+' target='+(Number.isInteger(hit?.roomIndex)?hit.roomIndex+1:'MISS'))
}
function acDirectorBeginBeam(attacker,start,beamPath){
  if(!attacker||attacker.side!==localWorldSide())return;
  acDirector.mode='beam';acDirector.attacker=attacker;acDirector.origin=start.clone();acDirector.target=(beamPath?.path?.at?.(-1)?.end||beamPath?.end||start).clone();acDirector.hit=beamPath?.path?.[0]||null;acDirector.label='SOLAR LANCER';tacticalAimView=false;
  setTimeout(()=>{if(acDirector.mode==='beam'&&xrayOpen)closePrivateXray('beam visibly cleared firing compartment')},620);
  diag('DIRECTOR BEAM','two-vessel framing=Y windows='+((beamPath?.path||[]).length))
}
function acDirectorPreImpact(){
  if(acDirector.mode!=='travel'||!acDirector.hit?.room||acDirector.hit._directorOpened)return;acDirector.hit._directorOpened=true;
  if(typeof spawnImpactCompartmentReveal==='function')spawnImpactCompartmentReveal(acDirector.attacker,acDirector.hit,1250);
  if(typeof beginImpactFocus==='function')beginImpactFocus(structureTargetSide(acDirector.attacker),acDirector.hit.roomIndex,'INCOMING '+acDirector.label,1150,true);
  diag('DIRECTOR PREIMPACT','room='+(acDirector.hit.roomIndex+1))
}
`;

  if (!patched.includes('let acDirector=')) {
    const next = patched.replace('let cameraLastUpdate=performance.now();', helpers + '\nlet cameraLastUpdate=performance.now();');
    status.director = next !== patched;
    patched = next;
  } else status.director = true;

  const selectBody = "function selectXrayCrew(w){\n  if(!xrayOpen||!w||!w.active||w.hp<=0||w.passive)return;\n  xraySelectedCrew=w;xrayConfirmedShooter=w;restoreFullCutawayStage();selectWarrior(w);setCutawayFiringStage(w);refreshPrivateXrayVisuals();\n  const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=name+' • HOLD + DRAG TO AIM • RELEASE TO FIRE';diag('SHOOTER LOCK',w.weaponKey+' room='+(w.roomIndex+1)+' confirmed=Y singlePress=Y otherRoomsClosed=Y')\n}\n";
  const selectNext = patched.replace(/function selectXrayCrew\(w\)\{[\s\S]*?\n\}\nbindMobileAction\(xrayExitBtn/, selectBody + 'bindMobileAction(xrayExitBtn');
  status.singlePress = selectNext !== patched;patched = selectNext;

  const crewNeedle = "const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);return}";
  const crewReplacement = "const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);vesselGesture={pointerId:e.pointerId,start:pt,current:pt,lockedShooter:true};try{canvas.setPointerCapture(e.pointerId)}catch{}diag('SHOOTER PRESS ARMED',crew.weaponKey+' room='+(crew.roomIndex+1)+' holdDrag=Y singlePress=Y');return}";
  patched = replaceOnce(patched, crewNeedle, crewReplacement, status, 'pressDrag');
  patched = patched.replace("if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=28){","if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=10){");

  const outlineNeedle = "function renderEnemyAimOutlines(pointer){\n  if(!enemyAimOutlineLayer)return;enemyAimOutlineLayer.replaceChildren();if(!aiming||!selected)return;";
  const outlineReplacement = "function renderEnemyAimOutlines(pointer){\n  if(!enemyAimOutlineLayer)return;enemyAimOutlineLayer.replaceChildren();if(!aiming||!selected)return;if(selected.weaponKey==='solar_lancer')return;";
  patched = replaceOnce(patched, outlineNeedle, outlineReplacement, status, 'solar3dPreview');

  if (!patched.includes('acDirectorPreviewSolarWindows(selected,b);')) {
    const next = patched.replace("function setAimVisual(a,b){\n  if(!selected)return;", "function setAimVisual(a,b){\n  if(!selected)return;\n  acDirectorBeginAim(selected);acDirectorPreviewSolarWindows(selected,b);");
    status.solar3dPreview = status.solar3dPreview && next !== patched;patched = next;
  }

  const cameraNeedle = "function updateBattleCamera(snap=false,frameDt=null){\n  if(!battleStarted||typeof camera==='undefined')return;";
  const cameraReplacement = `function updateBattleCamera(snap=false,frameDt=null){
  if(!battleStarted||typeof camera==='undefined')return;
  if(xrayOpen&&aiming&&selected){
    const visual=xrayRoomVisuals?.find?.(v=>v.warrior===selected),shooter=visual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(selected),enemyRoot=selected.side==='aurelian'?earth:aure,enemy=enemyRoot.getWorldPosition(new THREE.Vector3()),center=shooter.clone().lerp(enemy,.56),span=Math.max(82,Math.abs(enemy.x-shooter.x)+54),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),pointer=(typeof currentPx!=='undefined'&&currentPx)||{x:640,y:360},nx=Math.max(-1,Math.min(1,(pointer.x-640)/640)),ny=Math.max(-1,Math.min(1,(pointer.y-360)/360)),targetPos=new THREE.Vector3(center.x+nx*9,Math.max(shooter.y,enemy.y)+8-ny*2,Math.max(112,zNeed+32)),targetLook=new THREE.Vector3(center.x+nx*5,(shooter.y+enemy.y)*.5+1-ny*2,2),alpha=snap?1:.18;
    camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,.94,alpha);camera.updateProjectionMatrix();camera.lookAt(targetLook);return
  }
  if(acDirector.mode==='travel'&&acDirector.projectile?.parent){
    const p=acDirector.projectile.getWorldPosition(new THREE.Vector3()),target=acDirector.target||p,origin=acDirector.origin||p,remaining=p.distanceTo(target),cleared=p.distanceTo(origin)>7;
    if(cleared&&xrayOpen)closePrivateXray('projectile visibly cleared firing compartment');if(remaining<17)acDirectorPreImpact();
    const center=p.clone().lerp(target,.60),span=Math.max(52,Math.abs(target.x-p.x)+38),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),targetPos=new THREE.Vector3(center.x,Math.max(p.y,target.y)+7,Math.max(88,zNeed+26)),alpha=snap?1:.14;
    camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,.98,alpha);camera.updateProjectionMatrix();camera.lookAt(center.clone().lerp(target,.22));return
  }
  if(acDirector.mode==='beam'&&acDirector.origin&&acDirector.target){
    const a=acDirector.origin,b=acDirector.target,center=a.clone().lerp(b,.58),span=Math.max(72,Math.abs(b.x-a.x)+46),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),targetPos=new THREE.Vector3(center.x,Math.max(a.y,b.y)+7,Math.max(102,zNeed+30)),alpha=snap?1:.14;
    camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,.96,alpha);camera.updateProjectionMatrix();camera.lookAt(center);return
  }`;
  patched = replaceOnce(patched, cameraNeedle, cameraReplacement, status, 'camera');

  patched = replaceOnce(patched, "grenade.position.copy(start);scene.add(grenade);const chainMat", "grenade.position.copy(start);scene.add(grenade);acDirectorTrackProjectile(attacker,grenade,target,hit,'SUNADIER');const chainMat", status, 'sunadierTrack');
  patched = replaceOnce(patched, "const visual=makeSunDiskVisual(start),history=", "const visual=makeSunDiskVisual(start);acDirectorTrackProjectile(attacker,visual.group,terminal,hits[0]||null,'SUN DISK');const history=", status, 'diskTrack');
  patched = replaceOnce(patched, "function spawnSolarLancerBeam(attacker,start,beamPath,weapon){\n  const localAction=", "function spawnSolarLancerBeam(attacker,start,beamPath,weapon){\n  acDirectorBeginBeam(attacker,start,beamPath);\n  const localAction=", status, 'beamTrack');

  const impact3d = String.raw`function spawnImpactCompartmentReveal(attacker,hit,duration=1450){
  if(!hit?.room||!Number.isInteger(hit.roomIndex))return false;clearImpactCompartmentReveal();const room=hit.room,targetSide=structureTargetSide(attacker),targetCrew=opposing(attacker),occupant=targetCrew.find(w=>w.active&&w.hp>0&&w.roomIndex===hit.roomIndex)||null,skin=targetSide==='aurelian'?factionSkinA:factionSkinE,module=skin?.userData?.damageModules?.[hit.roomIndex]||null,moduleWasVisible=!!module?.visible,removedPanels=[],hidden=[];
  if(module)module.visible=false;const removePanel=mesh=>{if(!mesh||mesh===module||mesh.visible===false||mesh.userData?.healthVisual||mesh.userData?.xrayVisual||removedPanels.some(x=>x.mesh===mesh))return;removedPanels.push({mesh,visible:mesh.visible});mesh.visible=false};if(hit.hullObject&&isDescendantOf(hit.hullObject,skin))removePanel(hit.hullObject);
  const group=new THREE.Group(),point=room.hitPlane.getWorldPosition(new THREE.Vector3()),quat=room.hitPlane.getWorldQuaternion(new THREE.Quaternion()),aurelianTarget=factionForSide(targetSide)==='aurelian';group.position.copy(point);group.quaternion.copy(quat);group.renderOrder=116;scene.add(group);
  const metal=new THREE.MeshStandardMaterial({color:aurelianTarget?0x70451f:0x344954,metalness:.5,roughness:.62}),inside=new THREE.MeshStandardMaterial({color:0x050b11,metalness:.16,roughness:.92});const back=new THREE.Mesh(new THREE.BoxGeometry(5.3,3.65,.28),inside),floor=new THREE.Mesh(new THREE.BoxGeometry(5.3,.22,2.02),inside),ceiling=new THREE.Mesh(new THREE.BoxGeometry(5.3,.18,1.92),inside),leftWall=new THREE.Mesh(new THREE.BoxGeometry(.18,3.65,1.94),metal),rightWall=leftWall.clone();back.position.z=-.82;floor.position.set(0,-1.70,.06);ceiling.position.set(0,1.70,-.03);leftWall.position.set(-2.55,0,-.04);rightWall.position.set(2.55,0,-.04);group.add(back,floor,ceiling,leftWall,rightWall);
  const panels=[];for(const side of[-1,1]){const panel=new THREE.Mesh(new THREE.BoxGeometry(2.65,3.76,.24),metal.clone());panel.position.set(side*1.32,0,.24);panel.userData.closed=panel.position.clone();panel.userData.open=new THREE.Vector3(side*3.12,.10,.72);panel.userData.openRot=side*.78;group.add(panel);panels.push(panel)}
  if(occupant){try{let rig=buildCutawayOnlyWarrior3D(occupant.weaponKey);if(rig){rig.position.set(0,-.50,.38);rig.scale.multiplyScalar(.60);rig.renderOrder=118;group.add(rig);occupant.impactRevealGroup=group;occupant.impactRevealUntil=performance.now()+duration}}catch(err){diag('IMPACT 3D RIG ERROR',String(err?.message||err))}}
  const born=performance.now();(function open(now){if(!group.parent)return;const t=Math.min(1,(now-born)/380),e=1-Math.pow(1-t,3);for(const panel of panels){panel.position.copy(panel.userData.closed).lerp(panel.userData.open,e);panel.rotation.y=panel.userData.openRot*e}if(t<1)requestAnimationFrame(open)})(born);
  const timer=setTimeout(()=>{if(activeImpactCompartmentReveal?.group===group)clearImpactCompartmentReveal()},duration+180);activeImpactCompartmentReveal={group,room,module,moduleWasVisible,removedPanels,hidden,occupant,timer};diag('IMPACT 3D WINDOW','side='+targetSide+' room='+(hit.roomIndex+1)+' warrior='+(occupant?.weaponKey||'NONE')+' sprite=N');return true
}
`;
  const impactRegex = /function spawnImpactCompartmentReveal\(attacker,hit,duration=1450\)\{[\s\S]*?\n\}\n\s*(?=let acDirector=)/;
  const impactNext = patched.replace(impactRegex, impact3d);
  status.impact3d = impactNext !== patched;patched = impactNext;

  patched = replaceOnce(patched, "presentImpact=!he9||performance.now()>=groupedHe9ImpactUntil;if(presentImpact){", "secondaryScatter=(weapon.name||'')==='SUNADIER PLASMA SCATTER',presentImpact=!secondaryScatter&&(!he9||performance.now()>=groupedHe9ImpactUntil);if(presentImpact){", status, 'scatterCamera');

  if (!patched.includes("function clearAim(){if(acDirector.mode==='aim')")) {
    const next = patched.replace('function clearAim(){', "function clearAim(){if(acDirector.mode==='aim'){acDirector.mode=xrayOpen?'cutaway':'exterior';acDirectorRestoreAimWindows()}tacticalAimView=false;");
    status.clearAim = next !== patched;patched = next;
  } else status.clearAim = true;

  patched = replaceOnce(patched, "soloTurn='earth';movePending=false;refreshMovePad();", "acDirectorReset('solo handoff');setSoloTurn('earth');movePending=false;refreshMovePad();", status, 'turnSolo');

  if (!patched.includes("scheduleXrayForTurn('solo transition')")) {
    patched = patched.replace("soloTurn=side;\n  if(previous!==side&&battleStarted)advanceSupportTurn(side);", "soloTurn=side;\n  if(battleStarted)scheduleXrayForTurn('solo transition');\n  if(previous!==side&&battleStarted)advanceSupportTurn(side);");
  }

  patched = replaceOnce(patched, "mpTurn.classList.add('show');const mine=side===localSide;", "mpTurn.classList.add('show');const mine=side===localSide;if(battleStarted&&!matchEnded)scheduleXrayForTurn('multiplayer transition');if(!mine)acDirectorReset('multiplayer opponent turn');", status, 'turnMp');

  patched = patched.replace("statusEl.textContent='CUTAWAY • TAP A WARRIOR ONCE TO HIGHLIGHT • TAP AGAIN TO LOCK SHOOTER'", "statusEl.textContent='CUTAWAY • PRESS A WARRIOR • HOLD + DRAG TO AIM • RELEASE TO FIRE'");

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g,'MATCH RECORDER v0.34.0');
  patched = patched.replace(/build=2026-09-(01|04)_[A-Z0-9_]+/g,'build=2026-09-04_SINGLE_PRESENTATION_DIRECTOR_3D_WINDOWS');

  const summary = Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>', `<meta id="ac-presentation-director-v0340" name="ac-presentation-director" content="${summary}">\n</head>`);
}
