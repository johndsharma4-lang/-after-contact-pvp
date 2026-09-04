import {createMatchState,selectWarrior,warriorById} from './core/state.js';
import {selectTargetRoom,fireSelectedWeapon,selectedAttacker} from './core/combat.js';
import {FACTIONS,warriorProfile} from './data/factions.js';
import {createBattleScene} from './render/scene.js';

const app=document.getElementById('app'),status=document.getElementById('status'),leftCard=document.getElementById('leftCard'),rightCard=document.getElementById('rightCard');
const state=createMatchState();
const battle=createBattleScene(app,state);

function sideSummary(sideId){
  const side=state.sides[sideId],f=FACTIONS[side.factionId];
  return `<b>${f.name}</b><br>SHIELD ${side.shield}/360 • STRUCTURE ${side.structure}/1200<br>${side.warriors.map(w=>{const p=warriorProfile(side.factionId,w.profileId);return `${p.name} • R${w.roomIndex+1} • HP ${w.hp}/${w.maxHp} • AA ${w.aa}/${w.maxAa}`}).join('<br>')}`;
}
function refreshHud(message=null){
  leftCard.innerHTML=sideSummary('aurelian');rightCard.innerHTML=sideSummary('earth');
  if(message){status.textContent=message;return}
  const selected=warriorById(state,state.selectedWarriorId);
  if(!selected){status.textContent=`ROUND ${state.round} • ${state.turn.toUpperCase()} TURN • SELECT A 3D WARRIOR`;return}
  const sideId=selected.id.split(':')[0],p=warriorProfile(state.sides[sideId].factionId,selected.profileId);
  if(state.target)status.textContent=`${p.name} • TARGET ${state.target.sideId.toUpperCase()} ROOM ${state.target.roomIndex+1} • TAP SAME ROOM TO FIRE`;
  else status.textContent=`SELECTED ${p.name} • ROOM ${selected.roomIndex+1} • ${p.weapon.name} • PICK ENEMY ROOM`;
}

battle.renderer.domElement.addEventListener('pointerup',e=>{
  const warriorId=battle.pickWarrior(e.clientX,e.clientY);
  if(warriorId){
    const warrior=warriorById(state,warriorId),sideId=warriorId.split(':')[0];
    if(sideId!==state.turn){refreshHud(`WAIT • ${state.turn.toUpperCase()} TURN`);return}
    if(selectWarrior(state,warriorId)){state.target=null;battle.sync();refreshHud()}
    return;
  }

  const attacker=selectedAttacker(state);if(!attacker){refreshHud(`ROUND ${state.round} • ${state.turn.toUpperCase()} TURN • SELECT YOUR WARRIOR`);return}
  const room=battle.pickRoom(e.clientX,e.clientY);if(!room)return;
  if(room.sideId===attacker.sideId){refreshHud('TARGET THE ENEMY SHIP');return}

  if(state.target?.sideId===room.sideId&&state.target?.roomIndex===room.roomIndex){
    const result=fireSelectedWeapon(state);
    if(result.ok){battle.playWeapon(result);battle.sync();refreshHud(`${result.weapon.name} FIRED • ${result.shieldDamage?`SHIELD -${result.shieldDamage}`:`ROOM ${result.roomIndex+1} ARMOR -${result.armorDamage}`} • ${state.turn.toUpperCase()} TURN`)}
    else refreshHud(result.reason);
    return;
  }

  selectTargetRoom(state,room.sideId,room.roomIndex);battle.sync();refreshHud();
});

refreshHud();
window.AFTER_CONTACT_REMAKE={state,battle,selectTargetRoom,fireSelectedWeapon};
