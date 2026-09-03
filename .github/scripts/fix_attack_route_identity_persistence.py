from pathlib import Path

p = Path('index.html')
s = p.read_text()
marker = 'ATTACK_ROUTE_IDENTITY_PERSISTENCE_2026_09_03'
if marker in s:
    print('identity persistence patch already present')
    raise SystemExit(0)

old = "const faction=factionForSide(side),deployedIds=(FACTION_META[faction]?.roster||[]).map(x=>x.id);"
new = "const faction=factionForSide(side),deployedIds=(factionModule(faction)?.roster||[]).map