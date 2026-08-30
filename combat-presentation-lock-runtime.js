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
    "const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2,spreadX=faction==='earth'?1.35:1.12,spreadY=faction==='earth'?1.28:.72;"
  );
  patched = patched.replace(
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,.92,false)),68);",
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,faction==='earth'?.92:0,false)),68);"
  );
  patched = patched.replace(
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,faction==='earth'?.92:0,false)),68);cutaway.position.set(0,0,.10);g.add(cutaway);",
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,faction==='earth'?.92:0,false)),68);cutaway.position.set(0,0,.10);g.add(cutaway);if(faction==='aurelian'){g.userData.aurelianHullCutaway=true;const aperture=markXray(new THREE.Mesh(new THREE.CircleGeometry(width*.50,72),xrayBasic(0x120603,.82,false)),67);aperture.scale.set(1,.38,1);aperture.position.set(0,0,.08);g.add(aperture);const hullShoulder=markXray(new THREE.Mesh(new THREE.RingGeometry(width*.50,width*.66,72),xrayBasic(0xb96d1e,.92,false)),68);hullShoulder.scale.set(1,.38,1);hullShoulder.position.set(0,0,.10);g.add(hullShoulder);const apertureRim=markXray(new THREE.Mesh(new THREE.RingGeometry(width*.485,width*.515,72),xrayBasic(0xffd669,.98,true)),70);apertureRim.scale.set(1,.38,1);apertureRim.position.set(0,0,.22);g.add(apertureRim);for(const side of[-1,1]){const panel=markXray(new THREE.Mesh(new THREE.CircleGeometry(width*.35,56,side<0?0:Math.PI,Math.PI),xrayBasic(0xd5892c,.96,false)),70);panel.scale.set(1,.38,1);panel.position.set(side*width*.42,height*.28,1.10);panel.rotation.z=side*.18;panel.rotation.y=side*.72;g.add(panel);const edge=markXray(new THREE.Mesh(new THREE.RingGeometry(width*.33,width*.355,56,1,side<0?0:Math.PI,Math.PI),xrayBasic(0xffffb0,1,true)),71);edge.scale.copy(panel.scale);edge.position.copy(panel.position);edge.rotation.copy(panel.rotation);g.add(edge)}const hinge=markXray(new THREE.Mesh(new THREE.BoxGeometry(width*.72,.20,.20),xrayBasic(0xffc65f,.96,true)),72);hinge.position.set(0,height*.25,.72);g.add(hinge)}"
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
    "const fullH=w.passive?1.70:(faction==='aurelian'?4.20:2.62),fullW=w.passive?.96:(faction==='aurelian'?2.75:1.50);",
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
  patched = patched.replace("statusEl.textContent='FORTRESS CUTAWAY • SELECT YOUR WARRIOR'", "statusEl.textContent=factionForWorldSide(localXraySide())==='aurelian'?'AURELIAN HULL OPEN • SELECT WARRIOR':'FORTRESS CUTAWAY • SELECT YOUR WARRIOR'");
  patched = patched.replace("if(w.sprite)w.sprite.visible=show&&!xrayMine&&!enemyExposed;", "if(w.sprite)w.sprite.visible=show&&!xrayMine&&(!enemyExposed||!w.passive);");
  patched = patched.replace("if(w.healthBase)w.healthBase.visible=healthVisible;", "if(w.healthBase)w.healthBase.visible=healthVisible&&w.passive;");
  patched = patched.replace("if(w.healthFill){w.healthFill.visible=healthVisible;", "if(w.healthFill){w.healthFill.visible=healthVisible&&w.passive;");

  const damageReactionHelper = `function spawnCrewDamageReaction(w,amount,killed=false){
  if(!w?.sprite||!w.active)return;const room=w.roomGroup?.userData?.rooms?.[w.roomIndex],revealed=warriorShouldBeVisible(w)&&(!w.passive||crewExposureTier(room)>=3);if(!room||!revealed)return;const point=warriorWorld(w),objects=[],flare=glowSphere(killed?1.10:.72,killed?0xff542f:0xffd27a,14);flare.material.transparent=true;flare.material.opacity=.86;flare.position.copy(point);scene.add(flare);objects.push(flare);const ring=new THREE.Mesh(new THREE.RingGeometry(.34,killed?1.25:.86,32),new THREE.MeshBasicMaterial({color:killed?0xff5533:0xffe5a1,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));ring.position.copy(point);ring.lookAt(camera.position);scene.add(ring);objects.push(ring);for(let i=0;i<8;i++){const spark=glowSphere(.07+Math.random()*.08,i%3?0xff9b39:0xffffff,8);spark.material.transparent=true;spark.material.opacity=.92;spark.position.copy(point).add(new THREE.Vector3((Math.random()-.5)*1.2,(Math.random()-.5)*1.7,.35));scene.add(spark);objects.push(spark)}effects.push({objects,life:killed?.82:.48,max:killed?.82:.48});const token=(w.damageReactionSeq||0)+1;w.damageReactionSeq=token;const sprite=w.sprite,base=sprite.position.clone(),baseScale=sprite.scale.clone(),oldColor=sprite.material.color.clone(),start=performance.now(),duration=killed?620:360;(function react(now){if(w.damageReactionSeq!==token||!sprite.parent)return;const t=Math.min(1,(now-start)/duration),kick=Math.sin(Math.PI*t)*(killed?1.25:.62),side=w.side==='earth'?-1:1;sprite.position.copy(base).add(new THREE.Vector3(side*kick,-(killed?t*t*.85:Math.sin(Math.PI*t)*.12),.18*Math.sin(Math.PI*t)));sprite.rotation.z=side*(killed?.62:.20)*Math.sin(Math.PI*t);sprite.scale.copy(baseScale).multiplyScalar(1+.08*Math.sin(Math.PI*t));sprite.material.color.setHex(t<.34?0xffffff:t<.68?0xff7a45:w.assignedColor);if(t<1){requestAnimationFrame(react);return}sprite.position.copy(base);sprite.rotation.z=0;sprite.scale.copy(baseScale);sprite.material.color.copy(oldColor)})(start);diag('CREW DAMAGE REACTION',(w.displayName||STARTER_PROFILES[w.weaponKey]?.name||'WARRIOR')+' hpHit='+Math.round(amount)+' killed='+(killed?'Y':'N'))
}
`;
  if(!patched.includes('function spawnCrewDamageReaction('))patched=patched.replace('function applyWarriorDamage(w,amount,label,attacker=null){', damageReactionHelper+'function applyWarriorDamage(w,amount,label,attacker=null){');
  patched = patched.replace("oldColor=sprite.material.color.clone(),start=performance.now()", "oldColor=sprite.material.color.clone(),oldRotation=sprite.material.rotation||0,start=performance.now()");
  patched = patched.replace("sprite.rotation.z=side*(killed?.62:.20)*Math.sin(Math.PI*t);", "sprite.material.rotation=oldRotation+side*(killed?.62:.20)*Math.sin(Math.PI*t);");
  patched = patched.replace("sprite.position.copy(base);sprite.rotation.z=0;sprite.scale.copy(baseScale);", "sprite.position.copy(base);sprite.material.rotation=oldRotation;sprite.scale.copy(baseScale);");
  patched = patched.replace("if(hpDamage>0&&w.sprite){const old=w.sprite.material.color.clone();w.sprite.material.color.setHex(0xff7048);setTimeout(()=>{if(w.sprite?.material)w.sprite.material.color.copy(old)},140)}", "if(hpDamage>0)spawnCrewDamageReaction(w,hpDamage,w.hp===0)");

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
    "function completeTurn(){turnsTaken+=1;diag('TURN COMPLETE',`${turnsTaken} • two-condition victory mode`);checkMatchEnd();return matchEnded}",
    status,
    'destructionEnd'
  );

  patched = patched.replace(
    "const rect=objectScreenRect(rooms[i].hitPlane,0),entry=lineRectEntry(startStage,farStage,rect);if(entry)hits.push({room:rooms[i],roomIndex:i,entry,source:'exact-ray'});",
    "const room=rooms[i],occupant=warriors.find(w=>w.roomIndex===i&&w.hp>0)||null;if((room.erased||room.armor<=0)&&!occupant)continue;const rect=objectScreenRect(room.hitPlane,18),entry=lineRectEntry(startStage,farStage,rect);if(entry)hits.push({room,roomIndex:i,entry,source:'visible-ray'});"
  );
  patched = patched.replace(
    "hits.sort((a,b)=>a.entry.t-b.entry.t);const path=hits.slice(0,maxCompartments).map(h=>{const warrior=warriors.find(w=>w.roomIndex===h.roomIndex&&w.hp>0)||null;return{room:h.room,roomIndex:h.roomIndex,end:stagePointToRoomWorld(h.entry,h.room),warrior,direct:!!warrior,source:'exact-ray'}});",
    "if(!hits.length){const hull=visibleHullLineHit(attacker,startStage,farStage);if(hull){const i=nearestDamageableRoomToStagePoint(rooms,hull.hit);hits.push({room:rooms[i],roomIndex:i,entry:hull.hit,source:'visible-hull'})}}hits.sort((a,b)=>a.entry.t-b.entry.t);const path=hits.slice(0,maxCompartments).map(h=>{const warrior=warriors.find(w=>w.roomIndex===h.roomIndex&&w.hp>0)||null;return{room:h.room,roomIndex:h.roomIndex,end:stagePointToRoomWorld(h.entry,h.room),warrior,direct:!!warrior,source:h.source||'visible-ray'}});"
  );
  patched = patched.replace(
    "function resolveCaptainElimination(w,attacker){\n  if(!w?.isCaptain)return false;\n  if(FEATURE_FLAGS.multiWarriorSwitching){awardCaptainDamageBonus(w,attacker);return false}\n  const localCaptain=w.side===localWorldSide(),meta=FACTION_META[factionForSide(w.side)]||FACTION_META.earth;\n  diag('CAPTAIN MATCH END',`side=${w.side} local=${localCaptain?'Y':'N'} switching=N`);endMatch(localCaptain?'DEFEAT':'VICTORY',`${meta.short} CAPTAIN ELIMINATED`);return true\n}",
    "function resolveCaptainElimination(w,attacker){\n  if(!w?.isCaptain)return false;awardCaptainDamageBonus(w,attacker);diag('CAPTAIN ELIMINATION CONTINUES',`side=${w.side} structure=${Math.round(structureHp[w.side]||0)} crew remaining=${(w.side==='aurelian'?aCrew:eCrew).filter(x=>x.active&&x.hp>0).length}`);return false\n}"
  );
  patched = patched.replace(
    "const room=hit.room,index=hit.roomIndex,before=room.armor;\n    const shield=absorbShieldHit(attacker,index,weapon.armorDamage||4,'SOLAR EXACT RAY',hit.end);",
    "const room=hit.room,index=hit.roomIndex,before=room.armor,channelOcc=opposing(attacker).find(w=>w.roomIndex===index&&w.hp>0);if((room.erased||room.armor<=0)&&!channelOcc){const channelDamage=applyStructureDamage(attacker,weapon.armorDamage||4,'SOLAR OPEN CHANNEL');spawnImpactBurst(hit.end,0xffe8a4);diag('SOLAR OPEN CHANNEL',`room=${index+1} rearHull=${channelDamage}`);continue}\n    const shield=absorbShieldHit(attacker,index,weapon.armorDamage||4,'SOLAR EXACT RAY',hit.end);"
  );

  patched = patched.replace(/3D LAB • MOBILE PVP TEST • v0\.33\.\d+/g, '3D LAB • MOBILE PVP TEST • v0.33.48');
  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.48');
  patched = patched.replace(/build=2026-08-(28|29|30)_[A-Z0-9_]+/g, 'build=2026-08-30_AURELIAN_CINEMATIC_ROUND_ROBIN');
  const summary = Object.entries(status).map(([key,value])=>`${key}:${value?'OK':'MISS'}`).join(' ');
  patched = patched.replace('</head>', `<meta name="ac-combat-presentation-lock" content="${summary}">\n</head>`);
  return patched;
}
