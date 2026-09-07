// Replaces the prior exterior builder in the served source, rather than decorating
// an already-built hull. A source mismatch leaves the original game unchanged.
const EXPECTED_LAYOUT = "  const specs=[\n    {name:'PILOT_COCKPIT',x:-8.8,y:7.25,w:7.8,h:5.4,points:[[-3.9,-2.20],[3.85,-2.20],[3.25,2.10],[-2.60,2.62],[-3.95,1.20]]},\n    {name:'PORT_UPPER',x:-9.35,y:1.65,w:11.0,h:5.6,points:[[-5.45,-2.50],[4.55,-2.50],[5.45,-1.15],[4.58,2.58],[-4.80,2.48],[-5.60,.55]]},\n    {name:'PORT_LOWER',x:-9.00,y:-4.25,w:10.9,h:5.6,points:[[-5.40,-2.42],[4.45,-2.42],[5.45,-1.20],[4.68,2.52],[-5.25,2.52],[-5.78,.66]]},\n    {name:'STARBOARD_UPPER',x:7.25,y:4.55,w:13.4,h:5.8,points:[[-6.06,-2.58],[6.60,-2.58],[6.25,2.58],[-4.75,2.52],[-6.20,.38]]},\n    {name:'STARBOARD_LOWER',x:7.35,y:-1.20,w:13.2,h:5.5,points:[[-6.00,-2.42],[5.90,-2.28],[6.45,-.72],[6.20,2.48],[-4.80,2.40],[-6.20,.72]]},\n    {name:'SOLAR_CANNON_BAY',x:8.30,y:-6.55,w:9.8,h:4.7,points:[[-4.88,-1.92],[4.92,-1.48],[4.24,2.08],[-4.30,2.30]]}\n  ];";
export function patchAurelianCanonExteriorRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-canon-exterior-v0427'))return html;
  const startToken='function buildAurelianDirectorHull(skin,cy,mat){';
  const endToken='function addUnifiedExteriorShell(skin,faction,side){';
  const start=html.indexOf(startToken),end=html.indexOf(endToken,start);
  if(start<0||end<0||html.indexOf(startToken,start+1)!==-1)return html;
  const previous=html.slice(start,end),layout=previous.match(/  const specs=\[[\s\S]*?\n  \];/);
  if(!layout||layout[0]!==EXPECTED_LAYOUT)return html;
  const runtime=String.raw`// Art-only geometry. No selection, aim, projectile, damage, or turn state is written here.
function acHullShape(points,holes=[]){
  const s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);s.closePath();
  for(const pts of holes){const h=new THREE.Path();h.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)h.lineTo(pts[i][0],pts[i][1]);h.closePath();s.holes.push(h)}
  return s;
}
function acHullMesh(parent,geometry,material,name,x=0,y=0,z=0){
  const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;m.userData.acCanonExteriorArt=true;parent.add(m);return m;
}
function acHullExtrude(shape,depth=.5,bevel=.08){return new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:bevel>0,bevelSegments:2,bevelSize:bevel,bevelThickness:bevel,curveSegments:18})}
function acHullRing(points,outer=1.12,inner=1.025,depth=.55){
  return acHullExtrude(acHullShape(points.map(([x,y])=>[x*outer,y*outer]),[points.map(([x,y])=>[x*inner,y*inner]).reverse()]),depth,.055);
}
function acHullLine(parent,points,mat,name){
  const mesh=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),mat);mesh.name=name;mesh.userData.acCanonExteriorArt=true;parent.add(mesh);return mesh;
}
function acHullCanopyGeometry(points){
  // A curved glazed surface, not the previous flat circular porthole.
  const n=points.length,vertices=[],indices=[],rings=[[1,0],[.88,.27],[.62,.56],[.28,.72]];
  for(const [s,z] of rings)for(const [x,y] of points)vertices.push(x*s,y*s,z);
  for(let k=0;k<rings.length-1;k++)for(let j=0;j<n;j++){const a=k*n+j,b=k*n+(j+1)%n,c=a+n,d=b+n;indices.push(a,b,c,b,d,c)}
  const center=vertices.length/3;vertices.push(0,0,.76);for(let j=0;j<n;j++)indices.push(3*n+j,3*n+(j+1)%n,center);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function acHullCockpit(panel,s,m){
  const cockpit=new THREE.Group();cockpit.name='AURELIAN_CANON_COCKPIT';panel.add(cockpit);
  const c=new THREE.Shape();c.moveTo(-3.35,-1.48);c.lineTo(2.58,-1.48);c.quadraticCurveTo(3.45,-1.35,3.30,.05);c.quadraticCurveTo(2.80,1.92,1.65,1.96);c.lineTo(-1.90,2.10);c.quadraticCurveTo(-3.65,1.72,-3.35,-1.48);
  const outline=c.getPoints(10).map(v=>[v.x,v.y]);
  acHullMesh(cockpit,acHullExtrude(acHullShape(s.points,[outline.slice().reverse()]),.46,.05),[m.gold,m.bronze],'AURELIAN_COCKPIT_ARMORED_FRAME',0,0,2.20);
  acHullMesh(cockpit,acHullExtrude(acHullShape(outline),.13,.02),m.dark,'AURELIAN_COCKPIT_REAR',0,0,.65);
  const box=(w,h,d,mat,name,x,y,z)=>acHullMesh(cockpit,new THREE.BoxGeometry(w,h,d),mat,name,x,y,z);
  box(4.8,.32,.8,m.bronze,'AURELIAN_COCKPIT_DASH',-.10,-1.03,1.72);
  box(.76,1.26,.38,m.dark,'AURELIAN_COCKPIT_SEAT',1.0,-.20,1.13);
  box(.72,.23,.66,m.ivory,'AURELIAN_COCKPIT_SEAT_CUSHION',1.0,-.72,1.34);
  const pilot=new THREE.Group();pilot.name='AURELIAN_COCKPIT_DECORATIVE_PILOT';pilot.position.set(1.0,-.05,1.49);cockpit.add(pilot);
  acHullMesh(pilot,new THREE.CylinderGeometry(.21,.29,.70,8),m.ivory,'PILOT_TORSO');
  acHullMesh(pilot,new THREE.SphereGeometry(.23,12,8),m.gold,'PILOT_HELMET',0,.56,.04);
  acHullMesh(pilot,new THREE.BoxGeometry(.31,.09,.06),m.dark,'PILOT_VISOR',0,.58,.235);
  for(const sx of[-1,1]){const arm=acHullMesh(pilot,new THREE.CylinderGeometry(.075,.09,.60,8),m.ivory,'PILOT_ARM',sx*.32,-.12,.16);arm.rotation.z=sx*.46;acHullMesh(pilot,new THREE.BoxGeometry(.19,.27,.40),m.dark,'PILOT_KNEE',sx*.17,-.54,.20)}
  for(const x of[-1.65,-.7,.3]){const screen=box(.66,.47,.10,m.blue,'AURELIAN_COCKPIT_SCREEN',x,-.51,1.87);screen.rotation.x=-.14;box(.53,.034,.015,m.hot,'AURELIAN_COCKPIT_READOUT',x,-.50,1.93)}
  acHullMesh(cockpit,acHullCanopyGeometry(outline),m.glass,'AURELIAN_COCKPIT_GLAZING',0,0,2.39);
  for(const x of[-1.98,2.08])acHullLine(cockpit,[[x,-1.30,2.44],[x*.97,-.75,2.97],[x*.84,.40,3.04],[x*.73,1.78,2.49]],m.trimLine,'AURELIAN_COCKPIT_CANOPY_RIB');
  acHullLine(cockpit,[[-2.4,1.51,2.67],[-.6,1.73,2.84],[1.2,1.66,2.71]],m.glassLine,'AURELIAN_COCKPIT_HIGHLIGHT');
}
function acHullCannon(panel,s,m){
  const cannon=new THREE.Group();cannon.name='AURELIAN_CANON_SOLAR_CANNON_ART';cannon.position.z=1.60;panel.add(cannon);
  // Whole assembly is a child of its original exterior door. Opening that bay
  // removes the decorative cannon along with the door, keeping crew unobstructed.
  acHullMesh(panel,acHullExtrude(acHullShape(s.points),.15,.03),m.dark,'AURELIAN_CANNON_BAY_RECESS',0,0,.25);
  acHullMesh(panel,acHullRing(s.points,1,.88,.38),[m.gold,m.bronze],'AURELIAN_CANNON_BAY_LIP',0,0,2.15);
  acHullMesh(cannon,new THREE.BoxGeometry(7.0,.33,1.36),m.bronze,'AURELIAN_CANNON_CRADLE',.45,-1.2,-.10);
  const cyl=(r1,r2,len,mat,name,x,y=0,z=0)=>{const o=acHullMesh(cannon,new THREE.CylinderGeometry(r1,r2,len,20),mat,name,x,y,z);o.rotation.z=-Math.PI/2;return o};
  cyl(1.05,1.23,2.20,m.bronze,'AURELIAN_CANNON_BREECH',-2.10);
  acHullMesh(cannon,new THREE.SphereGeometry(.76,20,14),m.sun,'AURELIAN_CANNON_CHAMBER',-1.22,0,.18);
  for(const r of[.89,1.12])acHullMesh(cannon,new THREE.TorusGeometry(r,.085,8,30),r>1?m.gold:m.sun,'AURELIAN_CANNON_CHAMBER_RING',-1.7,0,.82);
  cyl(.29,.46,6.7,m.dark,'AURELIAN_CANNON_BARREL',2.23);
  cyl(.13,.13,4.9,m.sun,'AURELIAN_CANNON_CONTAINED_ENERGY',2.02,0,.42);
  for(const x of[-.2,1.15,2.50,3.85])cyl(.53,.53,.25,m.gold,'AURELIAN_CANNON_COIL',x);
  cyl(.68,.49,.86,m.bronze,'AURELIAN_CANNON_MUZZLE',5.45);
  cyl(.54,.54,.18,m.gold,'AURELIAN_CANNON_MUZZLE_RIM',5.90);
  const core=acHullMesh(cannon,new THREE.CircleGeometry(.36,24),m.hot,'AURELIAN_CANNON_MUZZLE_CORE',6.0,0,0);core.rotation.y=Math.PI/2;
  for(const sy of[-1,1])acHullMesh(cannon,new THREE.BoxGeometry(5.35,.12,.17),m.ivory,'AURELIAN_CANNON_SUPPORT_RAIL',1.65,sy*.61,.10);
}
function buildAurelianDirectorHull(skin,cy,mat){
  if(skin.userData.acCanonExteriorApplied&&skin.userData.acPrimaryHull?.parent===skin)return;
  for(const child of [...skin.children]){child.visible=false;child.userData.acLegacyAurelianHull=true}
__SPECS__
  const standard=(color,metalness,roughness)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
  const m={gold:standard(0xcba052,.68,.28),bronze:standard(0x785125,.70,.34),dark:standard(0x171a1f,.45,.46),ivory:standard(0xe5d4af,.42,.30),sun:new THREE.MeshStandardMaterial({color:0xffc754,emissive:0xffae32,emissiveIntensity:1.1,metalness:.25,roughness:.28}),hot:new THREE.MeshBasicMaterial({color:0xffecc0}),blue:new THREE.MeshBasicMaterial({color:0x73cde6}),glass:new THREE.MeshPhysicalMaterial({color:0x8bbac9,metalness:.05,roughness:.13,transparent:true,opacity:.23,depthWrite:false,side:THREE.DoubleSide}),trimLine:new THREE.LineBasicMaterial({color:0xe8d5a7}),glassLine:new THREE.LineBasicMaterial({color:0xc3e7f1,transparent:true,opacity:.48}),seamLine:new THREE.LineBasicMaterial({color:0x59411f})};
  const structure=new THREE.Group();structure.name='AURELIAN_DIRECTOR_HULL_STRUCTURE';structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4);structure.userData.acSketchSilhouette=true;structure.userData.acContinuousPressureHull=true;structure.userData.acSegmentedFrontArchitecture=true;skin.add(structure);
  const kit=new THREE.Group();kit.name='AURELIAN_CANON_EXTERIOR_KIT';kit.position.y=cy;structure.add(kit);
  acHullMesh(kit,acAurelianRearHullGeometry(),m.bronze,'AURELIAN_REAR_HULL_DEPTH',0,0,.28);
  // Profiles were trimmed against the unchanged bay polygons with a 0.34-unit
  // clearance during mesh authoring. There is no polygon-boolean runtime dependency.
  const sections=[{"name":"AFT_UPPER","material":"bronze","z":6.62,"depth":1.1,"parts":[{"outer":[[-18.0,7.0],[-13.8,10.0],[-8.7,11.0],[-5.4781,9.685],[-11.5333,10.2232],[-13.092,8.5837],[-13.035,4.71],[-4.5593,4.71],[-5.2399,9.5877],[-3.8,9.0],[-4.0,4.1],[-4.3885,4.091],[-4.5009,4.5729],[-14.3781,4.4676],[-14.6322,3.8546],[-17.0,3.8],[-20.4,4.9]],"holes":[]}]},{"name":"DORSAL","material":"gold","z":6.85,"depth":0.78,"parts":[{"outer":[[-7.8,11.2],[-3.0,11.65],[6.4,10.25],[14.4,7.9],[13.8546,6.9261],[13.8176,7.4717],[2.319,7.409],[1.6433,6.4117],[1.05,6.4],[-4.1,7.0],[-4.9327,7.3862],[-5.2506,9.6647],[-10.9354,10.17],[-11.0,10.2]],"holes":[]}]},{"name":"AFT_MID","material":"gold","z":6.72,"depth":0.78,"parts":[{"outer":[[-14.2,4.8],[-13.0361,4.7846],[-13.035,4.71],[-7.42,4.71],[-2.9,4.65],[-2.6,-1.05],[-4.5789,-1.1313],[-3.5355,0.4339],[-4.5009,4.5729],[-14.3781,4.4676],[-15.2933,2.2596],[-15.1237,-1.19],[-6.0067,-1.19],[-10.8733,-1.39],[-14.5067,-1.39],[-14.5497,-1.5411],[-17.2,-1.65],[-19.8,-0.45],[-20.0,4.15]],"holes":[]}]},{"name":"AFT_LOWER","material":"bronze","z":6.62,"depth":0.82,"parts":[{"outer":[[-13.5,-1.3],[-5.5067,-1.19],[-4.618,-1.19],[-4.6098,-1.1777],[-2.6,-1.15],[-2.4,-6.9],[-8.6,-8.25],[-16.2,-7.5],[-18.9,-5.1],[-19.8,-1.15]],"holes":[[[-14.5067,-1.39],[-15.1259,-3.5632],[-14.7006,-7.01],[-4.3891,-7.01],[-3.1842,-5.54],[-4.0432,-1.39]]]}]},{"name":"CENTRAL_SPINE","material":"gold","z":6.86,"depth":0.8,"parts":[{"outer":[[1.3,8.1],[2.3075,7.392],[0.705,5.027],[0.8657,1.63],[2.0332,1.63],[1.7125,0.7261],[0.8021,-0.3664],[1.0312,-3.9638],[3.1733,-3.9386],[3.6684,-4.1658],[3.0612,-8.5836],[3.0,-8.7],[-2.7,-8.0],[-3.6914,-6.1588],[-3.1842,-5.54],[-4.0432,-1.39],[-4.4129,-1.39],[-4.3205,-0.7437],[-3.5355,0.4339],[-4.2696,3.5814],[-4.6,9.0]],"holes":[]}]},{"name":"FORWARD_UPPER","material":"gold","z":6.72,"depth":0.84,"parts":[{"outer":[[12.7,8.05],[16.0,6.8],[18.2,3.5],[14.8,1.35],[13.8853,1.3534],[13.8643,1.6223],[2.3898,1.5388],[2.2708,1.3961],[1.2,1.4],[1.1389,1.63],[14.2138,1.63],[13.8176,7.4717],[2.319,7.409],[0.705,5.027],[0.8065,2.8814],[0.35,4.6],[2.0,7.9]],"holes":[]}]},{"name":"FORWARD_MID","material":"ivory","z":6.7,"depth":0.76,"parts":[{"outer":[[2.3782,1.5249],[0.8021,-0.3664],[0.9014,-1.9252],[0.5,-0.4],[1.3,1.52]],"holes":[]},{"outer":[[14.5,1.58],[17.3,2.55],[22.8,0.55],[16.5,-4.0],[12.3,-4.12],[12.1883,-4.1208],[4.5052,-3.9229],[13.4916,-3.8172],[14.1446,-1.9652],[13.8678,1.5771]],"holes":[]},{"outer":[[1.5,-4.2],[1.4366,-3.959],[3.7005,-3.9324],[3.6659,-4.184]],"holes":[]}]},{"name":"VENTRAL","material":"gold","z":6.72,"depth":0.85,"parts":[{"outer":[[-2.6,-7.0],[1.5183,-3.958],[3.7005,-3.9324],[3.0276,-8.828],[13.6277,-8.352],[12.8226,-4.1372],[4.5052,-3.9229],[10.518,-3.8522],[14.6,-3.9],[18.3,-6.7],[14.6,-9.45],[5.5,-10.1],[-2.0,-8.9],[-9.5,-8.45],[-8.8048,-7.01],[-4.3891,-7.01],[-4.3809,-7.0]],"holes":[]}]},{"name":"PROW_UPPER","material":"gold","z":5.6,"depth":1.25,"parts":[{"outer":[[19.5,3.2],[24.1,0.7],[17.1,0.9],[14.45,1.7],[15.1,5.0]],"holes":[]}]},{"name":"PROW_LOWER","material":"bronze","z":5.45,"depth":1.05,"parts":[{"outer":[[24.1,0.7],[18.5,-1.6],[15.0,-3.0],[14.6,-1.7],[16.7,0.75]],"holes":[]}]}];
  for(const s of sections)for(let j=0;j<s.parts.length;j++){const p=s.parts[j],mesh=acHullMesh(kit,acHullExtrude(acHullShape(p.outer,p.holes),s.depth,.09),[m[s.material],m.bronze],'AURELIAN_FITTED_'+s.name+'_'+j,0,0,s.z);mesh.userData.acFittedArmor=true}
  for(let i=0;i<specs.length;i++){
    const s=specs[i];acHullMesh(kit,acHullRing(s.points,1.115,1.025,.38),[m.gold,m.bronze],'AURELIAN_PRESSURE_COLLAR_'+(i+1),s.x,s.y,7.03);
    acHullMesh(kit,acHullRing(s.points,1.035,.998,.12),m.dark,'AURELIAN_BAY_GASKET_'+(i+1),s.x,s.y,7.51);
  }
  // Central structural joint and a restrained solar core, not a giant front plate.
  acHullMesh(kit,new THREE.CylinderGeometry(1.22,1.54,.37,32),m.bronze,'AURELIAN_SOLAR_NEXUS_SUPPORT',-.85,-.05,7.65).rotation.x=Math.PI/2;
  acHullMesh(kit,new THREE.TorusGeometry(1.18,.16,10,40),m.gold,'AURELIAN_SOLAR_NEXUS_RIM',-.85,-.05,7.89);
  acHullMesh(kit,new THREE.TorusGeometry(.85,.085,8,36),m.sun,'AURELIAN_SOLAR_NEXUS_RING',-.85,-.05,7.94);
  acHullMesh(kit,new THREE.CircleGeometry(.34,24),m.hot,'AURELIAN_SOLAR_NEXUS_CORE',-.85,-.05,7.97);
  // Keep the established three projecting exhaust housings and two pipes.
  const exhaustRoot=new THREE.Group();exhaustRoot.name='AURELIAN_CANON_EXHAUST_CLUSTER';exhaustRoot.position.z=7.55;kit.add(exhaustRoot);
  for(const y of[-4.8,0,4.8]){
    const housing=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.25,1.55,4.9,24),m.dark,'AURELIAN_CANON_EXHAUST_HOUSING',-22.1,y,0);housing.rotation.z=Math.PI/2;
    const collar=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.47,1.47,.48,24),m.gold,'AURELIAN_CANON_EXHAUST_COLLAR',-19.85,y,.04);collar.rotation.z=Math.PI/2;
    const inner=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(.82,.98,1.25,20),m.bronze,'AURELIAN_CANON_EXHAUST_INNER',-24.25,y,.03);inner.rotation.z=Math.PI/2;
    const glow=acHullMesh(exhaustRoot,new THREE.CircleGeometry(.70,28),m.sun,'AURELIAN_CANON_EXHAUST_GLOW',-24.92,y,.03);glow.rotation.y=-Math.PI/2;
  }
  for(const y of[-2.4,2.4]){const pipe=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(.22,.28,5.7,14),m.bronze,'AURELIAN_CANON_EXHAUST_PIPE',-21.5,y,.22);pipe.rotation.z=Math.PI/2}
  const panels=[];
  for(let i=0;i<specs.length;i++){
    const s=specs[i],panel=new THREE.Group();panel.name='AURELIAN_HULL_MODULE_'+(i+1)+'_'+s.name;panel.position.set(s.x,cy+s.y,4.78);panel.userData.acCutawayBayPanel=true;panel.userData.acCutawayBayIndex=i;panel.userData.acModuleRole=s.name;
    if(i===0)acHullCockpit(panel,s,m);
    else if(i===5)acHullCannon(panel,s,m);
    else{
      acHullMesh(panel,acHullExtrude(acHullShape(s.points),.40,.09),[m.gold,m.bronze],'AURELIAN_HULL_ARMOR_'+(i+1),0,0,2.20);
      acHullMesh(panel,acHullExtrude(acHullShape(s.points.map(([x,y])=>[x*.91,y*.86])),.12,.085),[i===4?m.ivory:m.gold,m.bronze],'AURELIAN_HULL_FACE_'+(i+1),0,0,2.70);
      // Subtle seams follow the hull rather than repeated oval drawer handles.
      acHullLine(panel,[[-s.w*.30,-s.h*.25,2.96],[s.w*.22,-s.h*.25,2.96],[s.w*.32,-s.h*.07,2.96]],m.seamLine,'AURELIAN_HULL_PANEL_SEAM');
      acHullMesh(panel,new THREE.BoxGeometry(s.w*.20,.047,.06),m.hot,'AURELIAN_HULL_RUNNING_LIGHT',-s.w*.10,s.h*.25,2.97);
    }
    panel.traverse(o=>{o.userData.acCutawayBayIndex=i;o.userData.acCutawayBayPanelPart=true});skin.add(panel);panels.push(panel);
  }
  skin.userData.acSketchHull=true;skin.userData.acPrimaryHull=structure;skin.userData.acCutawayBayPanels=panels;skin.userData.acCutawayBayLayout=specs.map((s,i)=>({index:i,x:s.x,y:cy+s.y,z:4.78,w:s.w,h:s.h,points:s.points.map(p=>p.slice()),role:s.name}));
  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='AURELIAN_SIX_BAY_SOLAR_WARSHIP';skin.userData.acCanonExteriorApplied=true;
  diag('AURELIAN FITTED HULL','build=v0.42.7 panels=6 apertures=6 exhausts=3 cockpitAndCannon=DOOR_OWNED geometry=VISUAL_ONLY');
}
`;
  const source=runtime.replace('__SPECS__',layout[0]);
  let patched=html.slice(0,start)+source+'\n'+html.slice(end);
  patched=patched.replace(/MATCH RECORDER v0\.\d+\.\d+/g,'MATCH RECORDER v0.42.7');
  patched=patched.replace(/build=2026-\d{2}-\d{2}_[A-Z0-9_-]+/g,'build=2026-09-07_AURELIAN_FITTED_HULL');
  return patched.replace('</head>','<meta id="ac-aurelian-canon-exterior-v0427" name="ac-aurelian-canon-exterior" content="builder:REPLACED fittedArmor:12 sixBays:PRESERVED exhausts:3 cockpitAndCannon:DOOR_OWNED">\n</head>');
}
