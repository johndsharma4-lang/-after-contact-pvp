function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianCanonAuthorityRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-canon-authority-v0455'))return html;
  if(!html.includes('ac-aurelian-reference-polish-v0450'))return html;

  const authority=String.raw`function acUserCanonShell(kit,m,specs){
  const plate=(name,points,mat,z,depth=.48)=>acHullMesh(kit,acHullExtrude(acHullShape(points),depth,.10),[mat,m.edge],name,0,0,z);

  // USER CANON PROFILE: the six modules are the ship. Fixed armor occupies the
  // perimeter and narrow structural gaps only; no single plate buries the bays.
  const frame=(name,index,outer=1.19)=>{
    const s=specs[index];
    return acHullMesh(kit,acHullRing(s.points,outer,1.025,.20),[m.gold,m.edge],name,s.x,s.y,7.34);
  };
  // Cockpit and cannon receive a pronounced collar. The four central rooms use
  // the thin exact collars built below; duplicating their irregular rings made
  // the center read as four boxes and produced oversized triangular corners.
  frame('AURELIAN_CANON_COCKPIT_FRAME',0,1.16);
  frame('AURELIAN_CANON_SOLAR_CANNON_FRAME',5,1.12);

  // Stepped roof: raised cockpit aft, a broad nearly-horizontal command deck,
  // then a separate hard prow shoulder.  Keep these as distinct masses so the
  // profile cannot collapse back into the old leaf/oval silhouette.
  plate('AURELIAN_CANON_AFT_DORSAL_BLOCK',[
    [-27.0,4.7],[-25.2,8.0],[-21.0,10.5],[-15.0,11.5],[-12.8,10.0],[-18.8,9.3],[-23.5,7.1],[-25.4,4.7]
  ],m.goldDark,7.18,.72);
  plate('AURELIAN_CANON_COMMAND_DECK',[
    [-13.6,11.5],[-6.0,12.0],[2.5,11.7],[10.2,10.6],[15.0,9.0],[13.7,7.6],[7.8,8.2],[1.2,8.7],[-6.0,9.1],[-12.5,9.6]
  ],m.gold,7.40,.66);
  plate('AURELIAN_CANON_DORSAL_IVORY_ARMOR',[
    [-12.5,10.8],[-6.0,11.2],[1.8,10.9],[8.0,10.0],[12.4,8.8],[9.0,8.9],[2.0,9.5],[-5.5,9.8],[-10.8,9.7]
  ],m.ivory,8.12,.22);

  // Thick angular shoulders make each bay read as part of one armored carrier,
  // while leaving the actual apertures and hit/selection planes untouched.
  plate('AURELIAN_CANON_PORT_DORSAL_SHOULDER',[[-18.0,9.8],[-15.3,8.6],[-14.7,4.6],[-16.2,3.9],[-19.2,7.0]],m.gold,7.62,.62);
  plate('AURELIAN_CANON_PORT_VENTRAL_SHOULDER',[[-16.0,-1.6],[-14.7,-2.1],[-14.2,-7.0],[-17.0,-7.2],[-18.1,-4.6]],m.gold,7.60,.62);

  // Narrow load-bearing bridges preserve the staggered module breaks.
  plate('AURELIAN_CANON_LEFT_UPPER_BRIDGE',[[-16.1,4.15],[-3.8,4.20],[-3.4,5.10],[-14.9,5.12],[-16.4,4.70]],m.gold,7.48,.46);
  plate('AURELIAN_CANON_LEFT_LOWER_BRIDGE',[[-15.7,-1.74],[-3.7,-1.70],[-3.45,-.86],[-14.9,-.82],[-16.1,-1.20]],m.goldDark,7.44,.46);
  plate('AURELIAN_CANON_RIGHT_UPPER_BRIDGE',[[.35,1.25],[14.7,1.30],[15.3,1.93],[1.2,1.96]],m.gold,7.48,.46);
  plate('AURELIAN_CANON_RIGHT_LOWER_BRIDGE',[[.35,-4.45],[14.4,-4.40],[15.1,-3.67],[1.15,-3.62]],m.goldDark,7.44,.46);

  // Angular aft engine shoulder and stepped ventral keel.  The rear is layered
  // gold machinery rather than one dark rectangular backing slab.
  plate('AURELIAN_CANON_AFT_ENGINE_SHOULDER',[
    [-27.3,4.6],[-24.8,4.7],[-17.0,4.3],[-17.0,-6.8],[-24.2,-6.8],[-27.0,-4.6],[-27.8,-1.8],[-27.8,2.0]
  ],m.bronze,6.92,.76);
  plate('AURELIAN_CANON_AFT_UPPER_COWL',[[-27.4,5.0],[-23.6,7.6],[-18.0,7.2],[-16.2,5.0],[-20.0,4.5],[-25.0,4.4]],m.gold,7.74,.46);
  plate('AURELIAN_CANON_AFT_LOWER_COWL',[[-27.0,-4.5],[-24.1,-7.8],[-18.0,-8.0],[-15.8,-6.8],[-20.0,-6.3],[-24.8,-6.2]],m.goldDark,7.72,.46);
  plate('AURELIAN_CANON_AFT_IVORY_STRIKE',[[-25.7,7.0],[-22.2,8.8],[-17.2,8.5],[-19.1,7.5],[-23.1,7.3]],m.ivory,8.18,.18);
  plate('AURELIAN_CANON_VENTRAL_STEP_LEFT',[
    [-25.0,-7.0],[-15.0,-7.15],[-3.6,-7.0],[-3.0,-8.7],[-10.0,-9.8],[-18.0,-9.6],[-24.6,-8.2]
  ],m.gold,7.32,.62);
  plate('AURELIAN_CANON_VENTRAL_STEP_RIGHT',[
    [-3.0,-8.7],[2.8,-9.9],[10.4,-10.0],[15.2,-8.6],[17.0,-6.7],[14.2,-7.2],[12.6,-8.4],[5.0,-9.0]
  ],m.goldDark,7.50,.58);
  plate('AURELIAN_CANON_VENTRAL_IVORY_RAIL',[
    [-10.5,-8.9],[-3.2,-9.2],[4.0,-9.4],[10.8,-8.9],[14.0,-7.7],[10.0,-8.2],[3.5,-8.5],[-4.0,-8.4]
  ],m.ivory,8.10,.19);

  // Separate forward armor masses form the reference's pointed right prow.
  plate('AURELIAN_CANON_PROW_UPPER',[
    [14.1,7.3],[18.0,6.5],[20.2,4.9],[23.5,4.1],[26.8,2.2],[28.2,.45],[25.5,1.0],[22.0,2.1],[18.7,3.8],[15.2,5.4]
  ],m.gold,7.72,.70);
  plate('AURELIAN_CANON_PROW_LOWER',[
    [14.5,-4.5],[18.7,-3.7],[21.8,-2.4],[25.4,-1.2],[28.2,.45],[25.4,-1.8],[22.4,-3.4],[18.6,-5.0],[16.0,-6.5]
  ],m.goldDark,7.58,.66);
  plate('AURELIAN_CANON_PROW_CORE',[
    [14.6,1.72],[18.6,2.72],[22.2,2.2],[25.8,1.4],[28.2,.45],[25.6,-.7],[22.0,-1.8],[18.5,-2.45],[14.6,-1.42]
  ],m.gold,7.18,.82);
  plate('AURELIAN_CANON_PROW_IVORY_CAP',[
    [18.8,4.7],[21.5,3.3],[25.8,1.1],[23.0,2.0],[20.2,3.5]
  ],m.ivory,8.30,.20);
  const prowJoint=acHullMesh(kit,new THREE.CylinderGeometry(1.28,1.28,.34,40),m.goldDark,'AURELIAN_CANON_PROW_JOINT',23.4,.25,8.14);prowJoint.rotation.x=Math.PI/2;
  const prowRing=acHullMesh(kit,new THREE.TorusGeometry(.91,.16,10,40),m.ivory,'AURELIAN_CANON_PROW_JOINT_RING',23.4,.25,8.34);prowRing.rotation.x=Math.PI/2;
  const prowCore=acHullMesh(kit,new THREE.CircleGeometry(.43,32),m.sun,'AURELIAN_CANON_PROW_JOINT_CORE',23.4,.25,8.46);prowCore.rotation.x=Math.PI/2;

  // Raised oval glass cockpit is carried by bay one, while this brow makes its
  // silhouette visibly stand above the rest of the carrier.
  plate('AURELIAN_CANON_RAISED_COCKPIT_BROW',[
    [-14.4,10.0],[-12.6,11.8],[-9.0,12.9],[-5.4,12.5],[-3.6,11.0],[-5.2,9.9],[-9.2,9.5],[-12.6,9.4]
  ],m.gold,8.02,.52);
  plate('AURELIAN_CANON_RAISED_COCKPIT_IVORY',[
    [-12.8,10.6],[-10.7,12.0],[-7.6,12.2],[-5.2,11.3],[-6.4,10.5],[-9.5,10.0]
  ],m.ivory,8.36,.20);

  // Oversized central joint is the visual hinge between the four main bay masses.
  const hub=acHullMesh(kit,new THREE.CylinderGeometry(2.55,2.55,.50,48),m.gold,'AURELIAN_CANON_CENTRAL_HUB',-.15,.15,8.04);hub.rotation.x=Math.PI/2;
  const ring=acHullMesh(kit,new THREE.TorusGeometry(1.82,.24,14,48),m.ivory,'AURELIAN_CANON_CENTRAL_HUB_RING',-.15,.15,8.36);ring.rotation.x=Math.PI/2;
  const innerRing=acHullMesh(kit,new THREE.TorusGeometry(1.14,.10,10,40),m.goldDark,'AURELIAN_CANON_CENTRAL_HUB_INNER_RING',-.15,.15,8.47);innerRing.rotation.x=Math.PI/2;
  const core=acHullMesh(kit,new THREE.CircleGeometry(.74,40),m.sun,'AURELIAN_CANON_CENTRAL_HUB_CORE',-.15,.15,8.52);core.rotation.x=Math.PI/2;

  // Ivory structural strokes reinforce the stacked architectural reading.
  const rails=[
    [[-24.2,7.8],[-18.0,10.0],[-13.7,10.1]],
    [[-15.0,4.65],[-9.0,4.75],[-3.8,4.65]],
    [[1.8,7.8],[8.6,7.4],[14.5,6.3]],
    [[1.5,-4.0],[8.3,-4.0],[14.7,-4.8]]
  ];
  for(let i=0;i<rails.length;i++)for(let j=0;j<rails[i].length-1;j++)acHullPipe(kit,[...rails[i][j],8.42],[...rails[i][j+1],8.42],.10,m.ivory,'AURELIAN_CANON_ARCHITECTURAL_RAIL_'+i+'_'+j);
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
  const structure=new THREE.Group();structure.name='AURELIAN_DIRECTOR_HULL_STRUCTURE';structure.userData.acHullRadii=new THREE.Vector3(35.0,13.8,10.4);structure.userData.acSketchSilhouette=true;structure.userData.acContinuousPressureHull=true;structure.userData.acReferenceAuthority='USER_CANON_SHAPE';skin.add(structure);
  const kit=new THREE.Group();kit.name='AURELIAN_CANON_EXTERIOR_KIT';kit.position.y=cy;structure.add(kit);

  acHullMesh(kit,acAurelianRearHullGeometry(),m.dark,'AURELIAN_REAR_HULL_DEPTH',0,0,.18);
  acUserCanonShell(kit,m,specs);

  // Preserve the six physical bay apertures; keep framing narrow so the silhouette dominates.
  for(let i=0;i<specs.length;i++){
    const s=specs[i];
    // The concave left edge on the two starboard apertures cannot be extruded as
    // a polygon-with-hole without a visible bridge triangle. Their straight
    // architectural rails already provide the frame, so omit only those visual
    // rings. This does not touch the bay panels, interiors, or hit planes.
    if(i!==3&&i!==4){
      acHullMesh(kit,acHullRing(s.points,1.020,1.000,.075),m.goldDark,'AURELIAN_CANON_THIN_COLLAR_'+(i+1),s.x,s.y,7.42);
      acHullMesh(kit,acHullRing(s.points,1.010,1.002,.035),m.edge,'AURELIAN_CANON_COLLAR_LIP_'+(i+1),s.x,s.y,7.51);
    }
  }

  // Three stacked aft thrusters, positioned as one integrated engine bank.
  const exhaustRoot=new THREE.Group();exhaustRoot.name='AURELIAN_CANON_EXHAUST_CLUSTER';exhaustRoot.position.z=7.70;kit.add(exhaustRoot);
  for(const y of[-4.9,0,4.9]){
    const housing=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.26,1.58,5.4,32,1,true),m.dark,'AURELIAN_CANON_EXHAUST_HOUSING',-23.0,y,0);housing.rotation.z=Math.PI/2;
    const collar=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(1.48,1.48,.58,24),m.gold,'AURELIAN_CANON_EXHAUST_COLLAR',-20.4,y,.04);collar.rotation.z=Math.PI/2;
    const inner=acHullMesh(exhaustRoot,new THREE.CylinderGeometry(.82,1.02,1.55,20),m.bronze,'AURELIAN_CANON_EXHAUST_INNER',-25.2,y,.03);inner.rotation.z=Math.PI/2;
    const glow=acHullMesh(exhaustRoot,new THREE.CircleGeometry(.72,28),m.sun,'AURELIAN_CANON_EXHAUST_GLOW',-26.0,y,.03);glow.rotation.y=-Math.PI/2;
    for(const x of[-25.4,-23.1,-20.8]){const hoop=acHullDetail(exhaustRoot,new THREE.TorusGeometry(x===-25.4?1.24:1.42,.10,8,32),m.edge,'AURELIAN_EXHAUST_MACHINED_HOOP',x,y,.02);hoop.rotation.y=Math.PI/2;}
  }

  const panels=[];
  for(let i=0;i<specs.length;i++){
    const s=specs[i],panel=new THREE.Group();panel.name='AURELIAN_HULL_MODULE_'+(i+1)+'_'+s.name;panel.position.set(s.x,cy+s.y,4.78);panel.userData.acCutawayBayPanel=true;panel.userData.acCutawayBayIndex=i;panel.userData.acModuleRole=s.name;
    if(i===0)acHullCockpit(panel,s,m);else if(i===5)acHullCannon(panel,s,m);else acHullDoorArmor(panel,s,m,i+1);
    panel.traverse(o=>{o.userData.acCutawayBayIndex=i;o.userData.acCutawayBayPanelPart=true});skin.add(panel);panels.push(panel);
  }
  acHullPackDetails(skin);
  skin.userData.acSketchHull=true;skin.userData.acPrimaryHull=structure;skin.userData.acCutawayBayPanels=panels;skin.userData.acCutawayBayLayout=specs.map((s,i)=>({index:i,x:s.x,y:cy+s.y,z:4.78,w:s.w,h:s.h,points:s.points.map(p=>p.slice()),role:s.name}));
  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='USER_CANON_AURELIAN_REFERENCE';skin.userData.acCanonExteriorApplied=true;
  diag('AURELIAN CANON SHAPE','build=v0.45.5 profile=BROAD_STEPPED_CARRIER prow=JOINTED_POINT cockpit=RAISED_OVAL hub=OVERSIZED cannon=PRONOUNCED rear=ARMORED_EXHAUST_BANK panels=6 combat=UNCHANGED');
}`;

  const patched=replaceFunction(html,'function buildAurelianDirectorHull(skin,cy,mat){','function addUnifiedExteriorShell(skin,faction,side){',authority);
  if(patched===html)return html;
  return patched
    .replace(/MATCH RECORDER v0\.45\.[01234]/g,'MATCH RECORDER v0.45.5')
    .replace(/build=2026-09-(?:09_AURELIAN_CANON_(?:MAJOR_REBUILD|AUTHORITY_REBUILD|SHAPE_REBUILD)|11_AURELIAN_STEPPED_SIX_MODULE_CARRIER)/g,'build=2026-09-11_AURELIAN_CANON_PROPORTION_PASS')
    .replace('</head>','<meta id="ac-aurelian-canon-authority-v0455" name="ac-aurelian-canon-authority" content="authority:USER_CANON_SHAPE silhouette:BROAD_STEPPED_CARRIER prow:JOINTED_POINT cockpit:RAISED_OVAL hub:OVERSIZED cannon:PRONOUNCED rear:ARMORED_EXHAUST_BANK oldOval:REMOVED sixBays:PRESERVED combat:UNCHANGED">\n</head>');
}
