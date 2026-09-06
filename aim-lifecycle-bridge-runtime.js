function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAimLifecycleBridgeRuntime(html) {
  if (html.includes('ac-aim-lifecycle-bridge-v0405')) return html;
  let patched = html;
  const status = { liveStep:false, originDiag:false, cutawayEntry:false, shellOwnership:false, aimHook:false };

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
  return patched.replace('</head>', '<meta id="ac-aim-lifecycle-bridge-v0405" name="ac-aim-lifecycle-bridge" content="'+summary+' ballistics:UNCHANGED camera:OBSERVER hullSeal:CURRENT_XRAY_SHELL aurelianFireEntry:CUTAWAY_ONLY">\n</head>');
}
