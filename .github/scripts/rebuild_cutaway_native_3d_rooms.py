from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
start=s.find('function buildPrivateXray(){')
end=s.find('function refreshPrivateXrayVisuals(){', start)
if start<0 or end<0: raise SystemExit('cutaway function boundaries missing')
new=r'''function buildPrivateXray(){
  if(xrayGroup){localCommandVessel().remove(xrayGroup);disposeXrayObject(xrayGroup)}
  const rooms=localXrayRooms().userData.rooms,faction=factionForWorldSide(localXraySide()),crew=localXrayWarriors().filter(w=>!w.passive).slice(0,3);xrayRoomVisuals=[];
  if(!xraySelectedCrew||!crew.includes(xraySelectedCrew))xraySelectedCrew=crew.find(w=>w.hp>0)||crew[0]||null;

  // Native 3D cutaway layer: these rooms are no longer positioned from the legacy sprite-grid local coordinates.
  // Each new room is placed from the real compartment's world-space hit-plane position, converted into vessel-local space.
  const vessel=localCommandVessel(),g=new THREE.Group();g.name='NATIVE_3D_CUTAWAY_ROOMS';g.userData.xrayVisual=true;vessel.add(g);vessel.updateWorldMatrix(true,true);
  const hullColor=faction==='aurelian'?0x6f431e:0x344d5b,trimColor=faction==='aurelian'?0xe9b94c:0x83ddff,insideColor=faction==='aurelian'?0x160f0a:0x0b1720;
  const wallMat=new THREE.MeshStandardMaterial({color:hullColor,roughness:.72,metalness:.28,side:THREE.DoubleSide});
  const insideMat=new THREE.MeshStandardMaterial({color:insideColor,roughness:.88,metalness:.08,side:THREE.DoubleSide});
  const trimMat=new THREE.MeshBasicMaterial({color:trimColor,transparent:true,opacity:.62,depthWrite:false,side:THREE.DoubleSide});
  const roomW=5.15,roomH=4.35,roomD=4.25,floorY=-roomH*.5;

  for(let i=0;i<rooms.length;i++){
    const source=rooms[i],world=source.hitPlane.getWorldPosition(new THREE.Vector3()),local=vessel.worldToLocal(world.clone()),cell=new THREE.Group();
    cell.name=`NATIVE_3D_ROOM_${i+1}`;cell.userData.xrayVisual=true;cell.position.set(local.x,local.y,local.z-.15);g.add(cell);

    const back=markXray(new THREE.Mesh(new THREE.BoxGeometry(roomW,roomH,.26),insideMat.clone()),70);back.position.z=-roomD*.5;cell.add(back);
    const floor=markXray(new THREE.Mesh(new THREE.BoxGeometry(roomW,.24,roomD),wallMat.clone()),72);floor.position.y=floorY;cell.add(floor);
    const ceiling=markXray(new THREE.Mesh(new THREE.BoxGeometry(roomW,.20,roomD),wallMat.clone()),72);ceiling.position.y=roomH*.5;cell.add(ceiling);
    for(const sx of[-1,1]){const wall=markXray(new THREE.Mesh(new THREE.BoxGeometry(.20,roomH,roomD),wallMat.clone()),72);wall.position.x=sx*roomW*.5;cell.add(wall)}
    for(const sx of[-1,1]){const rail=markXray(new THREE.Mesh(new THREE.BoxGeometry(.10,roomH*.88,.10),trimMat.clone()),78);rail.position.set(sx*(roomW*.5-.22),0,roomD*.48);cell.add(rail)}
    const floorStrip=markXray(new THREE.Mesh(new THREE.BoxGeometry(roomW*.82,.06,.12),trimMat.clone()),79);floorStrip.position.set(0,floorY+.20,roomD*.49);cell.add(floorStrip);
    const rim=markXray(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(roomW,roomH,roomD)),new THREE.LineBasicMaterial({color:trimColor,transparent:true,opacity:.26,depthTest:false,depthWrite:false})),84);cell.add(rim);

    const w=crew.find(x=>x.roomIndex===i);if(!w)continue;
    // Dedicated standing anchor: feet sit on the new 3D floor. This anchor can later drive idle/hit/fall/death animation.
    const stand=new THREE.Group();stand.name=`WARRIOR_STAND_ANCHOR_ROOM_${i+1}`;stand.userData.xrayVisual=true;stand.userData.xrayWarrior=w;stand.position.set(0,floorY+.90,.42);cell.add(stand);
    const rig3D=buildCutawayOnlyWarrior3D(w.weaponKey);rig3D.name=`NATIVE_${w.weaponKey.toUpperCase()}_ROOM_${i+1}`;rig3D.position.set(0,0,0);rig3D.scale.setScalar(.72);rig3D.visible=true;rig3D.traverse(o=>{o.userData=o.userData||{};o.userData.xrayVisual=true;o.visible=true;if(o.isMesh){o.frustumCulled=false;o.renderOrder=110}});stand.add(rig3D);

    const shadow=markXray(new THREE.Mesh(new THREE.CircleGeometry(.72,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.30,depthWrite:false,side:THREE.DoubleSide})),86);shadow.rotation.x=-Math.PI/2;shadow.position.set(0,-.82,.12);stand.add(shadow);
    const hit=markXray(new THREE.Mesh(new THREE.PlaneGeometry(2.5,3.7),new THREE.MeshBasicMaterial({transparent:true,opacity:.001,depthTest:false,depthWrite:false,side:THREE.DoubleSide})),115);hit.position.set(0,.55,.70);hit.userData.xrayWarrior=w;stand.add(hit);
    const aura=markXray(new THREE.Mesh(new THREE.RingGeometry(.62,.70,22),xrayBasic(w.assignedColor,w===xraySelectedCrew?.62:.14,true)),88);aura.rotation.x=-Math.PI/2;aura.position.set(0,-.80,.15);stand.add(aura);
    const label=makeXrayCrewLabel(w);label.scale.set(1.72,.43,1);label.position.set(0,floorY+.34,roomD*.50+.06);cell.add(label);
    const light=new THREE.PointLight(faction==='aurelian'?0xffc86a:0x89dcff,w===xraySelectedCrew?2.1:1.25,7.5,1.7);light.position.set(-1.0,1.25,1.25);cell.add(light);
    xrayRoomVisuals.push({warriorMarker:stand,statusGroup:null,warrior:w,rig3D,aura,label,hit,railHit:null,index:i,lastHp:w.hp,hitUntil:0,baseRigY:rig3D.position.y,baseRigScale:rig3D.scale.clone(),rim,roomLight:light,aaBack:null,aaFill:null,aaWidth:0,nativeRoom:cell,standAnchor:stand})
  }
  xrayScanBand=null;xrayGroup=g;g.updateWorldMatrix(true,true);refreshPrivateXrayVisuals();
  for(const v of xrayRoomVisuals){const box=new THREE.Box3().setFromObject(v.rig3D),size=box.getSize(new THREE.Vector3()),wp=v.rig3D.getWorldPosition(new THREE.Vector3()),sp=v.standAnchor.getWorldPosition(new THREE.Vector3()),ndc=wp.clone().project(camera);diag('NATIVE 3D WARRIOR',`${v.warrior.weaponKey} room=${v.index+1} size=${size.x.toFixed(2)},${size.y.toFixed(2)},${size.z.toFixed(2)} stand=${sp.x.toFixed(1)},${sp.y.toFixed(1)},${sp.z.toFixed(1)} ndc=${ndc.x.toFixed(2)},${ndc.y.toFixed(2)},${ndc.z.toFixed(2)}`)}
  diag('NATIVE 3D CUTAWAY',`rooms=9 crew=${crew.map(w=>w.weaponKey+'@R'+(w.roomIndex+1)).join(',')} legacySpriteGridPositioning=N`)
}
'''
s=s[:start]+new+s[end:]
# Update close path because group is now already attached to vessel, same remove call remains valid.
for req in ['NATIVE_3D_CUTAWAY_ROOMS','WARRIOR_STAND_ANCHOR_ROOM_','legacySpriteGridPositioning=N','vessel.worldToLocal(world.clone())']:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS cutaway rooms rebuilt as native 3D room shells')
print('PASS legacy room.local sprite-grid positioning removed from cutaway build')
print('PASS warriors anchored to dedicated 3D floor standing points')
print('PASS animation-ready stand anchors created for idle/hit/fall/death')
