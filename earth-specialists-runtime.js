export function patchEarthSpecialistsRuntime(html) {
  let patched = html;

  // Build identity for this specialist pass.
  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.23');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_EARTH_SPECIALISTS_TARGETING');

  // Combat Controller: line-of-sight designation. The player's finger controls direction;
  // the game finds the first enemy compartment crossed by the TAC-LINK line.
  const locatorHelper = `function locatorLineHit(attacker,startWorld,aimPt){
  const start=worldToStage(startWorld),dx=aimPt.x-start.x,dy=aimPt.y-start.y,mag=Math.hypot(dx,dy)||1;
  const end={x:start.x+dx/mag*1600,y:start.y+dy/mag*1600},rooms=opposingRooms(attacker).userData.rooms,warriors=opposing(attacker);let best=null;
  function entry(rect){
    const r={x1:rect.x1-8,y1:rect.y1-8,x2:rect.x2+8,y2:rect.y2+8},vx=end.x-start.x,vy=end.y-start.y;let t0=0,t1=1;
    for(const [p,q] of [[-vx,start.x-r.x1],[vx,r.x2-start.x],[-vy,start.y-r.y1],[vy,r.y2-start.y]]){
      if(Math.abs(p)<1e-6){if(q<0)return null;continue}const t=q/p;if(p<0){if(t>t1)return null;if(t>t0)t0=t}else{if(t<t0)return null;if(t<t1)t1=t}
    }
    return t0;
  }
  for(let i=0;i<rooms.length;i++){
    const room=rooms[i];if(room.erased)continue;const r=objectScreenRect(room.hitPlane,0),t=entry(r);if(t==null||t<0||t>1)continue;
    if(!best||t<best.t){const contact={x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t};best={t,room,roomIndex:i,end:stagePointToRoomWorld(contact,room),warrior:warriors.find(w=>w.roomIndex===i&&w.hp>0)||null,direct:true,quality:1,placement:'LINE LOCK'}}
  }
  return best;
}
`;
  if (!patched.includes('function locatorLineHit(')) patched = patched.replace('function spawnTacLocator(attacker,start,pt,power,weapon){', locatorHelper + 'function spawnTacLocator(attacker,start,pt,power,weapon){');
  patched = patched.replace('const hit=sniperRoomHit(attacker,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt)', 'const hit=locatorLineHit(attacker,start,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt)');

  // Combat Controller lifecycle: do not end the solo turn until the locator has actually impacted
  // and the delayed support call exists.
  patched = patched.replace(
    "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid')endSoloPlayerTurnAfterShot();",
    "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='locator')endSoloPlayerTurnAfterShot();"
  );
  patched = patched.replace(
    "diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`)\n  }});return true",
    "diag('SUPPORT QUEUED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);if(!multiplayer&&attacker.side==='aurelian'&&battleStarted&&!matchEnded&&soloTurn==='aurelian')setTimeout(()=>{if(battleStarted&&!matchEnded&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()},180)\n  }});return true"
  );
  patched = patched.replace(
    "function advanceSupportTurn(side){\n  const call=supportCalls[side];if(call){",
    "function advanceSupportTurn(side){\n  const call=supportCalls[side];diag(call?'SUPPORT ARRIVAL CHECK':'SUPPORT WAITING',`${side} queued=${call?'Y':'N'} cooldown=${supportCooldown[side]||0}`);if(call){"
  );

  // Sniper: the precision round is genuinely explosive, not only an explosion visual.
  // Small splash preserves the Sniper's precision role and keeps it distinct from HE-9 artillery.
  patched = patched.replace(
    "const tuned={...weapon,armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),impactStrength:1.38};spawnExplosionVisual(target,0xffb45b,1.72*hit.quality);",
    "const tuned={...weapon,kind:'explosive',name:'EXPLOSIVE BREACH ROUND',armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),splash:Math.round(22*hit.quality),impactStrength:1.52};spawnExplosionVisual(target,0xffb45b,2.05*hit.quality);"
  );
  patched = patched.replace("diag('SNIPER IMPACT',", "diag('SNIPER EXPLOSIVE IMPACT',");

  patched = patched.replace('</head>', '<meta name="ac-earth-specialists-runtime" content="controller-line-lock sniper-explosive support-impact-queue">\n</head>');
  return patched;
}
