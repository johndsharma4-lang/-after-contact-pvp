from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Exact legacy cutaway DOM block.
old_card='''  <div id="xrayCrewCard" aria-hidden="true" aria-live="polite"><div id="xrayCrewColor"></div><div><div id="xrayCrewName">SELECT CREW</div><div id="xrayCrewMeta">TAP A VISIBLE WARRIOR</div><div id="xrayCrewAbility">PHYSICAL CUTAWAY CREW SELECTION</div></div><button id="xrayExitBtn" type="button">EXIT CUTAWAY</button></div>\n'''
if old_card not in s:
    raise SystemExit('legacy cutaway card markup not found')
s=s.replace(old_card,'',1)

# Exact temporary hotfix style block left from earlier experiments.
old_hotfix='''<style id="solar-lancer-inroom-hotfix">\n  #warriorCutaway,\n  #xrayBtn {\n    display: none !important;\n    pointer-events: none !important;\n  }\n</style>\n'''
if old_hotfix in s:
    s=s.replace(old_hotfix,'',1)

# Keep DOM references safe even though the card is gone.
old_refs="const xrayCrewCard=document.getElementById('xrayCrewCard'),xrayCrewColor=document.getElementById('xrayCrewColor'),xrayCrewName=document.getElementById('xrayCrewName'),xrayCrewMeta=document.getElementById('xrayCrewMeta'),xrayCrewAbility=document.getElementById('xrayCrewAbility'),xrayExitBtn=document.getElementById('xrayExitBtn');"
new_refs="const xrayCrewCard=null,xrayCrewColor=null,xrayCrewName=null,xrayCrewMeta=null,xrayCrewAbility=null,xrayExitBtn=null;"
if old_refs not in s:
    raise SystemExit('legacy cutaway DOM reference line not found')
s=s.replace(old_refs,new_refs,1)

# Do not let the old cutaway become a touch-control owner.
old_control="const isGameControlTarget=t=>!!t?.closest?.('#mpOverlay button,#mpOverlay a,#mpOverlay input,#characterOverlay button,#deployOverlay button,.deployCard,.deploySlot,#movePad button,#ndaOverlay button,#ndaOverlay input,#ownerDbgPanel,#ownerDbgBtn,#xrayCrewCard button');"
new_control="const isGameControlTarget=t=>!!t?.closest?.('#mpOverlay button,#mpOverlay a,#mpOverlay input,#characterOverlay button,#deployOverlay button,.deployCard,.deploySlot,#movePad button,#ndaOverlay button,#ndaOverlay input,#ownerDbgPanel,#ownerDbgBtn');"
if old_control in s:
    s=s.replace(old_control,new_control,1)

# Enable all three pre-created Aurelian warriors. Their room indices are not changed.
old_active="aWarriors.forEach((w,i)=>{w.active=i===0;if(!w.active)setWarriorObjectsVisible(w,false)});"
new_active="aWarriors.forEach(w=>{w.active=true;setWarriorObjectsVisible(w,true)});"
if old_active not in s:
    raise SystemExit('single-warrior activation restriction not found')
s=s.replace(old_active,new_active,1)

# Disable the legacy private-XRAY entry point without deleting the surrounding code.
old_open="function openPrivateXray(reason='own vessel tap'){\n  if(!battleStarted||matchEnded||xrayOpen)return;"
new_open="function openPrivateXray(reason='own vessel tap'){\n  return; // legacy cutaway retired; normal warrior selection remains active\n  if(!battleStarted||matchEnded||xrayOpen)return;"
if old_open not in s:
    raise SystemExit('openPrivateXray entry point not found')
s=s.replace(old_open,new_open,1)

checks={
    'all_aurelian_active':new_active in s,
    'legacy_card_removed':'id="xrayCrewCard"' not in s,
    'xray_entry_disabled':'legacy cutaway retired' in s,
    '3d_rig_preserved':'SOLAR_LANCER_3D_RIG' in s,
    'room_function_preserved':'function setWarriorRoom(w,roomIndex)' in s,
}
failed=[k for k,v in checks.items() if not v]
if failed:
    raise SystemExit('verification failed: '+', '.join(failed))

p.write_text(s,encoding='utf-8')
print('PASS legacy cutaway DOM removed exactly')
print('PASS legacy cutaway entry disabled')
print('PASS all three Aurelian warriors active/selectable')
print('PASS 3D rig preserved')
print('PASS warrior room assignment code untouched')
