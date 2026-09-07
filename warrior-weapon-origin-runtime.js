function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchWarriorWeaponOriginRuntime(html) {
  if (html.includes('ac-warrior-visual-fire-v0416')) return html;
  let patched = html;
  const status = {helpers:false,aimPose:false,releasePose:false,poseRecovery:false,switchReliability:false};

  const helpers = String.raw`
function acWarriorCutawayRig(w){return xrayOpen&&w&&typeof xrayRoomVisuals!=='undefined'?xrayRoomVisuals.find(v=>v.warrior===w)?.rig3D||null:null}
function acWarriorSignatureSfx(w){
 if(!w||typeof audioTone!=='function'||typeof audioNoise!=='function')return;const key=w.weaponKey;
 if(key==='solar_lancer'){duckMusic(.10,950);audioTone(190,.30,'sawtooth',.095,1.9);audioTone(760,.42,'sine',.12,.95,.025);audioTone(1760,.24,'triangle',.075,.72,.055);audioNoise(.15,.06,1850,.025)}
 else if(key==='sun_disk_gunner'){duckMusic(.11,760);audioTone(118,.24,'square',.09,.65);audioTone(520,.34,'sawtooth',.10,1.55,.02);audioTone(1320,.26,'sine',.085,.58,.055);audioNoise(.18,.055,1250,.03)}
 else if(key==='sunadier'){duckMusic(.10,900);audioNoise(.13,.09,900);audioTone(84,.28,'sawtooth',.11,.50);audioTone(410,.26,'triangle',.09,.82,.03);audioNoise(.22,.06,1850,.07);audioTone(980,.18,'sine',.07,.44,.085)}
 diag('WARRIOR SIGNATURE SFX',key+' layered=Y')
}
function acAimJointBase(joint){
 if(!joint)return null;if(!joint.userData.acAimBase)joint.userData.acAimBase={rx:joint.rotation.x,ry:joint.rotation.y,rz:joint.rotation.z,px:joint.position.x,py:joint.position.y,pz:joint.position.z};return joint.userData.acAimBase
}
function acAimAngle(value){while(value>Math.PI)value-=Math.PI*2;while(value<-Math.PI)value+=Math.PI*2;return value}
function acAimJointZ(joint,offset,alpha){const base=acAimJointBase(joint);if(joint&&base)joint.rotation.z=THREE.MathUtils.lerp(joint.rotation.z,base.rz+offset,alpha)}
function acWarriorRelaxPose(w,delay=0){
 const rig=acWarriorCutawayRig(w),body=rig?.userData?.rig;if(!rig||!body)return;const token=(rig.userData.acPoseToken||0)+1;rig.userData.acPoseToken=token;
 const joints=[body.pelvis,body.torso,body.headRoot,body.shoulders,body.clothRoot,...(body.armRoots||[]),...(body.elbowRoots||[]),...(body.legRoots||[]),body.weapon,body.secondaryWeapon].filter(Boolean),startAt=performance.now()+Math.max(0,delay),duration=390;
 const settle=now=>{if(!rig.parent||rig.userData.acPoseToken!==token)return;if(now<startAt){requestAnimationFrame(settle);return}const alpha=Math.min(1,(now-startAt)/duration),ease=alpha*alpha*(3-2*alpha);for(const joint of joints){const base=acAimJointBase(joint);joint.rotation.x=THREE.MathUtils.lerp(joint.rotation.x,base.rx,ease);joint.rotation.y=THREE.MathUtils.lerp(joint.rotation.y,base.ry,ease);joint.rotation.z=THREE.MathUtils.lerp(joint.rotation.z,base.rz,ease);joint.position.x=THREE.MathUtils.lerp(joint.position.x,base.px,ease);joint.position.y=THREE.MathUtils.lerp(joint.position.y,base.py,ease);joint.position.z=THREE.MathUtils.lerp(joint.position.z,base.pz,ease)}if(alpha<1)requestAnimationFrame(settle);else rig.userData.acAimPoseStage=null};requestAnimationFrame(settle)
}
function acWarriorPoseAim(w,stageTarget,fire=false){
 const rig=acWarriorCutawayRig(w),muzzle=rig?.userData?.muzzle,body=rig?.userData?.rig,weapon=body?.weapon||muzzle?.parent;if(!rig||!muzzle||!weapon||!stageTarget)return;
 const origin=worldToStage(muzzle.getWorldPosition(new THREE.Vector3())),dx=stageTarget.x-origin.x,dy=stageTarget.y-origin.y;if(Math.hypot(dx,dy)<3)return;rig.userData.acPoseToken=(rig.userData.acPoseToken||0)+1;
 const pelvis=body.pelvis,torso=body.torso,head=body.headRoot,shoulders=body.shoulders,cloth=body.clothRoot,leftArm=body.armRoots?.[0],rightArm=body.armRoots?.[1]||body.armRoots?.[0],leftElbow=body.elbowRoots?.[0],rightElbow=body.elbowRoots?.[1],leftLeg=body.legRoots?.[0],rightLeg=body.legRoots?.[1],secondary=body.secondaryWeapon;
 const nodes=[pelvis,torso,head,shoulders,cloth,leftArm,rightArm,leftElbow,rightElbow,leftLeg,rightLeg,weapon,secondary].filter(Boolean);for(const node of nodes)acAimJointBase(node);
 const key=w.weaponKey,axis=key==='solar_lancer'?Math.PI/2:key==='sun_disk_gunner'?-Math.PI/2:Math.atan2(-.52,1.30),axisName=key==='solar_lancer'?'LANCE_UP_AXIS':key==='sun_disk_gunner'?'GAUNTLET_FOREARM_AXIS':'CHAIN_GRENADE_AXIS',rigEuler=new THREE.Euler().setFromQuaternion(rig.getWorldQuaternion(new THREE.Quaternion()),'XYZ'),pelvisBase=acAimJointBase(pelvis),torsoBase=acAimJointBase(torso),shoulderBase=acAimJointBase(shoulders),weaponBase=acAimJointBase(weapon),rightArmBase=acAimJointBase(rightArm),rightElbowBase=acAimJointBase(rightElbow);
 const chainBase=rigEuler.z+(pelvisBase?.rz||0)+(torsoBase?.rz||0)+(weaponBase?.rz||0)+axis+((key==='sun_disk_gunner'||key==='sunadier')?((shoulderBase?.rz||0)+(rightArmBase?.rz||0)+(rightElbowBase?.rz||0)):0),desired=-Math.atan2(dy,dx),delta=THREE.MathUtils.clamp(acAimAngle(desired-chainBase),-1.62,1.62),alpha=fire?.98:.68,facing=dx>=0?1:-1,intent=THREE.MathUtils.clamp(Math.abs(delta)/1.20,.12,1);
 if(key==='solar_lancer'){acAimJointZ(pelvis,-delta*.06,alpha);acAimJointZ(torso,delta*.16,alpha);acAimJointZ(weapon,delta*.90,alpha);acAimJointZ(rightArm,delta*.54,alpha);acAimJointZ(rightElbow,delta*.20,alpha);acAimJointZ(leftArm,delta*.32-facing*.10,alpha);acAimJointZ(leftElbow,delta*.12+facing*.12,alpha)}
 else if(key==='sun_disk_gunner'){acAimJointZ(pelvis,-delta*.08,alpha);acAimJointZ(torso,delta*.16,alpha);acAimJointZ(shoulders,delta*.12,alpha);acAimJointZ(rightArm,delta*.56,alpha);acAimJointZ(rightElbow,delta*.24,alpha);acAimJointZ(weapon,0,alpha);acAimJointZ(leftArm,delta*.50,alpha);acAimJointZ(leftElbow,delta*.20,alpha);acAimJointZ(secondary,0,alpha)}
 else{acAimJointZ(pelvis,-delta*.07,alpha);acAimJointZ(torso,delta*.16,alpha);acAimJointZ(shoulders,delta*.11,alpha);acAimJointZ(rightArm,delta*.52,alpha);acAimJointZ(rightElbow,delta*.20,alpha);acAimJointZ(weapon,delta*.08,alpha);acAimJointZ(leftArm,delta*.25-facing*.18,alpha);acAimJointZ(leftElbow,delta*.10+facing*.16,alpha)}
 const pelvisPose=acAimJointBase(pelvis),torsoPose=acAimJointBase(torso),shoulderPose=acAimJointBase(shoulders),headPose=acAimJointBase(head),clothPose=acAimJointBase(cloth),leftLegPose=acAimJointBase(leftLeg),rightLegPose=acAimJointBase(rightLeg);
 if(pelvisPose){pelvis.rotation.y=THREE.MathUtils.lerp(pelvis.rotation.y,pelvisPose.ry-facing*(.07+.04*intent),alpha);pelvis.rotation.x=THREE.MathUtils.lerp(pelvis.rotation.x,pelvisPose.rx+.035*intent,alpha);pelvis.position.x=THREE.MathUtils.lerp(pelvis.position.x,pelvisPose.px-facing*(.04+.035*intent),alpha);pelvis.position.y=THREE.MathUtils.lerp(pelvis.position.y,pelvisPose.py-.075*intent,alpha)}
 if(torsoPose){torso.rotation.y=THREE.MathUtils.lerp(torso.rotation.y,torsoPose.ry+facing*(.12+.05*intent),alpha);torso.rotation.x=THREE.MathUtils.lerp(torso.rotation.x,torsoPose.rx-.045*intent,alpha);torso.position.x=THREE.MathUtils.lerp(torso.position.x,torsoPose.px+facing*(.08+.035*intent),alpha);torso.position.y=THREE.MathUtils.lerp(torso.position.y,torsoPose.py+.035-.02*intent,alpha)}
 if(shoulderPose){shoulders.rotation.y=THREE.MathUtils.lerp(shoulders.rotation.y,shoulderPose.ry+facing*.09,alpha);shoulders.position.x=THREE.MathUtils.lerp(shoulders.position.x,shoulderPose.px+facing*.035*intent,alpha);shoulders.position.y=THREE.MathUtils.lerp(shoulders.position.y,shoulderPose.py+.025*intent,alpha)}
 if(headPose){head.rotation.z=THREE.MathUtils.lerp(head.rotation.z,headPose.rz+delta*.20,alpha);head.rotation.y=THREE.MathUtils.lerp(head.rotation.y,headPose.ry+facing*(.19+.06*intent),alpha);head.rotation.x=THREE.MathUtils.lerp(head.rotation.x,headPose.rx-.035*intent,alpha)}
 if(leftLegPose){leftLeg.rotation.z=THREE.MathUtils.lerp(leftLeg.rotation.z,leftLegPose.rz-facing*(.12+.06*intent),alpha);leftLeg.rotation.x=THREE.MathUtils.lerp(leftLeg.rotation.x,leftLegPose.rx+.055*intent,alpha);leftLeg.position.x=THREE.MathUtils.lerp(leftLeg.position.x,leftLegPose.px-facing*(.055+.035*intent),alpha);leftLeg.position.y=THREE.MathUtils.lerp(leftLeg.position.y,leftLegPose.py-.02*intent,alpha)}
 if(rightLegPose){rightLeg.rotation.z=THREE.MathUtils.lerp(rightLeg.rotation.z,rightLegPose.rz+facing*(.08+.04*intent),alpha);rightLeg.rotation.x=THREE.MathUtils.lerp(rightLeg.rotation.x,rightLegPose.rx-.035*intent,alpha);rightLeg.position.x=THREE.MathUtils.lerp(rightLeg.position.x,rightLegPose.px+facing*(.035+.025*intent),alpha);rightLeg.position.y=THREE.MathUtils.lerp(rightLeg.position.y,rightLegPose.py-.045*intent,alpha)}
 if(clothPose){cloth.rotation.y=THREE.MathUtils.lerp(cloth.rotation.y,clothPose.ry-facing*.08*intent,alpha);cloth.rotation.z=THREE.MathUtils.lerp(cloth.rotation.z,clothPose.rz-delta*.08,alpha);cloth.position.x=THREE.MathUtils.lerp(cloth.position.x,clothPose.px-facing*.025*intent,alpha)}
 const poseStage=Math.round(delta/.22);if(rig.userData.acAimPoseStage!==poseStage){rig.userData.acAimPoseStage=poseStage;diag('WARRIOR AIM BODY',key+' axis='+axisName+' chain=FEET>LEGS>HIPS>TORSO>SHOULDERS>HEAD>ARMS>WEAPON alignment=COHERENT weightShift=ACTIVE delta='+THREE.MathUtils.radToDeg(delta).toFixed(0)+'deg muzzle=LIVE rawTarget=UNCHANGED')}
 if(!fire)return;if(torsoPose){torso.position.x-=facing*.15;torso.position.y-=.035;torso.rotation.y-=facing*.055}if(shoulderPose){shoulders.position.x-=facing*.10;shoulders.rotation.y-=facing*.07}if(pelvisPose){pelvis.position.x-=facing*.065;pelvis.position.y-=.035}if(leftLegPose)leftLeg.rotation.z+=facing*.035;if(rightLegPose)rightLeg.rotation.z-=facing*.045;if(clothPose){cloth.position.x+=facing*.075;cloth.rotation.y+=facing*.09}if(weaponBase){weapon.position.x-=facing*.10;weapon.position.y+=.065}const flashPos=muzzle.getWorldPosition(new THREE.Vector3());aimOriginWorld=flashPos.clone();aimOriginStage=worldToStage(aimOriginWorld);const flash=glowSphere(.42,WEAPONS[key]?.color||0xffd66b,12);flash.position.copy(flashPos);flash.material.transparent=true;flash.material.opacity=1;scene.add(flash);effects.push({objects:[flash],life:.24,max:.24});rig.userData.acPoseFiredUntil=performance.now()+190;diag('WARRIOR MUZZLE FIRE',key+' weaponRoot='+String(weapon.name||'UNNAMED')+' recoil=FULL_BODY recovery=SMOOTH_390MS muzzle=LIVE rawTarget=UNCHANGED')
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
  patched=replaceOnce(patched,"function clearAim(){","function clearAim(){if(selected){const acPoseRig=acWarriorCutawayRig(selected),acPoseDelay=Math.max(0,(acPoseRig?.userData?.acPoseFiredUntil||0)-performance.now());acWarriorRelaxPose(selected,acPoseDelay)}",status,'poseRecovery');
  patched=replaceOnce(patched,"if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){","if(aiming)return;const pt=eventStagePoint(e);\n  if(xrayOpen){acPrepareCrewSwitchHitTest();",status,'switchReliability');

  const summary=Object.entries(status).map(([k,v])=>k+':'+(v?'OK':'MISS')).join(' ');
  return patched.replace('</head>','<meta id="ac-warrior-visual-fire-v0416" name="ac-warrior-visual-fire" content="'+summary+' aimPose:FULL_BODY_WEIGHT_SHIFT_WEAPON_SPECIFIC recoil:FULL_BODY_SMOOTH_RECOVERY poseDiagnostic:WARRIOR_AIM_BODY muzzle:LIVE_ARTICULATED rawTarget:UNCHANGED camera:NONE retry:NONE">\n</head>')
}
