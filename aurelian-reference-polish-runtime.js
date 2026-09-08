function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0432'))return html;
  if(!html.includes('ac-aurelian-canon-exterior-v0428'))return html;
  let patched=html;

  const materials=String.raw`function acHullMaterials(){
  const t=acHullFinishResources();
  const metal=(color,roughness=.24,metalness=.95)=>new THREE.MeshStandardMaterial({color,metalness,roughness,map:t.map,roughnessMap:t.roughness,envMap:t.env,envMapIntensity:1.08});
  return {gold:metal(0xd0a143,.19),goldDark:metal(0x70481a,.29),edge:metal(0xf2ca72,.16),bronze:metal(0x3b2718,.32),dark:metal(0x080c12,.35,.82),ivory:metal(0xd3c09a,.24,.76),sun:new THREE.MeshStandardMaterial({color:0xffc347,emissive:0xff9812,emissiveIntensity:2.35,metalness:.54,roughness:.15,envMap:t.env}),hot:new THREE.MeshBasicMaterial({color:0xffefc1}),blue:new THREE.MeshBasicMaterial({color:0x68d2ef}),glass:new THREE.MeshPhysicalMaterial({color:0x456a77,metalness:.10,roughness:.07,clearcoat:1,clearcoatRoughness:.05,envMap:t.env,envMapIntensity:1.0,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide}),trimLine:new THREE.LineBasicMaterial({color:0xefd7a0}),glassLine:new THREE.LineBasicMaterial({color:0xd7f1f3,transparent:true,opacity:.52}),seamLine:new THREE.LineBasicMaterial({color:0x18110a})};
}`;
  const afterMaterials=replaceFunction(patched,'function acHullMaterials(){','function acHullDetail(',materials);if(afterMaterials===patched)return html;patched=afterMaterials;

  const doorArmor=String.raw`function acHullDoorArmor(panel,s,m,index){
  const profile=s.points,w=s.w,h=s.h,inner=profile.map(([x,y])=>[x*.91,y*.80]);
  acHullMesh(panel,acHullExtrude(acHullShape(profile),.42,.10),[m.bronze,m.goldDark],'AURELIAN_HULL_ARMOR_'+index,0,0,2.07);
  acHullMesh(panel,acHullExtrude(acHullShape(inner),.17,.12),m.dark,'AURELIAN_HULL_RECESSED_FIELD_'+index,0,0,2.48);
  const upper=[[-w*.40,h*.08],[w*.08,h*.14],[w*.36,h*.29],[-w*.29,h*.34]],lower=[[-w*.36,-h*.31],[w*.28,-h*.29],[w*.39,-h*.07],[-w*.10,-h*.13]],center=[[-w*.31,-h*.05],[w*.23,-h*.08],[w*.33,h*.07],[-w*.22,h*.12]];
  acHullMesh(panel,acHullExtrude(acHullShape(upper),.24,.10),[index%2?m.ivory:m.gold,m.edge],'AURELIAN_HULL_UPPER_SWEEP_'+index,0,0,2.71);
  acHullMesh(panel,acHullExtrude(acHullShape(lower),.25,.10),[m.goldDark,m.gold],'AURELIAN_HULL_LOWER_SWEEP_'+index,0,0,2.73);
  acHullMesh(panel,acHullExtrude(acHullShape(center),.27,.11),[m.gold,m.edge],'AURELIAN_HULL_CENTER_SPINE_'+index,0,0,2.90);
}`;
  const afterDoor=replaceFunction(patched,'function acHullDoorArmor(panel,s,m,index){','function acHullMesh(',doorArmor);if(afterDoor===patched)return html;patched=afterDoor;

  const cannon=String.raw`function acHullCannon(panel,s,m){
  const cannon=new THREE.Group();cannon.name='AURELIAN_CANON_SOLAR_CANNON_ART';cannon.position.z=3.18;panel.add(cannon);
  const shell=[[-4.65,-1.78],[3.95,-1.48],[4.58,-.62],[4.28,1.72],[-3.85,2.02],[-4.72,.82]];
  acHullMesh(cannon,acHullExtrude(acHullShape(shell),.24,.08),[m.goldDark,m.bronze],'AURELIAN_CANNON_EXPOSED_HOUSING',0,0,-.20);
  const inner=shell.map(([x,y])=>[x*.91,y*.76]);
  acHullMesh(cannon,acHullExtrude(acHullShape(inner),.12,.06),m.dark,'AURELIAN_CANNON_EXPOSED_RECESS',0,0,.10);
  const cyl=(r1,r2,len,mat,name,x,y=0,z=.30)=>{const o=acHullMesh(cannon,new THREE.CylinderGeometry(r1,r2,len,24),mat,name,x,y,z);o.rotation.z=-Math.PI/2;return o};
  cyl(1.02,1.18,1.70,m.bronze,'AURELIAN_CANNON_BREECH',-2.72,0,.31);
  acHullMesh(cannon,new THREE.SphereGeometry(.80,22,16),m.sun,'AURELIAN_CANNON_CHAMBER',-1.74,0,.42);
  for(const r of[.92,1.16]){const ring=acHullMesh(cannon,new THREE.TorusGeometry(r,.09,10,34),r>1?m.edge:m.sun,'AURELIAN_CANNON_CHAMBER_RING',-1.84,0,.43);ring.rotation.y=Math.PI/2;}
  cyl(.34,.49,5.30,m.dark,'AURELIAN_CANNON_BARREL',1.18,0,.31);
  cyl(.14,.14,4.35,m.sun,'AURELIAN_CANNON_CONTAINED_ENERGY',1.08,0,.36);
  for(const x of[-.55,.68,1.92,3.10]){
    cyl(.58,.58,.25,m.gold,'AURELIAN_CANNON_COIL',x,0,.32);
    const halo=acHullMesh(cannon,new THREE.TorusGeometry(.61,.055,8,30),m.sun,'AURELIAN_CANNON_CONTAINMENT_RING',x+.10,0,.34);halo.rotation.y=Math.PI/2;
  }
  cyl(.74,.53,.92,m.bronze,'AURELIAN_CANNON_MUZZLE',4.23,0,.32);
  cyl(.59,.59,.20,m.edge,'AURELIAN_CANNON_MUZZLE_RIM',4.72,0,.32);
  const core=acHullMesh(cannon,new THREE.CircleGeometry(.39,28),m.hot,'AURELIAN_CANNON_MUZZLE_CORE',4.84,0,.32);core.rotation.y=Math.PI/2;
  for(const sy of[-1,1]){
    acHullMesh(cannon,new THREE.BoxGeometry(6.55,.13,.20),m.ivory,'AURELIAN_CANNON_SUPPORT_RAIL',.45,sy*.76,.44);
    const shroud=acHullMesh(cannon,new THREE.BoxGeometry(5.45,.24,.24),m.gold,'AURELIAN_CANNON_ARMOR_SHROUD',.35,sy*1.16,.20);shroud.rotation.z=sy*.035;
  }
  for(const x of[-3.30,3.55])for(const sy of[-1,1])acHullMesh(cannon,new THREE.BoxGeometry(.52,.30,.32),m.edge,'AURELIAN_CANNON_HOUSING_CLAMP',x,sy*.95,.42);
}`;
  const afterCannon=replaceFunction(patched,'function acHullCannon(panel,s,m){','function buildAurelianDirectorHull(',cannon);if(afterCannon===patched)return html;patched=afterCannon;

  const silhouette=String.raw`function acHullReferenceSilhouette(kit,m){
  const plates=[
    {n:'AURELIAN_CANON_DORSAL_FLOW',mat:m.gold,z:7.42,d:.56,p:[[-22.5,6.8],[-18.3,8.6],[-11.8,10.0],[-3.5,10.8],[5.8,9.9],[12.6,7.8],[18.7,5.4],[23.0,3.8],[26.7,1.85],[28.1,.62],[25.2,1.28],[21.0,2.9],[16.3,4.8],[10.8,6.4],[5.0,7.4],[-3.7,8.0],[-12.6,7.7],[-18.6,6.1]]},
    {n:'AURELIAN_CANON_VENTRAL_FLOW',mat:m.goldDark,z:7.18,d:.62,p:[[-22.1,-6.3],[-17.2,-7.8],[-9.5,-8.8],[-.5,-9.2],[8.2,-8.3],[14.8,-6.5],[19.8,-4.5],[23.8,-2.9],[27.1,-1.0],[28.1,.62],[25.2,-.10],[21.0,-1.9],[16.0,-3.9],[10.5,-5.5],[5.2,-6.1],[-3.7,-6.5],[-12.2,-6.3],[-18.4,-5.6]]},
    {n:'AURELIAN_CANON_PROW_DARK_UNDERCUT',mat:m.dark,z:7.62,d:.34,p:[[14.8,3.1],[19.7,2.7],[24.4,1.55],[27.6,.62],[24.7,-.15],[20.2,-1.6],[15.0,-2.4],[17.5,-.45],[17.6,1.2]]},
    {n:'AURELIAN_CANON_PROW_GOLD_SPEAR',mat:m.gold,z:8.00,d:.34,p:[[16.0,3.5],[20.6,3.0],[24.8,1.8],[28.0,.62],[25.0,.15],[21.0,.92],[17.4,2.15]]},
    {n:'AURELIAN_CANON_PROW_IVORY_TOP',mat:m.ivory,z:8.18,d:.24,p:[[17.3,5.2],[20.7,4.15],[23.7,3.0],[21.3,3.14],[18.4,4.35]]},
    {n:'AURELIAN_CANON_PROW_IVORY_LOWER',mat:m.ivory,z:8.16,d:.24,p:[[17.0,-5.0],[20.7,-3.95],[23.6,-2.75],[21.3,-2.88],[18.1,-4.05]]},
    {n:'AURELIAN_CANON_PROW_GOLD_CHEEK',mat:m.gold,z:8.30,d:.20,p:[[11.4,4.9],[15.8,4.3],[18.1,3.1],[15.7,3.35],[12.4,4.0]]},
    {n:'AURELIAN_CANON_AFT_TOP',mat:m.gold,z:7.58,d:.48,p:[[-27.0,5.5],[-23.0,7.1],[-18.2,8.0],[-14.0,8.4],[-16.1,6.6],[-21.1,5.2]]},
    {n:'AURELIAN_CANON_AFT_BOTTOM',mat:m.goldDark,z:7.44,d:.48,p:[[-26.7,-5.3],[-22.8,-6.9],[-18.0,-7.7],[-13.8,-8.0],[-16.0,-6.2],[-21.0,-4.9]]}
  ];
  for(const a of plates)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.13),[a.mat,m.edge],a.n,0,0,a.z);
  const spine=[[-18.0,1.2],[-10.0,2.4],[-1.5,2.8],[7.0,2.2],[14.0,1.2],[19.3,.55],[15.6,-.02],[8.0,.35],[-1.8,.7],[-10.5,.4]];
  acHullMesh(kit,acHullExtrude(acHullShape(spine),.30,.09),[m.gold,m.edge],'AURELIAN_CANON_FLOW_SPINE',0,0,8.04);
  const braces=[
    {n:'AURELIAN_CANON_TOP_BRACE',p:[[12.4,7.1],[16.0,5.9],[18.3,4.7],[16.0,5.0],[13.5,6.0]]},
    {n:'AURELIAN_CANON_BOTTOM_BRACE',p:[[12.8,-6.7],[16.1,-5.5],[18.4,-4.3],[16.1,-4.6],[13.7,-5.7]]}
  ];
  for(const a of braces)acHullMesh(kit,acHullExtrude(acHullShape(a.p),.20,.07),[m.ivory,m.edge],a.n,0,0,8.28);
}`;
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){'))patched=patched.replace('function acHullMachinery(kit,m){',silhouette+'\nfunction acHullMachinery(kit,m){');
  if(!patched.includes('  acHullReferenceSilhouette(kit,m);'))patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceSilhouette(kit,m);');
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){')||!patched.includes('acHullReferenceSilhouette(kit,m);'))return html;

  patched=patched.replace('structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4)','structure.userData.acHullRadii=new THREE.Vector3(33.5,12.7,9.7)');
  patched=patched.replace(/MATCH RECORDER v0\.42\.8/g,'MATCH RECORDER v0.43.2');
  patched=patched.replace(/build=2026-09-07_AURELIAN_REFERENCE_METALWORK/g,'build=2026-09-07_AURELIAN_CANON_CANNON_HOUSING');
  patched=patched.replace(/build=v0\.42\.8 panels=6 apertures=6/g,'build=v0.43.2 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0432" name="ac-aurelian-reference-polish" content="reference:CANON silhouette:FULLER_PROW cannon:EXPOSED_DOOR_OWNED palette:GOLD_IVORY sixBays:PRESERVED exhausts:PRESERVED combat:UNCHANGED">\n</head>');
}
