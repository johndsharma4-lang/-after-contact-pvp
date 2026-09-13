function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0480'))return html;
  if(!html.includes('ac-aurelian-canon-exterior-v0428'))return html;
  let patched=html;

  const materials=String.raw`function acHullMaterials(){
  const t=acHullFinishResources();
  const metal=(color,roughness=.28,metalness=.94,intensity=1.08)=>new THREE.MeshStandardMaterial({color,metalness,roughness,map:t.map,roughnessMap:t.roughness,envMap:t.env,envMapIntensity:intensity});
  return {gold:metal(0xa96f24,.22),goldDark:metal(0x4f2d12,.30),edge:metal(0xf0be5d,.17,1,1.20),bronze:metal(0x27170d,.34,.91,.90),dark:metal(0x070b10,.30,.82,.72),ivory:metal(0xcbbd96,.25,.76,1.05),sun:new THREE.MeshStandardMaterial({color:0xffc548,emissive:0xff9414,emissiveIntensity:2.75,metalness:.50,roughness:.14,envMap:t.env,envMapIntensity:1.1}),hot:new THREE.MeshBasicMaterial({color:0xfff0c5}),blue:new THREE.MeshBasicMaterial({color:0x72d7ff}),glass:new THREE.MeshPhysicalMaterial({color:0x355f70,metalness:.10,roughness:.055,clearcoat:1,clearcoatRoughness:.035,envMap:t.env,envMapIntensity:1.25,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide}),trimLine:new THREE.LineBasicMaterial({color:0xffd77e}),glassLine:new THREE.LineBasicMaterial({color:0xcff5ff,transparent:true,opacity:.70}),seamLine:new THREE.LineBasicMaterial({color:0x120a05})};
}`;
  const afterMaterials=replaceFunction(patched,'function acHullMaterials(){','function acHullDetail(',materials);
  if(afterMaterials===patched)return html;patched=afterMaterials;

  const doorArmor=String.raw`function acHullDoorArmor(panel,s,m,index){
  const profile=s.points,w=s.w,h=s.h,mid=profile.map(([x,y])=>[x*.935,y*.875]),inner=profile.map(([x,y])=>[x*.855,y*.705]);
  // The reference reads as a thick armored window surround, not a flat gold drawer.
  acHullMesh(panel,acHullExtrude(acHullShape(profile),.48,.13),[m.bronze,m.goldDark],'AURELIAN_HULL_ARMOR_'+index,0,0,2.02);
  acHullMesh(panel,acHullExtrude(acHullShape(mid),.28,.12),[m.goldDark,m.gold],'AURELIAN_DOOR_STEPPED_BEZEL_'+index,0,0,2.48);
  acHullMesh(panel,acHullExtrude(acHullShape(inner),.16,.08),m.dark,'AURELIAN_HULL_RECESSED_FIELD_'+index,0,0,2.82);
  const upper=[[-w*.37,h*.12],[-w*.08,h*.23],[w*.30,h*.25],[w*.38,h*.12],[w*.18,h*.05],[-w*.31,h*.04]];
  const lower=[[-w*.35,-h*.18],[-w*.12,-h*.08],[w*.30,-h*.10],[w*.37,-h*.22],[w*.18,-h*.29],[-w*.29,-h*.27]];
  const spine=[[-w*.33,-h*.045],[w*.23,-h*.055],[w*.34,h*.035],[-w*.24,h*.075]];
  acHullMesh(panel,acHullExtrude(acHullShape(upper),.20,.075),[m.gold,m.edge],'AURELIAN_HULL_UPPER_SWEEP_'+index,0,0,3.00);
  acHullMesh(panel,acHullExtrude(acHullShape(lower),.18,.07),[m.goldDark,m.gold],'AURELIAN_HULL_LOWER_SWEEP_'+index,0,0,3.01);
  acHullMesh(panel,acHullExtrude(acHullShape(spine),.18,.065),[m.bronze,m.edge],'AURELIAN_HULL_CENTER_SPINE_'+index,0,0,3.13);
  for(const sx of[-1,1]){
    const cheek=sx<0?[[-w*.40,-h*.18],[-w*.33,-h*.13],[-w*.32,h*.18],[-w*.39,h*.22]]:[[w*.31,-h*.17],[w*.40,-h*.12],[w*.38,h*.20],[w*.30,h*.15]];
    acHullMesh(panel,acHullExtrude(acHullShape(cheek),.16,.06),sx<0?m.bronze:m.gold,'AURELIAN_HULL_SIDE_CHEEK_'+index+'_'+sx,0,0,3.04);
  }
  for(const sy of[-1,1]){
    const vy=sy*h*.215;acHullDetail(panel,new THREE.BoxGeometry(w*.46,.045,.055),sy<0?m.goldDark:m.hot,'AURELIAN_DOOR_EDGE_LIGHT',-w*.02,vy,3.24);
    for(let j=0;j<6;j++){const vent=acHullDetail(panel,new THREE.BoxGeometry(.055,h*.075,.11),m.bronze,'AURELIAN_DOOR_HEAT_VENT',w*.17+j*.105,vy,3.22);vent.rotation.z=-.20;}
  }
  for(const sx of[-1,1])for(const sy of[-1,1])acHullDetail(panel,new THREE.CylinderGeometry(.072,.072,.06,10),m.edge,'AURELIAN_DOOR_FASTENER',sx*w*.30,sy*h*.23,3.23).rotation.x=Math.PI/2;
}`;
  const afterDoor=replaceFunction(patched,'function acHullDoorArmor(panel,s,m,index){','function acHullMesh(',doorArmor);
  if(afterDoor===patched)return html;patched=afterDoor;

  const cockpitArt=String.raw`function acHullCockpit(panel,s,m){
  const cockpit=new THREE.Group();cockpit.name='AURELIAN_CANON_COCKPIT';panel.add(cockpit);
  const outer=[[-5.25,-1.62],[2.72,-1.62],[4.05,-.62],[3.42,1.88],[1.72,2.48],[-2.72,2.42],[-5.62,.78]],window=[[-3.82,-1.08],[2.30,-1.08],[3.13,-.34],[2.72,1.42],[1.20,1.88],[-2.35,1.83],[-4.18,.58]];
  acHullMesh(cockpit,acHullExtrude(acHullShape(outer,[window.slice().reverse()]),.54,.11),[m.bronze,m.goldDark],'AURELIAN_COCKPIT_ARMORED_SLED',0,0,2.10);
  acHullMesh(cockpit,acHullExtrude(acHullShape(outer.map(([x,y])=>[x*.96,y*.92]),[window.map(([x,y])=>[x*.99,y*.99]).reverse()]),.18,.08),[m.gold,m.edge],'AURELIAN_COCKPIT_GOLD_BROW',0,0,2.54);
  acHullMesh(cockpit,acHullExtrude(acHullShape(window),.12,.025),m.dark,'AURELIAN_COCKPIT_REAR',0,0,.78);
  const box=(w,h,d,mat,name,x,y,z)=>acHullMesh(cockpit,new THREE.BoxGeometry(w,h,d),mat,name,x,y,z);
  box(5.25,.30,.82,m.bronze,'AURELIAN_COCKPIT_DASH',-.38,-.72,1.78);
  box(.72,1.18,.42,m.dark,'AURELIAN_COCKPIT_SEAT',.70,-.02,1.18);box(.70,.22,.64,m.ivory,'AURELIAN_COCKPIT_SEAT_CUSHION',.70,-.52,1.40);
  const pilot=new THREE.Group();pilot.name='AURELIAN_COCKPIT_DECORATIVE_PILOT';pilot.position.set(.70,.08,1.55);cockpit.add(pilot);
  acHullMesh(pilot,new THREE.CylinderGeometry(.20,.29,.72,10),m.ivory,'PILOT_TORSO');acHullMesh(pilot,new THREE.SphereGeometry(.24,14,10),m.gold,'PILOT_HELMET',0,.57,.04);acHullMesh(pilot,new THREE.BoxGeometry(.34,.09,.06),m.blue,'PILOT_VISOR',0,.59,.25);
  for(const sx of[-1,1]){const arm=acHullMesh(pilot,new THREE.CylinderGeometry(.07,.09,.62,8),m.ivory,'PILOT_ARM',sx*.31,-.10,.16);arm.rotation.z=sx*.48;acHullMesh(pilot,new THREE.BoxGeometry(.18,.28,.40),m.dark,'PILOT_KNEE',sx*.17,-.54,.20)}
  for(const x of[-2.15,-1.28,-.40]){const screen=box(.61,.43,.10,m.blue,'AURELIAN_COCKPIT_SCREEN',x,-.35,1.94);screen.rotation.x=-.14;box(.48,.032,.015,m.hot,'AURELIAN_COCKPIT_READOUT',x,-.34,2.00)}
  acHullMesh(cockpit,acHullCanopyGeometry(window),m.glass,'AURELIAN_COCKPIT_GLAZING',0,0,2.50);
  for(const x of[-2.62,-.35,2.12])acHullLine(cockpit,[[x,-1.0,2.58],[x*.96,-.30,3.06],[x*.88,1.55,2.68]],m.trimLine,'AURELIAN_COCKPIT_CANOPY_RIB');
  acHullLine(cockpit,[[-3.35,1.05,2.83],[-1.35,1.60,2.99],[.75,1.64,2.91],[2.45,1.12,2.70]],m.glassLine,'AURELIAN_COCKPIT_HIGHLIGHT');
  const spear=[[-6.55,-.52],[-5.06,.72],[-3.88,.95],[-4.38,.20],[-5.22,-.34]];acHullMesh(cockpit,acHullExtrude(acHullShape(spear),.32,.07),[m.goldDark,m.edge],'AURELIAN_COCKPIT_AFT_SPEAR',0,0,2.48);
}`;
  const afterCockpit=replaceFunction(patched,'function acHullCockpit(panel,s,m){','function acHullCannon(',cockpitArt);
  if(afterCockpit===patched)return html;patched=afterCockpit;

  const cannonArt=String.raw`function acHullCannon(panel,s,m){
  const cannon=new THREE.Group();cannon.name='AURELIAN_CANON_SOLAR_CANNON_ART';cannon.position.z=1.58;panel.add(cannon);
  acHullMesh(panel,acHullExtrude(acHullShape(s.points),.19,.04),m.dark,'AURELIAN_CANNON_BAY_RECESS',0,0,.20);
  acHullMesh(panel,acHullRing(s.points,1,.865,.44),[m.goldDark,m.gold],'AURELIAN_CANNON_BAY_LIP',0,0,2.10);
  const cradle=[[-4.35,-1.42],[4.52,-1.12],[4.05,1.15],[-3.75,1.42]];acHullMesh(cannon,acHullExtrude(acHullShape(cradle),.42,.08),[m.bronze,m.goldDark],'AURELIAN_CANNON_ARMORED_CRADLE',.15,0,-.08);
  const cyl=(r1,r2,len,mat,name,x,y=0,z=0)=>{const o=acHullMesh(cannon,new THREE.CylinderGeometry(r1,r2,len,28),mat,name,x,y,z);o.rotation.z=-Math.PI/2;return o};
  cyl(1.06,1.30,2.30,m.bronze,'AURELIAN_CANNON_BREECH',-2.15);cyl(.91,1.02,.62,m.gold,'AURELIAN_CANNON_BREECH_COLLAR',-.92);
  acHullMesh(cannon,new THREE.SphereGeometry(.82,24,18),m.sun,'AURELIAN_CANNON_CHAMBER',-1.28,0,.23);
  for(const r of[.94,1.17]){const halo=acHullMesh(cannon,new THREE.TorusGeometry(r,.085,10,36),r>1?m.edge:m.sun,'AURELIAN_CANNON_CHAMBER_RING',-1.72,0,.86);halo.rotation.y=Math.PI/2}
  cyl(.28,.48,7.75,m.dark,'AURELIAN_CANNON_BARREL',2.84);cyl(.12,.12,6.35,m.sun,'AURELIAN_CANNON_CONTAINED_ENERGY',2.60,0,.43);
  for(const x of[-.15,1.25,2.65,4.05,5.16]){cyl(.56,.56,.28,x===5.16?m.edge:m.gold,'AURELIAN_CANNON_COIL',x);const halo=acHullDetail(cannon,new THREE.TorusGeometry(.58,.052,8,32),m.sun,'AURELIAN_CANNON_CONTAINMENT_RING',x+.15,0,.08);halo.rotation.y=Math.PI/2}
  cyl(.72,.49,.98,m.bronze,'AURELIAN_CANNON_MUZZLE',6.48);cyl(.57,.57,.20,m.edge,'AURELIAN_CANNON_MUZZLE_RIM',7.05);const core=acHullMesh(cannon,new THREE.CircleGeometry(.38,30),m.hot,'AURELIAN_CANNON_MUZZLE_CORE',7.17,0,0);core.rotation.y=Math.PI/2;
  for(const sy of[-1,1]){const rail=acHullMesh(cannon,new THREE.BoxGeometry(7.65,.13,.19),sy>0?m.ivory:m.goldDark,'AURELIAN_CANNON_SUPPORT_RAIL',2.22,sy*.68,.12);rail.rotation.z=sy*.018;acHullPipe(cannon,[-3.45,sy*.98,.52],[-.28,sy*.84,.54],.065,m.bronze,'AURELIAN_REACTOR_SERVICE_LINE')}
  for(let i=0;i<12;i++){const a=i*Math.PI/6,fin=acHullDetail(cannon,new THREE.BoxGeometry(1.48,.15,.23),i%3===0?m.edge:m.goldDark,'AURELIAN_REACTOR_RADIAL_FIN',-2.05,Math.cos(a)*1.16,Math.sin(a)*1.16);fin.rotation.x=a}
}`;
  const afterCannon=replaceFunction(patched,'function acHullCannon(panel,s,m){','function buildAurelianDirectorHull(',cannonArt);
  if(afterCannon===patched)return html;patched=afterCannon;

  const accentFunction=String.raw`function acHullReferenceAccents(kit,m){
  const plates=[
    {n:'AURELIAN_REFERENCE_DORSAL_ARMOR',mat:m.gold,z:7.90,d:.34,p:[[-8.2,10.30],[-2.2,11.42],[5.8,10.20],[10.8,8.22],[6.1,8.58],[-1.6,9.62]]},
    {n:'AURELIAN_REFERENCE_DORSAL_INLAY',mat:m.ivory,z:8.28,d:.13,p:[[-1.5,10.72],[4.9,9.88],[7.4,8.92],[5.5,9.08],[-1.1,10.03]]},
    {n:'AURELIAN_REFERENCE_PROW_MAIN',mat:m.gold,z:7.70,d:.42,p:[[15.0,5.78],[19.6,4.20],[24.3,.62],[19.0,1.02],[15.2,2.62]]},
    {n:'AURELIAN_REFERENCE_PROW_LOWER',mat:m.bronze,z:7.80,d:.38,p:[[15.4,2.38],[19.0,.90],[24.2,.48],[19.0,-1.52],[15.1,-3.08],[16.6,-.42]]},
    {n:'AURELIAN_REFERENCE_PROW_INLAY',mat:m.ivory,z:8.18,d:.13,p:[[18.2,3.54],[22.5,.84],[20.0,1.12],[17.2,2.72]]},
    {n:'AURELIAN_REFERENCE_VENTRAL_ARMOR',mat:m.goldDark,z:7.74,d:.36,p:[[3.8,-10.45],[12.8,-10.00],[18.0,-6.40],[15.0,-7.30],[13.4,-9.10],[7.0,-9.50]]},
    {n:'AURELIAN_REFERENCE_VENTRAL_INLAY',mat:m.ivory,z:8.16,d:.12,p:[[7.8,-10.00],[12.6,-9.72],[15.8,-7.25],[14.3,-8.00],[12.7,-9.25],[8.1,-9.45]]},
    {n:'AURELIAN_REFERENCE_AFT_COWL',mat:m.gold,z:7.60,d:.30,p:[[-23.8,7.48],[-18.2,9.42],[-13.8,8.88],[-15.6,7.12],[-20.6,6.34]]},
    {n:'AURELIAN_REFERENCE_AFT_LOWER_COWL',mat:m.bronze,z:7.58,d:.28,p:[[-23.7,-6.82],[-18.0,-8.72],[-12.9,-8.34],[-15.1,-6.92],[-20.5,-5.92]]}
  ];
  for(const a of plates)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.08),[a.mat,m.edge],a.n,0,0,a.z);
  for(const [x,y,len,rz,mat] of [[-18.8,8.15,5.2,-.22,m.edge],[-18.9,-7.12,5.0,.20,m.gold],[16.7,6.18,4.2,.27,m.edge],[16.7,-6.18,4.4,-.24,m.gold]]){const rib=acHullDetail(kit,new THREE.BoxGeometry(len,.16,.24),mat,'AURELIAN_REFERENCE_HULL_RIB',x,y,8.26);rib.rotation.z=rz;}
  // Reference nose: a compact solar lens nested inside the long armored prow.
  acHullMesh(kit,new THREE.CircleGeometry(.76,32),m.dark,'AURELIAN_PROW_LENS_RECESS',21.10,.35,8.22);
  acHullMesh(kit,new THREE.TorusGeometry(.76,.15,12,40),m.gold,'AURELIAN_PROW_LENS_RIM',21.10,.35,8.29);
  acHullMesh(kit,new THREE.TorusGeometry(.47,.08,10,36),m.sun,'AURELIAN_PROW_LENS_ENERGY',21.10,.35,8.33);
  acHullMesh(kit,new THREE.CircleGeometry(.22,24),m.hot,'AURELIAN_PROW_LENS_CORE',21.10,.35,8.36);
  // Reinforce the three-engine silhouette with dark bronze fairings and luminous hoops.
  for(const y of[-4.8,0,4.8]){
    acHullMesh(kit,new THREE.TorusGeometry(1.66,.20,10,36),m.bronze,'AURELIAN_REFERENCE_ENGINE_FAIRING',-20.05,y,8.02);
    acHullMesh(kit,new THREE.TorusGeometry(1.38,.075,8,32),m.edge,'AURELIAN_REFERENCE_ENGINE_GOLD_HOOP',-20.05,y,8.10);
    for(const sy of[-1,1]){const rail=acHullDetail(kit,new THREE.BoxGeometry(4.8,.11,.17),m.goldDark,'AURELIAN_REFERENCE_ENGINE_RAIL',-21.85,y+sy*1.28,8.08);rail.rotation.z=sy*.035}
  }
}`;
  if(!patched.includes('function acHullReferenceAccents(kit,m){')){
    patched=patched.replace('function acHullMachinery(kit,m){',accentFunction+'\nfunction acHullMachinery(kit,m){');
  }
  if(!patched.includes('  acHullMachinery(kit,m);\n  acHullReferenceAccents(kit,m);')){
    patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceAccents(kit,m);');
  }
  if(!patched.includes('function acHullReferenceAccents(kit,m){')||!patched.includes('acHullReferenceAccents(kit,m);'))return html;

  patched=patched.replace(/MATCH RECORDER v0\.\d+\.\d+/g,'MATCH RECORDER v0.48.0');
  patched=patched.replace(/build=2026-\d{2}-\d{2}_[A-Z0-9_-]+/g,'build=2026-09-13_REFERENCE_SHIP_ART_PASS');
  patched=patched.replace(/build=v0\.\d+\.\d+ panels=6 apertures=6/g,'build=v0.48.0 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0480" name="ac-aurelian-reference-polish" content="referenceMatch:BRONZE_GOLD_LAYERED cockpit:LONG_GLAZED cannon:INTEGRATED_HEAVY prow:SOLAR_LENS engines:TRIPLE_COWLED sixApertures:PRESERVED combat:UNCHANGED">\n</head>');
}
