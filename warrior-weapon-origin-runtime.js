function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchWarriorWeaponOriginRuntime(html) {
  if (html.includes('ac-warrior-weapon-origin-v0342')) return html;
  let patched = html;
  const status = {helpers:false,aimOrigin:false,releaseOrigin:false,fireOrigin:false};

  const helpers = String.raw`
function acWarriorCutawayRig(w){return xrayOpen&&w&&typeof xrayRoomVisuals!=='undefined'?xrayRoomVisuals.find(v=>v.warrior===w)?.rig3D||null:null}
function acWarriorLiveMuzzleWorld(w,stageTarget=null){
  const rig=acWarriorCutawayRig(w),muzzle=rig?.userData?.muzzle;if(muzzle?.parent)return muzzle.getWorldPosition(new THREE.Vector3());
  return muzzleWorld(w,stageTarget).clone()
}
function acWarriorPoseAim(w,stageTarget,fire=false){
  const rig=acWarriorCutawayRig(w),muzzle=rig?.userData?.muzzle,parent=muzzle?.parent;if(!rig||!muzzle||!parent||!stageTarget)return;
  const origin=worldToStage(muzzle.getWorldPosition(new THREE.Vector3())),dx=stageTarget.x-origin.x,dy=stageTarget.y-origin.y;if(Math.hypot(dx,dy)<3)return;
  if(parent.userData.acWeaponBaseZ==null)parent.userData.acWeaponBaseZ=parent.rotation.z;
  const base=parent.userData.acWeaponBaseZ,screenAngle=Math.atan2(dy,dx),raw=-screenAngle-Math.PI/2,target=Math.max(base-1.28,Math.min(base+1.28,raw));parent.rotation.z=THREE.MathUtils.lerp(parent.rotation.z,target,fire?.86:.48);
  const body=rig.userData?.rig,arm=body?.armRoots?.[1]||body?.armRoots?.[0];if(arm){if(arm.userData.acWeaponBaseZ==null)arm.userData.acWeaponBaseZ=arm.rotation.z;const armBase=arm.userData.acWeaponBaseZ,armTarget=Math.max(armBase-.88,Math.min(armBase+.88,armBase+(target-base)*.72));arm.rotation.z=THREE.MathUtils.lerp(arm.rotation.z,armTarget,fire?.78:.42)}
  if(fire){const flashPos=muzzle.getWorldPosition(new THREE.Vector3()),flash=glowSphere(.34,WEAPONS[w.weaponKey]?.color||0xffd66b,12);flash.position.copy(flashPos);flash.material.transparent=true;flash.material.opacity=1;scene.add(flash);effects.push({objects:[flash],life:.20,max:.20});const kick=parent.position.clone();parent.position.y-=.10;setTimeout(()=>{if(parent?.parent)parent.position.copy(kick)},130);diag('WARRIOR MUZZLE FIRE',w.weaponKey+' exactMuzzle=Y')}
}
function acWarriorRefreshAimOrigin(w,stageTarget,fire=false){
  if(!w)return null;acWarriorPoseAim(w,stageTarget,fire);const live=acWarriorLiveMuzzleWorld(w,stageTarget);if(live){aimOriginWorld=live.clone();aimOriginStage=worldToStage(live);startPx={x:aimOriginStage.x,y:aimOriginStage.y}}return live
}
`;

  if (!patched.includes('function acWarriorLiveMuzzleWorld(')) {
    const next = patched.replace('function setAimVisual(a,b){', helpers + '\nfunction setAimVisual(a,b){');
    status.helpers = next !== patched;patched = next;
  } else status.helpers = true;

  const aimNeedle = "function setAimVisual(a,b){\n  if(!selected)return;";
  const aimReplacement = "function setAimVisual(a,b){\n  if(!selected)return;\n  acWarriorRefreshAimOrigin(selected,b,false);";
  patched = replaceOnce(patched, aimNeedle, aimReplacement, status, 'aimOrigin');

  const releaseNeedle = "diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);fireSelectedFromStage(pt,power)";
  const releaseReplacement = "diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);acWarriorRefreshAimOrigin(selected,pt,true);fireSelectedFromStage(pt,power)";
  patched = replaceOnce(patched, releaseNeedle, releaseReplacement, status, 'releaseOrigin');

  const fireNeedle = "const start=!remote&&aiming&&aimOriginWorld?aimOriginWorld.clone():muzzleWorld(w,pt);";
  const fireReplacement = "const start=!remote&&typeof acWarriorLiveMuzzleWorld==='function'?acWarriorLiveMuzzleWorld(w,pt):(!remote&&aiming&&aimOriginWorld?aimOriginWorld.clone():muzzleWorld(w,pt));";
  patched = replaceOnce(patched, fireNeedle, fireReplacement, status, 'fireOrigin');

  patched = patched.replace(/MATCH RECORDER v0\.34\.1/g,'MATCH RECORDER v0.34.2');
  patched = patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_WARRIOR_MUZZLE_AUTHORITATIVE');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-warrior-weapon-origin-v0342" name="ac-warrior-weapon-origin" content="${summary}">\n</head>`);
}
