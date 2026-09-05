function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAurelianWarriorReadabilityRuntime(html) {
  if (html.includes('ac-aurelian-warrior-readability-v0361')) return html;
  let patched = html;
  const status = {scale:false,lancer:false,disk:false,sunadier:false};

  const helpers = String.raw`
function acRefineAurelianReadability(rig,type){
 if(!rig)return rig;
 const body=rig.userData?.rig||{};
 // Tuned from live mobile cutaway screenshot: preserve compartment fit, exaggerate recognition anchors.
 const baseScale=type==='sunadier'?1.30:1.27;
 rig.scale.multiplyScalar(baseScale);
 const head=body.headRoot||rig.getObjectByName('head');if(head)head.scale.multiplyScalar(1.16);
 const halo=rig.getObjectByName('halo');if(halo)halo.scale.multiplyScalar(1.34);
 const core=rig.getObjectByName(type==='sun_disk_gunner'?'diskCore':'solarCore');if(core)core.scale.multiplyScalar(1.34);
 rig.traverse(o=>{
   const n=String(o.name||'');
   if(n.startsWith('haloRay'))o.scale.multiplyScalar(1.22);
   if(n.startsWith('clothPanel')){o.scale.x*=1.18;o.scale.y*=1.12}
   if(/breastplate|pauldron/.test(n)){o.scale.x*=1.10;o.scale.z*=1.08}
   if((n==='solarCore'||n==='diskCore'||n==='lanceGlow'||n.startsWith('diskEmitter')||n==='grenadeCore')&&o.material){o.material.emissiveIntensity=Math.max(o.material.emissiveIntensity||0,2.8)}
 });
 if(type==='solar_lancer'){
   const weapon=body.weapon||rig.getObjectByName('WEAPON_MUZZLE_RIG'),tip=body.lanceTip||rig.getObjectByName('lanceTip'),glow=body.lanceGlow||rig.getObjectByName('lanceGlow');
   if(weapon){weapon.scale.x*=1.34;weapon.scale.z*=1.34;weapon.scale.y*=1.10}
   const shaft=rig.getObjectByName('lanceShaft');if(shaft)shaft.scale.x=shaft.scale.z=1.22;
   const spine=rig.getObjectByName('lanceSpine');if(spine){spine.scale.x*=1.28;spine.scale.z*=1.20}
   if(tip)tip.scale.set(tip.scale.x*1.58,tip.scale.y*1.32,tip.scale.z*1.58);
   if(glow)glow.scale.multiplyScalar(1.75);
   const guard=rig.getObjectByName('lanceGuard');if(guard)guard.scale.multiplyScalar(1.28);
 }else if(type==='sun_disk_gunner'){
   for(const name of['RIGHT_DISK_GAUNTLET','LEFT_DISK_GAUNTLET']){const g=rig.getObjectByName(name);if(g)g.scale.multiplyScalar(1.42)}
   rig.traverse(o=>{
     const n=String(o.name||'');
     if(n.startsWith('solarDisk'))o.scale.multiplyScalar(1.34);
     if(n.startsWith('diskTooth'))o.scale.multiplyScalar(1.24);
     if(n.startsWith('diskEmitter'))o.scale.multiplyScalar(1.55);
   });
   if(body.rightMuzzle)body.rightMuzzle.scale.multiplyScalar(1.12);
   if(body.leftMuzzle)body.leftMuzzle.scale.multiplyScalar(1.12);
 }else if(type==='sunadier'){
   const chain=body.chain||rig.getObjectByName('sunChain'),grenade=body.grenade||rig.getObjectByName('solarGrenade');
   if(chain){chain.scale.x*=1.22;chain.scale.y*=1.18;chain.scale.z*=1.18}
   if(grenade)grenade.scale.multiplyScalar(1.72);
   const rack=rig.getObjectByName('grenadeRack');if(rack)rack.scale.multiplyScalar(1.18);
   rig.traverse(o=>{const n=String(o.name||'');if(n.startsWith('chainLink'))o.scale.multiplyScalar(1.18);if(n.startsWith('grenadeRay'))o.scale.multiplyScalar(1.18)});
 }
 rig.userData.acReadabilityRefined=true;
 rig.userData.acReadabilityTier='MOBILE_CEILING';
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

  patched=patched.replace("if(type==='solar_lancer')return buildSolarLancer3DModel();if(type==='sun_disk_gunner')return buildSunDiskGunner3DModel();if(type==='sunadier')return buildSunadier3DModel();","if(type==='solar_lancer')return acRefineAurelianReadability(buildSolarLancer3DModel(),type);if(type==='sun_disk_gunner')return acRefineAurelianReadability(buildSunDiskGunner3DModel(),type);if(type==='sunadier')return acRefineAurelianReadability(buildSunadier3DModel(),type);");

  patched=patched.replace(/MATCH RECORDER v0\.3[56]\.[0-9]+/g,'MATCH RECORDER v0.36.1');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_AURELIAN_MOBILE_CEILING_READABILITY');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-aurelian-warrior-readability-v0361" name="ac-aurelian-warrior-readability" content="${summary}">\n</head>`);
}
