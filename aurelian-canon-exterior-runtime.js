// Replaces the prior exterior builder in the served source, rather than decorating
// an already-built hull. A source mismatch leaves the original game unchanged.
const EXPECTED_LAYOUT = "  const specs=[\n    {name:'PILOT_COCKPIT',x:-8.8,y:7.25,w:7.8,h:5.4,points:[[-3.9,-2.20],[3.85,-2.20],[3.25,2.10],[-2.60,2.62],[-3.95,1.20]]},\n    {name:'PORT_UPPER',x:-9.35,y:1.65,w:11.0,h:5.6,points:[[-5.45,-2.50],[4.55,-2.50],[5.45,-1.15],[4.58,2.58],[-4.80,2.48],[-5.60,.55]]},\n    {name:'PORT_LOWER',x:-9.00,y:-4.25,w:10.9,h:5.6,points:[[-5.40,-2.42],[4.45,-2.42],[5.45,-1.20],[4.68,2.52],[-5.25,2.52],[-5.78,.66]]},\n    {name:'STARBOARD_UPPER',x:7.25,y:4.55,w:13.4,h:5.8,points:[[-6.06,-2.58],[6.60,-2.58],[6.25,2.58],[-4.75,2.52],[-6.20,.38]]},\n    {name:'STARBOARD_LOWER',x:7.35,y:-1.20,w:13.2,h:5.5,points:[[-6.00,-2.42],[5.90,-2.28],[6.45,-.72],[6.20,2.48],[-4.80,2.40],[-6.20,.72]]},\n    {name:'SOLAR_CANNON_BAY',x:8.30,y:-6.55,w:9.8,h:4.7,points:[[-4.88,-1.92],[4.92,-1.48],[4.24,2.08],[-4.30,2.30]]}\n  ];";
export function patchAurelianCanonExteriorRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-canon-exterior-v0428'))return html;
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
// Shared immutable maps: one small set per loaded game, never per animation frame.
let acHullFinishMaps=null;
function acHullFinishResources(){
  if(acHullFinishMaps)return acHullFinishMaps;
  const size=128,grain=new Uint8Array(size*size*4),rough=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const h=((x*73856093)^(y*19349663))>>>0,n=((h^(h>>>13))*1274126177)>>>0;
    const line=Math.sin(y*1.71)*4+Math.sin(y*.23)*3,v=Math.round(222+line+(n%17)-8),r=220+(n%19)-9,k=(y*size+x)*4;
    grain.set([v,v,v,255],k);rough.set([r,r,r,255],k);
  }
  const texture=data=>{const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t};
  const map=texture(grain),roughness=texture(rough);
  // Neutral, broad light cards for the ship's metal only. Not a scene-wide lighting change.
  const w=256,h=128,radiance=new Float32Array(w*h*4),cards=[[.17,.26,.19,.09,3.9],[.70,.38,.035,.24,2.7],[.86,.18,.19,.035,4.4],[.44,.68,.28,.14,.24]];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const u=x/w,v=y/h;let light=.025+.028*Math.max(0,1-v*1.5);
    for(const [cx,cy,sx,sy,power] of cards){const dx=Math.min(Math.abs(u-cx),1-Math.abs(u-cx));light+=power*Math.exp(-.5*((dx/sx)**4+((v-cy)/sy)**4))}
    const k=(y*w+x)*4;radiance.set([light,light*.98,light*.95,1],k);
  }
  const env=new THREE.DataTexture(radiance,w,h,THREE.RGBAFormat,THREE.FloatType);env.mapping=THREE.EquirectangularReflectionMapping;env.magFilter=THREE.LinearFilter;env.minFilter=THREE.LinearFilter;env.needsUpdate=true;
  acHullFinishMaps={map,roughness,env};return acHullFinishMaps;
}
function acHullMaterials(){
  const t=acHullFinishResources();
  const metal=(color,roughness=.28,metalness=.94)=>new THREE.MeshStandardMaterial({color,metalness,roughness,map:t.map,roughnessMap:t.roughness,envMap:t.env,envMapIntensity:.90});
  return {gold:metal(0xb18130,.28),goldDark:metal(0x705020,.34),edge:metal(0xe6bd69,.24),bronze:metal(0x362416,.36),dark:metal(0x0d121a,.44,.72),ivory:metal(0xb2aa96,.34,.78),sun:new THREE.MeshStandardMaterial({color:0xffc34c,emissive:0xff9b15,emissiveIntensity:2.0,metalness:.5,roughness:.20,envMap:t.env}),hot:new THREE.MeshBasicMaterial({color:0xffe5ab}),blue:new THREE.MeshBasicMaterial({color:0x59c5ed}),glass:new THREE.MeshPhysicalMaterial({color:0x55737e,metalness:.16,roughness:.12,clearcoat:1,clearcoatRoughness:.12,envMap:t.env,envMapIntensity:.75,transparent:true,opacity:.26,depthWrite:false,side:THREE.DoubleSide}),trimLine:new THREE.LineBasicMaterial({color:0xb89a60}),glassLine:new THREE.LineBasicMaterial({color:0xbcd7db,transparent:true,opacity:.4}),seamLine:new THREE.LineBasicMaterial({color:0x241a10})};
}
function acHullDetail(parent,geometry,material,name,x=0,y=0,z=0){
  const mesh=acHullMesh(parent,geometry,material,name,x,y,z);mesh.userData.acMergeDetail=true;return mesh;
}
function acHullPipe(parent,a,b,r,material,name){
  const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from),length=delta.length();if(length<.001)return null;
  const mesh=acHullDetail(parent,new THREE.CylinderGeometry(r,r,length,6),material,name);mesh.position.copy(from).add(to).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.multiplyScalar(1/length));return mesh;
}
function acHullPackDetails(root){
  // Merge only explicitly marked art inside its existing parent. Door ownership never changes.
  const parents=new Set();root.traverse(o=>{if(o.userData.acMergeDetail&&o.parent)parents.add(o.parent)});
  for(const parent of parents){
    const groups=new Map();for(const o of [...parent.children])if(o.isMesh&&o.userData.acMergeDetail&&!Array.isArray(o.material)){const list=groups.get(o.material)||[];list.push(o);groups.set(o.material,list)}
    for(const [material,objects] of groups){if(objects.length<2)continue;const attrs={position:[],normal:[],uv:[]};
      for(const o of objects){o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);for(const name of Object.keys(attrs)){const a=g.attributes[name];if(a)attrs[name].push(...a.array);else attrs[name].push(...new Array(g.attributes.position.count*(name==='uv'?2:3)).fill(0))}g.dispose()}
      const geo=new THREE.BufferGeometry();for(const name of Object.keys(attrs))geo.setAttribute(name,new THREE.Float32BufferAttribute(attrs[name],name==='uv'?2:3));
      for(const o of objects){parent.remove(o);o.geometry.dispose()}
      acHullMesh(parent,geo,material,'AURELIAN_BATCHED_METALWORK');
    }
  }
}
function acHullFittedPlate(parent,part,depth,z,material,m,name){
  const p=part.outer,cx=p.reduce((a,v)=>a+v[0],0)/p.length,cy=p.reduce((a,v)=>a+v[1],0)/p.length;
  const shape=acHullShape(p,part.holes),geo=acHullExtrude(shape,depth,.13);
  // Subtle alternating inclines make broad plates catch different reflections.
  const dx=name.length%2?.027:-.025,dy=.026,position=geo.attributes.position;
  for(let i=0;i<position.count;i++)position.setZ(i,position.getZ(i)+(position.getX(i)-cx)*dx+(position.getY(i)-cy)*dy);
  geo.computeVertexNormals();const mesh=acHullMesh(parent,geo,[material,m.edge],name,0,0,z);mesh.userData.acFittedArmor=true;
  // Fine raised machining lips, not thick black lines drawn over room interiors.
  for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if(Math.hypot(b[0]-a[0],b[1]-a[1])<1.1)continue;
    const Z=v=>z+depth+.075+(v[0]-cx)*dx+(v[1]-cy)*dy;
    acHullPipe(parent,[a[0],a[1],Z(a)],[b[0],b[1],Z(b)],.023,m.edge,'AURELIAN_MACHINED_PLATE_EDGE');
  }
  return mesh;
}
function acHullBeveledRim(points){
  const profiles=[[1.145,0],[1.115,.35],[1.065,.62],[1.025,.22]],v=[],idx=[],n=points.length;
  for(const [scale,z] of profiles)for(const [x,y] of points)v.push(x*scale,y*scale,z);
  for(let r=0;r<profiles.length-1;r++)for(let i=0;i<n;i++){const a=r*n+i,b=r*n+(i+1)%n,c=a+n,d=b+n;idx.push(a,b,c,b,d,c)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);const uv=[];for(let i=0;i<v.length;i+=3)uv.push(v[i]*.12,v[i+1]*.12);geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();return geo;
}
function acHullMachinery(kit,m){
  // Recessed grilles, fasteners and seams occupy armor, never the preserved six apertures.
  const box=(w,h,d,mat,name,x,y,z)=>acHullDetail(kit,new THREE.BoxGeometry(w,h,d),mat,name,x,y,z);
  for(const [x,y,w,z] of [[-.5,10.0,3.2,7.9],[7.2,8.6,2.9,8.02],[-17.0,2.0,1.25,7.8],[-16.8,-4.0,1.25,7.65],[16.1,2.7,1.3,7.9],[7.5,-9.5,3.1,7.78]]){
    box(w,.40,.18,m.dark,'AURELIAN_VENT_WELL',x,y,z);
    for(let i=0;i<7;i++){const slat=box(w*.065,.27,.16,m.bronze,'AURELIAN_VENT_SLAT',x+(i-3)*w*.12,y,z+.10);slat.rotation.z=-.23}
    box(w*.55,.055,.055,m.hot,'AURELIAN_RECESSED_STRIP_LIGHT',x,y-.28,z+.03);
  }
  for(const [x,y,z] of [[-15.4,6,7.5],[-15.4,.8,7.6],[-15.8,-6.1,7.3],[-3.2,8,7.9],[.3,7.9,7.9],[14.8,4.2,7.75],[14.8,-1.8,7.7],[.2,-7.8,7.7],[11,-9.35,7.7]]){
    acHullDetail(kit,new THREE.CylinderGeometry(.11,.11,.08,6),m.edge,'AURELIAN_RECESSED_FASTENER',x,y,z).rotation.x=Math.PI/2;
  }
  const sensor=acHullDetail(kit,new THREE.CylinderGeometry(.045,.075,1.65,8),m.edge,'AURELIAN_DORSAL_SENSOR',-9.9,11.65,4.8);
  box(.32,.14,.25,m.bronze,'AURELIAN_SENSOR_MOUNT',-9.9,10.87,4.8);
  const spear=[[-23.0,7.6],[-18.7,8.8],[-13.8,8.9],[-14.0,7.65],[-19.0,7.2]];
  acHullFittedPlate(kit,{outer:spear,holes:[]},.55,5.4,m.gold,m,'AURELIAN_SWEPT_AFT_CROWN');
}
function acHullDoorArmor(panel,s,m,index){
  const profile=s.points,inner=profile.map(([x,y])=>[x*.91,y*.80]);
  acHullMesh(panel,acHullExtrude(acHullShape(profile),.30,.09),[m.goldDark,m.bronze],'AURELIAN_HULL_ARMOR_'+index,0,0,2.15);
  const face=acHullMesh(panel,acHullExtrude(acHullShape(inner),.26,.18),[index%2?m.gold:m.goldDark,m.edge],'AURELIAN_HULL_FACE_'+index,0,0,2.54);
  // Long swept ridges replace the previous flat rectangle and oval drawer-handle motif.
  const w=s.w,h=s.h,ridge=[[-w*.33,-h*.07],[w*.23,-h*.07],[w*.32,h*.11],[-w*.29,h*.14]];
  acHullMesh(panel,acHullExtrude(acHullShape(ridge),.18,.075),[m.gold,m.edge],'AURELIAN_HULL_SWEPT_RIDGE',0,0,2.94);
  for(const sy of[-1,1]){
    acHullDetail(panel,new THREE.BoxGeometry(w*.43,.045,.045),sy<0?m.bronze:m.hot,'AURELIAN_DOOR_EDGE_LIGHT',-w*.045,sy*h*.25,2.94);
    for(let j=0;j<6;j++)acHullDetail(panel,new THREE.BoxGeometry(.055,h*.09,.09),m.dark,'AURELIAN_DOOR_HEAT_VENT',w*.27+j*.115,sy*h*.22,2.96);
  }
  for(const sx of[-1,1])for(const sy of[-1,1])acHullDetail(panel,new THREE.CylinderGeometry(.07,.07,.05,6),m.edge,'AURELIAN_DOOR_FASTENER',sx*w*.29,sy*h*.20,2.94).rotation.x=Math.PI/2;
}
function acHullMesh(parent,geometry,material,name,x=0,y=0,z=0){
  const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;m.userData.acCanonExteriorArt=true;parent.add(m);return m;
}
function acHullExtrude(shape,depth=.5,bevel=.08){const g=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:bevel>0,bevelSegments:3,bevelSize:bevel,bevelThickness:bevel,curveSegments:18});const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*.12,uv.getY(i)*.12);return g}
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
  acHullMesh(pilot,new THREE.BoxGeometry(.31,.09,.06),m.blue,'PILOT_VISOR',0,.58,.235);
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
  for(let i=0;i<12;i++){const a=i*Math.PI/6,fin=acHullDetail(cannon,new THREE.BoxGeometry(1.42,.16,.24),i%3===0?m.edge:m.gold,'AURELIAN_REACTOR_RADIAL_FIN',-2.0,Math.cos(a)*1.12,Math.sin(a)*1.12);fin.rotation.x=a;}
  for(const x of[-.2,1.15,2.50,3.85]){
    const halo=acHullDetail(cannon,new THREE.TorusGeometry(.55,.055,8,32),m.sun,'AURELIAN_CANNON_CONTAINMENT_RING',x+.16,0,.06);halo.rotation.y=Math.PI/2;
    for(const sy of[-1,1])acHullDetail(cannon,new THREE.BoxGeometry(.40,.14,.33),m.edge,'AURELIAN_CANNON_COIL_CLAMP',x,sy*.57,.16);
  }
  for(const sy of[-1,1])acHullPipe(cannon,[-3.45,sy*.94,.50],[-.40,sy*.83,.52],.065,m.bronze,'AURELIAN_REACTOR_SERVICE_LINE');

}
function buildAurelianDirectorHull(skin,cy,mat){
  if(skin.userData.acCanonExteriorApplied&&skin.userData.acPrimaryHull?.parent===skin)return;
  for(const child of [...skin.children]){child.visible=false;child.userData.acLegacyAurelianHull=true}
__SPECS__
  const m=acHullMaterials();
  const structure=new THREE.Group();structure.name='AURELIAN_DIRECTOR_HULL_STRUCTURE';structure.userData.acHullRadii=new THREE.Vector3(29.2,12.5,9.4);structure.userData.acSketchSilhouette=true;structure.userData.acContinuousPressureHull=true;structure.userData.acSegmentedFrontArchitecture=true;skin.add(structure);
  const kit=new THREE.Group();kit.name='AURELIAN_CANON_EXTERIOR_KIT';kit.position.y=cy;structure.add(kit);
  acHullMesh(kit,acAurelianRearHullGeometry(),m.dark,'AURELIAN_REAR_HULL_DEPTH',0,0,.28);
  // Profiles were trimmed against the unchanged bay polygons with a 0.34-unit
  // clearance during mesh authoring. There is no polygon-boolean runtime dependency.
  const sections=[{"name":"AFT_UPPER_0","material":"gold","z":6.62,"depth":1.1,"parts":[{"outer":[[-17.9658,6.9568],[-14.6576,9.3198],[-15.4721,3.8902],[-16.9919,3.8552],[-20.2908,4.9225]],"holes":[]}]},{"name":"AFT_UPPER_1","material":"gold","z":6.72,"depth":1.18,"parts":[{"outer":[[-14.5331,9.4088],[-13.7777,9.9483],[-8.7056,10.9429],[-6.5464,10.0616],[-6.5799,9.8381],[-11.5549,10.2803],[-13.1473,8.6053],[-13.0892,4.655],[-7.3574,4.655],[-7.366,4.5974],[-14.415,4.5222],[-14.6693,3.9088],[-15.3605,3.8928]],"holes":[]}]},{"name":"AFT_UPPER_3","material":"goldDark","z":6.62,"depth":1.18,"parts":[{"outer":[[-7.2461,4.655],[-4.4961,4.655],[-5.1722,9.5007],[-3.8565,8.9637],[-4.0529,4.1538],[-4.3451,4.147],[-4.4574,4.6284],[-7.2546,4.5985]],"holes":[]}]},{"name":"DORSAL_0","material":"gold","z":6.85,"depth":0.78,"parts":[{"outer":[[-10.7793,10.2113],[-7.7891,11.1458],[-3.0015,11.5946],[-1.3532,11.3491],[-2.0334,6.8146],[-4.0849,7.0536],[-4.8824,7.4235],[-5.2022,9.7156]],"holes":[]}]},{"name":"DORSAL_1","material":"ivory","z":6.95,"depth":0.86,"parts":[{"outer":[[-1.2444,11.3329],[6.3881,10.1962],[6.4702,10.1721],[6.0671,7.4844],[2.2897,7.4638],[1.6137,6.4661],[1.0527,6.4551],[-1.9241,6.8019]],"holes":[]}]},{"name":"DORSAL_2","material":"gold","z":7.05,"depth":0.78,"parts":[{"outer":[[6.5767,10.1408],[11.2592,8.7653],[11.0711,7.5117],[6.1784,7.485]],"holes":[]}]},{"name":"DORSAL_3","material":"goldDark","z":6.85,"depth":0.86,"parts":[{"outer":[[11.3657,8.734],[14.3183,7.8667],[13.897,7.1143],[13.869,7.527],[11.1825,7.5123]],"holes":[]}]},{"name":"AFT_MID_0","material":"gold","z":6.72,"depth":0.78,"parts":[{"outer":[[-14.1973,4.745],[-13.0903,4.7303],[-13.0892,4.655],[-7.4204,4.655],[-4.9879,4.6227],[-14.415,4.5222],[-15.3488,2.2692],[-15.1761,-1.245],[-8.6845,-1.245],[-10.8744,-1.335],[-14.5482,-1.335],[-14.5917,-1.4878],[-16.1773,-1.5529],[-15.2503,4.6269]],"holes":[]}]},{"name":"AFT_MID_0","material":"gold","z":6.72,"depth":0.78,"parts":[{"outer":[[-4.4544,4.6156],[-2.9522,4.5957],[-2.6578,-0.9973],[-4.4732,-1.0719],[-3.4765,0.4232]],"holes":[]}]},{"name":"AFT_MID_1","material":"gold","z":6.82,"depth":0.86,"parts":[{"outer":[[-16.2892,-1.5575],[-17.189,-1.5945],[-19.7465,-0.4141],[-19.9428,4.1011],[-15.3635,4.6143]],"holes":[]}]},{"name":"AFT_LOWER_0","material":"gold","z":6.62,"depth":0.82,"parts":[{"outer":[[-14.5482,-1.335],[-15.1819,-3.5589],[-14.7492,-7.065],[-4.3631,-7.065],[-3.125,-5.5546],[-3.9984,-1.335],[-12.0463,-1.335],[-5.5063,-1.245],[-4.5886,-1.245],[-4.5801,-1.2323],[-2.6531,-1.2057],[-2.4566,-6.856],[-8.6032,-8.1944],[-16.1768,-7.447],[-16.9574,-6.7532],[-16.1382,-1.2922],[-14.3407,-1.335]],"holes":[]}]},{"name":"AFT_LOWER_1","material":"gold","z":6.72,"depth":0.9,"parts":[{"outer":[[-17.0555,-6.666],[-18.8503,-5.0706],[-19.7307,-1.2067],[-16.249,-1.2896]],"holes":[]}]},{"name":"CENTRAL_SPINE_0","material":"gold","z":6.86,"depth":0.8,"parts":[{"outer":[[1.2789,8.0476],[2.0683,7.4929],[1.9998,7.0359],[0.6492,5.0427],[0.8132,1.575],[1.1806,1.575],[0.9243,-0.1338],[0.7458,-0.348],[0.7894,-1.033],[-0.2917,-8.2403],[-2.6651,-7.9489],[-3.034,-7.2638],[-0.6921,8.3483]],"holes":[]}]},{"name":"CENTRAL_SPINE_2","material":"gold","z":7.06,"depth":0.8,"parts":[{"outer":[[1.2919,1.575],[1.9553,1.575],[1.664,0.7538],[1.06,0.0289]],"holes":[]}]},{"name":"CENTRAL_SPINE_3","material":"goldDark","z":6.86,"depth":0.88,"parts":[{"outer":[[0.8226,-1.5535],[0.9796,-4.0194],[3.1616,-3.9937],[3.6084,-4.1988],[3.008,-8.5665],[2.969,-8.6408],[-0.1824,-8.2538]],"holes":[]}]},{"name":"CENTRAL_SPINE_4","material":"gold","z":6.96,"depth":0.8,"parts":[{"outer":[[-3.1209,-7.1022],[-3.6255,-6.1652],[-3.125,-5.5546],[-3.9984,-1.335],[-4.3495,-1.335],[-4.2678,-0.7638],[-3.4765,0.4232],[-4.215,3.5894],[-4.541,8.9354],[-0.8009,8.3648]],"holes":[]}]},{"name":"FORWARD_UPPER_0","material":"gold","z":6.72,"depth":0.84,"parts":[{"outer":[[13.9232,1.575],[14.2727,1.575],[13.869,7.527],[10.1816,7.5069],[10.2497,7.9606],[12.6903,7.9949],[15.958,6.7571],[15.194,1.6642],[14.7842,1.4051],[13.9362,1.4082]],"holes":[]}]},{"name":"FORWARD_UPPER_1","material":"gold","z":6.82,"depth":0.92,"parts":[{"outer":[[16.0496,6.6265],[18.123,3.5164],[15.3169,1.7419]],"holes":[]}]},{"name":"FORWARD_UPPER_2","material":"gold","z":6.92,"depth":0.84,"parts":[{"outer":[[2.3484,1.575],[2.2451,1.4512],[1.2423,1.4548],[1.2104,1.575]],"holes":[]}]},{"name":"FORWARD_UPPER_3","material":"goldDark","z":6.72,"depth":0.92,"parts":[{"outer":[[10.0703,7.5063],[2.2897,7.4638],[0.6492,5.0427],[0.7272,3.3943],[0.4085,4.594],[2.0342,7.8455],[10.1382,7.9591]],"holes":[]}]},{"name":"FORWARD_MID_0","material":"gold","z":6.7,"depth":0.76,"parts":[{"outer":[[2.2603,1.4694],[0.7458,-0.348],[0.8105,-1.3638],[0.5579,-0.404],[1.3367,1.4652]],"holes":[]}]},{"name":"FORWARD_MID_1","material":"gold","z":6.8,"depth":0.84,"parts":[{"outer":[[14.5094,1.525],[17.2996,2.4916],[17.3172,2.4852],[16.352,-3.9492],[12.299,-4.065],[12.1888,-4.0658],[7.4376,-3.9434],[13.5307,-3.8717],[14.2003,-1.9725],[13.9272,1.5224]],"holes":[]}]},{"name":"FORWARD_MID_2","material":"gold","z":6.9,"depth":0.76,"parts":[{"outer":[[17.4226,2.4469],[22.6836,0.5338],[16.4815,-3.9455],[16.4637,-3.946]],"holes":[]}]},{"name":"FORWARD_MID_3","material":"goldDark","z":6.7,"depth":0.84,"parts":[{"outer":[[1.5423,-4.1447],[1.5077,-4.0132],[3.6373,-3.9881],[3.6179,-4.1294]],"holes":[]}]},{"name":"VENTRAL_0","material":"gold","z":6.72,"depth":0.85,"parts":[{"outer":[[-4.3549,-7.055],[-2.5819,-7.055],[1.5367,-4.0128],[2.3439,-4.0033],[1.5329,-9.4096],[-1.994,-8.8453],[-9.4148,-8.4],[-8.7703,-7.065],[-4.3631,-7.065]],"holes":[]}]},{"name":"VENTRAL_1","material":"gold","z":6.82,"depth":0.93,"parts":[{"outer":[[2.4553,-4.002],[3.6373,-3.9881],[2.9641,-8.8859],[7.643,-8.6758],[7.4586,-9.905],[5.5024,-10.0447],[1.6416,-9.427]],"holes":[]}]},{"name":"VENTRAL_2","material":"ivory","z":6.92,"depth":0.85,"parts":[{"outer":[[7.755,-8.6708],[12.6769,-8.4498],[12.5128,-9.5439],[7.5711,-9.8969]],"holes":[]}]},{"name":"VENTRAL_3","material":"goldDark","z":6.72,"depth":0.93,"parts":[{"outer":[[12.7889,-8.4447],[13.6936,-8.4041],[13.1903,-5.7689],[13.4644,-3.9417],[14.5812,-3.9548],[18.2083,-6.6996],[14.5801,-9.3963],[12.6252,-9.5359]],"holes":[]}]},{"name":"VENTRAL_4","material":"gold","z":6.82,"depth":0.85,"parts":[{"outer":[[13.128,-5.4427],[12.8683,-4.0834],[8.4601,-3.9698],[8.4659,-3.9313],[10.518,-3.9072],[13.3533,-3.9404]],"holes":[]}]},{"name":"PROW_UPPER_0","material":"gold","z":5.6,"depth":1.25,"parts":[{"outer":[[19.5242,3.1242],[23.8716,0.7615],[19.1899,0.8953]],"holes":[]}]},{"name":"PROW_UPPER_1","material":"gold","z":5.7,"depth":1.33,"parts":[{"outer":[[19.0792,0.8985],[17.1089,0.9548],[14.5136,1.7383],[15.141,4.9238],[19.4204,3.1732]],"holes":[]}]},{"name":"PROW_LOWER_0","material":"bronze","z":5.45,"depth":1.05,"parts":[{"outer":[[23.8258,0.6469],[18.8458,-1.3985],[19.1574,0.6784]],"holes":[]}]},{"name":"PROW_LOWER_1","material":"bronze","z":5.55,"depth":1.13,"parts":[{"outer":[[18.7273,-1.4472],[18.4793,-1.549],[15.035,-2.9268],[14.6615,-1.7128],[16.7251,0.6948],[19.0463,0.6791]],"holes":[]}]}];
  for(const s of sections)for(let j=0;j<s.parts.length;j++)acHullFittedPlate(kit,s.parts[j],s.depth,s.z,m[s.material],m,'AURELIAN_FITTED_'+s.name+'_'+j);
  for(let i=0;i<specs.length;i++){
    const s=specs[i];acHullMesh(kit,acHullBeveledRim(s.points),m.gold,'AURELIAN_PRESSURE_COLLAR_'+(i+1),s.x,s.y,7.03);
    acHullMesh(kit,acHullRing(s.points,1.035,.998,.12),m.dark,'AURELIAN_BAY_GASKET_'+(i+1),s.x,s.y,7.51);
  }
  // Central structural joint and a restrained solar core, not a giant front plate.
  acHullMesh(kit,new THREE.CylinderGeometry(1.22,1.54,.37,32),m.bronze,'AURELIAN_SOLAR_NEXUS_SUPPORT',-.85,-.05,7.65).rotation.x=Math.PI/2;
  acHullMesh(kit,new THREE.TorusGeometry(1.18,.16,10,40),m.gold,'AURELIAN_SOLAR_NEXUS_RIM',-.85,-.05,7.89);
  acHullMesh(kit,new THREE.TorusGeometry(.85,.085,8,36),m.sun,'AURELIAN_SOLAR_NEXUS_RING',-.85,-.05,7.94);
  acHullMesh(kit,new THREE.CircleGeometry(.34,24),m.hot,'AURELIAN_SOLAR_NEXUS_CORE',-.85,-.05,7.97);
  for(let i=0;i<12;i++){const a=i*Math.PI/6,part=acHullDetail(kit,new THREE.BoxGeometry(.12,.25,.12),i%3===0?m.sun:m.edge,'AURELIAN_NEXUS_INLAID_TICK',-.85+Math.cos(a)*1.34,-.05+Math.sin(a)*1.34,8.0);part.rotation.z=a-Math.PI/2;}
  // Keep the established three projecting exhaust housings and two pipes.
  const exhaustRoot=new THREE.Group();exhaustRoot.name='AURELIAN_CANON_EXHAUST_CLUSTER';exhaustRoot.position.z=7.55;kit.add(exhaustRoot);
  for(const y of[-4.8,0,4.8]){
    const housing=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.25,1.55,4.9,32,1,true),m.dark,'AURELIAN_CANON_EXHAUST_HOUSING',-22.1,y,0);housing.rotation.z=Math.PI/2;
    const collar=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.47,1.47,.48,24),m.gold,'AURELIAN_CANON_EXHAUST_COLLAR',-19.85,y,.04);collar.rotation.z=Math.PI/2;
    const inner=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(.82,.98,1.25,20),m.bronze,'AURELIAN_CANON_EXHAUST_INNER',-24.25,y,.03);inner.rotation.z=Math.PI/2;
    const glow=acHullMesh(exhaustRoot,new THREE.CircleGeometry(.70,28),m.sun,'AURELIAN_CANON_EXHAUST_GLOW',-24.92,y,.03);glow.rotation.y=-Math.PI/2;
    for(const x of[-24.45,-22.25,-20.35]){const hoop=acHullDetail(exhaustRoot,new THREE.TorusGeometry(x===-24.45?1.24:1.42,.10,8,32),m.edge,'AURELIAN_EXHAUST_MACHINED_HOOP',x,y,.02);hoop.rotation.y=Math.PI/2;}
    for(const dz of[-.68,.68]){acHullPipe(exhaustRoot,[-23.6,y+dz,.96],[-20.65,y+dz,1.17],.065,m.gold,'AURELIAN_EXHAUST_LONGITUDINAL_RIB');}
    acHullPipe(exhaustRoot,[-23.75,y+.08,1.26],[-22.15,y+.08,1.45],.040,m.sun,'AURELIAN_EXHAUST_HEAT_SLIT');

  }
  for(const y of[-2.4,2.4]){const pipe=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(.22,.28,5.7,14),m.bronze,'AURELIAN_CANON_EXHAUST_PIPE',-21.5,y,.22);pipe.rotation.z=Math.PI/2}
  acHullMachinery(kit,m);
  const panels=[];
  for(let i=0;i<specs.length;i++){
    const s=specs[i],panel=new THREE.Group();panel.name='AURELIAN_HULL_MODULE_'+(i+1)+'_'+s.name;panel.position.set(s.x,cy+s.y,4.78);panel.userData.acCutawayBayPanel=true;panel.userData.acCutawayBayIndex=i;panel.userData.acModuleRole=s.name;
    if(i===0)acHullCockpit(panel,s,m);
    else if(i===5)acHullCannon(panel,s,m);
    else{
      acHullDoorArmor(panel,s,m,i+1);
    }
    panel.traverse(o=>{o.userData.acCutawayBayIndex=i;o.userData.acCutawayBayPanelPart=true});skin.add(panel);panels.push(panel);
  }
  acHullPackDetails(skin);
  skin.userData.acSketchHull=true;skin.userData.acPrimaryHull=structure;skin.userData.acCutawayBayPanels=panels;skin.userData.acCutawayBayLayout=specs.map((s,i)=>({index:i,x:s.x,y:cy+s.y,z:4.78,w:s.w,h:s.h,points:s.points.map(p=>p.slice()),role:s.name}));
  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='AURELIAN_SIX_BAY_SOLAR_WARSHIP';skin.userData.acCanonExteriorApplied=true;
  diag('AURELIAN REFERENCE METALWORK','build=v0.42.8 panels=6 apertures=6 exhausts=3 cockpitAndCannon=DOOR_OWNED geometry=VISUAL_ONLY');
}
`;
  const source=runtime.replace('__SPECS__',layout[0]);
  let patched=html.slice(0,start)+source+'\n'+html.slice(end);
  patched=patched.replace(/MATCH RECORDER v0\.\d+\.\d+/g,'MATCH RECORDER v0.42.8');
  patched=patched.replace(/build=2026-\d{2}-\d{2}_[A-Z0-9_-]+/g,'build=2026-09-07_AURELIAN_REFERENCE_METALWORK');
  return patched.replace('</head>','<meta id="ac-aurelian-canon-exterior-v0428" name="ac-aurelian-canon-exterior" content="builder:REPLACED fittedArmor:33 sixBays:PRESERVED exhausts:3 cockpitAndCannon:DOOR_OWNED">\n</head>');
}
