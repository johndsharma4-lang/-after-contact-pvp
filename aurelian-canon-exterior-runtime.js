function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAurelianCanonExteriorRuntime(html) {
  if (html.includes('ac-aurelian-canon-exterior-v0425')) return html;
  let patched = html;
  const status = { renameBase:false, wrapper:false };

  patched = replaceOnce(
    patched,
    'function buildAurelianDirectorHull(skin,cy,mat){',
    'function acBuildAurelianDirectorHullBase(skin,cy,mat){',
    status,
    'renameBase'
  );

  const wrapper = String.raw`
function acAurelianCanonExteriorMesh(geo,material,name){
  const mesh=new THREE.Mesh(geo,material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.acCanonExteriorArt=true;return mesh
}
function acAurelianCanonShape(points){const shape=new THREE.Shape();shape.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)shape.lineTo(points[i][0],points[i][1]);shape.closePath();return shape}
function acAurelianCanonPlate(points,depth,material,name,z=0){
  const geo=new THREE.ExtrudeGeometry(acAurelianCanonShape(points),{depth,steps:1,bevelEnabled:true,bevelSegments:5,bevelSize:.18,bevelThickness:.14,curveSegments:18});geo.computeVertexNormals();
  const mesh=acAurelianCanonExteriorMesh(geo,material,name);mesh.position.z=z;return mesh
}
function acDecorateAurelianCanonExterior(skin,cy,mat){
  if(!skin||skin.userData?.acCanonExteriorApplied)return;
  const structure=skin.getObjectByName?.('AURELIAN_DIRECTOR_HULL_STRUCTURE');if(!structure)return;
  const panels=skin.userData?.acCutawayBayPanels||[];
  const gold=mat(0xb97922,.93,.18,0x4b2600),bright=mat(0xe6b64a,.90,.14,0x6b3700),deep=mat(0x4a2a0b,.95,.29,0x1b0c00),dark=mat(0x100c08,.86,.39),ivory=mat(0xe7d4a3,.75,.22,0x322109),sun=new THREE.MeshStandardMaterial({color:0xffc94a,emissive:0xff7810,emissiveIntensity:2.4,metalness:.50,roughness:.13});
  const kit=new THREE.Group();kit.name='AURELIAN_CANON_EXTERIOR_KIT';kit.userData.acCanonExteriorArt=true;structure.add(kit);

  // Keep the six functional doors, but make them sit behind the armor rather than read as boxes.
  for(const panel of panels){
    if(!panel||panel.userData?.acCanonVisualRecess)return;
    panel.position.z-=.72;panel.userData.acCanonVisualRecess=true;
    panel.traverse(o=>{
      if(!o?.isMesh)return;const n=String(o.name||'');
      if(/AURELIAN_HULL_(?:ARMOR|FACE)|AURELIAN_CURVED_ARMOR_CROWN|AURELIAN_MODULE_RIB|AURELIAN_MODULE_SOLAR_SEAL/.test(n)){
        if(o.material?.clone){o.material=o.material.clone();if(o.material.color)o.material.color.multiplyScalar(.78);if('roughness'in o.material)o.material.roughness=Math.max(.27,o.material.roughness||0)}
        o.scale.z*=.72
      }
    })
  }

  // Replace the giant slab with several overlapping armor masses. These pieces stop
  // before compartment centers, so the bays remain readable and functional.
  const sections=[
    {n:'AURELIAN_CANON_REAR_SHOULDER',p:[[-23.8,cy+5.6],[-18.7,cy+9.0],[-10.8,cy+10.7],[-6.4,cy+8.6],[-9.5,cy+6.2],[-17.4,cy+4.6],[-20.0,cy+.6],[-23.0,cy+.8]],d:1.70,m:deep,z:2.25},
    {n:'AURELIAN_CANON_UPPER_SPINE',p:[[-10.6,cy+10.2],[-3.8,cy+12.3],[5.5,cy+11.7],[14.4,cy+8.2],[10.6,cy+6.9],[4.5,cy+8.1],[-2.6,cy+8.9],[-7.6,cy+8.1]],d:1.42,m:bright,z:2.55},
    {n:'AURELIAN_CANON_FORWARD_SHOULDER',p:[[8.8,cy+7.0],[15.8,cy+7.4],[22.3,cy+4.5],[27.6,cy+.7],[22.0,cy-2.4],[15.2,cy-2.9],[14.4,cy+1.0],[10.2,cy+3.2]],d:1.78,m:gold,z:2.35},
    {n:'AURELIAN_CANON_LOWER_KEEL',p:[[-16.2,cy-7.7],[-8.2,cy-10.5],[2.4,cy-11.7],[12.9,cy-10.0],[17.0,cy-7.0],[11.0,cy-6.7],[4.7,cy-8.0],[-3.4,cy-8.6],[-10.5,cy-7.1]],d:1.55,m:deep,z:2.15},
    {n:'AURELIAN_CANON_FORWARD_LOWER',p:[[7.2,cy-4.8],[15.2,cy-4.7],[21.9,cy-2.8],[24.8,cy-.6],[19.2,cy-5.3],[13.4,cy-7.0],[8.0,cy-6.7]],d:1.10,m:ivory,z:3.05},
    {n:'AURELIAN_CANON_REAR_LOWER',p:[[-22.8,cy-.5],[-19.1,cy-4.5],[-16.8,cy-7.8],[-9.8,cy-7.2],[-7.0,cy-5.2],[-10.3,cy-3.8],[-17.7,cy-2.8]],d:1.42,m:gold,z:2.50}
  ];
  for(const s of sections)kit.add(acAurelianCanonPlate(s.p,s.d,s.m.clone(),s.n,s.z));

  // Dark seams between overlapping armor sections create depth without covering rooms.
  for(const [x,y,w,r] of [[-8.4,cy+8.9,5.8,-.10],[5.0,cy+8.0,6.2,.06],[14.2,cy+4.7,5.2,-.12],[-8.0,cy-7.4,5.8,.08],[6.0,cy-7.6,6.4,-.05]]){
    const seam=acAurelianCanonExteriorMesh(new THREE.BoxGeometry(w,.26,.42),dark.clone(),'AURELIAN_CANON_ARMOR_SEAM');seam.position.set(x,y,7.82);seam.rotation.z=r;kit.add(seam)
  }

  // Permanent rear exhaust cluster. Keep it exposed and in front of nearby hull pieces
  // so the engines remain visible in both closed-hull and cutaway views.
  const exhaustRoot=new THREE.Group();exhaustRoot.name='AURELIAN_CANON_EXHAUST_CLUSTER';exhaustRoot.position.z=7.55;kit.add(exhaustRoot);
  for(const y of[-4.8,0,4.8]){
    const housing=acAurelianCanonExteriorMesh(new THREE.CylinderGeometry(1.25,1.55,4.9,24),dark.clone(),'AURELIAN_CANON_EXHAUST_HOUSING');housing.rotation.z=Math.PI/2;housing.position.set(-22.1,cy+y,0);exhaustRoot.add(housing);
    const collar=acAurelianCanonExteriorMesh(new THREE.CylinderGeometry(1.47,1.47,.48,24),gold.clone(),'AURELIAN_CANON_EXHAUST_COLLAR');collar.rotation.z=Math.PI/2;collar.position.set(-19.85,cy+y,.04);exhaustRoot.add(collar);
    const inner=acAurelianCanonExteriorMesh(new THREE.CylinderGeometry(.82,.98,1.25,20),bright.clone(),'AURELIAN_CANON_EXHAUST_INNER');inner.rotation.z=Math.PI/2;inner.position.set(-24.25,cy+y,.03);exhaustRoot.add(inner);
    const glow=new THREE.Mesh(new THREE.CircleGeometry(.70,28),new THREE.MeshBasicMaterial({color:0xffd06a,transparent:true,opacity:.94}));glow.name='AURELIAN_CANON_EXHAUST_GLOW';glow.position.set(-24.92,cy+y,.03);glow.rotation.y=-Math.PI/2;exhaustRoot.add(glow)
  }
  for(const y of[-2.4,2.4]){
    const pipe=acAurelianCanonExteriorMesh(new THREE.CylinderGeometry(.22,.28,5.7,14),deep.clone(),'AURELIAN_CANON_EXHAUST_PIPE');pipe.rotation.z=Math.PI/2;pipe.position.set(-21.5,cy+y,.22);exhaustRoot.add(pipe)
  }

  // Nose stays pointed, but without special cannon/cockpit dressing in this pass.
  const tip=acAurelianCanonPlate([[18.2,cy+3.8],[24.0,cy+2.7],[29.2,cy+.5],[24.3,cy-1.9],[18.1,cy-3.0],[20.1,cy+.4]],1.18,gold.clone(),'AURELIAN_CANON_NOSE_TIP',3.20);kit.add(tip);
  const tipAccent=acAurelianCanonPlate([[18.8,cy+3.2],[23.5,cy+2.2],[26.3,cy+.8],[22.5,cy+.8]],.54,ivory.clone(),'AURELIAN_CANON_NOSE_ACCENT',4.06);kit.add(tipAccent);
  const noseCore=new THREE.Mesh(new THREE.TorusGeometry(.82,.14,10,36),sun.clone());noseCore.name='AURELIAN_CANON_NOSE_CORE';noseCore.position.set(20.4,cy+.25,7.88);noseCore.scale.y=.72;kit.add(noseCore);

  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='AURELIAN_SIX_BAY_SOLAR_WARSHIP';structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4);
  skin.userData.acCanonExteriorApplied=true;
  diag('AURELIAN CANON EXTERIOR','visualOnly=Y layeredHull=Y giantSlab=REMOVED exhaustCluster=PERSISTENT cockpitSpecialTreatment=OFF cannonSpecialTreatment=OFF roomOwnership=UNCHANGED cutawayPanelsOwnership=UNCHANGED weaponOrigins=UNCHANGED');
}
function buildAurelianDirectorHull(skin,cy,mat){acBuildAurelianDirectorHullBase(skin,cy,mat);acDecorateAurelianCanonExterior(skin,cy,mat)}
`;

  const insertion = 'function addUnifiedExteriorShell(skin,faction,side){';
  if (!patched.includes('function acDecorateAurelianCanonExterior(')) {
    const next = patched.replace(insertion, wrapper + '\n' + insertion);
    status.wrapper = next !== patched;
    patched = next;
  } else status.wrapper = true;

  patched = patched.replace(/MATCH RECORDER v0\.\d+\.\d+/g,'MATCH RECORDER v0.42.5');
  patched = patched.replace(/build=2026-\d{2}-\d{2}_[A-Z0-9_-]+/g,'build=2026-09-07_AURELIAN_LAYERED_HULL_EXHAUST');
  const summary = Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-aurelian-canon-exterior-v0425" name="ac-aurelian-canon-exterior" content="${summary} visualOnly:Y layeredHull:Y giantSlab:REMOVED exhaustCluster:PERSISTENT cockpitSpecialTreatment:OFF cannonSpecialTreatment:OFF combatLifecycle:UNCHANGED roomGeometry:UNCHANGED cutawayPanelsOwnership:UNCHANGED weaponOrigins:UNCHANGED multiplayer:UNCHANGED">\n</head>`);
}
