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
    "const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2,spreadX=faction==='earth'?1.35:1.0,spreadY=faction==='earth'?1.28:1.0;"
  );
  patched = patched.replace(
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,.92,false)),68);",
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,faction==='earth'?.92:.22,false)),68);"
  );
  patched = patched.replace(
    "new THREE.LineBasicMaterial({color:0xd69a46,transparent:true,opacity:.76,depthTest:false,depthWrite:false})",
    "new THREE.LineBasicMaterial({color:0xffd76a,transparent:true,opacity:faction==='earth'?.76:.42,depthTest:false,depthWrite:false})"
  );
  patched = patched.replace(
    "xrayBasic(0x4b5961,faction==='earth' ? .22 : .66,false)",
    "xrayBasic(0x4b5961,faction==='earth' ? .22 : .18,false)"
  );
  patched = patched.replace(
    "xrayBasic(0x111820,faction==='earth' ? .34 : .96,false)",
    "xrayBasic(0x111820,faction==='earth' ? .34 : .70,false)"
  );
  patched = patched.replace(
    "new THREE.LineBasicMaterial({color:0xb8894a,transparent:true,opacity:.74,depthTest:false,depthWrite:false})",
    "new THREE.LineBasicMaterial({color:0xffcf63,transparent:true,opacity:faction==='earth'?.74:.34,depthTest:false,depthWrite:false})"
  );
  patched = replaceExact(
    patched,
    "const fullH=w.passive?1.70:2.62,fullW=w.passive ? .96 : 1.50;",
    "const fullH=w.passive?1.70:(faction==='aurelian'?3.18:2.62),fullW=w.passive?.96:(faction==='aurelian'?2.05:1.50);",
    status,
    'cutawayArt'
  );
  patched = patched.replace(
    "restoreXrayShell();const root=localCommandVessel(),rooms=localXrayRooms(),pal=localXrayPaletteSet();",
    "restoreXrayShell();const root=localCommandVessel(),rooms=localXrayRooms(),pal=localXrayPaletteSet(),faction=factionForWorldSide(localXraySide());"
  );
  patched = patched.replace(
    "c.opacity=Math.min(.035,c.opacity??1);",
    "c.opacity=Math.min(faction==='aurelian'?.16:.035,c.opacity??1);"
  );

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
    "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='locator')endSoloPlayerTurnAfterShot();",
    "if(!['laser','explosive','acid','locator','solar_disk','sunadier'].includes(firedKind))endSoloPlayerTurnAfterShot();",
    status,
    'actionTurn'
  );
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

  patched = patched.replace(/3D LAB • MOBILE PVP TEST • v0\.33\.\d+/g, '3D LAB • MOBILE PVP TEST • v0.33.44');
  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.44');
  patched = patched.replace(/build=2026-08-(28|29|30)_[A-Z0-9_]+/g, 'build=2026-08-30_AURELIAN_COMBAT_PRESENTATION_LOCK');
  const summary = Object.entries(status).map(([key,value])=>`${key}:${value?'OK':'MISS'}`).join(' ');
  patched = patched.replace('</head>', `<meta name="ac-combat-presentation-lock" content="${summary}">\n</head>`);
  return patched;
}
