from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Restore the actual compartment-opening function if the prior safe patch disabled it.
old_open="function openPrivateXray(reason='own vessel tap'){\n  return; // legacy cutaway retired; normal warrior selection remains active\n  if(!battleStarted||matchEnded||xrayOpen)return;"
new_open="function openPrivateXray(reason='own vessel tap'){\n  if(!battleStarted||matchEnded||xrayOpen)return;"
if old_open not in s:
    raise SystemExit('disabled compartment-opening entry point not found')
s=s.replace(old_open,new_open,1)

# Keep the old bottom cutaway card retired.
if 'id="xrayCrewCard"' in s:
    raise SystemExit('legacy cutaway card unexpectedly present')

# Keep all three Aurelian warriors active/selectable.
active_line="aWarriors.forEach(w=>{w.active=true;setWarriorObjectsVisible(w,true)});"
if active_line not in s:
    raise SystemExit('three-warrior activation line missing')

# Preserve the articulated 3D rig and room-lock function.
for required in ['SOLAR_LANCER_3D_RIG','function setWarriorRoom(w,roomIndex)']:
    if required not in s:
        raise SystemExit('required gameplay code missing: '+required)

p.write_text(s,encoding='utf-8')
print('PASS compartment opening restored')
print('PASS old cutaway card remains removed')
print('PASS all three warriors remain active/selectable')
print('PASS 3D rig and room assignment preserved')
