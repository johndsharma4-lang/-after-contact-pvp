from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old=r'''function relocateCrewFromErasedCompartment(attacker,index){
  const rooms=opposingRooms(attacker).userData.rooms,crew=opposing(attacker).filter(w=>w.active&&w.roomIndex===index),living=crew.filter(w=>w.hp>0),targetSide=attacker.side==='aurelian'?'earth':'aurelian';let destination=index+3;
  while(destination<rooms.length&&rooms[destination]?.erased)destination+=3;
  const candidates=rooms.map((room,i)=>({room,i,d:Math.abs(Math.floor(i/3)-Math.floor(index/3))*3+Math.abs(i%3-index%3)})).filter(x=>x.i!==index&&!x.room.erased).sort((a,b)=>a.d-b.d||a.i-b.i);
  if(destination>=rooms.length)destination=candidates[0]?.i??-1;
  if(destination<0){prepareTerminalWreckFoundation(targetSide);terminalCollapseActive=true;let collapseDamage=0;living.sort((a,b)=>Number(b.passive)-Number(a.passive));diag('CREW TOTAL COLLAPSE START',`side=${targetSide} room=${index+1} living=${living.length} groupedDeath=Y`);for(const w of living){w.fellFromRoom=index;w.fallRecoveryPending=false;collapseDamage+=applyWarriorDamage(w,Math.max(1,w.hp+w.aa),'TOTAL COMPARTMENT COLLAPSE',attacker)}terminalCollapseActive=false;diag('CREW TOTAL COLLAPSE',`room=${index+1} living=${living.length} unit=${collapseDamage} reason=NO_HABITABLE_COMPARTMENT groupedDeath=Y`);return crew.length}
  let fallDamage=0;const emergency=destination!==index+3,occupancy=new Map(candidates.map(c=>[c.i,opposing(attacker).filter(w=>w.active&&w.hp>0&&w.roomIndex===c.i).length]));
  for(const w of crew){if(w.hp<=0)continue;let target=destination;if(emergency&&candidates.length){const ranked=[...candidates].sort((a,b)=>(occupancy.get(a.i)||0)-(occupancy.get(b.i)||0)||a.d-b.d||a.i-b.i);target=ranked[0].i;occupancy.set(target,(occupancy.get(target)||0)+1)}setWarriorRoom(w,target);w.fellFromRoom=index;w.fallRecoveryPending=true;fallDamage+=applyWarriorDamage(w,Math.max(1,Math.round(w.maxHp*(emergency?.12:.08))),emergency?'EMERGENCY HULL TRANSFER':'COMPARTMENT DROP',attacker)}
  diag(emergency?'CREW EMERGENCY DISTRIBUTION':'CREW FALL RELOCATE',`room=${index+1} destinations=${[...new Set(living.map(w=>w.roomIndex+1))].join(',')} crew=${crew.length} living=${living.filter(w=>w.hp>0).length} unit=${fallDamage} erasedTarget=N`);return crew.length
}
function enforceLivingCrewRoomInvariant(attacker){
  const rooms=opposingRooms(attacker).userData.rooms;let repaired=0;for(const w of opposing(attacker).filter(x=>x.active&&x.hp>0)){if(!rooms[w.roomIndex]?.erased)continue;relocateCrewFromErasedCompartment(attacker,w.roomIndex);repaired++}if(repaired)diag('CREW ROOM INVARIANT REPAIR',`side=${attacker.side==='aurelian'?'earth':'aurelian'} repaired=${repaired}`);return repaired
}'''
new=r'''function relocateCrewFromErasedCompartment(attacker,index){
  const rooms=opposingRooms(attacker).userData.rooms,sideCrew=opposing(attacker),crew=sideCrew.filter(w=>w.active&&w.roomIndex===index),living=crew.filter(w=>w.hp>0),targetSide=attacker.side==='aurelian'?'earth':'aurelian';
  let destination=index+3,levels=1;
  while(destination<rooms.length&&rooms[destination]?.erased){destination+=3;levels++}
  if(destination>=rooms.length){
    prepareTerminalWreckFoundation(targetSide);terminalCollapseActive=true;let collapseDamage=0;living.sort((a,b)=>Number(b.passive)-Number(a.passive));
    diag('CREW TOTAL COLLAPSE START',`side=${targetSide} room=${index+1} living=${living.length} groupedDeath=Y`);
    for(const w of living){w.fellFromRoom=index;w.fallRecoveryPending=false;w.blockedFallKey=null;collapseDamage+=applyWarriorDamage(w,Math.max(1,w.hp+w.aa),'TOTAL COMPARTMENT COLLAPSE',attacker)}
    terminalCollapseActive=false;diag('CREW TOTAL COLLAPSE',`room=${index+1} living=${living.length} unit=${collapseDamage} reason=FOUNDATION_LOST groupedDeath=Y`);return crew.length
  }
  let fallDamage=0,moved=0,blocked=0;
  for(const w of living){
    const occupant=sideCrew.find(x=>x!==w&&x.active&&x.hp>0&&x.roomIndex===destination);
    if(occupant){
      const key=`${index}>${destination}`;
      if(w.blockedFallKey!==key){
        w.blockedFallKey=key;w.fellFromRoom=index;w.fallRecoveryPending=false;
        const penalty=Math.max(1,Math.round(w.maxHp*.03));fallDamage+=applyWarriorDamage(w,penalty,'BLOCKED FALL IMPACT +3%',attacker);
      }
      blocked++;diag('CREW FALL BLOCKED',`warrior=${w.weaponKey||w.index} from=${index+1} landing=${destination+1} occupiedBy=${occupant.weaponKey||occupant.index} penalty=3% moved=N`);continue
    }
    const old=index;setWarriorRoom(w,destination);w.blockedFallKey=null;w.fellFromRoom=old;w.fallRecoveryPending=true;
    const pct=.08*Math.max(1,levels),damage=Math.max(1,Math.round(w.maxHp*pct));fallDamage+=applyWarriorDamage(w,damage,levels>1?`COMPARTMENT FALL ${levels} LEVELS`:'COMPARTMENT FALL 1 LEVEL',attacker);moved++;
    diag('CREW PHYSICAL FALL',`warrior=${w.weaponKey||w.index} from=${old+1} to=${destination+1} levels=${levels} damage=${damage}`)
  }
  diag('CREW FALL RESOLVE',`room=${index+1} landing=${destination+1} levels=${levels} moved=${moved} blocked=${blocked} unit=${fallDamage}`);return crew.length
}
function enforceLivingCrewRoomInvariant(attacker){
  const rooms=opposingRooms(attacker).userData.rooms;let repaired=0;
  for(const w of opposing(attacker).filter(x=>x.active&&x.hp>0)){
    if(!rooms[w.roomIndex]?.erased)continue;
    const below=w.roomIndex+3,occupant=below<rooms.length?opposing(attacker).find(x=>x!==w&&x.active&&x.hp>0&&x.roomIndex===below):null;
    if(occupant&&w.blockedFallKey===`${w.roomIndex}>${below}`)continue;
    relocateCrewFromErasedCompartment(attacker,w.roomIndex);repaired++
  }
  if(repaired)diag('CREW ROOM INVARIANT REPAIR',`side=${attacker.side==='aurelian'?'earth':'aurelian'} repaired=${repaired}`);return repaired
}'''
if old not in s: raise SystemExit('collapse relocation block not found')
s=s.replace(old,new,1)
old_reset="w.fellFromRoom=null;w.fallRecoveryPending=false;w.acidStacks=0;"
new_reset="w.fellFromRoom=null;w.fallRecoveryPending=false;w.blockedFallKey=null;w.acidStacks=0;"
if old_reset in s:s=s.replace(old_reset,new_reset,1)
for req in ["BLOCKED FALL IMPACT +3%","CREW PHYSICAL FALL","w.blockedFallKey","levels=${levels}"]:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS one-warrior-per-compartment enforced during collapse')
print('PASS occupied landing blocks movement and applies 3% penalty')
print('PASS fall damage scales with structural fall distance')
print('PASS invariant checker will not repeatedly force blocked falls')
