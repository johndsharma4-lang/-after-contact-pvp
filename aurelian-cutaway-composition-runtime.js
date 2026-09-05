export function patchAurelianCutawayCompositionRuntime(html){
  if(html.includes('ac-aurelian-cutaway-composition-v0364'))return html;
  const helper=String.raw`
function acComposeAurelianCutaway(rig,type){
  if(!rig||rig.userData?.acCutawayComposed)return rig;
  const r=rig.userData?.rig||{};
  // Keep body scale/ship scale unchanged. Readability comes from pose + signature silhouette.
  if(type==='solar_lancer'){
    if(r.armL)r.armL.rotation.z=.52;if(r.armR)r.armR.rotation.z=-.62;
    if(r.elbowL)r.elbowL.rotation.z=-.38;if(r.elbowR)r.elbowR.rotation.z=.46;
    if(r.weapon){r.weapon.rotation.z=-.78;r.weapon.position.x=.48;r.weapon.position.y=.68;r.weapon.position.z=.50}
    if(r.lanceTip&&r.lanceTip.material)r.lanceTip.material.emissiveIntensity=Math.max(r.lanceTip.material.emissiveIntensity||0,3.0);
  }else if(type==='sun_disk_gunner'){
    if(r.armL)r.armL.rotation.z=.72;if(r.armR)r.armR.rotation.z=-.72;
    if(r.elbowL)r.elbowL.rotation.z=-.22;if(r.elbowR)r.elbowR.rotation.z=.22;
    if(r.gauntlet){r.gauntlet.rotation.x=-.16;r.gauntlet.rotation.z=-.10}
    if(r.secondaryGauntlet){r.secondaryGauntlet.rotation.x=-.16;r.secondaryGauntlet.rotation.z=.10}
  }else if(type==='sunadier'){
    if(r.armL)r.armL.rotation.z=.56;if(r.armR)r.armR.rotation.z=-.78;
    if(r.elbowL)r.elbowL.rotation.z=-.34;if(r.elbowR)r.elbowR.rotation.z=.58;
    if(r.chain){r.chain.rotation.z=-.30;r.chain.rotation.y=-.18}
    if(r.grenade){r.grenade.position.x=2.18;r.grenade.position.y=1.20;r.grenade.position.z=.44}
  }
  rig.userData.acCutawayComposed=true;return rig
}
`;
  const needle="function buildCutawayOnlyWarrior3D(type){\n  if(type==='solar_lancer')return acBuildSolarLancerRebuilt();\n  if(type==='sun_disk_gunner')return acBuildSunDiskGunnerRebuilt();\n  if(type==='sunadier')return acBuildSunadierRebuilt();";
  const replacement=helper+"\nfunction buildCutawayOnlyWarrior3D(type){\n  if(type==='solar_lancer')return acComposeAurelianCutaway(acBuildSolarLancerRebuilt(),type);\n  if(type==='sun_disk_gunner')return acComposeAurelianCutaway(acBuildSunDiskGunnerRebuilt(),type);\n  if(type==='sunadier')return acComposeAurelianCutaway(acBuildSunadierRebuilt(),type);";
  let patched=html.replace(needle,replacement);const ok=patched!==html;
  patched=patched.replace(/MATCH RECORDER v0\.3[56]\.[0-9]+/g,'MATCH RECORDER v0.36.4');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_AURELIAN_CUTAWAY_COMPOSITION');
  return patched.replace('</head>',`<meta id="ac-aurelian-cutaway-composition-v0364" name="ac-aurelian-cutaway-composition" content="pose:${ok?'OK':'MISS'} scale:UNCHANGED ship:UNCHANGED">\n</head>`)
}
