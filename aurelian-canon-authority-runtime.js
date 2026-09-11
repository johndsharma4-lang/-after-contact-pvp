function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianCanonAuthorityRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-canon-authority-v0460'))return html;
  if(!html.includes('ac-aurelian-reference-polish-v0450'))return html;

  const authority=String.raw`function acCanonBeam(parent,a,b,width,depth,z,material,m,name,merge=true){
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<.001)return null;
  const px=-dy/length*width*.5,py=dx/length*width*.5,points=[[a[0]+px,a[1]+py],[b[0]+px,b[1]+py],[b[0]-px,b[1]-py],[a[0]-px,a[1]-py]],geo=acHullExtrude(acHullShape(points),depth,Math.min(.09,width*.16));
  return merge?acHullDetail(parent,geo,material,name,0,0,z):acHullMesh(parent,geo,[material,m.edge],name,0,0,z);
}

function acCanonBayFrame(kit,m,s,index){
  const frame=new THREE.Group();frame.name='AURELIAN_CANON_BAY_FRAME_'+(index+1);frame.position.set(s.x,s.y,6.46);frame.userData.acApertureFrame=true;kit.add(frame);
  const outer=s.points.map(([x,y])=>[x*1.145,y*1.145]),accentEdges=index===0?[2,3,4]:index===5?[0,1,2]:index>=3?[1,2]:[3,4];
  for(let i=0;i<outer.length;i++){
    const a=outer[i],b=outer[(i+1)%outer.length];
    acCanonBeam(frame,a,b,.78,1.12,0,m.goldDark,m,'AURELIAN_FRAME_DEEP_'+(index+1)+'_'+i);
    acCanonBeam(frame,a,b,.44,.54,1.00,m.gold,m,'AURELIAN_FRAME_GOLD_'+(index+1)+'_'+i);
    acCanonBeam(frame,a,b,.105,.11,1.56,accentEdges.includes(i)?m.ivory:m.edge,m,'AURELIAN_FRAME_LIP_'+(index+1)+'_'+i);
  }
  const inner=s.points.map(([x,y])=>[x*1.035,y*1.035]);
  for(let i=0;i<inner.length;i++)acCanonBeam(frame,inner[i],inner[(i+1)%inner.length],.12,.10,1.48,m.bronze,m,'AURELIAN_FRAME_GASKET_'+(index+1)+'_'+i);
  for(let i=0;i<outer.length;i++){
    const [x,y]=outer[i],cap=acHullDetail(frame,new THREE.OctahedronGeometry(.36,0),i%2?m.gold:m.edge,'AURELIAN_FRAME_CORNER_'+(index+1)+'_'+i,x,y,1.46);cap.scale.set(1.18,.82,.72);
  }
  return frame;
}

function acCanonDoorArmor(panel,s,m,index){
  const outer=s.points.map(([x,y])=>[x*.985,y*.985]),mid=s.points.map(([x,y])=>[x*.905,y*.865]),face=s.points.map(([x,y])=>[x*.825,y*.735]),w=s.w,h=s.h;
  acHullMesh(panel,acHullExtrude(acHullShape(outer),.42,.11),[m.bronze,m.goldDark],'AURELIAN_CANON_DOOR_BACK_'+index,0,0,2.05);
  acHullMesh(panel,acHullExtrude(acHullShape(mid),.38,.12),[m.goldDark,m.gold],'AURELIAN_CANON_DOOR_SHOULDER_'+index,0,0,2.37);
  acHullMesh(panel,acHullExtrude(acHullShape(face),.30,.11),[index%2?m.gold:m.goldDark,m.edge],'AURELIAN_CANON_DOOR_FACE_'+index,0,0,2.70);
  const direction=index<3?1:-1,viewport=[[-w*.29,-h*.115],[w*.19,-h*.115],[w*.30,-h*.025],[w*.20,h*.115],[-w*.30,h*.115],[-w*.35,0]];
  acHullMesh(panel,acHullExtrude(acHullShape(viewport),.085,.025),m.dark,'AURELIAN_CANON_DOOR_VIEWPORT_'+index,direction*.08,0,3.03);
  acHullMesh(panel,acHullRing(viewport,1.08,1.0,.075),index===4?m.ivory:m.gold,'AURELIAN_CANON_DOOR_VIEWPORT_RIM_'+index,direction*.08,0,3.10);
  const upper=[[-w*.36,h*.19],[w*.18,h*.22],[w*.34,h*.10],[w*.20,h*.055],[-w*.31,h*.08]],lower=[[-w*.34,-h*.20],[w*.21,-h*.20],[w*.34,-h*.09],[w*.16,-h*.055],[-w*.30,-h*.08]];
  acHullMesh(panel,acHullExtrude(acHullShape(upper),.12,.035),[index===3?m.ivory:m.gold,m.edge],'AURELIAN_CANON_DOOR_UPPER_BLADE_'+index,0,0,3.12);
  acHullMesh(panel,acHullExtrude(acHullShape(lower),.11,.035),[m.goldDark,m.gold],'AURELIAN_CANON_DOOR_LOWER_BLADE_'+index,0,0,3.11);
  for(let i=0;i<4;i++)acHullDetail(panel,new THREE.BoxGeometry(w*.055,.075,.06),i===1?m.hot:m.blue,'AURELIAN_CANON_DOOR_STATUS_'+index+'_'+i,-w*.11+i*w*.075,-h*.005,3.23);
}

function acCanonCockpit(panel,s,m){
  const cockpit=new THREE.Group();cockpit.name='AURELIAN_CANON_COCKPIT';panel.add(cockpit);
  const outer=s.points.map(([x,y])=>[x*.99,y*.99]);
  acHullMesh(cockpit,acHullExtrude(acHullShape(outer),.58,.13),[m.goldDark,m.bronze],'AURELIAN_COCKPIT_DEEP_CRADLE',0,0,1.90);
  const c=new THREE.Shape();c.moveTo(-3.52,-1.58);c.lineTo(2.34,-1.58);c.quadraticCurveTo(3.52,-1.35,3.38,.10);c.quadraticCurveTo(3.05,1.88,1.54,2.05);c.lineTo(-1.98,2.18);c.quadraticCurveTo(-3.72,1.72,-3.52,-1.58);
  const glassOutline=c.getPoints(18).map(v=>[v.x,v.y]),goldOuter=glassOutline.map(([x,y])=>[x*1.10,y*1.13]);
  acHullMesh(cockpit,acHullExtrude(acHullShape(goldOuter),.40,.08),[m.gold,m.edge],'AURELIAN_COCKPIT_ARMORED_ARCH',0,0,2.35);
  acHullMesh(cockpit,acHullExtrude(acHullShape(glassOutline),.15,.03),m.dark,'AURELIAN_COCKPIT_RECESS',0,0,2.68);
  const box=(w,h,d,mat,name,x,y,z)=>acHullMesh(cockpit,new THREE.BoxGeometry(w,h,d),mat,name,x,y,z);
  box(5.25,.33,.66,m.bronze,'AURELIAN_COCKPIT_DASH',-.05,-1.04,2.82);
  for(const x of[-1.72,-.70,.32]){const screen=box(.72,.48,.09,x===-.70?m.hot:m.blue,'AURELIAN_COCKPIT_SCREEN',x,-.45,2.98);screen.rotation.x=-.12}
  const seat=box(.76,1.28,.46,m.dark,'AURELIAN_COCKPIT_SEAT',1.12,-.18,2.72);seat.rotation.x=-.06;
  const pilot=new THREE.Group();pilot.name='AURELIAN_COCKPIT_DECORATIVE_PILOT';pilot.position.set(1.10,-.06,3.03);cockpit.add(pilot);
  acHullMesh(pilot,new THREE.CylinderGeometry(.22,.31,.72,10),m.ivoryDark||m.ivory,'PILOT_TORSO');acHullMesh(pilot,new THREE.SphereGeometry(.25,16,11),m.gold,'PILOT_HELMET',0,.57,.02);acHullMesh(pilot,new THREE.BoxGeometry(.34,.09,.07),m.blue,'PILOT_VISOR',0,.59,.235);
  for(const sx of[-1,1]){const arm=acHullMesh(pilot,new THREE.CylinderGeometry(.075,.095,.58,8),m.ivory,'PILOT_ARM',sx*.32,-.08,.10);arm.rotation.z=sx*.50}
  const glazing=acHullMesh(cockpit,acHullCanopyGeometry(glassOutline),m.glass,'AURELIAN_COCKPIT_GLAZING',0,0,2.73);glazing.renderOrder=24;
  acHullMesh(cockpit,acHullRing(glassOutline,1.035,1.0,.085),m.ivory,'AURELIAN_COCKPIT_WINDOW_FRAME',0,0,3.34);
  for(const x of[-1.86,.10,1.88]){const rib=acHullDetail(cockpit,new THREE.BoxGeometry(.09,3.25,.10),m.edge,'AURELIAN_COCKPIT_MULLION',x,.15,3.42);rib.rotation.z=x<0?.08:x>1?-.10:.01}
}

function acCanonCannon(panel,s,m){
  const cannon=new THREE.Group();cannon.name='AURELIAN_CANON_SOLAR_CANNON_ART';cannon.position.z=3.02;panel.add(cannon);
  const shell=[[-5.10,-1.72],[3.62,-1.54],[5.10,-.64],[4.72,1.48],[-4.18,1.84],[-5.20,.68]],inner=shell.map(([x,y])=>[x*.91,y*.72]);
  acHullMesh(cannon,acHullExtrude(acHullShape(shell),.34,.10),[m.goldDark,m.gold],'AURELIAN_CANNON_EXPOSED_HOUSING',0,0,-.42);
  acHullMesh(cannon,acHullExtrude(acHullShape(inner),.12,.04),m.dark,'AURELIAN_CANNON_EXPOSED_RECESS',0,0,-.08);
  const cyl=(r1,r2,len,mat,name,x,y=0,z=.34)=>{const o=acHullMesh(cannon,new THREE.CylinderGeometry(r1,r2,len,28),mat,name,x,y,z);o.rotation.z=-Math.PI/2;return o};
  cyl(1.12,1.34,2.05,m.bronze,'AURELIAN_CANNON_BREECH',-2.70,0,.38);
  acHullMesh(cannon,new THREE.SphereGeometry(.91,28,20),m.sun,'AURELIAN_CANNON_CHAMBER',-1.62,0,.43);
  acHullMesh(cannon,new THREE.CircleGeometry(.58,36),m.hot,'AURELIAN_CANNON_CHAMBER_FACE',-1.62,0,1.31);
  for(const r of[1.02,1.30]){const ring=acHullMesh(cannon,new THREE.TorusGeometry(r,.095,10,40),r>1.1?m.ivory:m.sun,'AURELIAN_CANNON_CHAMBER_RING',-1.62,0,.46);ring.rotation.y=Math.PI/2}
  cyl(.36,.52,5.75,m.dark,'AURELIAN_CANNON_BARREL',1.42,0,.37);cyl(.15,.15,5.05,m.sun,'AURELIAN_CANNON_CONTAINED_ENERGY',1.42,0,.48);
  for(const x of[-.30,1.00,2.30,3.55]){cyl(.62,.62,.28,m.gold,'AURELIAN_CANNON_COIL',x,0,.39);const halo=acHullMesh(cannon,new THREE.TorusGeometry(.64,.06,8,34),m.sun,'AURELIAN_CANNON_CONTAINMENT_RING',x+.11,0,.44);halo.rotation.y=Math.PI/2}
  cyl(.78,.55,1.00,m.bronze,'AURELIAN_CANNON_MUZZLE',4.75,0,.39);cyl(.62,.62,.22,m.edge,'AURELIAN_CANNON_MUZZLE_RIM',5.28,0,.39);const core=acHullMesh(cannon,new THREE.CircleGeometry(.42,32),m.hot,'AURELIAN_CANNON_MUZZLE_CORE',5.42,0,.39);core.rotation.y=Math.PI/2;
  for(const sy of[-1,1]){const rail=acHullMesh(cannon,new THREE.BoxGeometry(7.55,.13,.20),m.ivory,'AURELIAN_CANNON_SUPPORT_RAIL',.18,sy*.84,.48);rail.rotation.z=sy*.022;const shroud=acHullMesh(cannon,new THREE.BoxGeometry(6.65,.28,.28),m.gold,'AURELIAN_CANNON_ARMOR_SHROUD',.12,sy*1.18,.10);shroud.rotation.z=sy*.035}
}

function acUserCanonShell(kit,m,specs){
  const plate=(name,points,material,z,depth=.48,progressive=false)=>{const mesh=acHullMesh(kit,acHullExtrude(acHullShape(points),depth,.11),[material,m.edge],name,0,0,z);if(progressive)mesh.userData.acProgressiveArmor=true;return mesh};
  const deepBody=[[-24.8,-6.8],[-25.8,-2.0],[-25.4,5.9],[-19.4,9.8],[-11.2,12.6],[-2.0,12.4],[7.2,10.8],[15.0,7.6],[19.8,4.5],[23.5,.15],[19.2,-3.9],[15.0,-7.8],[9.2,-10.8],[1.4,-11.7],[-8.4,-10.5],[-18.4,-9.2]];
  plate('AURELIAN_CANON_DEEP_PRESSURE_BODY',deepBody,m.dark,-1.05,2.35);

  plate('AURELIAN_CANON_AFT_ENGINE_BLOCK',[[-25.7,-6.4],[-26.0,5.9],[-22.4,8.1],[-15.1,8.2],[-15.1,-7.5],[-21.8,-8.5]],m.bronze,4.35,1.55);
  plate('AURELIAN_CANON_AFT_UPPER_COWL',[[-25.8,5.5],[-21.2,9.2],[-15.0,10.0],[-13.6,9.0],[-15.2,5.2],[-20.2,4.65],[-24.2,4.72]],m.goldDark,6.25,1.10,true);
  plate('AURELIAN_CANON_AFT_UPPER_ARMOR',[[-23.8,6.1],[-20.4,8.6],[-15.6,9.2],[-16.8,7.9],[-20.3,6.7]],m.gold,7.30,.55,true);
  plate('AURELIAN_CANON_AFT_LOWER_COWL',[[-25.7,-5.6],[-22.0,-8.9],[-15.6,-9.1],[-13.9,-7.6],[-15.4,-2.1],[-20.6,-2.0],[-24.2,-3.5]],m.goldDark,6.20,1.08,true);
  plate('AURELIAN_CANON_AFT_LOWER_ARMOR',[[-23.7,-5.5],[-20.3,-7.9],[-15.8,-8.3],[-17.0,-6.9],[-20.5,-5.9]],m.gold,7.28,.54,true);

  plate('AURELIAN_CANON_COMMAND_ROOF',[[-15.0,9.55],[-11.7,12.3],[-6.2,13.15],[1.8,12.65],[8.9,10.7],[14.9,7.65],[13.2,7.25],[6.0,9.05],[-2.0,10.15],[-9.5,10.35],[-13.2,9.85]],m.gold,6.65,1.18);
  plate('AURELIAN_CANON_ROOF_FACET',[[-10.8,11.0],[-6.0,12.35],[.8,11.95],[7.1,10.25],[10.8,8.55],[6.4,9.55],[.2,10.55],[-5.8,10.72]],m.goldDark,7.72,.48,true);
  plate('AURELIAN_CANON_ROOF_IVORY_INLAY',[[-8.7,11.25],[-5.4,11.95],[-1.1,11.70],[1.2,11.10],[-3.4,11.20],[-6.7,10.78]],m.ivoryDark||m.ivory,8.18,.16,true);
  plate('AURELIAN_CANON_VENTRAL_KEEL',[[-24.1,-6.6],[-18.0,-9.45],[-9.3,-10.25],[-2.0,-10.0],[2.7,-11.25],[10.5,-10.65],[15.3,-8.15],[17.6,-5.3],[14.8,-6.9],[10.3,-8.9],[3.2,-9.05],[-3.0,-8.72],[-10.0,-7.3],[-17.2,-7.0]],m.goldDark,6.34,1.02);
  plate('AURELIAN_CANON_VENTRAL_GOLD_STEP',[[-14.0,-7.35],[-8.5,-8.85],[-2.4,-9.35],[1.1,-10.2],[-4.2,-9.72],[-10.6,-8.75]],m.gold,7.30,.51,true);
  plate('AURELIAN_CANON_VENTRAL_IVORY_INLAY',[[3.0,-9.35],[8.4,-9.7],[12.9,-8.2],[10.0,-8.7],[5.7,-8.75]],m.ivoryDark||m.ivory,7.92,.16,true);

  for(let i=0;i<specs.length;i++)acCanonBayFrame(kit,m,specs[i],i);

  plate('AURELIAN_CANON_CENTER_DORSAL_BUTTRESS',[[-3.55,8.80],[.62,7.45],[.72,5.05],[-.35,3.55],[-2.95,4.65]],m.goldDark,6.72,.92);
  plate('AURELIAN_CANON_CENTER_VENTRAL_BUTTRESS',[[-3.45,-6.95],[-.25,-8.45],[1.05,-4.12],[.15,-2.95],[-2.90,-4.10]],m.goldDark,6.70,.92);
  const hub=acHullMesh(kit,new THREE.CylinderGeometry(2.30,2.48,.66,48),m.goldDark,'AURELIAN_CANON_CENTRAL_HUB',-.62,.10,7.82);hub.rotation.x=Math.PI/2;
  acHullMesh(kit,new THREE.CircleGeometry(1.92,48),m.gold,'AURELIAN_CANON_CENTRAL_HUB_FACE',-.62,.10,8.18);
  acHullMesh(kit,new THREE.TorusGeometry(1.42,.22,12,48),m.ivory,'AURELIAN_CANON_CENTRAL_HUB_RING',-.62,.10,8.31);
  acHullMesh(kit,new THREE.TorusGeometry(.88,.10,10,40),m.goldDark,'AURELIAN_CANON_CENTRAL_HUB_INNER_RING',-.62,.10,8.38);
  acHullMesh(kit,new THREE.CircleGeometry(.57,40),m.sun,'AURELIAN_CANON_CENTRAL_HUB_CORE',-.62,.10,8.43);
  for(let i=0;i<12;i++){const a=i*Math.PI/6,tick=acHullDetail(kit,new THREE.BoxGeometry(.16,.42,.11),i%3===0?m.ivory:m.edge,'AURELIAN_HUB_TICK',-.62+Math.cos(a)*1.69,.10+Math.sin(a)*1.69,8.40);tick.rotation.z=a-Math.PI/2}

  plate('AURELIAN_CANON_PROW_UPPER',[[13.75,7.15],[16.7,6.45],[19.3,4.65],[21.1,2.62],[18.4,3.20],[15.2,4.82]],m.goldDark,6.48,1.18);
  plate('AURELIAN_CANON_PROW_UPPER_FACET',[[14.7,6.35],[17.2,5.60],[19.3,4.05],[20.4,2.80],[18.2,3.60],[15.6,4.65]],m.gold,7.55,.52,true);
  plate('AURELIAN_CANON_PROW_LOWER',[[13.65,-3.72],[17.0,-3.12],[19.5,-2.05],[22.7,.05],[20.0,-3.25],[16.0,-5.55],[14.0,-6.78]],m.goldDark,6.42,1.15);
  plate('AURELIAN_CANON_PROW_CORE',[[13.65,1.50],[17.0,2.38],[20.3,1.72],[23.45,.05],[20.25,-1.70],[16.9,-2.42],[13.65,-1.40]],m.gold,7.30,.86);
  plate('AURELIAN_CANON_PROW_IVORY_CAP',[[19.0,1.45],[21.3,.85],[23.45,.05],[21.0,.18],[18.8,.78]],m.ivoryDark||m.ivory,8.18,.17,true);
  const prowJoint=acHullMesh(kit,new THREE.CylinderGeometry(1.13,1.13,.38,40),m.goldDark,'AURELIAN_CANON_PROW_JOINT',19.1,.02,8.09);prowJoint.rotation.x=Math.PI/2;
  acHullMesh(kit,new THREE.TorusGeometry(.79,.14,10,40),m.ivory,'AURELIAN_CANON_PROW_JOINT_RING',19.1,.02,8.31);
  acHullMesh(kit,new THREE.CircleGeometry(.38,32),m.sun,'AURELIAN_CANON_PROW_JOINT_CORE',19.1,.02,8.38);

  const exhaustRoot=new THREE.Group();exhaustRoot.name='AURELIAN_CANON_EXHAUST_CLUSTER';exhaustRoot.position.z=7.58;kit.add(exhaustRoot);
  for(const y of[-5.05,0,5.05]){
    const housing=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.34,1.66,5.15,32,1,true),m.dark,'AURELIAN_CANON_EXHAUST_HOUSING',-22.72,y,0);housing.rotation.z=Math.PI/2;
    const collar=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.54,1.54,.64,28),m.gold,'AURELIAN_CANON_EXHAUST_COLLAR',-20.25,y,.02);collar.rotation.z=Math.PI/2;
    const inner=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(.86,1.08,1.52,24),m.bronze,'AURELIAN_CANON_EXHAUST_INNER',-25.32,y,.02);inner.rotation.z=Math.PI/2;
    const glow=acHullMesh(exhaustRoot,new THREE.CircleGeometry(.78,32),m.sun,'AURELIAN_CANON_EXHAUST_GLOW',-26.10,y,.02);glow.rotation.y=-Math.PI/2;
    for(const x of[-25.45,-23.25,-20.72]){const hoop=acHullDetail(exhaustRoot,new THREE.TorusGeometry(x===-25.45?1.30:1.48,.105,8,34),m.edge,'AURELIAN_EXHAUST_MACHINED_HOOP',x,y,.04);hoop.rotation.y=Math.PI/2}
  }
  for(const y of[-2.52,2.52]){const pipe=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(.22,.27,5.8,14),m.bronze,'AURELIAN_CANON_EXHAUST_PIPE',-21.8,y,.22);pipe.rotation.z=Math.PI/2}

  for(const x of[-10.4,-8.9]){const mast=acHullDetail(kit,new THREE.CylinderGeometry(.055,.075,1.15,8),m.edge,'AURELIAN_COCKPIT_SENSOR_MAST',x,13.55,7.58);mast.rotation.z=x<-10?.05:-.04}
  const rails=[[[-21.8,8.05],[-16.0,9.35],[-12.8,9.55]],[[3.1,10.0],[8.8,8.55],[13.2,7.0]],[[-17.8,-8.5],[-10.4,-9.25],[-4.2,-9.55]],[[4.1,-9.75],[10.0,-9.15],[14.3,-7.3]]];
  for(let i=0;i<rails.length;i++)for(let j=0;j<rails[i].length-1;j++)acHullPipe(kit,[rails[i][j][0],rails[i][j][1],8.12],[rails[i][j+1][0],rails[i][j+1][1],8.12],.085,i%2?m.ivory:m.edge,'AURELIAN_CANON_ARCHITECTURAL_RAIL_'+i+'_'+j);
}

function buildAurelianDirectorHull(skin,cy,mat){
  if(skin.userData.acCanonExteriorApplied&&skin.userData.acPrimaryHull?.parent===skin)return;
  for(const child of [...skin.children]){child.visible=false;child.userData.acLegacyAurelianHull=true}
  const specs=[
    {name:'PILOT_COCKPIT',x:-8.8,y:7.25,w:7.8,h:5.4,points:[[-3.9,-2.20],[3.85,-2.20],[3.25,2.10],[-2.60,2.62],[-3.95,1.20]]},
    {name:'PORT_UPPER',x:-9.35,y:1.65,w:11.0,h:5.6,points:[[-5.45,-2.50],[4.55,-2.50],[5.45,-1.15],[4.58,2.58],[-4.80,2.48],[-5.60,.55]]},
    {name:'PORT_LOWER',x:-9.00,y:-4.25,w:10.9,h:5.6,points:[[-5.40,-2.42],[4.45,-2.42],[5.45,-1.20],[4.68,2.52],[-5.25,2.52],[-5.78,.66]]},
    {name:'STARBOARD_UPPER',x:7.25,y:4.55,w:13.4,h:5.8,points:[[-6.06,-2.58],[6.60,-2.58],[6.25,2.58],[-4.75,2.52],[-6.20,.38]]},
    {name:'STARBOARD_LOWER',x:7.35,y:-1.20,w:13.2,h:5.5,points:[[-6.00,-2.42],[5.90,-2.28],[6.45,-.72],[6.20,2.48],[-4.80,2.40],[-6.20,.72]]},
    {name:'SOLAR_CANNON_BAY',x:8.30,y:-6.55,w:9.8,h:4.7,points:[[-4.88,-1.92],[4.92,-1.48],[4.24,2.08],[-4.30,2.30]]}
  ];
  const m=acHullMaterials();
  m.gold.color.setHex(0xb77b22);m.gold.roughness=.24;m.gold.envMapIntensity=1.02;
  m.goldDark.color.setHex(0x654018);m.goldDark.roughness=.30;m.goldDark.envMapIntensity=.88;
  m.edge.color.setHex(0xe8bf6a);m.edge.roughness=.20;m.edge.envMapIntensity=1.06;
  m.bronze.color.setHex(0x3e2514);m.bronze.roughness=.36;m.bronze.envMapIntensity=.72;
  m.ivory.color.setHex(0xd7c8a2);m.ivory.roughness=.27;m.ivory.envMapIntensity=.78;
  if(m.ivoryDark){m.ivoryDark.color.setHex(0xa89269);m.ivoryDark.roughness=.32;m.ivoryDark.envMapIntensity=.70}
  m.glass.opacity=.64;m.glass.color.setHex(0x315d6b);m.glass.envMapIntensity=1.15;
  const structure=new THREE.Group();structure.name='AURELIAN_DIRECTOR_HULL_STRUCTURE';structure.userData.acHullRadii=new THREE.Vector3(27.3,14.4,10.4);structure.userData.acSketchSilhouette=true;structure.userData.acContinuousPressureHull=true;structure.userData.acReferenceAuthority='USER_CANON_IMG_3444';skin.add(structure);
  const kit=new THREE.Group();kit.name='AURELIAN_CANON_EXTERIOR_KIT';kit.position.y=cy;structure.add(kit);
  acUserCanonShell(kit,m,specs);

  const panels=[];
  for(let i=0;i<specs.length;i++){
    const s=specs[i],panel=new THREE.Group();panel.name='AURELIAN_HULL_MODULE_'+(i+1)+'_'+s.name;panel.position.set(s.x,cy+s.y,4.78);panel.userData.acCutawayBayPanel=true;panel.userData.acCutawayBayIndex=i;panel.userData.acModuleRole=s.name;panel.userData.acStructuralControl=true;
    if(i===0)acCanonCockpit(panel,s,m);else if(i===5)acCanonCannon(panel,s,m);else acCanonDoorArmor(panel,s,m,i+1);
    skin.add(panel);panels.push(panel);
  }
  acHullPackDetails(skin);
  for(let i=0;i<panels.length;i++)panels[i].traverse(o=>{o.userData.acCutawayBayIndex=i;o.userData.acCutawayBayPanelPart=true;o.userData.acStructuralControl=true});
  const damagePieces=[];structure.traverse(o=>{if(o.userData?.acProgressiveArmor){o.userData.acDamageInitialVisible=o.visible;damagePieces.push(o)}});
  skin.userData.acSketchHull=true;skin.userData.acPrimaryHull=structure;skin.userData.acCutawayBayPanels=panels;skin.userData.acDamagePresentationParts=damagePieces;skin.userData.acCutawayBayLayout=specs.map((s,i)=>({index:i,x:s.x,y:cy+s.y,z:4.78,w:s.w,h:s.h,points:s.points.map(p=>p.slice()),role:s.name}));
  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='USER_CANON_IMG_3444';skin.userData.acCanonExteriorApplied=true;
  diag('AURELIAN CANON SHAPE','build=v0.46.0 reference=IMG_3444 profile=DEEP_STEPPED_ARMORED_CARRIER frames=6 cockpit=RAISED_GLASS hub=CIRCULAR cannon=LOWER_SOLAR_CANNON prow=SHORT_GOLD_POINT exhausts=3 combat=UNCHANGED');
}`;

  const patched=replaceFunction(html,'function buildAurelianDirectorHull(skin,cy,mat){','function addUnifiedExteriorShell(skin,faction,side){',authority);
  if(patched===html)return html;
  return patched
    .replace(/MATCH RECORDER v0\.\d+\.\d+/g,'MATCH RECORDER v0.46.0')
    .replace(/build=2026-\d{2}-\d{2}_[A-Z0-9_-]+/g,'build=2026-09-11_AURELIAN_REFERENCE_HULL_REBUILD')
    .replace('</head>','<meta id="ac-aurelian-canon-authority-v0460" name="ac-aurelian-canon-authority" content="authority:USER_CANON_IMG_3444 silhouette:DEEP_STEPPED_ARMORED_CARRIER bayFrames:SIX cockpit:RAISED_GLASS hub:CIRCULAR cannon:LOWER_SOLAR_CANNON prow:SHORT_GOLD_POINT exhausts:THREE oldDrawerStack:REMOVED combat:UNCHANGED">\n</head>');
}
