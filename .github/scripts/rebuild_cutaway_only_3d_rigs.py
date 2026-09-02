from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
anchor='function buildPrivateXray(){'
pos=s.find(anchor)
if pos<0: raise SystemExit('buildPrivateXray anchor missing')
if 'function buildCutawayOnlyWarrior3D(type)' not in s:
    helper=r'''function buildCutawayOnlyWarrior3D(type){
  const g=new THREE.Group();g.name=`CUTAWAY_ONLY_${String(type).toUpperCase()}`;g.visible=true;
  const mat=(color)=>new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false});
  const gold=mat(0xf2bd46),ivory=mat(0xfff3cf),dark=mat(0x4b2d14),hot=mat(0xffff88),amber=mat(0xff8a2b);
  const add=(geo,m,x,y,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.visible=true;o.frustumCulled=false;o.renderOrder=110;g.add(o);return o};
  add(new THREE.CylinderGeometry(.52,.67,1.50,12),gold,0,.45,.12);
  const chest=add(new THREE.SphereGeometry(.60,18,14),ivory,0,1.22,.16);chest.scale.set(1,.72,.66);
  add(new THREE.SphereGeometry(.38,18,14),ivory,0,2.00,.18);
  add(new THREE.BoxGeometry(.48,.13,.18),hot,0,2.02,.52);
  for(const sx of[-1,1]){
    add(new THREE.SphereGeometry(.30,12,10),gold,sx*.68,1.28,.12);
    const arm=add(new THREE.CylinderGeometry(.14,.17,.78,9),ivory,sx*.79,.70,.14);arm.rotation.z=sx*.10;
    add(new THREE.BoxGeometry(.30,.34,.34),gold,sx*.82,.20,.20);
    add(new THREE.CylinderGeometry(.18,.22,1.05,9),gold,sx*.24,-.55,.10);
    add(new THREE.BoxGeometry(.31,.24,.50),dark,sx*.24,-1.14,.22);
  }
  if(type==='solar_lancer'){
    const staff=add(new THREE.CylinderGeometry(.055,.075,3.35,10),hot,.92,.48,.28);staff.rotation.z=-.18;
    const tip=add(new THREE.ConeGeometry(.18,.72,10),ivory,1.20,2.05,.28);tip.rotation.z=-.18;
    const cape=add(new THREE.BoxGeometry(.92,1.55,.07),mat(0xc88727),-.10,.48,-.28);cape.rotation.z=.06;
  }else if(type==='sun_disk_gunner'){
    for(const sx of[-1,1]){const d=add(new THREE.TorusGeometry(.39,.075,10,32),hot,sx*.90,.23,.52);d.rotation.x=Math.PI/2}
    const halo=add(new THREE.TorusGeometry(.48,.055,10,32),hot,0,2.00,-.18);halo.rotation.x=.12;
  }else if(type==='sunadier'){
    const chain=new THREE.Group();chain.position.set(.72,.42,.38);chain.visible=true;g.add(chain);
    for(let i=0;i<8;i++){const l=new THREE.Mesh(new THREE.TorusGeometry(.08,.025,6,12),gold);l.position.set(.13*i,.08*i,0);l.visible=true;l.frustumCulled=false;l.renderOrder=111;chain.add(l)}
    const grenade=new THREE.Mesh(new THREE.SphereGeometry(.30,14,12),amber);grenade.position.set(1.15,.62,.04);grenade.visible=true;grenade.frustumCulled=false;grenade.renderOrder=112;chain.add(grenade);
  }
  g.traverse(o=>{o.visible=true;if(o.isMesh){o.frustumCulled=false;o.renderOrder=Math.max(o.renderOrder||0,110)}});
  return g
}
'''
    s=s[:pos]+helper+s[pos:]
old="const rig3D=buildAurelianWarrior3DModel(w.weaponKey);rig3D.name=`CUTAWAY_${w.weaponKey.toUpperCase()}_ROOM_${i+1}`;rig3D.position.set(0,-.10,1.34);rig3D.scale.setScalar(.88);rig3D.rotation.y=w.side==='aurelian'?Math.PI:0;rig3D.traverse(o=>{o.userData=o.userData||{};o.userData.xrayVisual=true;if(o.isMesh){o.frustumCulled=false;o.renderOrder=94;if(o.material){const src=o.material;const c=src.color?.clone?.()||new THREE.Color(0xffd86b);o.material=new THREE.MeshBasicMaterial({color:c,transparent:false,opacity:1,side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false});}}});marker.add(rig3D);"
new="const rig3D=buildCutawayOnlyWarrior3D(w.weaponKey);rig3D.name=`CUTAWAY_${w.weaponKey.toUpperCase()}_ROOM_${i+1}`;rig3D.position.set(0,-.02,1.18);rig3D.scale.setScalar(.72);rig3D.rotation.y=0;rig3D.visible=true;rig3D.traverse(o=>{o.userData=o.userData||{};o.userData.xrayVisual=true;o.visible=true;if(o.isMesh){o.frustumCulled=false;o.renderOrder=110}});marker.add(rig3D);"
if old not in s: raise SystemExit('current cutaway rig block missing')
s=s.replace(old,new,1)
old_diag="xrayScanBand=null;xrayGroup=g;localCommandVessel().add(g);refreshPrivateXrayVisuals();diag('FULL 3X3 CREW CUTAWAY',`warriors=${crew.map(w=>w.weaponKey+'@R'+(w.roomIndex+1)).join(',')}`)"
new_diag="xrayScanBand=null;xrayGroup=g;localCommandVessel().add(g);g.updateWorldMatrix(true,true);refreshPrivateXrayVisuals();for(const v of xrayRoomVisuals){if(v.rig3D){const box=new THREE.Box3().setFromObject(v.rig3D),size=box.getSize(new THREE.Vector3()),wp=v.rig3D.getWorldPosition(new THREE.Vector3());diag('CUTAWAY 3D RIG',`${v.warrior.weaponKey} visible=${v.rig3D.visible?'Y':'N'} children=${v.rig3D.children.length} size=${size.x.toFixed(2)},${size.y.toFixed(2)},${size.z.toFixed(2)} world=${wp.x.toFixed(1)},${wp.y.toFixed(1)},${wp.z.toFixed(1)}`)}}diag('FULL 3X3 CREW CUTAWAY',`warriors=${crew.map(w=>w.weaponKey+'@R'+(w.roomIndex+1)).join(',')}`)"
if old_diag not in s: raise SystemExit('cutaway diagnostic anchor missing')
s=s.replace(old_diag,new_diag,1)
for req in ['function buildCutawayOnlyWarrior3D(type)','buildCutawayOnlyWarrior3D(w.weaponKey)','CUTAWAY 3D RIG','o.visible=true']:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS cutaway no longer depends on battle-model visibility state')
print('PASS three independent cutaway-only 3D warrior rigs created')
print('PASS all rig children explicitly visible and frustum culling disabled')
print('PASS runtime diagnostics report 3D rig bounds/world position')
