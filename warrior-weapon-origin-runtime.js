function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchWarriorWeaponOriginRuntime(html) {
  if (html.includes('ac-warrior-visual-fire-v0413')) return html;
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
 const rig=acWarriorCutawayRig(w),muzzle=rig?.userData?.muzzle,body=rig?.userData?.rig,weapon=body?.weapon||muzzle?.parent;if(!rig||!muzzle||!weapon||!stageTarget)return;
 const origin=worldToStage(muzzle.getWorldPosition(new THREE.Vector3())),dx=stageTarget.x-origin.x,dy=stageTarget.y-origin.y;if(Math.hypot(dx,dy)<3)return;
 if(weapon.userData.acWeaponBaseZ==null)weapon.userData.acWeaponBaseZ=weapon.rotation.z;const base=weapon.userData.acWeaponBaseZ,screenAngle=Math.atan2(dy,dx),raw=-screenAngle-Math.PI/2,target=Math.max(base-1.28,Math.min(base+1.28,raw));weapon.rotation.z=THREE.MathUtils.lerp(weapon.rotation.z,target,fire?.94:.58);
 const rightArm=body?.armRoots?.[1]||body?.armRoots?.[0],rightElbow=body?.elbowRoots?.[1];if(rightArm){if(rightArm.userData.acWeaponBaseZ==null)rightArm.userData.acWeaponBaseZ=rightArm.rotation.z;const armBase=rightArm.userData.acWeaponBaseZ,armTarget=Math.max(armBase-.94,Math.min(armBase+.94,armBase+(target-base)*.82));rightArm.rotation.z=THREE.MathUtils.lerp(rightArm.rotation.z,armTarget,fire?.88:.52)}if(rightElbow){if(rightElbow.userData.acWeaponBaseZ==null)rightElbow.userData.acWeaponBaseZ=rightElbow.rotation.z;rightElbow.rotation.z=THREE.MathUtils.lerp(rightElbow.rotation.z,rightElbow.userData.acWeaponBaseZ+(target-base)*.30,fire?.86:.46)}
 if(w.weaponKey==='sun_disk_gunner'){const leftArm=body?.armRoots?.[0],leftElbow=body?.elbowRoots?.[0],secondary=body?.secondaryWeapon;if(leftArm){if(leftArm.userData.acWeaponBaseZ==null)leftArm.userData.acWeaponBaseZ=leftArm.rotation.z;leftArm.rotation.z=THREE.MathUtils.lerp(leftArm.rotation.z,leftArm.userData.acWeaponBaseZ+(target-base)*.68,fire?.86:.48)}if(leftElbow){if(leftElbow.userData.acWeaponBaseZ==null)leftElbow.userData.acWeaponBaseZ=leftElbow.rotation.z;leftElbow.rotation.z=THREE.MathUtils.lerp(leftElbow.rotation.z,leftElbow.userData.acWeaponBaseZ+(target-base)*.24,fire?.84:.44)}if(secondary){if(secondary.userData.acWeaponBaseZ==null)secondary.userData.acWeaponBaseZ=secondary.rotation.z;secondary.rotation.z=THREE.MathUtils.lerp(secondary.rotation.z,secondary.userData.acWeaponBaseZ+(target-base)*.72,fire?.88:.50)}}
 const poseStage=Math.round((target-base)/.28);if(rig.userData.acAimPoseStage!==poseStage){rig.userData.acAimPoseStage=poseStage;diag('WARRIOR AIM POSE',w.weaponKey+' weaponRoot='+String(weapon.name||'UNNAMED')+' arm='+(rightArm?'Y':'N')+' angle='+THREE.MathUtils.radToDeg(target-base).toFixed(0)+'deg physicsOrigin=UNCHANGED')}
 if(!fire)return;const flashPos=muzzle.getWorldPosition(new THREE.Vector3()),flash=glowSphere(.42,WEAPONS[w.weaponKey]?.color||0xffd66b,12);flash.position.copy(flashPos);flash.material.transparent=true;flash.material.opacity=1;scene.add(flash);effects.push({objects:[flash],life:.24,max:.24});const kick=weapon.position.clone();weapon.position.y-=.13;setTimeout(()=>{if(weapon?.parent)weapon.position.copy(kick)},155);diag('WARRIOR MUZZLE FIRE',w.weaponKey+' weaponRoot='+String(weapon.name||'UNNAMED')+' visualOnly=Y physicsOrigin=UNCHANGED')
}
function acPrepareCrewSwitchHitTest(){if(!xrayOpen||aiming||!xrayConfirmedShooter)return;restoreFullCutawayStage();xrayConfirmedShooter=null;xraySelectedCrew=null;refreshPrivateXrayVisuals();diag('CREW SWITCH READY','full 3D crew hit-test restored')}
`;

  if (!patched.includes('function acWarriorPoseAim(')) {const next=patched.replace('function setAimVisual(a,b){',helpers+'\nfunction setAimVisual(a,b){');status.helpers=next!==patched;patched=next}else status.helpers=true;
  patched=replaceOnce(patched,"function setAimVisual(a,b){\n  if(!selected)return;","function setAimVisual(a,b){\n  if(!selected)return;\n  acWarriorPoseAim(selected,b,false);",status,'aimPose');
  const releasePrefix="diag('AIM RELEASE',`distance=${Math.round(dist)} power=${Math.round(power)} control=${control}`);";
  const releaseStage='if(selected)acDirectorForceFiringStage(selected);';
  if(patched.includes(releasePrefix+releaseStage+'fireSelectedFromStage(releasePt,power)'))patched=replaceOnce(patched,releasePrefix+releaseStage+'fireSelectedFromStage(releasePt,power)',releasePrefix+'const acReleaseWarrior=selected;acWarriorPoseAim(acReleaseWarrior,releasePt,true);acWarriorSignatureSfx(acReleaseWarrior);'+releaseStage+'fireSelectedFromStage(releasePt,power)',status,'releasePose');
  else if(patched.includes(releasePrefix+releaseStage+'fireSelectedFromStage(pt,power)'))patched=replaceOnce(patched,releasePrefix+releaseStage+'fireSelectedFromStage(pt,power)',releasePrefix+'const acReleaseWarrior=selected;acWarriorPoseAim(acReleaseWarrior,pt,true);acWarriorSignatureSfx(acReleaseWarrior);'+releaseStage+'fireSelectedFromStage(pt,power)',status,'releasePose');
  else patched=replaceOnce(patched,releasePrefix+'fireSelectedFromStage(pt,power)',releasePrefix+'const acReleaseWarrior=selected;acWarriorPoseAim(acReleaseWarrior,pt,true);acWarriorSignatureSfx(acReleaseWarrior);fireSelectedFromStage(pt,power)',status,'releasePose');
  patched=replaceOnce(patched,"if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){","if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){acPrepareCrewSwitchHitTest();",status,'switchReliability');

  const summary=Object.entries(status).map(([k,v])=>k+':'+(v?'OK':'MISS')).join(' ');
  return patched.replace('</head>','<meta id="ac-warrior-visual-fire-v0413" name="ac-warrior-visual-fire" content="'+summary+' aimPose:WEAPON_ROOT+SHOULDER+ELBOW poseDiagnostic:WARRIOR_AIM_POSE physicsOrigin:BASE camera:NONE retry:NONE">\n</head>')
}
