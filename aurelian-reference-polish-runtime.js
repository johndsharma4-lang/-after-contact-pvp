function replaceFunction(source,startToken,endToken,replacement){
  const start=source.indexOf(startToken);if(start<0)return source;
  const end=source.indexOf(endToken,start);if(end<0)return source;
  return source.slice(0,start)+replacement+'\n'+source.slice(end);
}

export function patchAurelianReferencePolishRuntime(html){
  if(typeof html!=='string')throw new TypeError('Expected game HTML');
  if(html.includes('ac-aurelian-reference-polish-v0429'))return html;
  if(!html.includes('ac-aurelian-canon-exterior-v0428'))return html;
  let patched=html;

  const materials=String.raw`function acHullMaterials(){
  const t=acHullFinishResources();
  const metal=(color,roughness=.28,metalness=.94)=>new THREE.MeshStandardMaterial({color,metalness,roughness,map:t.map,roughnessMap:t.roughness,envMap:t.env,envMapIntensity:.95});
  return {gold:metal(0xc49843,.23),goldDark:metal(0x68451d,.31),edge:metal(0xf0c875,.19),bronze:metal(0x4a311c,.33),dark:metal(0x0c1118,.39,.76),ivory:metal(0xd8c9a6,.28,.72),sun:new THREE.MeshStandardMaterial({color:0xffc94f,emissive:0xff9d17,emissiveIntensity:2.15,metalness:.52,roughness:.18,envMap:t.env}),hot:new THREE.MeshBasicMaterial({color:0xffedbd}),blue:new THREE.MeshBasicMaterial({color:0x66d2f1}),glass:new THREE.MeshPhysicalMaterial({color:0x557783,metalness:.13,roughness:.09,clearcoat:1,clearcoatRoughness:.08,envMap:t.env,envMapIntensity:.9,transparent:true,opacity:.30,depthWrite:false,side:THREE.DoubleSide}),trimLine:new THREE.LineBasicMaterial({color:0xe3c98c}),glassLine:new THREE.LineBasicMaterial({color:0xd2eef1,transparent:true,opacity:.48}),seamLine:new THREE.LineBasicMaterial({color:0x21170e})};
}`;
  const afterMaterials=replaceFunction(patched,'function acHullMaterials(){','function acHullDetail(',materials);
  if(afterMaterials===patched)return html;patched=afterMaterials;

  const doorArmor=String.raw`function acHullDoorArmor(panel,s,m,index){
  const profile=s.points,w=s.w,h=s.h,inner=profile.map(([x,y])=>[x*.90,y*.79]);
  acHullMesh(panel,acHullExtrude(acHullShape(profile),.42,.11),[m.bronze,m.goldDark],'AURELIAN_HULL_ARMOR_'+index,0,0,2.08);
  acHullMesh(panel,acHullExtrude(acHullShape(inner),.20,.15),m.dark,'AURELIAN_HULL_RECESSED_FIELD_'+index,0,0,2.48);
  const upper=[[-w*.38,h*.09],[w*.12,h*.13],[w*.35,h*.31],[-w*.27,h*.32]];
  const lower=[[-w*.34,-h*.31],[w*.28,-h*.28],[w*.38,-h*.08],[-w*.12,-h*.13]];
  const center=[[-w*.30,-h*.06],[w*.24,-h*.09],[w*.32,h*.08],[-w*.22,h*.12]];
  acHullMesh(panel,acHullExtrude(acHullShape(upper),.22,.10),[index%2?m.ivory:m.gold,m.edge],'AURELIAN_HULL_UPPER_SWEEP_'+index,0,0,2.70);
  acHullMesh(panel,acHullExtrude(acHullShape(lower),.24,.10),[m.goldDark,m.gold],'AURELIAN_HULL_LOWER_SWEEP_'+index,0,0,2.72);
  acHullMesh(panel,acHullExtrude(acHullShape(center),.26,.11),[m.gold,m.edge],'AURELIAN_HULL_CENTER_SPINE_'+index,0,0,2.86);
  for(const sx of[-1,1]){
    const cheek=[[sx*w*.34,-h*.21],[sx*w*.40,-h*.10],[sx*w*.38,h*.24],[sx*w*.31,h*.18]];
    acHullMesh(panel,acHullExtrude(acHullShape(cheek),.18,.07),sx<0?m.bronze:m.ivory,'AURELIAN_HULL_SIDE_CHEEK_'+index+'_'+sx,0,0,2.78);
  }
  for(const sy of[-1,1]){
    const vy=sy*h*.20;
    acHullDetail(panel,new THREE.BoxGeometry(w*.34,.055,.055),sy<0?m.bronze:m.hot,'AURELIAN_DOOR_EDGE_LIGHT',-w*.03,vy,3.02);
    for(let j=0;j<5;j++){const vent=acHullDetail(panel,new THREE.BoxGeometry(.07,h*.085,.10),m.dark,'AURELIAN_DOOR_HEAT_VENT',w*.17+j*.13,vy,3.00);vent.rotation.z=-.20;}
  }
  for(const sx of[-1,1])for(const sy of[-1,1])acHullDetail(panel,new THREE.CylinderGeometry(.075,.075,.055,8),m.edge,'AURELIAN_DOOR_FASTENER',sx*w*.29,sy*h*.22,3.01).rotation.x=Math.PI/2;
}`;
  const afterDoor=replaceFunction(patched,'function acHullDoorArmor(panel,s,m,index){','function acHullMesh(',doorArmor);
  if(afterDoor===patched)return html;patched=afterDoor;

  const accentFunction=String.raw`function acHullReferenceAccents(kit,m){
  const plates=[
    {n:'AURELIAN_REFERENCE_DORSAL_IVORY',mat:m.ivory,z:7.92,d:.22,p:[[-7.2,10.42],[-1.3,10.92],[5.2,10.05],[8.7,8.85],[4.9,8.98],[-1.4,9.72]]},
    {n:'AURELIAN_REFERENCE_PROW_IVORY',mat:m.ivory,z:7.76,d:.24,p:[[15.1,5.75],[18.7,4.50],[22.4,2.18],[19.2,2.25],[15.6,3.55]]},
    {n:'AURELIAN_REFERENCE_PROW_GOLD_BROW',mat:m.edge,z:8.00,d:.15,p:[[16.4,4.90],[19.3,3.92],[21.5,2.62],[19.0,2.78],[16.2,3.70]]},
    {n:'AURELIAN_REFERENCE_VENTRAL_IVORY',mat:m.ivory,z:7.72,d:.22,p:[[7.2,-9.05],[12.3,-8.72],[15.1,-7.15],[12.4,-7.45],[7.7,-7.82]]},
    {n:'AURELIAN_REFERENCE_AFT_IVORY',mat:m.ivory,z:7.55,d:.20,p:[[-19.4,6.20],[-16.0,7.62],[-13.8,7.80],[-15.7,6.72],[-18.7,5.55]]}
  ];
  for(const a of plates)acHullMesh(kit,acHullExtrude(acHullShape(a.p),a.d,.08),[a.mat,m.edge],a.n,0,0,a.z);
  for(const [x,y,len,rz] of [[-18.3,8.20,4.0,-.22],[-18.8,-7.10,3.7,.20],[16.5,6.45,3.7,.27],[16.6,-6.25,3.9,-.24]]){const rib=acHullDetail(kit,new THREE.BoxGeometry(len,.18,.22),m.goldDark,'AURELIAN_REFERENCE_HULL_RIB',x,y,7.96);rib.rotation.z=rz;}
}`;
  if(!patched.includes('function acHullReferenceAccents(kit,m){')){
    patched=patched.replace('function acHullMachinery(kit,m){',accentFunction+'\nfunction acHullMachinery(kit,m){');
  }
  if(!patched.includes('  acHullMachinery(kit,m);\n  acHullReferenceAccents(kit,m);')){
    patched=patched.replace('  acHullMachinery(kit,m);','  acHullMachinery(kit,m);\n  acHullReferenceAccents(kit,m);');
  }
  if(!patched.includes('function acHullReferenceAccents(kit,m){')||!patched.includes('acHullReferenceAccents(kit,m);'))return html;

  patched=patched.replace(/MATCH RECORDER v0\.42\.8/g,'MATCH RECORDER v0.42.9');
  patched=patched.replace(/build=2026-09-07_AURELIAN_REFERENCE_METALWORK/g,'build=2026-09-07_AURELIAN_REFERENCE_SCULPT_PASS');
  patched=patched.replace(/build=v0\.42\.8 panels=6 apertures=6/g,'build=v0.42.9 panels=6 apertures=6');
  return patched.replace('</head>','<meta id="ac-aurelian-reference-polish-v0429" name="ac-aurelian-reference-polish" content="sourceLevel:Y doorSculpt:3_LAYER ivoryAccents:5 exhausts:PRESERVED apertures:UNCHANGED combat:UNCHANGED">\n</head>');
}
