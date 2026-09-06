export function patchAurelianCutawayCompositionRuntime(html){
  if(html.includes('ac-aurelian-cutaway-composition-v0368'))return html;
  const helper=String.raw`
function acComposeAurelianCutaway(rig,type){
  if(!rig||rig.userData?.acCutawayComposed)return rig;
  const r=rig.userData?.rig||{};
  // Composition owns visual staging. Combat, camera and ballistics never resize these rigs.
  rig.scale.multiplyScalar(.60);
  rig.rotation.set(0,type==='sun_disk_gunner'?.10:type==='sunadier'?-.12:.12,0);
  rig.position.y+=.10;
  if(r.pelvis)r.pelvis.rotation.set(0,0,0);
  if(r.torso)r.torso.rotation.set(0,0,0);
  if(r.headRoot)r.headRoot.rotation.set(0,0,0);
  if(r.head)r.head.rotation.set(0,0,0);
  if(r.hipL){r.hipL.rotation.x=0;r.hipL.rotation.z=-.035}if(r.hipR){r.hipR.rotation.x=0;r.hipR.rotation.z=.035}
  if(r.kneeL){r.kneeL.rotation.x=0;r.kneeL.rotation.z=0}if(r.kneeR){r.kneeR.rotation.x=0;r.kneeR.rotation.z=0}
  if(type==='solar_lancer'){
    if(r.armL)r.armL.rotation.z=.22;if(r.armR)r.armR.rotation.z=-.30;
    if(r.elbowL)r.elbowL.rotation.z=-.12;if(r.elbowR)r.elbowR.rotation.z=.18;
    if(r.weapon){r.weapon.rotation.z=-.30;r.weapon.rotation.y=-.05;r.weapon.position.x=1.02;r.weapon.position.y=.34;r.weapon.position.z=.40;r.weapon.scale.setScalar(.94)}
    const shaft=rig.getObjectByName('lanceShaft');if(shaft)shaft.scale.set(1,1,1);
    const spine=rig.getObjectByName('lanceSpine');if(spine)spine.scale.set(1,1,1);
    if(r.lanceTip&&r.lanceTip.material)r.lanceTip.material.emissiveIntensity=Math.max(r.lanceTip.material.emissiveIntensity||0,3.0);
  }else if(type==='sun_disk_gunner'){
    if(r.armL)r.armL.rotation.z=.24;if(r.armR)r.armR.rotation.z=-.24;
    if(r.elbowL)r.elbowL.rotation.z=-.08;if(r.elbowR)r.elbowR.rotation.z=.08;
    if(r.gauntlet){r.gauntlet.rotation.set(-.08,-.08,-.04);r.gauntlet.scale.setScalar(.92)}
    if(r.secondaryGauntlet){r.secondaryGauntlet.rotation.set(-.08,.08,.04);r.secondaryGauntlet.scale.setScalar(.92)}
    rig.traverse(o=>{const n=String(o.name||'');if(n.startsWith('solarDisk'))o.scale.setScalar(.94);if(n.startsWith('diskEmitter'))o.scale.setScalar(.96)});
  }else if(type==='sunadier'){
    if(r.armL)r.armL.rotation.z=.18;if(r.armR)r.armR.rotation.z=-.32;
    if(r.elbowL)r.elbowL.rotation.z=-.10;if(r.elbowR)r.elbowR.rotation.z=.20;
    if(r.chain){r.chain.rotation.z=-.08;r.chain.rotation.y=-.10;r.chain.position.x=.18}
    if(r.grenade){r.grenade.position.x=1.36;r.grenade.position.y=.62;r.grenade.position.z=.42;r.grenade.scale.setScalar(.94)}
    rig.traverse(o=>{const n=String(o.name||'');if(n.startsWith('chainLink'))o.scale.setScalar(.94);if(n==='grenadeCore')o.scale.setScalar(1.0)});
  }
  rig.traverse(o=>{
    const n=String(o.name||'').toLowerCase();
    if(n.includes('helmet')||n.includes('birdmask')||n==='beak'||n==='visor'||n.includes('breastplate')||n.includes('chestcore'))o.renderOrder=Math.max(o.renderOrder||0,40);
    if(o.material&&('emissiveIntensity' in o.material)&&(n.includes('disk')||n.includes('grenade')||n.includes('lance')))o.material.emissiveIntensity=Math.min(o.material.emissiveIntensity||0,2.8)
  });
  const key=new THREE.PointLight(0xffd08a,.44,4.2,2);key.name='AURELIAN_ROOM_KEY';key.position.set(.10,1.70,1.55);rig.add(key);
  const fill=new THREE.PointLight(0xfff0c0,.26,3.2,2);fill.name='AURELIAN_ROOM_FILL';fill.position.set(-.55,1.05,1.05);rig.add(fill);
  rig.userData.acCutawayComposed=true;rig.userData.acStageRule='ONE_ROOM_UPRIGHT_READABLE';rig.userData.acCutawayScale=.60;return rig
}
`;
  const needle="function buildCutawayOnlyWarrior3D(type){\n  if(type==='solar_lancer')return acBuildSolarLancerRebuilt();\n  if(type==='sun_disk_gunner')return acBuildSunDiskGunnerRebuilt();\n  if(type==='sunadier')return acBuildSunadierRebuilt();";
  const replacement=helper+"\nfunction buildCutawayOnlyWarrior3D(type){\n  if(type==='solar_lancer')return acComposeAurelianCutaway(acBuildSolarLancerRebuilt(),type);\n  if(type==='sun_disk_gunner')return acComposeAurelianCutaway(acBuildSunDiskGunnerRebuilt(),type);\n  if(type==='sunadier')return acComposeAurelianCutaway(acBuildSunadierRebuilt(),type);";
  let patched=html.replace(needle,replacement);const ok=patched!==html;
  patched=patched.replace(/MATCH RECORDER v0\.3[56]\.[0-9]+/g,'MATCH RECORDER v0.36.8');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-05_AURELIAN_UPRIGHT_STAGING');
  return patched.replace('</head>','<meta id="ac-aurelian-cutaway-composition-v0368" name="ac-aurelian-cutaway-composition" content="stage:'+(ok?'OK':'MISS')+' scale:.60 owner:COMPOSITION identity:UPRIGHT_READABLE">\n</head>')
}