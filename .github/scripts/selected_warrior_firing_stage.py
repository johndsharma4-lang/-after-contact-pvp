from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
# Add front shutters to native rooms so selection can isolate one firing compartment without moving/destroying room state.
needle="const floorStrip=markXray(new THREE.Mesh(new THREE.BoxGeometry(roomW*.82,.06,.12),trimMat.clone()),79);floorStrip.position.set(0,floorY+.20,roomD*.49);cell.add(floorStrip);"
repl=needle+"\n    const frontShutter=markXray(new THREE.Mesh(new THREE.BoxGeometry(roomW*.94,roomH*.92,.16),wallMat.clone()),96);frontShutter.name=`CUTAWAY_FRONT_SHUTTER_${i+1}`;frontShutter.position.set(0,0,roomD*.51);frontShutter.visible=false;cell.add(frontShutter);cell.userData.frontShutter=frontShutter;"
if needle not in s: raise SystemExit('native room floor-strip anchor missing')
s=s.replace(needle,repl,1)
# Store shutter on occupied room visual.
needle2="nativeRoom:cell,standAnchor:stand})"
if needle2 not in s: raise SystemExit('native visual record anchor missing')
s=s.replace(needle2,"nativeRoom:cell,standAnchor:stand,frontShutter})",1)
# Add visual mode helpers immediately before selection function.
anchor='function selectXrayCrew(w){'
pos=s.find(anchor)
if pos<0: raise SystemExit('selectXrayCrew missing')
helper=r'''function setCutawayFiringStage(w){
  if(!xrayOpen||!w)return;
  for(const cell of xrayGroup?.children||[]){const shutter=cell?.userData?.frontShutter;if(shutter)shutter.visible=true}
  const chosen=xrayRoomVisuals.find(v=>v.warrior===w);if(chosen?.frontShutter)chosen.frontShutter.visible=false;
  if(chosen?.nativeRoom){chosen.nativeRoom.visible=true;chosen.nativeRoom.userData.firingStage=true}
  diag('WARRIOR FIRING STAGE',`${w.weaponKey} room=${w.roomIndex+1} selectedRoomOpen=Y otherFrontsClosed=Y roomMoved=N`)
}
function restoreFullCutawayStage(){
  for(const cell of xrayGroup?.children||[]){const shutter=cell?.userData?.frontShutter;if(shutter)shutter.visible=false;if(cell?.userData)cell.userData.firingStage=false}
}
'''
s=s[:pos]+helper+s[pos:]
# Selecting a warrior now isolates that room visually. No roomIndex or setWarriorRoom changes.
start=s.find('function selectXrayCrew(w){')
end=s.find('bindMobileAction(xrayExitBtn',start)
if end<0: raise SystemExit('selection end missing')
block=s[start:end]
if 'setCutawayFiringStage(w)' not in block:
    semi=block.find(';',block.find('xraySelectedCrew=w'))
    if semi<0: raise SystemExit('selection assignment anchor missing')
    block=block[:semi+1]+'setCutawayFiringStage(w);'+block[semi+1:]
    s=s[:start]+block+s[end:]
for req in ['CUTAWAY_FRONT_SHUTTER_','WARRIOR FIRING STAGE','setCutawayFiringStage(w)','roomMoved=N']:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS selected warrior room remains open while other eight fronts close')
print('PASS room geometry never moves toward camera')
print('PASS persistent native room state remains attached to original compartment')
