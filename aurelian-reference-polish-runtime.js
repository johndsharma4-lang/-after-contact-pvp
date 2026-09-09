function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0443'))return html;
  if(!html.includes('ac-aurelian-canon-exterior-v0428'))return html;
  let patched=html;

  const materials=String.raw`function acHullMaterials(){
  const t=acHullFinishResources();
  const metal=(color,roughness=.20,metalness=.96)=>new THREE.MeshStandardMaterial({color,metalness,roughness,map:t.map,roughnessMap:t.roughness,envMap:t.env,envMapIntensity:1.48});
  return {gold:metal(0xf1c76a,.13),goldDark:metal(0x9b6626,.20),edge:metal(0xffeab6,.09),bronze:metal(0x60401e,.24),dark:metal(0x121313,.30,.84),ivory:metal(0xf3e8cc,.14,.80),sun:new THREE.MeshStandardMaterial({color:0xffc347,emissive:0xff9812,emissiveIntensity:2.5,metalness:.54,roughness:.14,envMap:t.env}),hot:new THREE.MeshBasicMaterial({color:0xffefc1}),blue:new THREE.MeshBasicMaterial({color:0x75d8f0}),glass:new THREE.MeshPhysicalMaterial({color:0x46788a,metalness:.08,roughness:.04,clearcoat:1,clearcoatRoughness:.03,envMap:t.env,envMapIntensity:1.25,transparent:true,opacity:.46,depthWrite:false,side:THREE.DoubleSide}),trimLine:new THREE.LineBasicMaterial({color:0xf7e5bb}),glassLine:new THREE.LineBasicMaterial({color:0xd7f1f3,transparent:true,opacity:.60}),seamLine:new THREE.LineBasicMaterial({color:0x2a1b0c})};
}`;
  const afterMaterials=replaceFunction(patched,'function acHullMaterials(){','function acHullDetail(',materials);if(afterMaterials===patched)return html;patched=afterMaterials;

  const doorArmor=String.raw`function acHullDoorArmor(panel,s,m,index){
  const w=s.w,h=s.h;
  const profile=[[-w*.54,-h*.33],[w*.28,-h*.32],[w*.49,-h*.13],[w*.46,h*.16],[w*.30,h*.32],[-w*.50,h*.31],[-w*.60,h*.09],[-w*.60,-h*.08]];
  const face=profile.map(([x,y])=>[x*.988,y*.958]);
  const rim=profile.map(([x,y])=>[x*1.025,y*1.025]);
  acHullMesh(panel,acHullExtrude(acHullShape(rim),.14,.06),[m.goldDark,m.bronze],'AURELIAN_CANON_BAY_FRAME_MASK_'+index,0,0,2.22);
  acHullMesh(panel,acHullExtrude(acHullShape(profile),.36,.09),[m.gold,m.edge],'AURELIAN_CANON_BAY_ARMOR_'+index,0,0,2.52);
  acHullMesh(panel,acHullExtrude(acHullShape(face),.19,.06),[m.gold,m.goldDark],'AURELIAN_CANON_BAY_FACE_'+index,0,0,2.86);
  if(index===0){
    const canopy=[[-w*.46,-h*.02],[w*.16,-h*.10],[w*.43,h*.03],[w*.28,h*.29],[-w*.29,h*.32],[-w*.49,h*.17]];
    acHullMesh(panel,acHullExtrude(acHullShape(canopy),.07,.025),[m.glass,m.edge],'AURELIAN_CANON_COCKPIT_CANOPY',0,0,3.16);
  }else{
    const crest=[[-w*.33,h*.015],[w*.25,h*.015],[w*.34,h*.06],[w*.18,h*.09],[-w*.29,h*.08]];
    acHullMesh(panel,acHullExtrude(acHullShape(crest),.035,.015),[m.goldDark,m.gold],'AURELIAN_CANON_BAY_TECH_CREST_'+index,0,0,3.04);
  }
  const upper=[[-w*.55,h*.13],[-w*.18,h*.27],[w*.33,h*.29],[w*.44,h*.18],[w*.10,h*.12],[-w*.35,h*.11]];
  const lower=[[-w*.51,-h*.29],[w*.29,-h*.28],[w*.43,-h*.14],[w*.18,-h*.09],[-w*.28,-h*.13]];
  acHullMesh(panel,acHullExtrude(acHullShape(upper),.11,.045),[index===0?m.ivory:m.gold,m.edge],'AURELIAN_CANON_BAY_UPPER_SWEEP_'+index,0,0,3.10);
  acHullMesh(panel,acHullExtrude(acHullShape(lower),.11,.045),[m.goldDark,m.gold],'AURELIAN_CANON_BAY_LOWER_SWEEP_'+index,0,0,3.11);
}`;
  const afterDoor=replaceFunction(patched,'function acHullDoorArmor(panel,s,m,index){','function acHullMesh(',doorArmor);if(afterDoor===patched)return html;patched=afterDoor;

  const cannon=String.raw`function acHullCannon(panel,s,m){
  const cannon=new THREE.Group();cannon.name='AURELIAN_CANON_SOLAR_CANNON_ART';cannon.position.z=3.18;panel.add(cannon);
  const shell=[[-4.80,-1.66],[4.05,-1.40],[4.75,-.58],[4.40,1.56],[-3.95,1.92],[-4.86,.76]];
  acHullMesh(cannon,acHullExtrude(acHullShape(shell),.25,.08),[m.goldDark,m.gold],'AURELIAN_CANNON_EXPOSED_HOUSING',0,0,-.20);
  const inner=shell.map(([x,y])=>[x*.91,y*.74]);
  acHullMesh(cannon,acHullExtrude(acHullShape(inner),.11,.05),m.dark,'AURELIAN_CANNON_EXPOSED_RECESS',0,0,.10);
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
  for(const sy of[-1,1]){const rail=acHullMesh(cannon,new THREE.BoxGeometry(6.20,.12,.18),m.ivory,'AURELIAN_CANNON_SUPPORT_RAIL',.45,sy*.72,.44);rail.rotation.z=sy*.015;const shroud=acHullMesh(cannon,new THREE.BoxGeometry(5.30,.24,.24),m.gold,'AURELIAN_CANNON_ARMOR_SHROUD',.35,sy*1.10,.20);shroud.rotation.z=sy*.025;}
}`;
  const afterCannon=replaceFunction(patched,'function acHullCannon(panel,s,m){','function buildAurelianDirectorHull(',cannon);if(afterCannon===patched)return html;patched=afterCannon;

  const silhouette=String.raw`function acHullReferenceSilhouette(kit,m){
  const plates=[
    {n:'AURELIAN_CANON_PRIMARY_DORSAL_SHELL',mat:m.gold,z:7.46,d:.62,p:[[-27.4,4.9],[-24.3,6.8],[-19.5,8.5],[-13.6,9.7],[-7.0,10.35],[.3,10.2],[7.0,9.0],[12.8,7.2],[17.5,5.0],[20.9,3.1],[23.6,1.35],[24.35,.45],[21.3,1.25],[17.4,3.0],[12.8,4.7],[7.0,5.9],[.3,6.55],[-6.8,6.65],[-13.9,6.2],[-20.3,5.5],[-24.8,4.5]]},
    {n:'AURELIAN_CANON_PRIMARY_VENTRAL_SHELL',mat:m.gold,z:7.20,d:.62,p:[[-27.1,-4.8],[-23.5,-6.2],[-18.3,-7.5],[-11.8,-8.4],[-4.3,-8.9],[3.5,-8.7],[10.1,-7.6],[15.4,-5.9],[19.4,-4.0],[22.2,-2.2],[24.2,.25],[21.2,-.4],[17.2,-2.2],[12.5,-3.7],[6.4,-4.9],[-.4,-5.45],[-7.7,-5.65],[-14.7,-5.4],[-20.9,-4.75],[-25.1,-4.0]]},
    {n:'AURELIAN_CANON_COCKPIT_SHOULDER',mat:m.gold,z:7.95,d:.44,p:[[-24.9,6.25],[-21.5,7.95],[-16.8,9.0],[-12.0,8.7],[-8.0,7.1],[-10.8,6.15],[-16.1,6.25],[-21.5,5.8]]},
    {n:'AURELIAN_CANON_COCKPIT_IVORY_MANTLE',mat:m.ivory,z:8.22,d:.24,p:[[-23.4,7.4],[-19.8,8.7],[-16.1,8.75],[-13.0,8.0],[-15.5,7.35],[-19.3,6.95]]},
    {n:'AURELIAN_CANON_COCKPIT_GLASS',mat:m.glass,z:8.43,d:.09,p:[[-22.3,7.15],[-19.7,8.17],[-16.7,8.14],[-14.5,7.55],[-16.5,7.0],[-19.5,6.75]]},
    {n:'AURELIAN_CANON_FOREBODY_UPPER',mat:m.gold,z:7.98,d:.44,p:[[7.0,6.1],[11.0,5.95],[14.7,5.2],[18.0,4.0],[20.8,2.7],[23.3,1.35],[21.0,1.65],[18.0,2.65],[14.5,3.65],[10.6,4.4],[7.2,4.7]]},
    {n:'AURELIAN_CANON_FOREBODY_LOWER',mat:m.goldDark,z:7.74,d:.44,p:[[7.0,-4.75],[11.2,-4.65],[14.9,-4.1],[18.1,-3.2],[21.0,-1.9],[23.2,-.85],[20.9,-1.05],[17.8,-1.95],[14.4,-2.85],[10.7,-3.5],[7.1,-3.6]]},
    {n:'AURELIAN_CANON_BLUNT_PROW',mat:m.gold,z:8.10,d:.54,p:[[19.0,2.95],[21.7,2.45],[23.9,1.4],[24.9,.45],[24.6,-.95],[22.6,-2.3],[19.7,-2.72],[18.8,-.75],[18.9,1.2]]},
    {n:'AURELIAN_CANON_PROW_IVORY_CROWN',mat:m.ivory,z:8.34,d:.19,p:[[14.0,5.0],[16.4,4.65],[18.9,3.9],[17.6,4.1],[15.3,4.55]]},
    {n:'AURELIAN_CANON_PROW_IVORY_CHIN',mat:m.ivory,z:8.32,d:.19,p:[[14.0,-4.1],[16.5,-3.8],[18.8,-3.28],[17.5,-3.4],[15.4,-3.8]]},
    {n:'AURELIAN_CANON_LOWER_CANNON_FAIRING',mat:m.goldDark,z:8.04,d:.32,p:[[-7.8,-8.3],[-3.2,-9.45],[4.4,-9.15],[10.0,-7.55],[8.0,-6.65],[1.5,-6.25],[-5.1,-6.6]]}
  ];
  for(const a of plates)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.13),[a.mat,m.edge],a.n,0,0,a.z);

  const bridges=[
    {n:'AURELIAN_CANON_AFT_UPPER_BRIDGE',mat:m.gold,p:[[-22.5,4.9],[-18.2,5.6],[-13.7,5.45],[-15.2,4.75],[-20.9,4.35]]},
    {n:'AURELIAN_CANON_AFT_LOWER_BRIDGE',mat:m.goldDark,p:[[-22.2,-2.75],[-17.9,-2.45],[-13.8,-2.85],[-15.3,-3.45],[-20.9,-3.45]]},
    {n:'AURELIAN_CANON_FORE_UPPER_BRIDGE',mat:m.gold,p:[[8.7,4.75],[12.0,4.95],[14.8,4.35],[12.7,3.88],[8.9,4.08]]},
    {n:'AURELIAN_CANON_FORE_LOWER_BRIDGE',mat:m.goldDark,p:[[8.8,-2.75],[12.1,-2.55],[14.8,-3.05],[12.7,-3.45],[8.9,-3.28]]}
  ];
  for(const a of bridges)acHullMesh(kit,acHullExtrude(acHullShape(a.p),.18,.07),[a.mat,m.edge],a.n,0,0,8.16);

  const hub=acHullMesh(kit,new THREE.CylinderGeometry(1.05,1.05,.22,36),m.gold,'AURELIAN_CANON_HUB',.5,.12,8.36);hub.rotation.x=Math.PI/2;
  const hubRing=acHullMesh(kit,new THREE.TorusGeometry(.75,.12,10,36),m.ivory,'AURELIAN_CANON_HUB_RING',.5,.12,8.50);hubRing.rotation.x=Math.PI/2;
  const hubCore=acHullMesh(kit,new THREE.CircleGeometry(.34,30),m.sun,'AURELIAN_CANON_HUB_CORE',.5,.12,8.62);hubCore.rotation.x=Math.PI/2;
}`;
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){'))patched=patched.replace('function acHullMachinery(kit,m){',silhouette+'\nfunction acHullMachinery(kit,m){');
  if(!patched.includes('  acHullReferenceSilhouette(kit,m);'))patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceSilhouette(kit,m);');
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){')||!patched.includes('acHullReferenceSilhouette(kit,m);'))return html;

  patched=patched.replace('structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4)','structure.userData.acHullRadii=new THREE.Vector3(33.0,12.8,9.8)');
  patched=patched.replace(/MATCH RECORDER v0\.42\.8/g,'MATCH RECORDER v0.44.3');
  patched=patched.replace(/build=2026-09-07_AURELIAN_REFERENCE_METALWORK/g,'build=2026-09-09_AURELIAN_CANON_SILHOUETTE_MATCH');
  patched=patched.replace(/build=v0\.42\.8 panels=6 apertures=6/g,'build=v0.44.3 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0443" name="ac-aurelian-reference-polish" content="reference:CANON silhouetteMatch:TRUE palette:POLISHED_GOLD_IVORY cockpit:TOP_CANOPY doors:ARMOR_INTEGRATED hub:REFERENCE_SCALE cannon:FAIRED sixBays:PRESERVED exhausts:PRESERVED combat:UNCHANGED">\n</head>');
}