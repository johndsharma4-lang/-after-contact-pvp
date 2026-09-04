import {warriorById} from './state.js';
import {warriorProfile} from '../data/factions.js';

export function selectTargetRoom(state,sideId,roomIndex){
  if(!state.sides[sideId]||!Number.isInteger(roomIndex)||roomIndex<0||roomIndex>8)return false;
  state.target={sideId,roomIndex};
  return true;
}

export function selectedAttacker(state){
  const w=warriorById(state,state.selectedWarriorId);
  if(!w||!w.alive)return null;
  const sideId=w.id.split(':')[0];
  if(sideId!==state.turn)return null;
  return {sideId,warrior:w,profile:warriorProfile(state.sides[sideId].factionId,w.profileId)};
}

function damageWarriorInRoom(side,roomIndex,damage){
  const victim=side.warriors.find(w=>w.alive&&w.roomIndex===roomIndex);
  if(!victim)return {victim:null,aaDamage:0,hpDamage:0};
  let left=damage,aaDamage=0,hpDamage=0;
  if(victim.aa>0){aaDamage=Math.min(victim.aa,left);victim.aa-=aaDamage;left-=aaDamage}
  if(left>0){hpDamage=Math.min(victim.hp,left);victim.hp-=hpDamage;if(victim.hp<=0){victim.hp=0;victim.alive=false}}
  return {victim,aaDamage,hpDamage};
}

export function fireSelectedWeapon(state){
  const attacker=selectedAttacker(state),target=state.target;
  if(!attacker||!target)return {ok:false,reason:'SELECT WARRIOR AND ENEMY ROOM'};
  if(target.sideId===attacker.sideId)return {ok:false,reason:'TARGET ENEMY ROOM'};
  const targetSide=state.sides[target.sideId],room=targetSide.rooms[target.roomIndex];
  if(!room||room.erased)return {ok:false,reason:'INVALID TARGET'};

  const weapon=attacker.profile.weapon;
  let damage=weapon.damage;
  const result={ok:true,attackerId:attacker.warrior.id,attackerSide:attacker.sideId,targetSide:target.sideId,roomIndex:target.roomIndex,weapon,shieldDamage:0,armorDamage:0,unit:null};

  if(targetSide.shield>0){
    const absorbed=Math.min(targetSide.shield,damage);targetSide.shield-=absorbed;damage-=absorbed;result.shieldDamage=absorbed;
  }
  if(damage>0){
    const armorDamage=Math.min(room.armor,damage);room.armor-=armorDamage;room.breach=100-room.armor;result.armorDamage=armorDamage;damage-=armorDamage;
    if(room.armor<=0)room.breach=100;
  }
  if(damage>0||room.breach>=60)result.unit=damageWarriorInRoom(targetSide,target.roomIndex,Math.max(damage,Math.round(weapon.damage*.35)));

  state.lastAction=result;
  state.turn=target.sideId;
  if(state.turn==='aurelian')state.round+=1;
  state.selectedWarriorId=null;
  for(const side of Object.values(state.sides))for(const w of side.warriors)w.selected=false;
  state.target=null;
  return result;
}
