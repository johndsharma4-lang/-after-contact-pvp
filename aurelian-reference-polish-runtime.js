function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0450'))return html;
  if(!html.includes('ac-aurelian-canon-exterior-v0428'))return html;
  let patched=html;

  const materials=String.raw`function acHullMaterials(){
  const t=acHullFinishResources();
  const metal=(color,roughness=.18,metalness=.97)=>new THREE.MeshStandardMaterial({color,metalness,roughness,map:t.map,roughnessMap:t.roughness,envMap:t.env,envMapIntensity:1.58});
  return {
    gold:metal(0xe8bb55,.12),
    goldDark:metal(0x8d5a22,.20),
    edge:metal(0xffe2a0,.08),
    bronze:metal(0x5a3518,.24),
    dark:metal(0x111111,.31,.88),
    ivory:metal(0xf0e3bf,.14,.82),
    ivoryDark:metal(0xbda77d,.20,.78),
    sun:new THREE.MeshStandardMaterial({color:0xffc347,emissive:0xff9812,emissiveIntensity:2.6,metalness:.54,roughness:.13,envMap:t.env}),
    hot:new THREE.MeshBasicMaterial({color:0xffefc1}),
    blue:new THREE.MeshBasicMaterial({color:0x79dcf2}),
    glass:new THREE.MeshPhysicalMaterial({color:0x375d68,metalness:.08,roughness:.035,clearcoat:1,clearcoatRoughness:.025,envMap:t.env,envMapIntensity:1.35,transparent:true,opacity:.50,depthWrite:false,side:THREE.DoubleSide}),
    trimLine:new THREE.LineBasicMaterial({color:0xf7e5bb}),
    glassLine:new THREE.LineBasicMaterial({color:0xd7f1f3,transparent:true,opacity:.65}),
    seamLine:new THREE.LineBasicMaterial({color:0x2a1b0c})
  };
}`;
  const afterMaterials=replaceFunction(patched,'function acHullMaterials(){','function acHullDetail(',materials);if(afterMaterials===patched)return html;patched=afterMaterials;

  const doorArmor=String.raw`function acHullDoorArmor(panel,s,m,index){
  const w=s.w,h=s.h;
  const body=[[-w*.58,-h*.34],[w*.22,-h*.33],[w*.48,-h*.15],[w*.48,h*.15],[w*.24,h*.33],[-w*.56,h*.32],[-w*.64,h*.10],[-w*.64,-h*.10]];
  const inner=body.map(([x,y])=>[x*.985,y*.965]);
  acHullMesh(panel,acHullExtrude(acHullShape(body),.30,.08),[m.gold,m.edge],'AURELIAN_CANON_BAY_SKIN_'+index,0,0,2.48);
  acHullMesh(panel,acHullExtrude(acHullShape(inner),.12,.04),[m.gold,m.goldDark],'AURELIAN_CANON_BAY_SKIN_FACE_'+index,0,0,2.80);

  const upper=[[-w*.58,h*.10],[-w*.27,h*.26],[w*.23,h*.29],[w*.44,h*.17],[w*.15,h*.10],[-w*.36,h*.08]];
  const lower=[[-w*.55,-h*.29],[w*.22,-h*.28],[w*.43,-h*.14],[w*.13,-h*.08],[-w*.32,-h*.11]];
  acHullMesh(panel,acHullExtrude(acHullShape(upper),.12,.04),[index===0?m.ivory:m.gold,m.edge],'AURELIAN_CANON_BAY_FLOW_UPPER_'+index,0,0,3.00);
  acHullMesh(panel,acHullExtrude(acHullShape(lower),.12,.04),[m.goldDark,m.gold],'AURELIAN_CANON_BAY_FLOW_LOWER_'+index,0,0,3.02);

  if(index===0){
    const canopy=[[-w*.50,-h*.01],[w*.10,-h*.11],[w*.42,h*.01],[w*.29,h*.28],[-w*.28,h*.31],[-w*.52,h*.16]];
    acHullMesh(panel,acHullExtrude(acHullShape(canopy),.08,.025),[m.glass,m.edge],'AURELIAN_CANON_COCKPIT_CANOPY',0,0,3.16);
  }else{
    const seam=[[-w*.18,-h*.010],[w*.18,-h*.010],[w*.22,0],[w*.18,h*.010],[-w*.18,h*.010],[-w*.22,0]];
    acHullMesh(panel,acHullExtrude(acHullShape(seam),.018,.008),m.goldDark,'AURELIAN_CANON_BAY_SUBTLE_SEAM_'+index,0,0,3.10);
  }
}`;
  const afterDoor=replaceFunction(patched,'function acHullDoorArmor(panel,s,m,index){','function acHullMesh(',doorArmor);if(afterDoor===patched)return html;patched=afterDoor;

  const cannon=String.raw`function acHullCannon(panel,s,m){
  const cannon=new THREE.Group();cannon.name='AURELIAN_CANON_SOLAR_CANNON_ART';cannon.position.z=3.18;panel.add(cannon);
  const shell=[[-5.20,-1.50],[3.95,-1.34],[4.90,-.52],[4.55,1.45],[-4.20,1.76],[-5.25,.65]];
  acHullMesh(cannon,acHullExtrude(acHullShape(shell),.27,.08),[m.goldDark,m.gold],'AURELIAN_CANNON_EXPOSED_HOUSING',0,0,-.20);
  const inner=shell.map(([x,y])=>[x*.91,y*.70]);
  acHullMesh(cannon,acHullExtrude(acHullShape(inner),.10,.04),m.dark,'AURELIAN_CANNON_EXPOSED_RECESS',0,0,.10);
  const cyl=(r1,r2,len,mat,name,x,y=0,z=.30)=>{const o=acHullMesh(cannon,new THREE.CylinderGeometry(r1,r2,len,24),mat,name,x,y,z);o.rotation.z=-Math.PI/2;return o};
  cyl(1.02,1.18,1.70,m.bronze,'AURELIAN_CANNON_BREECH',-2.72,0,.31);
  acHullMesh(cannon,new THREE.SphereGeometry(.80,22,16),m.sun,'AURELIAN_CANNON_CHAMBER',-1.74,0,.42);
  for(const r of[.92,1.16]){const ring=acHullMesh(cannon,new THREE.TorusGeometry(r,.09,10,34),r>1?m.edge:m.sun,'AURELIAN_CANNON_CHAMBER_RING',-1.84,0,.43);ring.rotation.y=Math.PI/2;}
  cyl(.34,.49,5.30,m.dark,'AURELIAN_CANNON_BARREL',1.18,0,.31);
  cyl(.14,.14,4.35,m.sun,'AURELIAN_CANNON_CONTAINED_ENERGY',1.08,0,.36);
  for(const x of[-.55,.68,1.92,3.10]){cyl(.58,.58,.25,m.gold,'AURELIAN_CANNON_COIL',x,0,.32);const halo=acHullMesh(cannon,new THREE.TorusGeometry(.61,.055,8,30),m.sun,'AURELIAN_CANNON_CONTAINMENT_RING',x+.10,0,.34);halo.rotation.y=Math.PI/2;}
  cyl(.74,.53,.92,m.bronze,'AURELIAN_CANNON_MUZZLE',4.23,0,.32);
  cyl(.59,.59,.20,m.edge,'AURELIAN_CANNON_MUZZLE_RIM',4.72,0,.32);
  const core=acHullMesh(cannon,new THREE.CircleGeometry(.39,28),m.hot,'AURELIAN_CANNON_MUZZLE_CORE',4.84,0,.32);core.rotation.y=Math.PI/2;
  for(const sy of[-1,1]){const rail=acHullMesh(cannon,new THREE.BoxGeometry(6.40,.12,.18),m.ivory,'AURELIAN_CANNON_SUPPORT_RAIL',.35,sy*.70,.44);rail.rotation.z=sy*.015;const shroud=acHullMesh(cannon,new THREE.BoxGeometry(5.65,.24,.24),m.gold,'AURELIAN_CANNON_ARMOR_SHROUD',.20,sy*1.05,.20);shroud.rotation.z=sy*.025;}
}`;
  const afterCannon=replaceFunction(patched,'function acHullCannon(panel,s,m){','function buildAurelianDirectorHull(',cannon);if(afterCannon===patched)return html;patched=afterCannon;

  const silhouette=String.raw`function acHullReferenceSilhouette(kit,m){
  const plates=[
    {n:'AURELIAN_CANON_DORSAL_MAIN',mat:m.gold,z:7.48,d:.68,p:[[-28.2,4.1],[-25.7,6.2],[-21.1,8.2],[-15.2,9.8],[-8.3,10.9],[-1.2,11.25],[5.8,10.6],[11.8,8.9],[16.6,6.8],[20.2,4.7],[23.1,2.8],[25.6,1.0],[26.2,.25],[23.1,1.0],[19.2,2.8],[14.5,4.5],[8.8,5.7],[2.4,6.4],[-4.3,6.6],[-11.4,6.4],[-17.8,5.9],[-23.4,5.0]]},
    {n:'AURELIAN_CANON_VENTRAL_MAIN',mat:m.gold,z:7.20,d:.68,p:[[-28.0,-4.2],[-24.5,-5.9],[-19.5,-7.5],[-13.2,-8.7],[-6.0,-9.4],[1.5,-9.6],[8.3,-8.8],[14.2,-7.0],[18.7,-5.0],[22.0,-3.0],[24.9,-1.2],[26.0,.2],[23.1,-.4],[19.0,-2.0],[14.3,-3.6],[8.7,-4.8],[2.1,-5.5],[-5.0,-5.8],[-12.2,-5.7],[-18.6,-5.2],[-24.0,-4.5]]},
    {n:'AURELIAN_CANON_COCKPIT_GOLD_CRADLE',mat:m.gold,z:8.06,d:.52,p:[[-26.0,5.7],[-22.9,7.7],[-18.3,9.2],[-13.3,9.1],[-9.4,7.8],[-10.5,6.6],[-15.2,6.1],[-20.5,5.5],[-24.3,4.9]]},
    {n:'AURELIAN_CANON_COCKPIT_IVORY_ARCH',mat:m.ivory,z:8.36,d:.28,p:[[-24.5,7.0],[-21.2,8.6],[-17.4,9.0],[-13.9,8.2],[-15.2,7.3],[-18.9,6.8],[-22.3,6.1]]},
    {n:'AURELIAN_CANON_COCKPIT_GLASS_MAIN',mat:m.glass,z:8.60,d:.10,p:[[-23.3,6.8],[-20.6,8.0],[-17.2,8.2],[-14.8,7.6],[-16.4,6.9],[-19.7,6.5],[-22.2,6.1]]},
    {n:'AURELIAN_CANON_DORSAL_IVORY_SWEEP',mat:m.ivory,z:8.26,d:.22,p:[[-11.5,8.8],[-4.5,10.1],[2.6,9.8],[8.5,8.5],[12.0,7.2],[8.0,7.8],[1.4,8.5],[-5.6,8.4]]},
    {n:'AURELIAN_CANON_FOREBODY_GOLD',mat:m.gold,z:8.02,d:.50,p:[[5.7,6.2],[10.5,6.1],[14.8,5.5],[18.5,4.2],[21.4,2.9],[24.1,1.5],[25.8,.35],[23.3,.9],[20.0,1.9],[16.0,3.0],[11.5,4.1],[7.2,4.5]]},
    {n:'AURELIAN_CANON_FOREBODY_IVORY_BLADE',mat:m.ivory,z:8.32,d:.22,p:[[9.5,5.6],[13.2,5.4],[16.9,4.5],[19.7,3.2],[17.5,3.8],[14.4,4.4],[11.3,4.6]]},
    {n:'AURELIAN_CANON_LOWER_GOLD_KEEL',mat:m.goldDark,z:7.88,d:.48,p:[[4.0,-5.6],[9.8,-5.3],[14.4,-4.4],[18.3,-3.1],[21.5,-1.8],[24.4,-.7],[22.0,-1.0],[18.3,-1.9],[13.9,-2.9],[9.2,-3.5],[4.6,-3.7]]},
    {n:'AURELIAN_CANON_LOWER_IVORY_BLADE',mat:m.ivory,z:8.24,d:.20,p:[[10.0,-4.7],[13.4,-4.3],[16.6,-3.6],[19.1,-2.8],[17.1,-3.0],[14.1,-3.4],[11.0,-3.6]]},
    {n:'AURELIAN_CANON_PROW_MASS',mat:m.gold,z:8.14,d:.58,p:[[18.7,3.6],[22.0,3.0],[24.6,1.9],[26.2,.8],[26.6,-.2],[25.6,-1.5],[23.2,-2.8],[20.0,-3.2],[18.4,-1.3],[18.2,1.4]]},
    {n:'AURELIAN_CANON_PROW_IVORY_CROWN',mat:m.ivory,z:8.42,d:.20,p:[[15.0,5.0],[18.0,4.5],[20.7,3.7],[19.0,4.1],[16.3,4.6]]},
    {n:'AURELIAN_CANON_PROW_IVORY_CHIN',mat:m.ivory,z:8.40,d:.20,p:[[15.2,-4.0],[18.0,-3.6],[20.5,-3.0],[18.9,-3.2],[16.2,-3.6]]},
    {n:'AURELIAN_CANON_CANNON_FAIRING',mat:m.goldDark,z:8.06,d:.36,p:[[-9.2,-8.0],[-5.2,-9.4],[1.8,-10.2],[8.5,-9.1],[13.1,-7.3],[10.2,-6.1],[3.0,-5.8],[-4.0,-6.2]]},
    {n:'AURELIAN_CANON_CANNON_IVORY_FIN',mat:m.ivory,z:8.34,d:.18,p:[[-2.0,-8.9],[3.8,-9.2],[8.8,-8.0],[6.2,-7.4],[1.0,-7.3],[-3.2,-7.6]]}
  ];
  for(const a of plates)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.14),[a.mat,m.edge],a.n,0,0,a.z);

  const ribs=[
    {n:'AURELIAN_CANON_AFT_UPPER_RIB',mat:m.gold,p:[[-23.0,4.7],[-18.4,5.8],[-12.5,5.7],[-14.5,4.8],[-20.6,4.1]]},
    {n:'AURELIAN_CANON_AFT_LOWER_RIB',mat:m.goldDark,p:[[-22.7,-3.2],[-18.0,-2.5],[-12.8,-2.8],[-15.0,-3.6],[-20.5,-3.8]]},
    {n:'AURELIAN_CANON_FORE_UPPER_RIB',mat:m.gold,p:[[8.0,4.8],[12.8,5.0],[16.8,4.2],[14.1,3.5],[9.0,3.8]]},
    {n:'AURELIAN_CANON_FORE_LOWER_RIB',mat:m.goldDark,p:[[8.2,-3.0],[12.8,-2.8],[16.5,-3.4],[13.8,-4.0],[9.0,-3.8]]}
  ];
  for(const a of ribs)acHullMesh(kit,acHullExtrude(acHullShape(a.p),.20,.07),[a.mat,m.edge],a.n,0,0,8.16);

  const hub=acHullMesh(kit,new THREE.CylinderGeometry(1.45,1.45,.26,40),m.gold,'AURELIAN_CANON_HUB',.6,.10,8.40);hub.rotation.x=Math.PI/2;
  const hubRing=acHullMesh(kit,new THREE.TorusGeometry(1.02,.13,10,40),m.ivory,'AURELIAN_CANON_HUB_RING',.6,.10,8.56);hubRing.rotation.x=Math.PI/2;
  const hubCore=acHullMesh(kit,new THREE.CircleGeometry(.46,32),m.sun,'AURELIAN_CANON_HUB_CORE',.6,.10,8.68);hubCore.rotation.x=Math.PI/2;
}`;
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){'))patched=patched.replace('function acHullMachinery(kit,m){',silhouette+'\nfunction acHullMachinery(kit,m){');
  if(!patched.includes('  acHullReferenceSilhouette(kit,m);'))patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceSilhouette(kit,m);');
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){')||!patched.includes('acHullReferenceSilhouette(kit,m);'))return html;

  patched=patched.replace('structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4)','structure.userData.acHullRadii=new THREE.Vector3(34.4,13.4,10.1)');
  patched=patched.replace(/MATCH RECORDER v0\.42\.8/g,'MATCH RECORDER v0.45.0');
  patched=patched.replace(/build=2026-09-07_AURELIAN_REFERENCE_METALWORK/g,'build=2026-09-09_AURELIAN_CANON_MAJOR_REBUILD');
  patched=patched.replace(/build=v0\.42\.8 panels=6 apertures=6/g,'build=v0.45.0 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0450" name="ac-aurelian-reference-polish" content="reference:USER_CANON majorRebuild:TRUE silhouette:REFERENCE_FIRST palette:GOLD_IVORY cockpit:ARCHED_GLASS doors:SUBORDINATE_TO_HULL hub:LARGE_REFERENCE cannon:INTEGRATED sixBays:PRESERVED exhausts:PRESERVED combat:UNCHANGED">\n</head>');
}