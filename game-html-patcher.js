function replaceOne(source, regex, replacement, key, status) {
  const next = source.replace(regex, replacement);
  status[key] = next !== source;
  return next;
}

export function patchIndexHtml(html) {
  let patched = html;
  const patchStatus = { sniper:false, locator:false, support:false, gate:false };

  const bridgeNeedle = "  return true;\n}\nfunction showDeployGhost(e){";
  const bridgeReplacement = "  return true;\n}\nwindow.__acDeployBridge=Object.freeze({\n  getState:()=>deployment.slice(),\n  required:()=>requiredDeploymentCount(),\n  place:(warriorIndex,roomIndex,sourceRoom=null)=>placeWarriorInSlot(warriorIndex,roomIndex,sourceRoom),\n  refresh:()=>updateDeployUI()\n});\nfunction showDeployGhost(e){";
  if (!patched.includes('window.__acDeployBridge=Object.freeze')) patched = patched.replace(bridgeNeedle, bridgeReplacement);

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.20');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_EARTH_SPECIALISTS_LIVE');

  const automaticSchedule = "if(mine){statusEl.textContent='TACTICAL SCAN • OPENING FORTRESS CUTAWAY';setTimeout(()=>{if(battleStarted&&!matchEnded&&!xrayOpen)openPrivateXray('automatic tactical scan')},120);diag('CUTAWAY READY',`${reason} side=${localXraySide()} private=Y automatic=Y persistent=Y`)}";
  const manualSchedule = "if(mine){statusEl.textContent='YOUR TURN • MOVE, POSITION, OR TAP YOUR FORTRESS FOR CUTAWAY';diag('CUTAWAY READY',`${reason} side=${localXraySide()} private=Y automatic=N manual=Y`)}";
  patched = patched.replace(automaticSchedule, manualSchedule);
  patched = patched.replace("function togglePrivateXray(reason='own vessel tap'){if(!xrayOpen)openPrivateXray(reason)}","function togglePrivateXray(reason='own vessel tap'){if(xrayOpen)closePrivateXray(reason);else openPrivateXray(reason)}");

  const baseOpen = "xrayOpen=true;xraySelectedCrew=null;tacticalAimView=false;clearAim?.();applyXrayShell();buildPrivateXray();for(const w of localXrayWarriors())syncWarriorConcealment(w);refreshXrayCrewCard();updateBattleCamera();statusEl.textContent='FORTRESS CUTAWAY • TAP A NAMED WARRIOR';";
  const scannedOpen = "xrayOpen=true;xraySelectedCrew=null;tacticalAimView=false;clearAim?.();window.__acRunCutawayScan?.();applyXrayShell();buildPrivateXray();for(const w of localXrayWarriors())syncWarriorConcealment(w);refreshXrayCrewCard();updateBattleCamera();statusEl.textContent='FORTRESS CUTAWAY • SELECT YOUR WARRIOR';";
  if (!patched.includes('window.__acRunCutawayScan?.()')) patched = patched.replace(baseOpen, scannedOpen);
  patched = patched.replaceAll('TACTICAL SCAN • OPENING FORTRESS CUTAWAY','YOUR TURN • MOVE, POSITION, OR TAP YOUR FORTRESS FOR CUTAWAY');
  patched = patched.replaceAll('Tactical locator and battlefield support specialist','Designates targets for delayed tactical support strikes. Support type changes based on the enemy fortress.');

  // Remove obsolete prototype gate that blocked Sniper and Combat Controller from aiming/firing.
  patched = replaceOne(
    patched,
    /\n  if\(selected\.weaponKey==='sniper'\|\|selected\.weaponKey==='combat_controller'\)\{[^\n]*?return false\}\n  return true\n\}\nfunction beginAimFromVesselGesture/,
    "\n  return true\n}\nfunction beginAimFromVesselGesture",
    'gate', patchStatus
  );

  const sniperFn = `function sniperRoomHit(attacker,pt){
  const rooms=opposingRooms(attacker).userData.rooms,warriors=opposing(attacker);let chosen=null;
  for(let i=0;i<rooms.length;i++){
    const room=rooms[i];if(room.erased)continue;const r=objectScreenRect(room.hitPlane,0);if(pt.x<r.x1||pt.x>r.x2||pt.y<r.y1||pt.y>r.y2)continue;
    const cx=(r.x1+r.x2)/2,cy=(r.y1+r.y2)/2,nx=Math.abs(pt.x-cx)/Math.max(1,(r.x2-r.x1)/2),ny=Math.abs(pt.y-cy)/Math.max(1,(r.y2-r.y1)/2),rad=Math.max(nx,ny);
    const quality=rad<=.24?1:rad<=.58?.80:.56,placement=rad<=.24?'BULLSEYE':rad<=.58?'SOLID':'EDGE';
    chosen={room,roomIndex:i,end:stagePointToRoomWorld(pt,room),warrior:warriors.find(w=>w.roomIndex===i&&w.hp>0)||null,direct:rad<=.24,quality,placement};break
  }
  return chosen;
}`;
  patched = replaceOne(patched,/function sniperRoomHit\(attacker,pt\)\{[\s\S]*?\n\}\nfunction spawnSniperRound/,sniperFn+'\nfunction spawnSniperRound','sniper',patchStatus);
  patched = patched.replace("diag('SNIPER IMPACT',`room=${hit.roomIndex+1} placement=${Math.round(hit.quality*100)}% distance=${len.toFixed(1)}`)","diag('SNIPER IMPACT',`room=${hit.roomIndex+1} placement=${hit.placement||Math.round(hit.quality*100)+'%'} distance=${len.toFixed(1)}`)");

  const locatorFn = `function spawnTacLocator(attacker,start,pt,power,weapon){
  if(supportCooldown[attacker.side]>0){statusEl.textContent=\`ADAPTIVE SUPPORT • READY IN \${supportCooldown[attacker.side]} TURN\${supportCooldown[attacker.side]===1?'':'S'}\`;diag('SUPPORT BLOCK',\`\${attacker.side} cooldown=\${supportCooldown[attacker.side]}\`);return false}
  const hit=sniperRoomHit(attacker,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt),mid=start.clone().lerp(target,.5);mid.y+=Math.max(3,Math.min(16,Math.abs(target.x-start.x)*.13));
  const curve=new THREE.QuadraticBezierCurve3(start,mid,target),orb=glowSphere(.34,0x58cfff,12),trail=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)),new THREE.LineBasicMaterial({color:0x58cfff,transparent:true,opacity:.42,depthWrite:false}));
  orb.position.copy(start);scene.add(orb,trail);
  effects.push({orb,trail,curve,t:0,speed:1.25,impacted:false,onImpact:()=>{
    scene.remove(trail);if(!hit){resolveHit(attacker,null,{...weapon,name:'TAC-LINK LOCATOR'});return}
    const marker=glowSphere(.28,0x48d9ff,10);marker.material.transparent=true;marker.material.opacity=.94;marker.position.set(0,0,.42);hit.room.hitPlane.add(marker);
    resolveHit(attacker,hit,{...weapon,name:'TAC-LINK DESIGNATOR',kind:'locator',armorDamage:5,damage:4,splash:0,impactStrength:.35});
    supportCalls[attacker.side]={attacker,hit,weapon,marker};supportCooldown[attacker.side]=3;attacker.supportCooldown=3;
    statusEl.textContent=\`TARGET DESIGNATED • ROOM \${hit.roomIndex+1} • SUPPORT ARRIVES NEXT TEAM TURN\`;
    diag('TAC-LINK ATTACHED',\`\${attacker.side} room=\${hit.roomIndex+1} delayed=1_team_turn cooldown=3\`)
  }});return true
}`;
  patched = replaceOne(patched,/function spawnTacLocator\(attacker,start,pt,power,weapon\)\{[\s\S]*?\n\}\nfunction fireWarriorFromStage/,locatorFn+'\nfunction fireWarriorFromStage','locator',patchStatus);

  const supportFn = `function advanceSupportTurn(side){
  const call=supportCalls[side];if(call){
    supportCalls[side]=null;
    const p=call.hit.room.hitPlane.getWorldPosition(new THREE.Vector3()),targetSide=call.attacker.side==='aurelian'?'earth':'aurelian',targetFaction=factionForWorldSide(targetSide);
    if(call.marker)call.marker.parent?.remove(call.marker);
    let strike={...call.weapon,kind:'explosive',name:'C-130 PRECISION GUNSHIP STRIKE',armorDamage:56,damage:54,splash:62,impactStrength:1.55};
    if(targetFaction==='lizard'){
      strike={...strike,name:'SEAL TEAM SIX • C4 SABOTAGE',armorDamage:76,damage:62,splash:42,impactStrength:1.72};statusEl.textContent=\`SEAL TEAM SIX • C4 DETONATION • ROOM \${call.hit.roomIndex+1}\`;
      spawnImpactBurst(p,0xa8e8c4);spawnExplosionVisual(p,0xffb14b,2.65);spawnExplosionVisual(p.clone().add(new THREE.Vector3(.5,.18,.18)),0xe6f5d6,1.32);spawnDebris(p,0x33483f,48,.12,.72);kickCamera(.48,.31)
    }else if(targetFaction==='earth'){
      strike={...strike,name:'C-130 AIRBORNE ASSAULT',armorDamage:42,damage:38,splash:26,impactStrength:1.28};statusEl.textContent=\`AIRBORNE ASSAULT • BREACHING ROOM \${call.hit.roomIndex+1}\`;
      spawnImpactBurst(p,0xd8e9f4);spawnExplosionVisual(p,0xffc06a,2.15);spawnDebris(p,0x6c7378,34,.10,.56);kickCamera(.34,.23);
      const victim=call.hit.warrior;if(victim&&victim.active&&victim.hp>0){victim.aa=0;victim.hp=0;setWarriorObjectsVisible(victim,false);syncWarriorConcealment(victim);diag('AIRBORNE ELIMINATION',\`\${victim.weaponKey||'warrior'} room=\${call.hit.roomIndex+1}\`)}
    }else{
      statusEl.textContent=\`C-130 GUNSHIP • PRECISION STRIKE • ROOM \${call.hit.roomIndex+1}\`;spawnExplosionVisual(p,0xffb34d,3.1);spawnImpactBurst(p,0xffedaa);spawnDebris(p,0x555b60,42,.14,.82);kickCamera(.46,.30)
    }
    resolveHit(call.attacker,{...call.hit,end:p},strike);diag('SUPPORT ARRIVAL',\`\${side} targetFaction=\${targetFaction} room=\${call.hit.roomIndex+1} type=\${strike.name}\`)
  }
  if(supportCooldown[side]>0)supportCooldown[side]--;const controller=(side==='aurelian'?aWarriors:eWarriors).find(w=>w.active&&w.weaponKey==='combat_controller');if(controller)controller.supportCooldown=supportCooldown[side];
}`;
  patched = replaceOne(patched,/function advanceSupportTurn\(side\)\{[\s\S]*?\n\}\nlet battleSceneBaselineChildren/,supportFn+'\nlet battleSceneBaselineChildren','support',patchStatus);

  const statusText = `combatPatch=gate:${patchStatus.gate?'OK':'MISS'} sniper:${patchStatus.sniper?'OK':'MISS'} controller:${patchStatus.locator?'OK':'MISS'} support:${patchStatus.support?'OK':'MISS'}`;
  patched = patched.replace("`status=${statusEl?.textContent||''}`","`status=${statusEl?.textContent||''}`,`"+statusText+"`");
  patched = patched.replace('</head>', `<meta name="ac-combat-patch" content="${statusText}">\n</head>`);

  if (!patched.includes('/lifecycle-fix.js?v=20260828-1')) patched = patched.replace('</body>', '<script src="/lifecycle-fix.js?v=20260828-1"></script>\n</body>');
  patched = patched.replace(/\s*<script src="\/deployment-roster-v0338\.js\?v=[^"]+"><\/script>/g, '');
  patched = patched.replace(/\s*<script src="\/deployment-button-v0339\.js\?v=[^"]+"><\/script>/g, '');
  patched = patched.replace(/\s*<script src="\/deployment-controller-v03312\.js\?v=[^"]+"><\/script>/g, '');
  patched = patched.replace(/\s*<script src="\/deployment-controller-v03313\.js\?v=[^"]+"><\/script>/g, '');
  patched = patched.replace(/\s*<script src="\/cutaway-scan-v03316\.js\?v=[^"]+"><\/script>/g, '');
  if (!patched.includes('/deployment-controller-v03313.js?v=20260828-3')) patched = patched.replace('</body>', '<script src="/deployment-controller-v03313.js?v=20260828-3"></script>\n</body>');
  if (!patched.includes('/cutaway-scan-v03316.js?v=20260828-2')) patched = patched.replace('</body>', '<script src="/cutaway-scan-v03316.js?v=20260828-2"></script>\n</body>');
  return patched;
}
