function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAurelianCanonExteriorRuntime(html) {
  if (html.includes('ac-aurelian-canon-exterior-v0422')) return html;
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
function acAurelianCanonPlate(points,depth,material,name,z=0){
  const shape=new THREE.Shape();shape.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)shape.lineTo(points[i][0],points[i][1]);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSegments:4,bevelSize:.16,bevelThickness:.13,curveSegments:14});geo.computeVertexNormals();
  const mesh=acAurelianCanonExteriorMesh(geo,material,name);mesh.position.z=z;return mesh
}
function acDecorateAurelianCanonExterior(skin,cy,mat){
  if(!skin||skin.userData?.acCanonExteriorApplied)return;
  const structure=skin.getObjectByName?.('AURELIAN_DIRECTOR_HULL_STRUCTURE');
  if(!structure)return;
  const gold=mat(0xb97922,.93,.17,0x4b2600),bright=mat(0xe4b64c,.90,.13,0x6b3700),deep=mat(0x4b2c0c,.94,.27,0x1d0d00),dark=mat(0x120e0a,.84,.35),ivory=mat(0xe8d7aa,.74,.20,0x33220b),black=mat(0x080706,.78,.44),sun=new THREE.MeshStandardMaterial({color:0xffcf50,emissive:0xff7b0d,emissiveIntensity:2.45,metalness:.52,roughness:.12});
  const kit=new THREE.Group();kit.name='AURELIAN_CANON_EXTERIOR_KIT';kit.userData.acCanonExteriorArt=true;structure.add(kit);

  // Long tapered prow. This extends the current right side into a real spacecraft nose
  // without changing any room, hit plane, muzzle, or cutaway panel ownership.
  const prow=acAurelianCanonPlate([[15.3,3.3],[20.9,2.25],[23.7,.35],[20.8,-1.55],[15.1,-3.25],[16.25,-.35]],2.25,gold,'AURELIAN_CANON_PROW',2.05);kit.add(prow);
  const prowTop=acAurelianCanonPlate([[14.6,6.8],[18.7,5.7],[21.4,3.0],[16.3,3.8]],1.15,bright,'AURELIAN_CANON_PROW_TOP',2.65);kit.add(prowTop);
  const prowBottom=acAurelianCanonPlate([[14.0,-6.6],[18.8,-5.3],[21.2,-2.7],[15.6,-3.6]],1.15,ivory,'AURELIAN_CANON_PROW_LOWER',2.55);kit.add(prowBottom);
  const noseRing=new THREE.Mesh(new THREE.TorusGeometry(1.08,.18,12,42),sun.clone());noseRing.name='AURELIAN_CANON_NOSE_REACTOR_RING';noseRing.position.set(18.0,cy+.25,5.45);noseRing.scale.y=.72;kit.add(noseRing);
  const noseCore=new THREE.Mesh(new THREE.CircleGeometry(.63,36),new THREE.MeshBasicMaterial({color:0xffffd6}));noseCore.name='AURELIAN_CANON_NOSE_REACTOR_CORE';noseCore.position.set(18.0,cy+.25,5.49);kit.add(noseCore);

  // Rear engine mass and armored taper. The reference has a substantial drive section,
  // so the ship no longer ends like a cut-off stack of rooms.
  const stern=acAurelianCanonPlate([[-18.0,6.9],[-21.0,5.2],[-22.9,2.2],[-23.4,-2.5],[-21.6,-6.0],[-17.2,-7.4],[-18.4,-3.2],[-18.9,2.8]],2.35,deep,'AURELIAN_CANON_STERN_ARMOR',1.85);kit.add(stern);
  for(const y of[-4.4,0,4.4]){
    const barrel=acAurelianCanonExteriorMesh(new THREE.CylinderGeometry(1.15,1.48,4.25,24),dark.clone(),'AURELIAN_CANON_ENGINE_BARREL');barrel.rotation.z=Math.PI/2;barrel.position.set(-21.1,cy+y,3.15);kit.add(barrel);
    const collar=acAurelianCanonExteriorMesh(new THREE.CylinderGeometry(1.38,1.38,.42,24),gold.clone(),'AURELIAN_CANON_ENGINE_COLLAR');collar.rotation.z=Math.PI/2;collar.position.set(-19.4,cy+y,3.15);kit.add(collar);
    const glow=new THREE.Mesh(new THREE.CircleGeometry(.78,28),new THREE.MeshBasicMaterial({color:0xffc04a,transparent:true,opacity:.92}));glow.name='AURELIAN_CANON_ENGINE_GLOW';glow.position.set(-23.24,cy+y,3.15);glow.rotation.y=-Math.PI/2;kit.add(glow)
  }

  // Dorsal armor and cockpit crown: layered, swept plates instead of a rectangular roof.
  const dorsal=acAurelianCanonPlate([[-14.9,9.0],[-9.8,11.65],[-2.8,12.35],[6.8,11.2],[13.2,8.2],[8.2,8.55],[-1.1,9.75],[-8.8,9.65]],1.35,bright,'AURELIAN_CANON_DORSAL_SPINE',2.10);kit.add(dorsal);
  const dorsalInset=acAurelianCanonPlate([[-9.3,10.55],[-3.1,11.45],[5.6,10.7],[10.0,9.25],[4.0,9.50],[-2.8,10.25]],.62,ivory,'AURELIAN_CANON_DORSAL_IVORY',3.18);kit.add(dorsalInset);
  const cockpitBrow=acAurelianCanonPlate([[-14.0,8.45],[-11.6,10.55],[-5.25,10.30],[-3.9,8.85],[-7.4,8.55]],.72,gold,'AURELIAN_CANON_COCKPIT_BROW',3.36);kit.add(cockpitBrow);

  // Ventral keel around the cannon bay. It frames the cannon like a weapon bay rather
  // than letting the bottom module read as another independent box.
  const keel=acAurelianCanonPlate([[-14.8,-8.35],[-8.3,-10.45],[2.2,-11.25],[11.2,-9.95],[15.0,-7.4],[9.4,-8.15],[1.5,-9.35],[-7.8,-9.15]],1.42,deep,'AURELIAN_CANON_VENTRAL_KEEL',2.08);kit.add(keel);
  const cannonJawTop=acAurelianCanonPlate([[2.7,-4.25],[13.4,-4.75],[16.0,-6.0],[12.8,-5.55],[3.2,-5.2]],.72,ivory,'AURELIAN_CANON_CANNON_JAW_TOP',3.34);kit.add(cannonJawTop);
  const cannonJawBottom=acAurelianCanonPlate([[1.9,-8.65],[12.5,-8.15],[15.3,-7.1],[11.5,-9.15],[3.1,-9.65]],.72,gold,'AURELIAN_CANON_CANNON_JAW_BOTTOM',3.18);kit.add(cannonJawBottom);

  // Structural bridges sit behind the six movable bay panels. They visually connect
  // the modules while leaving the panel groups free to open/close during aiming.
  for(const [x,y,w,h,rz,c] of [
    [-3.0,6.75,8.6,.62,-.04,bright],[-3.6,2.75,8.0,.58,.03,deep],[-3.5,-2.85,7.7,.58,-.03,gold],[-2.8,-6.05,7.5,.62,.05,deep],
    [1.25,7.7,.62,3.2,-.14,ivory],[.65,1.4,.60,3.7,.10,gold],[1.0,-4.15,.62,3.2,-.11,ivory]
  ]){const bridge=acAurelianCanonExteriorMesh(new THREE.BoxGeometry(w,h,.64),c.clone(),'AURELIAN_CANON_MODULE_BRIDGE');bridge.position.set(x,cy+y,3.18);bridge.rotation.z=rz;kit.add(bridge)}

  // Swept side fins / shoulders that create the layered silhouette visible in the canon art.
  for(const [sx,sy,rz] of [[-1,1,-.10],[-1,-1,.10],[1,1,.08],[1,-1,-.08]]){
    const fin=acAurelianCanonExteriorMesh(new THREE.BoxGeometry(6.8,.50,1.05),sx<0?deep.clone():gold.clone(),'AURELIAN_CANON_SWEEP_FIN');
    fin.position.set(sx<0?-15.1:12.2,cy+sy*8.25,2.15);fin.rotation.z=rz;kit.add(fin)
  }

  // Ivory breakup plates mirror the reference without covering the cutaway apertures.
  for(const [x,y,w,h,r] of [[9.9,7.85,3.5,.44,-.10],[12.8,4.9,2.7,.40,-.17],[11.4,-2.55,3.0,.42,.10],[7.2,-9.0,3.8,.45,.06],[-6.0,10.0,3.5,.40,.03]]){
    const plate=acAurelianCanonExteriorMesh(new THREE.BoxGeometry(w,h,.36),ivory.clone(),'AURELIAN_CANON_IVORY_PLATE');plate.position.set(x,cy+y,3.74);plate.rotation.z=r;kit.add(plate)
  }

  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='AURELIAN_SIX_BAY_SOLAR_WARSHIP';structure.userData.acHullRadii=new THREE.Vector3(24.2,12.2,9.2);
  skin.userData.acCanonExteriorApplied=true;
  diag('AURELIAN CANON EXTERIOR','visualOnly=Y gameplayGeometry=UNCHANGED roomOwnership=UNCHANGED cutawayPanels=UNCHANGED weaponOrigins=UNCHANGED silhouette=PROW+STERN+DORSAL+KEEL+BRIDGES cannonBay=PRESERVED');
}
function buildAurelianDirectorHull(skin,cy,mat){
  acBuildAurelianDirectorHullBase(skin,cy,mat);
  acDecorateAurelianCanonExterior(skin,cy,mat)
}
`;

  const insertion = 'function addUnifiedExteriorShell(skin,faction,side){';
  if (!patched.includes('function acDecorateAurelianCanonExterior(')) {
    const next = patched.replace(insertion, wrapper + '\n' + insertion);
    status.wrapper = next !== patched;
    patched = next;
  } else status.wrapper = true;

  patched = patched.replace(/MATCH RECORDER v0\.\d+\.\d+/g,'MATCH RECORDER v0.42.2');
  patched = patched.replace(/build=2026-\d{2}-\d{2}_[A-Z0-9_-]+/g,'build=2026-09-07_AURELIAN_CANON_EXTERIOR_PASS');
  const summary = Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-aurelian-canon-exterior-v0422" name="ac-aurelian-canon-exterior" content="${summary} visualOnly:Y combatLifecycle:UNCHANGED roomGeometry:UNCHANGED cutawayPanels:UNCHANGED weaponOrigins:UNCHANGED multiplayer:UNCHANGED canonSilhouette:PROW_STERN_DORSAL_KEEL cannonBay:PRESERVED">\n</head>`);
}
