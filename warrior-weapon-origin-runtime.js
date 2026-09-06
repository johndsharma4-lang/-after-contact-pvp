function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchWarriorWeaponOriginRuntime(html) {
  if (html.includes('ac-warrior-visual-fire-v0400')) return html;
  let patched = html;
  const status = {helpers:false,aimPose:false,releasePose:false,switchReliability:false};

  const helpers = String.raw`
function acWarriorCutawayRig(w){return xrayOpen&&w&&typeof xrayRoomVisuals!=='undefined'?xrayRoomVisuals.find(v=>v.warrior===w)?.rig3D||null:null}
function acWarriorSignatureSfx(w){
 if(!w||typeof audioTone!=='function'||typeof audioNoise!=='function')return;const key=w.weaponKey;
 if(key==='solar_lancer'){duckMusic(.10,950);audioTone(190,.30,'sawtooth',.095,1.9);audioTone(760,.42,'sine',.12,.95,.025);audioTone(1760,.24,'triangle',.075,.72,.055);audioNoise(.15,.06,1850,.025)}
 else if(key==='sun_disk_gunner'){duckMusic(.11,760);audioTone(118,.24,'square',.09,.65);audioTone(520,.34,'sawtooth',.10,1.55,.02);audioTone(1320,.26,'sine',.085,.58,.055);audioNoise(.18,.055,1250,.03)}
 else if(key==='sunadier'){duckMusic(.10,900);audioNoise(.13,.09,900);audioTone(84,.28,'sawtooth',.11,.50);audioTone(410,.26,'triangle',.09,.82,.03);audioNoise(.22,.06,1850,.07);audioTone(980,.18,'sine',.07,.44,.085)}
 diag('WARRIOR SIGNATURE SFX',key+' layered=Y')
}
function acWarriorPoseAim(w,stageTarget,fire=false){
 const rig=acWarriorCutawayRig(w),muzzle=rig?.userData?.muzzle,parent=muzzle?.parent;if(!rig||!muzzle||!parent||!stageTarget)return;
 const origin=worldToStage(muzzle.getWorldPosition(new THREE.Vector3())),dx=stageTarget.x-origin.x,dy=stageTarget.y-origin.y;if(Math.hypot(dx,dy)<3)return;
 if(parent.userData.acWeaponBaseZ==null)parent.userData.acWeaponBaseZ=parent.rotation.z;const base=parent.userData.acWeaponBaseZ,screenAngle=Math.atan2(dy,dx),raw=-screenAngle-Math.PI/2,target=Math.max(base-1.28,Math.min(base+1.28,raw));parent.rotation.z=THREE.MathUtils.lerp(parent.rotation.z,target,fire?.90:.48);
 const body=rig.userData?.rig,arm=body?.armRoots?.[1]||body?.armRoots?.[0];if(arm){if(arm.userData.acWeaponBaseZ==null)arm.userData.acWeaponBaseZ=arm.rotation.z;const armBase=arm.userData.acWeaponBaseZ,armTarget=Math.max(armBase-.88,Math.min(armBase+.88,armBase+(target-base)*.72));arm.rotation.z=THREE.MathUtils.lerp(arm.rotation.z,armTarget,fire?.82:.42)}
 if(!fire)return;const flashPos=muzzle.getWorldPosition(new THREE.Vector3()),flash=glowSphere(.42,WEAPONS[w.weaponKey]?.color||0xffd66b,12);flash.position.copy(flashPos);flash.material.transparent=true;flash.material.opacity=1;scene.add(flash);effects.push({objects:[flash],life:.24,max:.24});const kick=parent.position.clone();parent.position.y-=.13;setTimeout(()=>{if(parent?.parent)parent.position.copy(kick)},155);diag('WARRIOR MUZZLE FIRE',w.weaponKey+' visualOnly=Y physicsOrigin=UNCHANGED')
}
function acPrepareCrewSwitchHitTest(){if(!xrayOpen||aiming||!xrayConfirmedShooter)return;restoreFullCutawayStage();xrayConfirmedShooter=null;xraySelectedCrew=null;refreshPrivateXrayVisuals();diag('CREW SWITCH READY','full 3D crew hit-test restored')}
`;

  if (!patched.includes('function acWarriorPoseAim(')) {const next=patched.replace('function setAimVisual(a,b){',helpers+'\nfunction setAimVisual(a,b){');status.helpers=next!==patched;patched=next}else status.helpers=true;
  patched=replaceOnce(patched,"function setAimVisual(a,b){\n  if(!selected)return;","function setAimVisual(a,b){\n  if(!selected)return;\n  acWarriorPoseAim(selected,b,false);",status,'aimPose');
  patched=replaceOnce(patched,"diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);fireSelectedFromStage(pt,power)","diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);const acReleaseWarrior=selected;acWarriorPoseAim(acReleaseWarrior,pt,true);acWarriorSignatureSfx(acReleaseWarrior);fireSelectedFromStage(pt,power)",status,'releasePose');
  patched=replaceOnce(patched,"if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){","if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){acPrepareCrewSwitchHitTest();",status,'switchReliability');

  const summary=Object.entries(status).map(([k,v])=>k+':'+(v?'OK':'MISS')).join(' ');
  return patched.replace('</head>','<meta id="ac-warrior-visual-fire-v0400" name="ac-warrior-visual-fire" content="'+summary+' physicsOrigin:BASE camera:NONE retry:NONE">\n</head>')
}
