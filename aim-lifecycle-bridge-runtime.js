function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAimLifecycleBridgeRuntime(html) {
  if (html.includes('ac-aim-lifecycle-bridge-v0412')) return html;
  let patched = html;
  const status = { liveStep:false, originDiag:false, cutawayEntry:false, shellOwnership:false, aimHook:false, stableAimEntry:false };

  patched = replaceOnce(patched,"function acDirectorUpdateAimTarget(attacker,pt){acDirector.aimTargetProgress=acDirectorAimTarget(attacker,pt)}","function acDirectorUpdateAimTarget(attacker,pt){acDirector.aimTargetProgress=acDirectorAimTarget(attacker,pt);acDirectorStepAimPresentation(performance.now())}",status,'liveStep');

  const oldSeal = /function acDirectorApplyAimSeal\(attacker,progress\)\{[\s\S]*?\n\}\nfunction acDirectorBeginAim\(attacker\)\{/;
  const newSeal = String.raw`function acDirectorApplyAimSeal(attacker,progress){
 if(!xrayOpen||!attacker)return;
 const rooms=localXrayRooms()?.userData?.rooms||[],shooter=attacker.roomIndex,shell=(typeof xrayShellState!=='undefined'&&Array.isArray(xrayShellState))?xrayShellState:[];
 if(!Number.isInteger(shooter)||!rooms.length)return;
 const sr=Math.floor(shooter/3),sc=shooter%3,order=[];
 for(let i=0;i<rooms.length;i++)if(i!==shooter)order.push(i);
 order.sort((a,b)=>{const ar=Math.floor(a/3),ac=a%3,br=Math.floor(b/3),bc=b%3,ad=Math.abs(ar-sr)+Math.abs(ac-sc),bd=Math.abs(br-sr)+Math.abs(bc-sc);return bd-ad||a-b});
 const closeCount=Math.min(order.length,Math.floor(THREE.MathUtils.clamp(progress,0,1)*order.length+.001)),closed=new Set(order.slice(0,closeCount)),buckets=Array.from({length:rooms.length},()=>[]),roomPoints=rooms.map(r=>r?.hitPlane?.getWorldPosition?.(new THREE.Vector3())||null),visualByRoom=new Map((xrayRoomVisuals||[]).map(v=>[v.index,v]));
 let mapped=0,global=0,nativeClosed=0;
 for(const entry of shell){const mesh=entry?.mesh;if(!mesh?.getWorldPosition)continue;const box=new THREE.Box3().setFromObject(mesh),size=box.getSize(new THREE.Vector3());if(size.x>10.5||size.y>8.5){global++;mesh.visible=false;continue}const p=mesh.getWorldPosition(new THREE.Vector3());let best=-1,bestD=Infinity;for(let i=0;i<roomPoints.length;i++){const rp=roomPoints[i];if(!rp)continue;const dx=p.x-rp.x,dy=p.y-rp.y,dz=(p.z-rp.z)*.25,d=dx*dx+dy*dy+dz*dz;if(d<bestD){bestD=d;best=i}}if(best>=0){buckets[best].push(entry);mapped++}}
 for(let i=0;i<rooms.length;i++){const room=rooms[i],shouldClose=i!==shooter&&closed.has(i)&&!room?.erased&&(room?.breach??0)<100;for(const entry of buckets[i])entry.mesh.visible=shouldClose?(entry.visible!==false):false;const visual=visualByRoom.get(i),shutter=visual?.frontShutter;if(shutter){shutter.userData.acAimClosed=shouldClose;shutter.visible=shouldClose;if(shouldClose)nativeClosed++}}
 const chosen=xrayRoomVisuals?.find?.(v=>v.warrior===attacker);if(chosen?.nativeRoom){chosen.nativeRoom.visible=true;chosen.nativeRoom.userData.firingStage=true;if(chosen.frontShutter){chosen.frontShutter.userData.acAimClosed=false;chosen.frontShutter.visible=false}}
 if(acDirector.shellMapReported!==true){acDirector.shellMapReported=true;diag('AIM SHELL MAP','shell='+shell.length+' mapped='+mapped+' global='+global+' legacyModules='+((localXraySide()==='aurelian'?factionSkinA:factionSkinE)?.userData?.damageModules?.length||0))}
 if(closeCount!==acDirector.sealedRooms){acDirector.sealedRooms=closeCount;diag('AIM HULL SEAL','visual='+Math.round(progress*100)+'% target='+Math.round(acDirector.aimTargetProgress*100)+'% closed='+closeCount+'/'+order.length+' nativePanels='+nativeClosed+' shooterRoom='+(shooter+1))}
}
function acDirectorBeginAim(attacker){`;
  const shellNext=patched.replace(oldSeal,newSeal);status.shellOwnership=shellNext!==patched;patched=shellNext;

  // Re-project the physical muzzle every time the aim visual updates. The previous
  // implementation froze startPx once, while the camera continued moving, so the line,
  // distance/power calculation and visible shooter could diverge from one another.
  if(!patched.includes("if(aiming&&aimOriginWorld){aimOriginStage=worldToStage(aimOriginWorld);")){
    const hookNeedle='acDirectorBeginAim(selected);acDirectorUpdateAimTarget(selected,b);';
    const hookReplacement="if(aiming&&aimOriginWorld){aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};a=startPx}\n  "+hookNeedle;
    patched=replaceOnce(patched,hookNeedle,hookReplacement,status,'aimHook');
  }else status.aimHook=true;

  // The old entry path changed camera state before aiming=true, so updateBattleCamera()
  // executed the normal/tactical branch first and moved the camera before the physical
  // muzzle was captured. Enter live aim first, then let the aim-owned camera frame once.
  patched=replaceOnce(patched,"tacticalAimView=true;updateBattleCamera();showCombatRange(4000);aiming=true;aimHud.classList.add('live');pointerId=e.pointerId;","tacticalAimView=true;aiming=true;updateBattleCamera();showCombatRange(4000);aimHud.classList.add('live');pointerId=e.pointerId;",status,'stableAimEntry');

  patched=replaceOnce(patched,"aimOriginWorld=cutawayMuzzle?cutawayMuzzle.getWorldPosition(new THREE.Vector3()):muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};currentPx={x:pt.x,y:pt.y};setAimVisual(startPx,currentPx);return true","aimOriginWorld=cutawayMuzzle?cutawayMuzzle.getWorldPosition(new THREE.Vector3()):muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};currentPx={x:pt.x,y:pt.y};diag('AIM ORIGIN AUTHORITY','weapon='+selected.weaponKey+' muzzle='+Math.round(startPx.x)+','+Math.round(startPx.y)+' pointer='+Math.round(pt.x)+','+Math.round(pt.y)+' source='+(cutawayMuzzle?'CUTAWAY_MUZZLE':'BASE_MUZZLE'));setAimVisual(startPx,currentPx);return true",status,'originDiag');

  patched=replaceOnce(patched,"if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){","if(aiming)return;const pt=eventStagePoint(e);\n  if(!xrayOpen&&localWorldSide()==='aurelian'){openPrivateXray('authoritative warrior firing entry');diag('AIM ENTRY ROUTE','EXTERIOR->CUTAWAY noFire=Y');return}\n  if(xrayOpen){",status,'cutawayEntry');

  const summary=Object.entries(status).map(([k,v])=>k+':' +(v?'OK':'MISS')).join(' ');
  return patched.replace('</head>','<meta id="ac-aim-lifecycle-bridge-v0412" name="ac-aim-lifecycle-bridge" content="'+summary+' aimAuthority:PHYSICAL_MUZZLE_REPROJECTED cameraOwner:PRESENTATION_DIRECTOR hullSeal:CURRENT_XRAY_SHELL+NATIVE_ROOM_PANELS aurelianFireEntry:CUTAWAY_ONLY">\n</head>');
}
