function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchCombatPresentationDirectorRuntime(html) {
  if (html.includes('ac-presentation-director-v0421')) return html;

  let patched = html;
  const status = {director:false,singlePress:false,pressDrag:false,camera:false,turnSolo:false,turnMp:false,impactExterior:false,scatterCamera:false,sunadierTrack:false,diskTrack:false,beamTrack:false,clearAim:false,turnVfxGate:false,preAimClosed:false,aimSeal:false,releaseSeal:false};

  const helpers = String.raw`
let acDirector={mode:'exterior',projectile:null,target:null,origin:null,hit:null,attacker:null,label:'',settleUntil:0,travelTotal:1,aimTargetProgress:0,aimVisualProgress:0,aimLastTs:0,aimInputOrigin:null,sealedRooms:0,cameraStage:-1};
function acDirectorLocalTurn(){return multiplayer?currentTurn===localSide:soloTurn==='aurelian'}
function acDirectorReset(reason='reset'){acDirector.mode='exterior';acDirector.projectile=null;acDirector.target=null;acDirector.origin=null;acDirector.hit=null;acDirector.attacker=null;acDirector.label='';acDirector.settleUntil=0;acDirector.aimTargetProgress=0;acDirector.aimVisualProgress=0;acDirector.aimLastTs=0;acDirector.aimInputOrigin=null;acDirector.sealedRooms=0;acDirector.cameraStage=-1;tacticalAimView=false;if(xrayOpen&&!acDirectorLocalTurn())closePrivateXray('director '+reason);diag('PRESENTATION DIRECTOR RESET',reason)}
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
 if(!attacker||!pt)return 0;
 const origin=acDirector.aimInputOrigin||startPx;if(!origin)return 0;
 const dx=pt.x-origin.x,dy=pt.y-origin.y,direction=attacker.side==='aurelian'?1:-1;
 if(dx*direction<=18)return 0;
 // Match the standard Aurelian power gesture: the full presentation arrives at the
 // same 510px drag that reaches 100% power, without changing the raw input point.
 return THREE.MathUtils.clamp((Math.hypot(dx,dy)-45)/465,0,1)
}
function acDirectorApplyAimSeal(attacker,progress){
 if(!xrayOpen||!attacker)return;
 const rooms=localXrayRooms()?.userData?.rooms||[],visuals=xrayRoomVisuals||[],shooterVisual=visuals.find(v=>v.warrior===attacker),shooterBay=shooterVisual?.index;
 if(!Number.isInteger(attacker.roomIndex)||!Number.isInteger(shooterBay)||visuals.length!==6)return;
 const sr=Math.floor(shooterBay/3),sc=shooterBay%3,order=[];
 for(let i=0;i<visuals.length;i++)if(i!==shooterBay)order.push(i);
 order.sort((a,b)=>{const ar=Math.floor(a/3),ac=a%3,br=Math.floor(b/3),bc=b%3,ad=Math.abs(ar-sr)+Math.abs(ac-sc),bd=Math.abs(br-sr)+Math.abs(bc-sc);return bd-ad||a-b});
 const closeCount=Math.min(order.length,Math.floor(THREE.MathUtils.clamp(progress,0,1)*order.length+.001)),closed=new Set(order.slice(0,closeCount));let nativeClosed=0;
 for(const visual of visuals){const shouldClose=visual.index!==shooterBay&&closed.has(visual.index);setCutawayBayOpen(visual,!shouldClose);if(shouldClose)nativeClosed++}
 if(shooterVisual?.nativeRoom){setCutawayBayOpen(shooterVisual,true);shooterVisual.nativeRoom.userData.firingStage=true}
 if(acDirector.shellMapReported!==true){acDirector.shellMapReported=true;diag('AIM SHELL MAP','physicalBays='+visuals.length+' logicalRooms='+rooms.length+' exteriorAuthority=UNIFIED_PRESSURE_HULL_EXACT_MODULES closedBayInterior=HIDDEN layout=PLAYER_SKETCH_STACKED combatGrid=UNCHANGED')}
 if(closeCount!==acDirector.sealedRooms){acDirector.sealedRooms=closeCount;diag('AIM HULL SEAL','visual='+Math.round(progress*100)+'% target='+Math.round(acDirector.aimTargetProgress*100)+'% closed='+closeCount+'/'+order.length+' exactExteriorModules='+nativeClosed+' closedInteriors='+nativeClosed+' physicalBays=6 logicalRooms=9 shooterBay='+(shooterBay+1)+' shooterRoom='+(attacker.roomIndex+1))}
}
function acDirectorBeginAim(attacker){
 if(!attacker)return;
 if(acDirector.mode!=='aim'){acDirector.aimTargetProgress=0;acDirector.aimVisualProgress=0;acDirector.aimLastTs=performance.now();acDirector.aimInputOrigin=startPx?{x:startPx.x,y:startPx.y}:null;acDirector.sealedRooms=0;acDirector.shellMapReported=false;acDirector.cameraStage=-1;restoreFullCutawayStage()}
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
function acDirectorPreImpact(){if(acDirector.mode!=='travel'||!acDirector.hit?.room||acDirector.hit._directorOpened)return;acDirector.hit._directorOpened=true;if(typeof spawnImpactCompartmentReveal==='function')spawnImpactCompartmentReveal(acDirector.attacker,acDirector.hit,1450);if(typeof beginImpactFocus==='function')beginImpactFocus(structureTargetSide(acDirector.attacker),acDirector.hit.roomIndex,'INCOMING '+acDirector.label,1250,true);diag('DIRECTOR PREIMPACT','room='+(acDirector.hit.roomIndex+1)+' primaryPriority=Y enemyHull=CLOSED')}
`;

  if (!patched.includes('let acDirector=')) {const next=patched.replace('let cameraLastUpdate=performance.now();',helpers+'\nlet cameraLastUpdate=performance.now();');status.director=next!==patched;patched=next}else status.director=true;

  const selectBody="function selectXrayCrew(w){\n  if(!xrayOpen||!w||!w.active||w.hp<=0||w.passive)return;\n  xraySelectedCrew=w;xrayConfirmedShooter=w;restoreFullCutawayStage();selectWarrior(w);refreshPrivateXrayVisuals();\n  const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=name+' • HOLD + DRAG TO AIM • RELEASE TO FIRE';diag('SHOOTER LOCK',w.weaponKey+' room='+(w.roomIndex+1)+' confirmed=Y fullStagePreserved=Y')\n}\n";
  const selectNext=patched.replace(/function selectXrayCrew\(w\)\{[\s\S]*?\n\}\nbindMobileAction\(xrayExitBtn/,selectBody+'bindMobileAction(xrayExitBtn');status.singlePress=selectNext!==patched;patched=selectNext;
  patched=replaceOnce(patched,"const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);return}","const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);vesselGesture={pointerId:e.pointerId,start:pt,current:pt,lockedShooter:true};try{canvas.setPointerCapture(e.pointerId)}catch{}diag('SHOOTER PRESS ARMED',crew.weaponKey+' room='+(crew.roomIndex+1)+' holdDrag=Y singlePress=Y');return}",status,'pressDrag');patched=patched.replace("if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=28){","if(Math.hypot(pt.x-vesselGesture.start.x,pt.y-vesselGesture.start.y)>=10){");

  const beforePreview=patched;
  patched=patched.replace(/function acDirectorBuild3DWindow\([\s\S]*?function acDirectorBeginAim\(attacker\)\{/,'function acDirectorBeginAim(attacker){');
  patched=patched.replace(/acDirectorPreviewSolarWindows\(selected,b\);/g,'');
  patched=patched.replace(/if\(selected\.weaponKey==='solar_lancer'\)return;/g,'');
  status.preAimClosed=patched!==beforePreview||(!patched.includes('function acDirectorBuild3DWindow(')&&!patched.includes('acDirectorPreviewSolarWindows(selected,b);'));

  const aimNeedle="function setAimVisual(a,b){\n  if(!selected)return;";
  const aimReplacement="function setAimVisual(a,b){\n  if(!selected)return;\n  acDirectorBeginAim(selected);acDirectorUpdateAimTarget(selected,b);";
  patched=replaceOnce(patched,aimNeedle,aimReplacement,status,'aimSeal');

  const cameraNeedle="function updateBattleCamera(snap=false,frameDt=null){\n  if(!battleStarted||typeof camera==='undefined')return;";
  const cameraReplacement=`function updateBattleCamera(snap=false,frameDt=null){
  if(!battleStarted||typeof camera==='undefined')return;
  acDirectorBusy();
  if(xrayOpen&&aiming&&selected){
    const progress=acDirectorStepAimPresentation(performance.now()),visual=xrayRoomVisuals?.find?.(v=>v.warrior===selected),shooter=visual?.standAnchor?.getWorldPosition?.(new THREE.Vector3())||visual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(selected),closeLook=shooter.clone();
    closeLook.y+=.85;
    const closePos=new THREE.Vector3(closeLook.x,closeLook.y+1.9,closeLook.z+38),sep=currentCombatRange(),maxY=Math.max(aure.position.y,earth.position.y),minY=Math.min(aure.position.y,earth.position.y),midX=(aure.position.x+earth.position.x)/2,midY=(maxY+minY)/2,rangeExtra=Math.max(0,Math.min(82,(sep-55)*.92)),altExtra=Math.max(0,(maxY-18)*.72),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),horizontalNeed=(sep*.5+29)/Math.max(.18,Math.tan(hHalf)),verticalNeed=((maxY-minY)*.5+17)/Math.max(.18,Math.tan(vHalf)),battleZ=Math.max(92+rangeExtra+altExtra*.72,horizontalNeed,verticalNeed),battlePos=new THREE.Vector3(midX,27.5+midY*.11+altExtra*.22,battleZ),battleLook=new THREE.Vector3(midX,Math.max(10,midY*.48)+Math.min(8,sep*.045),0),pullback=THREE.MathUtils.smoothstep(progress,.08,.96),targetPos=closePos.clone().lerp(battlePos,pullback),targetLook=closeLook.clone().lerp(battleLook,pullback),stage=Math.min(4,Math.floor(progress*4+.001));
    // Raw drag remains the input authority. This branch only interpolates presentation
    // from the physical shooter to the safe two-vessel frame as that same drag grows.
    camera.position.copy(targetPos);cameraLookTarget.copy(targetLook);camera.zoom=THREE.MathUtils.lerp(1.16,1,pullback);camera.aspect=16/9;camera.near=.1;camera.far=900;camera.updateProjectionMatrix();camera.lookAt(cameraLookTarget);
    if(acDirector.cameraStage!==stage){acDirector.cameraStage=stage;diag('AIM CAMERA STAGE','progress='+Math.round(progress*100)+'% pullback='+Math.round(pullback*100)+'% shooterVisible=Y enemyVisible='+(progress>=.96?'Y':'N')+' framing=SHOOTER_TO_BATTLEFIELD')}
    return
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

  const releasePrefix="diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);";
  if(patched.includes(releasePrefix+'fireSelectedFromStage(releasePt,power)'))patched=replaceOnce(patched,releasePrefix+'fireSelectedFromStage(releasePt,power)',releasePrefix+'if(selected)acDirectorForceFiringStage(selected);fireSelectedFromStage(releasePt,power)',status,'releaseSeal');
  else patched=replaceOnce(patched,releasePrefix+'fireSelectedFromStage(pt,power)',releasePrefix+'if(selected)acDirectorForceFiringStage(selected);fireSelectedFromStage(pt,power)',status,'releaseSeal');

  patched=replaceOnce(patched,"grenade.position.copy(start);scene.add(grenade);const chainMat","grenade.position.copy(start);scene.add(grenade);acDirectorTrackProjectile(attacker,grenade,target,hit,'SUNADIER');const chainMat",status,'sunadierTrack');
  patched=replaceOnce(patched,"const visual=makeSunDiskVisual(start),history=","const visual=makeSunDiskVisual(start);acDirectorTrackProjectile(attacker,visual.group,terminal,hits[0]||null,'SUN DISK');const history=",status,'diskTrack');
  patched=replaceOnce(patched,"function spawnSolarLancerBeam(attacker,start,beamPath,weapon){\n  const localAction=","function spawnSolarLancerBeam(attacker,start,beamPath,weapon){\n  acDirectorBeginBeam(attacker,start,beamPath);\n  const localAction=",status,'beamTrack');

  // Keep the compatibility function name because older hit paths call it. Presentation
  // now follows authoritative breach state: damaged modules stay gone once the room is
  // targetable, and an exposed warrior remains visible instead of being resealed.
  const impactPersistent=String.raw`function spawnImpactCompartmentReveal(attacker,hit,duration=1450){
  if(!hit?.room||!Number.isInteger(hit.roomIndex))return false;if(activeImpactCompartmentReveal)clearImpactCompartmentReveal();const room=hit.room,targetSide=structureTargetSide(attacker),skin=targetSide==='aurelian'?factionSkinA:factionSkinE,module=skin?.userData?.damageModules?.[hit.roomIndex]||null;
  syncRoomStructuralDamage(room);syncExteriorBattleScar(room);const targetable=crewExposureTier(room)>=3||!!room.solarPenetrated,occ=opposing(attacker).find(w=>w.roomIndex===hit.roomIndex&&w.hp>0);if(occ)syncWarriorConcealment(occ);
  diag('PERSISTENT BREACH FEEDBACK','side='+targetSide+' room='+(hit.roomIndex+1)+' targetable='+(targetable?'Y':'N')+' moduleVisible='+(module?.visible?'Y':'N')+' feedback=SCAR+VOID+DEBRIS+CREW');return true
}
`;
  const impactRegex=/function spawnImpactCompartmentReveal\(attacker,hit,duration=1450\)\{[\s\S]*?\n\}\n\s*(?=let acDirector=)/;const impactNext=patched.replace(impactRegex,impactPersistent);status.impactPersistent=impactNext!==patched;patched=impactNext;
  patched=replaceOnce(patched,"presentImpact=!he9||performance.now()>=groupedHe9ImpactUntil;if(presentImpact){","secondaryScatter=(weapon.name||'')==='SUNADIER PLASMA SCATTER',presentImpact=!secondaryScatter&&(!he9||performance.now()>=groupedHe9ImpactUntil);if(presentImpact){",status,'scatterCamera');

  const finishNeedle="function finishAurelianWeaponAction(attacker,label){\n solarActionLock=false;refreshMovePad();diag('ACTION UNLOCK',(attacker.side===localWorldSide()?'LOCAL ':'REMOTE ')+label+' COMPLETE');\n if(!multiplayer&&battleStarted&&!matchEnded&&attacker.side==='aurelian'&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()\n}";
  const finishReplacement="function finishAurelianWeaponAction(attacker,label){\n const finishNow=()=>{solarActionLock=false;refreshMovePad();diag('ACTION UNLOCK',(attacker.side===localWorldSide()?'LOCAL ':'REMOTE ')+label+' COMPLETE');if(!multiplayer&&battleStarted&&!matchEnded&&attacker.side==='aurelian'&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()};\n if(attacker.side===localWorldSide()&&acDirectorWaitForPresentation(finishNow,label))return;finishNow()\n}";
  patched=replaceOnce(patched,finishNeedle,finishReplacement,status,'turnVfxGate');

  if(!patched.includes("function clearAim(){if(acDirector.mode==='aim')")){const next=patched.replace('function clearAim(){',"function clearAim(){if(acDirector.mode==='aim'){acDirector.mode=xrayOpen?'cutaway':'exterior';acDirector.aimTargetProgress=0;acDirector.aimVisualProgress=0;acDirector.aimLastTs=0;acDirector.aimInputOrigin=null;acDirector.sealedRooms=0;if(xrayOpen)restoreFullCutawayStage()}tacticalAimView=false;");status.clearAim=next!==patched;patched=next}else status.clearAim=true;
  if(patched.includes("setSoloTurn('earth');movePending=false;refreshMovePad();"))patched=replaceOnce(patched,"setSoloTurn('earth');movePending=false;refreshMovePad();","acDirectorReset('solo handoff');setSoloTurn('earth');movePending=false;refreshMovePad();",status,'turnSolo');
  else patched=replaceOnce(patched,"soloTurn='earth';movePending=false;refreshMovePad();","acDirectorReset('solo handoff');setSoloTurn('earth');movePending=false;refreshMovePad();",status,'turnSolo');
  if(!patched.includes("scheduleXrayForTurn('solo transition')"))patched=patched.replace("soloTurn=side;\n  if(previous!==side&&battleStarted)advanceSupportTurn(side);","soloTurn=side;\n  if(battleStarted)scheduleXrayForTurn('solo transition');\n  if(previous!==side&&battleStarted)advanceSupportTurn(side);");
  patched=replaceOnce(patched,"mpTurn.classList.add('show');const mine=side===localSide;","mpTurn.classList.add('show');const mine=side===localSide;if(battleStarted&&!matchEnded)scheduleXrayForTurn('multiplayer transition');if(!mine)acDirectorReset('multiplayer opponent turn');",status,'turnMp');
  patched=patched.replace("statusEl.textContent='CUTAWAY • TAP A WARRIOR ONCE TO HIGHLIGHT • TAP AGAIN TO LOCK SHOOTER'","statusEl.textContent='CUTAWAY • PRESS A WARRIOR • HOLD + DRAG TO AIM • RELEASE TO FIRE'");
  patched=patched.replace(/MATCH RECORDER v0\.\d+\.\d+/g,'MATCH RECORDER v0.42.1');
  patched=patched.replace(/build=2026-\d{2}-\d{2}_[A-Z0-9_-]+/g,'build=2026-09-07_SEGMENTED_MODULE_HULL_DEEP_BAYS');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-presentation-director-v0421" name="ac-presentation-director" content="${summary} aimTarget:RAW_READ_ONLY aimVisual:SMOOTH aimCamera:PROGRESSIVE_SHOOTER_TO_BATTLEFIELD enemyVisibleAtFullAim:Y physicalCutaway:SIX_SEGMENTED_DEEP_PRESSURE_BAYS logicalCombatRooms:NINE_UNCHANGED hullSeal:RESTORE_EXACT_UNIFIED_HULL_MODULES closedBayInterior:HIDDEN shooterBay:PROTECTED preAimEnemyHull:CLOSED enemyDamage:PROGRESSIVE_PERSISTENT_BREACH targetableCrew:70_PERCENT impactReveal:STATE_DRIVEN">\n</head>`);
}
