function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianCanonAuthorityRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-canon-authority-v0451'))return html;
  if(!html.includes('ac-aurelian-reference-polish-v0450'))return html;

  const builder=String.raw`function buildAurelianDirectorHull(skin,cy,mat){
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
  const structure=new THREE.Group();structure.name='AURELIAN_DIRECTOR_HULL_STRUCTURE';structure.userData.acHullRadii=new THREE.Vector3(34.4,13.4,10.1);structure.userData.acSketchSilhouette=true;structure.userData.acContinuousPressureHull=true;structure.userData.acSegmentedFrontArchitecture=true;structure.userData.acReferenceAuthority='USER_CANON';skin.add(structure);
  const kit=new THREE.Group();kit.name='AURELIAN_CANON_EXTERIOR_KIT';kit.position.y=cy;structure.add(kit);

  // Sole exterior authority: user-approved reference silhouette. The old fitted plate
  // stack is deliberately not built, so it cannot visually overpower the new shell.
  acHullMesh(kit,acAurelianRearHullGeometry(),m.dark,'AURELIAN_REAR_HULL_DEPTH',0,0,.18);
  acHullReferenceSilhouette(kit,m);

  // Keep six physical openings for cutaway mechanics, but make their collars visually thin.
  for(let i=0;i<specs.length;i++){
    const s=specs[i];
    acHullMesh(kit,acHullRing(s.points,1.030,.996,.10),m.goldDark,'AURELIAN_CANON_THIN_COLLAR_'+(i+1),s.x,s.y,7.38);
    acHullMesh(kit,acHullRing(s.points,1.012,1.002,.045),m.edge,'AURELIAN_CANON_COLLAR_LIP_'+(i+1),s.x,s.y,7.51);
  }

  // Preserve the three long rear exhausts from the approved reference.
  const exhaustRoot=new THREE.Group();exhaustRoot.name='AURELIAN_CANON_EXHAUST_CLUSTER';exhaustRoot.position.z=7.70;kit.add(exhaustRoot);
  for(const y of[-4.8,0,4.8]){
    const housing=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.22,1.50,5.20,32,1,true),m.dark,'AURELIAN_CANON_EXHAUST_HOUSING',-22.4,y,0);housing.rotation.z=Math.PI/2;
    const collar=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.43,1.43,.52,24),m.gold,'AURELIAN_CANON_EXHAUST_COLLAR',-19.95,y,.04);collar.rotation.z=Math.PI/2;
    const inner=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(.80,.96,1.42,20),m.bronze,'AURELIAN_CANON_EXHAUST_INNER',-24.55,y,.03);inner.rotation.z=Math.PI/2;
    const glow=acHullMesh(exhaustRoot,new THREE.CircleGeometry(.68,28),m.sun,'AURELIAN_CANON_EXHAUST_GLOW',-25.28,y,.03);glow.rotation.y=-Math.PI/2;
    for(const x of[-24.78,-22.55,-20.45]){const hoop=acHullDetail(exhaustRoot,new THREE.TorusGeometry(x===-24.78?1.21:1.38,.10,8,32),m.edge,'AURELIAN_EXHAUST_MACHINED_HOOP',x,y,.02);hoop.rotation.y=Math.PI/2;}
    for(const dz of[-.66,.66])acHullPipe(exhaustRoot,[-23.9,y+dz,.94],[-20.75,y+dz,1.13],.060,m.gold,'AURELIAN_EXHAUST_LONGITUDINAL_RIB');
  }
  for(const y of[-2.4,2.4]){const pipe=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(.20,.26,5.9,14),m.bronze,'AURELIAN_CANON_EXHAUST_PIPE',-21.8,y,.22);pipe.rotation.z=Math.PI/2}

  const panels=[];
  for(let i=0;i<specs.length;i++){
    const s=specs[i],panel=new THREE.Group();panel.name='AURELIAN_HULL_MODULE_'+(i+1)+'_'+s.name;panel.position.set(s.x,cy+s.y,4.78);panel.userData.acCutawayBayPanel=true;panel.userData.acCutawayBayIndex=i;panel.userData.acModuleRole=s.name;
    if(i===0)acHullCockpit(panel,s,m);
    else if(i===5)acHullCannon(panel,s,m);
    else acHullDoorArmor(panel,s,m,i+1);
    panel.traverse(o=>{o.userData.acCutawayBayIndex=i;o.userData.acCutawayBayPanelPart=true});skin.add(panel);panels.push(panel);
  }
  acHullPackDetails(skin);
  skin.userData.acSketchHull=true;skin.userData.acPrimaryHull=structure;skin.userData.acCutawayBayPanels=panels;skin.userData.acCutawayBayLayout=specs.map((s,i)=>({index:i,x:s.x,y:cy+s.y,z:4.78,w:s.w,h:s.h,points:s.points.map(p=>p.slice()),role:s.name}));
  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='USER_CANON_AURELIAN_REFERENCE';skin.userData.acCanonExteriorApplied=true;
  diag('AURELIAN REFERENCE AUTHORITY','build=v0.45.1 authority=USER_CANON oldFittedArmor=REMOVED panels=6 apertures=6 exhausts=3 combat=UNCHANGED');
}`;

  const patched=replaceFunction(html,'function buildAurelianDirectorHull(skin,cy,mat){','function addUnifiedExteriorShell(skin,faction,side){',builder);
  if(patched===html)return html;
  return patched.replace(/MATCH RECORDER v0\.45\.0/g,'MATCH RECORDER v0.45.1').replace(/build=2026-09-09_AURELIAN_CANON_MAJOR_REBUILD/g,'build=2026-09-09_AURELIAN_CANON_AUTHORITY_REBUILD').replace('</head>','<meta id="ac-aurelian-canon-authority-v0451" name="ac-aurelian-canon-authority" content="authority:USER_CANON_ONLY oldFittedArmor:REMOVED sixBays:PRESERVED exhausts:PRESERVED combat:UNCHANGED">\n</head>');
}