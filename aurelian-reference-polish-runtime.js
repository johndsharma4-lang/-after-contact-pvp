function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0442'))return html;
  if(!html.includes('ac-aurelian-canon-exterior-v0428'))return html;
  let patched=html;

  const materials=String.raw`function acHullMaterials(){
  const t=acHullFinishResources();
  const metal=(color,roughness=.20,metalness=.96)=>new THREE.MeshStandardMaterial({color,metalness,roughness,map:t.map,roughnessMap:t.roughness,envMap:t.env,envMapIntensity:1.40});
  return {gold:metal(0xf0c968,.14),goldDark:metal(0xa8712a,.22),edge:metal(0xffe7ae,.10),bronze:metal(0x68431e,.24),dark:metal(0x0a0d11,.35,.84),ivory:metal(0xf1e5c8,.16,.80),sun:new THREE.MeshStandardMaterial({color:0xffc347,emissive:0xff9812,emissiveIntensity:2.35,metalness:.54,roughness:.15,envMap:t.env}),hot:new THREE.MeshBasicMaterial({color:0xffefc1}),blue:new THREE.MeshBasicMaterial({color:0x68d2ef}),glass:new THREE.MeshPhysicalMaterial({color:0x3f6f80,metalness:.10,roughness:.05,clearcoat:1,clearcoatRoughness:.04,envMap:t.env,envMapIntensity:1.2,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide}),trimLine:new THREE.LineBasicMaterial({color:0xf7e5bb}),glassLine:new THREE.LineBasicMaterial({color:0xd7f1f3,transparent:true,opacity:.58}),seamLine:new THREE.LineBasicMaterial({color:0x18110a})};
}`;
  const afterMaterials=replaceFunction(patched,'function acHullMaterials(){','function acHullDetail(',materials);if(afterMaterials===patched)return html;patched=afterMaterials;

  const doorArmor=String.raw`function acHullDoorArmor(panel,s,m,index){
  const w=s.w,h=s.h;
  const profile=[[-w*.52,-h*.32],[w*.30,-h*.31],[w*.48,-h*.14],[w*.45,h*.16],[w*.30,h*.31],[-w*.50,h*.30],[-w*.58,h*.08],[-w*.58,-h*.08]];
  const face=profile.map(([x,y])=>[x*.985,y*.955]);
  const rim=profile.map(([x,y])=>[x*1.035,y*1.035]);
  acHullMesh(panel,acHullExtrude(acHullShape(rim),.16,.07),[m.goldDark,m.bronze],'AURELIAN_CANON_BAY_FRAME_MASK_'+index,0,0,2.20);
  acHullMesh(panel,acHullExtrude(acHullShape(profile),.34,.09),[m.gold,m.edge],'AURELIAN_CANON_BAY_ARMOR_'+index,0,0,2.50);
  acHullMesh(panel,acHullExtrude(acHullShape(face),.16,.06),[m.gold,m.goldDark],'AURELIAN_CANON_BAY_FACE_'+index,0,0,2.82);
  if(index===0){
    const canopy=[[-w*.45,-h*.02],[w*.18,-h*.10],[w*.42,h*.03],[w*.27,h*.28],[-w*.28,h*.31],[-w*.48,h*.17]];
    acHullMesh(panel,acHullExtrude(acHullShape(canopy),.065,.025),[m.glass,m.edge],'AURELIAN_CANON_COCKPIT_CANOPY',0,0,3.12);
  }else{
    const slit=[[-w*.23,-h*.025],[w*.20,-h*.025],[w*.25,0],[w*.20,h*.025],[-w*.23,h*.025],[-w*.27,0]];
    acHullMesh(panel,acHullExtrude(acHullShape(slit),.025,.015),m.goldDark,'AURELIAN_CANON_BAY_TECH_SLIT_'+index,0,0,3.02);
  }
  const upper=[[-w*.54,h*.15],[-w*.20,h*.26],[w*.34,h*.28],[w*.42,h*.17],[w*.10,h*.12],[-w*.34,h*.12]];
  const lower=[[-w*.50,-h*.28],[w*.28,-h*.27],[w*.42,-h*.14],[w*.17,-h*.10],[-w*.26,-h*.13]];
  acHullMesh(panel,acHullExtrude(acHullShape(upper),.10,.045),[index===0?m.ivory:m.gold,m.edge],'AURELIAN_CANON_BAY_UPPER_SWEEP_'+index,0,0,3.08);
  acHullMesh(panel,acHullExtrude(acHullShape(lower),.10,.045),[m.goldDark,m.gold],'AURELIAN_CANON_BAY_LOWER_SWEEP_'+index,0,0,3.09);
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
    {n:'AURELIAN_CANON_PRIMARY_DORSAL_SHELL',mat:m.gold,z:7.44,d:.60,p:[[-27.5,5.1],[-24.0,7.1],[-19.2,8.9],[-13.0,10.2],[-6.0,10.9],[1.5,10.6],[8.2,9.1],[13.8,7.2],[18.0,5.0],[21.1,3.0],[23.5,1.2],[24.2,.4],[21.0,1.1],[17.0,3.0],[12.4,4.8],[6.6,6.1],[.2,6.8],[-6.8,6.9],[-13.8,6.4],[-20.4,5.7],[-25.0,4.6]]},
    {n:'AURELIAN_CANON_PRIMARY_VENTRAL_SHELL',mat:m.gold,z:7.18,d:.60,p:[[-27.0,-4.9],[-23.3,-6.5],[-18.0,-7.9],[-11.3,-8.8],[-3.6,-9.3],[4.2,-9.0],[10.6,-7.8],[15.7,-6.0],[19.5,-4.1],[22.1,-2.4],[24.1,.3],[21.0,-.4],[17.0,-2.3],[12.4,-3.8],[6.4,-5.0],[-.2,-5.6],[-7.6,-5.8],[-14.6,-5.5],[-20.8,-4.8],[-25.0,-4.1]]},
    {n:'AURELIAN_CANON_COCKPIT_SHOULDER',mat:m.gold,z:7.92,d:.42,p:[[-24.7,6.4],[-21.3,8.1],[-16.6,9.2],[-11.9,8.9],[-8.2,7.2],[-10.9,6.3],[-16.0,6.4],[-21.4,5.9]]},
    {n:'AURELIAN_CANON_COCKPIT_IVORY_MANTLE',mat:m.ivory,z:8.20,d:.24,p:[[-23.2,7.5],[-19.7,8.8],[-16.0,8.9],[-13.1,8.1],[-15.5,7.4],[-19.2,7.0]]},
    {n:'AURELIAN_CANON_COCKPIT_GLASS',mat:m.glass,z:8.40,d:.08,p:[[-22.1,7.2],[-19.6,8.25],[-16.6,8.2],[-14.6,7.6],[-16.5,7.05],[-19.4,6.8]]},
    {n:'AURELIAN_CANON_FOREBODY_UPPER',mat:m.gold,z:7.96,d:.42,p:[[6.9,6.3],[11.1,6.1],[14.9,5.3],[18.2,4.1],[21.0,2.8],[23.2,1.4],[21.0,1.7],[18.0,2.7],[14.6,3.7],[10.7,4.5],[7.2,4.8]]},
    {n:'AURELIAN_CANON_FOREBODY_LOWER',mat:m.goldDark,z:7.72,d:.42,p:[[7.0,-4.9],[11.3,-4.8],[15.0,-4.2],[18.2,-3.3],[21.1,-2.0],[23.2,-.9],[20.9,-1.1],[17.8,-2.0],[14.4,-2.9],[10.7,-3.6],[7.1,-3.7]]},
    {n:'AURELIAN_CANON_BLUNT_PROW',mat:m.gold,z:8.08,d:.52,p:[[19.0,3.0],[21.7,2.5],[23.8,1.45],[24.8,.45],[24.55,-1.0],[22.6,-2.35],[19.7,-2.8],[18.8,-.8],[18.9,1.25]]},
    {n:'AURELIAN_CANON_PROW_IVORY_CROWN',mat:m.ivory,z:8.32,d:.18,p:[[14.0,5.1],[16.4,4.7],[18.8,3.95],[17.6,4.15],[15.4,4.6]]},
    {n:'AURELIAN_CANON_PROW_IVORY_CHIN',mat:m.ivory,z:8.30,d:.18,p:[[14.0,-4.2],[16.5,-3.9],[18.8,-3.35],[17.5,-3.45],[15.4,-3.85]]},
    {n:'AURELIAN_CANON_LOWER_CANNON_FAIRING',mat:m.goldDark,z:8.02,d:.30,p:[[-7.2,-8.7],[-2.8,-9.7],[4.5,-9.4],[10.4,-7.8],[8.4,-6.8],[1.6,-6.4],[-4.8,-6.8]]}
  ];
  for(const a of plates)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.13),[a.mat,m.edge],a.n,0,0,a.z);

  const bridges=[
    {n:'AURELIAN_CANON_AFT_UPPER_BRIDGE',mat:m.gold,p:[[-22.2,5.0],[-18.0,5.7],[-13.7,5.5],[-15.2,4.8],[-20.7,4.4]]},
    {n:'AURELIAN_CANON_AFT_LOWER_BRIDGE',mat:m.goldDark,p:[[-22.0,-2.8],[-17.8,-2.5],[-13.9,-2.9],[-15.3,-3.5],[-20.8,-3.5]]},
    {n:'AURELIAN_CANON_FORE_UPPER_BRIDGE',mat:m.gold,p:[[8.8,4.8],[12.1,5.0],[14.9,4.4],[12.7,3.9],[9.0,4.1]]},
    {n:'AURELIAN_CANON_FORE_LOWER_BRIDGE',mat:m.goldDark,p:[[8.8,-2.8],[12.1,-2.6],[14.9,-3.1],[12.7,-3.5],[9.0,-3.3]]}
  ];
  for(const a of bridges)acHullMesh(kit,acHullExtrude(acHullShape(a.p),.18,.07),[a.mat,m.edge],a.n,0,0,8.16);

  const hub=acHullMesh(kit,new THREE.CylinderGeometry(.38,.38,.14,28),m.gold,'AURELIAN_CANON_SMALL_HUB',.6,.15,8.34);hub.rotation.x=Math.PI/2;
  const hubRing=acHullMesh(kit,new THREE.TorusGeometry(.28,.045,8,28),m.edge,'AURELIAN_CANON_SMALL_HUB_RING',.6,.15,8.46);hubRing.rotation.x=Math.PI/2;
}`;
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){'))patched=patched.replace('function acHullMachinery(kit,m){',silhouette+'\nfunction acHullMachinery(kit,m){');
  if(!patched.includes('  acHullReferenceSilhouette(kit,m);'))patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceSilhouette(kit,m);');
  if(!patched.includes('function acHullReferenceSilhouette(kit,m){')||!patched.includes('acHullReferenceSilhouette(kit,m);'))return html;

  patched=patched.replace('structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4)','structure.userData.acHullRadii=new THREE.Vector3(33.0,12.8,9.8)');
  patched=patched.replace(/MATCH RECORDER v0\.42\.8/g,'MATCH RECORDER v0.44.2');
  patched=patched.replace(/build=2026-09-07_AURELIAN_REFERENCE_METALWORK/g,'build=2026-09-09_AURELIAN_CANON_PROPORTION_PASS');
  patched=patched.replace(/build=v0\.42\.8 panels=6 apertures=6/g,'build=v0.44.2 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0442" name="ac-aurelian-reference-polish" content="reference:CANON proportionPass:TRUE silhouette:TALLER_LAYERED palette:BRIGHT_GOLD_IVORY cockpit:TOP_CANOPY doors:WEDGE_INTEGRATED hub:MINIMAL cannon:FAIRED sixBays:PRESERVED exhausts:PRESERVED combat:UNCHANGED">\n</head>');
}