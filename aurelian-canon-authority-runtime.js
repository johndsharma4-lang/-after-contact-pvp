function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianCanonAuthorityRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-canon-authority-v0452'))return html;
  if(!html.includes('ac-aurelian-reference-polish-v0450'))return html;

  const authority=String.raw`function acUserCanonShell(kit,m){
  const plate=(name,points,mat,z,depth=.48)=>acHullMesh(kit,acHullExtrude(acHullShape(points),depth,.12),[mat,m.edge],name,0,0,z);

  // USER CANON PROFILE: broad armored carrier, flatter roof, stepped belly, pointed prow.
  // This deliberately abandons the old oval/leaf silhouette.
  plate('AURELIAN_CANON_MAIN_SPINE',[
    [-27.2,3.7],[-24.4,6.5],[-18.6,8.5],[-10.8,9.8],[-1.8,10.0],[7.0,9.4],[13.9,7.7],[19.4,5.4],[23.4,3.0],[27.2,.7],
    [29.0,0],[26.6,-.8],[22.3,-1.6],[17.8,-2.0],[13.4,-2.1],[9.2,-1.7],[4.4,-1.2],[-1.4,-.8],[-7.4,-.9],[-13.8,-1.2],[-20.2,-1.8],[-25.0,-2.7],[-28.0,-2.2]
  ],m.gold,7.36,.72);

  plate('AURELIAN_CANON_UPPER_DECK',[
    [-24.8,5.6],[-20.8,8.2],[-15.3,10.0],[-8.0,11.1],[-.5,11.2],[6.0,10.5],[11.8,8.8],[15.8,7.0],[12.8,6.4],[7.4,7.1],[1.0,7.8],[-6.2,7.9],[-13.1,7.4],[-19.2,6.5]
  ],m.gold,7.72,.54);

  plate('AURELIAN_CANON_UPPER_IVORY_SPINE',[
    [-18.2,8.2],[-12.0,10.1],[-4.8,10.6],[2.2,10.3],[8.5,9.0],[11.5,7.9],[7.1,8.5],[1.4,9.0],[-5.0,9.0],[-11.2,8.7]
  ],m.ivory,8.15,.22);

  plate('AURELIAN_CANON_FOREARMOR',[
    [10.4,6.6],[15.2,5.9],[19.4,4.7],[23.3,2.9],[27.4,.8],[29.2,0],[27.0,-.9],[23.0,-1.8],[19.1,-2.4],[16.9,-1.7],[18.0,.2],[16.5,2.2],[13.5,4.2]
  ],m.gold,8.05,.58);

  plate('AURELIAN_CANON_FORE_IVORY_BROW',[
    [14.2,5.1],[17.9,4.4],[21.3,3.2],[24.0,1.8],[21.4,2.6],[18.5,3.6],[15.5,4.2]
  ],m.ivory,8.42,.20);

  plate('AURELIAN_CANON_LOWER_KEEL',[
    [-25.0,-2.1],[-20.2,-4.4],[-14.0,-5.8],[-7.5,-6.6],[-1.5,-6.8],[3.7,-6.5],[7.5,-5.9],[11.8,-5.2],[16.3,-4.1],[20.3,-2.7],[23.5,-1.5],[21.1,-1.7],[17.4,-2.5],[12.9,-3.3],[8.5,-3.9],[3.7,-4.4],[-1.8,-4.6],[-7.7,-4.4],[-13.8,-4.0],[-19.2,-3.2]
  ],m.goldDark,7.58,.58);

  plate('AURELIAN_CANON_CANNON_POD',[
    [-4.4,-6.0],[1.5,-6.2],[7.7,-6.0],[13.4,-5.1],[17.4,-4.0],[20.0,-3.0],[18.7,-5.2],[15.0,-7.2],[10.0,-8.6],[3.8,-9.3],[-2.8,-9.1],[-8.2,-8.0],[-10.8,-6.8]
  ],m.goldDark,7.94,.46);

  plate('AURELIAN_CANON_CANNON_IVORY_RAIL',[
    [1.0,-7.0],[7.0,-6.8],[12.0,-6.1],[15.8,-5.0],[13.5,-6.5],[9.4,-7.6],[4.1,-8.0],[-.4,-7.8]
  ],m.ivory,8.30,.18);

  // Cockpit is a true raised bubble at the upper-left like the approved reference.
  plate('AURELIAN_CANON_COCKPIT_CRADLE',[
    [-27.0,4.0],[-24.6,6.6],[-20.8,8.3],[-16.4,8.7],[-12.9,7.8],[-11.4,6.3],[-13.8,5.0],[-18.1,4.4],[-22.7,3.8]
  ],m.gold,8.20,.46);
  plate('AURELIAN_CANON_COCKPIT_IVORY_ARCH',[
    [-24.8,5.7],[-22.0,7.4],[-18.5,8.1],[-15.3,7.7],[-13.5,6.7],[-15.6,6.0],[-19.2,5.5],[-22.3,5.1]
  ],m.ivory,8.50,.22);
  plate('AURELIAN_CANON_COCKPIT_GLASS',[
    [-23.7,5.8],[-21.3,7.0],[-18.4,7.5],[-15.9,7.2],[-14.6,6.5],[-16.4,5.9],[-19.3,5.5],[-21.8,5.3]
  ],m.glass,8.72,.10);

  // Large central circular joint from the reference image.
  const hub=acHullMesh(kit,new THREE.CylinderGeometry(1.85,1.85,.34,44),m.gold,'AURELIAN_CANON_CENTRAL_HUB',-.2,.2,8.34);hub.rotation.x=Math.PI/2;
  const ring=acHullMesh(kit,new THREE.TorusGeometry(1.30,.16,12,44),m.ivory,'AURELIAN_CANON_CENTRAL_HUB_RING',-.2,.2,8.56);ring.rotation.x=Math.PI/2;
  const core=acHullMesh(kit,new THREE.CircleGeometry(.55,36),m.sun,'AURELIAN_CANON_CENTRAL_HUB_CORE',-.2,.2,8.68);core.rotation.x=Math.PI/2;

  // Angular framing rails visually connect the six bays into one carrier hull.
  const rails=[
    [[-23.4,3.5],[-13.4,4.6],[-4.2,4.9]],
    [[1.9,5.4],[10.6,5.3],[18.0,3.5]],
    [[-23.1,-2.1],[-13.3,-3.0],[-4.1,-3.5]],
    [[2.0,-3.2],[10.3,-3.6],[17.0,-2.8]]
  ];
  for(let i=0;i<rails.length;i++)for(let j=0;j<rails[i].length-1;j++)acHullPipe(kit,[...rails[i][j],8.48],[...rails[i][j+1],8.48],.11,i%2?m.goldDark:m.gold,'AURELIAN_CANON_FRAME_RAIL_'+i+'_'+j);
}

function buildAurelianDirectorHull(skin,cy,mat){
  if(skin.userData.acCanonExteriorApplied&&skin.userData.acPrimaryHull?.parent===skin)return;
  for(const child of [...skin.children]){child.visible=false;child.userData.acLegacyAurelianHull=true}
  const specs=[
    {name:'PILOT_COCKPIT',x:-8.8,y:7.25,w:7.8,h:5.4,points:[[-3.9,-2.20],[3.85,-2.20],[3.25,2.10],[-2.60,2.62],[-3.95,1.20]]},
    {name:'PORT_UPPER',x:-9.35,y:1.65,w:11.0,h:5.6,points:[[-5.45,-2.50],[4.55,-2.50],[5.45,-1.15],[4.58,2.58],[-4.80,2.48],[-5.60,.55]]},
    {name:'PORT_LOWER',x:-9.00,y:-4.25,w:10.9,h:5.6,points:[[-5.40,-2.42],[4.45,-2.42],[5.45,-1.20],[4.68,2.52],[-5.25,2.52],[-5.78,.66]]},
    {name:'STARBOARD_UPPER',x:7.25,y:4.55,w:13.4,h:5.8,points:[[-6.06,-2.58],[6.60,-2.58],[6.25,2.58],[-4.75,2.52],[-6.20,.38]]},
    {name:'STARBOARD_LOWER',x:7.35,y:-1.20,w:13.2,h:5.5,points:[[-6.00,-2.42],[5.90,-2.28],[6.45,-.72],[6.20,2.48],[-4.80,2.40],[-6.20,.72]]},
    {name:'SOLAR_CANNON_BAY',x:8.30,y:-6.55,w:9.8,h:4.7,points:[[-4.88,-1.92],[4.92,-1.48],[4.24,2.08],[-4.30,2.30]]}
  ];
  const m=acHullMaterials();
  const structure=new THREE.Group();structure.name='AURELIAN_DIRECTOR_HULL_STRUCTURE';structure.userData.acHullRadii=new THREE.Vector3(35.0,13.8,10.4);structure.userData.acSketchSilhouette=true;structure.userData.acContinuousPressureHull=true;structure.userData.acReferenceAuthority='USER_CANON_SHAPE';skin.add(structure);
  const kit=new THREE.Group();kit.name='AURELIAN_CANON_EXTERIOR_KIT';kit.position.y=cy;structure.add(kit);

  acHullMesh(kit,acAurelianRearHullGeometry(),m.dark,'AURELIAN_REAR_HULL_DEPTH',0,0,.18);
  acUserCanonShell(kit,m);

  // Preserve the six physical bay apertures; keep framing narrow so the silhouette dominates.
  for(let i=0;i<specs.length;i++){
    const s=specs[i];
    acHullMesh(kit,acHullRing(s.points,1.020,1.000,.075),m.goldDark,'AURELIAN_CANON_THIN_COLLAR_'+(i+1),s.x,s.y,7.42);
    acHullMesh(kit,acHullRing(s.points,1.010,1.002,.035),m.edge,'AURELIAN_CANON_COLLAR_LIP_'+(i+1),s.x,s.y,7.51);
  }

  // Three stacked aft thrusters, positioned as one integrated engine bank.
  const exhaustRoot=new THREE.Group();exhaustRoot.name='AURELIAN_CANON_EXHAUST_CLUSTER';exhaustRoot.position.z=7.70;kit.add(exhaustRoot);
  for(const y of[-4.9,0,4.9]){
    const housing=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.26,1.58,5.4,32,1,true),m.dark,'AURELIAN_CANON_EXHAUST_HOUSING',-23.0,y,0);housing.rotation.z=Math.PI/2;
    const collar=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.48,1.48,.58,24),m.gold,'AURELIAN_CANON_EXHAUST_COLLAR',-20.4,y,.04);collar.rotation.z=Math.PI/2;
    const inner=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(.82,1.02,1.55,20),m.bronze,'AURELIAN_CANON_EXHAUST_INNER',-25.2,y,.03);inner.rotation.z=Math.PI/2;
    const glow=acHullMesh(exhaustRoot,new THREE.CircleGeometry(.72,28),m.sun,'AURELIAN_CANON_EXHAUST_GLOW',-26.0,y,.03);glow.rotation.y=-Math.PI/2;
    for(const x of[-25.4,-23.1,-20.8]){const hoop=acHullDetail(exhaustRoot,new THREE.TorusGeometry(x===-25.4?1.24:1.42,.10,8,32),m.edge,'AURELIAN_EXHAUST_MACHINED_HOOP',x,y,.02);hoop.rotation.y=Math.PI/2;}
  }

  const panels=[];
  for(let i=0;i<specs.length;i++){
    const s=specs[i],panel=new THREE.Group();panel.name='AURELIAN_HULL_MODULE_'+(i+1)+'_'+s.name;panel.position.set(s.x,cy+s.y,4.78);panel.userData.acCutawayBayPanel=true;panel.userData.acCutawayBayIndex=i;panel.userData.acModuleRole=s.name;
    if(i===0)acHullCockpit(panel,s,m);else if(i===5)acHullCannon(panel,s,m);else acHullDoorArmor(panel,s,m,i+1);
    panel.traverse(o=>{o.userData.acCutawayBayIndex=i;o.userData.acCutawayBayPanelPart=true});skin.add(panel);panels.push(panel);
  }
  acHullPackDetails(skin);
  skin.userData.acSketchHull=true;skin.userData.acPrimaryHull=structure;skin.userData.acCutawayBayPanels=panels;skin.userData.acCutawayBayLayout=specs.map((s,i)=>({index:i,x:s.x,y:cy+s.y,z:4.78,w:s.w,h:s.h,points:s.points.map(p=>p.slice()),role:s.name}));
  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='USER_CANON_AURELIAN_REFERENCE';skin.userData.acCanonExteriorApplied=true;
  diag('AURELIAN CANON SHAPE','build=v0.45.2 profile=BROAD_STEPPED_CARRIER prow=POINTED cockpit=RAISED hub=LARGE panels=6 exhausts=3 combat=UNCHANGED');
}`;

  const patched=replaceFunction(html,'function buildAurelianDirectorHull(skin,cy,mat){','function addUnifiedExteriorShell(skin,faction,side){',authority);
  if(patched===html)return html;
  return patched
    .replace(/MATCH RECORDER v0\.45\.[01]/g,'MATCH RECORDER v0.45.2')
    .replace(/build=2026-09-09_AURELIAN_CANON_(?:MAJOR_REBUILD|AUTHORITY_REBUILD)/g,'build=2026-09-09_AURELIAN_CANON_SHAPE_REBUILD')
    .replace('</head>','<meta id="ac-aurelian-canon-authority-v0452" name="ac-aurelian-canon-authority" content="authority:USER_CANON_SHAPE silhouette:BROAD_STEPPED_CARRIER prow:POINTED cockpit:RAISED hub:LARGE oldOval:REMOVED sixBays:PRESERVED combat:UNCHANGED">\n</head>');
}