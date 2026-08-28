export function patchEarthSpecialistsRuntime(html) {
  let patched = html;

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.24');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_TACLINK_AIM_RAY');

  // Shared screen-space ray/room intersection. This makes the visible aim direction the
  // authoritative source for Combat Controller targeting instead of the finger endpoint.
  const locatorHelper = `function locatorLineHit(attacker,startWorld,aimPt){
  const start=worldToStage(startWorld),dx=aimPt.x-start.x,dy=aimPt.y-start.y,mag=Math.hypot(dx,dy)||1;
  if(mag<8)return null;
  const ux=dx/mag,uy=dy/mag,end={x:start.x+ux*1800,y:start.y+uy*1800},rooms=opposingRooms(attacker).userData.rooms,warriors=opposing(attacker);let best=null;
  function rayRect(rect){
    const pad=10,r={x1:rect.x1-pad,y1:rect.y1-pad,x2:rect.x2+pad,y2:rect.y2+pad};let tmin=0,tmax=1800;
    for(const axis of ['x','y']){
      const o=start[axis],d=axis==='x'?ux:uy,lo=axis==='x'?r.x1:r.y1,hi=axis==='x'?r.x2:r.y2;
      if(Math.abs(d)<1e-6){if(o<lo||o>hi)return null;continue}
      let a=(lo-o)/d,b=(hi-o)/d;if(a>b){const z=a;a=b;b=z}tmin=Math.max(tmin,a);tmax=Math.min(tmax,b);if(tmax<tmin)return null;
    }
    return tmin>=0?tmin:null;
  }
  for(let i=0;i<rooms.length;i++){
    const room=rooms[i];if(room.erased)continue;const rect=objectScreenRect(room.hitPlane,0),t=rayRect(rect);if(t==null)continue;
    if(!best||t<best.t){const cx=(rect.x1+rect.x2)/2,cy=(rect.y1+rect.y2)/2,contact={x:start.x+ux*t,y:start.y+uy*t},inside={x:Math.max(rect.x1+2,Math.min(rect.x2-2,contact.x)),y:Math.max(rect.y1+2,Math.min(rect.y2-2,contact.y))};best={t,room,roomIndex:i,end:stagePointToRoomWorld(inside,room),warrior:warriors.find(w=>w.roomIndex===i&&w.hp>0)||null,direct:true,quality:1,placement:'AIM RAY LOCK',screenCenter:{x:cx,y:cy}}}
  }
  diag(best?'TAC-LINK RAY LOCK':'TAC-LINK RAY MISS',best?`room=${best.roomIndex+1} rayDistance=${best.t.toFixed(1)}`:`aim=(${Math.round(aimPt.x)},${Math.round(aimPt.y)})`);
  return best;
}
`;
  if (!patched.includes('function locatorLineHit(')) patched = patched.replace('function spawnTacLocator(attacker,start,pt,power,weapon){', locatorHelper + 'function spawnTacLocator(attacker,start,pt,power,weapon){');

  // Replace the locator's endpoint hit test after the main patcher has generated it.
  patched = patched.replace(/const hit=sniperRoomHit\(attacker,pt\),target=hit\?\.end\|\|targetPlanePointForOpponent\(attacker,pt\),mid=start\.clone\(\)\.lerp\(target,\.5\);mid\.y\+=Math\.max\(3,Math\.min\(16,Math\.abs\(target\.x-start\.x\)\*\.13\)\);/, "const hit=locatorLineHit(attacker,start,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt),mid=start.clone().lerp(target,.5);mid.y+=Math.max(3,Math.min(16,Math.abs(target.x-start.x)*.13));");

  // Keep the Controller action alive until the locator actually lands and queues support.
  patched = patched.replace("if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid')endSoloPlayerTurnAfterShot();", "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='locator')endSoloPlayerTurnAfterShot();");
  patched = patched.replace("diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`)\n  }});return true", "diag('SUPPORT QUEUED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);if(!multiplayer&&attacker.side==='aurelian'&&battleStarted&&!matchEnded&&soloTurn==='aurelian')setTimeout(()=>{if(battleStarted&&!matchEnded&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()},180)\n  }});return true");
  patched = patched.replace("function advanceSupportTurn(side){\n  const call=supportCalls[side];if(call){", "function advanceSupportTurn(side){\n  const call=supportCalls[side];diag(call?'SUPPORT ARRIVAL CHECK':'SUPPORT WAITING',`${side} queued=${call?'Y':'N'} cooldown=${supportCooldown[side]||0}`);if(call){");

  // Precision explosive Sniper breach round: real explosive resolution with modest splash.
  patched = patched.replace("const tuned={...weapon,armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),impactStrength:1.38};spawnExplosionVisual(target,0xffb45b,1.72*hit.quality);", "const tuned={...weapon,kind:'explosive',name:'EXPLOSIVE BREACH ROUND',armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),splash:Math.round(22*hit.quality),impactStrength:1.52};spawnExplosionVisual(target,0xffb45b,2.05*hit.quality);");
  patched = patched.replace("diag('SNIPER IMPACT',", "diag('SNIPER EXPLOSIVE IMPACT',");

  patched = patched.replace('</head>', '<meta name="ac-earth-specialists-runtime" content="controller-authoritative-aim-ray sniper-explosive support-impact-queue">\n</head>');
  return patched;
}
