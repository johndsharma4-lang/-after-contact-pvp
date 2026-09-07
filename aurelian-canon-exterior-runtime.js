function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchAurelianCanonExteriorRuntime(html) {
  if (html.includes('ac-aurelian-canon-exterior-v0424')) return html;
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
  const outer=[[-24.4,cy-5.1],[-23.0,cy+5.2],[-18.7,cy+9.1],[-11.9,cy+11.9],[-4.0,cy+13.0],[5.9,cy+12.2],[14.1,cy+9.2],[20.7,cy+6.0],[27.2,cy+.9],[22.5,cy-2.8],[17.8,cy-6.8],[11.5,cy-10.3],[2.5,cy-12.0],[-7.5,cy-11.2],[-16.0,cy-9.0],[-22.1,cy-7.2]];
  const shape=acAurelianCanonShape(outer);
  for(const spec of layout||[]){
    const pts=(spec.points||[]).map(([x,y])=>[spec.x+x*1.055,spec.y+y*1.055]);
    if(pts.length<3)continue;
    const hole=new THREE.Path();for(let n=pts.length-1;n>=0;n--){const [x,y]=pts[n];if(n===pts.length-1)hole.moveTo(x,y);else hole.lineTo(x,y)}hole.closePath();shape.holes.push(hole)
  }
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.78,steps:1,bevelEnabled:true,bevelSegments:6,bevelSize:.31,bevelThickness:.22,curveSegments:26});geo.computeVertexNormals();return geo
}
function acDecorateAurelianCanonExterior(skin,cy,mat){
  if(!skin||skin.userData?.acCanonExteriorApplied)return;
  const structure=skin.getObjectByName?.('AURELIAN_DIRECTOR_HULL_STRUCTURE');if(!structure)return;
  const layout=skin.userData?.acCutawayBayLayout||[],panels=skin.userData?.acCutawayBayPanels||[];
  const gold=mat(0xb97922,.93,.17,0x4b2600),bright=mat(0xe7b84f,.90,.13,0x6b3700),deep=mat(0x4b2c0c,.94,.27,0x1d0d00),dark=mat(0x120e0a,.84,.35),ivory=mat(0xe8d7aa,.74,.20,0x33220b),sun=new THREE.MeshStandardMaterial({color:0xffcf50,emissive:0xff7b0d,emissiveIntensity:2.45,metalness:.52,roughness:.12}),glass=new THREE.MeshPhysicalMaterial({color:0x5eb8d7,emissive:0x0b4c6c,emissiveIntensity:1.1,metalness:.30,roughness:.10,transparent:true,opacity:.72,depthWrite:false,side:THREE.DoubleSide});
  const kit=new THREE.Group();kit.name='AURELIAN_CANON_EXTERIOR_KIT';kit.userData.acCanonExteriorArt=true;structure.add(kit);

  // Recess only the dedicated visual door groups. Their visibility/open-close ownership
  // remains unchanged; combat rooms, hit planes and weapon origins are separate objects.
  for(const panel of panels){
    if(!panel||panel.userData?.acCanonVisualRecess)return;
    panel.position.z-=.72;panel.userData.acCanonVisualRecess=true;
    panel.traverse(o=>{
      if(!o?.isMesh)return;const n=String(o.name||'');
      if(/AURELIAN_HULL_(?:ARMOR|FACE)|AURELIAN_CURVED_ARMOR_CROWN|AURELIAN_MODULE_RIB|AURELIAN_MODULE_SOLAR_SEAL/.test(n)){
        if(o.material?.clone){o.material=o.material.clone();if(o.material.color)o.material.color.multiplyScalar(.76);if('roughness'in o.material)o.material.roughness=Math.max(.26,o.material.roughness||0)}
        o.scale.z*=.74
      }
    })
  }

  if(layout.length===6){
    const frame=acAurelianCanonExteriorMesh(acAurelianCanonFrameGeometry(layout,cy),gold.clone(),'AURELIAN_CANON_CONTINUOUS_FUSELAGE');frame.position.z=7.10;kit.add(frame);
    const trim=acAurelianCanonExteriorMesh(acAurelianCanonFrameGeometry(layout,cy),bright.clone(),'AURELIAN_CANON_FUSELAGE_EDGE_TRIM');trim.scale.set(.994,.985,1);trim.position.z=7.52;trim.material.transparent=true;trim.material.opacity=.48;trim.material.depthWrite=false;kit.add(trim)
  }

  // Elongated pilot canopy drawn across the cockpit bay, replacing the porthole read.
  const canopyPts=[[-13.8,cy+8.45],[-11.2,cy+10.35],[-7.0,cy+10.25],[-4.75,cy+8.55],[-6.2,cy+7.55],[-11.7,cy+7.55]];
  const canopy=acAurelianCanonPlate(canopyPts,.16,glass,'AURELIAN_CANON_PILOT_CANOPY',7.92);canopy.renderOrder=30;kit.add(canopy);
  const canopyBrow=acAurelianCanonPlate([[-14.2,cy+8.3],[-11.3,cy+10.75],[-6.75,cy+10.65],[-4.2,cy+8.45],[-5.2,cy+8.1],[-7.1,cy+9.85],[-11.0,cy+9.95],[-13.2,cy+8.05]],.38,ivory,'AURELIAN_CANON_CANOPY_BROW',7.76);kit.add(canopyBrow);

  // Long pointed prow, substantially more tapered than the previous box-ending nose.
  kit.add(acAurelianCanonPlate([[14.7,cy+6.9],[20.8,cy+5.5],[28.7,cy+.8],[21.4,cy-2.3],[14.8,cy-3.8],[17.6,cy+.35]],2.25,gold,'AURELIAN_CANON_PROW',2.00));
  kit.add(acAurelianCanonPlate([[13.9,cy+8.5],[20.0,cy+6.6],[24.5,cy+3.9],[16.0,cy+5.2]],1.0,bright,'AURELIAN_CANON_PROW_TOP',2.80));
  kit.add(acAurelianCanonPlate([[13.7,cy-6.6],[20.7,cy-4.9],[23.8,cy-2.7],[15.8,cy-3.9]],1.0,ivory,'AURELIAN_CANON_PROW_LOWER',2.70));
  const noseRing=new THREE.Mesh(new THREE.TorusGeometry(1.12,.18,12,42),sun.clone());noseRing.name='AURELIAN_CANON_NOSE_REACTOR_RING';noseRing.position.set(20.2,cy+.45,7.92);noseRing.scale.y=.72;kit.add(noseRing);

  // Rear drive block: broader but visually tapered into the fuselage.
  kit.add(acAurelianCanonPlate([[-18.0,cy+7.8],[-22.5,cy+6.2],[-25.2,cy+2.8],[-25.4,cy-3.2],[-22.5,cy-6.9],[-17.3,cy-8.2],[-18.8,cy-3.6],[-19.0,cy+3.2]],2.35,deep,'AURELIAN_CANON_STERN_ARMOR',1.85));
  for(const y of[-4.7,0,4.7]){
    const barrel=acAurelianCanonExteriorMesh(new THREE.CylinderGeometry(1.18,1.52,4.7,24),dark.clone(),'AURELIAN_CANON_ENGINE_BARREL');barrel.rotation.z=Math.PI/2;barrel.position.set(-22.2,cy+y,3.15);kit.add(barrel);
    const collar=acAurelianCanonExteriorMesh(new THREE.CylinderGeometry(1.42,1.42,.45,24),gold.clone(),'AURELIAN_CANON_ENGINE_COLLAR');collar.rotation.z=Math.PI/2;collar.position.set(-20.0,cy+y,3.15);kit.add(collar)
  }

  // Swept top spine and ventral keel make the ship read as one continuous craft.
  kit.add(acAurelianCanonPlate([[-15.5,cy+9.2],[-9.8,cy+12.0],[-2.8,cy+13.0],[7.3,cy+11.9],[14.8,cy+8.6],[8.1,cy+9.15],[-1.2,cy+10.35],[-8.8,cy+10.15]],1.35,bright,'AURELIAN_CANON_DORSAL_SPINE',2.10));
  kit.add(acAurelianCanonPlate([[-9.5,cy+10.9],[-2.8,cy+11.85],[6.2,cy+11.05],[11.0,cy+9.55],[4.0,cy+9.90],[-2.8,cy+10.65]],.58,ivory,'AURELIAN_CANON_DORSAL_IVORY',3.18));
  kit.add(acAurelianCanonPlate([[-15.4,cy-8.7],[-8.6,cy-10.9],[2.7,cy-12.05],[12.2,cy-10.4],[16.3,cy-7.35],[9.5,cy-8.35],[1.5,cy-9.75],[-7.8,cy-9.5]],1.42,deep,'AURELIAN_CANON_VENTRAL_KEEL',2.08));

  // Existing cannon remains the cannon. These pieces only make it look hull-integrated.
  kit.add(acAurelianCanonPlate([[2.3,cy-4.15],[14.3,cy-4.6],[17.2,cy-5.95],[13.0,cy-5.55],[3.0,cy-5.12]],.72,ivory,'AURELIAN_CANON_CANNON_JAW_TOP',3.34));
  kit.add(acAurelianCanonPlate([[1.6,cy-9.0],[13.2,cy-8.35],[16.5,cy-7.0],[11.9,cy-9.45],[2.9,cy-10.0]],.72,gold,'AURELIAN_CANON_CANNON_JAW_BOTTOM',3.18));

  for(const [x,y,w,r,c] of [[-4.8,cy+8.45,7.0,-.04,ivory],[5.5,cy+8.95,6.5,.03,gold],[-5.2,cy-8.1,6.7,.03,deep],[6.1,cy-8.35,7.0,-.04,ivory]]){
    const rail=acAurelianCanonExteriorMesh(new THREE.BoxGeometry(w,.42,.40),c.clone(),'AURELIAN_CANON_LONGITUDINAL_RAIL');rail.position.set(x,y,7.94);rail.rotation.z=r;kit.add(rail)
  }

  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='AURELIAN_SIX_BAY_SOLAR_WARSHIP';structure.userData.acHullRadii=new THREE.Vector3(28.8,13.1,9.3);
  skin.userData.acCanonExteriorApplied=true;
  diag('AURELIAN CANON EXTERIOR','visualOnly=Y continuousFuselage=Y doorsRecessed=Y canopy=ELONGATED apertures=6 gameplayGeometry=UNCHANGED roomOwnership=UNCHANGED cutawayPanelsOwnership=UNCHANGED weaponOrigins=UNCHANGED cannonBay=PRESERVED');
}
function buildAurelianDirectorHull(skin,cy,mat){acBuildAurelianDirectorHullBase(skin,cy,mat);acDecorateAurelianCanonExterior(skin,cy,mat)}
`;

  const insertion = 'function addUnifiedExteriorShell(skin,faction,side){';
  if (!patched.includes('function acDecorateAurelianCanonExterior(')) {
    const next = patched.replace(insertion, wrapper + '\n' + insertion);
    status.wrapper = next !== patched;
    patched = next;
  } else status.wrapper = true;

  patched = patched.replace(/MATCH RECORDER v0\.\d+\.\d+/g,'MATCH RECORDER v0.42.4');
  patched = patched.replace(/build=2026-\d{2}-\d{2}_[A-Z0-9_-]+/g,'build=2026-09-07_AURELIAN_RECESSED_CANON_FUSELAGE');
  const summary = Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta id="ac-aurelian-canon-exterior-v0424" name="ac-aurelian-canon-exterior" content="${summary} visualOnly:Y continuousFuselage:Y doorsRecessed:Y elongatedCanopy:Y sixApertures:Y combatLifecycle:UNCHANGED roomGeometry:UNCHANGED cutawayPanelsOwnership:UNCHANGED weaponOrigins:UNCHANGED multiplayer:UNCHANGED cannonBay:PRESERVED">\n</head>`);
}
