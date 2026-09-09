function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0436'))return html;
  if(!html.includes('ac-aurelian-canon-exterior-v0428'))return html;
  let patched=html;

  const materials=String.raw`function acHullMaterials(){
  const t=acHullFinishResources();
  const metal=(color,roughness=.24,metalness=.95)=>new THREE.MeshStandardMaterial({color,metalness,roughness,map:t.map,roughnessMap:t.roughness,envMap:t.env,envMapIntensity:1.12});
  return {gold:metal(0xd7a74a,.18),goldDark:metal(0x744a1c,.27),edge:metal(0xf5cf79,.15),bronze:metal(0x3e2918,.31),dark:metal(0x090d12,.36,.82),ivory:metal(0xd8c69f,.23,.77),sun:new THREE.MeshStandardMaterial({color:0xffc347,emissive:0xff9812,emissiveIntensity:2.35,metalness:.54,roughness:.15,envMap:t.env}),hot:new THREE.MeshBasicMaterial({color:0xffefc1}),blue:new THREE.MeshBasicMaterial({color:0x68d2ef}),glass:new THREE.MeshPhysicalMaterial({color:0x456a77,metalness:.10,roughness:.07,clearcoat:1,clearcoatRoughness:.05,envMap:t.env,envMapIntensity:1.0,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide}),trimLine:new THREE.LineBasicMaterial({color:0xefd7a0}),glassLine:new THREE.LineBasicMaterial({color:0xd7f1f3,transparent:true,opacity:.52}),seamLine:new THREE.LineBasicMaterial({color:0x18110a})};
}`;
  const afterMaterials=replaceFunction(patched,'function acHullMaterials(){','function acHullDetail(',materials);if(afterMaterials===patched)return html;patched=afterMaterials;

  const doorArmor=String.raw`function acHullDoorArmor(panel,s,m,index){
  const profile=s.points,w=s.w,h=s.h;
  const collar=profile.map(([x,y])=>[x*.985,y*.965]);
  const face=profile.map(([x,y])=>[x*.945,y*.90]);
  const inset=[[-w*.23,-h*.10],[w*.18,-h*.12],[w*.24,-h*.015],[w*.18,h*.11],[-w*.20,h*.12],[-w*.26,h*.02]];
  acHullMesh(panel,acHullExtrude(acHullShape(profile),.44,.10),[m.goldDark,m.bronze],'AURELIAN_HULL_OUTER_COLLAR_'+index,0,0,2.10);
  acHullMesh(panel,acHullExtrude(acHullShape(collar),.30,.10),[m.gold,m.edge],'AURELIAN_HULL_GOLD_COLLAR_'+index,0,0,2.48);
  acHullMesh(panel,acHullExtrude(acHullShape(face),.20,.09),[m.gold,m.goldDark],'AURELIAN_HULL_CONTINUOUS_FACE_'+index,0,0,2.80);
  acHullMesh(panel,acHullExtrude(acHullShape(inset),.07,.04),m.dark,'AURELIAN_HULL_TECH_INSET_'+index,0,0,3.03);
  const upper=[[-w*.41,h*.07],[-w*.05,h*.12],[w*.34,h*.27],[w*.27,h*.34],[-w*.29,h*.30]];
  const lower=[[-w*.37,-h*.30],[w*.28,-h*.28],[w*.37,-h*.09],[w*.28,-h*.04],[-w*.12,-h*.11]];
  acHullMesh(panel,acHullExtrude(acHullShape(upper),.15,.07),[index===0?m.ivory:m.gold,m.edge],'AURELIAN_HULL_FLOW_FACET_TOP_'+index,0,0,3.06);
  acHullMesh(panel,acHullExtrude(acHullShape(lower),.15,.07),[m.goldDark,m.gold],'AURELIAN_HULL_FLOW_FACET_BOTTOM_'+index,0,0,3.07);
  const ridge=acHullDetail(panel,new THREE.BoxGeometry(w*.48,.050,.050),m.edge,'AURELIAN_HULL_FINE_RIDGE_'+index,-w*.02,h*.18,3.14);ridge.rotation.z=.02;
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
  for(const x of[-.55,.68,1.92,3.10]){cyl(.58,.58,.25,m.gold,'AURELIAN_CANNON_COIL',x,0,.32);const halo=acHullMesh(cannon,new THREE.TorusGeometry(.61,.055,8,30),m.sun,'AURELIAN_CANNON_CONTAINMENT_RING',x+.10,0,.34);halo.rotation.y=Math.PI/2;}
  cyl(.74,.53,.92,m.bronze,'AURELIAN_CANNON_MUZZLE',4.23,0,.32);
  cyl(.59,.59,.20,m.edge,'AURELIAN_CANNON_MUZZLE_RIM',4.72,0,.32);
  const core=acHullMesh(cannon,new THREE.CircleGeometry(.39,28),m.hot,'AURELIAN_CANNON_MUZZLE_CORE',4.84,0,.32);core.rotation.y=Math.PI/2;
  for(const sy of[-1,1]){acHullMesh(cannon,new THREE.BoxGeometry(6.55,.13,.20),m.ivory,'AURELIAN_CANNON_SUPPORT_RAIL',.45,sy*.76,.44);const shroud=acHullMesh(cannon,new THREE.BoxGeometry(5.45,.24,.24),m.gold,'AURELIAN_CANNON_ARMOR_SHROUD',.35,sy*1.16,.20);shroud.rotation.z=sy*.035;}
  for(const x of[-3.30,3.55])for(const sy of[-1,1])acHullMesh(cannon,new THREE.BoxGeometry(.52,.30,.32),m.edge,'AURELIAN_CANNON_HOUSING_CLAMP',x,sy*.95,.42);
}`;
  const afterCannon=replaceFunction(patched,'function acHullCannon(panel,s,m){','function buildAurelianDirectorHull(',cannon);if(afterCannon===patched)return html;patched=afterCannon;

  const silhouette=String.raw`function acHullReferenceSilhouette(kit,m){
  const plates=[
    {n:'AURELIAN_CANON_TOP_CROWN',mat:m.gold,z:7.44,d:.54,p:[[-22.8,6.8],[-18.8,8.55],[-11.8,10.25],[-3.0,11.0],[5.8,10.15],[11.9,8.45],[14.0,7.25],[10.8,7.45],[5.3,8.15],[-3.2,8.55],[-11.8,8.25],[-18.5,6.95]]},
    {n:'AURELIAN_CANON_BOTTOM_KEEL',mat:m.goldDark,z:7.20,d:.60,p:[[-22.4,-6.15],[-17.4,-7.9],[-9.0,-9.0],[0.0,-9.45],[8.4,-8.5],[13.9,-6.65],[10.5,-6.55],[4.4,-7.15],[-4.0,-7.3],[-12.2,-6.95],[-18.5,-5.75]]},
    {n:'AURELIAN_CANON_AFT_COWL_TOP',mat:m.gold,z:7.62,d:.48,p:[[-27.2,5.45],[-23.3,7.0],[-18.4,8.0],[-14.6,8.25],[-16.0,6.65],[-21.1,5.25]]},
    {n:'AURELIAN_CANON_AFT_COWL_BOTTOM',mat:m.goldDark,z:7.46,d:.48,p:[[-27.0,-5.35],[-23.1,-6.9],[-18.1,-7.75],[-14.5,-7.9],[-16.0,-6.2],[-21.0,-4.95]]},
    {n:'AURELIAN_CANON_PROW_UPPER_MASS',mat:m.gold,z:7.82,d:.48,p:[[13.8,6.9],[16.4,6.35],[19.0,5.45],[21.8,4.15],[24.0,2.75],[25.0,1.55],[23.0,2.0],[20.3,3.15],[17.7,4.55],[15.1,5.65]]},
    {n:'AURELIAN_CANON_PROW_LOWER_MASS',mat:m.goldDark,z:7.56,d:.48,p:[[13.8,-6.1],[16.6,-5.65],[19.3,-4.75],[22.0,-3.35],[24.1,-2.15],[25.0,-1.0],[22.9,-1.35],[20.3,-2.5],[17.6,-3.85],[15.0,-4.95]]},
    {n:'AURELIAN_CANON_PROW_NOSE_CAP',mat:m.gold,z:8.00,d:.46,p:[[22.0,2.85],[24.1,2.2],[25.45,1.05],[25.35,-1.0],[24.0,-2.15],[21.9,-2.7],[20.9,-.7],[21.0,1.2]]},
    {n:'AURELIAN_CANON_PROW_DARK_GAP',mat:m.dark,z:8.06,d:.24,p:[[15.0,2.1],[17.8,1.95],[20.2,1.45],[22.7,.85],[23.6,.25],[22.2,-.25],[20.0,-.8],[17.8,-1.25],[15.0,-1.55],[16.1,-.20],[16.2,.75]]},
    {n:'AURELIAN_CANON_PROW_GOLD_SPINE',mat:m.edge,z:8.24,d:.18,p:[[15.3,1.25],[18.0,1.45],[20.5,1.12],[24.4,.60],[21.4,.78],[18.6,.60],[16.2,.50]]},
    {n:'AURELIAN_CANON_PROW_IVORY_TOP',mat:m.ivory,z:8.30,d:.18,p:[[16.0,5.35],[18.0,4.78],[20.0,4.0],[18.7,4.1],[17.0,4.65]]},
    {n:'AURELIAN_CANON_PROW_IVORY_BOTTOM',mat:m.ivory,z:8.28,d:.18,p:[[16.0,-5.05],[18.1,-4.48],[20.1,-3.75],[18.7,-3.85],[17.0,-4.4]]},
    {n:'AURELIAN_CANON_UPPER_BAY_BRIDGE',mat:m.gold,z:7.88,d:.28,p:[[-18.0,5.0],[-9.0,5.55],[1.0,5.65],[10.8,5.2],[12.6,4.55],[9.7,4.45],[.5,4.75],[-8.8,4.65],[-17.4,4.15]]},
    {n:'AURELIAN_CANON_MID_BAY_BRIDGE',mat:m.goldDark,z:7.86,d:.26,p:[[-18.6,1.25],[-9.3,1.65],[.4,1.7],[10.9,1.35],[12.7,.75],[9.5,.65],[.2,.95],[-9.1,.90],[-18.0,.45]]},
    {n:'AURELIAN_CANON_LOWER_BAY_BRIDGE',mat:m.gold,z:7.84,d:.27,p:[[-18.3,-3.0],[-9.0,-2.55],[.4,-2.45],[10.8,-2.75],[12.4,-3.35],[9.5,-3.45],[.2,-3.15],[-8.8,-3.2],[-17.6,-3.75]]}
  ];
  for(const a of plates)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.12),[a.mat,m.edge],a.n,0,0,a.z);
  const accents=[
    {n:'AURELIAN_CANON_DORSAL_IVORY_STRIP',mat:m.ivory,p:[[-7.5,10.08],[-2.0,10.42],[3.1,9.92],[.5,9.72],[-4.0,9.88]]},
    {n:'AURELIAN_CANON_COCKPIT_FAIRING',mat:m.gold,p:[[-22.0,8.0],[-18.0,8.85],[-13.5,8.6],[-14.5,7.7],[-18.8,7.3],[-21.5,7.1]]},
    {n:'AURELIAN_CANON_FORE_UPPER_COLLAR',mat:m.gold,p:[[11.6,7.55],[14.0,7.15],[15.2,6.35],[13.9,6.55],[12.2,6.9]]},
    {n:'AURELIAN_CANON_FORE_LOWER_COLLAR',mat:m.goldDark,p:[[11.7,-6.55],[14.0,-6.15],[15.3,-5.35],[13.9,-5.55],[12.2,-5.95]]}
  ];
  for(const a of accents)acHullMesh(kit,acHullExtrude(acHullShape(a.p),.20,.07),[a.mat,m.edge],a.n,0,0,8.26);
}`;
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){'))patched=patched.replace('function acHullMachinery(kit,m){',silhouette+'\nfunction acHullMachinery(kit,m){');
  if(!patched.includes('  acHullReferenceSilhouette(kit,m);'))patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceSilhouette(kit,m);');
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){')||!patched.includes('acHullReferenceSilhouette(kit,m);'))return html;

  patched=patched.replace('structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4)','structure.userData.acHullRadii=new THREE.Vector3(33.0,12.7,9.7)');
  patched=patched.replace(/MATCH RECORDER v0\.42\.8/g,'MATCH RECORDER v0.43.6');
  patched=patched.replace(/build=2026-09-07_AURELIAN_REFERENCE_METALWORK/g,'build=2026-09-08_AURELIAN_CONTINUOUS_GOLD_HULL');
  patched=patched.replace(/build=v0\.42\.8 panels=6 apertures=6/g,'build=v0.43.6 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0436" name="ac-aurelian-reference-polish" content="reference:CANON hull:CONTINUOUS_GOLD bayFrames:SUPPRESSED cockpit:FAIRED_IN prow:INTEGRATED cannon:EXPOSED_DOOR_OWNED sixBays:PRESERVED exhausts:PRESERVED combat:UNCHANGED">\n</head>');
}
