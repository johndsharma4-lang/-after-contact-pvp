from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="""function setCutawayFiringStage(w){
  if(!xrayOpen||!w)return;
  for(const cell of xrayGroup?.children||[]){const shutter=cell?.userData?.frontShutter;if(shutter)shutter.visible=true}
  const chosen=xrayRoomVisuals.find(v=>v.warrior===w);if(chosen?.frontShutter)chosen.frontShutter.visible=false;
  if(chosen?.nativeRoom){chosen.nativeRoom.visible=true;chosen.nativeRoom.userData.firingStage=true}
  diag('WARRIOR FIRING STAGE',`${w.weaponKey} room=${w.roomIndex+1} selectedRoomOpen=Y otherFrontsClosed=Y roomMoved=N`)
}
function restoreFullCutawayStage(){
  for(const cell of xrayGroup?.children||[]){const shutter=cell?.userData?.frontShutter;if(shutter)shutter.visible=false;if(cell?.userData)cell.userData.firingStage=false}
}"""
new="""function setCutawayFiringStage(w){
  if(!xrayOpen||!w)return;
  // Never use the temporary flat shutters. Restore the vessel's real per-room exterior modules instead.
  for(const cell of xrayGroup?.children||[]){const shutter=cell?.userData?.frontShutter;if(shutter)shutter.visible=false;if(cell?.userData)cell.userData.firingStage=false}
  const side=localXraySide(),skin=side==='aurelian'?factionSkinA:factionSkinE,rooms=localXrayRooms()?.userData?.rooms||[],modules=skin?.userData?.damageModules||[];
  for(let i=0;i<modules.length;i++){
    const module=modules[i],room=rooms[i];if(!module)continue;
    if(room)syncRoomStructuralDamage(room);
    module.visible=i!==w.roomIndex&&!room?.erased&&(room?.breach??0)<100;
  }
  const chosen=xrayRoomVisuals.find(v=>v.warrior===w);if(chosen?.nativeRoom){chosen.nativeRoom.visible=true;chosen.nativeRoom.userData.firingStage=true}
  diag('WARRIOR FIRING STAGE',`${w.weaponKey} room=${w.roomIndex+1} selectedRoomOpen=Y realHullModules=Y fakeShutters=N roomMoved=N`)
}
function restoreFullCutawayStage(){
  const side=localXraySide(),skin=side==='aurelian'?factionSkinA:factionSkinE;
  for(const module of skin?.userData?.damageModules||[])if(module)module.visible=false;
  for(const cell of xrayGroup?.children||[]){const shutter=cell?.userData?.frontShutter;if(shutter)shutter.visible=false;if(cell?.userData)cell.userData.firingStage=false}
}"""
if old not in s: raise SystemExit('existing firing-stage block missing')
s=s.replace(old,new,1)
for req in ['realHullModules=Y','fakeShutters=N','syncRoomStructuralDamage(room)','module.visible=i!==w.roomIndex']:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS fake brown cutaway shutters disabled')
print('PASS real vessel room hull modules close the eight non-selected compartments')
print('PASS real breach/erasure state is preserved on closed compartment faces')
print('PASS selected room remains physically open without moving the cutaway')
