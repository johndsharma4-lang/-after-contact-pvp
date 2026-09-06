function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAimLifecycleBridgeRuntime(html) {
  if (html.includes('ac-aim-lifecycle-bridge-v0406')) return html;
  let patched = html;
  const status = { liveStep:false, originDiag:false, cutawayEntry:false, shellOwnership:false, aimHook:false, cameraChoreo:false };

  // Hull choreography must advance from the authoritative aim gesture, not only from
  // whichever camera branch happens to own a frame.
  patched = replaceOnce(
    patched,
    "function acDirectorUpdateAimTarget(attacker,pt){acDirector.aimTargetProgress=acDirectorAimTarget(attacker,pt)}",
    "function acDirectorUpdateAimTarget(attacker,pt){acDirector.aimTargetProgress=acDirectorAimTarget(attacker,pt);acDirectorStepAimPresentation(performance.now())}",
    status,
    'liveStep'
  );

  // The expanded cutaway hides the CURRENT shell through xrayShellState. The old
  // damageModules array is only one historical subset and can be empty for rebuilt
  // Aurelian hulls. Make the presentation director operate on the same shell inventory
  // that applyXrayShell() actually hid, grouped to the nearest physical room.
  const oldSeal = /function acDirectorApplyAimSeal\(attacker,progress\)\{[\s\S]*?\n\}\nfunction acDirectorBeginAim\(attacker\)\{/;
  const newSeal = String.raw`function acDirectorApplyAimSeal(attacker,progress){
 if(!xrayOpen||!attacker)return;
 const rooms=localXrayRooms()?.userData?.rooms||[],shooter=attacker.roomIndex,shell=(typeof xrayShellState!=='undefined'&&Array.isArray(xrayShellState))?xrayShellState:[];
 if(!Number.isInteger(shooter)||!rooms.length)return;
 const sr=Math.floor(shooter/3),sc=shooter%3,order=[];
 for(let i=0;i<rooms.length;i++)if(i!==shooter)order.push(i);
 order.sort((a,b)=>{const ar=Math.floor(a/3),ac=a%3,br=Math.floor(b/3),bc=b%3,ad=Math.abs(ar-sr)+Math.abs(ac-sc),bd=Math.abs(br-sr)+Math.abs(bc-sc);return bd-ad||a-b});
 const closeCount=Math.min(order.length,Math.floor(THREE.MathUtils.clamp(progress,0,1)*order.length+.001)),closed=new Set(order.slice(0,closeCount)),buckets=Array.from({length:rooms.length},()=>[]),roomPoints=rooms.map(r=>r?.hitPlane?.getWorldPosition?.(new THREE.Vector3())||null);
 let mapped=0,global=0;
 for(const entry of shell){const mesh=entry?.mesh;if(!mesh?.getWorldPosition)continue;const box=new THREE.Box3().setFromObject(mesh),size=box.getSize(new THREE.Vector3());if(size.x>10.5||size.y>8.5){global++;mesh.visible=false;continue}const p=mesh.getWorldPosition(new THREE.Vector3());let best=-1,bestD=Infinity;for(let i=0;i<roomPoints.length;i++){const rp=roomPoints[i];if(!rp)continue;const dx=p.x-rp.x,dy=p.y-rp.y,dz=(p.z-rp.z)*.25,d=dx*dx+dy*dy+dz*dz;if(d<bestD){bestD=d;best=i}}if(best>=0){buckets[best].push(entry);mapped++}}
 for(let i=0;i<rooms.length;i++){const room=rooms[i],shouldClose=i!==shooter&&closed.has(i)&&!room?.erased&&(room?.breach??0)<100;for(const entry of buckets[i])entry.mesh.visible=shouldClose?(entry.visible!==false):false}
 const chosen=xrayRoomVisuals?.find?.(v=>v.warrior===attacker);if(chosen?.nativeRoom){chosen.nativeRoom.visible=true;chosen.nativeRoom.userData.firingStage=true}
 if(acDirector.shellMapReported!==true){acDirector.shellMapReported=true;diag('AIM SHELL MAP','shell='+shell.length+' mapped='+mapped+' global='+global+' legacyModules='+((localXraySide()==='aurelian'?factionSkinA:factionSkinE)?.userData?.damageModules?.length||0))}
 if(closeCount!==acDirector.sealedRooms){acDirector.sealedRooms=closeCount;diag('AIM HULL SEAL','visual='+Math.round(progress*100)+'% target='+Math.round(acDirector.aimTargetProgress*100)+'% closed='+closeCount+'/'+order.length+' shooterRoom='+(shooter+1))}
}
function acDirectorBeginAim(attacker){`;
  const shellNext = patched.replace(oldSeal,newSeal);
  status.shellOwnership = shellNext !== patched;
  patched = shellNext;

  // Ensure the director is attached to the live setAimVisual even if another earlier
  // runtime already decorated that function and made the director's old exact needle miss.
  if(!patched.includes("acDirectorBeginAim(selected);acDirectorUpdateAimTarget(selected,b);")){
    const hookNext=patched.replace(/function setAimVisual\(a,b\)\{\n\s*if\(!selected\)return;/,"function setAimVisual(a,b){\n  if(!selected)return;\n  acDirectorBeginAim(selected);acDirectorUpdateAimTarget(selected,b);");
    status.aimHook=hookNext!==patched;patched=hookNext;
  }else status.aimHook=true;

  // Replace the aggressive battlefield zoom with staged choreography tied to the SAME
  // smoothed progress that seals the hull. Early aim stays shooter-focused; enemy framing
  // only begins once the hull is substantially sealed. Release/travel cameras remain separate.
  const oldCamera = /if\(xrayOpen&&aiming&&selected\)\{[\s\S]*?camera\.lookAt\(targetLook\);return\n  \}/;
  const newCamera = String.raw`if(xrayOpen&&aiming&&selected){
    const progress=acDirectorStepAimPresentation(performance.now()),visual=xrayRoomVisuals?.find?.(v=>v.warrior===selected),shooter=visual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(selected),enemyRoot=selected.side==='aurelian'?earth:aure,enemy=enemyRoot.getWorldPosition(new THREE.Vector3());
    const reveal=THREE.MathUtils.smoothstep(progress,.52,1),late=THREE.MathUtils.smoothstep(progress,.78,1),center=shooter.clone().lerp(enemy,.04+reveal*.22+late*.10),targetLook=shooter.clone().lerp(enemy,.03+reveal*.18+late*.12);
    const earlySpan=46,lateSpan=Math.max(70,Math.abs(enemy.x-shooter.x)+34),span=THREE.MathUtils.lerp(earlySpan,lateSpan,reveal),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf));
    const targetPos=new THREE.Vector3(center.x,THREE.MathUtils.lerp(shooter.y+4.0,Math.max(shooter.y,enemy.y)+6.0,reveal),Math.max(66,THREE.MathUtils.lerp(69,zNeed+20,reveal))),alpha=snap?1:THREE.MathUtils.lerp(.10,.075,reveal);
    camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,THREE.MathUtils.lerp(1.16,1.06,reveal),alpha);camera.updateProjectionMatrix();camera.lookAt(targetLook);
    if(acDirector.cameraStage!==Math.floor(progress*4)){acDirector.cameraStage=Math.floor(progress*4);diag('AIM CAMERA STAGE','progress='+Math.round(progress*100)+'% reveal='+Math.round(reveal*100)+'% shooterPriority=Y')}
    return
  }`;
  const cameraNext = patched.replace(oldCamera,newCamera);
  status.cameraChoreo = cameraNext !== patched;
  patched = cameraNext;

  // Keep explicit telemetry for the physical muzzle versus the finger position.
  patched = replaceOnce(
    patched,
    "aimOriginWorld=cutawayMuzzle?cutawayMuzzle.getWorldPosition(new THREE.Vector3()):muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};currentPx={x:pt.x,y:pt.y};setAimVisual(startPx,currentPx);return true",
    "aimOriginWorld=cutawayMuzzle?cutawayMuzzle.getWorldPosition(new THREE.Vector3()):muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);startPx={x:aimOriginStage.x,y:aimOriginStage.y};currentPx={x:pt.x,y:pt.y};diag('AIM ORIGIN AUTHORITY','weapon='+selected.weaponKey+' muzzle='+Math.round(startPx.x)+','+Math.round(startPx.y)+' pointer='+Math.round(pt.x)+','+Math.round(pt.y)+' source='+(cutawayMuzzle?'CUTAWAY_MUZZLE':'BASE_MUZZLE'));setAimVisual(startPx,currentPx);return true",
    status,
    'originDiag'
  );

  // Retire the old Aurelian exterior-fire entrance. A tap on the local vessel now enters
  // the physical cutaway first; aiming cannot begin until a real cutaway warrior has
  // been selected and locked. This gives presentation, camera and muzzle one owner.
  patched = replaceOnce(
    patched,
    "if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){",
    "if(aiming)return;const pt=eventStagePoint(e);\n  if(!xrayOpen&&localWorldSide()==='aurelian'){openPrivateXray('authoritative warrior firing entry');diag('AIM ENTRY ROUTE','EXTERIOR->CUTAWAY noFire=Y');return}\n  if(xrayOpen){",
    status,
    'cutawayEntry'
  );

  const summary = Object.entries(status).map(([k,v]) => k+':' +(v?'OK':'MISS')).join(' ');
  return patched.replace('</head>', '<meta id="ac-aim-lifecycle-bridge-v0406" name="ac-aim-lifecycle-bridge" content="'+summary+' ballistics:UNCHANGED camera:STAGED_SHOOTER_PRIORITY hullSeal:CURRENT_XRAY_SHELL aurelianFireEntry:CUTAWAY_ONLY">\n</head>');
}
