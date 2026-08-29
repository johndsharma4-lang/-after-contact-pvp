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

  // Force explicit art entries into the same authoritative lookup Earth uses.
  patched = patched.replace(
    /const OFFICIAL_STARTER_ART=\{([\s\S]*?)\};/,
    (match, body) => {
      let next = body;
      if (!next.includes("sun_disk_gunner:")) next += "\n  sun_disk_gunner:'/sun-disk-gunner-l2.webp',";
      if (!next.includes("sunadier:")) next += "\n  sunadier:'/sunadier-l2.webp',";
      return `const OFFICIAL_STARTER_ART={${next}\n};`;
    }
  );

  // Never let an Aurelian specialist silently inherit Solar Lancer art.
  patched = patched.replace(
    "function starterArt(type){return OFFICIAL_STARTER_ART[type]||starter3DArtCache[type]||null}",
    "function starterArt(type){const aurelianArt={sun_disk_gunner:'/sun-disk-gunner-l2.webp',sunadier:'/sunadier-l2.webp'};return aurelianArt[type]||OFFICIAL_STARTER_ART[type]||starter3DArtCache[type]||null}"
  );

  // Give each hero its own material instance before loading its texture. This prevents a shared
  // Solar Lancer material/map from making all three Aurelian warriors look identical in battle.
  patched = patched.replace(
    "w.weaponKey=type;w.faction=profile.faction;w.maxHp=profile.stats?.hp||100;w.hp=Math.min(w.hp,w.maxHp);w.sprite.material.color.setHex(profile.color);if(w.nameText)w.nameText.textContent=profile.name;",
    "w.weaponKey=type;w.faction=profile.faction;w.maxHp=profile.stats?.hp||100;w.hp=Math.min(w.hp,w.maxHp);if(w.sprite?.material&&!w.userData?.acUniqueMaterial){w.sprite.material=w.sprite.material.clone();w.userData=w.userData||{};w.userData.acUniqueMaterial=true}w.sprite.material.color.setHex(profile.color);if(w.nameText)w.nameText.textContent=profile.name;"
  );

  // Resolve the image directly from the warrior ID before looking at any card DOM fallback.
  patched = patched.replace(
    "const choice=document.querySelector(`.characterCard[data-warrior=\"${type}\"]`),src=choice?.querySelector('img')?.src||starterArt(type)||(type==='bombardier'?'/bombardier.webp':type==='solar_lancer'?'/solar-lancer.webp':null);",
    "const choice=document.querySelector(`.characterCard[data-warrior=\"${type}\"]`),src=starterArt(type)||choice?.querySelector('img')?.src||(type==='bombardier'?'/bombardier.webp':type==='solar_lancer'?'/solar-lancer.webp':null);"
  );

  // Make deployment cards and room thumbnails use the same explicit asset paths.
  patched = patched.replace(
    "function deploymentArtAt(index){",
    "function deploymentArtAt(index){const acType=deploymentTypeAt(index);const acArt=starterArt(acType);if(acArt)return acArt;"
  );

  patched = patched.replaceAll("deployReadyLabel.textContent=`EARTH TEAM • ${placed}/${required} PLACED`", "deployReadyLabel.textContent=`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${placed}/${required} PLACED`");
  patched = patched.replaceAll("deployReadyLabel.textContent=`EARTH TEAM • ${required}/${required} READY`", "deployReadyLabel.textContent=`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${required}/${required} READY`");
  patched = patched.replaceAll("deployReadyLabel.textContent=deployed<required?`EARTH TEAM • ${deployed}/${required} PLACED`:'EARTH TEAM • 3/3 READY';", "deployReadyLabel.textContent=deployed<required?`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${deployed}/${required} PLACED`:`${selectedFaction==='aurelian'?'AURELIAN':'EARTH'} TEAM • ${required}/${required} READY`;" );

  patched = patched.replace("if(multiplayer&&Number.isInteger(deployment[0])){", "if(multiplayer&&hasValidDeployment()){");
  patched = patched.replace("diag('STARTER ART','transparent Acid Brute + Spatial Disintegrator cutouts embedded');", "diag('STARTER ART','Earth + Aurelian Level-2 roster art embedded');");

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.36');
  patched = patched.replace(/build=2026-08-(28|29)_[A-Z0-9_]+/g, 'build=2026-08-29_AURELIAN_DISTINCT_ART_FIX');
  patched = patched.replace('</head>', '<meta name="ac-aurelian-team-runtime" content="three-warrior-deployment distinct-art unique-material sun-disk-gunner sunadier">\n</head>');
  return patched;
}
