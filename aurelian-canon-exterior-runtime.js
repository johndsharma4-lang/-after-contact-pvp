function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAurelianCanonExteriorRuntime(html) {
  if (html.includes('ac-aurelian-canon-exterior-v0423')) return html;
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
  const geo=new THREE.ExtrudeGeometry(acAurelianCanonShape(points),{depth,steps:1,bevelEnabled:true,bevelSegments:4,bevelSize:.16,bevelThickness:.13,curveSegments:14});geo.computeVertexNormals();
  const mesh=acAurelianCanonExteriorMesh(geo,material,name);mesh.position.z=z;return mesh
}
function acAurelianCanonFrameGeometry(layout,cy){
  // One shallow sculpted fuselage skin with six real apertures. The functional bay
  // panels remain underneath and continue to own opening/closing and combat state.
  const outer=[[-23.7,cy-4.8],[-22.4,cy+4.9],[-18.4,cy+8.7],[-11.8,cy+11.5],[-4.1,cy+12.5],[5.5,cy+11.8],[13.6,cy+9.0],[19.7,cy+6.1],[24.9,cy+1.0],[21.9,cy-2.5],[17.1,cy-6.5],[11.0,cy-9.9],[2.4,cy-11.6],[-7.2,cy-10.9],[-15.6,cy-8.8],[-21.5,cy-7.0]];
  const shape=acAurelianCanonShape(outer);
  for(const spec of layout||[]){
    const pts=(spec.points||[]).map(([x,y])=>[spec.x+x*1.045,spec.y+y*1.045]);
    if(pts.length<3)continue;
    const hole=new THREE.Path();for(let n=pts.length-1;n>=0;n--){const [x,y]=pts[n];if(n===pts.length-1)hole.moveTo(x,y);else hole.lineTo(x,y)}hole.closePath();shape.holes.push(hole)
  }
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.62,steps:1,bevelEnabled:true,bevelSegments:5,bevelSize:.25,bevelThickness:.18,curveSegments:22});geo.computeVertexNormals();return geo
}
function acDecorateAurelianCanonExterior(skin,cy,mat){
  if(!skin||skin.userData?.acCanonExteriorApplied)return;
  const structure=skin.getObjectByName?.('AURELIAN_DIRECTOR_HULL_STRUCTURE');if(!structure)return;
  const layout=skin.userData?.acCutawayBayLayout||[];
  const gold=mat(0xb97922,.93,.17,0x4b2600),bright=mat(0xe7b84f,.90,.13,0x6b3700),deep=mat(0x4b2c0c,.94,.27,0x1d0d00),dark=mat(0x120e0a,.84,.35),ivory=mat(0xe8d7aa,.74,.20,0x33220b),sun=new THREE.MeshStandardMaterial({color:0xffcf50,emissive:0xff7b0d,emissiveIntensity:2.45,metalness:.52,roughness:.12});
  const kit=new THREE.Group();kit.name='AURELIAN_CANON_EXTERIOR_KIT';kit.userData.acCanonExteriorArt=true;structure.add(kit);

  // The key fidelity change: the six doors are now visually recessed into one ship.
  if(layout.length===6){
    const frame=acAurelianCanonExteriorMesh(acAurelianCanonFrameGeometry(layout,cy),gold.clone(),'AURELIAN_CANON_CONTINUOUS_FUSELAGE');frame.position.z=7.04;kit.add(frame);
    const trim=acAurelianCanonExteriorMesh(acAurelianCanonFrameGeometry(layout,cy),bright.clone(),'AURELIAN_CANON_FUSELAGE_EDGE_TRIM');trim.scale.set(.994,.985,1);trim.position.z=7.37;trim.material.transparent=true;trim.material.opacity=.58;trim.material.depthWrite=false;kit.add(trim)
  }

  // Long pointed prow and layered shoulder armor.
  kit.add(acAurelianCanonPlate([[15.0,cy+6.7],[20.1,cy+5.7],[25.8,cy+1.0],[21.1,cy-2.0],[15.0,cy-3.7],[17.1,cy+.5]],2.15,gold,'AURELIAN_CANON_PROW',2.00));
  kit.add(acAurelianCanonPlate([[13.8,cy+8.4],[19.2,cy+6.5],[22.3,cy+3.7],[16.0,cy+5.1]],1.0,bright,'AURELIAN_CANON_PROW_TOP',2.75));
  kit.add(acAurelianCanonPlate([[13.7,cy-6.4],[20.0,cy-4.8],[22.0,cy-2.5],[15.7,cy-3.8]],1.0,ivory,'AURELIAN_CANON_PROW_LOWER',2.65));
  const noseRing=new THREE.Mesh(new THREE.TorusGeometry(1.12,.18,12,42),sun.clone());noseRing.name='AURELIAN_CANON_NOSE_REACTOR_RING';noseRing.position.set(19.0,cy+.55,7.84);noseRing.scale.y=.72;kit.add(noseRing);

  // Rear drive block has enough mass to balance the long nose, matching the reference.
  kit.add(acAurelianCanonPlate([[-18.0,cy+7.6],[-22.1,cy+6.0],[-24.3,cy+2.6],[-24.7,cy-3.0],[-22.2,cy-6.7],[-17.3,cy-8.0],[-18.7,cy-3.4],[-19.0,cy+3.0]],2.35,deep,'AURELIAN_CANON_STERN_ARMOR',1.85));
  for(const y of[-4.6,0,4.6]){
    const barrel=acAurelianCanonExteriorMesh(new THREE.CylinderGeometry(1.18,1.52,4.5,24),dark.clone(),'AURELIAN_CANON_ENGINE_BARREL');barrel.rotation.z=Math.PI/2;barrel.position.set(-21.8,cy+y,3.15);kit.add(barrel);
    const collar=acAurelianCanonExteriorMesh(new THREE.CylinderGeometry(1.42,1.42,.45,24),gold.clone(),'AURELIAN_CANON_ENGINE_COLLAR');collar.rotation.z=Math.PI/2;collar.position.set(-19.8,cy+y,3.15);kit.add(collar)
  }

  // Swept top spine and ventral keel are deliberately longer than the room stack.
  kit.add(acAurelianCanonPlate([[-15.2,cy+9.1],[-9.8,cy+11.7],[-2.8,cy+12.6],[6.9,cy+11.6],[14.2,cy+8.5],[8.0,cy+9.0],[-1.2,cy+10.1],[-8.8,cy+9.9]],1.35,bright,'AURELIAN_CANON_DORSAL_SPINE',2.10));
  kit.add(acAurelianCanonPlate([[-9.4,cy+10.7],[-2.8,cy+11.6],[5.8,cy+10.9],[10.6,cy+9.45],[4.0,cy+9.75],[-2.8,cy+10.45]],.58,ivory,'AURELIAN_CANON_DORSAL_IVORY',3.18));
  kit.add(acAurelianCanonPlate([[-15.1,cy-8.5],[-8.5,cy-10.6],[2.5,cy-11.7],[11.8,cy-10.1],[15.8,cy-7.3],[9.4,cy-8.2],[1.5,cy-9.55],[-7.8,cy-9.3]],1.42,deep,'AURELIAN_CANON_VENTRAL_KEEL',2.08));

  // Cannon bay jaws frame the existing cannon instead of replacing it.
  kit.add(acAurelianCanonPlate([[2.4,cy-4.2],[13.9,cy-4.6],[16.7,cy-5.9],[12.9,cy-5.5],[3.0,cy-5.15]],.72,ivory,'AURELIAN_CANON_CANNON_JAW_TOP',3.34));
  kit.add(acAurelianCanonPlate([[1.7,cy-8.8],[12.9,cy-8.25],[16.0,cy-7.0],[11.8,cy-9.25],[3.0,cy-9.8]],.72,gold,'AURELIAN_CANON_CANNON_JAW_BOTTOM',3.18));

  // A few shallow rails break the rectangular module rhythm while staying outside apertures.
  for(const [x,y,w,r,c] of [[-4.8,cy+8.4,7.0,-.04,ivory],[5.4,cy+8.8,6.3,.03,gold],[-5.2,cy-8.0,6.6,.03,deep],[6.0,cy-8.2,6.8,-.04,ivory]]){
    const rail=acAurelianCanonExteriorMesh(new THREE.BoxGeometry(w,.42,.40),c.clone(),'AURELIAN_CANON_LONGITUDINAL_RAIL');rail.position.set(x,y,7.82);rail.rotation.z=r;kit.add(rail)
  }

  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='AURELIAN_SIX_BAY_SOLAR_WARSHIP';structure.userData.acHullRadii=new THREE.Vector3(25.8,12.8,9.2);
  skin.userData.acCanonExteriorApplied=true;
  diag('AURELIAN CANON EXTERIOR','visualOnly=Y continuousFuselage=Y apertures=6 gameplayGeometry=UNCHANGED roomOwnership=UNCHANGED cutawayPanels=UNCHANGED weaponOrigins=UNCHANGED cannonBay=PRESERVED');
}
function buildAurelianDirectorHull(skin,cy,mat){acBuildAurelianDirectorHullBase(skin,cy,mat);acDecorateAurelianCanonExterior(skin,cy,mat)}
`;

  const insertion = 'function addUnifiedExteriorShell(skin,faction,side){';
  if (!patched.includes('function acDecorateAurelianCanonExterior(')) {
    const next = patched.replace(insertion, wrapper + '\n' + insertion);
    status.wrapper = next !== patched;
    patched = next;
  } else status.wrapper = true;

  patched = patched.replace(/MATCH RECORDER v0\.\d+\.\d+/g,'MATCH RECORDER v0.42.3');
  patched = patched.replace(/build=2026-\d{2}-\d{2}_[A-Z0-9_-]+/g,'build=2026-09-07_AURELIAN_CANON_CONTINUOUS_FUSELAGE');
  const summary = Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-aurelian-canon-exterior-v0423" name="ac-aurelian-canon-exterior" content="${summary} visualOnly:Y continuousFuselage:Y sixApertures:Y combatLifecycle:UNCHANGED roomGeometry:UNCHANGED cutawayPanels:UNCHANGED weaponOrigins:UNCHANGED multiplayer:UNCHANGED cannonBay:PRESERVED">\n</head>`);
}
