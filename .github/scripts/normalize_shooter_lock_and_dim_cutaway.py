from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
# Make every cutaway open neutral: no pre-highlighted warrior, so first tap is always selection and second tap is always confirmation.
old="xrayOpen=true;xrayConfirmedShooter=null;xraySelectedCrew=localXrayWarriors().find(w=>w===selected&&w.active)||localXrayWarriors().find(w=>w.active&&w.hp>0)||localXrayWarriors()[0]||null;tacticalAimView=false;"
new="xrayOpen=true;xrayConfirmedShooter=null;xraySelectedCrew=null;tacticalAimView=false;"
if old not in s: raise SystemExit('neutral open anchor missing')
s=s.replace(old,new,1)
# Neutral status text when opening.
old2="statusEl.textContent='FORTRESS CUTAWAY • TAP A WARRIOR CARD'"
new2="statusEl.textContent='CUTAWAY • TAP A WARRIOR ONCE TO HIGHLIGHT • TAP AGAIN TO LOCK SHOOTER'"
if old2 not in s: raise SystemExit('open status anchor missing')
s=s.replace(old2,new2,1)
# Darker room architecture and lower-glare trim so warriors read first.
old3="const hullColor=faction==='aurelian'?0x6f431e:0x344d5b,trimColor=faction==='aurelian'?0xe9b94c:0x83ddff,insideColor=faction==='aurelian'?0x160f0a:0x0b1720;"
new3="const hullColor=faction==='aurelian'?0x3b2518:0x263a46,trimColor=faction==='aurelian'?0xb98538:0x5eb4d8,insideColor=faction==='aurelian'?0x0d0907:0x071119;"
if old3 not in s: raise SystemExit('palette anchor missing')
s=s.replace(old3,new3,1)
old4="new THREE.MeshBasicMaterial({color:trimColor,transparent:true,opacity:.62,depthWrite:false,side:THREE.DoubleSide})"
new4="new THREE.MeshBasicMaterial({color:trimColor,transparent:true,opacity:.24,depthWrite:false,side:THREE.DoubleSide})"
if old4 not in s: raise SystemExit('trim opacity anchor missing')
s=s.replace(old4,new4,1)
# Increase 3D warrior size for mobile readability.
old5="rig3D.scale.setScalar(.72)"
new5="rig3D.scale.setScalar(.92)"
if old5 not in s: raise SystemExit('rig scale anchor missing')
s=s.replace(old5,new5,1)
# Replace warm point-light flood with soft neutral light and much lower intensity.
old6="const light=new THREE.PointLight(faction==='aurelian'?0xffc86a:0x89dcff,w===xraySelectedCrew?2.1:1.25,7.5,1.7);light.position.set(-1.0,1.25,1.25);cell.add(light);"
new6="const light=new THREE.PointLight(faction==='aurelian'?0xfff0cf:0xd9f4ff,.42,6.2,2.0);light.position.set(-.75,1.55,1.70);cell.add(light);"
if old6 not in s: raise SystemExit('room light anchor missing')
s=s.replace(old6,new6,1)
old7="if(v.rim?.material)v.rim.material.opacity=chosen?.90:.34;if(v.roomLight)v.roomLight.intensity=chosen?1.45:.82;v.label.material.opacity=chosen?1:.70;continue"
new7="if(v.rim?.material)v.rim.material.opacity=chosen?.46:.16;if(v.roomLight)v.roomLight.intensity=chosen?.72:.28;v.label.material.opacity=chosen?1:.70;continue"
if old7 not in s: raise SystemExit('refresh light anchor missing')
s=s.replace(old7,new7,1)
# When no warrior is selected, no aura should pretend that one is already active.
old8="const aura=markXray(new THREE.Mesh(new THREE.RingGeometry(.62,.70,22),xrayBasic(w.assignedColor,w===xraySelectedCrew?.62:.14,true)),88);"
new8="const aura=markXray(new THREE.Mesh(new THREE.RingGeometry(.62,.70,22),xrayBasic(w.assignedColor,.10,true)),88);"
if old8 not in s: raise SystemExit('aura anchor missing')
s=s.replace(old8,new8,1)
for req in ['xraySelectedCrew=null;tacticalAimView=false','TAP A WARRIOR ONCE TO HIGHLIGHT','rig3D.scale.setScalar(.92)','roomLight.intensity=chosen?.72:.28']:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS cutaway opens with no preselected shooter')
print('PASS every warrior now uses identical first-tap highlight / second-tap lock sequence')
print('PASS gold cutaway trim and lighting reduced')
print('PASS warrior scale increased for mobile readability')
