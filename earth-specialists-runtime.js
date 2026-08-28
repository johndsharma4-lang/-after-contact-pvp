export function patchEarthSpecialistsRuntime(html) {
  let patched = html;

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.29');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_SNIPER_SMOOTH_CONTROLLER_VISIBILITY');

  // Shared aiming helpers. Sniper keeps the projected-wave concept but applies asymmetric damping
  // so horizontal thumb movement glides rather than snapping. The shot uses the same eased point.
  const controllerHelper = `let sniperAimSmooth=null;
function smoothSniperProjectedPoint(x,y){
  if(!sniperAimSmooth){sniperAimSmooth={x,y};return sniperAimSmooth}
  const dx=x-sniperAimSmooth.x,dy=y-sniperAimSmooth.y,dist=Math.hypot(dx,dy),ax=dist>55?.46:dist>24?.34:.24,ay=dist>55?.52:dist>24?.42:.34;
  if(Math.abs(dx)>1.1)sniperAimSmooth.x+=dx*ax;if(Math.abs(dy)>.9)sniperAimSmooth.y+=dy*ay;
  return sniperAimSmooth;
}
function controllerReticleHit(attacker,pt){
  const rooms=opposingRooms(attacker).userData.rooms,warriors=opposing(attacker);let chosen=null,best=Infinity;
  for(let i=0;i<rooms.length;i++){
    const room=rooms[i];if(room.erased)continue;const r=objectScreenRect(room.hitPlane,0),pad=22;
    const inside=pt.x>=r.x1-pad&&pt.x<=r.x2+pad&&pt.y>=r.y1-pad&&pt.y<=r.y2+pad;if(!inside)continue;
    const cx=(r.x1+r.x2)/2,cy=(r.y1+r.y2)/2,d=Math.hypot(pt.x-cx,pt.y-cy);
    if(d<best){best=d;chosen={room,roomIndex:i,end:room.hitPlane.getWorldPosition(new THREE.Vector3()),warrior:warriors.find(w=>w.roomIndex===i&&w.hp>0)||null,direct:true,quality:1,placement:'TACTICAL LOCK',screenCenter:{x:cx,y:cy},screenRect:r}}
  }
  return chosen;
}
function drawControllerReticle(attacker,pt){
  if(!enemyAimOutlineLayer)return null;enemyAimOutlineLayer.innerHTML='';const hit=controllerReticleHit(attacker,pt);if(!hit)return null;
  const r=hit.screenRect,cx=hit.screenCenter.x,cy=hit.screenCenter.y,ns='http://www.w3.org/2000/svg',pulse=.78+.22*Math.sin(performance.now()*.009);
  const glow=document.createElementNS(ns,'rect');glow.setAttribute('x',r.x1-5);glow.setAttribute('y',r.y1-5);glow.setAttribute('width',Math.max(1,r.x2-r.x1+10));glow.setAttribute('height',Math.max(1,r.y2-r.y1+10));glow.setAttribute('rx','8');glow.setAttribute('fill','rgba(0,150,255,'+(0.18*pulse).toFixed(3)+')');glow.setAttribute('stroke','rgba(94,220,255,'+(0.70*pulse).toFixed(3)+')');glow.setAttribute('stroke-width','6');glow.style.filter='drop-shadow(0 0 14px #20bfff)';enemyAimOutlineLayer.appendChild(glow);
  const rect=document.createElementNS(ns,'rect');rect.setAttribute('x',r.x1);rect.setAttribute('y',r.y1);rect.setAttribute('width',Math.max(1,r.x2-r.x1));rect.setAttribute('height',Math.max(1,r.y2-r.y1));rect.setAttribute('rx','5');rect.setAttribute('fill','rgba(50,202,255,'+(0.34*pulse).toFixed(3)+')');rect.setAttribute('stroke','#d8f8ff');rect.setAttribute('stroke-width','3');rect.style.filter='drop-shadow(0 0 8px #37cfff)';enemyAimOutlineLayer.appendChild(rect);
  const ring=document.createElementNS(ns,'circle');ring.setAttribute('cx',cx);ring.setAttribute('cy',cy);ring.setAttribute('r',Math.max(22,Math.min(34,(r.x2-r.x1)*.42)));ring.setAttribute('fill','rgba(50,190,255,.10)');ring.setAttribute('stroke','#e8fbff');ring.setAttribute('stroke-width','3');ring.setAttribute('stroke-dasharray','9 5');ring.style.filter='drop-shadow(0 0 9px #62cfff)';enemyAimOutlineLayer.appendChild(ring);
  for(const [x1,y1,x2,y2] of [[cx-42,cy,cx-13,cy],[cx+13,cy,cx+42,cy],[cx,cy-42,cx,cy-13],[cx,cy+13,cx,cy+42]]){const l=document.createElementNS(ns,'line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('stroke','#ffffff');l.setAttribute('stroke-width','3');l.style.filter='drop-shadow(0 0 4px #62cfff)';enemyAimOutlineLayer.appendChild(l)}
  const label=document.createElementNS(ns,'text');label.setAttribute('x',cx);label.setAttribute('y',Math.max(18,r.y1-10));label.setAttribute('text-anchor','middle');label.setAttribute('fill','#eaffff');label.setAttribute('stroke','#063654');label.setAttribute('stroke-width','3');label.setAttribute('paint-order','stroke');label.setAttribute('font-size','13');label.setAttribute('font-weight','900');label.setAttribute('letter-spacing','1.2');label.textContent='ROOM '+(hit.roomIndex+1)+' • DESIGNATE';label.style.filter='drop-shadow(0 0 6px #20cfff)';enemyAimOutlineLayer.appendChild(label);
  diag('TAC-LINK RETICLE','room='+(hit.roomIndex+1));return hit;
}
`;
  if (!patched.includes('function controllerReticleHit(')) patched = patched.replace('function spawnTacLocator(attacker,start,pt,power,weapon){', controllerHelper + 'function spawnTacLocator(attacker,start,pt,power,weapon){');
  patched = patched.replace(/const hit=locatorLineHit\(attacker,start,pt\),target=hit\?\.end\|\|targetPlanePointForOpponent\(attacker,pt\)/, "const hit=controllerReticleHit(attacker,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt)");
  patched = patched.replace(/const hit=sniperRoomHit\(attacker,pt\),target=hit\?\.end\|\|targetPlanePointForOpponent\(attacker,pt\)/, "const hit=controllerReticleHit(attacker,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt)");
  patched = patched.replace("combat_controller:{name:'COMBAT CONTROLLER',kind:'locator',aim:'arc'", "combat_controller:{name:'COMBAT CONTROLLER',kind:'locator',aim:'straight'");
  patched = patched.replace("const sniperProjected=wp.kind==='sniper',guideLen=sniperProjected?Math.max(430,Math.min(690,dist*2.9)):330,ratio=dist>0?guideLen/dist:0,gx=a.x+dx*ratio,gy=a.y+dy*ratio;", "const controllerTarget=wp.kind==='locator';if(controllerTarget){aimPath.style.opacity='0';aimDot.style.opacity='0';if(sniperCrosshair)sniperCrosshair.setAttribute('opacity','0');drawControllerReticle(selected,b);return}const sniperProjected=wp.kind==='sniper',guideLen=sniperProjected?Math.max(430,Math.min(690,dist*2.9)):330,ratio=dist>0?guideLen/dist:0,rawGX=a.x+dx*ratio,rawGY=a.y+dy*ratio,eased=sniperProjected?smoothSniperProjectedPoint(rawGX,rawGY):{x:rawGX,y:rawGY},gx=eased.x,gy=eased.y;");
  patched = patched.replace("const releasePt=selected?.weaponKey==='sniper'&&aimOriginStage?", "const releasePt=selected?.weaponKey==='sniper'&&sniperAimSmooth?{x:sniperAimSmooth.x,y:sniperAimSmooth.y}:selected?.weaponKey==='sniper'&&aimOriginStage?");

  patched = patched.replace("if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid')endSoloPlayerTurnAfterShot();", "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='locator')endSoloPlayerTurnAfterShot();");
  patched = patched.replace("diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`)\n  }});return true", "diag('SUPPORT QUEUED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);if(!multiplayer&&attacker.side==='aurelian'&&battleStarted&&!matchEnded&&soloTurn==='aurelian')setTimeout(()=>{if(battleStarted&&!matchEnded&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()},180)\n  }});return true");
  patched = patched.replace("function advanceSupportTurn(side){\n  const call=supportCalls[side];if(call){", "function advanceSupportTurn(side){\n  const call=supportCalls[side];diag(call?'SUPPORT ARRIVAL CHECK':'SUPPORT WAITING',`${side} queued=${call?'Y':'N'} cooldown=${supportCooldown[side]||0}`);if(call){");

  patched = patched.replace("const tuned={...weapon,armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),impactStrength:1.38};spawnExplosionVisual(target,0xffb45b,1.72*hit.quality);", "const tuned={...weapon,kind:'explosive',name:'EXPLOSIVE BREACH ROUND',armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),splash:Math.round(22*hit.quality),impactStrength:1.52};spawnExplosionVisual(target,0xffb45b,2.05*hit.quality);");
  patched = patched.replace("diag('SNIPER IMPACT',", "diag('SNIPER EXPLOSIVE IMPACT',");

  // Bombardier: moving probability field, not an exact answer.
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
  patched = patched.replace("function clearAim(){", "function clearAim(){sniperAimSmooth=null;if(enemyAimOutlineLayer)enemyAimOutlineLayer.innerHTML='';");

  patched = patched.replace('</head>', '<meta name="ac-earth-specialists-runtime" content="controller-high-visibility-reticle sniper-smoothed-lateral-aim sniper-explosive support-impact-queue bombardier-dynamic-probability-field">\n</head>');
  return patched;
}
