import baseWorker from './after-contact-worker.js';
export { MyDurableObject } from './after-contact-worker.js';

function isDocumentRequest(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  return url.pathname === '/' || url.pathname === '/index.html';
}

function documentHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=UTF-8');
  headers.set('cache-control', 'no-store, no-cache, must-revalidate');
  headers.set('x-content-type-options', 'nosniff');
  headers.delete('content-disposition');
  headers.delete('content-length');
  return headers;
}

function patchIndexHtml(html) {
  let patched = html;

  const bridgeNeedle = "  return true;\n}\nfunction showDeployGhost(e){";
  const bridgeReplacement = "  return true;\n}\nwindow.__acDeployBridge=Object.freeze({\n  getState:()=>deployment.slice(),\n  required:()=>requiredDeploymentCount(),\n  place:(warriorIndex,roomIndex,sourceRoom=null)=>placeWarriorInSlot(warriorIndex,roomIndex,sourceRoom),\n  refresh:()=>updateDeployUI()\n});\nfunction showDeployGhost(e){";
  if (!patched.includes('window.__acDeployBridge=Object.freeze')) patched = patched.replace(bridgeNeedle, bridgeReplacement);

  patched = patched.replaceAll('MATCH RECORDER v0.33.7', 'MATCH RECORDER v0.33.18');
  patched = patched.replaceAll('MATCH RECORDER v0.33.14', 'MATCH RECORDER v0.33.18');
  patched = patched.replaceAll('MATCH RECORDER v0.33.16', 'MATCH RECORDER v0.33.18');
  patched = patched.replaceAll('MATCH RECORDER v0.33.17', 'MATCH RECORDER v0.33.18');
  patched = patched.replaceAll('build=2026-08-28_EARTH_DEPLOYMENT_INPUT_STABLE', 'build=2026-08-28_EARTH_SPECIALISTS_LEVEL2');
  patched = patched.replaceAll('build=2026-08-28_SCROLL_AND_BATTLE_LOCKIN', 'build=2026-08-28_EARTH_SPECIALISTS_LEVEL2');
  patched = patched.replaceAll('build=2026-08-28_PERSISTENT_FORTRESS_CUTAWAY', 'build=2026-08-28_EARTH_SPECIALISTS_LEVEL2');
  patched = patched.replaceAll('build=2026-08-28_MANUAL_PHYSICAL_CUTAWAY', 'build=2026-08-28_EARTH_SPECIALISTS_LEVEL2');

  // Manual-only cutaway. Never pop it open just because battle/turn starts.
  const automaticSchedule = "if(mine){statusEl.textContent='TACTICAL SCAN • OPENING FORTRESS CUTAWAY';setTimeout(()=>{if(battleStarted&&!matchEnded&&!xrayOpen)openPrivateXray('automatic tactical scan')},120);diag('CUTAWAY READY',`${reason} side=${localXraySide()} private=Y automatic=Y persistent=Y`)}";
  const manualSchedule = "if(mine){statusEl.textContent='YOUR TURN • MOVE, POSITION, OR TAP YOUR FORTRESS FOR CUTAWAY';diag('CUTAWAY READY',`${reason} side=${localXraySide()} private=Y automatic=N manual=Y`)}";
  patched = patched.replace(automaticSchedule, manualSchedule);
  patched = patched.replace("function togglePrivateXray(reason='own vessel tap'){if(!xrayOpen)openPrivateXray(reason)}","function togglePrivateXray(reason='own vessel tap'){if(xrayOpen)closePrivateXray(reason);else openPrivateXray(reason)}");

  const baseOpen = "xrayOpen=true;xraySelectedCrew=null;tacticalAimView=false;clearAim?.();applyXrayShell();buildPrivateXray();for(const w of localXrayWarriors())syncWarriorConcealment(w);refreshXrayCrewCard();updateBattleCamera();statusEl.textContent='FORTRESS CUTAWAY • TAP A NAMED WARRIOR';";
  const scannedOpen = "xrayOpen=true;xraySelectedCrew=null;tacticalAimView=false;clearAim?.();window.__acRunCutawayScan?.();applyXrayShell();buildPrivateXray();for(const w of localXrayWarriors())syncWarriorConcealment(w);refreshXrayCrewCard();updateBattleCamera();statusEl.textContent='FORTRESS CUTAWAY • SELECT YOUR WARRIOR';";
  if (!patched.includes('window.__acRunCutawayScan?.()')) patched = patched.replace(baseOpen, scannedOpen);
  patched = patched.replaceAll('TACTICAL SCAN • OPENING FORTRESS CUTAWAY','YOUR TURN • MOVE, POSITION, OR TAP YOUR FORTRESS FOR CUTAWAY');

  // Player-facing Controller copy: do not imply that the locator itself is the main attack.
  patched = patched.replaceAll('Tactical locator and battlefield support specialist','Designates targets for delayed tactical support strikes. Support type changes based on the enemy fortress.');

  // Level 2 Sniper: precise manual room shot with explicit bullseye / solid / edge tiers.
  const oldSniperHit = "function sniperRoomHit(attacker,pt){\n  const rooms=opposingRooms(attacker).userData.rooms,warriors=opposing(attacker);let chosen=null;\n  for(let i=0;i<rooms.length;i++){const room=rooms[i];if(room.erased)continue;const r=objectScreenRect(room.hitPlane,0);if(pt.x<r.x1||pt.x>r.x2||pt.y<r.y1||pt.y>r.y2)continue;const cx=(r.x1+r.x2)/2,cy=(r.y1+r.y2)/2,nx=Math.abs(pt.x-cx)/Math.max(1,(r.x2-r.x1)/2),ny=Math.abs(pt.y-cy)/Math.max(1,(r.y2-r.y1)/2),quality=Math.max(.55,1-Math.max(nx,ny)*.45);chosen={room,roomIndex:i,end:stagePointToRoomWorld(pt,room),warrior:warriors.find(w=>w.roomIndex===i&&w.hp>0)||null,direct:false,quality};break}\n  return chosen;\n}";
  const newSniperHit = "function sniperRoomHit(attacker,pt){\n  const rooms=opposingRooms(attacker).userData.rooms,warriors=opposing(attacker);let chosen=null;\n  for(let i=0;i<rooms.length;i++){const room=rooms[i];if(room.erased)continue;const r=objectScreenRect(room.hitPlane,0);if(pt.x<r.x1||pt.x>r.x2||pt.y<r.y1||pt.y>r.y2)continue;const cx=(r.x1+r.x2)/2,cy=(r.y1+r.y2)/2,nx=Math.abs(pt.x-cx)/Math.max(1,(r.x2-r.x1)/2),ny=Math.abs(pt.y-cy)/Math.max(1,(r.y2-r.y1)/2),rad=Math.max(nx,ny),quality=rad<=.24?1:rad<=.58?.80:.56,placement=rad<=.24?'BULLSEYE':rad<=.58?'SOLID':'EDGE';chosen={room,roomIndex:i,end:stagePointToRoomWorld(pt,room),warrior:warriors.find(w=>w.roomIndex===i&&w.hp>0)||null,direct:rad<=.24,quality,placement};break}\n  return chosen;\n}";
  patched = patched.replace(oldSniperHit,newSniperHit);
  patched = patched.replace("diag('SNIPER IMPACT',`room=${hit.roomIndex+1} placement=${Math.round(hit.quality*100)}% distance=${len.toFixed(1)}`)","diag('SNIPER IMPACT',`room=${hit.roomIndex+1} placement=${hit.placement||Math.round(hit.quality*100)+'%'} distance=${len.toFixed(1)}`)");

  // Combat Controller locator does a small designation hit now; the real effect remains one team-turn delayed.
  const oldLocatorAttach = "const marker=glowSphere(.28,0x48d9ff,10);marker.material.transparent=true;marker.material.opacity=.94;marker.position.set(0,0,.42);hit.room.hitPlane.add(marker);supportCalls[attacker.side]={attacker,hit,weapon,marker};supportCooldown[attacker.side]=3;attacker.supportCooldown=3;statusEl.textContent=`TAC-LINK ATTACHED • ROOM ${hit.roomIndex+1} • SUPPORT NEXT TEAM TURN`;diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} cooldown=3`)";
  const newLocatorAttach = "const marker=glowSphere(.28,0x48d9ff,10);marker.material.transparent=true;marker.material.opacity=.94;marker.position.set(0,0,.42);hit.room.hitPlane.add(marker);resolveHit(attacker,hit,{...weapon,name:'TAC-LINK DESIGNATOR',kind:'locator',armorDamage:5,damage:4,splash:0,impactStrength:.35});supportCalls[attacker.side]={attacker,hit,weapon,marker};supportCooldown[attacker.side]=3;attacker.supportCooldown=3;statusEl.textContent=`TARGET DESIGNATED • ROOM ${hit.roomIndex+1} • SUPPORT ARRIVES NEXT TEAM TURN`;diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`)";
  patched = patched.replace(oldLocatorAttach,newLocatorAttach);

  // Level 2 adaptive support: the delayed follow-up changes materially by enemy fortress faction.
  const oldSupport = "function advanceSupportTurn(side){\n  const call=supportCalls[side];if(call){supportCalls[side]=null;const p=call.hit.room.hitPlane.getWorldPosition(new THREE.Vector3()),strike={...call.weapon,kind:'explosive',name:factionForWorldSide(call.attacker.side)==='lizard'?'SPECIAL OPERATIONS C4':'ADAPTIVE GUNSHIP STRIKE',armorDamage:55,damage:55,splash:65,impactStrength:1.55};if(call.marker)call.marker.parent?.remove(call.marker);spawnExplosionVisual(p,0xffb34d,3.1);spawnImpactBurst(p,0xffedaa);spawnDebris(p,0x555b60,42,.14,.82);kickCamera(.46,.30);resolveHit(call.attacker,{...call.hit,end:p},strike);diag('SUPPORT ARRIVAL',`${side} room=${call.hit.roomIndex+1}`)}\n  if(supportCooldown[side]>0)supportCooldown[side]--;const controller=(side==='aurelian'?aWarriors:eWarriors).find(w=>w.active&&w.weaponKey==='combat_controller');if(controller)controller.supportCooldown=supportCooldown[side];\n}";
  const newSupport = "function advanceSupportTurn(side){\n  const call=supportCalls[side];if(call){\n    supportCalls[side]=null;\n    const p=call.hit.room.hitPlane.getWorldPosition(new THREE.Vector3()),targetSide=call.attacker.side==='aurelian'?'earth':'aurelian',targetFaction=factionForWorldSide(targetSide);\n    if(call.marker)call.marker.parent?.remove(call.marker);\n    let strike={...call.weapon,kind:'explosive',name:'C-130 PRECISION GUNSHIP STRIKE',armorDamage:56,damage:54,splash:62,impactStrength:1.55};\n    if(targetFaction==='lizard'){\n      strike={...strike,name:'SEAL TEAM SIX • C4 SABOTAGE',armorDamage:76,damage:62,splash:42,impactStrength:1.72};\n      statusEl.textContent=`SEAL TEAM SIX • C4 DETONATION • ROOM ${call.hit.roomIndex+1}`;spawnImpactBurst(p,0xa8e8c4);spawnExplosionVisual(p,0xffb14b,2.65);spawnExplosionVisual(p.clone().add(new THREE.Vector3(.5,.18,.18)),0xe6f5d6,1.32);spawnDebris(p,0x33483f,48,.12,.72);kickCamera(.48,.31);\n    }else if(targetFaction==='earth'){\n      strike={...strike,name:'C-130 AIRBORNE ASSAULT',armorDamage:42,damage:38,splash:26,impactStrength:1.28};\n      statusEl.textContent=`AIRBORNE ASSAULT • BREACHING ROOM ${call.hit.roomIndex+1}`;spawnImpactBurst(p,0xd8e9f4);spawnExplosionVisual(p,0xffc06a,2.15);spawnDebris(p,0x6c7378,34,.10,.56);kickCamera(.34,.23);\n      const victim=call.hit.warrior;if(victim&&victim.active&&victim.hp>0){victim.aa=0;victim.hp=0;setWarriorObjectsVisible(victim,false);syncWarriorConcealment(victim);diag('AIRBORNE ELIMINATION',`${victim.weaponKey||'warrior'} room=${call.hit.roomIndex+1}`)}\n    }else{\n      statusEl.textContent=`C-130 GUNSHIP • PRECISION STRIKE • ROOM ${call.hit.roomIndex+1}`;spawnExplosionVisual(p,0xffb34d,3.1);spawnImpactBurst(p,0xffedaa);spawnDebris(p,0x555b60,42,.14,.82);kickCamera(.46,.30);\n    }\n    resolveHit(call.attacker,{...call.hit,end:p},strike);diag('SUPPORT ARRIVAL',`${side} targetFaction=${targetFaction} room=${call.hit.roomIndex+1} type=${strike.name}`)\n  }\n  if(supportCooldown[side]>0)supportCooldown[side]--;const controller=(side==='aurelian'?aWarriors:eWarriors).find(w=>w.active&&w.weaponKey==='combat_controller');if(controller)controller.supportCooldown=supportCooldown[side];\n}";
  patched = patched.replace(oldSupport,newSupport);

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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (isDocumentRequest(request, url)) {
      const indexUrl = new URL('/index.html', url);
      const assetRequest = new Request(indexUrl.toString(), {method: request.method, headers: request.headers});
      const assetResponse = await env.ASSETS.fetch(assetRequest);
      const headers = documentHeaders(assetResponse);
      if (request.method === 'HEAD') return new Response(null, {status: assetResponse.status, statusText: assetResponse.statusText, headers});
      const html = patchIndexHtml(await assetResponse.text());
      return new Response(html, {status: assetResponse.status, statusText: assetResponse.statusText, headers});
    }
    return baseWorker.fetch(request, env, ctx);
  },
};
