from pathlib import Path

p = Path('index.html')
s = p.read_text()
marker = 'ATTACK_ROUTE_IDENTITY_PERSISTENCE_2026_09_03'
if marker in s:
    print('identity persistence patch already present')
    raise SystemExit(0)

old = "const faction=factionForSide(side),deployedIds=(FACTION_META[faction]?.roster||[]).map(x=>x.id);"
new = "const faction=factionForSide(side),deployedIds=(factionModule(faction)?.roster||[]).map(x=>x.id); // ATTACK_ROUTE_IDENTITY_PERSISTENCE_2026_09_03"
assert old in s, 'broken FACTION_META roster lookup not found'
s = s.replace(old, new, 1)

old2 = """  if(!w.passive&&w.active&&w.hp>0&&deployedIds.includes(w.weaponKey)){
    diag('ATTACK ROUTE LOCK',`${source} ${side} ${w.weaponKey} trustedSelected=Y`);return w.weaponKey
  }"""
new2 = """  if(!w.passive&&w.active&&w.hp>0&&deployedIds.includes(w.weaponKey)){
    if(w.modelIdentity!==w.weaponKey)syncWarrior3DIdentity(w,true);
    diag('ATTACK ROUTE LOCK',`${source} ${side} ${w.weaponKey} trustedSelected=Y rig=${w.modelIdentity||'-'}`);return w.weaponKey
  }"""
assert old2 in s, 'attack route lock block not found'
s = s.replace(old2, new2, 1)

assert '(factionModule(faction)?.roster||[]).map(x=>x.id)' in s
assert 'FACTION_META[faction]?.roster' not in s
assert "aurelian:['solar_lancer','sun_disk_gunner','sunadier']" in s
assert 'if(w.modelIdentity!==w.weaponKey)syncWarrior3DIdentity(w,true);' in s

p.write_text(s)
print('PASS: deployed warrior identity now survives attack-route/turn enforcement')
