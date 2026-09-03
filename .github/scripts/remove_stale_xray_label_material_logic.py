from pathlib import Path
import re

p=Path('index.html')
s=p.read_text()
marker='XRAY_LABEL_MATERIAL_STALE_LOGIC_REMOVED_2026_09_03'
if marker in s:
    print('already patched')
    raise SystemExit(0)

# The battle 2-D cleanup replaced cutaway labels with empty THREE.Group objects.
# Any direct .material access on v.label is therefore invalid and can throw every render refresh.
patterns=[
    r"v\.label\.material\.opacity\s*=\s*chosen\?1:\.70\s*;?",
    r"v\.label\.material\.opacity\s*=\s*[^;\n]+;?",
    r"v\.label\.material\.color\.[^;\n]+;?",
]
removed=0
for pat in patterns:
    s,n=re.subn(pat,'',s)
    removed+=n

# Defensive rule: label is a non-rendering placeholder only. If any generic label visibility code remains,
# it may toggle the group but must never assume a material/map exists.
s=s.replace("function makeXrayCrewLabel(w){const label=new THREE.Group();label.name='CUTAWAY_STATUS_LABEL_DISABLED_2D_REMOVED';label.userData.xrayVisual=true;return label}",
            "function makeXrayCrewLabel(w){const label=new THREE.Group();label.name='CUTAWAY_STATUS_LABEL_DISABLED_2D_REMOVED';label.userData.xrayVisual=true;label.visible=false;return label} // XRAY_LABEL_MATERIAL_STALE_LOGIC_REMOVED_2026_09_03")

assert marker in s, 'marker insertion failed'
assert 'v.label.material.opacity' not in s, 'stale label opacity access remains'
assert 'v.label.material.color' not in s, 'stale label color access remains'
assert 'CUTAWAY_STATUS_LABEL_DISABLED_2D_REMOVED' in s

p.write_text(s)
print(f'PASS: removed {removed} stale v.label material accesses; cutaway label remains non-rendering')
# trigger 2026-09-03 recorder fix
