export function patchAurelianTeamRuntime(html) {
  let patched = html;

  patched = patched.replace(
    "roster:Object.freeze([Object.freeze({id:'solar_lancer',name:'SOLAR LANCER',weapon:'PENETRATING LASER',color:0xffffff,artKey:'solar_lancer'})]),",
    "roster:Object.freeze([Object.freeze({id:'solar_lancer',name:'SOLAR LANCER',weapon:'PENETRATING LASER',color:0xffffff,artKey:'solar_lancer',stats:{acc:95,hp:85,dmg:82,aoe:18}}),Object.freeze({id:'sun_disk_gunner',name:'SUN DISK GUNNER',weapon:'SOLAR DISK CUTTER',color:0xffd76a,artKey:'sun_disk_gunner',stats:{acc:82,hp:70,dmg:88,aoe:62}}),Object.freeze({id:'sunadier',name:'SUNADIER',weapon:'ABYSS-CHAIN SOLAR GRENADE',color:0xffb84d,artKey:'sunadier',stats:{acc:72,hp:80,dmg:92,aoe:100}})]),"
  );

  patched = patched.replaceAll("aurelian:['solar_lancer']", "aurelian:['solar_lancer','sun_disk_gunner','sunadier']");

  patched = patched.replace(
    "if(!factionModule('earth')?.roster?.some(u=>u.id==='combat_controller'))failures.push('earth:controller-missing');",
    "if(!factionModule('earth')?.roster?.some(u=>u.id==='combat_controller'))failures.push('earth:controller-missing');if(!factionModule('aurelian')?.roster?.some(u=>u.id==='sun_disk_gunner'))failures.push('aurelian:sun-disk-missing');if(!factionModule('aurelian')?.roster?.some(u=>u.id==='sunadier'))failures.push('aurelian:sunadier-missing');"
  );

  patched = patched.replace(
    "spatial_disintegrator:'/spatial-disintegrator.webp'",
    "spatial_disintegrator:'/spatial-disintegrator.webp',sun_disk_gunner:'/sun-disk-gunner-l2.svg',sunadier:'/sunadier-l2.svg'"
  );

  patched = patched.replace(
    "function starterArt(type){return OFFICIAL_STARTER_ART[type]||starter3DArtCache[type]||null}",
    "function starterArt(type){const aurelianArt={sun_disk_gunner:'/sun-disk-gunner-l2.svg',sunadier:'/sunadier-l2.svg'};return aurelianArt[type]||OFFICIAL_STARTER_ART[type]||starter3DArtCache[type]||null}"
  );

  patched = patched.replace(
    "w.weaponKey=type;w.faction=profile.faction;w.maxHp=profile.stats?.hp||100;w.hp=Math.min(w.hp,w.maxHp);w.sprite.material.color.setHex(profile.color);if(w.nameText)w.nameText.textContent=profile.name;",
    "w.weaponKey=type;w.faction=profile.faction;w.maxHp=profile.stats?.hp||100;w.hp=Math.min(w.hp,w.maxHp);if(w.sprite?.material&&!w.userData?.acUniqueMaterial){w.sprite.material=w.sprite.material.clone();w.userData=w.userData||{};w.userData.acUniqueMaterial=true}w.sprite.material.color.setHex(profile.color);if(w.nameText)w.nameText.textContent=profile.name;"
  );

  patched = patched.replace(
    "const choice=document.querySelector(`.characterCard[data-warrior=\"${type}\"]`),src=choice?.querySelector('img')?.src||starterArt(type)||(type==='bombardier'?'/bombardier.webp':type==='solar_lancer'?'/solar-lancer.webp':null);",
    "const choice=document.querySelector(`.characterCard[data-warrior=\"${type}\"]`),src=starterArt(type)||choice?.querySelector('img')?.src||(type==='bombardier'?'/bombardier.webp':type==='solar_lancer'?'/solar-lancer.webp':null);"
  );

  patched = patched.replace(
    "if(factionForSide(side)==='earth'&&!w.passive&&(w.weaponKey==='sniper'||w.weaponKey==='combat_controller'))return w.weaponKey;",
    "if(factionForSide(side)==='earth'&&!w.passive&&(w.weaponKey==='sniper'||w.weaponKey==='combat_controller'))return w.weaponKey;\n  if(factionForSide(side)==='aurelian'&&!w.passive&&(w.weaponKey==='solar_lancer'||w.weaponKey==='sun_disk_gunner'||w.weaponKey==='sunadier'))return w.weaponKey;"
  );

  patched = patched.replace(
    "function endSoloPlayerTurnAfterShot(){\n  if(multiplayer||!battleStarted||matchEnded)return;",
    "function endSoloPlayerTurnAfterShot(){\n  if(multiplayer||!battleStarted||matchEnded)return;\n  if(soloTurn!=='aurelian'){diag('TURN GUARD','duplicate player-turn handoff blocked current='+soloTurn);return;}\n  if(solarActionLock||acidActionLock||barrageActionLock){diag('TURN HOLD','weapon action still resolving');return;}"
  );

  patched = patched.replaceAll("deployReadyLabel.textContent=`EARTH TEAM • ${placed}/${required} PLACED`", "deployReadyLabel.textContent=`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${placed}/${required} PLACED`");
  patched = patched.replaceAll("deployReadyLabel.textContent=`EARTH TEAM • ${required}/${required} READY`", "deployReadyLabel.textContent=`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${required}/${required} READY`");
  patched = patched.replaceAll("deployReadyLabel.textContent=deployed<required?`EARTH TEAM • ${deployed}/${required} PLACED`:'EARTH TEAM • 3/3 READY';", "deployReadyLabel.textContent=deployed<required?`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${deployed}/${required} PLACED`:`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${required}/${required} READY`;" );

  patched = patched.replace("if(multiplayer&&Number.isInteger(deployment[0])){", "if(multiplayer&&hasValidDeployment()){");
  patched = patched.replace("diag('STARTER ART','transparent Acid Brute + Spatial Disintegrator cutouts embedded');", "diag('STARTER ART','Earth + Aurelian Level-2 roster art static assets');");

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.41');
  patched = patched.replace(/build=2026-08-(28|29|30)_[A-Z0-9_]+/g, 'build=2026-08-30_AURELIAN_STATIC_ART_MATCH_EARTH');
  patched = patched.replace('</head>', '<style>.acUnifiedRow img.acWarriorGlyph{display:block!important;width:52px!important;height:54px!important;object-fit:contain!important;background:transparent!important}.acUnifiedRow>div:first-child{display:flex!important;align-items:center!important;justify-content:center!important;overflow:visible!important}@media(max-width:760px){.acUnifiedRow img.acWarriorGlyph{width:43px!important;height:46px!important}}</style><meta name="ac-aurelian-team-runtime" content="three-warrior-deployment earth-style-static-art distinct-art unique-material specialist-route-lock turn-guard solar-lancer sun-disk-gunner sunadier">\n</head>');
  return patched;
}
