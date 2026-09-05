export function patchAurelianCutawayCompositionRuntime(html){
  if(html.includes('ac-aurelian-cutaway-composition-v0366'))return html;
  const helper=String.raw`
function acComposeAurelianCutaway(rig,type){
  if(!rig||rig.userData?.acCutawayComposed)return rig;
  const r=rig.userData?.rig||{};
  // AFTER CONTACT rule: lock body/ship scale; identity comes from contained signature silhouettes.
  rig.rotation.y=type==='sun_disk_gunner'?.20:type==='sunadier'?-.22:.18;
  if(type==='solar_lancer'){
    if(r.armL)r.armL.rotation.z=.50;if(r.armR)r.armR.rotation.z=-.60;
    if(r.elbowL)r.elbowL.rotation.z=-.36;if(r.elbowR)r.elbowR.rotation.z=.44;
    if(r.weapon){r.weapon.rotation.z=-.64;r.weapon.rotation.y=-.08;r.weapon.position.x=.34;r.weapon.position.y=.58;r.weapon.position.z=.54;r.weapon.scale.x*=1.18;r.weapon.scale.z*=1.18}
    const shaft=rig.getObjectByName('lanceShaft');if(shaft){shaft.scale.x*=1.22;shaft.scale.z*=1.22}
    const spine=rig.getObjectByName('lanceSpine');if(spine){spine.scale.x*=1.20;spine.scale.z*=1.18}
    if(r.lanceTip){r.lanceTip.scale.x*=1.32;r.lanceTip.scale.z*=1.32;if(r.lanceTip.material)r.lanceTip.material.emissiveIntensity=Math.max(r.lanceTip.material.emissiveIntensity||0,3.6)}
    if(r.lanceGlow)r.lanceGlow.scale.multiplyScalar(1.28);
  }else if(type==='sun_disk_gunner'){
    if(r.armL)r.armL.rotation.z=.60;if(r.armR)r.armR.rotation.z=-.60;
    if(r.elbowL)r.elbowL.rotation.z=-.16;if(r.elbowR)r.elbowR.rotation.z=.16;
    if(r.gauntlet){r.gauntlet.rotation.x=-.12;r.gauntlet.rotation.y=-.10;r.gauntlet.rotation.z=-.08;r.gauntlet.scale.multiplyScalar(1.18)}
    if(r.secondaryGauntlet){r.secondaryGauntlet.rotation.x=-.12;r.secondaryGauntlet.rotation.y=.10;r.secondaryGauntlet.rotation.z=.08;r.secondaryGauntlet.scale.multiplyScalar(1.18)}
    rig.traverse(o=>{const n=String(o.name||'');if(n.startsWith('solarDisk'))o.scale.multiplyScalar(1.16);if(n.startsWith('diskEmitter'))o.scale.multiplyScalar(1.32)});
  }else if(type==='sunadier'){
    if(r.armL)r.armL.rotation.z=.46;if(r.armR)r.armR.rotation.z=-.64;
    if(r.elbowL)r.elbowL.rotation.z=-.26;if(r.elbowR)r.elbowR.rotation.z=.48;
    if(r.chain){r.chain.rotation.z=-.20;r.chain.rotation.y=-.16}
    if(r.grenade){r.grenade.position.x=1.56;r.grenade.position.y=1.02;r.grenade.position.z=.48;r.grenade.scale.multiplyScalar(1.26)}
    rig.traverse(o=>{const n=String(o.name||'');if(n.startsWith('chainLink'))o.scale.multiplyScalar(1.16);if(n==='grenadeCore')o.scale.multiplyScalar(1.30)});
  }
  const key=new THREE.PointLight(0xffb34a,.52,4.2,2);key.name='AURELIAN_ROOM_KEY';key.position.set(.15,1.45,1.35);rig.add(key);
  const fill=new THREE.PointLight(0xffe4a0,.20,2.8,2);fill.name='AURELIAN_ROOM_FILL';fill.position.set(-.65,.65,.75);rig.add(fill);
  rig.userData.acCutawayComposed=true;rig.userData.acStageRule='ONE_ROOM_IDENTITY_FIRST';return rig
}
`;
  const needle="function buildCutawayOnlyWarrior3D(type){\n  if(type==='solar_lancer')return acBuildSolarLancerRebuilt();\n  if(type==='sun_disk_gunner')return acBuildSunDiskGunnerRebuilt();\n  if(type==='sunadier')return acBuildSunadierRebuilt();";
  const replacement=helper+"\nfunction buildCutawayOnlyWarrior3D(type){\n  if(type==='solar_lancer')return acComposeAurelianCutaway(acBuildSolarLancerRebuilt(),type);\n  if(type==='sun_disk_gunner')return acComposeAurelianCutaway(acBuildSunDiskGunnerRebuilt(),type);\n  if(type==='sunadier')return acComposeAurelianCutaway(acBuildSunadierRebuilt(),type);";
  let patched=html.replace(needle,replacement);const ok=patched!==html;
  patched=patched.replace(/MATCH RECORDER v0\.3[56]\.[0-9]+/g,'MATCH RECORDER v0.36.6');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_AURELIAN_IDENTITY_SILHOUETTES');
  return patched.replace('</head>',`<meta id="ac-aurelian-cutaway-composition-v0366" name="ac-aurelian-cutaway-composition" content="stage:${ok?'OK':'MISS'} bodyScale:LOCKED ship:LOCKED identity:WEAPONS">\n</head>`)
}
