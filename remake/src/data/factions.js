export const FACTIONS={
  aurelian:{
    id:'aurelian',name:'AURELIAN',accent:0xffcf63,ship:'SOLAR RAIDER',
    warriors:[
      {id:'solar_lancer',name:'SOLAR LANCER',hp:85,aa:60,weapon:{id:'solar_lance',name:'SOLAR LANCE',kind:'beam',damage:28}},
      {id:'sun_disk_gunner',name:'SUN DISK GUNNER',hp:70,aa:60,weapon:{id:'solar_disk',name:'SOLAR DISK CUTTER',kind:'disk',damage:18}},
      {id:'sunadier',name:'SUNADIER',hp:80,aa:60,weapon:{id:'solar_grenade',name:'ABYSS-CHAIN GRENADE',kind:'arc',damage:30}}
    ]
  },
  earth:{
    id:'earth',name:'EARTH',accent:0x62cfff,ship:'SURVIVAL FORTRESS',
    warriors:[
      {id:'bombardier',name:'BOMBARDIER',hp:85,aa:60,weapon:{id:'he9',name:'HE-9 BARRAGE',kind:'barrage',damage:24}},
      {id:'sniper',name:'SNIPER',hp:60,aa:60,weapon:{id:'rail_sniper',name:'RAIL SNIPER',kind:'precision',damage:38}},
      {id:'combat_controller',name:'COMBAT CONTROLLER',hp:75,aa:60,weapon:{id:'controller',name:'TACTICAL CONTROL',kind:'support',damage:12}}
    ]
  }
};

export function faction(id){return FACTIONS[id]||null}
export function warriorProfile(factionId,warriorId){return faction(factionId)?.warriors.find(w=>w.id===warriorId)||null}
