export function patchEarthSpecialistsRuntime(html) {
  let patched = html;

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.27');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_CONTROLLER_RETICLE_TARGETING');

  // Combat Controller: direct tactical reticle selection. No ray or ballistic aiming.
  // The room visibly highlighted under the reticle is the room that will be designated.
  const controllerHelper = `function controllerReticleHit(attacker,pt){
  const rooms=opposingRooms(attacker).userData.rooms,warriors=opposing(attacker);let chosen=null,best=Infinity;
  for(let i=0;i<rooms.length;i++){
    const room=rooms[i];if(room.erased)continue;const r=objectScreenRect(room.hitPlane,0),pad=18;
    const inside=pt.x>=r.x1-pad&&pt.x<=r.x2+pad&&pt.y>=r.y1-pad&&pt.y<=r.y2+pad;
    if(!inside)continue;
    const cx=(r.x1+r.x2)/2,cy=(r.y1+r.y2)/2,d=Math.hypot(pt.x-cx,pt.y-cy);
    if(d<best){best=d;chosen={room,roomIndex:i,end:room.hitPlane.getWorldPosition(new THREE.Vector3()),warrior:warriors.find(w=>w.roomIndex===i&&w.hp>0)||null,direct:true,quality:1,placement:'TACTICAL LOCK',screenCenter:{x:cx,y:cy},screenRect:r}}
  }
  return chosen;
}
function drawControllerReticle(attacker,pt){
  if(!enemyAimOutlineLayer)return null;enemyAimOutlineLayer.innerHTML='';const hit=controllerReticleHit(attacker,pt);if(!hit)return null;
  const r=hit.screenRect,cx=hit.screenCenter.x,cy=hit.screenCenter.y,ns='http://www.w3.org/2000/svg';
  const rect=document.createElementNS(ns,'rect');rect.setAttribute('x',r.x1);rect.setAttribute('y',r.y1);rect.setAttribute('width',Math.max(1,r.x2-r.x1));rect.setAttribute('height',Math.max(1,r.y2-r.y1));rect.setAttribute('rx','5');rect.setAttribute('fill','rgba(62,196,255,.18)');rect.setAttribute('stroke','#62cfff');rect.setAttribute('stroke-width','3');rect.style.filter='drop-shadow(0 0 7px #37bfff)';enemyAimOutlineLayer.appendChild(rect);
  const ring=document.createElementNS(ns,'circle');ring.setAttribute('cx',cx);ring.setAttribute('cy',cy);ring.setAttribute('r',Math.max(15,Math.min(27,(r.x2-r.x1)*.32)));ring.setAttribute('fill','none');ring.setAttribute('stroke','#bdeeff');ring.setAttribute('stroke-width','2');ring.setAttribute('stroke-dasharray','7 5');ring.style.filter='drop-shadow(0 0 5px #62cfff)';enemyAimOutlineLayer.appendChild(ring);
  for(const [x1,y1,x2,y2] of [[cx-34,cy,cx-11,cy],[cx+11,cy,cx+34,cy],[cx,cy-34,cx,cy-11],[cx,cy+11,cx,cy+34]]){const l=document.createElementNS(ns,'line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('stroke','#d9f6ff');l.setAttribute('stroke-width','2');enemyAimOutlineLayer.appendChild(l)}
  diag('TAC-LINK RETICLE','room='+(hit.roomIndex+1));return hit;
}
`;
  if (!patched.includes('function controllerReticleHit(')) patched = patched.replace('function spawnTacLocator(attacker,start,pt,power,weapon){', controllerHelper + 'function spawnTacLocator(attacker,start,pt,power,weapon){');

  // Controller uses the selected reticle room as truth.
  patched = patched.replace(/const hit=locatorLineHit\(attacker,start,pt\),target=hit\?\.end\|\|targetPlanePointForOpponent\(attacker,pt\)/, "const hit=controllerReticleHit(attacker,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt)");
  patched = patched.replace(/const hit=sniperRoomHit\(attacker,pt\),target=hit\?\.end\|\|targetPlanePointForOpponent\(attacker,pt\)/, "const hit=controllerReticleHit(attacker,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt)");

  // Change Controller presentation from arc to direct tactical designation.
  patched = patched.replace("combat_controller:{name:'COMBAT CONTROLLER',kind:'locator',aim:'arc'", "combat_controller:{name:'COMBAT CONTROLLER',kind:'locator',aim:'straight'");

  // Inject a dedicated blue targeting reticle into the straight-aim branch and hide the generic line.
  patched = patched.replace(
    "const sniperProjected=wp.kind==='sniper',guideLen=sniperProjected?Math.max(430,Math.min(690,dist*2.9)):330,ratio=dist>0?guideLen/dist:0,gx=a.x+dx*ratio,gy=a.y+dy*ratio;",
    "const controllerTarget=wp.kind==='locator';if(controllerTarget){aimPath.style.opacity='0';aimDot.style.opacity='0';if(sniperCrosshair)sniperCrosshair.setAttribute('opacity','0');drawControllerReticle(selected,b);return}const sniperProjected=wp.kind==='sniper',guideLen=sniperProjected?Math.max(430,Math.min(690,dist*2.9)):330,ratio=dist>0?guideLen/dist:0,gx=a.x+dx*ratio,gy=a.y+dy*ratio;"
  );

  // Keep the Controller action alive until the locator actually lands and queues support.
  patched = patched.replace("if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid')endSoloPlayerTurnAfterShot();", "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='locator')endSoloPlayerTurnAfterShot();");
  patched = patched.replace("diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`)\n  }});return true", "diag('SUPPORT QUEUED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);if(!multiplayer&&attacker.side==='aurelian'&&battleStarted&&!matchEnded&&soloTurn==='aurelian')setTimeout(()=>{if(battleStarted&&!matchEnded&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()},180)\n  }});return true");
  patched = patched.replace("function advanceSupportTurn(side){\n  const call=supportCalls[side];if(call){", "function advanceSupportTurn(side){\n  const call=supportCalls[side];diag(call?'SUPPORT ARRIVAL CHECK':'SUPPORT WAITING',`${side} queued=${call?'Y':'N'} cooldown=${supportCooldown[side]||0}`);if(call){");

  // Precision explosive Sniper breach round.
  patched = patched.replace("const tuned={...weapon,armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),impactStrength:1.38};spawnExplosionVisual(target,0xffb45b,1.72*hit.quality);", "const tuned={...weapon,kind:'explosive',name:'EXPLOSIVE BREACH ROUND',armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),splash:Math.round(22*hit.quality),impactStrength:1.52};spawnExplosionVisual(target,0xffb45b,2.05*hit.quality);");
  patched = patched.replace("diag('SNIPER IMPACT',", "diag('SNIPER EXPLOSIVE IMPACT',");

  // Bombardier fortress-local impact prediction. No trajectory line.
  const impactPrediction = `function bombardierAimGuide(a,b){
  const p=bombardierTrajectoryProfile(a,b),sim=he9BallisticStagePath(selected,a,b,p.power,0,true),hit=sim.hit||null,rooms=opposingRooms(selected).userData.rooms;
  if(enemyAimOutlineLayer){enemyAimOutlineLayer.innerHTML='';if(hit){const center=hit.roomIndex,row=Math.floor(center/3),col=center%3,candidates=[];for(let i=0;i<rooms.length;i++){const rr=Math.floor(i/3),cc=i%3,step=Math.abs(rr-row)+Math.abs(cc-col);if(step<=2)candidates.push({i,step})}for(const c of candidates){const r=objectScreenRect(rooms[c.i].hitPlane,0),rect=document.createElementNS('http://www.w3.org/2000/svg','rect'),hot=c.step===0,near=c.step===1;rect.setAttribute('x',r.x1);rect.setAttribute('y',r.y1);rect.setAttribute('width',Math.max(1,r.x2-r.x1));rect.setAttribute('height',Math.max(1,r.y2-r.y1));rect.setAttribute('rx','4');rect.setAttribute('fill',hot?'rgba(255,126,24,.46)':near?'rgba(255,178,52,.25)':'rgba(255,215,95,.11)');rect.setAttribute('stroke',hot?'#ff7a18':near?'#ffb43b':'#ffd66b');rect.setAttribute('stroke-width',hot?'3':near?'2':'1');rect.setAttribute('stroke-dasharray',hot?'':'6 5');rect.style.filter=hot?'drop-shadow(0 0 8px #ff7a18)':near?'drop-shadow(0 0 4px #ffb43b)':'';enemyAimOutlineLayer.appendChild(rect)}diag('HE9 PREDICTION','centerRoom='+(center+1)+' spreadRooms='+candidates.map(x=>x.i+1).join(','))}else diag('HE9 PREDICTION','MISS')}
  return{d:'',end:b,profile:p};
}`;
  patched = patched.replace(/function bombardierAimGuide\(a,b\)\{[\s\S]*?\n\}\nfunction bombardierDescentPreview/, impactPrediction+'\nfunction bombardierDescentPreview');
  patched = patched.replace("aimPath.setAttribute('d',guide.d);", "aimPath.setAttribute('d',guide.d);if(wp.kind==='explosive')aimPath.style.opacity='0';");

  // Clear any fortress-local reticle/prediction when aiming stops.
  patched = patched.replace("function clearAim(){", "function clearAim(){if(enemyAimOutlineLayer)enemyAimOutlineLayer.innerHTML='';");

  patched = patched.replace('</head>', '<meta name="ac-earth-specialists-runtime" content="controller-blue-reticle sniper-explosive support-impact-queue bombardier-fortress-impact-prediction">\n</head>');
  return patched;
}
