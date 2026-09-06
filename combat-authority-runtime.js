export function patchCombatAuthorityRuntime(html){
  if(html.includes('ac-combat-authority-v0390'))return html;
  let patched=html;
  const status={pose:false,lockedOrigin:false,input:false,forward:false,scale:false,stage:false,helpers:false,camera:false};

  let next=patched.replace(/acWarriorRefreshAimOrigin\(selected,b,false\);/g,'acWarriorPoseAim(selected,b,false);');status.pose=next!==patched;patched=next;
  next=patched.replace(/acWarriorRefreshAimOrigin\(acReleaseWarrior,pt,true\);/g,'acWarriorPoseAim(acReleaseWarrior,pt,true);');patched=next;
  next=patched.replace(/acWarriorRefreshAimOrigin\(w,pt,true\);fireWarriorFromStage/g,'acWarriorPoseAim(w,pt,true);fireWarriorFromStage');patched=next;

  next=patched.replace(/const start=!remote&&typeof acWarriorLiveMuzzleWorld==='function'\?acWarriorLiveMuzzleWorld\(w,pt\):\(!remote&&aiming&&aimOriginWorld\?aimOriginWorld\.clone\(\):muzzleWorld\(w,pt\)\);/g,"const start=!remote&&aimOriginWorld?aimOriginWorld.clone():muzzleWorld(w,pt);");status.lockedOrigin=next!==patched;patched=next;

  next=patched.replace(/rig3D\.scale\.setScalar\((?:\.92|\.70)\)/g,'rig3D.scale.setScalar(.60)');status.scale=next!==patched;patched=next;
  next=patched.replace(/module\.visible=i!==w\.roomIndex&&!room\?\.erased&&\(room\?\.breach\?\?0\)<100;/g,'module.visible=false;');status.stage=next!==patched;patched=next;

  const helpers=String.raw`
function acUnifiedAimPoint(raw){
 if(!raw)return raw;
 const pt={x:Math.max(0,Math.min(1280,raw.x)),y:Math.max(0,Math.min(720,raw.y))};
 if(xrayOpen&&aiming&&selected&&startPx){const dir=selected.side==='aurelian'?1:-1,forward=Math.max(0,(pt.x-startPx.x)*dir);acTacticalCutaway.inputProgress=Math.max(0,Math.min(1,forward/320));acTacticalCutaway.mode='aimPullback'}
 return pt
}
function acUnifiedForwardValid(pt){if(!selected||!startPx||!pt)return true;const dir=selected.side==='aurelian'?1:-1;return(pt.x-startPx.x)*dir>18}
function acUnifiedSeal(progress){
 if(!xrayOpen||!selected||!Number.isInteger(selected.roomIndex))return;
 const side=localXraySide(),skin=side==='aurelian'?factionSkinA:factionSkinE,rooms=localXrayRooms()?.userData?.rooms||[],mods=skin?.userData?.damageModules||[],sr=Math.floor(selected.roomIndex/3),sc=selected.roomIndex%3,order=[];
 for(let i=0;i<9;i++){if(i===selected.roomIndex)continue;const rr=Math.floor(i/3),cc=i%3;order.push({i,d:Math.abs(rr-sr)+Math.abs(cc-sc)})}order.sort((a,b)=>b.d-a.d||b.i-a.i);
 const count=Math.max(0,Math.min(8,Math.floor(progress*8+.001))),closed=new Set(order.slice(0,count).map(v=>v.i));
 for(let i=0;i<mods.length;i++){const m=mods[i],room=rooms[i];if(!m)continue;if(room)syncRoomStructuralDamage(room);m.visible=i!==selected.roomIndex&&closed.has(i)&&!room?.erased&&(room?.breach??0)<100}
 if(acTacticalCutaway.lastSealCount!==count){acTacticalCutaway.lastSealCount=count;diag('TACTICAL HULL SEAL','progress='+Math.round(progress*100)+'% closed='+count+'/8 shooterRoom='+(selected.roomIndex+1))}
}
function acUnifiedCamera(snap=false){
 if(!xrayOpen||typeof camera==='undefined')return false;
 const directorBusy=typeof acDirector!=='undefined'&&(acDirector.mode==='travel'||acDirector.mode==='beam'||acDirector.mode==='settle');if(directorBusy)return false;
 const localRoot=localXraySide()==='aurelian'?aure:earth;if(!localRoot)return false;const own=localRoot.getWorldPosition(new THREE.Vector3());
 if(!aiming||!selected){const pos=new THREE.Vector3(own.x,own.y+2.1,43),look=new THREE.Vector3(own.x,own.y+.7,0),a=snap?1:.16;camera.position.lerp(pos,a);camera.zoom=THREE.MathUtils.lerp(camera.zoom,1.18,a);camera.updateProjectionMatrix();camera.lookAt(look);return true}
 const enemyRoot=selected.side==='aurelian'?earth:aure,enemy=enemyRoot.getWorldPosition(new THREE.Vector3()),raw=Math.max(0,Math.min(1,acTacticalCutaway.inputProgress||0)),e=raw*raw*(3-2*raw);acUnifiedSeal(e);
 const expandedPos=new THREE.Vector3(own.x,own.y+2.1,43),expandedLook=new THREE.Vector3(own.x,own.y+.7,0),center=own.clone().lerp(enemy,.5),span=Math.max(88,Math.abs(enemy.x-own.x)+58),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),battlePos=new THREE.Vector3(center.x,Math.max(own.y,enemy.y)+7,Math.max(108,zNeed+30)),battleLook=new THREE.Vector3(center.x,(own.y+enemy.y)*.5+1,2),pos=expandedPos.clone().lerp(battlePos,e),look=expandedLook.clone().lerp(battleLook,e),a=snap?1:.22;
 camera.position.lerp(pos,a);camera.zoom=THREE.MathUtils.lerp(camera.zoom,THREE.MathUtils.lerp(1.18,1.0,e),a);camera.updateProjectionMatrix();camera.lookAt(look);return true
}
`;
  if(!patched.includes('function acUnifiedCamera(')){next=patched.replace('function updateBattleCamera(snap=false,frameDt=null){',helpers+'\nfunction updateBattleCamera(snap=false,frameDt=null){\n  if(acUnifiedCamera(snap))return;');status.helpers=next!==patched;status.camera=next!==patched;patched=next}else{status.helpers=true;status.camera=true}

  const beforeInput=patched;patched=patched.replace(/currentPx=(?:acTrackTacticalAimPoint\()?eventStagePoint\(e\)\)?;setAimVisual\(startPx,currentPx\)/g,'currentPx=acUnifiedAimPoint(eventStagePoint(e));setAimVisual(startPx,currentPx)');status.input=patched!==beforeInput;
  const beforeForward=patched;patched=patched.replace(/\(!profile\|\|profile\.forward\)&&acAimForwardValid\(pt\)/g,'(!profile||profile.forward)&&acUnifiedForwardValid(pt)');patched=patched.replace(/const forward=!profile\|\|profile\.forward;/g,'const forward=(!profile||profile.forward)&&acUnifiedForwardValid(pt);');status.forward=patched!==beforeForward;

  patched=patched.replace(/MATCH RECORDER v0\.3[48]\.\d+/g,'MATCH RECORDER v0.39.0');patched=patched.replace(/build=2026-09-05_[A-Z0-9_]+/g,'build=2026-09-05_UNIFIED_CAMERA_AIM_PHYSICS');
  const summary=Object.entries(status).map(([k,v])=>k+':'+(v?'OK':'MISS')).join(' ');return patched.replace('</head>','<meta id="ac-combat-authority-v0390" name="ac-combat-authority" content="'+summary+'">\n</head>')
}
