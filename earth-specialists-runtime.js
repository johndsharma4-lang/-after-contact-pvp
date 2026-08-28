export function patchEarthSpecialistsRuntime(html) {
  let patched = html;

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.28');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_HE9_DYNAMIC_PROBABILITY_FIELD');

  // Combat Controller: direct tactical reticle selection. No ray or ballistic aiming.
  const controllerHelper = `function controllerReticleHit(attacker,pt){
  const rooms=opposingRooms(attacker).userData.rooms,warriors=opposing(attacker);let chosen=null,best=Infinity;
  for(let i=0;i<rooms.length;i++){
    const room=rooms[i];if(room.erased)continue;const r=objectScreenRect(room.hitPlane,0),pad=18;
    const inside=pt.x>=r.x1-pad&&pt.x<=r.x2+pad&&pt.y>=r.y1-pad&&pt.y<=r.y2+pad;if(!inside)continue;
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
  patched = patched.replace(/const hit=locatorLineHit\(attacker,start,pt\),target=hit\?\.end\|\|targetPlanePointForOpponent\(attacker,pt\)/, "const hit=controllerReticleHit(attacker,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt)");
  patched = patched.replace(/const hit=sniperRoomHit\(attacker,pt\),target=hit\?\.end\|\|targetPlanePointForOpponent\(attacker,pt\)/, "const hit=controllerReticleHit(attacker,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt)");
  patched = patched.replace("combat_controller:{name:'COMBAT CONTROLLER',kind:'locator',aim:'arc'", "combat_controller:{name:'COMBAT CONTROLLER',kind:'locator',aim:'straight'");
  patched = patched.replace("const sniperProjected=wp.kind==='sniper',guideLen=sniperProjected?Math.max(430,Math.min(690,dist*2.9)):330,ratio=dist>0?guideLen/dist:0,gx=a.x+dx*ratio,gy=a.y+dy*ratio;", "const controllerTarget=wp.kind==='locator';if(controllerTarget){aimPath.style.opacity='0';aimDot.style.opacity='0';if(sniperCrosshair)sniperCrosshair.setAttribute('opacity','0');drawControllerReticle(selected,b);return}const sniperProjected=wp.kind==='sniper',guideLen=sniperProjected?Math.max(430,Math.min(690,dist*2.9)):330,ratio=dist>0?guideLen/dist:0,gx=a.x+dx*ratio,gy=a.y+dy*ratio;");

  patched = patched.replace("if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid')endSoloPlayerTurnAfterShot();", "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='locator')endSoloPlayerTurnAfterShot();");
  patched = patched.replace("diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`)\n  }});return true", "diag('SUPPORT QUEUED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);if(!multiplayer&&attacker.side==='aurelian'&&battleStarted&&!matchEnded&&soloTurn==='aurelian')setTimeout(()=>{if(battleStarted&&!matchEnded&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()},180)\n  }});return true");
  patched = patched.replace("function advanceSupportTurn(side){\n  const call=supportCalls[side];if(call){", "function advanceSupportTurn(side){\n  const call=supportCalls[side];diag(call?'SUPPORT ARRIVAL CHECK':'SUPPORT WAITING',`${side} queued=${call?'Y':'N'} cooldown=${supportCooldown[side]||0}`);if(call){");

  patched = patched.replace("const tuned={...weapon,armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),impactStrength:1.38};spawnExplosionVisual(target,0xffb45b,1.72*hit.quality);", "const tuned={...weapon,kind:'explosive',name:'EXPLOSIVE BREACH ROUND',armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),splash:Math.round(22*hit.quality),impactStrength:1.52};spawnExplosionVisual(target,0xffb45b,2.05*hit.quality);");
  patched = patched.replace("diag('SNIPER IMPACT',", "diag('SNIPER EXPLOSIVE IMPACT',");

  // Bombardier: a moving probability field rather than an exact answer. Five nearby ballistic
  // samples estimate the HE-9 envelope. Room confidence is deliberately softened and breathed so
  // the player reads a dangerous area, while the real barrage still resolves its own trajectories.
  const impactPrediction = `function bombardierAimGuide(a,b){
  const p=bombardierTrajectoryProfile(a,b),rooms=opposingRooms(selected).userData.rooms,counts=new Map(),samples=[-.055,-.028,0,.028,.055];
  for(const lane of samples){const sim=he9BallisticStagePath(selected,a,b,p.power,lane,true),hit=sim.hit;if(hit)counts.set(hit.roomIndex,(counts.get(hit.roomIndex)||0)+1)}
  if(enemyAimOutlineLayer){enemyAimOutlineLayer.innerHTML='';const t=performance.now()*.0045,breathe=.82+.18*Math.sin(t),scores=[];
    for(let i=0;i<rooms.length;i++){let score=(counts.get(i)||0)/samples.length;if(score<=0){let nearest=0;for(const [j,n] of counts){const r1=Math.floor(i/3),c1=i%3,r2=Math.floor(j/3),c2=j%3,d=Math.abs(r1-r2)+Math.abs(c1-c2);nearest=Math.max(nearest,(n/samples.length)*Math.max(0,.38-d*.14))}score=nearest}if(score>.045)scores.push({i,score})}
    for(const s of scores){const r=objectScreenRect(rooms[s.i].hitPlane,0),rect=document.createElementNS('http://www.w3.org/2000/svg','rect'),confidence=Math.min(.72,s.score*.62)*breathe;rect.setAttribute('x',r.x1-2);rect.setAttribute('y',r.y1-2);rect.setAttribute('width',Math.max(1,r.x2-r.x1+4));rect.setAttribute('height',Math.max(1,r.y2-r.y1+4));rect.setAttribute('rx','8');rect.setAttribute('fill','rgba(255,166,47,'+(confidence*.42).toFixed(3)+')');rect.setAttribute('stroke','rgba(255,195,82,'+(confidence*.78).toFixed(3)+')');rect.setAttribute('stroke-width',s.score>.55?'2.4':'1.4');rect.setAttribute('stroke-dasharray',s.score>.55?'9 5':'5 7');rect.style.filter='drop-shadow(0 0 '+Math.round(3+7*s.score)+'px rgba(255,150,30,'+confidence.toFixed(3)+'))';enemyAimOutlineLayer.appendChild(rect)}
    if(scores.length){const xs=scores.map(s=>{const r=objectScreenRect(rooms[s.i].hitPlane,0);return(r.x1+r.x2)/2}),ys=scores.map(s=>{const r=objectScreenRect(rooms[s.i].hitPlane,0);return(r.y1+r.y2)/2}),cx=xs.reduce((q,v)=>q+v,0)/xs.length,cy=ys.reduce((q,v)=>q+v,0)/ys.length,ns='http://www.w3.org/2000/svg',halo=document.createElementNS(ns,'ellipse');halo.setAttribute('cx',cx+Math.sin(t*.73)*5);halo.setAttribute('cy',cy+Math.cos(t*.61)*4);halo.setAttribute('rx',42+scores.length*8+Math.sin(t)*5);halo.setAttribute('ry',27+scores.length*5+Math.cos(t*.8)*4);halo.setAttribute('fill','none');halo.setAttribute('stroke','rgba(255,205,110,.38)');halo.setAttribute('stroke-width','2');halo.setAttribute('stroke-dasharray','4 8');halo.style.filter='drop-shadow(0 0 7px rgba(255,150,30,.45))';enemyAimOutlineLayer.appendChild(halo)}
    diag('HE9 PROBABILITY FIELD','rooms='+scores.map(s=>(s.i+1)+':'+Math.round(s.score*100)).join(','));
  }
  return{d:'',end:b,profile:p};
}`;
  patched = patched.replace(/function bombardierAimGuide\(a,b\)\{[\s\S]*?\n\}\nfunction bombardierDescentPreview/, impactPrediction+'\nfunction bombardierDescentPreview');
  patched = patched.replace("aimPath.setAttribute('d',guide.d);", "aimPath.setAttribute('d',guide.d);if(wp.kind==='explosive')aimPath.style.opacity='0';");
  patched = patched.replace("function clearAim(){", "function clearAim(){if(enemyAimOutlineLayer)enemyAimOutlineLayer.innerHTML='';");

  patched = patched.replace('</head>', '<meta name="ac-earth-specialists-runtime" content="controller-blue-reticle sniper-explosive support-impact-queue bombardier-dynamic-probability-field">\n</head>');
  return patched;
}
