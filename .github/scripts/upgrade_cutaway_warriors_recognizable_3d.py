from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
a=s.find('function buildCutawayOnlyWarrior3D(type){')
b=s.find('function buildPrivateXray(){',a)
if a<0 or b<0: raise SystemExit('cutaway warrior builder boundary missing')
new=r'''function buildCutawayOnlyWarrior3D(type){
  const g=new THREE.Group();g.name=`CUTAWAY_ONLY_${String(type).toUpperCase()}`;g.visible=true;
  const P=(color,metal=.25,rough=.42,emissive=0x000000,ei=0)=>new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough,emissive,emissiveIntensity:ei,side:THREE.DoubleSide});
  const gold=P(0xd6a83b,.72,.24),ivory=P(0xf1e8d5,.18,.38),dark=P(0x251b17,.55,.32),sun=P(0xffd75a,.38,.18,0xff8a18,1.7),bronze=P(0x9b5a27,.68,.30),black=P(0x16120f,.58,.28);
  const add=(parent,geo,mat,name,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,mat);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.renderOrder=110;parent.add(o);return o};
  const pelvis=new THREE.Group();pelvis.name='PELVIS';pelvis.position.y=.02;g.add(pelvis);
  add(pelvis,new THREE.BoxGeometry(.70,.38,.46),gold,'WAIST',0,.05,.02);
  const torso=new THREE.Group();torso.name='TORSO';torso.position.y=.42;pelvis.add(torso);
  const core=add(torso,new THREE.CylinderGeometry(.43,.55,1.02,12),dark,'CORE',0,.48,0);core.scale.z=.72;
  const chest=add(torso,new THREE.BoxGeometry(1.02,.62,.50),ivory,'CHEST',0,.82,.05);chest.scale.set(1,.95,.9);
  add(torso,new THREE.BoxGeometry(.72,.14,.57),gold,'CHEST_GOLD',0,.94,.07);
  const neck=add(torso,new THREE.CylinderGeometry(.12,.15,.22,10),dark,'NECK',0,1.20,0);
  const headRoot=new THREE.Group();headRoot.name='HEAD_JOINT';headRoot.position.set(0,1.47,.02);torso.add(headRoot);
  add(headRoot,new THREE.SphereGeometry(.31,18,14),ivory,'HELMET');
  const face=add(headRoot,new THREE.BoxGeometry(.42,.15,.13),sun,'VISOR',0,.02,.29);face.rotation.x=-.08;
  add(headRoot,new THREE.BoxGeometry(.12,.38,.34),gold,'HELMET_CREST',0,.32,-.02);
  const armRoots=[];
  for(const sx of[-1,1]){const shoulder=new THREE.Group();shoulder.name=sx<0?'LEFT_SHOULDER':'RIGHT_SHOULDER';shoulder.position.set(sx*.61,1.00,.02);torso.add(shoulder);armRoots.push(shoulder);add(shoulder,new THREE.SphereGeometry(.25,12,9),gold,'PAULDRON');const upper=add(shoulder,new THREE.CylinderGeometry(.12,.15,.54,9),ivory,'UPPER_ARM',sx*.08,-.33,.02);upper.rotation.z=sx*.10;const elbow=new THREE.Group();elbow.name='ELBOW';elbow.position.set(sx*.12,-.62,.02);shoulder.add(elbow);add(elbow,new THREE.SphereGeometry(.14,10,8),gold,'ELBOW_ARMOR');const fore=add(elbow,new THREE.CylinderGeometry(.12,.15,.50,9),ivory,'FOREARM',sx*.03,-.29,.06);fore.rotation.z=-sx*.08;add(elbow,new THREE.BoxGeometry(.28,.30,.32),gold,'GAUNTLET',sx*.04,-.60,.12)}
  const legRoots=[];
  for(const sx of[-1,1]){const hip=new THREE.Group();hip.name=sx<0?'LEFT_HIP':'RIGHT_HIP';hip.position.set(sx*.23,-.16,.02);pelvis.add(hip);legRoots.push(hip);add(hip,new THREE.SphereGeometry(.16,10,8),gold,'HIP_ARMOR');add(hip,new THREE.CylinderGeometry(.15,.19,.58,9),ivory,'THIGH',0,-.34,0);const knee=new THREE.Group();knee.name='KNEE';knee.position.y=-.67;hip.add(knee);add(knee,new THREE.BoxGeometry(.27,.22,.25),gold,'KNEE_PLATE',0,0,.10);add(knee,new THREE.CylinderGeometry(.13,.17,.55,9),gold,'SHIN',0,-.34,0);const boot=add(knee,new THREE.BoxGeometry(.30,.24,.50),dark,'BOOT',0,-.69,.12);boot.position.z=.14}
  if(type==='solar_lancer'){
    const cape=add(torso,new THREE.BoxGeometry(.84,1.38,.06),P(0x8b4c23,.18,.58),'CAPE',0,.35,-.34);cape.rotation.x=-.08;
    const weapon=new THREE.Group();weapon.name='WEAPON_MUZZLE_RIG';weapon.position.set(.72,.46,.26);torso.add(weapon);weapon.rotation.z=-.34;
    add(weapon,new THREE.CylinderGeometry(.045,.065,2.35,10),gold,'LANCE_SHAFT',0,.45,0);
    const barrel=add(weapon,new THREE.CylinderGeometry(.11,.16,.70,12),sun,'LANCE_EMITTER',0,1.72,0);add(weapon,new THREE.ConeGeometry(.15,.42,12),ivory,'LANCE_TIP',0,2.25,0);
    const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.set(0,2.48,0);weapon.add(muzzle);g.userData.muzzle=muzzle;
    const halo=add(headRoot,new THREE.TorusGeometry(.43,.035,8,28),sun,'SOLAR_HALO',0,.02,-.26);halo.rotation.x=.12;
  }else if(type==='sun_disk_gunner'){
    chest.scale.x=1.12;
    for(const shoulder of armRoots){const sx=shoulder.position.x<0?-1:1;const emitter=new THREE.Group();emitter.name=sx<0?'LEFT_DISK_GAUNTLET':'RIGHT_DISK_GAUNTLET';emitter.position.set(sx*.05,-.70,.28);shoulder.add(emitter);add(emitter,new THREE.BoxGeometry(.38,.42,.46),gold,'HEAVY_GAUNTLET');const disk=add(emitter,new THREE.TorusGeometry(.34,.065,10,32),sun,'SOLAR_DISK',0,0,.28);disk.rotation.x=Math.PI/2;if(sx>0){const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.set(0,0,.48);emitter.add(muzzle);g.userData.muzzle=muzzle}}
    const halo=add(headRoot,new THREE.TorusGeometry(.47,.05,9,32),sun,'DISK_HALO',0,.02,-.25);halo.rotation.x=.12;
  }else if(type==='sunadier'){
    const pack=add(torso,new THREE.BoxGeometry(.76,.92,.34),bronze,'ARTILLERY_PACK',0,.52,-.34);
    const hand=armRoots[1];const chain=new THREE.Group();chain.name='WEAPON_MUZZLE_RIG';chain.position.set(.08,-.78,.28);hand.add(chain);
    for(let i=0;i<10;i++){const link=add(chain,new THREE.TorusGeometry(.065,.018,6,10),bronze,'CHAIN_LINK',.12*i,-.055*i,.02*i);link.rotation.y=i*.38}
    const grenade=add(chain,new THREE.SphereGeometry(.27,14,11),sun,'SOLAR_GRENADE',1.30,-.52,.20);add(chain,new THREE.TorusGeometry(.29,.035,7,18),gold,'GRENADE_CAGE',1.30,-.52,.20);
    const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.copy(grenade.position);chain.add(muzzle);g.userData.muzzle=muzzle;
    add(headRoot,new THREE.ConeGeometry(.08,.44,6),sun,'SUNADIER_CREST',0,.53,0);
  }
  g.userData.rig={pelvis,torso,headRoot,armRoots,legRoots};g.userData.animationReady=true;
  g.traverse(o=>{o.visible=true;if(o.isMesh){o.frustumCulled=false;o.renderOrder=Math.max(o.renderOrder||0,110)}});return g
}
'''
s=s[:a]+new+s[b:]
for req in ['WEAPON_MUZZLE_RIG','animationReady=true','SOLAR_DISK','SOLAR_GRENADE','LANCE_EMITTER']:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS recognizable articulated Aurelian cutaway warriors installed')
print('PASS distinct lance, disk gauntlets, and chained solar grenade installed')
print('PASS muzzle anchors and animation joints installed for next aiming phase')
