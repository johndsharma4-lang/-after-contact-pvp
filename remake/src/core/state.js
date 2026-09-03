import {FACTIONS} from '../data/factions.js';

const ROOM_COUNT=9;
const roomTemplate=()=>Array.from({length:ROOM_COUNT},(_,index)=>({index,armor:100,breach:0,erased:false,fire:0,acid:0,fallLevels:0}));

function sideState(factionId,rooms){
  const f=FACTIONS[factionId];
  return {
    factionId,
    structure:1200,
    shield:360,
    rooms:roomTemplate(),
    warriors:f.warriors.map((profile,i)=>({
      id:`${factionId}:${i}`,
      profileId:profile.id,
      hp:profile.hp,
      maxHp:profile.hp,
      aa:profile.aa,
      maxAa:profile.aa,
      roomIndex:rooms[i],
      alive:true,
      selected:false
    }))
  };
}

export function createMatchState(){
  return {
    version:1,
    turn:'aurelian',
    round:1,
    phase:'battle',
    selectedWarriorId:null,
    sides:{
      aurelian:sideState('aurelian',[2,0,1]),
      earth:sideState('earth',[5,4,3])
    }
  };
}

export function allWarriors(state){return Object.values(state.sides).flatMap(s=>s.warriors)}
export function warriorById(state,id){return allWarriors(state).find(w=>w.id===id)||null}
export function selectWarrior(state,id){
  const warrior=warriorById(state,id);
  if(!warrior||!warrior.alive)return false;
  for(const w of allWarriors(state))w.selected=false;
  warrior.selected=true;
  state.selectedWarriorId=id;
  return true;
}
export function setWarriorRoom(state,id,roomIndex){
  const warrior=warriorById(state,id);
  if(!warrior||!Number.isInteger(roomIndex)||roomIndex<0||roomIndex>=ROOM_COUNT)return false;
  const side=state.sides[warrior.id.split(':')[0]];
  if(side.warriors.some(w=>w.id!==id&&w.alive&&w.roomIndex===roomIndex))return false;
  warrior.roomIndex=roomIndex;
  return true;
}
