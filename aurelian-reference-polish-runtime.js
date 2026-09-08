function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0435'))return html;
  if(!html.includes('ac-aurelian-canon-exterior-v0428'))return html;
  let patched=html;

  const materials=String.raw`function acHullMaterials(){
  const t=acHullFinishResources();
  const metal=(color,roughness=.24,metalness=.95)=>new THREE.MeshStandardMaterial({color,metalness,roughness,map:t.map,roughnessMap:t.roughness,envMap:t.env,envMapIntensity:1.10});
  return {gold:metal(0xd5a548,.18),goldDark:metal(0x71491c,.28),edge:metal(0xf4ce78,.15),bronze:metal(0x3d2818,.31),dark:metal(0x080c12,.35,.82),ivory:metal(0xd7c49d,.23,.77),sun:new THREE.MeshStandardMaterial({color:0xffc347,emissive:0xff9812,emissiveIntensity:2.35,metalness:.54,roughness:.15,envMap:t.env}),hot:new THREE.MeshBasicMaterial({color:0xffefc1}),blue:new THREE.MeshBasicMaterial({color:0x68d2ef}),glass:new THREE.MeshPhysicalMaterial({color:0x456a77,metalness:.10,roughness:.07,clearcoat:1,clearcoatRoughness:.05,envMap:t.env,envMapIntensity:1.0,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide}),trimLine:new THREE.LineBasicMaterial({color:0xefd7a0}),glassLine:new THREE.LineBasicMaterial({color:0xd7f1f3,transparent:true,opacity:.52}),seamLine:new THREE.LineBasicMaterial({color:0x18110a})};
}`;
  const afterMaterials=replaceFunction(patched,'function acHullMaterials(){','function acHullDetail(',materials);if(afterMaterials===patched)return html;patched=afterMaterials;

  const doorArmor=String.raw`function acHullDoorArmor(panel,s,m,index){
  const profile=s.points,w=s.w,h=s.h;
  const face=profile.map(([x,y])=>[x*.91,y*.86]);
  const inset=profile.map(([x,y])=>[x*.62,y*.48]);
  acHullMesh(panel,acHullExtrude(acHullShape(profile),.42,.10),[m.bronze,m.goldDark],'AURELIAN_HULL_ARMOR_'+index,0,0,2.07);
  acHullMesh(panel,acHullExtrude(acHullShape(face),.26,.11),[m.gold,m.edge],'AURELIAN_HULL_GOLD_FACE_'+index,0,0,2.46);
  acHullMesh(panel,acHullExtrude(acHullShape(inset),.10,.06),m.dark,'AURELIAN_HULL_SMALL_RECESSED_FIELD_'+index,0,0,2.77);
  const upper=[[-w*.38,h*.09],[w*.06,h*.13],[w*.31,h*.27],[-w*.27,h*.30]];
  const lower=[[-w*.34,-h*.28],[w*.24,-h*.26],[w*.34,-h*.08],[-w*.08,-h*.12]];
  const center=[[-w*.26,-h*.045],[w*.19,-h*.065],[w*.27,h*.055],[-w*.19,h*.09]];
  acHullMesh(panel,acHullExtrude(acHullShape(upper),.18,.08),[index===0?m.ivory:m.gold,m.edge],'AURELIAN_HULL_UPPER_FACET_'+index,0,0,2.94);
  acHullMesh(panel,acHullExtrude(acHullShape(lower),.18,.08),[m.goldDark,m.gold],'AURELIAN_HULL_LOWER_FACET_'+index,0,0,2.95);
  acHullMesh(panel,acHullExtrude(acHullShape(center),.19,.08),[m.gold,m.edge],'AURELIAN_HULL_CENTER_RIDGE_'+index,0,0,3.02);
  for(const sy of[-1,1])acHullDetail(panel,new THREE.BoxGeometry(w*.28,.045,.055),sy>0?m.hot:m.bronze,'AURELIAN_DOOR_EDGE_GLEAM',-.04*w,sy*h*.20,3.06);
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
    {n:'AURELIAN_CANON_PROW_UPPER_MASS',mat:m.gold,z:7.82,d:.48,p:[[14.1,6.9],[17.1,6.15],[20.1,5.15],[23.0,3.75],[25.0,2.55],[25.8,1.35],[23.8,1.9],[21.0,3.0],[18.2,4.45],[15.5,5.55]]},
    {n:'AURELIAN_CANON_PROW_LOWER_MASS',mat:m.goldDark,z:7.56,d:.48,p:[[14.1,-6.1],[17.3,-5.55],[20.4,-4.55],[23.1,-3.15],[25.1,-2.05],[25.8,-.85],[23.7,-1.25],[20.9,-2.45],[18.0,-3.75],[15.4,-4.85]]},
    {n:'AURELIAN_CANON_PROW_NOSE_CAP',mat:m.gold,z:8.00,d:.46,p:[[23.0,2.65],[25.1,2.0],[26.25,.85],[26.15,-.95],[24.9,-2.05],[22.9,-2.55],[21.9,-.65],[21.95,1.05]]},
    {n:'AURELIAN_CANON_PROW_DARK_GAP',mat:m.dark,z:8.06,d:.24,p:[[15.0,2.25],[18.2,2.1],[21.3,1.55],[24.7,.82],[25.1,.2],[23.4,-.35],[20.9,-.95],[18.1,-1.45],[15.0,-1.75],[16.3,-.25],[16.4,.85]]},
    {n:'AURELIAN_CANON_PROW_GOLD_SPINE',mat:m.edge,z:8.24,d:.18,p:[[15.4,1.35],[18.6,1.55],[21.5,1.18],[25.45,.55],[22.0,.72],[19.0,.58],[16.3,.48]]},
    {n:'AURELIAN_CANON_PROW_IVORY_TOP',mat:m.ivory,z:8.30,d:.18,p:[[16.0,5.45],[18.3,4.78],[20.6,3.88],[19.0,4.02],[17.0,4.68]]},
    {n:'AURELIAN_CANON_PROW_IVORY_BOTTOM',mat:m.ivory,z:8.28,d:.18,p:[[16.0,-5.15],[18.4,-4.48],[20.7,-3.62],[19.0,-3.76],[17.0,-4.42]]}
  ];
  for(const a of plates)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.12),[a.mat,m.edge],a.n,0,0,a.z);
  const accents=[
    {n:'AURELIAN_CANON_DORSAL_IVORY_STRIP',mat:m.ivory,p:[[-7.5,10.08],[-2.0,10.42],[3.1,9.92],[.5,9.72],[-4.0,9.88]]},
    {n:'AURELIAN_CANON_FORE_UPPER_COLLAR',mat:m.gold,p:[[11.6,7.55],[14.0,7.15],[15.2,6.35],[13.9,6.55],[12.2,6.9]]},
    {n:'AURELIAN_CANON_FORE_LOWER_COLLAR',mat:m.goldDark,p:[[11.7,-6.55],[14.0,-6.15],[15.3,-5.35],[13.9,-5.55],[12.2,-5.95]]}
  ];
  for(const a of accents)acHullMesh(kit,acHullExtrude(acHullShape(a.p),.20,.07),[a.mat,m.edge],a.n,0,0,8.26);
}`;
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){'))patched=patched.replace('function acHullMachinery(kit,m){',silhouette+'\nfunction acHullMachinery(kit,m){');
  if(!patched.includes('  acHullReferenceSilhouette(kit,m);'))patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceSilhouette(kit,m);');
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){')||!patched.includes('acHullReferenceSilhouette(kit,m);'))return html;

  patched=patched.replace('structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4)','structure.userData.acHullRadii=new THREE.Vector3(33.5,12.7,9.7)');
  patched=patched.replace(/MATCH RECORDER v0\.42\.8/g,'MATCH RECORDER v0.43.5');
  patched=patched.replace(/build=2026-09-07_AURELIAN_REFERENCE_METALWORK/g,'build=2026-09-07_AURELIAN_CANON_BROAD_NOSE_GOLD_BAYS');
  patched=patched.replace(/build=v0\.42\.8 panels=6 apertures=6/g,'build=v0.43.5 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0435" name="ac-aurelian-reference-polish" content="reference:CANON prow:BROAD_NOSE_CAP closedBays:GOLD_CLAD darkInset:SMALL cannon:EXPOSED_DOOR_OWNED sixBays:PRESERVED exhausts:PRESERVED combat:UNCHANGED">\n</head>');
}
