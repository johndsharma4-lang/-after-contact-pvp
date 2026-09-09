function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0440'))return html;
  if(!html.includes('ac-aurelian-canon-exterior-v0428'))return html;
  let patched=html;

  const materials=String.raw`function acHullMaterials(){
  const t=acHullFinishResources();
  const metal=(color,roughness=.20,metalness=.96)=>new THREE.MeshStandardMaterial({color,metalness,roughness,map:t.map,roughnessMap:t.roughness,envMap:t.env,envMapIntensity:1.28});
  return {gold:metal(0xe0b452,.16),goldDark:metal(0x8a5b22,.23),edge:metal(0xffdc84,.12),bronze:metal(0x53341b,.27),dark:metal(0x0a0d11,.35,.84),ivory:metal(0xe5d7b5,.18,.80),sun:new THREE.MeshStandardMaterial({color:0xffc347,emissive:0xff9812,emissiveIntensity:2.35,metalness:.54,roughness:.15,envMap:t.env}),hot:new THREE.MeshBasicMaterial({color:0xffefc1}),blue:new THREE.MeshBasicMaterial({color:0x68d2ef}),glass:new THREE.MeshPhysicalMaterial({color:0x456a77,metalness:.10,roughness:.07,clearcoat:1,clearcoatRoughness:.05,envMap:t.env,envMapIntensity:1.0,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide}),trimLine:new THREE.LineBasicMaterial({color:0xf4dfae}),glassLine:new THREE.LineBasicMaterial({color:0xd7f1f3,transparent:true,opacity:.52}),seamLine:new THREE.LineBasicMaterial({color:0x18110a})};
}`;
  const afterMaterials=replaceFunction(patched,'function acHullMaterials(){','function acHullDetail(',materials);if(afterMaterials===patched)return html;patched=afterMaterials;

  const doorArmor=String.raw`function acHullDoorArmor(panel,s,m,index){
  const profile=s.points,w=s.w,h=s.h;
  const mask=profile.map(([x,y])=>[x*1.075,y*1.060]);
  const face=profile.map(([x,y])=>[x*.985,y*.960]);
  const inset=[[-w*.055,-h*.020],[w*.045,-h*.024],[w*.060,-h*.004],[w*.045,h*.022],[-w*.048,h*.024],[-w*.063,h*.004]];
  acHullMesh(panel,acHullExtrude(acHullShape(mask),.22,.08),[m.goldDark,m.bronze],'AURELIAN_CANON_BAY_FRAME_MASK_'+index,0,0,2.12);
  acHullMesh(panel,acHullExtrude(acHullShape(profile),.42,.10),[m.gold,m.edge],'AURELIAN_CANON_BAY_ARMOR_'+index,0,0,2.45);
  acHullMesh(panel,acHullExtrude(acHullShape(face),.22,.08),[m.gold,m.goldDark],'AURELIAN_CANON_BAY_FACE_'+index,0,0,2.84);
  acHullMesh(panel,acHullExtrude(acHullShape(inset),.032,.02),m.dark,'AURELIAN_CANON_BAY_TECH_SLIT_'+index,0,0,3.06);
  const ivoryTop=[[-w*.40,h*.17],[-w*.10,h*.22],[w*.28,h*.28],[w*.18,h*.34],[-w*.30,h*.31]];
  const goldLow=[[-w*.38,-h*.31],[w*.29,-h*.28],[w*.37,-h*.11],[w*.25,-h*.05],[-w*.14,-h*.12]];
  acHullMesh(panel,acHullExtrude(acHullShape(ivoryTop),.12,.06),[index<2?m.ivory:m.gold,m.edge],'AURELIAN_CANON_BAY_UPPER_SWEEP_'+index,0,0,3.08);
  acHullMesh(panel,acHullExtrude(acHullShape(goldLow),.13,.06),[m.goldDark,m.gold],'AURELIAN_CANON_BAY_LOWER_SWEEP_'+index,0,0,3.09);
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
    {n:'AURELIAN_CANON_PRIMARY_DORSAL_SHELL',mat:m.gold,z:7.42,d:.62,p:[[-27.2,5.6],[-23.8,7.3],[-18.8,8.8],[-12.5,10.1],[-4.0,10.9],[5.4,10.0],[12.0,8.0],[16.6,5.9],[20.0,3.9],[22.8,1.9],[24.2,.7],[21.1,1.4],[17.5,3.3],[13.0,5.2],[7.0,6.7],[-1.0,7.6],[-9.5,7.7],[-17.2,6.9],[-23.3,5.2]]},
    {n:'AURELIAN_CANON_PRIMARY_VENTRAL_SHELL',mat:m.goldDark,z:7.16,d:.64,p:[[-26.8,-5.3],[-22.9,-7.0],[-17.0,-8.2],[-9.3,-9.0],[0.0,-9.35],[8.0,-8.6],[14.2,-6.8],[18.7,-4.7],[22.0,-2.7],[24.2,.7],[21.0,-.2],[17.0,-2.1],[12.2,-4.0],[6.2,-5.6],[-1.7,-6.3],[-10.0,-6.3],[-17.5,-5.8],[-23.2,-4.6]]},
    {n:'AURELIAN_CANON_COCKPIT_SHOULDER',mat:m.gold,z:7.88,d:.42,p:[[-24.2,6.8],[-20.5,8.0],[-15.7,8.45],[-10.7,7.9],[-7.1,6.6],[-10.5,6.0],[-15.4,6.15],[-20.2,6.0]]},
    {n:'AURELIAN_CANON_COCKPIT_IVORY_MANTLE',mat:m.ivory,z:8.18,d:.24,p:[[-22.5,7.8],[-19.0,8.75],[-15.2,8.35],[-12.4,7.5],[-15.8,7.45],[-19.2,7.15]]},
    {n:'AURELIAN_CANON_FOREBODY_UPPER',mat:m.gold,z:7.92,d:.42,p:[[8.2,6.8],[12.2,6.8],[15.7,6.0],[18.6,4.8],[21.1,3.2],[23.2,1.65],[21.2,2.0],[18.4,3.1],[15.3,4.2],[11.8,5.0],[8.6,5.2]]},
    {n:'AURELIAN_CANON_FOREBODY_LOWER',mat:m.goldDark,z:7.70,d:.42,p:[[8.3,-5.8],[12.3,-5.7],[15.8,-5.0],[18.8,-3.8],[21.3,-2.35],[23.2,-.95],[21.0,-1.25],[18.3,-2.25],[15.2,-3.4],[11.7,-4.15],[8.5,-4.30]]},
    {n:'AURELIAN_CANON_BLUNT_PROW',mat:m.gold,z:8.04,d:.52,p:[[19.8,3.25],[22.1,2.7],[24.0,1.5],[24.7,.55],[24.5,-1.2],[22.6,-2.55],[20.1,-3.05],[19.0,-.85],[19.1,1.35]]},
    {n:'AURELIAN_CANON_PROW_IVORY_CROWN',mat:m.ivory,z:8.30,d:.20,p:[[15.2,5.1],[17.4,4.7],[19.5,3.95],[18.2,4.05],[16.2,4.55]]},
    {n:'AURELIAN_CANON_PROW_IVORY_CHIN',mat:m.ivory,z:8.28,d:.20,p:[[15.2,-4.7],[17.4,-4.25],[19.5,-3.6],[18.1,-3.7],[16.2,-4.15]]},
    {n:'AURELIAN_CANON_CENTER_BELT',mat:m.gold,z:8.10,d:.26,p:[[-18.0,1.0],[-10.0,1.6],[-1.0,1.75],[7.4,1.45],[14.0,.9],[19.0,.45],[14.5,.15],[7.0,.45],[-1.2,.6],[-10.2,.45],[-17.5,.1]]}
  ];
  for(const a of plates)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.13),[a.mat,m.edge],a.n,0,0,a.z);

  const local=[
    {n:'AURELIAN_CANON_AFT_UPPER_GUSSET',mat:m.gold,p:[[-20.2,5.5],[-17.0,5.9],[-14.6,5.3],[-16.3,4.8],[-19.6,4.9]]},
    {n:'AURELIAN_CANON_AFT_LOWER_GUSSET',mat:m.goldDark,p:[[-20.1,-3.2],[-16.9,-2.7],[-14.6,-3.0],[-16.2,-3.5],[-19.5,-3.6]]},
    {n:'AURELIAN_CANON_FORE_UPPER_GUSSET',mat:m.gold,p:[[10.1,5.2],[12.6,5.45],[14.1,4.85],[12.5,4.45],[10.1,4.55]]},
    {n:'AURELIAN_CANON_FORE_LOWER_GUSSET',mat:m.goldDark,p:[[10.0,-3.0],[12.5,-2.75],[14.0,-3.3],[12.4,-3.6],[10.0,-3.5]]}
  ];
  for(const a of local)acHullMesh(kit,acHullExtrude(acHullShape(a.p),.20,.07),[a.mat,m.edge],a.n,0,0,8.16);

  const hub=acHullMesh(kit,new THREE.CylinderGeometry(.58,.58,.18,28),m.gold,'AURELIAN_CANON_SMALL_HUB',.6,.15,8.34);hub.rotation.x=Math.PI/2;
  const hubRing=acHullMesh(kit,new THREE.TorusGeometry(.43,.07,8,28),m.edge,'AURELIAN_CANON_SMALL_HUB_RING',.6,.15,8.46);hubRing.rotation.x=Math.PI/2;
}`;
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){'))patched=patched.replace('function acHullMachinery(kit,m){',silhouette+'\nfunction acHullMachinery(kit,m){');
  if(!patched.includes('  acHullReferenceSilhouette(kit,m);'))patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceSilhouette(kit,m);');
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){')||!patched.includes('acHullReferenceSilhouette(kit,m);'))return html;

  patched=patched.replace('structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4)','structure.userData.acHullRadii=new THREE.Vector3(33.0,12.7,9.7)');
  patched=patched.replace(/MATCH RECORDER v0\.42\.8/g,'MATCH RECORDER v0.44.0');
  patched=patched.replace(/build=2026-09-07_AURELIAN_REFERENCE_METALWORK/g,'build=2026-09-08_AURELIAN_CANON_VISIBLE_SHELL_REBUILD');
  patched=patched.replace(/build=v0\.42\.8 panels=6 apertures=6/g,'build=v0.44.0 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0440" name="ac-aurelian-reference-polish" content="reference:CANON visibleShell:REBUILT silhouette:BROAD_CONTINUOUS palette:BRIGHT_GOLD_IVORY bays:VISUALLY_ABSORBED hub:MINIMAL cannon:EXPOSED_DOOR_OWNED sixBays:PRESERVED exhausts:PRESERVED combat:UNCHANGED">\n</head>');
}
