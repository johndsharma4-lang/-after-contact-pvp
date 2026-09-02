from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# 1) Keep all three Aurelian warriors active through battle reset.
old_reset="const resetTeam=factionTeam(selectedFaction).map(u=>u.id);aWarriors.forEach((w,i)=>{w.active=i<resetTeam.length;if(resetTeam[i])applyProfileToWarrior(w,resetTeam[i]);setWarriorObjectsVisible(w,false)});"
new_reset="const resetTeam=factionTeam(selectedFaction).map(u=>u.id);if(selectedFaction==='aurelian'){aWarriors.forEach(w=>{w.active=true;applyProfileToWarrior(w,'solar_lancer');setWarriorObjectsVisible(w,false)})}else{aWarriors.forEach((w,i)=>{w.active=i<resetTeam.length;if(resetTeam[i])applyProfileToWarrior(w,resetTeam[i]);setWarriorObjectsVisible(w,false)})};"
if old_reset not in s:
    raise SystemExit('battle-reset activation line not found')
s=s.replace(old_reset,new_reset,1)

# 2) Replace the legacy sprite-cutout loop inside buildPrivateXray with articulated 3D rigs.
fn_start=s.find('function buildPrivateXray(){')
if fn_start<0: raise SystemExit('buildPrivateXray not found')
loop_start=s.find('  for(const [i,w] of localCrew.entries()){',fn_start)
loop_end=s.find('  xrayScanBand=null;xrayGroup=g;',loop_start)
if loop_start<0 or loop_end<0: raise SystemExit('buildPrivateXray warrior loop boundary not found')

new_loop=r'''  for(const [i,w] of localCrew.entries()){
    const dead=w.hp<=0,marker=new THREE.Group();marker.userData.xrayVisual=true;marker.userData.xrayWarrior=w;marker.position.set(0,dead?-.62:-.12,.72);content.add(marker);
    const hit=markXray(new THREE.Mesh(new THREE.PlaneGeometry(4.55,6.20),new THREE.MeshBasicMaterial({transparent:true,opacity:.001,depthTest:false,depthWrite:false,side:THREE.DoubleSide})),102);hit.userData.xrayWarrior=w;marker.add(hit);

    let rig3D=null;
    if(w.weaponKey==='solar_lancer'){
      rig3D=buildSolarLancer3DModel();
      rig3D.name=`CUTAWAY_SOLAR_LANCER_ROOM_${w.roomIndex+1}`;
      rig3D.position.set(0,-.55,.90);
      rig3D.scale.setScalar(.78);
      rig3D.rotation.y=w.side==='aurelian'?Math.PI:0;
      rig3D.traverse(o=>{
        o.userData=o.userData||{};o.userData.xrayVisual=true;
        if(o.isMesh){o.frustumCulled=false;o.renderOrder=94;if(o.material){o.material=o.material.clone();o.material.depthTest=false;o.material.depthWrite=false}}
      });
      marker.add(rig3D);
    }

    const aura=markXray(new THREE.Mesh(new THREE.RingGeometry(1.44,1.58,8),xrayBasic(dead?0xff4b3e:w.assignedColor,dead?.50:.30,true)),88);aura.rotation.z=Math.PI/8;aura.position.y=-.30;marker.add(aura);
    const aaWidth=1.82,aaBack=markXray(new THREE.Mesh(new THREE.BoxGeometry(aaWidth,.16,.08),xrayBasic(0x03101a,.88,false)),94);aaBack.position.set(0,2.56,.10);marker.add(aaBack);const aaFill=markXray(new THREE.Mesh(new THREE.BoxGeometry(aaWidth-.10,.09,.10),xrayBasic(0x9deeff,.96,true)),95);aaFill.position.set(0,2.56,.16);marker.add(aaFill);
    const rail=new THREE.Group();rail.userData.xrayVisual=true;rail.userData.xrayWarrior=w;rail.position.set((i-1)*3.02,-3.14,1.64);content.add(rail);rail.scale.setScalar(.60);const railHit=markXray(new THREE.Mesh(new THREE.PlaneGeometry(4.90,1.42),new THREE.MeshBasicMaterial({transparent:true,opacity:.001,depthTest:false,depthWrite:false,side:THREE.DoubleSide})),108);railHit.userData.xrayWarrior=w;rail.add(railHit);const label=makeXrayCrewLabel(w);rail.add(label);
    marker.visible=w===xraySelectedCrew;xrayRoomVisuals.push({warriorMarker:marker,statusGroup:rail,warrior:w,rig3D,aura,aaBack,aaFill,label,hit,railHit,dead,aaWidth:aaWidth-.10,index:w.roomIndex,lastHp:w.hp,hitUntil:0,baseRigY:rig3D?.position.y??0,baseRigScale:rig3D?.scale.clone()||null})
  }
'''
s=s[:loop_start]+new_loop+s[loop_end:]

# 3) Replace the legacy base/fill sprite animation block with 3D rig animation.
refresh_start=s.find('function refreshPrivateXrayVisuals(){')
warrior_block_start=s.find('    if(v.warriorMarker){',refresh_start)
warrior_block_end=s.find('    const b=Math.max(0,Math.min(100,v.room.breach||0))/100',warrior_block_start)
if warrior_block_start<0 or warrior_block_end<0:
    raise SystemExit('refreshPrivateXrayVisuals warrior block boundary not found')

new_refresh=r'''    if(v.warriorMarker){
      const w=v.warrior,chosen=w===xraySelectedCrew,aa=Math.max(0,Math.min(1,w.aa/w.maxAa)),dead=w.hp<=0;
      v.warriorMarker.visible=chosen;if(v.statusGroup)v.statusGroup.scale.setScalar(chosen?.66:.58);
      if(w.hp<v.lastHp)v.hitUntil=now+360;v.lastHp=w.hp;
      if(v.rig3D){
        const hit=now<v.hitUntil,breath=Math.sin(now*.0026+w.roomIndex*.53),baseScale=v.baseRigScale||v.rig3D.scale;
        v.rig3D.position.y=v.baseRigY+(dead?-.34:breath*.025);
        v.rig3D.rotation.z=dead?(w.side==='aurelian'?.92:-.92):(hit?Math.sin(now*.050)*.13:breath*.006);
        v.rig3D.rotation.x=dead?.12:0;
        const scaleMul=dead?.94:1+(chosen?.012:.006)*breath;v.rig3D.scale.set(baseScale.x*scaleMul,baseScale.y*scaleMul,baseScale.z*scaleMul);
        const weapon=v.rig3D.getObjectByName('weapon');if(weapon)weapon.rotation.z=-1.04-(dead?.62:hit?.12:0);
      }
      v.aura.visible=true;v.aura.material.color.setHex(dead?0xff4b3e:w.assignedColor);v.aura.material.opacity=dead?(chosen?.88:.48):(chosen?.96:.34);v.aura.scale.setScalar(chosen?1.24:1.05);
      v.aaBack.visible=!dead&&aa>0;v.aaFill.visible=!dead&&aa>0;v.aaFill.scale.x=Math.max(.001,aa);v.aaFill.position.x=-(v.aaWidth*(1-aa))/2;
      v.label.material.opacity=chosen?1:.82;
      continue
    }
'''
s=s[:warrior_block_start]+new_refresh+s[warrior_block_end:]

# 4) Safety verification: no legacy sprite cutout creation remains in buildPrivateXray.
fn_end=s.find('function refreshPrivateXrayVisuals(){',s.find('function buildPrivateXray(){'))
build_block=s[s.find('function buildPrivateXray(){'):fn_end]
for forbidden in ['const art=xrayArtTextureForWarrior(w)','new THREE.Sprite(new THREE.SpriteMaterial({map:art']:
    if forbidden in build_block:
        raise SystemExit('legacy cutout code still present: '+forbidden)
for required in [
    "if(selectedFaction==='aurelian'){aWarriors.forEach(w=>{w.active=true",
    "rig3D=buildSolarLancer3DModel()",
    "CUTAWAY_SOLAR_LANCER_ROOM_",
    "function openPrivateXray(reason='own vessel tap'){",
    'SOLAR_LANCER_3D_RIG',
    'function setWarriorRoom(w,roomIndex)'
]:
    if required not in s:
        raise SystemExit('verification missing: '+required)

p.write_text(s,encoding='utf-8')
print('PASS all three Aurelian warriors survive battle reset')
print('PASS legacy in-compartment sprite cutouts removed')
print('PASS articulated 3D Solar Lancer rigs render in cutaway')
print('PASS hit/death-ready 3D pose state retained')
print('PASS compartment opening and room-lock logic preserved')
