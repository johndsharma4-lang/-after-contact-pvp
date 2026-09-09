function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0441'))return html;
  if(!html.includes('ac-aurelian-canon-exterior-v0428'))return html;
  let patched=html;

  const materials=String.raw`function acHullMaterials(){
  const t=acHullFinishResources();
  const metal=(color,roughness=.20,metalness=.96)=>new THREE.MeshStandardMaterial({color,metalness,roughness,map:t.map,roughnessMap:t.roughness,envMap:t.env,envMapIntensity:1.32});
  return {gold:metal(0xe7bd5b,.15),goldDark:metal(0xa46f2b,.21),edge:metal(0xffe19a,.11),bronze:metal(0x67431f,.25),dark:metal(0x0a0d11,.35,.84),ivory:metal(0xeadfbe,.17,.80),sun:new THREE.MeshStandardMaterial({color:0xffc347,emissive:0xff9812,emissiveIntensity:2.35,metalness:.54,roughness:.15,envMap:t.env}),hot:new THREE.MeshBasicMaterial({color:0xffefc1}),blue:new THREE.MeshBasicMaterial({color:0x68d2ef}),glass:new THREE.MeshPhysicalMaterial({color:0x456a77,metalness:.10,roughness:.07,clearcoat:1,clearcoatRoughness:.05,envMap:t.env,envMapIntensity:1.0,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide}),trimLine:new THREE.LineBasicMaterial({color:0xf7e5bb}),glassLine:new THREE.LineBasicMaterial({color:0xd7f1f3,transparent:true,opacity:.52}),seamLine:new THREE.LineBasicMaterial({color:0x18110a})};
}`;
  const afterMaterials=replaceFunction(patched,'function acHullMaterials(){','function acHullDetail(',materials);if(afterMaterials===patched)return html;patched=afterMaterials;

  const doorArmor=String.raw`function acHullDoorArmor(panel,s,m,index){
  const profile=s.points,w=s.w,h=s.h;
  const mask=profile.map(([x,y])=>[x*1.065,y*1.050]);
  const face=profile.map(([x,y])=>[x*.982,y*.952]);
  acHullMesh(panel,acHullExtrude(acHullShape(mask),.20,.08),[m.goldDark,m.bronze],'AURELIAN_CANON_BAY_FRAME_MASK_'+index,0,0,2.12);
  acHullMesh(panel,acHullExtrude(acHullShape(profile),.38,.10),[m.gold,m.edge],'AURELIAN_CANON_BAY_ARMOR_'+index,0,0,2.45);
  acHullMesh(panel,acHullExtrude(acHullShape(face),.20,.08),[m.gold,m.goldDark],'AURELIAN_CANON_BAY_FACE_'+index,0,0,2.84);
  if(index===0){
    const canopy=[[-w*.39,-h*.12],[w*.24,-h*.15],[w*.39,-h*.02],[w*.28,h*.17],[-w*.28,h*.19],[-w*.42,h*.05]];
    acHullMesh(panel,acHullExtrude(acHullShape(canopy),.055,.025),[m.glass,m.edge],'AURELIAN_CANON_COCKPIT_CANOPY',0,0,3.08);
  }else{
    const inset=[[-w*.050,-h*.018],[w*.042,-h*.021],[w*.055,-h*.003],[w*.042,h*.019],[-w*.044,h*.021],[-w*.058,h*.003]];
    acHullMesh(panel,acHullExtrude(acHullShape(inset),.030,.02),m.dark,'AURELIAN_CANON_BAY_TECH_SLIT_'+index,0,0,3.06);
  }
  const upper=[[-w*.44,h*.13],[-w*.12,h*.22],[w*.34,h*.25],[w*.20,h*.34],[-w*.32,h*.30]];
  const lower=[[-w*.42,-h*.30],[w*.31,-h*.27],[w*.39,-h*.10],[w*.23,-h*.05],[-w*.18,-h*.13]];
  acHullMesh(panel,acHullExtrude(acHullShape(upper),.11,.055),[index===0?m.ivory:m.gold,m.edge],'AURELIAN_CANON_BAY_UPPER_SWEEP_'+index,0,0,3.10);
  acHullMesh(panel,acHullExtrude(acHullShape(lower),.11,.055),[m.goldDark,m.gold],'AURELIAN_CANON_BAY_LOWER_SWEEP_'+index,0,0,3.11);
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
    {n:'AURELIAN_CANON_PRIMARY_DORSAL_SHELL',mat:m.gold,z:7.42,d:.58,p:[[-27.0,5.5],[-23.2,7.1],[-17.7,8.5],[-11.2,9.6],[-3.8,10.15],[4.0,9.55],[10.7,7.8],[15.6,5.9],[19.4,3.9],[22.5,1.8],[23.7,.7],[20.8,1.5],[17.2,3.3],[12.8,5.0],[7.0,6.35],[-.8,7.15],[-9.0,7.2],[-16.7,6.6],[-23.0,5.0]]},
    {n:'AURELIAN_CANON_PRIMARY_VENTRAL_SHELL',mat:m.gold,z:7.18,d:.58,p:[[-26.6,-5.1],[-22.4,-6.7],[-16.5,-7.8],[-9.0,-8.55],[-1.0,-8.8],[6.8,-8.0],[13.2,-6.45],[18.0,-4.5],[21.6,-2.6],[23.7,.7],[20.8,-.2],[16.8,-2.0],[12.0,-3.8],[6.0,-5.15],[-1.6,-5.75],[-9.6,-5.75],[-17.0,-5.35],[-22.8,-4.4]]},
    {n:'AURELIAN_CANON_COCKPIT_SHOULDER',mat:m.gold,z:7.88,d:.40,p:[[-24.0,6.7],[-20.3,7.9],[-15.5,8.3],[-10.8,7.75],[-7.5,6.55],[-10.8,6.05],[-15.3,6.15],[-20.1,5.95]]},
    {n:'AURELIAN_CANON_COCKPIT_IVORY_MANTLE',mat:m.ivory,z:8.18,d:.22,p:[[-22.3,7.75],[-18.9,8.55],[-15.4,8.20],[-12.8,7.45],[-15.8,7.42],[-19.1,7.12]]},
    {n:'AURELIAN_CANON_FOREBODY_UPPER',mat:m.gold,z:7.92,d:.40,p:[[8.0,6.45],[12.0,6.45],[15.5,5.7],[18.4,4.55],[20.9,3.05],[22.9,1.55],[20.9,1.95],[18.0,3.0],[15.0,4.0],[11.5,4.75],[8.3,4.95]]},
    {n:'AURELIAN_CANON_FOREBODY_LOWER',mat:m.goldDark,z:7.70,d:.40,p:[[8.1,-5.25],[12.1,-5.2],[15.5,-4.65],[18.5,-3.55],[21.0,-2.2],[22.9,-.9],[20.8,-1.2],[18.0,-2.15],[14.9,-3.2],[11.4,-3.9],[8.3,-4.05]]},
    {n:'AURELIAN_CANON_BLUNT_PROW',mat:m.gold,z:8.04,d:.50,p:[[19.6,3.1],[21.9,2.55],[23.7,1.45],[24.25,.5],[24.0,-1.1],[22.3,-2.4],[19.9,-2.9],[18.9,-.8],[19.0,1.3]]},
    {n:'AURELIAN_CANON_PROW_IVORY_CROWN',mat:m.ivory,z:8.30,d:.18,p:[[14.8,4.95],[17.0,4.55],[19.2,3.8],[17.9,3.95],[15.9,4.4]]},
    {n:'AURELIAN_CANON_PROW_IVORY_CHIN',mat:m.ivory,z:8.28,d:.18,p:[[14.8,-4.35],[17.0,-4.0],[19.2,-3.4],[17.8,-3.5],[15.9,-3.9]]}
  ];
  for(const a of plates)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.13),[a.mat,m.edge],a.n,0,0,a.z);

  const bridges=[
    {n:'AURELIAN_CANON_AFT_UPPER_BRIDGE',mat:m.gold,p:[[-21.0,5.4],[-17.0,5.85],[-13.4,5.35],[-14.8,4.85],[-19.8,4.8]]},
    {n:'AURELIAN_CANON_AFT_LOWER_BRIDGE',mat:m.goldDark,p:[[-20.8,-3.0],[-16.8,-2.65],[-13.5,-3.0],[-15.0,-3.45],[-19.8,-3.5]]},
    {n:'AURELIAN_CANON_FORE_UPPER_BRIDGE',mat:m.gold,p:[[9.8,5.0],[12.7,5.25],[15.0,4.55],[13.0,4.18],[9.9,4.35]]},
    {n:'AURELIAN_CANON_FORE_LOWER_BRIDGE',mat:m.goldDark,p:[[9.8,-2.85],[12.7,-2.6],[14.9,-3.15],[12.9,-3.5],[9.9,-3.35]]}
  ];
  for(const a of bridges)acHullMesh(kit,acHullExtrude(acHullShape(a.p),.18,.07),[a.mat,m.edge],a.n,0,0,8.16);

  const hub=acHullMesh(kit,new THREE.CylinderGeometry(.46,.46,.16,28),m.gold,'AURELIAN_CANON_SMALL_HUB',.6,.15,8.34);hub.rotation.x=Math.PI/2;
  const hubRing=acHullMesh(kit,new THREE.TorusGeometry(.34,.055,8,28),m.edge,'AURELIAN_CANON_SMALL_HUB_RING',.6,.15,8.46);hubRing.rotation.x=Math.PI/2;
}`;
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){'))patched=patched.replace('function acHullMachinery(kit,m){',silhouette+'\nfunction acHullMachinery(kit,m){');
  if(!patched.includes('  acHullReferenceSilhouette(kit,m);'))patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceSilhouette(kit,m);');
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){')||!patched.includes('acHullReferenceSilhouette(kit,m);'))return html;

  patched=patched.replace('structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4)','structure.userData.acHullRadii=new THREE.Vector3(32.5,12.4,9.7)');
  patched=patched.replace(/MATCH RECORDER v0\.42\.8/g,'MATCH RECORDER v0.44.1');
  patched=patched.replace(/build=2026-09-07_AURELIAN_REFERENCE_METALWORK/g,'build=2026-09-09_AURELIAN_CANON_RENDER_CORRECTION');
  patched=patched.replace(/build=v0\.42\.8 panels=6 apertures=6/g,'build=v0.44.1 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0441" name="ac-aurelian-reference-polish" content="reference:CANON renderCorrection:TRUE silhouette:BROAD_LAYERED palette:BRIGHT_GOLD_IVORY cockpit:DOOR_OWNED_GLASS centerBelt:REMOVED hub:MINIMAL cannon:EXPOSED_DOOR_OWNED sixBays:PRESERVED exhausts:PRESERVED combat:UNCHANGED">\n</head>');
}