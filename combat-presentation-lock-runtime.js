function replaceExact(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchCombatPresentationLockRuntime(html) {
  let patched = html;
  const status = {
    cutaway:false,
    cutawayArt:false,
    weaponCard:false,
    selectedHud:false,
    actionTurn:false,
    multiplayerFire:false,
    multiplayerTurn:false,
    destructionEnd:false
  };

  patched = replaceExact(
    patched,
    "g.position.copy(roomRoot.position);g.position.x=0;g.rotation.copy(roomRoot.rotation);g.scale.copy(roomRoot.scale);",
    "g.position.copy(roomRoot.position);if(factionForWorldSide(localXraySide())==='earth')g.position.x=0;g.rotation.copy(roomRoot.rotation);g.scale.copy(roomRoot.scale);",
    status,
    'cutaway'
  );
  patched = patched.replace(
    "const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2,spreadX=faction==='earth'?1.35:2.35,spreadY=faction==='earth'?1.28:1.30;",
    "const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2,spreadX=faction==='earth'?1.35:.90,spreadY=faction==='earth'?1.28:.88;"
  );
  patched = patched.replace(
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,.92,false)),68);",
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,faction==='earth'?.92:0,false)),68);"
  );
  patched = patched.replace(
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,faction==='earth'?.92:0,false)),68);cutaway.position.set(0,0,.10);g.add(cutaway);",
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,faction==='earth'?.92:0,false)),68);cutaway.position.set(0,0,.10);g.add(cutaway);if(faction==='aurelian'){const aperture=markXray(new THREE.Mesh(new THREE.CircleGeometry(width*.48,64),xrayBasic(0x120603,.78,false)),67);aperture.scale.set(1,.43,1);aperture.position.set(0,0,.08);g.add(aperture);const apertureRim=markXray(new THREE.Mesh(new THREE.RingGeometry(width*.46,width*.50,64),xrayBasic(0xffb52c,.88,true)),69);apertureRim.scale.set(1,.43,1);apertureRim.position.set(0,0,.12);g.add(apertureRim);const openedHull=markXray(new THREE.Mesh(new THREE.CircleGeometry(width*.48,64,0,Math.PI),xrayBasic(0xc87b23,.92,false)),69);openedHull.scale.set(1,.43,1);openedHull.position.set(0,height*.56,1.28);openedHull.rotation.x=-.62;g.add(openedHull);const openedEdge=markXray(new THREE.Mesh(new THREE.RingGeometry(width*.46,width*.50,64,1,0,Math.PI),xrayBasic(0xffe19a,.98,true)),70);openedEdge.scale.set(1,.43,1);openedEdge.position.copy(openedHull.position);openedEdge.rotation.copy(openedHull.rotation);g.add(openedEdge)}"
  );
  patched = patched.replace(
    "new THREE.LineBasicMaterial({color:0xd69a46,transparent:true,opacity:.76,depthTest:false,depthWrite:false})",
    "new THREE.LineBasicMaterial({color:0xffd76a,transparent:true,opacity:faction==='earth'?.76:0,depthTest:false,depthWrite:false})"
  );
  patched = patched.replace(
    "xrayBasic(0x4b5961,faction==='earth' ? .22 : .66,false)",
    "xrayBasic(0x4b5961,faction==='earth' ? .22 : .035,false)"
  );
  patched = patched.replace(
    "xrayBasic(0x111820,faction==='earth' ? .34 : .96,false)",
    "xrayBasic(0x111820,faction==='earth' ? .34 : .12,false)"
  );
  patched = patched.replace(
    "new THREE.LineBasicMaterial({color:0xb8894a,transparent:true,opacity:.74,depthTest:false,depthWrite:false})",
    "new THREE.LineBasicMaterial({color:0xffcf63,transparent:true,opacity:faction==='earth'?.74:.16,depthTest:false,depthWrite:false})"
  );
  patched = replaceExact(
    patched,
    "const fullH=w.passive?1.70:2.62,fullW=w.passive ? .96 : 1.50;",
    "const fullH=w.passive?1.70:(faction==='aurelian'?3.88:2.62),fullW=w.passive?.96:(faction==='aurelian'?2.48:1.50);",
    status,
    'cutawayArt'
  );
  patched = patched.replace(
    "restoreXrayShell();const root=localCommandVessel(),rooms=localXrayRooms(),pal=localXrayPaletteSet();",
    "restoreXrayShell();const root=localCommandVessel(),rooms=localXrayRooms(),pal=localXrayPaletteSet(),faction=factionForWorldSide(localXraySide());"
  );
  patched = patched.replace(
    "c.opacity=Math.min(.035,c.opacity??1);",
    "c.opacity=Math.min(faction==='aurelian'?.075:.035,c.opacity??1);"
  );
  patched = patched.replace(
    "const earthInterior=factionForWorldSide(localXraySide())==='earth';v.shell.material.opacity=(earthInterior ? .20 : .62)+b*.08;v.cavity.material.opacity=(earthInterior ? .30 : .92)+b*.04;v.edge.material.opacity=.64+pulse*.10-b*.14;v.damage.material.opacity=b>0?.05+b*.34:0;",
    "const earthInterior=factionForWorldSide(localXraySide())==='earth';v.shell.material.opacity=(earthInterior?.20:.025)+b*(earthInterior?.08:.025);v.cavity.material.opacity=(earthInterior?.30:.10)+b*(earthInterior?.04:.04);v.edge.material.opacity=(earthInterior?.64:.14)+pulse*(earthInterior?.10:.04)-b*(earthInterior?.14:.03);v.damage.material.opacity=b>0?.05+b*.34:0;"
  );
  patched = patched.replace("statusEl.textContent='FORTRESS CUTAWAY • TAP A NAMED WARRIOR'", "statusEl.textContent=factionForWorldSide(localXraySide())==='aurelian'?'AURELIAN HULL OPEN • SELECT WARRIOR':'FORTRESS CUTAWAY • TAP A NAMED WARRIOR'");

  patched = replaceExact(
    patched,
    ":`${name} SELECTED • WEAPON DEVELOPMENT PENDING`;",
    ":`${profile?.weapon||WEAPONS[w.weaponKey]?.name||name} • ${WEAPONS[w.weaponKey]?.description||'COMBAT READY'}`;",
    status,
    'weaponCard'
  );
  patched = patched.replace(
    "if(wd)wd.textContent=w.weaponKey==='acid_brute'?'CORROSIVE FLOOD • hydro-pack acid hose • stacking AOE':w.weaponKey==='spatial_disintegrator'?'MATTER COLLAPSE • Singularity Core • unstable array':w.weaponKey==='bombardier'?'HE-9 barrage • explosive siege fire':w.weaponKey==='sniper'?'EXPLOSIVE BREACH ROUND • precise compartment shot • small AOE':w.weaponKey==='combat_controller'?'TAC-LINK LOCATOR • delayed adaptive support • 3-turn cooldown':'5s burn-through • 2 compartments • exposes survivors';",
    "if(wd)wd.textContent=WEAPONS[w.weaponKey]?.description||p.weapon||'COMBAT READY';"
  );

  const hudHelper = `function updateSelectedBattleHud(w){
  if(!w)return;const profile=STARTER_PROFILES[w.weaponKey],meta=FACTION_META[factionForSide(w.side)]||FACTION_META.aurelian,target=document.getElementById(w.side==='aurelian'?'leftFactionSub':'rightFactionSub');
  if(target&&profile)target.textContent=\`${'${'}profile.name} • ${'${'}profile.weapon||WEAPONS[w.weaponKey]?.name||'COMBAT READY'} • ROOM ${'${'}Number.isInteger(w.roomIndex)?w.roomIndex+1:'-'}\`;
  diag('ACTIVE WARRIOR HUD',\`${'${'}w.side} ${'${'}w.weaponKey} room=${'${'}Number.isInteger(w.roomIndex)?w.roomIndex+1:'-'}\`)
}
`;
  if (!patched.includes('function updateSelectedBattleHud(')) {
    const next = patched.replace('function selectWarrior(w){', hudHelper + 'function selectWarrior(w){');
    status.selectedHud = next !== patched;
    patched = next;
  }
  patched = patched.replace("  selected=w;\n  for(const x of allWarriors)", "  selected=w;updateSelectedBattleHud(w);\n  for(const x of allWarriors)");

  patched = replaceExact(
    patched,
    "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid')endSoloPlayerTurnAfterShot();",
    "if(!['laser','explosive','acid','locator','solar_disk','sunadier'].includes(firedKind))endSoloPlayerTurnAfterShot();",
    status,
    'actionTurn'
  );
  if(!status.actionTurn){const next=patched.replace("if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='locator')endSoloPlayerTurnAfterShot();", "if(!['laser','explosive','acid','locator','solar_disk','sunadier'].includes(firedKind))endSoloPlayerTurnAfterShot();");status.actionTurn=next!==patched;patched=next}
  patched = patched.replaceAll("statusEl.textContent='SOLAR LANCER • BURN IN PROGRESS'", "statusEl.textContent='AURELIAN WEAPON • ATTACK IN PROGRESS'");
  patched = patched.replace("solarActionLock?'SOLAR LANCER • BURN IN PROGRESS'", "solarActionLock?'AURELIAN WEAPON • ATTACK IN PROGRESS'");

  const oldFireHandler = "if(m.type==='fire'){networkApplying=true;const team=m.side==='earth'?eWarriors:aWarriors,w=team.find(x=>x.active&&x.weaponKey===m.warrior)||team.find(x=>x.active&&x.hp>0)||team[0],routed=m.warrior||w?.weaponKey;diag('REMOTE ATTACK ROUTE',`${m.side} faction=${m.faction||mpFactionState?.[m.side]?.faction||'-'} warrior=${routed||'-'}`);fireWarriorFromStage(w,m.point,m.power,true,routed);networkApplying=false;mpRound=m.round||mpRound;if(Number.isInteger(m.turnCount))turnsTaken=m.turnCount;setMpTurn(m.nextTurn);return}";
  const newFireHandler = "if(m.type==='fire'){networkApplying=true;const team=m.side==='earth'?eWarriors:aWarriors,routed=m.warrior||m.weapon,w=team.find(x=>x.active&&x.weaponKey===routed)||team.find(x=>x.active&&x.hp>0)||team[0],point=m.point||m.aim;diag('REMOTE ATTACK ROUTE',`${m.side} faction=${m.faction||mpFactionState?.[m.side]?.faction||'-'} warrior=${routed||'-'}`);if(w&&point)fireWarriorFromStage(w,point,m.power,true,routed||w.weaponKey);else diag('REMOTE ATTACK ERROR',`warrior=${routed||'-'} point=${point?'Y':'N'}`);networkApplying=false;mpRound=m.round||mpRound;if(Number.isInteger(m.turnCount))turnsTaken=m.turnCount;return}";
  patched = replaceExact(patched, oldFireHandler, newFireHandler, status, 'multiplayerFire');

  const oldTurnHandler = "if(m.type==='turn'){mpRound=m.round||mpRound;if(Number.isInteger(m.turnCount))turnsTaken=m.turnCount;setMpTurn(m.turn);diag('ACTION TURN RELEASE',`turn=${m.turn} round=${mpRound} action=${turnsTaken}/${TURN_LIMIT}`);return}";
  const newTurnHandler = "if(m.type==='turn'){const release=()=>{mpRound=m.round||mpRound;if(Number.isInteger(m.turnCount))turnsTaken=m.turnCount;setMpTurn(m.turn);diag('ACTION TURN RELEASE',`turn=${m.turn} round=${mpRound} action=${turnsTaken}`)};if(solarActionLock||barrageActionLock||acidActionLock){const started=Date.now(),wait=()=>{if((solarActionLock||barrageActionLock||acidActionLock)&&Date.now()-started<12000){setTimeout(wait,100);return}release()};diag('ACTION TURN HOLD',`turn=${m.turn} waiting for weapon resolution`);wait();return}release();return}";
  patched = replaceExact(patched, oldTurnHandler, newTurnHandler, status, 'multiplayerTurn');
  patched = patched.replace(
    "mpTurn.textContent=`TURN ${Math.min(TURN_LIMIT,turnsTaken+1)}/${TURN_LIMIT} • ${mine?'YOUR TURN':`${fm.short} TURN`}`;",
    "mpTurn.textContent=`ROUND ${mpRound} • ${mine?'YOUR TURN':`${fm.short} TURN`}`;"
  );

  patched = replaceExact(
    patched,
    "function completeTurn(){turnsTaken=Math.min(TURN_LIMIT,turnsTaken+1);diag('TURN COMPLETE',`${turnsTaken}/${TURN_LIMIT}`);return turnsTaken>=TURN_LIMIT&&resolveTurnLimit()}",
    "function completeTurn(){turnsTaken+=1;diag('TURN COMPLETE',`${turnsTaken} • destruction victory mode`);checkMatchEnd();return matchEnded}",
    status,
    'destructionEnd'
  );

  patched = patched.replace(
    "const rect=objectScreenRect(rooms[i].hitPlane,0),entry=lineRectEntry(startStage,farStage,rect);if(entry)hits.push({room:rooms[i],roomIndex:i,entry,source:'exact-ray'});",
    "const rect=objectScreenRect(rooms[i].hitPlane,18),entry=lineRectEntry(startStage,farStage,rect);if(entry)hits.push({room:rooms[i],roomIndex:i,entry,source:'visible-ray'});"
  );
  patched = patched.replace(
    "hits.sort((a,b)=>a.entry.t-b.entry.t);const path=hits.slice(0,maxCompartments).map(h=>{const warrior=warriors.find(w=>w.roomIndex===h.roomIndex&&w.hp>0)||null;return{room:h.room,roomIndex:h.roomIndex,end:stagePointToRoomWorld(h.entry,h.room),warrior,direct:!!warrior,source:'exact-ray'}});",
    "if(!hits.length){const hull=visibleHullLineHit(attacker,startStage,farStage);if(hull){const i=nearestDamageableRoomToStagePoint(rooms,hull.hit);hits.push({room:rooms[i],roomIndex:i,entry:hull.hit,source:'visible-hull'})}}hits.sort((a,b)=>a.entry.t-b.entry.t);const path=hits.slice(0,maxCompartments).map(h=>{const warrior=warriors.find(w=>w.roomIndex===h.roomIndex&&w.hp>0)||null;return{room:h.room,roomIndex:h.roomIndex,end:stagePointToRoomWorld(h.entry,h.room),warrior,direct:!!warrior,source:h.source||'visible-ray'}});"
  );
  patched = patched.replace(
    "function resolveCaptainElimination(w,attacker){\n  if(!w?.isCaptain)return false;\n  if(FEATURE_FLAGS.multiWarriorSwitching){awardCaptainDamageBonus(w,attacker);return false}\n  const localCaptain=w.side===localWorldSide(),meta=FACTION_META[factionForSide(w.side)]||FACTION_META.earth;\n  diag('CAPTAIN MATCH END',`side=${w.side} local=${localCaptain?'Y':'N'} switching=N`);endMatch(localCaptain?'DEFEAT':'VICTORY',`${meta.short} CAPTAIN ELIMINATED`);return true\n}",
    "function resolveCaptainElimination(w,attacker){\n  if(!w?.isCaptain)return false;awardCaptainDamageBonus(w,attacker);diag('CAPTAIN ELIMINATION CONTINUES',`side=${w.side} structure=${Math.round(structureHp[w.side]||0)} crew remaining=${(w.side==='aurelian'?aCrew:eCrew).filter(x=>x.active&&x.hp>0).length}`);return false\n}"
  );

  patched = patched.replace(/3D LAB • MOBILE PVP TEST • v0\.33\.\d+/g, '3D LAB • MOBILE PVP TEST • v0.33.45');
  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.45');
  patched = patched.replace(/build=2026-08-(28|29|30)_[A-Z0-9_]+/g, 'build=2026-08-30_AURELIAN_CUTAWAY_PLASMA_CHAOS');
  const summary = Object.entries(status).map(([key,value])=>`${key}:${value?'OK':'MISS'}`).join(' ');
  patched = patched.replace('</head>', `<meta name="ac-combat-presentation-lock" content="${summary}">\n</head>`);
  return patched;
}
