export function patchAurelianTeamRuntime(html) {
  let patched = html;

  patched = patched.replace(
    "roster:Object.freeze([Object.freeze({id:'solar_lancer',name:'SOLAR LANCER',weapon:'PENETRATING LASER',color:0xffffff,artKey:'solar_lancer'})]),",
    "roster:Object.freeze([Object.freeze({id:'solar_lancer',name:'SOLAR LANCER',weapon:'PENETRATING LASER',color:0xffffff,artKey:'solar_lancer',stats:{acc:95,hp:85,dmg:82,aoe:18}}),Object.freeze({id:'sun_disk_gunner',name:'SUN DISK GUNNER',weapon:'SOLAR DISK CUTTER',color:0xffd76a,artKey:'sun_disk_gunner',stats:{acc:82,hp:70,dmg:88,aoe:62}}),Object.freeze({id:'sunadier',name:'SUNADIER',weapon:'ABYSS-CHAIN SOLAR GRENADE',color:0xffb84d,artKey:'sunadier',stats:{acc:72,hp:80,dmg:92,aoe:100}})]),"
  );

  patched = patched.replace(
    "const allowed={earth:['bombardier','sniper','combat_controller'],aurelian:['solar_lancer'],lizard:['acid_brute'],gray:['spatial_disintegrator']};",
    "const allowed={earth:['bombardier','sniper','combat_controller'],aurelian:['solar_lancer','sun_disk_gunner','sunadier'],lizard:['acid_brute'],gray:['spatial_disintegrator']};"
  );

  patched = patched.replace(
    "if(!factionModule('earth')?.roster?.some(u=>u.id==='combat_controller'))failures.push('earth:controller-missing');",
    "if(!factionModule('earth')?.roster?.some(u=>u.id==='combat_controller'))failures.push('earth:controller-missing');if(!factionModule('aurelian')?.roster?.some(u=>u.id==='sun_disk_gunner'))failures.push('aurelian:sun-disk-missing');if(!factionModule('aurelian')?.roster?.some(u=>u.id==='sunadier'))failures.push('aurelian:sunadier-missing');"
  );

  patched = patched.replace(
    "spatial_disintegrator:'/spatial-disintegrator.webp'",
    "spatial_disintegrator:'/spatial-disintegrator.webp',sun_disk_gunner:'/sun-disk-gunner-l2.webp',sunadier:'/sunadier-l2.webp'"
  );

  // Do not reference FACTION_META inside deployment functions that can run before its const initialization.
  // selectedFaction is already available and is sufficient for a safe label.
  patched = patched.replaceAll("deployReadyLabel.textContent=`EARTH TEAM • ${placed}/${required} PLACED`", "deployReadyLabel.textContent=`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${placed}/${required} PLACED`");
  patched = patched.replaceAll("deployReadyLabel.textContent=`EARTH TEAM • ${required}/${required} READY`", "deployReadyLabel.textContent=`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${required}/${required} READY`");
  patched = patched.replaceAll("deployReadyLabel.textContent=deployed<required?`EARTH TEAM • ${deployed}/${required} PLACED`:'EARTH TEAM • 3/3 READY';", "deployReadyLabel.textContent=deployed<required?`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${deployed}/${required} PLACED`:`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${required}/${required} READY`;" );

  patched = patched.replace(
    "if(multiplayer&&Number.isInteger(deployment[0])){",
    "if(multiplayer&&hasValidDeployment()){"
  );

  patched = patched.replace(
    "diag('STARTER ART','transparent Acid Brute + Spatial Disintegrator cutouts embedded');",
    "diag('STARTER ART','Earth + Aurelian Level-2 roster art embedded');"
  );

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.34');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_AURELIAN_DEPLOY_INIT_FIX');
  patched = patched.replace('</head>', '<meta name="ac-aurelian-team-runtime" content="three-warrior-deployment init-order-safe solar-lancer sun-disk-gunner sunadier">\n</head>');
  return patched;
}
