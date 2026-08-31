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
    multiplayerRecovery:false,
    multiplayerReject:false,
    destructionEnd:false,
    impactCamera:false,
    impactTrigger:false,
    earthCutaway:false,
    earthHullPanels:false,
    xrayCamera:false,
    damageCallout:false,
    physicalCutaway:false,
    impactReveal:false,
    messageSequence:false,
    tornWreck:false,
    particleBudget:false
  };

  // Cutaway layout and hull visibility are owned by the canonical implementation in index.html.

  // The canonical physical cutaway now lives directly in index.html. Do not layer the former
  // runtime replacement over it; that legacy double-render path caused stale room anchors and
  // inconsistent alive/dead presentation.
  const damageReactionHelper = `function spawnCrewDamageReaction(w,amount,killed=false){
  if(!w?.sprite||!w.active)return;const room=w.roomGroup?.userData?.rooms?.[w.roomIndex],impactSprite=w.impactRevealSprite?.parent?w.impactRevealSprite:null,revealed=!!impactSprite||(warriorShouldBeVisible(w)&&(!w.passive||crewExposureTier(room)>=3));if(!room)return;if(killed)spawnWarriorDeathConfirmation(w);if(!revealed)return;
  const point=impactSprite?impactSprite.getWorldPosition(new THREE.Vector3()):warriorWorld(w),objects=[],flare=glowSphere(killed?1.10:.72,killed?0xff542f:0xffd27a,14);flare.material.transparent=true;flare.material.opacity=.86;flare.position.copy(point);scene.add(flare);objects.push(flare);const ring=new THREE.Mesh(new THREE.RingGeometry(.34,killed?1.25:.86,32),new THREE.MeshBasicMaterial({color:killed?0xff5533:0xffe5a1,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));ring.position.copy(point);ring.lookAt(camera.position);scene.add(ring);objects.push(ring);for(let i=0;i<8;i++){const spark=glowSphere(.07+Math.random()*.08,i%3?0xff9b39:0xffffff,8);spark.material.transparent=true;spark.material.opacity=.92;spark.position.copy(point).add(new THREE.Vector3((Math.random()-.5)*1.2,(Math.random()-.5)*1.7,.35));scene.add(spark);objects.push(spark)}effects.push({objects,life:killed?.82:.48,max:killed?.82:.48});
  const token=(w.damageReactionSeq||0)+1;w.damageReactionSeq=token;const sprites=[w.sprite,impactSprite].filter((s,i,a)=>s?.parent&&a.indexOf(s)===i),states=sprites.map(sprite=>({sprite,base:sprite.position.clone(),scale:(sprite.userData.fixedDamageScale||sprite.scale).clone(),color:sprite.material.color.clone(),rotation:sprite.material.rotation||0,opacity:sprite.material.opacity})),start=performance.now(),duration=killed?980:660;
  (function react(now){if(w.damageReactionSeq!==token)return;const t=Math.min(1,(now-start)/duration),kick=Math.sin(Math.PI*t)*(killed?.72:.34),side=w.side==='earth'?-1:1;for(const state of states){const sprite=state.sprite;if(!sprite.parent)continue;sprite.position.copy(state.base).add(new THREE.Vector3(side*kick,killed?-t*t*.72:-Math.sin(Math.PI*t)*.10,.12*Math.sin(Math.PI*t)));sprite.scale.copy(state.scale);sprite.material.rotation=state.rotation+side*(killed?1.12:.16)*(killed?t:Math.sin(Math.PI*t));sprite.material.color.setHex(t<.30?0xffffff:t<.66?0xff6a3d:0x7a2522);if(killed)sprite.material.opacity=Math.max(.48,1-t*.52)}if(t<1){requestAnimationFrame(react);return}for(const state of states){const sprite=state.sprite;if(!sprite.parent)continue;sprite.scale.copy(state.scale);if(!killed){sprite.position.copy(state.base);sprite.material.rotation=state.rotation;sprite.material.color.copy(state.color);sprite.material.opacity=state.opacity}}})(start);diag('CREW DAMAGE REACTION',(w.displayName||STARTER_PROFILES[w.weaponKey]?.name||'WARRIOR')+' hpHit='+Math.round(amount)+' killed='+(killed?'Y':'N')+' fixedScale=Y')
}
`;
  if(!patched.includes('function spawnCrewDamageReaction('))patched=patched.replace('function applyWarriorDamage(w,amount,label,attacker=null){', damageReactionHelper+'function applyWarriorDamage(w,amount,label,attacker=null){');
  patched = patched.replace("oldColor=sprite.material.color.clone(),start=performance.now()", "oldColor=sprite.material.color.clone(),oldRotation=sprite.material.rotation||0,start=performance.now()");
  patched = patched.replace("sprite.rotation.z=side*(killed?.62:.20)*Math.sin(Math.PI*t);", "sprite.material.rotation=oldRotation+side*(killed?.62:.20)*Math.sin(Math.PI*t);");
  patched = patched.replace("sprite.position.copy(base);sprite.rotation.z=0;sprite.scale.copy(baseScale);", "sprite.position.copy(base);sprite.material.rotation=oldRotation;sprite.scale.copy(baseScale);");
  patched = patched.replace("if(hpDamage>0&&w.sprite){const old=w.sprite.material.color.clone();w.sprite.material.color.setHex(0xff7048);setTimeout(()=>{if(w.sprite?.material)w.sprite.material.color.copy(old)},140)}", "if(hpDamage>0)spawnCrewDamageReaction(w,hpDamage,w.hp===0)");

  const sequencedMessages = patched.replace(
    "function flashDamage(text){\n  const now=performance.now();damageFlash.textContent=text;damageFlash.style.opacity='1';\n  if(!flashDamage.visibleSince||now-flashDamage.visibleSince>620)flashDamage.visibleSince=now;\n  clearTimeout(flashDamage.t);const remaining=Math.max(70,360-(now-flashDamage.visibleSince));\n  flashDamage.t=setTimeout(()=>{damageFlash.style.opacity='0';flashDamage.visibleSince=0},remaining)\n}",
    "function flashDamage(text){flashDamage.queue=flashDamage.queue||[];if(flashDamage.active){if(flashDamage.queue.length<4)flashDamage.queue.push(text);return}flashDamage.active=true;damageFlash.textContent=text;damageFlash.style.opacity='1';clearTimeout(flashDamage.t);flashDamage.t=setTimeout(()=>{damageFlash.style.opacity='0';setTimeout(()=>{flashDamage.active=false;const next=flashDamage.queue.shift();if(next)flashDamage(next)},110)},480)}"
  );
  status.messageSequence = sequencedMessages !== patched;
  patched = sequencedMessages;
  patched = patched.replace("flashDamage(`${state} • RESISTED ${absorbed}`);return{absorbed,passed,blocked:passed<=0,openBefore:false}", "diag('SHIELD NOTICE',`${state} resisted=${absorbed}`);return{absorbed,passed,blocked:passed<=0,openBefore:false}");

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
  const newTurnHandler = "if(m.type==='turn'){const nextTurn=m.turn||m.nextTurn||m.side,validTurn=nextTurn==='aurelian'||nextTurn==='earth',release=()=>{if(!validTurn){diag('ACTION TURN ERROR','missing authoritative turn');recoverMpAuthoritativeState('missing turn payload');return}mpRound=m.round||mpRound;if(Number.isInteger(m.turnCount))turnsTaken=m.turnCount;setMpTurn(nextTurn);diag('ACTION TURN RELEASE',`turn=${nextTurn} round=${mpRound} action=${turnsTaken}`)};if(solarActionLock||barrageActionLock||acidActionLock){const started=Date.now(),wait=()=>{if((solarActionLock||barrageActionLock||acidActionLock)&&Date.now()-started<12000){setTimeout(wait,100);return}release()};diag('ACTION TURN HOLD',`turn=${nextTurn||'MISSING'} waiting for weapon resolution`);wait();return}release();return}";
  patched = replaceExact(patched, oldTurnHandler, newTurnHandler, status, 'multiplayerTurn');
  const oldRecovery = "mpPlayStarted=true;mpPlayReady=true;mpHandshakePhase='battle_recovered';\n      startNetworkBattle({type:'start',deployments:st.deployments,factions:st.factions,turn:st.turn||'aurelian',round:st.round||1,positions:st.positions,moveUsed:st.moveUsed,recovered:true});\n      if(battleStarted){\n        mpRound=st.round||mpRound;setMpTurn(st.turn||currentTurn);applyAuthoritativeMovementState(st,'recovery');ensureLocalBattleWarriorActive('authoritative recovery');rearmMultiplayerInput(`recovery:${reason}`,320);\n      }";
  const newRecovery = "mpPlayStarted=true;mpPlayReady=true;mpHandshakePhase='battle_recovered';\n      if(!battleStarted)startNetworkBattle({type:'start',deployments:st.deployments,factions:st.factions,turn:st.turn||'aurelian',round:st.round||1,positions:st.positions,moveUsed:st.moveUsed,recovered:true});\n      else{mpRound=st.round||mpRound;setMpTurn(st.turn||currentTurn);applyAuthoritativeMovementState(st,'recovery');ensureLocalBattleWarriorActive('authoritative recovery');rearmMultiplayerInput(`recovery:${reason}`,320);diag('MP LIVE RESUME',`turn=${st.turn||currentTurn} worldReset=N`)}";
  patched = replaceExact(patched, oldRecovery, newRecovery, status, 'multiplayerRecovery');
  const oldErrorHandler = "if(m.type==='error'){diag('NETWORK REJECT',`${m.code||'ERROR'} ${m.message||'Unknown network error'}`);statusEl.textContent=`NETWORK • ${m.message}`;mpStatus.textContent=m.message;if(m.code==='INVALID_SHOT'||m.code==='NOT_TURN'||m.code==='MATCH_INACTIVE')rearmMultiplayerInput(`server reject:${m.code}`,240);return}";
  const newErrorHandler = "if(m.type==='error'){diag('NETWORK REJECT',`${m.code||'ERROR'} ${m.message||'Unknown network error'}`);statusEl.textContent=`NETWORK • ${m.message}`;mpStatus.textContent=m.message;if(m.code==='NOT_TURN'){mpInputArmAt=Date.now()+600;recoverMpAuthoritativeState('server reject:NOT_TURN');return}if(m.code==='ACTION_LOCKED'){setTimeout(()=>{if(multiplayer&&!matchEnded&&currentTurn===localSide)rearmMultiplayerInput('server action lock elapsed',0)},700);return}if(m.code==='INVALID_SHOT'||m.code==='MATCH_INACTIVE')rearmMultiplayerInput(`server reject:${m.code}`,240);return}";
  patched = replaceExact(patched, oldErrorHandler, newErrorHandler, status, 'multiplayerReject');
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
    "const earthAlive=eCrew.some(w=>w.active&&w.hp>0),aurelianAlive=aCrew.some(w=>w.active&&w.hp>0);",
    "const earthAlive=eWarriors.some(w=>w.active&&w.hp>0),aurelianAlive=aWarriors.some(w=>w.active&&w.hp>0),earthShadowsAlive=eShadows.filter(w=>w.active&&w.hp>0).length,aurelianShadowsAlive=aShadows.filter(w=>w.active&&w.hp>0).length;diag('VICTORY CREW CHECK',`earthCombat=${earthAlive?'ALIVE':'DOWN'} earthBackground=${earthShadowsAlive} aurelianCombat=${aurelianAlive?'ALIVE':'DOWN'} aurelianBackground=${aurelianShadowsAlive}`);"
  );
  patched = patched.replace(
    "if(hit.room.erased){diag('HIT RESULT',`${weapon.name} MISS`);statusEl.textContent=`${weapon.name} • MISS • NO DAMAGE`;updateDamageMonitor(null,-1,0,attacker);flashDamage('MISS');return{armorDamage:0,unitDamage:0}}",
    "if(hit.room.erased&&weapon.kind==='solar_disk'&&hit.warrior?.active&&hit.warrior.hp>0){const unitDamage=applyWarriorDamage(hit.warrior,weapon.damage||28,'SUN DISK OPEN-COMPARTMENT SLICE',attacker),structureDamage=applyStructureDamage(attacker,Math.max(4,Math.round((weapon.armorDamage||30)*.42)),'SUN DISK OPEN-COMPARTMENT SLICE');diag('SUN DISK EXPOSED CREW SLICE',`room=${hit.roomIndex+1} unit=${unitDamage} hull=${structureDamage}`);statusEl.textContent=`SUN DISK CUTTER • EXPOSED ROOM ${hit.roomIndex+1} • UNIT -${unitDamage}`;flashDamage(`SLICE • -${unitDamage} UNIT`);return{armorDamage:0,unitDamage,structureDamage}}if(hit.room.erased){diag('HIT RESULT',`${weapon.name} MISS`);statusEl.textContent=`${weapon.name} • MISS • NO DAMAGE`;updateDamageMonitor(null,-1,0,attacker);flashDamage('MISS');return{armorDamage:0,unitDamage:0}}"
  );
  patched = patched.replace(
    "const room=hit.room,index=hit.roomIndex,before=room.armor;\n    const shield=absorbShieldHit(attacker,index,weapon.armorDamage||4,'SOLAR EXACT RAY',hit.end);",
    "const room=hit.room,index=hit.roomIndex,before=room.armor,channelOcc=opposing(attacker).find(w=>w.roomIndex===index&&w.hp>0);if((room.erased||room.armor<=0)&&!channelOcc){const channelDamage=applyStructureDamage(attacker,weapon.armorDamage||4,'SOLAR OPEN CHANNEL');spawnImpactBurst(hit.end,0xffe8a4);diag('SOLAR OPEN CHANNEL',`room=${index+1} rearHull=${channelDamage}`);continue}\n    const shield=absorbShieldHit(attacker,index,weapon.armorDamage||4,'SOLAR EXACT RAY',hit.end);"
  );

  const impactHelpers = `let impactFocusSide=null,impactFocusPoint=null,impactFocusUntil=0,impactFocusTimer=null;
function beginImpactFocus(side,roomIndex,label,duration=1750,force=false){
  if(xrayOpen||(!force&&matchEnded))return;const roomSet=side==='aurelian'?aRooms:eRooms,room=Number.isInteger(roomIndex)?roomSet?.userData?.rooms?.[roomIndex]:null;impactFocusSide=side;impactFocusPoint=room?.hitPlane?.getWorldPosition(new THREE.Vector3())||null;impactFocusUntil=performance.now()+duration;document.body.classList.add('acImpactFocus');clearTimeout(impactFocusTimer);impactFocusTimer=setTimeout(()=>{impactFocusSide=null;impactFocusPoint=null;impactFocusUntil=0;document.body.classList.remove('acImpactFocus');if(battleStarted)updateBattleCamera()},duration+140);diag('IMPACT CAMERA',\`side=\${side} room=\${Number.isInteger(roomIndex)?roomIndex+1:'HULL'} label=\${label||'IMPACT'} hold=\${duration}\`)
}
function clearImpactFocus(){clearTimeout(impactFocusTimer);impactFocusTimer=null;impactFocusSide=null;impactFocusPoint=null;impactFocusUntil=0;document.body.classList.remove('acImpactFocus');clearImpactCompartmentReveal()}
function spawnWarriorDeathConfirmation(w){
 if(!w||w.deathConfirmationShown)return;w.deathConfirmationShown=true;beginImpactFocus(w.side,w.roomIndex,'WARRIOR DEAD',2450,true);const profile=STARTER_PROFILES[w.weaponKey],name=(profile?.name||'WARRIOR').toUpperCase(),hasImpactPortrait=!!w.impactRevealSprite?.parent,bodyPoint=hasImpactPortrait?w.impactRevealSprite.getWorldPosition(new THREE.Vector3()):warriorWorld(w),point=bodyPoint.clone().add(new THREE.Vector3(0,2.65,1.10)),objects=[],c=document.createElement('canvas');c.width=768;c.height=160;const x=c.getContext('2d');x.fillStyle='rgba(16,2,3,.97)';x.fillRect(4,4,760,152);x.lineWidth=10;x.strokeStyle='#ff493d';x.strokeRect(5,5,758,150);x.fillStyle='#ff493d';x.font='1000 48px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText('WARRIOR DEAD',384,53);x.fillStyle='#ffffff';x.font='900 '+(name.length>20?28:34)+'px system-ui';x.fillText(name+'  •  ROOM '+(w.roomIndex+1),384,111);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.userData.xrayOwnedMap=true;const banner=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,opacity:1,depthTest:false,depthWrite:false}));banner.position.copy(point);banner.scale.set(7.8,1.62,1);banner.renderOrder=132;scene.add(banner);objects.push(banner);if(!hasImpactPortrait&&w.sprite?.material?.map){const fallen=new THREE.Sprite(new THREE.SpriteMaterial({map:w.sprite.material.map,color:0xa84d4d,transparent:true,opacity:.90,rotation:w.side==='earth'?-1.08:1.08,depthTest:false,depthWrite:false}));fallen.position.copy(bodyPoint).add(new THREE.Vector3(0,-.18,1.35));fallen.scale.set(2.65,3.86,1);fallen.renderOrder=131;scene.add(fallen);objects.push(fallen)}effects.push({objects,life:2.45,max:2.45});statusEl.textContent=name+' • WARRIOR DEAD • ROOM '+(w.roomIndex+1);flashDamage('WARRIOR DEAD');diag('WARRIOR DEATH CONFIRMED',(w.weaponKey||'warrior')+' room='+(w.roomIndex+1)+' visibleHold=2450ms portrait='+(hasImpactPortrait?'IMPACT':'FALLEN_CLONE'))
}
function animatePhysicalCutawayPanels(group){const panels=[];group?.traverse(o=>{if(o.userData?.cutawayPanel)panels.push(o)});const start=performance.now(),duration=620;(function open(now){if(!group?.parent)return;const t=Math.min(1,(now-start)/duration),e=1-Math.pow(1-t,3);for(const p of panels){const d=p.userData.cutawayPanel;p.position.copy(d.closed).lerp(d.open,e);p.rotation.set(d.rotation.x*e,d.rotation.y*e,d.rotation.z*e)}if(t<1)requestAnimationFrame(open)})(start)}
let activeImpactCompartmentReveal=null;
function clearImpactCompartmentReveal(){const state=activeImpactCompartmentReveal;if(!state)return;activeImpactCompartmentReveal=null;clearTimeout(state.timer);for(const obj of state.hidden)if(obj?.parent)obj.visible=true;for(const item of state.removedPanels||[])if(item?.mesh?.parent)item.mesh.visible=item.visible;if(state.occupant){state.occupant.impactRevealSprite=null;state.occupant.impactRevealGroup=null}if(state.module)state.module.visible=state.moduleWasVisible&&!state.room.erased&&!state.module.userData?.structureHpHidden;state.group?.parent?.remove(state.group)}
function spawnImpactCompartmentReveal(attacker,hit,duration=1450){
 if(!hit?.room||!Number.isInteger(hit.roomIndex))return;clearImpactCompartmentReveal();const room=hit.room,targetSide=structureTargetSide(attacker),targetCrew=opposing(attacker),hidden=[];
 for(const other of targetCrew)for(const key of['sprite','xrayGlow','healthBase','healthFill']){const obj=other[key];if(obj?.visible){hidden.push(obj);obj.visible=false}}
 const skin=targetSide==='aurelian'?factionSkinA:factionSkinE,module=skin?.userData?.damageModules?.[hit.roomIndex]||null,moduleWasVisible=!!module?.visible,removedPanels=[];if(module)module.visible=false;const removePanel=mesh=>{if(!mesh||mesh===module||mesh.visible===false||mesh.userData?.healthVisual||mesh.userData?.xrayVisual||removedPanels.some(x=>x.mesh===mesh))return;removedPanels.push({mesh,visible:mesh.visible});mesh.visible=false};if(hit.hullObject&&isDescendantOf(hit.hullObject,skin))removePanel(hit.hullObject);if(!removedPanels.length){const aperture=new THREE.Box3().setFromCenterAndSize(room.hitPlane.getWorldPosition(new THREE.Vector3()),new THREE.Vector3(5.8,4.8,6.4)),choices=[];for(const part of skin?.children||[]){if(!part?.isMesh||!part.visible||part.userData?.wreckPersistent)continue;const box=new THREE.Box3().setFromObject(part);if(box.isEmpty()||!box.intersectsBox(aperture))continue;const size=box.getSize(new THREE.Vector3());choices.push({part,volume:size.x*size.y*size.z})}choices.sort((a,b)=>b.volume-a.volume);for(const choice of choices.slice(0,1))removePanel(choice.part)}
 const group=new THREE.Group(),point=room.hitPlane.getWorldPosition(new THREE.Vector3()),rotation=room.hitPlane.getWorldQuaternion(new THREE.Quaternion()),aurelianTarget=factionForSide(targetSide)==='aurelian';group.position.copy(point);group.quaternion.copy(rotation);group.renderOrder=110;scene.add(group);
 const metal=new THREE.MeshBasicMaterial({color:aurelianTarget?0x75451d:0x34454f,transparent:true,opacity:.98,depthTest:false,depthWrite:false}),inside=new THREE.MeshBasicMaterial({color:0x061019,transparent:true,opacity:.99,depthTest:false,depthWrite:false}),burn=new THREE.MeshBasicMaterial({color:0x1c0a08,transparent:true,opacity:.98,depthTest:false,depthWrite:false});
 const back=new THREE.Mesh(new THREE.BoxGeometry(5.35,3.72,.30),inside),floor=new THREE.Mesh(new THREE.BoxGeometry(5.35,.24,2.05),burn),ceiling=new THREE.Mesh(new THREE.BoxGeometry(5.35,.18,1.90),inside),leftWall=new THREE.Mesh(new THREE.BoxGeometry(.20,3.72,1.95),metal),rightWall=leftWall.clone();back.position.z=-.78;floor.position.set(0,-1.72,.10);ceiling.position.set(0,1.72,-.02);leftWall.position.set(-2.58,0,-.02);rightWall.position.set(2.58,0,-.02);group.add(back,floor,ceiling,leftWall,rightWall);const outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.48,3.88,.48)),new THREE.LineBasicMaterial({color:aurelianTarget?0xffc85a:0xa4e5ff,transparent:true,opacity:.84,depthTest:false,depthWrite:false}));outline.position.z=-.02;outline.renderOrder=112;group.add(outline);
 const panels=[];for(const side of[-1,1]){const panel=new THREE.Mesh(new THREE.BoxGeometry(2.68,3.82,.26),metal.clone());panel.position.set(side*1.34,0,.24);panel.userData.closed=panel.position.clone();panel.userData.open=new THREE.Vector3(side*3.12,.12,.70);panel.userData.openRotation=side*.72;group.add(panel);panels.push(panel)}
 const occupant=targetCrew.find(w=>w.active&&w.hp>0&&w.roomIndex===hit.roomIndex)||targetCrew.find(w=>w.active&&w.roomIndex===hit.roomIndex)||null;if(occupant?.sprite?.material?.map){const dead=occupant.hp<=0,sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:occupant.sprite.material.map,color:dead?0xa55b5b:0xffffff,transparent:true,opacity:dead?.62:1,depthTest:false,depthWrite:false}));sprite.position.set(0,-.18,.62);sprite.scale.set(occupant.passive?1.62:2.55,occupant.passive?2.72:3.78,1);sprite.userData.fixedDamageScale=sprite.scale.clone();sprite.renderOrder=118;group.add(sprite);occupant.impactRevealUntil=performance.now()+duration;occupant.impactRevealSprite=sprite;occupant.impactRevealGroup=group}const badgeCanvas=document.createElement('canvas');badgeCanvas.width=512;badgeCanvas.height=94;const bx=badgeCanvas.getContext('2d'),profile=occupant?STARTER_PROFILES[occupant.weaponKey]:null,label=occupant?(profile?.name||'WARRIOR').toUpperCase():'NO WARRIOR';bx.fillStyle='rgba(4,9,14,.96)';bx.fillRect(3,3,506,88);bx.lineWidth=5;bx.strokeStyle=occupant?.hp<=0?'#ff493d':occupant?'#79efa8':'#71808b';bx.strokeRect(3,3,506,88);bx.fillStyle=occupant?.hp<=0?'#ff5b4d':'#ffffff';bx.font='900 '+(label.length>20?25:30)+'px system-ui';bx.textAlign='center';bx.textBaseline='middle';bx.fillText('ROOM '+(hit.roomIndex+1)+' • '+label,256,47);const badgeMap=new THREE.CanvasTexture(badgeCanvas);badgeMap.colorSpace=THREE.SRGBColorSpace;const badge=new THREE.Sprite(new THREE.SpriteMaterial({map:badgeMap,transparent:true,depthTest:false,depthWrite:false}));badge.position.set(0,2.16,.88);badge.scale.set(5.20,.95,1);badge.renderOrder=121;group.add(badge);
 const born=performance.now();(function open(now){if(!group.parent)return;const t=Math.min(1,(now-born)/420),e=1-Math.pow(1-t,3);for(const panel of panels){panel.position.copy(panel.userData.closed).lerp(panel.userData.open,e);panel.rotation.y=panel.userData.openRotation*e}if(t<1)requestAnimationFrame(open)})(born);
 const timer=setTimeout(()=>{if(activeImpactCompartmentReveal?.group===group)clearImpactCompartmentReveal()},duration+220);activeImpactCompartmentReveal={group,room,module,moduleWasVisible,removedPanels,hidden,occupant,timer};diag('IMPACT CUTAWAY',\`side=\${targetSide} room=\${hit.roomIndex+1} warrior=\${occupant?.weaponKey||'NONE'} oldXray=N fixedScale=Y hullPanelRemoved=\${removedPanels.length}\`)
}
`;
  patched = replaceExact(patched,'let cameraLastUpdate=performance.now();',impactHelpers+'let cameraLastUpdate=performance.now();',status,'impactCamera');
  patched = replaceExact(
    patched,
    `  }else{
    desiredPos=new THREE.Vector3(midX,(tactical?27.5:23.5)+midY*.11+altExtra*.22,safeZ);`,
    `  }else if(impactFocusSide&&now<impactFocusUntil){
    const focusRoot=impactFocusSide==='aurelian'?aure:earth,rootPoint=focusRoot.getWorldPosition(new THREE.Vector3()),focus=impactFocusPoint?rootPoint.clone().lerp(impactFocusPoint,.22):rootPoint;desiredPos=new THREE.Vector3(focus.x,focus.y+6.2,focus.z+84);desiredLook=new THREE.Vector3(focus.x,focus.y+.6,focus.z);desiredZoom=.98;
  }else{
    impactFocusSide=null;desiredPos=new THREE.Vector3(midX,(tactical?27.5:23.5)+midY*.11+altExtra*.22,safeZ);`,
    status,
    'impactCamera'
  );
  patched = replaceExact(
    patched,
    "const impactSide=structureTargetSide(attacker),impactStrength=Math.max(.45,Math.min(1.8,weapon.impactStrength||1));",
    "const impactSide=structureTargetSide(attacker),impactStrength=Math.max(.45,Math.min(1.8,weapon.impactStrength||1)),focusHold=weapon.kind==='sunadier'?2300:weapon.kind==='solar_disk'?1900:weapon.kind==='laser'?1450:weapon.kind==='explosive'?1550:1750;beginImpactFocus(impactSide,hit.roomIndex,weapon.name,focusHold);spawnImpactCompartmentReveal(attacker,hit,focusHold);",
    status,
    'impactTrigger'
  );


  const damageCalloutHelper = `function spawnCrewDamageCallout(w,aaDamage,hpDamage){
  if(!w?.sprite||(!aaDamage&&!hpDamage))return;const room=w.roomGroup?.userData?.rooms?.[w.roomIndex],impactSprite=w.impactRevealSprite?.parent?w.impactRevealSprite:null,revealed=room&&(impactSprite||(w.impactRevealUntil||0)>performance.now()||(warriorShouldBeVisible(w)&&(!w.passive||crewExposureTier(room)>=3)));if(!revealed)return;const c=document.createElement('canvas');c.width=384;c.height=112;const x=c.getContext('2d');x.fillStyle='rgba(4,8,12,.90)';x.fillRect(8,8,368,96);x.strokeStyle=hpDamage?'#ff7048':'#79e7ff';x.lineWidth=5;x.strokeRect(8,8,368,96);x.fillStyle='#ffffff';x.textAlign='center';x.textBaseline='middle';x.font='900 32px system-ui';x.fillText((aaDamage?'−'+Math.round(aaDamage)+' AA':'')+(aaDamage&&hpDamage?'  •  ':'')+(hpDamage?'−'+Math.round(hpDamage)+' HP':''),192,56);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,opacity:1,depthTest:false,depthWrite:false}));sprite.scale.set(3.7,1.08,1);sprite.position.copy(impactSprite?impactSprite.getWorldPosition(new THREE.Vector3()):warriorWorld(w)).add(new THREE.Vector3(0,2.05,.72));sprite.renderOrder=120;scene.add(sprite);effects.push({objects:[sprite],life:.92,max:.92})
}
`;
  if(!patched.includes('function spawnCrewDamageCallout(')){const next=patched.replace('function spawnCrewDamageReaction(w,amount,killed=false){',damageCalloutHelper+'function spawnCrewDamageReaction(w,amount,killed=false){');status.damageCallout=next!==patched;patched=next}
  status.impactReveal = patched.includes('function spawnImpactCompartmentReveal(') && patched.includes('IMPACT CUTAWAY');
  patched = patched.replace("if(hpDamage>0)spawnCrewDamageReaction(w,hpDamage,w.hp===0);","if(aaDamage||hpDamage)spawnCrewDamageCallout(w,aaDamage,hpDamage);if(hpDamage>0)spawnCrewDamageReaction(w,hpDamage,w.hp===0);");
  patched = replaceExact(patched,"if(room.exteriorScar){room.exteriorScar.visible=true;room.exteriorScar.material.color.setHex(0x020104);room.exteriorScar.material.opacity=.96}","if(room.exteriorScar)room.exteriorScar.visible=false",status,'tornWreck');
  patched = replaceExact(patched,"Math.min(24,Math.round(10+scale*3))","Math.min(11,Math.round(6+scale*1.6))",status,'particleBudget');
  patched = patched.replace("opacity:.95,blending:THREE.AdditiveBlending","opacity:.52,blending:THREE.AdditiveBlending");
  patched = patched.replace("opacity:.82,blending:THREE.AdditiveBlending","opacity:.62,blending:THREE.AdditiveBlending");

  patched = patched.replace(/3D LAB • MOBILE PVP TEST • v0\.33\.\d+/g, '3D LAB • MOBILE PVP TEST • v0.33.48');
  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.48');
  patched = patched.replace(/build=2026-08-(28|29|30)_[A-Z0-9_]+/g, 'build=2026-08-30_AURELIAN_CINEMATIC_ROUND_ROBIN');
  status.cutaway=patched.includes('PRIVATE_HULL_CAVITY_LOCAL_ONLY')&&!patched.includes('PRIVATE_PHYSICAL_CUTAWAY_LOCAL_ONLY');status.cutawayArt=patched.includes('xrayArtTextureForWarrior');status.earthCutaway=patched.includes("faction==='earth'")&&patched.includes('PRIVATE_HULL_CAVITY_LOCAL_ONLY');status.earthHullPanels=patched.includes('PHYSICAL HULL REMOVAL');status.physicalCutaway=patched.includes('physicalHullCavity')&&patched.includes('oldGrid=N');status.impactReveal=patched.includes('function spawnImpactCompartmentReveal(')&&patched.includes('IMPACT CUTAWAY');
  const summary = Object.entries(status).map(([key,value])=>`${key}:${value?'OK':'MISS'}`).join(' ');
  patched = patched.replace('</head>', `<style id="ac-combat-presentation-css">body.acImpactFocus #movePad,body.acImpactFocus #aimHud{opacity:.10!important;pointer-events:none!important}body.acImpactFocus #rangeBadge{opacity:.18!important}body.acImpactFocus #status{background:rgba(3,9,14,.88)!important;border-color:#ffd36a!important}#damageFlash{max-width:38%!important;font-size:clamp(12px,1.55vw,20px)!important;padding:4px 10px!important;text-shadow:0 2px 7px #000,0 0 8px currentColor!important}.xrayCrewCard.show{backdrop-filter:blur(7px)}</style><meta name="ac-combat-presentation-lock" content="${summary}">\n</head>`);
  return patched;
}
