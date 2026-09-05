function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAurelianReferenceFidelityRuntime(html) {
  if (html.includes('ac-aurelian-reference-fidelity-v0352')) return html;
  let patched = html;
  const status = {helper:false,builder:false,solar:false,disk:false,sunadier:false};

  const helper = String.raw`
const AC_AURELIAN_REFERENCE_ART=Object.freeze({
  solar_lancer:'/solar-lancer.webp',
  sun_disk_gunner:'/sun-disk-gunner-hq.webp',
  sunadier:'/sunadier-hq.webp'
});
const acAurelianReferenceTextureCache=new Map();
function acReferenceTexture(path){
  if(acAurelianReferenceTextureCache.has(path))return acAurelianReferenceTextureCache.get(path);
  const tex=new THREE.TextureLoader().load(path,t=>{t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true},undefined,()=>{});
  tex.colorSpace=THREE.SRGBColorSpace;acAurelianReferenceTextureCache.set(path,tex);return tex
}
function acAttachCanonicalArtShell(rig,type){
  const path=AC_AURELIAN_REFERENCE_ART[type];if(!rig||!path||rig.userData?.canonicalArtShell)return rig;
  rig.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(rig),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  const shell=new THREE.Group();shell.name='CANONICAL_ART_RELIEF_'+type.toUpperCase();
  const tex=acReferenceTexture(path);
  const targetH=Math.max(4.35,size.y*1.02),frontMat=new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.055,side:THREE.DoubleSide,depthWrite:true,toneMapped:false}),shadowMat=new THREE.MeshBasicMaterial({map:tex,color:0x6a522d,transparent:true,opacity:.28,alphaTest:.055,side:THREE.DoubleSide,depthWrite:false,toneMapped:false});
  const front=new THREE.Mesh(new THREE.PlaneGeometry(1,1),frontMat);front.name='CANONICAL_ART_FRONT';front.renderOrder=118;
  const rear=new THREE.Mesh(new THREE.PlaneGeometry(1,1),shadowMat);rear.name='CANONICAL_ART_DEPTH';rear.position.z=-.18;rear.scale.set(1.035,1.035,1);rear.renderOrder=116;
  shell.add(rear,front);shell.position.set(center.x,center.y,.54);rig.add(shell);
  const fit=()=>{const img=tex.image;if(!img?.width||!img?.height)return;const aspect=img.width/img.height;front.scale.set(targetH*aspect,targetH,1);rear.scale.set(targetH*aspect*1.035,targetH*1.035,1)};
  if(tex.image?.width)fit();else{const old=tex.onUpdate;tex.onUpdate=()=>{try{old?.()}catch{}fit()}};
  // Preserve real 3D volume behind the canonical front silhouette, but suppress primitive visual competition.
  rig.traverse(o=>{if(!o.isMesh||o===front||o===rear)return;const n=String(o.name||'');if(/muzzle|glow|solarCore|lance|disk|grenade|chain|weapon/i.test(n))return;const m=o.material;if(m&&'roughness'in m){m.roughness=Math.max(m.roughness||0,.55);if(m.color)m.color.multiplyScalar(.72)}});
  rig.userData.canonicalArtShell=shell;rig.userData.canonicalArtPath=path;rig.userData.canonicalArtFidelity='REFERENCE_BOUND_3D_RELIEF';
  diag('CANONICAL 3D ART',type+' path='+path+' rigged=Y sprite=N canvasTexture=N');return rig
}
`;

  if(!patched.includes('const AC_AURELIAN_REFERENCE_ART=')){
    const next=patched.replace('function buildAurelianWarrior3DModel(type){',helper+'\nfunction buildAurelianWarrior3DModel(type){');status.helper=next!==patched;patched=next;
  } else status.helper=true;

  const oldBuilder="function buildAurelianWarrior3DModel(type){if(type==='solar_lancer')return acRefineAurelianReadability(buildSolarLancer3DModel(),type);if(type==='sun_disk_gunner')return acRefineAurelianReadability(buildSunDiskGunner3DModel(),type);if(type==='sunadier')return acRefineAurelianReadability(buildSunadier3DModel(),type);return buildStarter3DModel(type)}";
  const newBuilder="function buildAurelianWarrior3DModel(type){if(type==='solar_lancer')return acAttachCanonicalArtShell(acRefineAurelianReadability(buildSolarLancer3DModel(),type),type);if(type==='sun_disk_gunner')return acAttachCanonicalArtShell(acRefineAurelianReadability(buildSunDiskGunner3DModel(),type),type);if(type==='sunadier')return acAttachCanonicalArtShell(acRefineAurelianReadability(buildSunadier3DModel(),type),type);return buildStarter3DModel(type)}";
  patched=replaceOnce(patched,oldBuilder,newBuilder,status,'builder');status.solar=status.builder;status.disk=status.builder;status.sunadier=status.builder;

  // Cutaway-only clones and impact-window rigs should use the same canonical visual identity.
  patched=patched.replace("if(type==='solar_lancer')return acRefineAurelianReadability(buildSolarLancer3DModel(),type);if(type==='sun_disk_gunner')return acRefineAurelianReadability(buildSunDiskGunner3DModel(),type);if(type==='sunadier')return acRefineAurelianReadability(buildSunadier3DModel(),type);",
    "if(type==='solar_lancer')return acAttachCanonicalArtShell(acRefineAurelianReadability(buildSolarLancer3DModel(),type),type);if(type==='sun_disk_gunner')return acAttachCanonicalArtShell(acRefineAurelianReadability(buildSunDiskGunner3DModel(),type),type);if(type==='sunadier')return acAttachCanonicalArtShell(acRefineAurelianReadability(buildSunadier3DModel(),type),type);");

  patched=patched.replace(/MATCH RECORDER v0\.35\.1/g,'MATCH RECORDER v0.35.2');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_CANONICAL_AURELIAN_REFERENCE_RIGS');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-aurelian-reference-fidelity-v0352" name="ac-aurelian-reference-fidelity" content="${summary}">\n</head>`);
}
