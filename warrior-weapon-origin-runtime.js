function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchWarriorWeaponOriginRuntime(html) {
  if (html.includes('ac-warrior-weapon-origin-v0343')) return html;
  let patched = html;
  const status = {helpers:false,aimOrigin:false,releaseOrigin:false,fireOrigin:false,signatureSfx:false,launchBeat:false,solarRecovery:false};

  const helpers = String.raw`
let acWarriorLaunchHoldUntil=0,acWarriorLaunchShooter=null;
function acWarriorCutawayRig(w){return xrayOpen&&w&&typeof xrayRoomVisuals!=='undefined'?xrayRoomVisuals.find(v=>v.warrior===w)?.rig3D||null:null}
function acWarriorLiveMuzzleWorld(w,stageTarget=null){const rig=acWarriorCutawayRig(w),muzzle=rig?.userData?.muzzle;if(muzzle?.parent)return muzzle.getWorldPosition(new THREE.Vector3());return muzzleWorld(w,stageTarget).clone()}
function acWarriorSignatureSfx(w){
 if(!w||typeof audioTone!=='function'||typeof audioNoise!=='function')return;const key=w.weaponKey;
 if(key==='solar_lancer'){duckMusic(.10,950);audioTone(190,.30,'sawtooth',.095,1.9);audioTone(760,.42,'sine',.12,.95,.025);audioTone(1760,.24,'triangle',.075,.72,.055);audioNoise(.15,.06,1850,.025)}
 else if(key==='sun_disk_gunner'){duckMusic(.11,760);audioTone(118,.24,'square',.09,.65);audioTone(520,.34,'sawtooth',.10,1.55,.02);audioTone(1320,.26,'sine',.085,.58,.055);audioNoise(.18,.055,1250,.03)}
 else if(key==='sunadier'){duckMusic(.10,900);audioNoise(.13,.09,900);audioTone(84,.28,'sawtooth',.11,.50);audioTone(410,.26,'triangle',.09,.82,.03);audioNoise(.22,.06,1850,.07);audioTone(980,.18,'sine',.07,.44,.085)}
 diag('WARRIOR SIGNATURE SFX',key+' layered=Y')
}
function acWarriorPoseAim(w,stageTarget,fire=false){
 const rig=acWarriorCutawayRig(w),muzzle=rig?.userData?.muzzle,parent=muzzle?.parent;if(!rig||!muzzle||!parent||!stageTarget)return;const origin=worldToStage(muzzle.getWorldPosition(new THREE.Vector3())),dx=stageTarget.x-origin.x,dy=stageTarget.y-origin.y;if(Math.hypot(dx,dy)<3)return;
 if(parent.userData.acWeaponBaseZ==null)parent.userData.acWeaponBaseZ=parent.rotation.z;const base=parent.userData.acWeaponBaseZ,screenAngle=Math.atan2(dy,dx),raw=-screenAngle-Math.PI/2,target=Math.max(base-1.28,Math.min(base+1.28,raw));parent.rotation.z=THREE.MathUtils.lerp(parent.rotation.z,target,fire?.90:.48);
 const body=rig.userData?.rig,arm=body?.armRoots?.[1]||body?.armRoots?.[0];if(arm){if(arm.userData.acWeaponBaseZ==null)arm.userData.acWeaponBaseZ=arm.rotation.z;const armBase=arm.userData.acWeaponBaseZ,armTarget=Math.max(armBase-.88,Math.min(armBase+.88,armBase+(target-base)*.72));arm.rotation.z=THREE.MathUtils.lerp(arm.rotation.z,armTarget,fire?.82:.42)}
 if(fire){const flashPos=muzzle.getWorldPosition(new THREE.Vector3()),flash=glowSphere(.40,WEAPONS[w.weaponKey]?.color||0xffd66b,12);flash.position.copy(flashPos);flash.material.transparent=true;flash.material.opacity=1;scene.add(flash);effects.push({objects:[flash],life:.23,max:.23});const kick=parent.position.clone();parent.position.y-=.13;setTimeout(()=>{if(parent?.parent)parent.position.copy(kick)},155);diag('WARRIOR MUZZLE FIRE',w.weaponKey+' exactMuzzle=Y recoil=Y')}
}
function acWarriorRefreshAimOrigin(w,stageTarget,fire=false){if(!w)return null;acWarriorPoseAim(w,stageTarget,fire);const live=acWarriorLiveMuzzleWorld(w,stageTarget);if(live){aimOriginWorld=live.clone();aimOriginStage=worldToStage(live);startPx={x:aimOriginStage.x,y:aimOriginStage.y}}return live}
function acWarriorBeginLaunchBeat(w){if(!w)return;acWarriorLaunchHoldUntil=performance.now()+360;acWarriorLaunchShooter=w;acWarriorSignatureSfx(w);diag('WARRIOR LAUNCH BEAT',w.weaponKey+' hold=360ms')}
function acSolarReleaseWatchdog(w,pt,power){if(multiplayer||!w||w.weaponKey!=='solar_lancer')return;setTimeout(()=>{if(!battleStarted||matchEnded||soloTurn!=='aurelian'||solarActionLock||w.hp<=0)return;diag('SOLAR RELEASE RECOVERY','no beam lock after valid release; retry once');acWarriorRefreshAimOrigin(w,pt,true);fireWarriorFromStage(w,pt,power,false)},150)}
`;

  if (!patched.includes('function acWarriorLiveMuzzleWorld(')) {const next=patched.replace('function setAimVisual(a,b){',helpers+'\nfunction setAimVisual(a,b){');status.helpers=next!==patched;patched=next}else status.helpers=true;
  patched=replaceOnce(patched,"function setAimVisual(a,b){\n  if(!selected)return;","function setAimVisual(a,b){\n  if(!selected)return;\n  acWarriorRefreshAimOrigin(selected,b,false);",status,'aimOrigin');
  patched=replaceOnce(patched,"diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);fireSelectedFromStage(pt,power)","diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);const acReleaseWarrior=selected;acWarriorRefreshAimOrigin(acReleaseWarrior,pt,true);acWarriorBeginLaunchBeat(acReleaseWarrior);fireSelectedFromStage(pt,power);acSolarReleaseWatchdog(acReleaseWarrior,pt,power)",status,'releaseOrigin');status.signatureSfx=status.releaseOrigin;status.launchBeat=status.releaseOrigin;status.solarRecovery=status.releaseOrigin;
  patched=replaceOnce(patched,"const start=!remote&&aiming&&aimOriginWorld?aimOriginWorld.clone():muzzleWorld(w,pt);","const start=!remote&&typeof acWarriorLiveMuzzleWorld==='function'?acWarriorLiveMuzzleWorld(w,pt):(!remote&&aiming&&aimOriginWorld?aimOriginWorld.clone():muzzleWorld(w,pt));",status,'fireOrigin');

  // Keep the shooter readable for a short beat after release before the director widens to beam/projectile travel.
  const cameraNeedle="  acDirectorBusy();\n  if(xrayOpen&&aiming&&selected){";
  const cameraReplacement=`  acDirectorBusy();
  if(typeof acWarriorLaunchHoldUntil!=='undefined'&&performance.now()<acWarriorLaunchHoldUntil&&acWarriorLaunchShooter&&xrayOpen){
    const w=acWarriorLaunchShooter,visual=xrayRoomVisuals?.find?.(v=>v.warrior===w),shooter=visual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(w),enemyRoot=w.side==='aurelian'?earth:aure,enemy=enemyRoot.getWorldPosition(new THREE.Vector3()),center=shooter.clone().lerp(enemy,.42),span=Math.max(72,Math.abs(enemy.x-shooter.x)+42),vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf)),targetPos=new THREE.Vector3(center.x,Math.max(shooter.y,enemy.y)+6.5,Math.max(91,zNeed+23)),alpha=snap?1:.18;
    camera.position.lerp(targetPos,alpha);camera.zoom=THREE.MathUtils.lerp(camera.zoom,1.08,alpha);camera.updateProjectionMatrix();camera.lookAt(center.clone().lerp(enemy,.16));return
  }
  if(xrayOpen&&aiming&&selected){`;
  const cameraNext=patched.replace(cameraNeedle,cameraReplacement);status.launchBeat=status.launchBeat&&cameraNext!==patched;patched=cameraNext;

  patched=patched.replace(/MATCH RECORDER v0\.34\.2/g,'MATCH RECORDER v0.34.3').replace(/MATCH RECORDER v0\.34\.1/g,'MATCH RECORDER v0.34.3');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_WARRIOR_LAUNCH_FEEDBACK_SOLAR_RECOVERY');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-warrior-weapon-origin-v0343" name="ac-warrior-weapon-origin" content="${summary}">\n</head>`);
}
