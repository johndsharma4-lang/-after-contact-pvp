export function patchAurelianReferenceFidelityRuntime(html) {
  if (html.includes('ac-aurelian-reference-fidelity-v0353')) return html;
  let patched = html;
  const status = {helper:false,builder:false,cutaway:false};

  const helper = String.raw`
const AC_AURELIAN_REFERENCE_ART=Object.freeze({solar_lancer:'/solar-lancer.webp',sun_disk_gunner:'/sun-disk-gunner-hq.webp',sunadier:'/sunadier-hq.webp'});
const acAurelianReferenceTextureCache=new Map();
function acReferenceTexture(path){
  if(acAurelianReferenceTextureCache.has(path))return acAurelianReferenceTextureCache.get(path);
  const tex=new THREE.TextureLoader().load(path,t=>{if('colorSpace' in t&&THREE.SRGBColorSpace)t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true},undefined,err=>diag('CANONICAL ART LOAD FAIL',path));
  if('colorSpace' in tex&&THREE.SRGBColorSpace)tex.colorSpace=THREE.SRGBColorSpace;acAurelianReferenceTextureCache.set(path,tex);return tex
}
function acAttachCanonicalArtShell(rig,type){
  const path=AC_AURELIAN_REFERENCE_ART[type];if(!rig||!path||rig.userData?.canonicalArtShell)return rig;
  const tex=acReferenceTexture(path),shell=new THREE.Group();shell.name='CANONICAL_ART_RELIEF_'+type.toUpperCase();
  const targetH=type==='solar_lancer'?5.0:type==='sunadier'?4.75:4.65;
  const frontMat=new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.035,side:THREE.DoubleSide,depthWrite:true,toneMapped:false}),sideMat=new THREE.MeshStandardMaterial({color:type==='sunadier'?0x5b3017:0x72501f,metalness:.35,roughness:.66});
  const front=new THREE.Mesh(new THREE.PlaneGeometry(1,1),frontMat);front.name='CANONICAL_ART_FRONT';front.position.z=.72;front.renderOrder=130;front.frustumCulled=false;
  const mid=new THREE.Mesh(new THREE.PlaneGeometry(1,1),frontMat.clone());mid.name='CANONICAL_ART_MID';mid.material.opacity=.56;mid.position.z=.50;mid.renderOrder=128;mid.frustumCulled=false;
  const backing=new THREE.Mesh(new THREE.BoxGeometry(2.15,targetH*.92,.34),sideMat);backing.name='CANONICAL_ART_VOLUME';backing.position.z=.24;backing.renderOrder=112;
  shell.add(backing,mid,front);shell.position.set(0,.58,0);rig.add(shell);
  const fit=()=>{const img=tex.image;if(!img?.width||!img?.height)return;const aspect=img.width/img.height,w=targetH*aspect;front.scale.set(w,targetH,1);mid.scale.set(w*1.015,targetH*1.015,1);backing.scale.x=Math.max(.72,w/2.15*.72);diag('CANONICAL ART FIT',type+' '+img.width+'x'+img.height+' w='+w.toFixed(2)+' h='+targetH)};
  if(tex.image?.width)fit();else{const timer=setInterval(()=>{if(tex.image?.width){clearInterval(timer);fit()}},50);setTimeout(()=>clearInterval(timer),5000)}
  // Keep real weapon/muzzle geometry visible for aiming, but visually subordinate the old primitive body.
  rig.traverse(o=>{if(!o.isMesh||o===front||o===mid||o===backing)return;const n=String(o.name||'');if(/muzzle|glow|solarCore|lance|disk|grenade|chain|weapon/i.test(n))return;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!m)continue;if('transparent' in m){m.transparent=true;m.opacity=Math.min(m.opacity??1,.22)}if(m.color)m.color.multiplyScalar(.48)}});
  rig.userData.canonicalArtShell=shell;rig.userData.canonicalArtPath=path;rig.userData.canonicalArtFidelity='FORCED_FACTORY_REFERENCE_RELIEF';
  diag('CANONICAL 3D ART',type+' path='+path+' factoryForced=Y sprite=N canvasTexture=N');return rig
}
`;

  if(!patched.includes('function acAttachCanonicalArtShell(')){
    const anchor='function buildAurelianWarrior3DModel(type){';
    const i=patched.indexOf(anchor);
    if(i>=0){patched=patched.slice(0,i)+helper+'\n'+patched.slice(i);status.helper=true}
  } else status.helper=true;

  // Replace the live Aurelian factory regardless of which earlier runtime changed its body.
  const builderRe=/function buildAurelianWarrior3DModel\(type\)\{[^\n]*\}/;
  if(builderRe.test(patched)){
    patched=patched.replace(builderRe,"function buildAurelianWarrior3DModel(type){let rig;if(type==='solar_lancer')rig=typeof acRefineAurelianReadability==='function'?acRefineAurelianReadability(buildSolarLancer3DModel(),type):buildSolarLancer3DModel();else if(type==='sun_disk_gunner')rig=typeof acRefineAurelianReadability==='function'?acRefineAurelianReadability(buildSunDiskGunner3DModel(),type):buildSunDiskGunner3DModel();else if(type==='sunadier')rig=typeof acRefineAurelianReadability==='function'?acRefineAurelianReadability(buildSunadier3DModel(),type):buildSunadier3DModel();else return buildStarter3DModel(type);return acAttachCanonicalArtShell(rig,type)}");status.builder=true
  }

  // Force the same treatment through the dedicated cutaway-only path if that path exists.
  const cutawayRe=/function buildCutawayOnlyWarrior3D\(type\)\{([\s\S]*?)\n\}/;
  const m=patched.match(cutawayRe);
  if(m){
    const original='function buildCutawayOnlyWarrior3D(type){'+m[1]+'\n}';
    const renamed='function acOriginalBuildCutawayOnlyWarrior3D(type){'+m[1]+'\n}\nfunction buildCutawayOnlyWarrior3D(type){const rig=acOriginalBuildCutawayOnlyWarrior3D(type);return AC_AURELIAN_REFERENCE_ART[type]?acAttachCanonicalArtShell(rig,type):rig}';
    patched=patched.replace(original,renamed);status.cutaway=true
  }

  patched=patched.replace(/MATCH RECORDER v0\.35\.[0-2]/g,'MATCH RECORDER v0.35.3');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_FORCED_CANONICAL_AURELIAN_FACTORY');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-aurelian-reference-fidelity-v0353" name="ac-aurelian-reference-fidelity" content="${summary}">\n</head>`);
}
