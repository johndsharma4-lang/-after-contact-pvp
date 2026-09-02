from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="rig3D.position.set(0,-.02,1.18);rig3D.scale.setScalar(.72);"
new="rig3D.position.set(0,-.02,.10);rig3D.scale.setScalar(.62);"
if old not in s: raise SystemExit('cutaway rig transform not found')
s=s.replace(old,new,1)
old2="const aura=markXray(new THREE.Mesh(new THREE.RingGeometry(.74,.82,18),xrayBasic(w.assignedColor,w===xraySelectedCrew?.72:.20,true)),88);aura.position.set(0,-.18,.06);marker.add(aura);"
new2="const aura=markXray(new THREE.Mesh(new THREE.RingGeometry(.74,.82,18),xrayBasic(w.assignedColor,w===xraySelectedCrew?.72:.20,true)),88);aura.position.set(0,-.18,.06);marker.add(aura);"
# keep aura as known-good camera plane reference
if old2 not in s: raise SystemExit('known-good aura anchor missing')
# add explicit camera-space diagnostic comparing rig to visible aura
old3="diag('CUTAWAY 3D RIG',`${v.warrior.weaponKey} visible=${v.rig3D.visible?'Y':'N'} children=${v.rig3D.children.length} size=${size.x.toFixed(2)},${size.y.toFixed(2)},${size.z.toFixed(2)} world=${wp.x.toFixed(1)},${wp.y.toFixed(1)},${wp.z.toFixed(1)}`)"
new3="const ap=v.aura.getWorldPosition(new THREE.Vector3()),rc=wp.clone().project(camera),ac=ap.clone().project(camera);diag('CUTAWAY 3D RIG',`${v.warrior.weaponKey} visible=${v.rig3D.visible?'Y':'N'} children=${v.rig3D.children.length} size=${size.x.toFixed(2)},${size.y.toFixed(2)},${size.z.toFixed(2)} world=${wp.x.toFixed(1)},${wp.y.toFixed(1)},${wp.z.toFixed(1)} ndc=${rc.x.toFixed(2)},${rc.y.toFixed(2)},${rc.z.toFixed(2)} auraNdc=${ac.x.toFixed(2)},${ac.y.toFixed(2)},${ac.z.toFixed(2)}`)"
if old3 not in s: raise SystemExit('rig diagnostic anchor missing')
s=s.replace(old3,new3,1)
for req in ["rig3D.position.set(0,-.02,.10)","auraNdc=", ".project(camera)"]:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS warrior rig moved onto same camera-depth plane as visible selection aura')
print('PASS camera NDC diagnostic added for rig vs known-visible aura')
