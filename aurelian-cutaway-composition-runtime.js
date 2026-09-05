export function patchAurelianCutawayCompositionRuntime(html){
  if(html.includes('ac-aurelian-cutaway-composition-v0365'))return html;
  const helper=String.raw`
function acComposeAurelianCutaway(rig,type){
  if(!rig||rig.userData?.acCutawayComposed)return rig;
  const r=rig.userData?.rig||{};
  // AFTER CONTACT staging rule: the ship owns the scale. Warriors stay compact and gain readability from pose, depth and local light.
  rig.rotation.y=type==='sun_disk_gunner'?.20:type==='sunadier'?-.22:.18;
  if(type==='solar_lancer'){
    if(r.armL)r.armL.rotation.z=.50;if(r.armR)r.armR.rotation.z=-.60;
    if(r.elbowL)r.elbowL.rotation.z=-.36;if(r.elbowR)r.elbowR.rotation.z=.44;
    if(r.weapon){r.weapon.rotation.z=-.72;r.weapon.rotation.y=-.08;r.weapon.position.x=.42;r.weapon.position.y=.64;r.weapon.position.z=.48}
    if(r.lanceTip&&r.lanceTip.material)r.lanceTip.material.emissiveIntensity=Math.max(r.lanceTip.material.emissiveIntensity||0,3.2);
  }else if(type==='sun_disk_gunner'){
    // Wide but contained firing stance: the two gauntlets define the silhouette, not a larger body.
    if(r.armL)r.armL.rotation.z=.64;if(r.armR)r.armR.rotation.z=-.64;
    if(r.elbowL)r.elbowL.rotation.z=-.18;if(r.elbowR)r.elbowR.rotation.z=.18;
    if(r.gauntlet){r.gauntlet.rotation.x=-.12;r.gauntlet.rotation.y=-.10;r.gauntlet.rotation.z=-.08}
    if(r.secondaryGauntlet){r.secondaryGauntlet.rotation.x=-.12;r.secondaryGauntlet.rotation.y=.10;r.secondaryGauntlet.rotation.z=.08}
  }else if(type==='sunadier'){
    // Asymmetric artillery pose keeps chain/orb in his room-space while separating it from the torso.
    if(r.armL)r.armL.rotation.z=.48;if(r.armR)r.armR.rotation.z=-.68;
    if(r.elbowL)r.elbowL.rotation.z=-.28;if(r.elbowR)r.elbowR.rotation.z=.50;
    if(r.chain){r.chain.rotation.z=-.24;r.chain.rotation.y=-.16}
    if(r.grenade){r.grenade.position.x=1.72;r.grenade.position.y=1.02;r.grenade.position.z=.42}
  }
  // A restrained warm key light separates black/white/gold armor from the ship interior without changing ship geometry.
  const key=new THREE.PointLight(0xffb34a,.48,4.2,2);key.name='AURELIAN_ROOM_KEY';key.position.set(.15,1.45,1.35);rig.add(key);
  const fill=new THREE.PointLight(0xffe4a0,.18,2.8,2);fill.name='AURELIAN_ROOM_FILL';fill.position.set(-.65,.65,.75);rig.add(fill);
  rig.userData.acCutawayComposed=true;
  rig.userData.acStageRule='ONE_ROOM_SHIP_DOMINANT';
  return rig
}
`;
  const needle="function buildCutawayOnlyWarrior3D(type){\n  if(type==='solar_lancer')return acBuildSolarLancerRebuilt();\n  if(type==='sun_disk_gunner')return acBuildSunDiskGunnerRebuilt();\n  if(type==='sunadier')return acBuildSunadierRebuilt();";
  const replacement=helper+"\nfunction buildCutawayOnlyWarrior3D(type){\n  if(type==='solar_lancer')return acComposeAurelianCutaway(acBuildSolarLancerRebuilt(),type);\n  if(type==='sun_disk_gunner')return acComposeAurelianCutaway(acBuildSunDiskGunnerRebuilt(),type);\n  if(type==='sunadier')return acComposeAurelianCutaway(acBuildSunadierRebuilt(),type);";
  let patched=html.replace(needle,replacement);const ok=patched!==html;
  patched=patched.replace(/MATCH RECORDER v0\.3[56]\.[0-9]+/g,'MATCH RECORDER v0.36.5');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_AURELIAN_ONE_ROOM_STAGING');
  return patched.replace('</head>',`<meta id="ac-aurelian-cutaway-composition-v0365" name="ac-aurelian-cutaway-composition" content="stage:${ok?'OK':'MISS'} scale:UNCHANGED ship:UNCHANGED principle:ONE_ROOM">\n</head>`)
}
