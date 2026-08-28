export function patchEarthSpecialistsRuntime(html) {
  let patched = html;

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.26');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_FORTRESS_IMPACT_PREDICTION');

  // Shared screen-space ray/room intersection for Combat Controller targeting.
  const locatorHelper = `function locatorLineHit(attacker,startWorld,aimPt){
  const start=worldToStage(startWorld),dx=aimPt.x-start.x,dy=aimPt.y-start.y,mag=Math.hypot(dx,dy)||1;
  if(mag<8)return null;
  const ux=dx/mag,uy=dy/mag,rooms=opposingRooms(attacker).userData.rooms,warriors=opposing(attacker);let best=null;
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
    if(!best||t<best.t){const contact={x:start.x+ux*t,y:start.y+uy*t},inside={x:Math.max(rect.x1+2,Math.min(rect.x2-2,contact.x)),y:Math.max(rect.y1+2,Math.min(rect.y2-2,contact.y))};best={t,room,roomIndex:i,end:stagePointToRoomWorld(inside,room),warrior:warriors.find(w=>w.roomIndex===i&&w.hp>0)||null,direct:true,quality:1,placement:'AIM RAY LOCK'}}
  }
  diag(best?'TAC-LINK RAY LOCK':'TAC-LINK RAY MISS',best?('room='+(best.roomIndex+1)+' rayDistance='+best.t.toFixed(1)):('aim=('+Math.round(aimPt.x)+','+Math.round(aimPt.y)+')'));
  return best;
}
`;
  if (!patched.includes('function locatorLineHit(')) patched = patched.replace('function spawnTacLocator(attacker,start,pt,power,weapon){', locatorHelper + 'function spawnTacLocator(attacker,start,pt,power,weapon){');
  patched = patched.replace(/const hit=sniperRoomHit\(attacker,pt\),target=hit\?\.end\|\|targetPlanePointForOpponent\(attacker,pt\),mid=start\.clone\(\)\.lerp\(target,\.5\);mid\.y\+=Math\.max\(3,Math\.min\(16,Math\.abs\(target\.x-start\.x\)\*\.13\)\);/, "const hit=locatorLineHit(attacker,start,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt),mid=start.clone().lerp(target,.5);mid.y+=Math.max(3,Math.min(16,Math.abs(target.x-start.x)*.13));");

  // Keep the Controller action alive until the locator actually lands and queues support.
  patched = patched.replace("if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid')endSoloPlayerTurnAfterShot();", "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='locator')endSoloPlayerTurnAfterShot();");
  patched = patched.replace("diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`)\n  }});return true", "diag('SUPPORT QUEUED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);if(!multiplayer&&attacker.side==='aurelian'&&battleStarted&&!matchEnded&&soloTurn==='aurelian')setTimeout(()=>{if(battleStarted&&!matchEnded&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()},180)\n  }});return true");
  patched = patched.replace("function advanceSupportTurn(side){\n  const call=supportCalls[side];if(call){", "function advanceSupportTurn(side){\n  const call=supportCalls[side];diag(call?'SUPPORT ARRIVAL CHECK':'SUPPORT WAITING',`${side} queued=${call?'Y':'N'} cooldown=${supportCooldown[side]||0}`);if(call){");

  // Precision explosive Sniper breach round.
  patched = patched.replace("const tuned={...weapon,armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),impactStrength:1.38};spawnExplosionVisual(target,0xffb45b,1.72*hit.quality);", "const tuned={...weapon,kind:'explosive',name:'EXPLOSIVE BREACH ROUND',armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),splash:Math.round(22*hit.quality),impactStrength:1.52};spawnExplosionVisual(target,0xffb45b,2.05*hit.quality);");
  patched = patched.replace("diag('SNIPER IMPACT',", "diag('SNIPER EXPLOSIVE IMPACT',");

  // Bombardier no longer draws a trajectory line. The actual HE-9 simulator predicts the first
  // compartment the center missile will reach, then paints probability directly onto the enemy
  // fortress: hot center, softer adjacent rooms. This is presentation only; firing physics stay real.
  const impactPrediction = `function bombardierAimGuide(a,b){
  const p=bombardierTrajectoryProfile(a,b),sim=he9BallisticStagePath(selected,a,b,p.power,0,true),hit=sim.hit||null,rooms=opposingRooms(selected).userData.rooms;
  if(enemyAimOutlineLayer){
    enemyAimOutlineLayer.innerHTML='';
    if(hit){
      const center=hit.roomIndex,row=Math.floor(center/3),col=center%3,candidates=[];
      for(let i=0;i<rooms.length;i++){const rr=Math.floor(i/3),cc=i%3,step=Math.abs(rr-row)+Math.abs(cc-col);if(step<=2)candidates.push({i,step})}
      for(const c of candidates){const r=objectScreenRect(rooms[c.i].hitPlane,0),rect=document.createElementNS('http://www.w3.org/2000/svg','rect'),hot=c.step===0,near=c.step===1;rect.setAttribute('x',r.x1);rect.setAttribute('y',r.y1);rect.setAttribute('width',Math.max(1,r.x2-r.x1));rect.setAttribute('height',Math.max(1,r.y2-r.y1));rect.setAttribute('rx','4');rect.setAttribute('fill',hot?'rgba(255,126,24,.46)':near?'rgba(255,178,52,.25)':'rgba(255,215,95,.11)');rect.setAttribute('stroke',hot?'#ff7a18':near?'#ffb43b':'#ffd66b');rect.setAttribute('stroke-width',hot?'3':near?'2':'1');rect.setAttribute('stroke-dasharray',hot?'':'6 5');rect.style.filter=hot?'drop-shadow(0 0 8px #ff7a18)':near?'drop-shadow(0 0 4px #ffb43b)':'';enemyAimOutlineLayer.appendChild(rect)}
      diag('HE9 PREDICTION','centerRoom='+(center+1)+' spreadRooms='+candidates.map(x=>x.i+1).join(','));
    }else diag('HE9 PREDICTION','MISS');
  }
  return{d:'',end:b,profile:p};
}`;
  patched = patched.replace(/function bombardierAimGuide\(a,b\)\{[\s\S]*?\n\}\nfunction bombardierDescentPreview/, impactPrediction+'\nfunction bombardierDescentPreview');
  patched = patched.replace("aimPath.setAttribute('d',guide.d);", "aimPath.setAttribute('d',guide.d);if(wp.kind==='explosive')aimPath.style.opacity='0';");

  patched = patched.replace('</head>', '<meta name="ac-earth-specialists-runtime" content="controller-targeting sniper-explosive support-impact-queue bombardier-fortress-impact-prediction">\n</head>');
  return patched;
}
