export function patchAurelianRebuiltModelsRuntime(html) {
  if (html.includes('ac-aurelian-rebuilt-models-v0362')) return html;

  const helpers = String.raw`
function acAurelianMat(color, metalness=.55, roughness=.32, emissive=0x000000, emissiveIntensity=0){
  return new THREE.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity});
}
function acAurelianMesh(geo,mat,name){const m=new THREE.Mesh(geo,mat);m.name=name||'';m.castShadow=true;m.receiveShadow=true;return m}
function acAurelianGroup(name){const g=new THREE.Group();g.name=name||'';return g}
function acAurelianGlow(r,color=0xffb000,name='glow'){
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.96}));m.name=name;return m
}
function acAddHalo(head, gold, sun, scale=1){
  const halo=acAurelianMesh(new THREE.TorusGeometry(.50*scale,.065*scale,8,36),sun,'halo');halo.position.set(0,.02,-.34);head.add(halo);
  for(let i=0;i<12;i++){const a=i*Math.PI/6,ray=acAurelianMesh(new THREE.ConeGeometry(.055*scale,.30*scale,4),gold,'haloRay'+i);ray.position.set(Math.cos(a)*.66*scale,Math.sin(a)*.66*scale,-.34);ray.rotation.z=a-Math.PI/2;head.add(ray)}
  return halo
}
function acAddBirdHelmet(head, mats, scale=1){
  const {black2,white,gold,hot}=mats;
  const crown=acAurelianMesh(new THREE.CylinderGeometry(.29*scale,.36*scale,.58*scale,6),black2,'helmetCore');crown.rotation.y=Math.PI/6;head.add(crown);
  const browL=acAurelianMesh(new THREE.BoxGeometry(.22*scale,.10*scale,.32*scale),gold,'browL');browL.position.set(-.12*scale,.09*scale,.30*scale);browL.rotation.z=.18;head.add(browL);
  const browR=browL.clone();browR.name='browR';browR.position.x=.12*scale;browR.rotation.z=-.18;head.add(browR);
  const face=acAurelianMesh(new THREE.ConeGeometry(.34*scale,.66*scale,4),white,'birdMask');face.position.set(0,-.04*scale,.30*scale);face.rotation.x=Math.PI/2;face.rotation.z=Math.PI/4;face.scale.set(.88,.68,1);head.add(face);
  const beak=acAurelianMesh(new THREE.ConeGeometry(.11*scale,.50*scale,4),gold,'beak');beak.position.set(0,-.13*scale,.61*scale);beak.rotation.x=Math.PI/2;head.add(beak);
  const visor=acAurelianMesh(new THREE.BoxGeometry(.43*scale,.075*scale,.09*scale),hot,'visor');visor.position.set(0,.045*scale,.48*scale);head.add(visor);
  return {crown,face,beak,visor}
}
function acAddCoreTorso(torso,mats,kind='solar'){
  const {black,black2,white,gold,sun}=mats;
  const waist=acAurelianMesh(new THREE.CylinderGeometry(.32,.40,.64,8),black,'waist');waist.position.y=.28;torso.add(waist);
  const chest=acAurelianMesh(new THREE.CylinderGeometry(.43,.57,.98,8),black2,'chestCore');chest.position.y=.96;chest.scale.z=.78;torso.add(chest);
  const sternum=acAurelianMesh(new THREE.ConeGeometry(.56,.72,4),white,'breastplate');sternum.position.set(0,1.08,.43);sternum.rotation.x=Math.PI/2;sternum.rotation.z=Math.PI/4;sternum.scale.set(1,.62,.78);torso.add(sternum);
  for(const sx of[-1,1]){const side=acAurelianMesh(new THREE.BoxGeometry(.15,.72,.18),gold,'flankPlate'+sx);side.position.set(sx*.45,.94,.32);side.rotation.z=sx*.18;torso.add(side)}
  const core=acAurelianGlow(.21,0xffb000,kind==='disk'?'diskCore':'solarCore');core.scale.set(1,.78,.48);core.position.set(0,1.08,.67);torso.add(core);
  const ring=acAurelianMesh(new THREE.TorusGeometry(.29,.045,8,28),gold,'coreRing');ring.position.copy(core.position);torso.add(ring);
  return {waist,chest,sternum,core,ring}
}
function acAddArmAssembly(shoulders,mats,sx,style='standard'){
  const {black,black2,white,gold,sun}=mats,q=sx<0?'L':'R';
  const sh=acAurelianGroup('shoulder'+q);sh.position.set(sx*.70,0,0);shoulders.add(sh);
  const pad=acAurelianMesh(new THREE.ConeGeometry(style==='heavy'?.39:.34,style==='heavy'?.68:.60,5),white,'pauldron'+q);pad.scale.z=.78;pad.rotation.z=sx*.74;pad.rotation.y=Math.PI/5;sh.add(pad);
  const trim=acAurelianMesh(new THREE.ConeGeometry(style==='heavy'?.27:.23,style==='heavy'?.60:.52,5),gold,'pauldronGold'+q);trim.position.z=.07;trim.scale.z=.71;trim.rotation.z=sx*.74;trim.rotation.y=Math.PI/5;sh.add(trim);
  const upper=acAurelianGroup('upperArm'+q);upper.position.set(sx*.17,-.27,0);sh.add(upper);
  const bicep=acAurelianMesh(new THREE.CylinderGeometry(.13,.17,.66,8),black,'bicep'+q);bicep.position.y=-.31;upper.add(bicep);
  const plate=acAurelianMesh(new THREE.BoxGeometry(.27,.46,.23),white,'armPlate'+q);plate.position.set(0,-.30,.17);upper.add(plate);
  const elbow=acAurelianGroup('elbow'+q);elbow.position.y=-.66;upper.add(elbow);
  const fore=acAurelianMesh(new THREE.CylinderGeometry(.14,.18,.62,8),black2,'forearm'+q);fore.position.y=-.29;elbow.add(fore);
  const forePlate=acAurelianMesh(new THREE.BoxGeometry(.26,.42,.22),gold,'forearmPlate'+q);forePlate.position.set(0,-.27,.17);elbow.add(forePlate);
  const hand=acAurelianGroup('hand'+q);hand.position.set(0,-.63,.12);elbow.add(hand);hand.add(acAurelianMesh(new THREE.BoxGeometry(.24,.26,.30),black,'handMesh'+q));
  return {sh,upper,elbow,hand}
}
function acAddLegAssembly(pelvis,mats,sx){
  const {black,black2,white,gold,sun}=mats,q=sx<0?'L':'R';
  const hip=acAurelianGroup('hip'+q);hip.position.set(sx*.25,-.12,0);pelvis.add(hip);
  const thigh=acAurelianMesh(new THREE.CylinderGeometry(.17,.22,.84,8),black,'thigh'+q);thigh.position.y=-.40;hip.add(thigh);
  const thighPlate=acAurelianMesh(new THREE.BoxGeometry(.34,.54,.25),white,'thighPlate'+q);thighPlate.position.set(0,-.31,.18);hip.add(thighPlate);
  const knee=acAurelianGroup('knee'+q);knee.position.y=-.80;hip.add(knee);
  const kneeCore=acAurelianGlow(.11,0xff9a00,'kneeCore'+q);kneeCore.position.z=.20;knee.add(kneeCore);
  const shin=acAurelianMesh(new THREE.CylinderGeometry(.14,.18,.72,8),black2,'shin'+q);shin.position.y=-.35;knee.add(shin);
  const shinPlate=acAurelianMesh(new THREE.ConeGeometry(.19,.62,4),white,'shinPlate'+q);shinPlate.position.set(0,-.34,.18);shinPlate.rotation.x=Math.PI/2;shinPlate.rotation.z=Math.PI/4;knee.add(shinPlate);
  const boot=acAurelianMesh(new THREE.BoxGeometry(.31,.26,.54),gold,'boot'+q);boot.position.set(0,-.74,.17);knee.add(boot);
  return {hip,knee}
}
function acAddCloth(pelvis,mats,wide=1){
  const root=acAurelianGroup('clothRoot');root.position.set(0,.15,-.10);pelvis.add(root);
  for(const sx of[-1,0,1]){const w=(sx===0?.50:.42)*wide,h=(sx===0?1.55:1.34),p=acAurelianMesh(new THREE.PlaneGeometry(w,h,1,2),mats.cloth,'clothPanel'+sx);p.position.set(sx*.40,-.72,-.40);p.rotation.z=sx*.11;root.add(p);const trim=acAurelianMesh(new THREE.BoxGeometry(w*.96,.055,.025),mats.gold,'clothTrim'+sx);trim.position.set(sx*.40,-1.43,-.39);trim.rotation.z=sx*.11;root.add(trim)}
  return root
}
function acBaseAurelian(name,kind='solar',heavy=false){
  const root=acAurelianGroup(name);const mats={
    black:acAurelianMat(0x0b0c10,.32,.50),black2:acAurelianMat(0x1a1c22,.50,.34),white:acAurelianMat(0xe9e1d2,.42,.28),gold:acAurelianMat(0xb16d12,.82,.20),sun:acAurelianMat(0xffa81b,.45,.14,0xff6a00,2.3),hot:acAurelianMat(0xffef9b,.24,.10,0xffb000,3.2),cloth:new THREE.MeshStandardMaterial({color:0xd8c8a8,metalness:.08,roughness:.80,side:THREE.DoubleSide})
  };
  const pelvis=acAurelianGroup('pelvis');root.add(pelvis);pelvis.add(acAurelianMesh(new THREE.CylinderGeometry(.40,.51,.46,8),mats.black2,'pelvisCore'));
  for(const sx of[-1,1]){const hp=acAurelianMesh(new THREE.BoxGeometry(.34,.40,.31),mats.white,'hipPlate'+sx);hp.position.set(sx*.37,0,.09);pelvis.add(hp);const edge=acAurelianMesh(new THREE.BoxGeometry(.07,.43,.34),mats.gold,'hipGold'+sx);edge.position.set(sx*.52,0,.09);pelvis.add(edge)}
  const torso=acAurelianGroup('torso');torso.position.y=.54;pelvis.add(torso);acAddCoreTorso(torso,mats,kind);
  const head=acAurelianGroup('head');head.position.y=1.94;torso.add(head);acAddBirdHelmet(head,mats,1.0);acAddHalo(head,mats.gold,mats.sun,1.0);
  const shoulders=acAurelianGroup('shoulders');shoulders.position.y=1.42;torso.add(shoulders);const l=acAddArmAssembly(shoulders,mats,-1,heavy?'heavy':'standard'),r=acAddArmAssembly(shoulders,mats,1,heavy?'heavy':'standard');
  const ll=acAddLegAssembly(pelvis,mats,-1),rl=acAddLegAssembly(pelvis,mats,1),clothRoot=acAddCloth(pelvis,mats,heavy?1.10:1.0);
  return {root,mats,pelvis,torso,head,shoulders,l,r,ll,rl,clothRoot}
}
function acBuildSolarLancerRebuilt(){
  const b=acBaseAurelian('SOLAR_LANCER_3D_RIG','solar',false),{root,mats,torso,l,r,ll,rl}=b;
  l.upper.rotation.z=.26;r.upper.rotation.z=-.38;l.elbow.rotation.z=-.20;r.elbow.rotation.z=.26;
  const weapon=acAurelianGroup('WEAPON_MUZZLE_RIG');weapon.position.set(.63,.76,.40);weapon.rotation.z=-1.02;torso.add(weapon);
  const shaft=acAurelianMesh(new THREE.CylinderGeometry(.070,.090,3.18,10),mats.black2,'lanceShaft');weapon.add(shaft);
  const rail=acAurelianMesh(new THREE.BoxGeometry(.15,2.65,.15),mats.gold,'lanceSpine');rail.position.y=.30;weapon.add(rail);
  for(const y of[-.70,.05,.82,1.48]){const ring=acAurelianMesh(new THREE.TorusGeometry(.18,.040,8,22),mats.sun,'lanceRing'+y);ring.rotation.x=Math.PI/2;ring.position.y=y;weapon.add(ring)}
  const guard=acAurelianMesh(new THREE.TorusGeometry(.38,.060,8,30,Math.PI*1.50),mats.sun,'lanceGuard');guard.position.y=.48;guard.rotation.z=.74;weapon.add(guard);
  const bladeBase=acAurelianMesh(new THREE.ConeGeometry(.28,.78,6),mats.white,'lanceBladeBase');bladeBase.position.y=1.86;weapon.add(bladeBase);
  const tip=acAurelianMesh(new THREE.ConeGeometry(.22,1.28,6),mats.sun,'lanceTip');tip.position.y=2.82;weapon.add(tip);
  const glow=acAurelianGlow(.23,0xffffb0,'lanceGlow');glow.position.y=3.48;weapon.add(glow);weapon.userData.muzzle=glow;root.userData.muzzle=glow;
  const wingL=acAurelianMesh(new THREE.ConeGeometry(.12,.72,4),mats.gold,'lanceWingL');wingL.position.set(-.24,1.80,0);wingL.rotation.z=.48;weapon.add(wingL);const wingR=wingL.clone();wingR.name='lanceWingR';wingR.position.x=.24;wingR.rotation.z=-.48;weapon.add(wingR);
  root.userData.rig={pelvis:b.pelvis,torso,headRoot:b.head,head:b.head,shoulders:b.shoulders,armRoots:[l.upper,r.upper],legRoots:[ll.hip,rl.hip],armL:l.upper,armR:r.upper,elbowL:l.elbow,elbowR:r.elbow,hipL:ll.hip,hipR:rl.hip,kneeL:ll.knee,kneeR:rl.knee,weapon,lanceTip:tip,lanceGlow:glow,clothRoot:b.clothRoot};root.userData.modelFidelity='AURELIAN_REBUILT_CANON';root.userData.animationState='idle';return root
}
function acBuildSunDiskGunnerRebuilt(){
  const b=acBaseAurelian('SUN_DISK_GUNNER_3D_RIG','disk',true),{root,mats,l,r,ll,rl}=b;
  l.upper.rotation.z=.18;r.upper.rotation.z=-.18;l.elbow.rotation.z=-.10;r.elbow.rotation.z=.10;
  function gauntlet(arm,sx){
    const q=sx<0?'L':'R',g=acAurelianGroup((sx>0?'RIGHT':'LEFT')+'_DISK_GAUNTLET');g.position.set(0,-.08,.26);arm.hand.add(g);
    const cuff=acAurelianMesh(new THREE.CylinderGeometry(.24,.30,.46,10),mats.gold,'gauntletArmor'+q);cuff.rotation.x=Math.PI/2;g.add(cuff);
    const barrel=acAurelianMesh(new THREE.CylinderGeometry(.18,.22,.38,10),mats.black2,'diskBarrel'+q);barrel.rotation.x=Math.PI/2;barrel.position.z=.30;g.add(barrel);
    const outer=acAurelianMesh(new THREE.TorusGeometry(.57,.085,10,42),mats.sun,'solarDisk'+q);outer.position.z=.48;outer.rotation.x=Math.PI/2;g.add(outer);
    const mid=acAurelianMesh(new THREE.TorusGeometry(.41,.050,8,34),mats.gold,'solarDiskMid'+q);mid.position.z=.49;mid.rotation.x=Math.PI/2;g.add(mid);
    const inner=acAurelianMesh(new THREE.TorusGeometry(.27,.038,8,30),mats.white,'solarDiskInner'+q);inner.position.z=.50;inner.rotation.x=Math.PI/2;g.add(inner);
    for(let i=0;i<12;i++){const a=i*Math.PI/6,tooth=acAurelianMesh(new THREE.ConeGeometry(.065,.28,3),mats.gold,'diskTooth'+q+i);tooth.position.set(Math.cos(a)*.70,Math.sin(a)*.70,.50);tooth.rotation.z=a-Math.PI/2;g.add(tooth)}
    const emitter=acAurelianGlow(.18,0xffffb0,'diskEmitter'+q);emitter.position.z=.66;g.add(emitter);return {g,emitter}
  }
  const L=gauntlet(l,-1),R=gauntlet(r,1);root.userData.muzzle=R.emitter;root.userData.secondaryMuzzle=L.emitter;
  root.userData.rig={pelvis:b.pelvis,torso:b.torso,headRoot:b.head,head:b.head,shoulders:b.shoulders,armRoots:[l.upper,r.upper],legRoots:[ll.hip,rl.hip],armL:l.upper,armR:r.upper,elbowL:l.elbow,elbowR:r.elbow,hipL:ll.hip,hipR:rl.hip,kneeL:ll.knee,kneeR:rl.knee,weapon:R.g,gauntlet:R.g,secondaryWeapon:L.g,secondaryGauntlet:L.g,rightMuzzle:R.emitter,leftMuzzle:L.emitter,clothRoot:b.clothRoot};root.userData.dualGauntletReady=true;root.userData.modelFidelity='AURELIAN_REBUILT_CANON';root.userData.animationState='idle';return root
}
function acBuildSunadierRebuilt(){
  const b=acBaseAurelian('SUNADIER_3D_RIG','solar',true),{root,mats,torso,l,r,ll,rl}=b;
  l.upper.rotation.z=.34;r.upper.rotation.z=-.52;l.elbow.rotation.z=-.28;r.elbow.rotation.z=.42;
  const rack=acAurelianGroup('grenadeRack');rack.position.set(-.55,.96,-.36);torso.add(rack);rack.add(acAurelianMesh(new THREE.BoxGeometry(.90,.60,.20),mats.black,'grenadeRackFrame'));for(let i=0;i<3;i++){const cell=acAurelianGlow(.15,0xff9d00,'solarCell'+i);cell.position.set((i-1)*.28,0,.16);rack.add(cell)}
  const chain=acAurelianGroup('sunChain');chain.position.set(.02,-.02,.06);r.hand.add(chain);
  for(let i=0;i<18;i++){const link=acAurelianMesh(new THREE.TorusGeometry(.10,.030,6,12),i%3?mats.gold:mats.sun,'chainLink'+i);link.position.set(.13*i,.050*i,.020*i);link.rotation.y=i*.42;link.rotation.z=i*.18;chain.add(link)}
  const grenade=acAurelianGroup('solarGrenade');grenade.position.set(2.46,.92,.38);chain.add(grenade);
  const shell=acAurelianMesh(new THREE.SphereGeometry(.42,16,12),mats.black2,'solarGrenadeShell');grenade.add(shell);
  for(const axis of[0,Math.PI/2]){const band=acAurelianMesh(new THREE.TorusGeometry(.34,.055,8,28),mats.gold,'grenadeBand'+axis);band.rotation.x=Math.PI/2;band.rotation.z=axis;grenade.add(band)}
  const grenadeCore=acAurelianGlow(.20,0xffff9a,'grenadeCore');grenadeCore.position.z=.38;grenade.add(grenadeCore);
  for(let i=0;i<8;i++){const a=i*Math.PI/4,ray=acAurelianMesh(new THREE.ConeGeometry(.060,.28,4),mats.sun,'grenadeRay'+i);ray.position.set(Math.cos(a)*.48,Math.sin(a)*.48,0);ray.rotation.z=a-Math.PI/2;grenade.add(ray)}
  root.userData.muzzle=grenade;root.userData.rig={pelvis:b.pelvis,torso,headRoot:b.head,head:b.head,shoulders:b.shoulders,armRoots:[l.upper,r.upper],legRoots:[ll.hip,rl.hip],armL:l.upper,armR:r.upper,elbowL:l.elbow,elbowR:r.elbow,hipL:ll.hip,hipR:rl.hip,kneeL:ll.knee,kneeR:rl.knee,weapon:chain,chain,grenade,grenadeCore,clothRoot:b.clothRoot};root.userData.modelFidelity='AURELIAN_REBUILT_CANON';root.userData.animationState='idle';return root
}
`;

  const dispatcher = "function buildAurelianWarrior3DModel(type){if(type==='solar_lancer')return acBuildSolarLancerRebuilt();if(type==='sun_disk_gunner')return acBuildSunDiskGunnerRebuilt();if(type==='sunadier')return acBuildSunadierRebuilt();return buildStarter3DModel(type)}";
  const current = /function buildAurelianWarrior3DModel\(type\)\{[^\n]*\}/;
  let patched = html;
  const m = patched.match(current);
  if (m) patched = patched.replace(m[0], helpers + '\n' + dispatcher);
  else patched = patched.replace('</body>', '<script>'+helpers+'\n'+dispatcher+'<\/script>\n</body>');
  patched = patched.replace(/MATCH RECORDER v0\.3[56]\.[0-9]+/g,'MATCH RECORDER v0.36.2');
  patched = patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_AURELIAN_FULL_MODEL_REBUILD');
  return patched.replace('</head>','<meta id="ac-aurelian-rebuilt-models-v0362" name="ac-aurelian-rebuilt-models" content="VISUAL_BODIES_REPLACED_GAMEPLAY_HOOKS_PRESERVED">\n</head>');
}
