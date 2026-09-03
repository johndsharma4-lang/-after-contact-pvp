import * as THREE from 'three';

const std=(color,metalness=.45,roughness=.42,emissive=0x000000,emissiveIntensity=0)=>new THREE.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity});
const mesh=(geo,mat,name)=>{const m=new THREE.Mesh(geo,mat);m.name=name;m.castShadow=true;m.receiveShadow=true;return m};

export function roomPosition(index){
  const row=Math.floor(index/3),col=index%3;
  return new THREE.Vector3((col-1)*4.8,(1-row)*4.15,0);
}

export function buildShip3D(factionId){
  const root=new THREE.Group();root.name=`SHIP_${factionId.toUpperCase()}`;root.userData.rooms=[];
  const isA=factionId==='aurelian';
  const hullMat=std(isA?0x8f671e:0x4b5962,.72,.34,isA?0x2c1700:0x07141d,.18);
  const innerMat=std(isA?0x231910:0x161d22,.35,.72);
  const trimMat=std(isA?0xe0ad3a:0x6eb7d8,.78,.26,isA?0x5a3200:0x0a3f5d,.55);
  const body=mesh(new THREE.BoxGeometry(17.3,14.0,5.7),hullMat,'HULL');body.position.z=-2.6;root.add(body);
  for(let i=0;i<9;i++){
    const p=roomPosition(i),room=new THREE.Group();room.name=`ROOM_${i+1}`;room.position.copy(p);
    const cavity=mesh(new THREE.BoxGeometry(4.25,3.55,3.0),innerMat.clone(),`ROOM_${i+1}_CAVITY`);cavity.position.z=.25;room.add(cavity);
    const frame=mesh(new THREE.BoxGeometry(4.55,3.85,.24),trimMat.clone(),`ROOM_${i+1}_FRAME`);frame.position.z=1.86;room.add(frame);
    const cutout=mesh(new THREE.BoxGeometry(4.05,3.35,.28),innerMat.clone(),`ROOM_${i+1}_FRONT`);cutout.position.z=2.02;room.add(cutout);
    room.userData.front=cutout;room.userData.frame=frame;room.userData.cavity=cavity;room.userData.index=i;root.userData.rooms[i]=room;root.add(room);
  }
  return root;
}

function humanoidBase(primary,secondary,accent,name){
  const g=new THREE.Group();g.name=name;
  const p=std(primary,.62,.34),s=std(secondary,.28,.58),a=std(accent,.38,.24,accent,.75);
  const torso=mesh(new THREE.CapsuleGeometry(.58,1.35,7,12),p,'TORSO');torso.position.y=.55;g.add(torso);
  const head=mesh(new THREE.SphereGeometry(.38,18,14),s,'HEAD');head.position.y=1.92;g.add(head);
  for(const sx of[-1,1]){const arm=mesh(new THREE.CapsuleGeometry(.14,.82,5,8),p,'ARM');arm.position.set(sx*.72,.72,0);arm.rotation.z=sx*.1;g.add(arm);const leg=mesh(new THREE.CapsuleGeometry(.17,.95,5,8),s,'LEG');leg.position.set(sx*.26,-.88,0);g.add(leg)}
  const visor=mesh(new THREE.BoxGeometry(.48,.12,.12),a,'VISOR');visor.position.set(0,1.95,.36);g.add(visor);
  return {g,p,s,a};
}

export function buildWarrior3D(profileId){
  if(profileId==='solar_lancer'){
    const {g,p,s,a}=humanoidBase(0xb78429,0xefe3c8,0xffd65a,'WARRIOR_SOLAR_LANCER');
    const lance=mesh(new THREE.CylinderGeometry(.055,.08,3.35,10),p,'SOLAR_LANCE');lance.position.set(.65,.55,.44);lance.rotation.z=-1.08;g.add(lance);const halo=mesh(new THREE.TorusGeometry(.52,.045,9,30),a,'HALO');halo.position.set(0,1.94,-.32);g.add(halo);const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.set(1.85,1.34,.48);g.add(muzzle);g.userData.muzzle=muzzle;return g;
  }
  if(profileId==='sun_disk_gunner'){
    const {g,p,s,a}=humanoidBase(0xc08a25,0xefe6d1,0xffd86a,'WARRIOR_SUN_DISK_GUNNER');
    for(const sx of[-1,1]){const disk=mesh(new THREE.TorusGeometry(.36,.065,9,30),a,'SOLAR_DISK');disk.position.set(sx*.85,.48,.46);disk.rotation.x=Math.PI/2;g.add(disk)}const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.set(.95,.50,.50);g.add(muzzle);g.userData.muzzle=muzzle;return g;
  }
  if(profileId==='sunadier'){
    const {g,p,s,a}=humanoidBase(0xa95d20,0xeadfca,0xffa83d,'WARRIOR_SUNADIER');
    const pack=mesh(new THREE.BoxGeometry(.78,.92,.48),p,'ARTILLERY_PACK');pack.position.set(0,.72,-.48);g.add(pack);const chain=new THREE.Group();chain.name='SOLAR_CHAIN';chain.position.set(.55,.45,.35);for(let i=0;i<8;i++){const link=mesh(new THREE.TorusGeometry(.085,.022,6,12),p,'CHAIN_LINK');link.position.set(i*.14,i*.06,0);chain.add(link)}const grenade=mesh(new THREE.SphereGeometry(.28,12,10),a,'SOLAR_GRENADE');grenade.position.set(1.20,.46,0);chain.add(grenade);g.add(chain);const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.set(1.45,.88,.42);g.add(muzzle);g.userData.muzzle=muzzle;return g;
  }
  if(profileId==='bombardier'){
    const {g,p,s,a}=humanoidBase(0x506b7a,0x26323a,0x62cfff,'WARRIOR_BOMBARDIER');for(const sx of[-1,1]){const pod=mesh(new THREE.BoxGeometry(.38,.72,.52),p,'MISSILE_POD');pod.position.set(sx*.68,1.18,-.18);g.add(pod)}const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.set(.95,.85,.45);g.add(muzzle);g.userData.muzzle=muzzle;return g;
  }
  if(profileId==='sniper'){
    const {g,p,s,a}=humanoidBase(0x6d7a82,0x30383d,0xe2ca95,'WARRIOR_SNIPER');const rifle=mesh(new THREE.CylinderGeometry(.045,.065,2.85,8),a,'RAIL_RIFLE');rifle.position.set(.55,.62,.43);rifle.rotation.z=-1.22;g.add(rifle);const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.set(1.78,1.04,.46);g.add(muzzle);g.userData.muzzle=muzzle;return g;
  }
  const {g,p,s,a}=humanoidBase(0x39576a,0x202a31,0x62cfff,'WARRIOR_COMBAT_CONTROLLER');const tablet=mesh(new THREE.BoxGeometry(.58,.38,.08),a,'TACTICAL_TABLET');tablet.position.set(.55,.62,.40);g.add(tablet);const antenna=mesh(new THREE.CylinderGeometry(.025,.025,1.1,6),a,'ANTENNA');antenna.position.set(.26,1.72,-.30);g.add(antenna);const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.set(.72,.65,.44);g.add(muzzle);g.userData.muzzle=muzzle;return g;
}
