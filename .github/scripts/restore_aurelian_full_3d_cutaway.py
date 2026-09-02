from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')

old="roster:Object.freeze([Object.freeze({id:'solar_lancer',name:'SOLAR LANCER',weapon:'PENETRATING LASER',color:0xffffff,artKey:'solar_lancer'})]),"
new="roster:Object.freeze([Object.freeze({id:'solar_lancer',name:'SOLAR LANCER',weapon:'PENETRATING LASER',color:0xffffff,artKey:'solar_lancer',stats:{acc:95,hp:85,dmg:82,aoe:18}}),Object.freeze({id:'sun_disk_gunner',name:'SUN DISK GUNNER',weapon:'SOLAR DISK CUTTER',color:0xffd76a,artKey:'sun_disk_gunner',stats:{acc:82,hp:70,dmg:88,aoe:62}}),Object.freeze({id:'sunadier',name:'SUNADIER',weapon:'ABYSS-CHAIN SOLAR GRENADE',color:0xffb84d,artKey:'sunadier',stats:{acc:72,hp:80,dmg:92,aoe:100}})]),"
if old in s:s=s.replace(old,new,1)
elif "id:'sun_disk_gunner'" not in s or "id:'sunadier'" not in s:raise SystemExit('Aurelian roster anchor missing')

if "sun_disk_gunner:'/sun-disk-gunner-hq.webp'" not in s:
    s=s.replace("spatial_disintegrator:'/spatial-disintegrator.webp'","spatial_disintegrator:'/spatial-disintegrator.webp',sun_disk_gunner:'/sun-disk-gunner-hq.webp',sunadier:'/sunadier-hq.webp'",1)

old_reset="const resetTeam=factionTeam(selectedFaction).map(u=>u.id);if(selectedFaction==='aurelian'){aWarriors.forEach(w=>{w.active=true;applyProfileToWarrior(w,'solar_lancer');setWarriorObjectsVisible(w,false)})}else{aWarriors.forEach((w,i)=>{w.active=i<resetTeam.length;if(resetTeam[i])applyProfileToWarrior(w,resetTeam[i]);setWarriorObjectsVisible(w,false)})};"
new_reset="const resetTeam=factionTeam(selectedFaction).map(u=>u.id);configureFactionTeam('aurelian',selectedFaction,resetTeam);aWarriors.forEach(w=>setWarriorObjectsVisible(w,false));"
if old_reset in s:s=s.replace(old_reset,new_reset,1)

anchor='function renderStarter3DPortrait(type){'
pos=s.find(anchor)
if pos<0:raise SystemExit('3D portrait anchor missing')
if 'function buildAurelianWarrior3DModel(type)' not in s:
    extra=r'''function buildSunDiskGunner3DModel(){
  const g=new THREE.Group();g.name='SUN_DISK_GUNNER_3D_RIG';
  const gold=new THREE.MeshStandardMaterial({color:0xd7a62f,metalness:.72,roughness:.26});
  const white=new THREE.MeshStandardMaterial({color:0xf4ead3,metalness:.18,roughness:.48});
  const dark=new THREE.MeshStandardMaterial({color:0x2b2117,metalness:.55,roughness:.38});
  const glow=new THREE.MeshStandardMaterial({color:0xffdf66,emissive:0xffa91f,emissiveIntensity:1.1,metalness:.35,roughness:.18});
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.48,.62,1.65,10),gold);torso.position.y=.65;g.add(torso);
  const chest=new THREE.Mesh(new THREE.SphereGeometry(.56,16,12),white);chest.scale.set(1,.74,.62);chest.position.y=1.38;g.add(chest);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.36,16,12),white);head.position.y=2.16;g.add(head);
  const visor=new THREE.Mesh(new THREE.BoxGeometry(.48,.14,.18),glow);visor.position.set(0,2.15,.34);g.add(visor);
  for(const sx of[-1,1]){const sh=new THREE.Mesh(new THREE.SphereGeometry(.30,12,8),gold);sh.position.set(sx*.70,1.45,0);g.add(sh);const arm=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.80,8),white);arm.position.set(sx*.80,.83,0);g.add(arm);const gaunt=new THREE.Mesh(new THREE.BoxGeometry(.36,.50,.42),gold);gaunt.position.set(sx*.84,.34,.16);g.add(gaunt);const disk=new THREE.Mesh(new THREE.TorusGeometry(.34,.055,8,28),glow);disk.position.set(sx*.84,.32,.43);disk.rotation.x=Math.PI/2;g.add(disk)}
  for(const sx of[-1,1]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.17,.22,1.10,8),gold);leg.position.set(sx*.24,-.58,0);g.add(leg);const boot=new THREE.Mesh(new THREE.BoxGeometry(.30,.25,.48),dark);boot.position.set(sx*.24,-1.18,.16);g.add(boot)}
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.48,.045,8,28),glow);halo.position.set(0,2.18,-.30);g.add(halo);return g
}
function buildSunadier3DModel(){
  const g=new THREE.Group();g.name='SUNADIER_3D_RIG';
  const bronze=new THREE.MeshStandardMaterial({color:0xb86f24,metalness:.66,roughness:.34});
  const white=new THREE.MeshStandardMaterial({color:0xeadfca,metalness:.14,roughness:.56});
  const dark=new THREE.MeshStandardMaterial({color:0x2a1a12,metalness:.48,roughness:.42});
  const glow=new THREE.MeshStandardMaterial({color:0xffbe42,emissive:0xff7b16,emissiveIntensity:1.3,metalness:.28,roughness:.20});
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.52,.68,1.75,10),bronze);torso.position.y=.62;g.add(torso);
  const chest=new THREE.Mesh(new THREE.BoxGeometry(.92,.64,.48),white);chest.position.set(0,1.36,.05);g.add(chest);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.37,16,12),white);head.position.y=2.10;g.add(head);
  const crest=new THREE.Mesh(new THREE.ConeGeometry(.09,.55,6),glow);crest.position.y=2.58;g.add(crest);
  for(const sx of[-1,1]){const sh=new THREE.Mesh(new THREE.SphereGeometry(.31,12,8),bronze);sh.position.set(sx*.72,1.43,0);g.add(sh);const arm=new THREE.Mesh(new THREE.CylinderGeometry(.14,.17,.86,8),white);arm.position.set(sx*.82,.78,0);arm.rotation.z=sx*.14;g.add(arm)}
  for(const sx of[-1,1]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.18,.23,1.08,8),bronze);leg.position.set(sx*.25,-.60,0);g.add(leg);const boot=new THREE.Mesh(new THREE.BoxGeometry(.31,.25,.50),dark);boot.position.set(sx*.25,-1.18,.17);g.add(boot)}
  const chain=new THREE.Group();chain.name='sunChain';chain.position.set(.72,.62,.30);g.add(chain);
  for(let i=0;i<9;i++){const link=new THREE.Mesh(new THREE.TorusGeometry(.09,.025,6,12),bronze);link.position.set(.13*i,.08*i,.03*i);link.rotation.y=i*.35;chain.add(link)}
  const grenade=new THREE.Mesh(new THREE.SphereGeometry(.30,12,10),glow);grenade.name='solarGrenade';grenade.position.set(1.20,.72,.26);chain.add(grenade);return g
}
function buildAurelianWarrior3DModel(type){if(type==='solar_lancer')return buildSolarLancer3DModel();if(type==='sun_disk_gunner')return buildSunDiskGunner3DModel();if(type==='sunadier')return buildSunadier3DModel();return buildStarter3DModel(type)}
'''
    s=s[:pos]+extra+s[pos:]

a=s.find('function applyXrayShell(){');b=s.find('function buildPrivateXray(){',a)
if a<0 or b<0:raise SystemExit('cutaway shell boundary missing')
s=s[:a]+r'''function applyXrayShell(){
  restoreXrayShell();const side=localXraySide(),skin=side==='aurelian'?factionSkinA:factionSkinE,hidden=new Set();
  const hide=mesh=>{if(!mesh||hidden.has(mesh)||mesh.visible===false)return;hidden.add(mesh);xrayShellState.push({mesh,visible:mesh.visible});mesh.visible=false};
  for(const m of skin?.userData?.damageModules||[])hide(m);
  for(const part of skin?.children||[]){if(part?.isMesh&&!part.userData?.wreckPersistent&&!part.userData?.healthVisual)hide(part)}
  diag('FULL 3X3 HULL CUTAWAY',`side=${side} rooms=9 hiddenPanels=${hidden.size}`)
}
'''+s[b:]

a=s.find('function buildPrivateXray(){');b=s.find('function refreshPrivateXrayVisuals(){',a)
if a<0 or b<0:raise SystemExit('cutaway build boundary missing')
s=s[:a]+r'''function buildPrivateXray(){
  if(xrayGroup){localCommandVessel().remove(xrayGroup);disposeXrayObject(xrayGroup)}
  const roomRoot=localXrayRooms(),rooms=roomRoot.userData.rooms,faction=factionForWorldSide(localXraySide()),crew=localXrayWarriors().filter(w=>!w.passive).slice(0,3);xrayRoomVisuals=[];
  if(!xraySelectedCrew||!crew.includes(xraySelectedCrew))xraySelectedCrew=crew.find(w=>w.hp>0)||crew[0]||null;
  const g=new THREE.Group();g.name='FULL_3X3_CREW_CUTAWAY';g.userData.xrayVisual=true;g.position.copy(roomRoot.position);g.rotation.copy(roomRoot.rotation);g.scale.copy(roomRoot.scale);
  const hullColor=faction==='aurelian'?0x71451f:0x3d515d,edgeColor=faction==='aurelian'?0xffce63:0xa8e8ff,insideColor=faction==='aurelian'?0x17100b:0x0f1b24;
  for(let i=0;i<rooms.length;i++){
    const room=rooms[i],cell=new THREE.Group();cell.userData.xrayVisual=true;cell.position.copy(room.local);g.add(cell);
    const width=4.45,height=3.55,depth=3.0,inside=xrayBasic(insideColor,.98,false),hull=xrayBasic(hullColor,.90,false);
    const back=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.20),inside),68);back.position.z=-1.25;cell.add(back);
    const floor=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,.16,depth),hull.clone()),72);floor.position.y=-height*.5;cell.add(floor);
    const ceiling=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,.14,depth),hull.clone()),72);ceiling.position.y=height*.5;cell.add(ceiling);
    for(const sx of[-1,1]){const wall=markXray(new THREE.Mesh(new THREE.BoxGeometry(.14,height,depth),hull.clone()),72);wall.position.x=sx*width*.5;cell.add(wall)}
    const rim=markXray(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(width+.04,height+.04,depth+.04)),new THREE.LineBasicMaterial({color:edgeColor,transparent:true,opacity:.34,depthTest:false,depthWrite:false})),84);cell.add(rim);
    const w=crew.find(x=>x.roomIndex===i);if(!w)continue;
    const marker=new THREE.Group();marker.userData.xrayVisual=true;marker.userData.xrayWarrior=w;marker.position.set(0,-.12,.72);cell.add(marker);
    const hit=markXray(new THREE.Mesh(new THREE.PlaneGeometry(3.8,3.7),new THREE.MeshBasicMaterial({transparent:true,opacity:.001,depthTest:false,depthWrite:false,side:THREE.DoubleSide})),105);hit.userData.xrayWarrior=w;marker.add(hit);
    const rig3D=buildAurelianWarrior3DModel(w.weaponKey);rig3D.name=`CUTAWAY_${w.weaponKey.toUpperCase()}_ROOM_${i+1}`;rig3D.position.set(0,-.40,.54);rig3D.scale.setScalar(.42);rig3D.rotation.y=w.side==='aurelian'?Math.PI:0;rig3D.traverse(o=>{o.userData=o.userData||{};o.userData.xrayVisual=true;if(o.isMesh){o.frustumCulled=false;o.renderOrder=94;if(o.material){o.material=o.material.clone();o.material.depthTest=false;o.material.depthWrite=false}}});marker.add(rig3D);
    const aura=markXray(new THREE.Mesh(new THREE.RingGeometry(.74,.82,18),xrayBasic(w.assignedColor,w===xraySelectedCrew?.72:.20,true)),88);aura.position.set(0,-.18,.06);marker.add(aura);
    const label=makeXrayCrewLabel(w);label.scale.set(2.25,.56,1);label.position.set(0,-1.55,.95);cell.add(label);
    const light=new THREE.PointLight(0xffc86a,w===xraySelectedCrew?1.45:.82,5.5,2);light.position.set(-.8,1.05,1.0);cell.add(light);
    xrayRoomVisuals.push({warriorMarker:marker,statusGroup:null,warrior:w,rig3D,aura,label,hit,railHit:null,index:i,lastHp:w.hp,hitUntil:0,baseRigY:rig3D.position.y,baseRigScale:rig3D.scale.clone(),rim,roomLight:light,aaBack:null,aaFill:null,aaWidth:0})
  }
  xrayScanBand=null;xrayGroup=g;localCommandVessel().add(g);refreshPrivateXrayVisuals();diag('FULL 3X3 CREW CUTAWAY',`warriors=${crew.map(w=>w.weaponKey+'@R'+(w.roomIndex+1)).join(',')}`)
}
'''+s[b:]

a=s.find('function refreshPrivateXrayVisuals(){');bs=s.find('    if(v.warriorMarker){',a);be=s.find('    const b=Math.max(0,Math.min(100,v.room.breach||0))/100',bs)
if bs<0 or be<0:raise SystemExit('refresh block missing')
s=s[:bs]+r'''    if(v.warriorMarker){
      const w=v.warrior,chosen=w===xraySelectedCrew,dead=w.hp<=0;if(w.hp<v.lastHp)v.hitUntil=now+360;v.lastHp=w.hp;v.warriorMarker.visible=true;
      if(v.rig3D){const hit=now<v.hitUntil,breath=Math.sin(now*.0026+w.roomIndex*.53),base=v.baseRigScale;v.rig3D.position.y=v.baseRigY+(dead?-.24:breath*.012);v.rig3D.rotation.z=dead?.86:(hit?Math.sin(now*.05)*.10:breath*.003);const m=dead?.94:1+(chosen?.016:.004)*breath;v.rig3D.scale.set(base.x*m,base.y*m,base.z*m)}
      v.aura.material.opacity=dead?(chosen?.82:.40):(chosen?.86:.20);v.aura.material.color.setHex(dead?0xff4b3e:w.assignedColor);v.aura.scale.setScalar(chosen?1.16:1);if(v.rim?.material)v.rim.material.opacity=chosen?.90:.34;if(v.roomLight)v.roomLight.intensity=chosen?1.45:.82;v.label.material.opacity=chosen?1:.70;continue
    }
'''+s[be:]

a=s.find('function selectXrayCrew(w){');b=s.find('bindMobileAction(xrayExitBtn',a)
if a<0 or b<0:raise SystemExit('selection boundary missing')
s=s[:a]+r'''function selectXrayCrew(w){
  if(!xrayOpen||!w||!w.active)return;xraySelectedCrew=w;if(w.hp>0&&!w.passive)selectWarrior(w);refreshPrivateXrayVisuals();const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=`CUTAWAY • ${name} • ROOM ${w.roomIndex+1} • HP ${Math.round(w.hp)}/${w.maxHp}`;diag('3D CUTAWAY SELECT',`${w.weaponKey} room=${w.roomIndex+1}`)
}
'''+s[b:]

for req in ["id:'sun_disk_gunner'","id:'sunadier'",'function buildSunDiskGunner3DModel()','function buildSunadier3DModel()','FULL_3X3_CREW_CUTAWAY','FULL 3X3 HULL CUTAWAY','buildAurelianWarrior3DModel(w.weaponKey)','v.warriorMarker.visible=true']:
    if req not in s:raise SystemExit('verification missing '+req)
if "applyProfileToWarrior(w,'solar_lancer')" in s:raise SystemExit('forced Solar Lancer clone reset remains')
p.write_text(s,encoding='utf-8')
print('PASS restored Solar Lancer + Sun Disk Gunner + Sunadier')
print('PASS distinct 3D models')
print('PASS full nine-compartment cutaway')
print('PASS deployed room assignments preserved')
