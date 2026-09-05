function replaceOnce(source, needle, replacement, status, key){const next=source.replace(needle,replacement);status[key]=next!==source;return next}

export function patchExpandedTacticalCutawayRuntime(html){
  if(html.includes('ac-expanded-tactical-cutaway-v0369'))return html;
  let patched=html;const status={state:false,open:false,camera:false,aim:false,reset:false,seal:false,travel:false,beam:false};
  const helper=String.raw`
let acTacticalCutaway={mode:'closed',openedAt:0,aimProgress:0,lastSealCount:-1};
function acTacticalCutawayOpen(){acTacticalCutaway.mode='expanded';acTacticalCutaway.openedAt=performance.now();acTacticalCutaway.aimProgress=0;acTacticalCutaway.lastSealCount=-1;acRestoreAimSeal()}
function acTacticalCutawayAim(){if(!xrayOpen)return;acTacticalCutaway.mode='aimPullback'}
function acTacticalCutawayClose(){acTacticalCutaway.mode='closed';acTacticalCutaway.aimProgress=0;acTacticalCutaway.lastSealCount=-1}
function acRestoreAimSeal(){
 if(!xrayOpen)return;const side=localXraySide(),skin=side==='aurelian'?factionSkinA:factionSkinE;
 for(const module of skin?.userData?.damageModules||[])if(module)module.visible=false
}
function acApplyAimSeal(progress){
 if(!xrayOpen||!selected||!Number.isInteger(selected.roomIndex))return;
 const side=localXraySide(),skin=side==='aurelian'?factionSkinA:factionSkinE,rooms=localXrayRooms()?.userData?.rooms||[],modules=skin?.userData?.damageModules||[];
 const sr=Math.floor(selected.roomIndex/3),sc=selected.roomIndex%3,order=[];
 for(let i=0;i<9;i++){if(i===selected.roomIndex)continue;const rr=Math.floor(i/3),cc=i%3;order.push({i,d:Math.abs(rr-sr)+Math.abs(cc-sc)})}
 order.sort((a,b)=>b.d-a.d||b.i-a.i);
 const sealCount=Math.max(0,Math.min(order.length,Math.floor(progress*order.length+.001)));
 if(sealCount===acTacticalCutaway.lastSealCount)return;acTacticalCutaway.lastSealCount=sealCount;
 const sealed=new Set(order.slice(0,sealCount).map(x=>x.i));
 for(let i=0;i<modules.length;i++){const module=modules[i],room=rooms[i];if(!module)continue;if(room)syncRoomStructuralDamage(room);module.visible=i!==selected.roomIndex&&sealed.has(i)&&!room?.erased&&(room?.breach??0)<100}
 diag('TACTICAL HULL SEAL','progress='+Math.round(progress*100)+'% closed='+sealCount+'/8 shooterRoom='+(selected.roomIndex+1))
}
function acTacticalCutawayCamera(snap=false){
 if(!xrayOpen||typeof camera==='undefined')return false;
 if(acTacticalCutaway.mode==='attack')return false;
 const localRoot=localXraySide()==='aurelian'?aure:earth;
 if(!localRoot)return false;
 const ship=localRoot.getWorldPosition(new THREE.Vector3());
 const now=performance.now(),openT=Math.max(0,Math.min(1,(now-acTacticalCutaway.openedAt)/520)),openEase=1-Math.pow(1-openT,3);
 if(acTacticalCutaway.mode==='expanded'&&!aiming){
   acRestoreAimSeal();
   const targetPos=new THREE.Vector3(ship.x,ship.y+2.6,54),targetLook=new THREE.Vector3(ship.x,ship.y+.8,0),alpha=snap?1:.10+.10*openEase;
   camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,1.16,alpha);camera.updateProjectionMatrix();camera.lookAt(targetLook);return true
 }
 if((acTacticalCutaway.mode==='aimPullback'||aiming)&&selected){
   acTacticalCutaway.mode='aimPullback';
   const enemyRoot=selected.side==='aurelian'?earth:aure,enemy=enemyRoot.getWorldPosition(new THREE.Vector3()),visual=xrayRoomVisuals?.find?.(v=>v.warrior===selected),shooter=visual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(selected);
   const pointer=(typeof currentPx!=='undefined'&&currentPx)||{x:640,y:360};
   const ownScreen=worldToStage(shooter),enemyScreen=worldToStage(enemy),vx=enemyScreen.x-ownScreen.x,vy=enemyScreen.y-ownScreen.y,len2=Math.max(1,vx*vx+vy*vy),px=pointer.x-ownScreen.x,py=pointer.y-ownScreen.y,gesture=Math.max(0,Math.min(1,(px*vx+py*vy)/len2));
   acTacticalCutaway.aimProgress=THREE.MathUtils.lerp(acTacticalCutaway.aimProgress,gesture,.18);
   const t=acTacticalCutaway.aimProgress,e=t*t*(3-2*t);acApplyAimSeal(e);
   const center=shooter.clone().lerp(enemy,.50),expandedPos=new THREE.Vector3(ship.x,ship.y+2.6,54),expandedLook=new THREE.Vector3(ship.x,ship.y+.8,0),span=Math.max(78,Math.abs(enemy.x-shooter.x)+48),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),battlePos=new THREE.Vector3(center.x,Math.max(shooter.y,enemy.y)+7,Math.max(101,zNeed+27)),battleLook=new THREE.Vector3(center.x,(shooter.y+enemy.y)*.5+1,2),targetPos=expandedPos.clone().lerp(battlePos,e),targetLook=expandedLook.clone().lerp(battleLook,e),alpha=snap?1:.12;
   camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,THREE.MathUtils.lerp(1.16,1.03,e),alpha);camera.updateProjectionMatrix();camera.lookAt(targetLook);return true
 }
 return false
}
`;
  if(!patched.includes('let acTacticalCutaway=')){const next=patched.replace('let acDirector=',helper+'\nlet acDirector=');status.state=next!==patched;patched=next}else status.state=true;
  patched=replaceOnce(patched,"xrayOpen=true;xraySelectedCrew=null;tacticalAimView=false;clearAim?.();window.__acRunCutawayScan?.();applyXrayShell();buildPrivateXray();","xrayOpen=true;xraySelectedCrew=null;tacticalAimView=false;clearAim?.();acTacticalCutawayOpen();window.__acRunCutawayScan?.();applyXrayShell();buildPrivateXray();",status,'open');
  patched=replaceOnce(patched,"function acDirectorBeginAim(attacker){if(!attacker)return;acDirector.mode='aim';acDirector.attacker=attacker;tacticalAimView=true}","function acDirectorBeginAim(attacker){if(!attacker)return;acDirector.mode='aim';acDirector.attacker=attacker;tacticalAimView=true;acTacticalCutawayAim()}",status,'aim');
  patched=replaceOnce(patched,"function acDirectorReset(reason='reset'){acDirectorRestoreAimWindows();acDirector.mode='exterior';","function acDirectorReset(reason='reset'){acDirectorRestoreAimWindows();if(xrayOpen&&reason==='presentation complete')closePrivateXray('attack presentation complete');acTacticalCutawayClose();acDirector.mode='exterior';",status,'reset');
  patched=replaceOnce(patched,"function acDirectorTrackProjectile(attacker,projectile,target,hit,label){if(!attacker||attacker.side!==localWorldSide()||!projectile)return;acDirector.mode='travel';","function acDirectorTrackProjectile(attacker,projectile,target,hit,label){if(!attacker||attacker.side!==localWorldSide()||!projectile)return;acTacticalCutaway.mode='attack';acDirector.mode='travel';",status,'travel');
  patched=replaceOnce(patched,"function acDirectorBeginBeam(attacker,start,beamPath){if(!attacker||attacker.side!==localWorldSide())return;acDirector.mode='beam';","function acDirectorBeginBeam(attacker,start,beamPath){if(!attacker||attacker.side!==localWorldSide())return;acTacticalCutaway.mode='attack';acDirector.mode='beam';",status,'beam');
  const camNeedle="  acDirectorBusy();\n  if(xrayOpen&&aiming&&selected){";
  const camReplacement="  acDirectorBusy();\n  if(xrayOpen&&acTacticalCutawayCamera(snap))return;\n  if(xrayOpen&&aiming&&selected){";
  patched=replaceOnce(patched,camNeedle,camReplacement,status,'camera');status.seal=status.state&&status.camera;
  patched=patched.replace(/MATCH RECORDER v0\.3[56]\.[0-9]+/g,'MATCH RECORDER v0.36.9');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_AIM_SEAL_ENEMY_IMPACT_CAMERA');
  const summary=Object.entries(status).map(([k,v])=>k+':'+(v?'OK':'MISS')).join(' ');
  return patched.replace('</head>','<meta id="ac-expanded-tactical-cutaway-v0369" name="ac-expanded-tactical-cutaway" content="'+summary+'">\n</head>')
}
