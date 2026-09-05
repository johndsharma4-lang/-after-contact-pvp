function replaceOnce(source, needle, replacement, status, key){const next=source.replace(needle,replacement);status[key]=next!==source;return next}

export function patchExpandedTacticalCutawayRuntime(html){
  if(html.includes('ac-expanded-tactical-cutaway-v0367'))return html;
  let patched=html;const status={state:false,open:false,camera:false,aim:false,reset:false};
  const helper=String.raw`
let acTacticalCutaway={mode:'closed',openedAt:0,aimProgress:0};
function acTacticalCutawayOpen(){acTacticalCutaway.mode='expanded';acTacticalCutaway.openedAt=performance.now();acTacticalCutaway.aimProgress=0}
function acTacticalCutawayAim(){if(!xrayOpen)return;acTacticalCutaway.mode='aimPullback'}
function acTacticalCutawayClose(){acTacticalCutaway.mode='closed';acTacticalCutaway.aimProgress=0}
function acTacticalCutawayCamera(snap=false){
 if(!xrayOpen||typeof camera==='undefined')return false;
 const localRoot=localXraySide()==='aurelian'?aure:earth;
 if(!localRoot)return false;
 const ship=localRoot.getWorldPosition(new THREE.Vector3());
 const now=performance.now(),openT=Math.max(0,Math.min(1,(now-acTacticalCutaway.openedAt)/520)),openEase=1-Math.pow(1-openT,3);
 if(acTacticalCutaway.mode==='expanded'&&!aiming){
   // Dedicated tactical interior: enlarge the whole vessel/cutaway through camera framing, never the warriors or rooms individually.
   const targetPos=new THREE.Vector3(ship.x,ship.y+2.6,54),targetLook=new THREE.Vector3(ship.x,ship.y+.8,0),alpha=snap?1:.10+.10*openEase;
   camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,1.16,alpha);camera.updateProjectionMatrix();camera.lookAt(targetLook);return true
 }
 if((acTacticalCutaway.mode==='aimPullback'||aiming)&&selected){
   acTacticalCutaway.mode='aimPullback';
   const enemyRoot=selected.side==='aurelian'?earth:aure,enemy=enemyRoot.getWorldPosition(new THREE.Vector3()),visual=xrayRoomVisuals?.find?.(v=>v.warrior===selected),shooter=visual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(selected);
   const pointer=(typeof currentPx!=='undefined'&&currentPx)||{x:640,y:360};
   // Pullback follows aim travel. Center/near-own aim stays interior-heavy; reaching enemy yields the established two-ship firing frame.
   const ownScreen=worldToStage(shooter),enemyScreen=worldToStage(enemy),vx=enemyScreen.x-ownScreen.x,vy=enemyScreen.y-ownScreen.y,len2=Math.max(1,vx*vx+vy*vy),px=pointer.x-ownScreen.x,py=pointer.y-ownScreen.y,gesture=Math.max(0,Math.min(1,(px*vx+py*vy)/len2));
   acTacticalCutaway.aimProgress=THREE.MathUtils.lerp(acTacticalCutaway.aimProgress,gesture,.18);
   const t=acTacticalCutaway.aimProgress,e=t*t*(3-2*t),center=shooter.clone().lerp(enemy,.50),expandedPos=new THREE.Vector3(ship.x,ship.y+2.6,54),expandedLook=new THREE.Vector3(ship.x,ship.y+.8,0),span=Math.max(78,Math.abs(enemy.x-shooter.x)+48),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),battlePos=new THREE.Vector3(center.x,Math.max(shooter.y,enemy.y)+7,Math.max(101,zNeed+27)),battleLook=new THREE.Vector3(center.x,(shooter.y+enemy.y)*.5+1,2),targetPos=expandedPos.clone().lerp(battlePos,e),targetLook=expandedLook.clone().lerp(battleLook,e),alpha=snap?1:.12;
   camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,THREE.MathUtils.lerp(1.16,1.03,e),alpha);camera.updateProjectionMatrix();camera.lookAt(targetLook);return true
 }
 return false
}
`;
  if(!patched.includes('let acTacticalCutaway=')){const next=patched.replace('let acDirector=',helper+'\nlet acDirector=');status.state=next!==patched;patched=next}else status.state=true;
  patched=replaceOnce(patched,"xrayOpen=true;xraySelectedCrew=null;tacticalAimView=false;clearAim?.();window.__acRunCutawayScan?.();applyXrayShell();buildPrivateXray();","xrayOpen=true;xraySelectedCrew=null;tacticalAimView=false;clearAim?.();acTacticalCutawayOpen();window.__acRunCutawayScan?.();applyXrayShell();buildPrivateXray();",status,'open');
  patched=replaceOnce(patched,"function acDirectorBeginAim(attacker){if(!attacker)return;acDirector.mode='aim';acDirector.attacker=attacker;tacticalAimView=true}","function acDirectorBeginAim(attacker){if(!attacker)return;acDirector.mode='aim';acDirector.attacker=attacker;tacticalAimView=true;acTacticalCutawayAim()}",status,'aim');
  patched=replaceOnce(patched,"function acDirectorReset(reason='reset'){acDirectorRestoreAimWindows();acDirector.mode='exterior';","function acDirectorReset(reason='reset'){acDirectorRestoreAimWindows();acTacticalCutawayClose();acDirector.mode='exterior';",status,'reset');
  const camNeedle="  acDirectorBusy();\n  if(xrayOpen&&aiming&&selected){";
  const camReplacement="  acDirectorBusy();\n  if(xrayOpen&&acTacticalCutawayCamera(snap))return;\n  if(xrayOpen&&aiming&&selected){";
  patched=replaceOnce(patched,camNeedle,camReplacement,status,'camera');
  patched=patched.replace(/MATCH RECORDER v0\.3[56]\.[0-9]+/g,'MATCH RECORDER v0.36.7');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_EXPANDED_TACTICAL_CUTAWAY');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-expanded-tactical-cutaway-v0367" name="ac-expanded-tactical-cutaway" content="${summary}">\n</head>`)
}
