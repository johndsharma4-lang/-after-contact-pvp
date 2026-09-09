function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0439'))return html;
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
  const oversize=profile.map(([x,y])=>[x*1.045,y*1.035]);
  const face=profile.map(([x,y])=>[x*.965,y*.925]);
  const inset=[[-w*.085,-h*.035],[w*.068,-h*.040],[w*.090,-h*.006],[w*.068,h*.036],[-w*.072,h*.039],[-w*.095,h*.006]];
  acHullMesh(panel,acHullExtrude(acHullShape(oversize),.22,.08),[m.goldDark,m.bronze],'AURELIAN_HULL_FRAME_MASK_'+index,0,0,2.16);
  acHullMesh(panel,acHullExtrude(acHullShape(profile),.38,.10),[m.gold,m.edge],'AURELIAN_HULL_OUTER_COLLAR_'+index,0,0,2.44);
  acHullMesh(panel,acHullExtrude(acHullShape(face),.24,.09),[m.gold,m.goldDark],'AURELIAN_HULL_CONTINUOUS_FACE_'+index,0,0,2.80);
  acHullMesh(panel,acHullExtrude(acHullShape(inset),.040,.03),m.dark,'AURELIAN_HULL_TECH_INSET_'+index,0,0,3.04);
  const upper=[[-w*.40,h*.08],[-w*.04,h*.12],[w*.33,h*.27],[w*.25,h*.33],[-w*.27,h*.29]];
  const lower=[[-w*.36,-h*.29],[w*.27,-h*.27],[w*.36,-h*.09],[w*.27,-h*.04],[-w*.11,-h*.10]];
  acHullMesh(panel,acHullExtrude(acHullShape(upper),.14,.07),[index===0?m.ivory:m.gold,m.edge],'AURELIAN_HULL_FLOW_FACET_TOP_'+index,0,0,3.06);
  acHullMesh(panel,acHullExtrude(acHullShape(lower),.14,.07),[m.goldDark,m.gold],'AURELIAN_HULL_FLOW_FACET_BOTTOM_'+index,0,0,3.07);
  const ridge=acHullDetail(panel,new THREE.BoxGeometry(w*.42,.045,.050),m.edge,'AURELIAN_HULL_FINE_RIDGE_'+index,-w*.01,h*.18,3.14);ridge.rotation.z=.02;
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
    {n:'AURELIAN_CANON_TOP_CROWN',mat:m.gold,z:7.44,d:.54,p:[[-22.8,6.8],[-18.8,8.55],[-11.8,10.25],[-3.0,11.0],[5.8,10.15],[11.9,8.45],[13.8,7.25],[10.8,7.45],[5.3,8.15],[-3.2,8.55],[-11.8,8.25],[-18.5,6.95]]},
    {n:'AURELIAN_CANON_BOTTOM_KEEL',mat:m.goldDark,z:7.20,d:.60,p:[[-22.4,-6.15],[-17.4,-7.9],[-9.0,-9.0],[0.0,-9.45],[8.4,-8.5],[13.7,-6.65],[10.5,-6.55],[4.4,-7.15],[-4.0,-7.3],[-12.2,-6.95],[-18.5,-5.75]]},
    {n:'AURELIAN_CANON_AFT_COWL_TOP',mat:m.gold,z:7.62,d:.48,p:[[-27.2,5.45],[-23.3,7.0],[-18.4,8.0],[-14.6,8.25],[-16.0,6.65],[-21.1,5.25]]},
    {n:'AURELIAN_CANON_AFT_COWL_BOTTOM',mat:m.goldDark,z:7.46,d:.48,p:[[-27.0,-5.35],[-23.1,-6.9],[-18.1,-7.75],[-14.5,-7.9],[-16.0,-6.2],[-21.0,-4.95]]},
    {n:'AURELIAN_CANON_COCKPIT_TO_BAY_SHOULDER_TOP',mat:m.gold,z:7.86,d:.34,p:[[-20.8,7.15],[-16.8,7.95],[-12.2,7.75],[-8.6,6.85],[-11.2,6.45],[-15.7,6.55],[-19.8,6.35]]},
    {n:'AURELIAN_CANON_COCKPIT_TO_BAY_SHOULDER_BOTTOM',mat:m.goldDark,z:7.72,d:.34,p:[[-20.6,-5.55],[-16.5,-6.35],[-12.0,-6.15],[-8.5,-5.35],[-11.0,-5.05],[-15.5,-5.15],[-19.6,-4.75]]},
    {n:'AURELIAN_CANON_FORWARD_FLOW_TOP',mat:m.gold,z:7.90,d:.36,p:[[8.7,6.7],[12.6,6.6],[16.0,5.9],[19.0,4.7],[21.3,3.25],[22.8,1.75],[20.8,2.15],[18.2,3.25],[15.3,4.45],[12.0,5.05],[9.2,5.15]]},
    {n:'AURELIAN_CANON_FORWARD_FLOW_BOTTOM',mat:m.goldDark,z:7.68,d:.36,p:[[8.7,-5.9],[12.6,-5.85],[16.0,-5.2],[19.0,-4.0],[21.4,-2.65],[22.8,-1.1],[20.7,-1.45],[18.1,-2.45],[15.2,-3.65],[11.9,-4.25],[9.1,-4.35]]},
    {n:'AURELIAN_CANON_PROW_NOSE_CAP',mat:m.gold,z:8.04,d:.50,p:[[20.5,3.15],[22.6,2.55],[24.2,1.35],[24.15,-1.25],[22.5,-2.5],[20.4,-3.0],[19.45,-.75],[19.55,1.35]]},
    {n:'AURELIAN_CANON_PROW_CENTER_PLATE',mat:m.gold,z:8.20,d:.24,p:[[14.5,1.85],[17.3,1.95],[20.0,1.45],[22.35,.75],[22.9,.22],[21.2,-.20],[19.2,-.68],[17.2,-1.12],[14.5,-1.35],[15.55,-.15],[15.65,.72]]},
    {n:'AURELIAN_CANON_PROW_IVORY_TOP',mat:m.ivory,z:8.31,d:.18,p:[[15.8,5.05],[17.6,4.55],[19.2,3.95],[18.1,4.02],[16.7,4.45]]},
    {n:'AURELIAN_CANON_PROW_IVORY_BOTTOM',mat:m.ivory,z:8.29,d:.18,p:[[15.8,-4.75],[17.7,-4.28],[19.3,-3.68],[18.1,-3.74],[16.7,-4.15]]}
  ];
  for(const a of plates)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.12),[a.mat,m.edge],a.n,0,0,a.z);

  const gussets=[
    {n:'AURELIAN_GUSSET_AFT_UPPER',mat:m.gold,p:[[-18.8,5.55],[-16.5,5.75],[-14.7,5.30],[-16.2,4.90],[-18.5,5.00]]},
    {n:'AURELIAN_GUSSET_AFT_MID',mat:m.goldDark,p:[[-18.9,1.35],[-16.5,1.55],[-14.9,1.18],[-16.4,.86],[-18.6,.95]]},
    {n:'AURELIAN_GUSSET_AFT_LOWER',mat:m.gold,p:[[-18.8,-2.85],[-16.4,-2.60],[-14.8,-2.96],[-16.3,-3.34],[-18.5,-3.30]]},
    {n:'AURELIAN_GUSSET_FORE_UPPER',mat:m.gold,p:[[9.8,5.20],[12.0,5.45],[13.3,4.82],[12.0,4.48],[10.0,4.55]]},
    {n:'AURELIAN_GUSSET_FORE_MID',mat:m.goldDark,p:[[10.0,1.15],[12.3,1.36],[13.5,.80],[12.2,.52],[10.0,.62]]},
    {n:'AURELIAN_GUSSET_FORE_LOWER',mat:m.gold,p:[[9.9,-2.95],[12.1,-2.72],[13.3,-3.26],[12.0,-3.56],[9.9,-3.48]]}
  ];
  for(const a of gussets)acHullMesh(kit,acHullExtrude(acHullShape(a.p),.20,.07),[a.mat,m.edge],a.n,0,0,8.10);

  const hub=acHullMesh(kit,new THREE.CylinderGeometry(.92,.92,.26,32),m.gold,'AURELIAN_CANON_CENTRAL_HUB',0.8,.2,8.30);hub.rotation.x=Math.PI/2;
  const hubRing=acHullMesh(kit,new THREE.TorusGeometry(.70,.10,10,32),m.edge,'AURELIAN_CANON_CENTRAL_HUB_RING',0.8,.2,8.49);hubRing.rotation.x=Math.PI/2;
  const hubCore=acHullMesh(kit,new THREE.CylinderGeometry(.26,.26,.06,24),m.goldDark,'AURELIAN_CANON_CENTRAL_HUB_CORE',0.8,.2,8.60);hubCore.rotation.x=Math.PI/2;

  const accents=[
    {n:'AURELIAN_CANON_DORSAL_IVORY_STRIP',mat:m.ivory,p:[[-7.5,10.08],[-2.0,10.42],[3.1,9.92],[.5,9.72],[-4.0,9.88]]},
    {n:'AURELIAN_CANON_COCKPIT_FAIRING',mat:m.gold,p:[[-22.3,8.0],[-18.4,8.95],[-14.0,8.72],[-11.4,7.95],[-14.8,7.55],[-18.9,7.35],[-21.8,7.15]]},
    {n:'AURELIAN_CANON_COCKPIT_IVORY_BROW',mat:m.ivory,p:[[-21.0,8.28],[-18.0,8.82],[-15.0,8.55],[-16.6,8.20],[-19.4,8.02]]},
    {n:'AURELIAN_CANON_FORE_UPPER_COLLAR',mat:m.gold,p:[[11.4,7.50],[13.8,7.10],[15.0,6.35],[13.7,6.55],[12.0,6.88]]},
    {n:'AURELIAN_CANON_FORE_LOWER_COLLAR',mat:m.goldDark,p:[[11.5,-6.50],[13.8,-6.12],[15.1,-5.35],[13.7,-5.55],[12.0,-5.92]]}
  ];
  for(const a of accents)acHullMesh(kit,acHullExtrude(acHullShape(a.p),.20,.07),[a.mat,m.edge],a.n,0,0,8.26);
}`;
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){'))patched=patched.replace('function acHullMachinery(kit,m){',silhouette+'\nfunction acHullMachinery(kit,m){');
  if(!patched.includes('  acHullReferenceSilhouette(kit,m);'))patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceSilhouette(kit,m);');
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){')||!patched.includes('acHullReferenceSilhouette(kit,m);'))return html;

  patched=patched.replace('structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4)','structure.userData.acHullRadii=new THREE.Vector3(33.0,12.7,9.7)');
  patched=patched.replace(/MATCH RECORDER v0\.42\.8/g,'MATCH RECORDER v0.43.9');
  patched=patched.replace(/build=2026-09-07_AURELIAN_REFERENCE_METALWORK/g,'build=2026-09-08_AURELIAN_COCKPIT_PROW_FLOW');
  patched=patched.replace(/build=v0\.42\.8 panels=6 apertures=6/g,'build=v0.43.9 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0439" name="ac-aurelian-reference-polish" content="reference:CANON hub:REDUCED cockpitToProw:CONTINUOUS_FLOW prow:BROAD layeredIvory:RESTRAINED exteriorDarkInsets:TINY frameMask:GOLD cannon:EXPOSED_DOOR_OWNED sixBays:PRESERVED exhausts:PRESERVED combat:UNCHANGED">\n</head>');
}
