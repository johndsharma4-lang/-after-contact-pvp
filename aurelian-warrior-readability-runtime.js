function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAurelianWarriorReadabilityRuntime(html) {
  if (html.includes('ac-aurelian-warrior-readability-v0351')) return html;
  let patched = html;
  const status = {scale:false,lancer:false,disk:false,sunadier:false};

  const helpers = String.raw`
function acRefineAurelianReadability(rig,type){
 if(!rig)return rig;
 const body=rig.userData?.rig||{};
 // Battle cutaway is phone-scale: enlarge the character, then exaggerate only the weapon identity.
 rig.scale.multiplyScalar(type==='sunadier'?1.20:1.18);
 if(type==='solar_lancer'){
   const weapon=body.weapon||rig.getObjectByName('WEAPON_MUZZLE_RIG'),tip=body.lanceTip||rig.getObjectByName('lanceTip'),glow=body.lanceGlow||rig.getObjectByName('lanceGlow');
   if(weapon){weapon.scale.x*=1.16;weapon.scale.z*=1.16}
   if(tip)tip.scale.set(tip.scale.x*1.30,tip.scale.y*1.12,tip.scale.z*1.30);
   if(glow){glow.scale.multiplyScalar(1.42);if(glow.material){glow.material.emissiveIntensity=Math.max(glow.material.emissiveIntensity||0,2.0)}}
   const core=rig.getObjectByName('solarCore');if(core)core.scale.multiplyScalar(1.16);
 }else if(type==='sun_disk_gunner'){
   for(const name of['RIGHT_DISK_GAUNTLET','LEFT_DISK_GAUNTLET']){const g=rig.getObjectByName(name);if(g)g.scale.multiplyScalar(1.18)}
   rig.traverse(o=>{if(o.name?.startsWith('solarDisk'))o.scale.multiplyScalar(1.20);if(o.name?.startsWith('diskTooth'))o.scale.multiplyScalar(1.12)});
 }else if(type==='sunadier'){
   const chain=body.chain||rig.getObjectByName('sunChain'),grenade=body.grenade||rig.getObjectByName('solarGrenade');
   if(chain)chain.scale.multiplyScalar(1.12);
   if(grenade){grenade.scale.multiplyScalar(1.38);if(grenade.material){grenade.material.emissiveIntensity=Math.max(grenade.material.emissiveIntensity||0,2.0)}}
   const rack=rig.getObjectByName('grenadeRack');if(rack)rack.scale.multiplyScalar(1.10);
 }
 rig.userData.acReadabilityRefined=true;
 return rig
}
`;

  if(!patched.includes('function acRefineAurelianReadability(')){
    const next=patched.replace('function buildAurelianWarrior3DModel(type){',helpers+'\nfunction buildAurelianWarrior3DModel(type){');status.scale=next!==patched;patched=next;
  } else status.scale=true;

  patched=replaceOnce(patched,
    "function buildAurelianWarrior3DModel(type){if(type==='solar_lancer')return buildSolarLancer3DModel();if(type==='sun_disk_gunner')return buildSunDiskGunner3DModel();if(type==='sunadier')return buildSunadier3DModel();return buildStarter3DModel(type)}",
    "function buildAurelianWarrior3DModel(type){if(type==='solar_lancer')return acRefineAurelianReadability(buildSolarLancer3DModel(),type);if(type==='sun_disk_gunner')return acRefineAurelianReadability(buildSunDiskGunner3DModel(),type);if(type==='sunadier')return acRefineAurelianReadability(buildSunadier3DModel(),type);return buildStarter3DModel(type)}",
    status,'lancer');status.disk=status.lancer;status.sunadier=status.lancer;

  // Cutaway-only target/selection rigs use the same refined Aurelian builder where available.
  patched=patched.replace("if(type==='solar_lancer')return buildSolarLancer3DModel();if(type==='sun_disk_gunner')return buildSunDiskGunner3DModel();if(type==='sunadier')return buildSunadier3DModel();","if(type==='solar_lancer')return acRefineAurelianReadability(buildSolarLancer3DModel(),type);if(type==='sun_disk_gunner')return acRefineAurelianReadability(buildSunDiskGunner3DModel(),type);if(type==='sunadier')return acRefineAurelianReadability(buildSunadier3DModel(),type);");

  patched=patched.replace(/MATCH RECORDER v0\.35\.0/g,'MATCH RECORDER v0.35.1');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_AURELIAN_READABILITY_PASS');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-aurelian-warrior-readability-v0351" name="ac-aurelian-warrior-readability" content="${summary}">\n</head>`);
}
