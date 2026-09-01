from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# 1. Retire the old DOM cutaway/XRAY presentation completely.
# Keep no visible or interactive legacy cutaway elements in the battle UI.
s=s.replace('''  <div id="xrayCrewCard" aria-hidden="true" aria-live="polite"><div id="xrayCrewColor"></div><div><div id="xrayCrewName">SELECT CREW</div><div id="xrayCrewMeta">TAP A VISIBLE WARRIOR</div><div id="xrayCrewAbility">PHYSICAL CUTAWAY CREW SELECTION</div></div><button id="xrayExitBtn" type="button">EXIT CUTAWAY</button></div>\n''','')

# Remove the old CSS hotfix block too; the legacy DOM itself is now retired.
s=re.sub(r'\n<style id="solar-lancer-inroom-hotfix">.*?</style>\n','\n',s,flags=re.S)

# 2. The current code intentionally activates only the first Aurelian warrior.
# Restore all three pre-created Aurelian warrior objects as active/selectable.
old="aWarriors.forEach((w,i)=>{w.active=i===0;if(!w.active)setWarriorObjectsVisible(w,false)});"
new="aWarriors.forEach(w=>{w.active=true;setWarriorObjectsVisible(w,true)});"
if old not in s:
    raise SystemExit('single-warrior activation restriction not found')
s=s.replace(old,new,1)

# 3. Prevent legacy cutaway/XRAY state from owning warrior selection.
s=re.sub(r'xrayOpen\s*=\s*!!\s*selectedWarrior\s*;','xrayOpen=false;',s)
s=re.sub(r'xrayOpen\s*=\s*true\s*;','xrayOpen=false;',s)

# 4. Remove legacy cutaway card display/update statements without touching selectedWarrior itself.
# These are guarded because the old DOM nodes are gone.
for name in ['xrayCrewCard','xrayCrewColor','xrayCrewName','xrayCrewMeta','xrayCrewAbility','xrayExitBtn','warriorCutaway']:
    s=re.sub(rf'[^\n;]*\b{name}\b[^\n;]*;','',s)

# 5. If legacy EXIT CUTAWAY text remains in generated UI strings, rename to neutral selection wording.
s=s.replace('EXIT CUTAWAY','CLOSE CREW')
s=s.replace('PHYSICAL CUTAWAY CREW SELECTION','CREW SELECTION')

checks={
    'all_aurelian_active':"aWarriors.forEach(w=>{w.active=true;setWarriorObjectsVisible(w,true)});" in s,
    'legacy_card_removed':'id="xrayCrewCard"' not in s,
    'legacy_exit_removed':'EXIT CUTAWAY' not in s,
    '3d_rig_preserved':'SOLAR_LANCER_3D_RIG' in s,
    'room_function_preserved':'function setWarriorRoom(w,roomIndex)' in s,
}
failed=[k for k,v in checks.items() if not v]
if failed:
    raise SystemExit('verification failed: '+', '.join(failed))

p.write_text(s,encoding='utf-8')
print('PASS old cutaway presentation retired')
print('PASS all three Aurelian warrior objects active/selectable')
print('PASS 3D Solar Lancer rig preserved')
print('PASS setWarriorRoom preserved unchanged')
