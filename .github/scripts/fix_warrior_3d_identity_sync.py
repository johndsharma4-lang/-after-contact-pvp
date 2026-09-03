from pathlib import Path
import re

path = Path('index.html')
s = path.read_text()

if 'WARRIOR_3D_IDENTITY_SYNC_2026_09_02' in s:
    print('WARRIOR_3D_IDENTITY_SYNC already present')
    raise SystemExit(0)

# 1) Add distinct Earth battle/cutaway rigs and route every faction through the correct 3-D identity.
needle = "function buildCutawayOnlyWarrior3D(type){"
assert needle in s, 'buildCutawayOnlyWarrior3D not found'

builders = r'''
// WARRIOR_3D_IDENTITY_SYNC_2026_09_02
// These are deliberately low-detail battle rigs, not character-card artwork. Their purpose is to keep
// each deployed warrior visually distinct and bound to its authoritative weaponKey across turn rebuilds.
function buildEarthBombardierBattle3D(){
  const g=new THREE.Group();g.name='EARTH_BOMBARDIER_3D_RIG';
  const armor=new THREE.MeshStandardMaterial({color:0x526b7a,metalness:.58,roughness:.43}),dark=new THREE.MeshStandardMaterial({color:0x202a31,metalness:.64,roughness:.38}),accent=new THREE.MeshStandardMaterial({color:0x74d9ff,emissive:0x1f6d96,emissiveIntensity:.65,metalness:.35,roughness:.28});
  const add=(geo,mat,name,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,mat);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
  add(new THREE.BoxGeometry(1.10,1.25,.72),armor,'BOMBARDIER_TORSO',0,.72,0);add(new THREE.SphereGeometry(.34,14,10),dark,'BOMBARDIER_HELMET',0,1.73,.02);add(new THREE.BoxGeometry(.52,.13,.12),accent,'BOMBARDIER_VISOR',0,1.74,.31);
  for(const sx of[-1,1]){add(new THREE.BoxGeometry(.38,.62,.42),armor,'BOMBARDIER_ARM',sx*.72,.72,.02);add(new THREE.CylinderGeometry(.15,.18,.86,8),dark,'BOMBARDIER_LEG',sx*.26,-.42,0)}
  for(const sx of[-1,1]){const pod=add(new THREE.BoxGeometry(.42,.78,.58),dark,'HE9_POD',sx*.70,1.38,-.24);for(let r=0;r<3;r++){const tube=add(new THREE.CylinderGeometry(.075,.075,.44,8),accent,'HE9_TUBE',sx*.70,1.55-r*.17,.05);tube.rotation.x=Math.PI/2}}
  const barrel=add(new THREE.CylinderGeometry(.08,.11,1.65,9),dark,'BOMBARDIER_LAUNCHER',.62,.52,.42);barrel.rotation.z=-1.10;const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.set(1.24,.88,.50);g.add(muzzle);g.userData.muzzle=muzzle;g.userData.animationReady=true;return g
}
function buildEarthSniperBattle3D(){
  const g=new THREE.Group();g.name='EARTH_SNIPER_3D_RIG';
  const armor=new THREE.MeshStandardMaterial({color:0x77828a,metalness:.42,roughness:.52}),cloth=new THREE.MeshStandardMaterial({color:0x343b40,metalness:.10,roughness:.82}),accent=new THREE.MeshStandardMaterial({color:0xe7d2a4,emissive:0x5f4924,emissiveIntensity:.42,metalness:.34,roughness:.34});
  const add=(geo,mat,name,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,mat);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
  add(new THREE.CylinderGeometry(.38,.46,1.35,9),cloth,'SNIPER_TORSO',0,.67,0);add(new THREE.SphereGeometry(.30,14,10),armor,'SNIPER_HELMET',0,1.70,0);add(new THREE.BoxGeometry(.45,.11,.12),accent,'SNIPER_OPTIC',.08,1.72,.30);
  for(const sx of[-1,1]){add(new THREE.CylinderGeometry(.11,.14,.72,8),armor,'SNIPER_ARM',sx*.50,.68,0);add(new THREE.CylinderGeometry(.13,.16,.92,8),cloth,'SNIPER_LEG',sx*.20,-.48,0)}
  const rifle=add(new THREE.CylinderGeometry(.045,.07,2.65,8),accent,'SNIPER_RIFLE',.52,.70,.42);rifle.rotation.z=-1.23;const stock=add(new THREE.BoxGeometry(.52,.24,.22),cloth,'SNIPER_STOCK',-.18,.39,.31);stock.rotation.z=-.20;const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.set(1.62,1.02,.45);g.add(muzzle);g.userData.muzzle=muzzle;g.userData.animationReady=true;return g
}
function buildEarthControllerBattle3D(){
  const g=new THREE.Group();g.name='EARTH_COMBAT_CONTROLLER_3D_RIG';
  const armor=new THREE.MeshStandardMaterial({color:0x39576a,metalness:.46,roughness:.46}),dark=new THREE.MeshStandardMaterial({color:0x1f2930,metalness:.30,roughness:.66}),accent=new THREE.MeshStandardMaterial({color:0x62cfff,emissive:0x176b98,emissiveIntensity:1.05,metalness:.22,roughness:.26});
  const add=(geo,mat,name,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,mat);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
  add(new THREE.BoxGeometry(.92,1.22,.64),armor,'CONTROLLER_TORSO',0,.68,0);add(new THREE.SphereGeometry(.31,14,10),dark,'CONTROLLER_HELMET',0,1.70,0);add(new THREE.BoxGeometry(.46,.12,.11),accent,'CONTROLLER_VISOR',0,1.70,.29);
  for(const sx of[-1,1]){add(new THREE.CylinderGeometry(.12,.15,.74,8),armor,'CONTROLLER_ARM',sx*.58,.66,0);add(new THREE.CylinderGeometry(.14,.17,.90,8),dark,'CONTROLLER_LEG',sx*.22,-.47,0)}
  add(new THREE.BoxGeometry(.70,.92,.30),dark,'TAC_LINK_PACK',0,.82,-.46);const antenna=add(new THREE.CylinderGeometry(.025,.025,1.15,6),accent,'TAC_LINK_ANTENNA',.28,1.72,-.38);antenna.rotation.z=-.12;add(new THREE.BoxGeometry(.62,.42,.09),accent,'TACTICAL_TABLET',.52,.58,.43).rotation.z=-.22;const muzzle=new THREE.Object3D();muzzle.name='MUZZLE';muzzle.position.set(.86,.66,.49);g.add(muzzle);g.userData.muzzle=muzzle;g.userData.animationReady=true;return g
}
'''

replacement = builders + r'''
function buildCutawayOnlyWarrior3D(type){
  if(type==='bombardier')return buildEarthBombardierBattle3D();
  if(type==='sniper')return buildEarthSniperBattle3D();
  if(type==='combat_controller')return buildEarthControllerBattle3D();
  if(type==='acid_brute'||type==='spatial_disintegrator'){const alien=buildStarter3DModel(type);alien.userData.animationReady=true;return alien}
'''
s = s.replace(needle, replacement, 1)

# 2) Make persistent battle model identity follow weaponKey. This prevents stale Solar Lancer rigs.
needle = "function configureFactionTeam(side,faction,requestedTypes=null){"
assert needle in s, 'configureFactionTeam not found'
sync_helper = r'''
function syncWarrior3DIdentity(w,force=false){
  if(!w||!w.anchor)return null;const type=w.weaponKey;
  if(!force&&w.model3D&&w.modelIdentity===type)return w.model3D;
  if(w.model3D){w.model3D.parent?.remove(w.model3D);w.model3D=null}
  const model=buildCutawayOnlyWarrior3D(type);if(!model){diag('WARRIOR RIG ERROR',`${w.side} slot=${w.index} type=${type} builder=null`);return null}
  model.name=`BATTLE_${String(type).toUpperCase()}_${w.side}_${w.index}`;model.scale.setScalar(.52);model.position.copy(w.anchor.position);model.position.z+=1.35;model.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.renderOrder=Math.max(o.renderOrder||0,24)}});if(w.side==='aurelian')model.rotation.y=Math.PI;w.roomGroup.add(model);w.model3D=model;w.modelIdentity=type;
  diag('WARRIOR RIG SYNC',`${w.side} slot=${w.index} type=${type} model=${model.name}`);return model
}
'''
s = s.replace(needle, sync_helper + needle, 1)

# 3) Profile changes must update both data identity and actual 3-D rig identity.
old = """function applyProfileToWarrior(w,type){\n  const profile=STARTER_PROFILES[type]||STARTER_PROFILES.solar_lancer;if(!w)return;\n  w.weaponKey=type;w.faction=profile.faction;w.maxHp=profile.stats?.hp||100;w.hp=Math.min(w.hp,w.maxHp);if(w.nameText)w.nameText.textContent=profile.name;\n  // Battle identity is data + 3-D rig only. Character-card artwork is UI and is never injected into combat.\n}"""
new = """function applyProfileToWarrior(w,type){\n  const profile=STARTER_PROFILES[type]||STARTER_PROFILES.solar_lancer;if(!w)return;const previous=w.weaponKey;\n  w.weaponKey=type;w.faction=profile.faction;w.maxHp=profile.stats?.hp||100;w.hp=Math.min(w.hp,w.maxHp);if(w.nameText)w.nameText.textContent=profile.name;\n  // Battle identity is data + matching 3-D rig. Never leave a stale model attached after weaponKey changes.\n  syncWarrior3DIdentity(w,previous!==type||w.modelIdentity!==type);\n}"""
assert old in s, 'applyProfileToWarrior block changed'
s = s.replace(old, new, 1)

# 4) Remove the old one-off Solar-Lancer-only model attachment and initialize every slot through identity sync.
pattern = re.compile(r"const aWarriors=makeWarriors\('aurelian',aRooms,\[4,5,3\],lancerTex,'solar_lancer'\);const eWarriors=makeWarriors\('earth',eRooms,\[5,4,3\],bombTex,'bombardier'\);\nfor\(const w of aWarriors\)\{.*?\n\}\nconst aShadows=\[\],eShadows=\[\];", re.S)
m = pattern.search(s)
assert m, 'legacy Solar-Lancer-only initialization loop not found'
replacement = """const aWarriors=makeWarriors('aurelian',aRooms,[4,5,3],lancerTex,'solar_lancer');const eWarriors=makeWarriors('earth',eRooms,[5,4,3],bombTex,'bombardier');\nfor(const w of [...aWarriors,...eWarriors])syncWarrior3DIdentity(w,true);\nconst aShadows=[],eShadows=[];"""
s = s[:m.start()] + replacement + s[m.end():]

# 5) Aurelian authority must recognize all three deployed Aurelian identities, not only Solar Lancer.
old = "const allowed={earth:['bombardier','sniper','combat_controller'],aurelian:['solar_lancer'],lizard:['acid_brute'],gray:['spatial_disintegrator']};"
new = "const allowed={earth:['bombardier','sniper','combat_controller'],aurelian:['solar_lancer','sun_disk_gunner','sunadier'],lizard:['acid_brute'],gray:['spatial_disintegrator']};"
assert old in s, 'authoritative allowed map not found'
s = s.replace(old, new, 1)

# Safety checks.
assert "aurelian:['solar_lancer','sun_disk_gunner','sunadier']" in s
assert 'syncWarrior3DIdentity(w,previous!==type||w.modelIdentity!==type)' in s
assert "if(type==='bombardier')return buildEarthBombardierBattle3D()" in s
assert "if(type==='sniper')return buildEarthSniperBattle3D()" in s
assert "if(type==='combat_controller')return buildEarthControllerBattle3D()" in s
assert 'for(const w of [...aWarriors,...eWarriors])syncWarrior3DIdentity(w,true);' in s
assert 'for(const w of aWarriors){\n  if(w.weaponKey===\'solar_lancer\')' not in s

path.write_text(s)
print('PASS: warrior 3-D identity sync repaired for Aurelian/Earth/alien battle slots')
