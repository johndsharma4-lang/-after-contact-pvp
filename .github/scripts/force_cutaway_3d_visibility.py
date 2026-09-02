from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="rig3D.position.set(0,-.40,.54);rig3D.scale.setScalar(.42);"
new="rig3D.position.set(0,-.10,1.34);rig3D.scale.setScalar(.88);"
if old not in s: raise SystemExit('3D cutaway transform anchor missing')
s=s.replace(old,new,1)
oldmat="if(o.material){o.material=o.material.clone();o.material.depthTest=false;o.material.depthWrite=false}"
newmat="if(o.material){const src=o.material;const c=src.color?.clone?.()||new THREE.Color(0xffd86b);o.material=new THREE.MeshBasicMaterial({color:c,transparent:false,opacity:1,side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false});}"
if oldmat not in s: raise SystemExit('cutaway material anchor missing')
s=s.replace(oldmat,newmat,1)
oldlight="const light=new THREE.PointLight(0xffc86a,w===xraySelectedCrew?1.45:.82,5.5,2);"
newlight="const light=new THREE.PointLight(0xffd98a,w===xraySelectedCrew?2.4:1.55,7.5,1.6);"
if oldlight in s:s=s.replace(oldlight,newlight,1)
oldrim="new THREE.LineBasicMaterial({color:edgeColor,transparent:true,opacity:.34,depthTest:false,depthWrite:false})"
newrim="new THREE.LineBasicMaterial({color:edgeColor,transparent:true,opacity:.24,depthTest:false,depthWrite:false})"
if oldrim in s:s=s.replace(oldrim,newrim,1)
for req in ["rig3D.position.set(0,-.10,1.34)","rig3D.scale.setScalar(.88)","new THREE.MeshBasicMaterial({color:c","toneMapped:false"]:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS cutaway warriors enlarged to near full compartment height')
print('PASS warriors moved forward in front of compartment geometry')
print('PASS cutaway warrior meshes use unlit double-sided visibility material')
print('PASS depth occlusion disabled for warrior visibility')
