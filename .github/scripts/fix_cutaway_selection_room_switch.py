from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="""function selectXrayCrew(w){
  if(!xrayOpen||!w||!w.active)return;if(w.weaponKey==='combat_controller'&&(supportCooldown[w.side]||0)>0){statusEl.textContent=`COMBAT CONTROLLER • LOCKED FOR ${supportCooldown[w.side]} MORE FULL TURN${supportCooldown[w.side]===1?'':'S'}`;diag('CONTROLLER CUTAWAY LOCK',`${w.side} remaining=${supportCooldown[w.side]} selectable=N`);return}xraySelectedCrew=w;if(w.hp>0&&!w.passive)selectWarrior(w);refreshPrivateXrayVisuals();
  const profile=STARTER_PROFILES[w.weaponKey],name=w.passive?'PASSIVE CREW':(profile?.name||'WARRIOR'),state=w.hp<=0?'DEAD':'ALIVE';statusEl.textContent=`CUTAWAY • ${name} • ${state} • ROOM ${w.roomIndex+1} • AA ${Math.round(w.aa)}/${w.maxAa} • HP ${Math.round(w.hp)}/${w.maxHp}`;diag('CUTAWAY WARRIOR SELECT',`${name} state=${state} room=${w.roomIndex+1} aa=${Math.round(w.aa)} hp=${Math.round(w.hp)} passive=${w.passive?'Y':'N'}`)
}"""
new="""function selectXrayCrew(w){
  if(!xrayOpen||!w||!w.active)return;
  if(w.weaponKey==='combat_controller'&&(supportCooldown[w.side]||0)>0){statusEl.textContent=`COMBAT CONTROLLER • LOCKED FOR ${supportCooldown[w.side]} MORE FULL TURN${supportCooldown[w.side]===1?'':'S'}`;diag('CONTROLLER CUTAWAY LOCK',`${w.side} remaining=${supportCooldown[w.side]} selectable=N`);return}
  const changed=xraySelectedCrew!==w;
  xraySelectedCrew=w;
  if(w.hp>0&&!w.passive)selectWarrior(w);
  if(changed){applyXrayShell();buildPrivateXray();updateBattleCamera();}
  else refreshPrivateXrayVisuals();
  const profile=STARTER_PROFILES[w.weaponKey],name=w.passive?'PASSIVE CREW':(profile?.name||'WARRIOR'),state=w.hp<=0?'DEAD':'ALIVE';statusEl.textContent=`CUTAWAY • ${name} • ${state} • ROOM ${w.roomIndex+1} • AA ${Math.round(w.aa)}/${w.maxAa} • HP ${Math.round(w.hp)}/${w.maxHp}`;diag('CUTAWAY WARRIOR SELECT',`${name} state=${state} room=${w.roomIndex+1} aa=${Math.round(w.aa)} hp=${Math.round(w.hp)} passive=${w.passive?'Y':'N'} rebuild=${changed?'Y':'N'}`)
}"""
if old not in s: raise SystemExit('selectXrayCrew block not found')
s=s.replace(old,new,1)
for req in ["if(changed){applyXrayShell();buildPrivateXray();updateBattleCamera();}","rig3D=buildSolarLancer3DModel()","if(selectedFaction==='aurelian'){aWarriors.forEach(w=>{w.active=true"]:
    if req not in s: raise SystemExit('verification missing: '+req)
bstart=s.find('function buildPrivateXray(){'); bend=s.find('function refreshPrivateXrayVisuals(){',bstart); block=s[bstart:bend]
if 'const art=xrayArtTextureForWarrior(w)' in block or 'new THREE.Sprite(new THREE.SpriteMaterial({map:art' in block:
    raise SystemExit('legacy warrior sprite cutout still present in buildPrivateXray')
p.write_text(s,encoding='utf-8')
print('PASS warrior selection rebuilds the opened room')
print('PASS 3D Solar Lancer remains the compartment render')
print('PASS legacy sprite cutout remains removed')
print('PASS all Aurelian warriors remain active through reset')
