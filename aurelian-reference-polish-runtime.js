function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0490'))return html;
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
  // Five separate armor leaves give each bay a manufactured, layered face. They
  // remain door-owned, so opening or destroying a room exposes the real interior.
  const leaves=[
    [[-w*.31,h*.02],[-w*.08,h*.15],[w*.17,h*.15],[w*.05,h*.055],[-w*.20,-h*.01]],
    [[w*.08,h*.15],[w*.31,h*.16],[w*.26,h*.055],[w*.04,h*.05]],
    [[-w*.27,-h*.04],[-w*.04,h*.035],[w*.18,h*.015],[w*.06,-h*.10],[-w*.18,-h*.14]],
    [[w*.16,h*.015],[w*.31,h*.055],[w*.29,-h*.15],[w*.06,-h*.10]],
    [[-w*.12,-h*.18],[w*.13,-h*.15],[w*.04,-h*.25],[-w*.20,-h*.26]]
  ];
  leaves.forEach((p,j)=>{const leaf=acHullMesh(panel,acHullExtrude(acHullShape(p),.11,.045),[j%2?m.goldDark:m.gold,m.edge],'AURELIAN_BREAKAWAY_ARMOR_LEAF_'+index+'_'+j,0,0,3.22+j*.012);leaf.userData.acBreakawayLeaf=j});
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
  // Hero silhouette pass: broad interlocking masses surround, but never cross,
  // the six protected bay apertures.
  const heroPlates=[
    {n:'AURELIAN_HERO_DORSAL_CROWN_A',mat:m.gold,z:8.30,d:.46,p:[[-12.9,10.02],[-8.4,12.35],[-1.4,12.72],[3.2,11.72],[-1.8,10.58],[-8.2,10.68]]},
    {n:'AURELIAN_HERO_DORSAL_CROWN_B',mat:m.goldDark,z:8.38,d:.38,p:[[3.0,11.67],[8.7,10.18],[13.5,7.94],[10.5,8.17],[6.2,9.50]]},
    {n:'AURELIAN_HERO_AFT_SHOULDER',mat:m.bronze,z:8.18,d:.54,p:[[-24.8,8.28],[-20.2,10.82],[-14.2,9.32],[-16.1,7.78],[-21.2,6.72]]},
    {n:'AURELIAN_HERO_VENTRAL_KEEL_A',mat:m.goldDark,z:8.22,d:.48,p:[[-13.8,-8.32],[-7.8,-11.65],[-.8,-12.02],[2.9,-10.18],[-3.5,-9.42],[-9.2,-9.72]]},
    {n:'AURELIAN_HERO_VENTRAL_KEEL_B',mat:m.gold,z:8.29,d:.42,p:[[2.5,-10.16],[8.5,-11.14],[14.9,-9.62],[18.8,-6.56],[14.5,-7.24],[11.8,-9.20],[6.8,-9.48]]},
    {n:'AURELIAN_HERO_PROW_CAP',mat:m.gold,z:8.34,d:.50,p:[[14.4,6.10],[20.0,4.62],[26.4,.56],[21.0,1.10],[16.2,3.08]]},
    {n:'AURELIAN_HERO_PROW_CHIN',mat:m.bronze,z:8.32,d:.46,p:[[16.0,-3.15],[21.0,-1.48],[26.3,.43],[20.0,-3.15],[15.1,-6.42],[18.6,-5.32]]}
  ];
  for(const a of heroPlates){const plate=acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.105),[a.mat,m.edge],a.n,0,0,a.z);plate.userData.wreckPersistent=true}
  // Raised spars lock the upper and lower armor decks together visually.
  for(const [x,y,w,h,rz,mat] of [[-.8,6.92,5.4,.28,-.035,m.edge],[-.7,-6.78,5.2,.27,.03,m.gold],[13.9,6.52,4.3,.24,-.19,m.edge],[14.2,-6.55,4.7,.24,.18,m.goldDark],[-16.5,7.05,4.0,.25,-.20,m.gold],[-16.7,-6.92,4.2,.25,.19,m.bronze]]){
    const spar=acHullDetail(kit,new THREE.BoxGeometry(w,h,.34),mat,'AURELIAN_HERO_ARMOR_SPAR',x,y,8.82);spar.rotation.z=rz;
  }
  // Deep cowl cheeks make each rear engine read as a protected housing.
  for(const y of[-4.8,0,4.8]){
    const upper=[[-24.9,y+1.56],[-20.0,y+1.76],[-17.9,y+1.16],[-19.8,y+.78],[-24.5,y+.92]],lower=[[-24.9,y-1.56],[-20.0,y-1.76],[-17.9,y-1.16],[-19.8,y-.78],[-24.5,y-.92]];
    acHullMesh(kit,acHullExtrude(acHullShape(upper),.38,.08),[m.goldDark,m.edge],'AURELIAN_HERO_ENGINE_COWL_UPPER',0,0,8.22);
    acHullMesh(kit,acHullExtrude(acHullShape(lower),.36,.08),[m.bronze,m.gold],'AURELIAN_HERO_ENGINE_COWL_LOWER',0,0,8.20);
    for(let i=0;i<6;i++){const a=i*Math.PI/3,vane=acHullDetail(kit,new THREE.BoxGeometry(.74,.10,.14),i%2?m.gold:m.edge,'AURELIAN_HERO_ENGINE_VANE',-24.94+Math.cos(a)*.38,y+Math.sin(a)*.60,8.28);vane.rotation.z=a}
    acHullMesh(kit,new THREE.CircleGeometry(.48,24),m.hot,'AURELIAN_HERO_ENGINE_CORE',-24.98,y,8.31);
  }
  // v0.50 depth overhaul. These are genuine layered 3-D armor masses, separated
  // by black shadow gaps, rather than another painted plate over the old hull.
  const shadowShells=[
    {n:'AURELIAN_DEPTH_DORSAL_SHADOW',z:8.45,d:.58,p:[[-15.6,10.25],[-10.2,13.38],[-1.8,13.62],[6.8,11.25],[12.5,8.02],[8.1,8.55],[1.8,10.72],[-8.4,11.02]]},
    {n:'AURELIAN_DEPTH_VENTRAL_SHADOW',z:8.43,d:.56,p:[[-14.8,-8.40],[-9.0,-12.95],[-.6,-13.28],[8.6,-12.10],[16.4,-8.22],[11.8,-8.76],[3.2,-10.62],[-8.0,-10.48]]},
    {n:'AURELIAN_DEPTH_PROW_SHADOW',z:8.48,d:.62,p:[[15.4,6.15],[21.8,4.50],[28.8,.42],[21.2,-4.62],[15.2,-6.45],[18.2,-3.02],[25.6,.44],[18.0,3.10]]}
  ];
  for(const a of shadowShells)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.12),m.dark,a.n,0,0,a.z);
  const volumePlates=[
    {n:'AURELIAN_VOLUME_DORSAL_SPINE',mat:m.gold,z:9.14,d:.78,p:[[-13.8,10.62],[-8.6,12.92],[-1.6,13.16],[5.1,11.48],[1.1,11.20],[-7.8,11.62]]},
    {n:'AURELIAN_VOLUME_DORSAL_IVORY',mat:m.ivory,z:9.65,d:.24,p:[[-7.1,12.20],[-1.3,12.62],[3.3,11.48],[.6,11.42],[-5.8,11.82]]},
    {n:'AURELIAN_VOLUME_VENTRAL_KEEL',mat:m.goldDark,z:9.10,d:.74,p:[[-12.8,-9.82],[-7.7,-12.42],[-.8,-12.78],[6.8,-11.72],[2.0,-10.72],[-7.2,-11.02]]},
    {n:'AURELIAN_VOLUME_PROW_SPEAR',mat:m.gold,z:9.12,d:.84,p:[[16.4,5.34],[22.0,3.90],[28.4,.43],[22.0,1.02],[17.4,2.92]]},
    {n:'AURELIAN_VOLUME_PROW_CHIN',mat:m.bronze,z:9.08,d:.76,p:[[17.0,-2.88],[22.0,-1.02],[28.3,.40],[22.0,-3.58],[16.0,-5.75]]}
  ];
  for(const a of volumePlates){const o=acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.14),[a.mat,m.edge],a.n,0,0,a.z);o.userData.wreckPersistent=true}
  // High glazed command blister reads above the hull silhouette at battle scale.
  const command=new THREE.Group();command.name='AURELIAN_VOLUME_COMMAND_BLISTER';command.position.set(-5.8,10.62,9.56);kit.add(command);
  const commandBase=acHullDetail(command,new THREE.BoxGeometry(9.4,.64,1.08),m.bronze,'AURELIAN_COMMAND_BLISTER_BASE');commandBase.rotation.z=-.025;
  const canopy=acHullDetail(command,new THREE.SphereGeometry(2.20,24,14,0,Math.PI*2,0,Math.PI*.52),m.glass,'AURELIAN_COMMAND_BLISTER_GLASS',-.18,.56,.18);canopy.scale.set(2.05,.72,.58);canopy.rotation.z=-.035;
  for(const x of[-3.5,-1.7,0,1.7,3.5]){const rib=acHullDetail(command,new THREE.BoxGeometry(.11,1.20,1.22),x===0?m.edge:m.goldDark,'AURELIAN_COMMAND_BLISTER_RIB',x,.47,.10);rib.rotation.z=-.035}
  // Deeper triple nacelles with nested barrels, hot cores, and armored bridges.
  for(const y of[-4.8,0,4.8]){
    const barrel=acHullMesh(kit,new THREE.CylinderGeometry(1.42,1.72,5.25,24),m.dark,'AURELIAN_VOLUME_ENGINE_BARREL',-22.42,y,7.34);barrel.rotation.z=Math.PI/2;
    const collar=acHullDetail(kit,new THREE.CylinderGeometry(1.78,1.78,.70,24),m.goldDark,'AURELIAN_VOLUME_ENGINE_COLLAR',-20.02,y,7.45);collar.rotation.z=Math.PI/2;
    for(const x of[-24.72,-23.72,-22.72]){const ring=acHullMesh(kit,new THREE.TorusGeometry(1.28,.095,10,32),x===-24.72?m.edge:m.gold,'AURELIAN_VOLUME_ENGINE_INNER_RING',x,y,7.58);ring.rotation.y=Math.PI/2}
    const core=acHullDetail(kit,new THREE.CircleGeometry(.66,28),m.sun,'AURELIAN_VOLUME_ENGINE_PLASMA',-25.10,y,7.66);core.rotation.y=-Math.PI/2;
  }
  for(const y of[-2.4,2.4]){const bridge=acHullDetail(kit,new THREE.BoxGeometry(7.2,.42,.72),m.bronze,'AURELIAN_ENGINE_ARMORED_BRIDGE',-20.9,y,7.52);bridge.rotation.z=y>0?.05:-.05}
  // Long ventral cannon keel visually joins the weapon bay to the prow.
  const gunKeel=acHullMesh(kit,new THREE.BoxGeometry(12.8,.72,.86),m.goldDark,'AURELIAN_VOLUME_CANNON_KEEL',8.7,-9.48,9.22);gunKeel.rotation.z=.015;
  for(const x of[3.0,6.0,9.0,12.0,14.9]){const coil=acHullDetail(kit,new THREE.TorusGeometry(.52,.085,10,28),x>12?m.edge:m.sun,'AURELIAN_VOLUME_CANNON_COIL',x,-9.48,9.72);coil.rotation.y=Math.PI/2}
  const seams=[
    [[-12.1,11.18,8.86],[-5.8,11.58,8.86],[.4,11.18,8.86]],
    [[3.8,-10.54,8.78],[9.4,-10.32,8.78],[14.7,-8.62,8.78]],
    [[15.7,5.30,8.88],[20.1,3.76,8.88],[24.5,.70,8.88]]
  ];
  seams.forEach((p,i)=>acHullLine(kit,p,i===2?m.glassLine:m.trimLine,'AURELIAN_HERO_MACHINED_SEAM'));
}`;
  if(!patched.includes('function acHullReferenceAccents(kit,m){')){
    patched=patched.replace('function acHullMachinery(kit,m){',accentFunction+'\nfunction acHullMachinery(kit,m){');
  }
  if(!patched.includes('  acHullMachinery(kit,m);\n  acHullReferenceAccents(kit,m);')){
    patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceAccents(kit,m);');
  }
  if(!patched.includes('function acHullReferenceAccents(kit,m){')||!patched.includes('acHullReferenceAccents(kit,m);'))return html;

  patched=patched.replace(/MATCH RECORDER v0\.\d+\.\d+/g,'MATCH RECORDER v0.50.0');
  patched=patched.replace(/build=2026-\d{2}-\d{2}_[A-Z0-9_-]+/g,'build=2026-09-14_AURELIAN_VOLUME_DEPTH_OVERHAUL');
  patched=patched.replace(/build=v0\.\d+\.\d+ panels=6 apertures=6/g,'build=v0.50.0 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0490" name="ac-aurelian-reference-polish" content="referenceMatch:HERO_BRONZE_GOLD_LAYERED_VOLUME cockpit:RAISED_GLAZED_BLISTER cannon:INTEGRATED_LONG_KEEL prow:EXTENDED_VOLUMETRIC_SPEAR engines:TRIPLE_NESTED_DEEP_COWLED armor:BREAKAWAY_LEAVES shadowGaps:DEEP sixApertures:PRESERVED combat:UNCHANGED">\n</head>');
}
