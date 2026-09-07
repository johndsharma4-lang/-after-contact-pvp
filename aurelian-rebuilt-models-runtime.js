export function patchAurelianRebuiltModelsRuntime(html) {
  if (html.includes('ac-aurelian-rebuilt-models-v0419')) return html;

  const helpers = String.raw`
function acAurelianMat(color, metalness=.55, roughness=.32, emissive=0x000000, emissiveIntensity=0){
  return new THREE.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity,flatShading:false});
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
  for(const sx of[-1,1]){const eye=acAurelianGlow(.055*scale,0xffffd2,'eyeLens'+sx);eye.scale.set(1.2,.52,.42);eye.position.set(sx*.13*scale,.055*scale,.545*scale);head.add(eye)}
  const jawL=acAurelianMesh(new THREE.BoxGeometry(.08*scale,.28*scale,.12*scale),gold,'jawGuardL');jawL.position.set(-.25*scale,-.19*scale,.31*scale);jawL.rotation.z=-.22;head.add(jawL);const jawR=jawL.clone();jawR.name='jawGuardR';jawR.position.x=.25*scale;jawR.rotation.z=.22;head.add(jawR);
  const crownBlade=acAurelianMesh(new THREE.ConeGeometry(.12*scale,.72*scale,5),hot,'helmetSolarCrest');crownBlade.position.set(0,.58*scale,-.02);head.add(crownBlade);
  for(const sx of[-1,1]){const temple=acAurelianMesh(new THREE.ConeGeometry(.10*scale,.52*scale,4),gold,'helmetTempleWing'+sx);temple.position.set(sx*.38*scale,.05*scale,.02);temple.rotation.z=-sx*1.12;head.add(temple);const cheek=acAurelianMesh(new THREE.ConeGeometry(.075*scale,.34*scale,4),white,'helmetCheekBlade'+sx);cheek.position.set(sx*.28*scale,-.27*scale,.22);cheek.rotation.z=sx*.42;head.add(cheek)}
  return {crown,face,beak,visor}
}
function acAddCoreTorso(torso,mats,kind='solar'){
  const {black,black2,white,gold,sun}=mats;
  const waist=acAurelianMesh(new THREE.CylinderGeometry(.32,.40,.64,8),black,'waist');waist.position.y=.28;torso.add(waist);
  const chest=acAurelianMesh(new THREE.CylinderGeometry(.43,.57,.98,8),black2,'chestCore');chest.position.y=.96;chest.scale.z=.78;torso.add(chest);
  const sternum=acAurelianMesh(new THREE.ConeGeometry(.56,.72,4),white,'breastplate');sternum.position.set(0,1.08,.43);sternum.rotation.x=Math.PI/2;sternum.rotation.z=Math.PI/4;sternum.scale.set(1,.62,.78);torso.add(sternum);
  const curvedChest=acAurelianMesh(new THREE.SphereGeometry(.62,20,14),white,'curvedBreastplate');curvedChest.scale.set(.90,.96,.25);curvedChest.position.set(0,1.03,.30);torso.add(curvedChest);
  for(const sx of[-1,1]){const side=acAurelianMesh(new THREE.BoxGeometry(.15,.72,.18),gold,'flankPlate'+sx);side.position.set(sx*.45,.94,.32);side.rotation.z=sx*.18;torso.add(side)}
  const core=acAurelianGlow(.21,0xffb000,kind==='disk'?'diskCore':'solarCore');core.scale.set(1,.78,.48);core.position.set(0,1.08,.67);torso.add(core);
  const ring=acAurelianMesh(new THREE.TorusGeometry(.29,.045,8,28),gold,'coreRing');ring.position.copy(core.position);torso.add(ring);
  const collar=acAurelianMesh(new THREE.TorusGeometry(.38,.065,10,32,Math.PI*1.55),gold,'solarCollar');collar.position.set(0,1.48,.03);collar.rotation.x=Math.PI/2;collar.rotation.z=-Math.PI*.27;torso.add(collar);
  for(const sx of[-1,1]){const rib=acAurelianMesh(new THREE.BoxGeometry(.08,.60,.08),gold,'chestFiligree'+sx);rib.position.set(sx*.24,1.03,.70);rib.rotation.z=-sx*.32;torso.add(rib)}
  for(let i=0;i<8;i++){const a=i*Math.PI/4,ray=acAurelianMesh(new THREE.ConeGeometry(.035,.22,4),sun,'chestSunRay'+i);ray.position.set(Math.cos(a)*.36,1.08+Math.sin(a)*.31,.72);ray.rotation.z=a-Math.PI/2;torso.add(ray)}
  for(let i=0;i<3;i++){const ab=acAurelianMesh(new THREE.BoxGeometry(.48-i*.055,.15,.24),i===1?white:gold,'abdomenPlate'+i);ab.position.set(0,.72-i*.18,.34);ab.rotation.x=-.08;torso.add(ab)}
  const belt=acAurelianMesh(new THREE.TorusGeometry(.38,.055,8,26),gold,'solarBelt');belt.rotation.x=Math.PI/2;belt.position.set(0,.48,.02);torso.add(belt);
  return {waist,chest,sternum,core,ring}
}
function acAddArmAssembly(shoulders,mats,sx,style='standard'){
  const {black,black2,white,gold,sun}=mats,q=sx<0?'L':'R';
  const sh=acAurelianGroup('shoulder'+q);sh.position.set(sx*.70,0,0);shoulders.add(sh);
  const pad=acAurelianMesh(new THREE.ConeGeometry(style==='heavy'?.39:.34,style==='heavy'?.68:.60,5),white,'pauldron'+q);pad.scale.z=.78;pad.rotation.z=sx*.74;pad.rotation.y=Math.PI/5;sh.add(pad);
  const trim=acAurelianMesh(new THREE.ConeGeometry(style==='heavy'?.27:.23,style==='heavy'?.60:.52,5),gold,'pauldronGold'+q);trim.position.z=.07;trim.scale.z=.71;trim.rotation.z=sx*.74;trim.rotation.y=Math.PI/5;sh.add(trim);
  const upper=acAurelianGroup('upperArm'+q);upper.position.set(sx*.17,-.27,0);sh.add(upper);
  const bicep=acAurelianMesh(new THREE.CylinderGeometry(.13,.17,.66,12),black,'bicep'+q);bicep.position.y=-.31;upper.add(bicep);
  const plate=acAurelianMesh(new THREE.BoxGeometry(.27,.46,.23),white,'armPlate'+q);plate.position.set(0,-.30,.17);upper.add(plate);
  const elbow=acAurelianGroup('elbow'+q);elbow.position.y=-.66;upper.add(elbow);
  const fore=acAurelianMesh(new THREE.CylinderGeometry(.14,.18,.62,12),black2,'forearm'+q);fore.position.y=-.29;elbow.add(fore);
  const forePlate=acAurelianMesh(new THREE.BoxGeometry(.26,.42,.22),gold,'forearmPlate'+q);forePlate.position.set(0,-.27,.17);elbow.add(forePlate);
  const elbowCore=acAurelianGlow(.085,0xffb535,'elbowCore'+q);elbowCore.position.set(0,.01,.19);elbow.add(elbowCore);const wrist=acAurelianMesh(new THREE.TorusGeometry(.18,.045,8,20),sun,'wristSeal'+q);wrist.rotation.x=Math.PI/2;wrist.position.set(0,-.56,.09);elbow.add(wrist);const hand=acAurelianGroup('hand'+q);hand.position.set(0,-.63,.12);elbow.add(hand);hand.add(acAurelianMesh(new THREE.BoxGeometry(.24,.26,.30),black,'handMesh'+q));
  for(const side of[-1,1]){const blade=acAurelianMesh(new THREE.ConeGeometry(.055,.36,4),side>0?gold:white,'forearmBlade'+q+side);blade.position.set(side*.18,-.26,.07);blade.rotation.z=-side*.25;elbow.add(blade)}
  return {sh,upper,elbow,hand}
}
function acAddLegAssembly(pelvis,mats,sx){
  const {black,black2,white,gold,sun}=mats,q=sx<0?'L':'R';
  const hip=acAurelianGroup('hip'+q);hip.position.set(sx*.25,-.12,0);pelvis.add(hip);
  const thigh=acAurelianMesh(new THREE.CylinderGeometry(.17,.22,.84,12),black,'thigh'+q);thigh.position.y=-.40;hip.add(thigh);
  const thighPlate=acAurelianMesh(new THREE.BoxGeometry(.34,.54,.25),white,'thighPlate'+q);thighPlate.position.set(0,-.31,.18);hip.add(thighPlate);
  const knee=acAurelianGroup('knee'+q);knee.position.y=-.80;hip.add(knee);
  const kneeCore=acAurelianGlow(.11,0xff9a00,'kneeCore'+q);kneeCore.position.z=.20;knee.add(kneeCore);
  const shin=acAurelianMesh(new THREE.CylinderGeometry(.14,.18,.72,12),black2,'shin'+q);shin.position.y=-.35;knee.add(shin);
  const shinPlate=acAurelianMesh(new THREE.ConeGeometry(.19,.62,4),white,'shinPlate'+q);shinPlate.position.set(0,-.34,.18);shinPlate.rotation.x=Math.PI/2;shinPlate.rotation.z=Math.PI/4;knee.add(shinPlate);
  const calfBlade=acAurelianMesh(new THREE.ConeGeometry(.10,.58,4),gold,'calfBlade'+q);calfBlade.position.set(-sx*.18,-.37,-.02);calfBlade.rotation.z=sx*.18;knee.add(calfBlade);const ankleCore=acAurelianGlow(.08,0xffa51f,'ankleCore'+q);ankleCore.position.set(0,-.66,.22);knee.add(ankleCore);const boot=acAurelianMesh(new THREE.BoxGeometry(.34,.27,.64),gold,'boot'+q);boot.position.set(sx*.035,-.76,.22);boot.rotation.z=-sx*.035;knee.add(boot);const toe=acAurelianMesh(new THREE.ConeGeometry(.16,.46,4),white,'bootBlade'+q);toe.position.set(sx*.035,-.78,.57);toe.rotation.x=Math.PI/2;toe.rotation.z=Math.PI/4;knee.add(toe);const sole=acAurelianMesh(new THREE.BoxGeometry(.38,.08,.70),black2,'bootSole'+q);sole.position.set(0,-.91,.23);knee.add(sole);
  return {hip,knee}
}
function acAddCloth(pelvis,mats,wide=1){
  const root=acAurelianGroup('clothRoot');root.position.set(0,.15,-.10);pelvis.add(root);
  for(const sx of[-1,0,1]){const w=(sx===0?.52:.44)*wide,h=(sx===0?1.64:1.43),p=acAurelianMesh(new THREE.PlaneGeometry(w,h,3,5),mats.cloth,'clothPanel'+sx);p.position.set(sx*.40,-.76,-.40);p.rotation.z=sx*.13;root.add(p);const trim=acAurelianMesh(new THREE.BoxGeometry(w*.96,.060,.025),mats.gold,'clothTrim'+sx);trim.position.set(sx*.40,-1.50,-.39);trim.rotation.z=sx*.13;root.add(trim);const glyph=acAurelianGlow(.085,0xffb52d,'clothSunGlyph'+sx);glyph.scale.set(1,.70,.30);glyph.position.set(sx*.40,-.80,-.37);root.add(glyph)}
  return root
}
function acBaseAurelian(name,kind='solar',heavy=false){
  const root=acAurelianGroup(name);const mats={
    black:acAurelianMat(0x05070b,.46,.34),black2:acAurelianMat(0x151a24,.66,.24),white:acAurelianMat(0xf5eee1,.58,.18,0x2b2114,.08),gold:acAurelianMat(0xe0a235,.91,.13,0x6a3004,.24),sun:acAurelianMat(0xffc43d,.54,.08,0xff7100,3.2),hot:acAurelianMat(0xffffd0,.28,.05,0xffa000,4.6),cloth:new THREE.MeshStandardMaterial({color:0xead8b0,metalness:.08,roughness:.64,side:THREE.DoubleSide})
  };
  const pelvis=acAurelianGroup('pelvis');root.add(pelvis);pelvis.add(acAurelianMesh(new THREE.CylinderGeometry(.40,.51,.46,8),mats.black2,'pelvisCore'));
  for(const sx of[-1,1]){const hp=acAurelianMesh(new THREE.BoxGeometry(.34,.40,.31),mats.white,'hipPlate'+sx);hp.position.set(sx*.37,0,.09);pelvis.add(hp);const edge=acAurelianMesh(new THREE.BoxGeometry(.07,.43,.34),mats.gold,'hipGold'+sx);edge.position.set(sx*.52,0,.09);pelvis.add(edge)}
  const torso=acAurelianGroup('torso');torso.position.y=.54;pelvis.add(torso);acAddCoreTorso(torso,mats,kind);
  const mantle=acAurelianMesh(new THREE.BoxGeometry(1.18,.22,.42),mats.gold,'solarMantle');mantle.position.set(0,1.43,-.10);torso.add(mantle);
  const head=acAurelianGroup('head');head.position.y=1.94;torso.add(head);acAddBirdHelmet(head,mats,1.0);acAddHalo(head,mats.gold,mats.sun,1.0);
  const shoulders=acAurelianGroup('shoulders');shoulders.position.y=1.42;torso.add(shoulders);const l=acAddArmAssembly(shoulders,mats,-1,heavy?'heavy':'standard'),r=acAddArmAssembly(shoulders,mats,1,heavy?'heavy':'standard');
  const ll=acAddLegAssembly(pelvis,mats,-1),rl=acAddLegAssembly(pelvis,mats,1),clothRoot=acAddCloth(pelvis,mats,heavy?1.10:1.0);
  for(const sx of[-1,1]){const wingRoot=acAurelianGroup('backWingRoot'+sx);wingRoot.position.set(sx*.48,1.18,-.34);torso.add(wingRoot);const wing=acAurelianMesh(new THREE.ConeGeometry(.17,1.26,4),sx<0?mats.white:mats.gold,'solarBackWing'+sx);wing.position.set(sx*.34,.08,-.05);wing.rotation.z=-sx*.48;wingRoot.add(wing);const edge=acAurelianMesh(new THREE.ConeGeometry(.065,1.36,4),mats.sun,'solarBackWingEdge'+sx);edge.position.copy(wing.position);edge.rotation.copy(wing.rotation);wingRoot.add(edge)}
  return {root,mats,pelvis,torso,head,shoulders,l,r,ll,rl,clothRoot}
}
function acAnimateAurelianWarriorIdle(rig,w,now,chosen=false){
  const body=rig?.userData?.rig;if(!body||!String(rig.userData?.modelFidelity||'').includes('AURELIAN'))return;if((typeof aiming!=='undefined'&&aiming&&typeof selected!=='undefined'&&selected===w)||now<(rig.userData.acAimActiveUntil||0)||now<(rig.userData.acPoseRecoverUntil||0))return;
  const phase=now*.0019+(w?.roomIndex||0)*.71,breath=Math.sin(phase),settle=Math.sin(phase*.47+1.2),base=node=>node?.userData?.acAimBase||null;
  const torso=body.torso,head=body.headRoot||body.head,shoulders=body.shoulders,pelvis=body.pelvis,cloth=body.clothRoot,lArm=body.armL||body.armRoots?.[0],rArm=body.armR||body.armRoots?.[1],lLeg=body.hipL||body.legRoots?.[0],rLeg=body.hipR||body.legRoots?.[1];
  const tb=base(torso),hb=base(head),sb=base(shoulders),pb=base(pelvis),cb=base(cloth),lab=base(lArm),rab=base(rArm),llb=base(lLeg),rlb=base(rLeg);
  if(tb){torso.rotation.x=tb.rx-breath*.018;torso.rotation.y=tb.ry+settle*.030;torso.rotation.z=tb.rz+breath*.010;torso.position.y=tb.py+breath*.018}
  if(hb){head.rotation.y=hb.ry+(chosen?.11:.06)*Math.sin(phase*.39);head.rotation.x=hb.rx-breath*.014;head.rotation.z=hb.rz-settle*.018}
  if(sb){shoulders.rotation.x=sb.rx+breath*.012;shoulders.rotation.y=sb.ry-settle*.018;shoulders.position.y=sb.py+breath*.010}
  if(pb){pelvis.rotation.y=pb.ry-settle*.012;pelvis.position.y=pb.py-breath*.009}
  if(lab)lArm.rotation.z=lab.rz+breath*.018;if(rab)rArm.rotation.z=rab.rz-breath*.018;
  if(llb)lLeg.rotation.z=llb.rz-settle*.010;if(rlb)rLeg.rotation.z=rlb.rz+settle*.010;
  if(cb){cloth.rotation.y=cb.ry+settle*.055;cloth.rotation.z=cb.rz-breath*.022;for(const [i,panel] of cloth.children.filter(o=>String(o.name||'').startsWith('clothPanel')).entries())panel.rotation.x=Math.sin(phase*.72+i*.8)*.035}
}
function acBuildSolarLancerRebuilt(){
  const b=acBaseAurelian('SOLAR_LANCER_3D_RIG','solar',false),{root,mats,torso,l,r,ll,rl}=b;
  l.upper.rotation.z=.26;r.upper.rotation.z=-.38;l.elbow.rotation.z=-.20;r.elbow.rotation.z=.26;
  const weapon=acAurelianGroup('WEAPON_MUZZLE_RIG');weapon.position.set(.63,.76,.40);weapon.rotation.z=-1.02;torso.add(weapon);
  const shaft=acAurelianMesh(new THREE.CylinderGeometry(.095,.120,3.18,10),mats.black2,'lanceShaft');weapon.add(shaft);
  const rail=acAurelianMesh(new THREE.BoxGeometry(.21,2.65,.19),mats.gold,'lanceSpine');rail.position.y=.30;weapon.add(rail);
  for(const y of[-.70,.05,.82,1.48]){const ring=acAurelianMesh(new THREE.TorusGeometry(.18,.040,8,22),mats.sun,'lanceRing'+y);ring.rotation.x=Math.PI/2;ring.position.y=y;weapon.add(ring)}
  const guard=acAurelianMesh(new THREE.TorusGeometry(.48,.075,8,30,Math.PI*1.50),mats.sun,'lanceGuard');guard.position.y=.48;guard.rotation.z=.74;weapon.add(guard);
  const bladeBase=acAurelianMesh(new THREE.ConeGeometry(.35,.78,6),mats.white,'lanceBladeBase');bladeBase.position.y=1.86;weapon.add(bladeBase);
  const tip=acAurelianMesh(new THREE.ConeGeometry(.28,1.28,6),mats.sun,'lanceTip');tip.position.y=2.82;weapon.add(tip);
  const glow=acAurelianGlow(.28,0xffffb0,'lanceGlow');glow.position.y=3.48;weapon.add(glow);weapon.userData.muzzle=glow;root.userData.muzzle=glow;
  const rearGrip=acAurelianGroup('lanceRearGrip');rearGrip.position.set(0,-.58,0);weapon.add(rearGrip);const forwardGrip=acAurelianGroup('lanceForwardGrip');forwardGrip.position.set(0,.22,0);weapon.add(forwardGrip);for(const y of[1.72,2.12]){const focus=acAurelianMesh(new THREE.TorusGeometry(.31,.045,8,28),mats.hot,'lanceFocusRing'+y);focus.position.y=y;focus.rotation.x=Math.PI/2;weapon.add(focus)}
  const wingL=acAurelianMesh(new THREE.ConeGeometry(.18,.88,4),mats.gold,'lanceWingL');wingL.position.set(-.31,1.80,0);wingL.rotation.z=.48;weapon.add(wingL);const wingR=wingL.clone();wingR.name='lanceWingR';wingR.position.x=.31;wingR.rotation.z=-.48;weapon.add(wingR);
  for(const sx of[-1,1]){const vane=acAurelianMesh(new THREE.ConeGeometry(.20,1.18,5),mats.sun,'lancerBackVane'+sx);vane.position.set(sx*.68,1.20,-.38);vane.rotation.z=-sx*.42;torso.add(vane);const vaneRing=acAurelianMesh(new THREE.TorusGeometry(.27,.055,7,20),mats.gold,'lancerVaneRing'+sx);vaneRing.position.set(sx*.68,1.15,-.30);torso.add(vaneRing)}
  root.userData.rig={pelvis:b.pelvis,torso,headRoot:b.head,head:b.head,shoulders:b.shoulders,armRoots:[l.upper,r.upper],legRoots:[ll.hip,rl.hip],armL:l.upper,armR:r.upper,elbowL:l.elbow,elbowR:r.elbow,hipL:ll.hip,hipR:rl.hip,kneeL:ll.knee,kneeR:rl.knee,weapon,lanceTip:tip,lanceGlow:glow,gripPrimary:rearGrip,gripSecondary:forwardGrip,clothRoot:b.clothRoot};root.userData.modelFidelity='AURELIAN_REBUILT_CANON_HIGH';root.userData.animationState='idle';return root
}
function acBuildSunDiskGunnerRebuilt(){
  const b=acBaseAurelian('SUN_DISK_GUNNER_3D_RIG','disk',true),{root,mats,l,r,ll,rl}=b;
  l.upper.rotation.z=.18;r.upper.rotation.z=-.18;l.elbow.rotation.z=-.10;r.elbow.rotation.z=.10;
  function gauntlet(arm,sx){
    const q=sx<0?'L':'R',g=acAurelianGroup((sx>0?'RIGHT':'LEFT')+'_DISK_GAUNTLET');g.position.set(0,-.08,.26);arm.hand.add(g);
    const diskScale=sx>0?1.20:.84;
    const cuff=acAurelianMesh(new THREE.CylinderGeometry(.29,.36,.52,10),mats.gold,'gauntletArmor'+q);cuff.rotation.x=Math.PI/2;g.add(cuff);
    const barrel=acAurelianMesh(new THREE.CylinderGeometry(.22,.27,.44,10),mats.black2,'diskBarrel'+q);barrel.rotation.x=Math.PI/2;barrel.position.z=.34;g.add(barrel);
    const outer=acAurelianMesh(new THREE.TorusGeometry(.68*diskScale,.105*diskScale,10,48),mats.sun,'solarDisk'+q);outer.position.z=.52;outer.rotation.x=Math.PI/2;g.add(outer);
    const mid=acAurelianMesh(new THREE.TorusGeometry(.49*diskScale,.065*diskScale,8,40),mats.gold,'solarDiskMid'+q);mid.position.z=.53;mid.rotation.x=Math.PI/2;g.add(mid);
    const inner=acAurelianMesh(new THREE.TorusGeometry(.32*diskScale,.050*diskScale,8,36),mats.white,'solarDiskInner'+q);inner.position.z=.54;inner.rotation.x=Math.PI/2;g.add(inner);
    for(let i=0;i<12;i++){const a=i*Math.PI/6,tooth=acAurelianMesh(new THREE.ConeGeometry(.085*diskScale,.42*diskScale,4),i%2?mats.hot:mats.gold,'diskTooth'+q+i);tooth.position.set(Math.cos(a)*.86*diskScale,Math.sin(a)*.86*diskScale,.54);tooth.rotation.z=a-Math.PI/2;g.add(tooth)}
    const emitter=acAurelianGlow(.23,0xffffb0,'diskEmitter'+q);emitter.position.z=.74;g.add(emitter);return {g,emitter}
  }
  const L=gauntlet(l,-1),R=gauntlet(r,1);root.userData.muzzle=R.emitter;root.userData.secondaryMuzzle=L.emitter;
  for(const sx of[-1,1]){const capacitor=acAurelianMesh(new THREE.TorusGeometry(.38,.075,8,26),mats.sun,'diskShoulderCapacitor'+sx);capacitor.position.set(sx*.78,1.43,.18);capacitor.scale.y=.78;b.torso.add(capacitor);const brace=acAurelianMesh(new THREE.BoxGeometry(.20,.80,.19),mats.gold,'diskChestBrace'+sx);brace.position.set(sx*.37,1.02,.55);brace.rotation.z=-sx*.28;b.torso.add(brace)}
  root.userData.rig={pelvis:b.pelvis,torso:b.torso,headRoot:b.head,head:b.head,shoulders:b.shoulders,armRoots:[l.upper,r.upper],legRoots:[ll.hip,rl.hip],armL:l.upper,armR:r.upper,elbowL:l.elbow,elbowR:r.elbow,hipL:ll.hip,hipR:rl.hip,kneeL:ll.knee,kneeR:rl.knee,weapon:R.g,gauntlet:R.g,secondaryWeapon:L.g,secondaryGauntlet:L.g,rightMuzzle:R.emitter,leftMuzzle:L.emitter,clothRoot:b.clothRoot};root.userData.dualGauntletReady=true;root.userData.modelFidelity='AURELIAN_REBUILT_CANON_HIGH';root.userData.animationState='idle';return root
}
function acBuildSunadierRebuilt(){
  const b=acBaseAurelian('SUNADIER_3D_RIG','solar',true),{root,mats,torso,l,r,ll,rl}=b;
  l.upper.rotation.z=.34;r.upper.rotation.z=-.52;l.elbow.rotation.z=-.28;r.elbow.rotation.z=.42;
  const rack=acAurelianGroup('grenadeRack');rack.position.set(-.58,.96,-.36);torso.add(rack);rack.add(acAurelianMesh(new THREE.BoxGeometry(1.02,.72,.24),mats.black,'grenadeRackFrame'));for(let i=0;i<3;i++){const cell=acAurelianGlow(.19,0xff9d00,'solarCell'+i);cell.position.set((i-1)*.32,0,.19);rack.add(cell)}
  const bandolier=acAurelianMesh(new THREE.BoxGeometry(.21,1.68,.18),mats.gold,'sunadierBandolier');bandolier.position.set(.12,1.02,.57);bandolier.rotation.z=-.48;torso.add(bandolier);for(let i=0;i<4;i++){const charge=acAurelianMesh(new THREE.SphereGeometry(.17,12,8),i%2?mats.sun:mats.gold,'sunadierReserveCharge'+i);charge.position.set(-.42+i*.27,.54+i*.16,.64);torso.add(charge)}
  const chain=acAurelianGroup('sunChain');chain.position.set(.02,-.02,.06);r.hand.add(chain);
  for(let i=0;i<18;i++){const link=acAurelianMesh(new THREE.TorusGeometry(.13,.040,6,12),i%3?mats.gold:mats.sun,'chainLink'+i);link.position.set(.13*i,.050*i,.020*i);link.rotation.y=i*.42;link.rotation.z=i*.18;chain.add(link)}
  const grenade=acAurelianGroup('solarGrenade');grenade.position.set(2.68,1.02,.40);chain.add(grenade);
  const shell=acAurelianMesh(new THREE.SphereGeometry(.64,22,16),mats.black2,'solarGrenadeShell');grenade.add(shell);
  for(const axis of[0,Math.PI/2]){const band=acAurelianMesh(new THREE.TorusGeometry(.43,.070,8,28),mats.gold,'grenadeBand'+axis);band.rotation.x=Math.PI/2;band.rotation.z=axis;grenade.add(band)}
  const grenadeCore=acAurelianGlow(.25,0xffff9a,'grenadeCore');grenadeCore.position.z=.47;grenade.add(grenadeCore);
  for(let i=0;i<8;i++){const a=i*Math.PI/4,ray=acAurelianMesh(new THREE.ConeGeometry(.080,.34,4),mats.sun,'grenadeRay'+i);ray.position.set(Math.cos(a)*.60,Math.sin(a)*.60,0);ray.rotation.z=a-Math.PI/2;grenade.add(ray)}
  for(let i=0;i<4;i++){const a=i*Math.PI/2,satellite=acAurelianGlow(.13,0xff9d22,'sunadierSatellite'+i);satellite.position.set(Math.cos(a)*.88,Math.sin(a)*.88,.04);grenade.add(satellite)}
  root.userData.muzzle=grenade;root.userData.rig={pelvis:b.pelvis,torso,headRoot:b.head,head:b.head,shoulders:b.shoulders,armRoots:[l.upper,r.upper],legRoots:[ll.hip,rl.hip],armL:l.upper,armR:r.upper,elbowL:l.elbow,elbowR:r.elbow,hipL:ll.hip,hipR:rl.hip,kneeL:ll.knee,kneeR:rl.knee,weapon:chain,chain,grenade,grenadeCore,clothRoot:b.clothRoot};root.userData.modelFidelity='AURELIAN_REBUILT_CANON_HIGH';root.userData.animationState='idle';return root
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
  return patched.replace('</head>','<meta id="ac-aurelian-rebuilt-models-v0419" name="ac-aurelian-rebuilt-models" content="REFERENCE_DRIVEN_LAYERED_ARMOR_ARTICULATED_RIGS_NATURAL_IDLE_OVERSCALE_WEAPONS_GAMEPLAY_HOOKS_PRESERVED">\n</head>');
}
