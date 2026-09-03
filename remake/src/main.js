import {createMatchState,selectWarrior,warriorById} from './core/state.js';
import {FACTIONS,warriorProfile} from './data/factions.js';
import {createBattleScene} from './render/scene.js';

const app=document.getElementById('app'),status=document.getElementById('status'),leftCard=document.getElementById('leftCard'),rightCard=document.getElementById('rightCard');
const state=createMatchState();
const battle=createBattleScene(app,state);

function sideSummary(sideId){
  const side=state.sides[sideId],f=FACTIONS[side.factionId];
  return `<b>${f.name}</b><br>${side.warriors.map(w=>{const p=warriorProfile(side.factionId,w.profileId);return `${p.name} • R${w.roomIndex+1} • HP ${w.hp}/${w.maxHp} • AA ${w.aa}/${w.maxAa}`}).join('<br>')}`;
}
function refreshHud(){
  leftCard.innerHTML=sideSummary('aurelian');rightCard.innerHTML=sideSummary('earth');
  const selected=warriorById(state,state.selectedWarriorId);if(!selected){status.textContent='SELECT A 3D WARRIOR';return}
  const sideId=selected.id.split(':')[0],p=warriorProfile(state.sides[sideId].factionId,selected.profileId);status.textContent=`SELECTED ${p.name} • ROOM ${selected.roomIndex+1} • ${p.weapon.name}`;
}

battle.renderer.domElement.addEventListener('pointerup',e=>{
  const id=battle.pickWarrior(e.clientX,e.clientY);if(!id)return;
  // Selection is allowed; room assignment never changes here.
  if(selectWarrior(state,id)){battle.sync();refreshHud()}
});

refreshHud();
status.textContent='CLEAN 3D REMAKE ONLINE • SELECT A WARRIOR';
window.AFTER_CONTACT_REMAKE={state,battle};
