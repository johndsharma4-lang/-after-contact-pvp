export function patchEarthSpecialistsRuntime(html) {
  let patched = html;

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.32');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_CONTROLLER_RAY_ORIGIN_FIX');

  const aimingHelpers = `let sniperAimSmooth=null;
function smoothSniperProjectedPoint(x,y){
  if(!sniperAimSmooth){sniperAimSmooth={x,y};return sniperAimSmooth}
  const dx=x-sniperAimSmooth.x,dy=y-sniperAimSmooth.y,dist=Math.hypot(dx,dy),ax=dist>55?.46:dist>24?.34:.24,ay=dist>55?.52:dist>24?.42:.34;
  if(Math.abs(dx)>1.1)sniperAimSmooth.x+=dx*ax;if(Math.abs(dy)>.9)sniperAimSmooth.y+=dy*ay;
  return sniperAimSmooth;
}
function controllerRayHit(attacker,startWorld,aimPt){
  const start=worldToStage(startWorld),dx=aimPt.x-start.x,dy=aimPt.y-start.y,mag=Math.hypot(dx,dy)||1;if(mag<8)return null;
  const ux=dx/mag,uy=dy/mag,rooms=opposingRooms(attacker).userData.rooms,warriors=opposing(attacker);let best=null;
  function rayRect(rect){const pad=8,r={x1:rect.x1-pad,y1:rect.y1-pad,x2:rect.x2+pad,y2:rect.y2+pad};let tmin=0,tmax=1600;for(const axis of ['x','y']){const o=start[axis],d=axis==='x'?ux:uy,lo=axis==='x'?r.x1:r.y1,hi=axis==='x'?r.x2:r.y2;if(Math.abs(d)<1e-6){if(o<lo||o>hi)return null;continue}let a=(lo-o)/d,b=(hi-o)/d;if(a>b){const z=a;a=b;b=z}tmin=Math.max(tmin,a);tmax=Math.min(tmax,b);if(tmax<tmin)return null}return tmin>=0?tmin:null}
  for(let i=0;i<rooms.length;i++){const room=rooms[i];if(room.erased)continue;const rect=objectScreenRect(room.hitPlane,0),t=rayRect(rect);if(t==null)continue;if(!best||t<best.t){const cx=(rect.x1+rect.x2)/2,cy=(rect.y1+rect.y2)/2;best={t,room,roomIndex:i,end:stagePointToRoomWorld({x:cx,y:cy},room),warrior:warriors.find(w=>w.roomIndex===i&&w.hp>0)||null,direct:true,quality:1,placement:'TACTICAL RAY LOCK',screenCenter:{x:cx,y:cy},screenRect:rect,lineEnd:{x:start.x+ux*Math.min(760,t+40),y:start.y+uy*Math.min(760,t+40)}}}}
  return best;
}
function drawControllerReticle(attacker,startWorld,pt){
  if(!enemyAimOutlineLayer)return null;enemyAimOutlineLayer.innerHTML='';const hit=controllerRayHit(attacker,startWorld,pt),start=worldToStage(startWorld),dx=pt.x-start.x,dy=pt.y-start.y,mag=Math.hypot(dx,dy)||1,ux=dx/mag,uy=dy/mag,ns='http://www.w3.org/2000/svg';
  const fallback={x:start.x+ux*680,y:start.y+uy*680},lineEnd=hit?.screenCenter||fallback;
  aimPath.setAttribute('d','M '+start.x+' '+start.y+' L '+lineEnd.x+' '+lineEnd.y);aimPath.style.stroke='#5edcff';aimPath.style.strokeWidth='4';aimPath.style.strokeDasharray='12 7';aimPath.style.opacity='.92';aimPath.style.filter='drop-shadow(0 0 7px #20bfff)';
  if(!hit)return null;const r=hit.screenRect,cx=hit.screenCenter.x,cy=hit.screenCenter.y,pulse=.78+.22*Math.sin(performance.now()*.009);
  const glow=document.createElementNS(ns,'rect');glow.setAttribute('x',r.x1-5);glow.setAttribute('y',r.y1-5);glow.setAttribute('width',Math.max(1,r.x2-r.x1+10));glow.setAttribute('height',Math.max(1,r.y2-r.y1+10));glow.setAttribute('rx','8');glow.setAttribute('fill','rgba(0,160,255,'+(0.22*pulse).toFixed(3)+')');glow.setAttribute('stroke','#7eeaff');glow.setAttribute('stroke-width','6');glow.style.filter='drop-shadow(0 0 14px #20bfff)';enemyAimOutlineLayer.appendChild(glow);
  const ring=document.createElementNS(ns,'circle');ring.setAttribute('cx',cx);ring.setAttribute('cy',cy);ring.setAttribute('r','28');ring.setAttribute('fill','rgba(70,205,255,.10)');ring.setAttribute('stroke','#ffffff');ring.setAttribute('stroke-width','3');ring.setAttribute('stroke-dasharray','9 5');enemyAimOutlineLayer.appendChild(ring);
  const label=document.createElementNS(ns,'text');label.setAttribute('x',cx);label.setAttribute('y',Math.max(18,r.y1-10));label.setAttribute('text-anchor','middle');label.setAttribute('fill','#eaffff');label.setAttribute('stroke','#063654');label.setAttribute('stroke-width','3');label.setAttribute('paint-order','stroke');label.setAttribute('font-size','13');label.setAttribute('font-weight','900');label.textContent='ROOM '+(hit.roomIndex+1)+' • DESIGNATED';enemyAimOutlineLayer.appendChild(label);diag('TAC-LINK RAY LOCK','room='+(hit.roomIndex+1));return hit;
}
`;
  if (!patched.includes('function controllerRayHit(')) patched = patched.replace('function spawnTacLocator(attacker,start,pt,power,weapon){', aimingHelpers + 'function spawnTacLocator(attacker,start,pt,power,weapon){');

  patched = patched.replace(/const hit=locatorLineHit\(attacker,start,pt\),target=hit\?\.end\|\|targetPlanePointForOpponent\(attacker,pt\)/, "const hit=controllerRayHit(attacker,start,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt)");
  patched = patched.replace(/const hit=controllerReticleHit\(attacker,pt\),target=hit\?\.end\|\|targetPlanePointForOpponent\(attacker,pt\)/, "const hit=controllerRayHit(attacker,start,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt)");
  patched = patched.replace(/const hit=sniperRoomHit\(attacker,pt\),target=hit\?\.end\|\|targetPlanePointForOpponent\(attacker,pt\)/, "const hit=controllerRayHit(attacker,start,pt),target=hit?.end||targetPlanePointForOpponent(attacker,pt)");
  patched = patched.replace("combat_controller:{name:'COMBAT CONTROLLER',kind:'locator',aim:'arc'", "combat_controller:{name:'COMBAT CONTROLLER',kind:'locator',aim:'straight'");

  patched = patched.replace("const sniperProjected=wp.kind==='sniper',guideLen=sniperProjected?Math.max(430,Math.min(690,dist*2.9)):330,ratio=dist>0?guideLen/dist:0,gx=a.x+dx*ratio,gy=a.y+dy*ratio;", "const controllerTarget=wp.kind==='locator';if(controllerTarget){aimDot.style.opacity='0';if(sniperCrosshair)sniperCrosshair.setAttribute('opacity','0');const controllerOrigin=muzzleWorld(selected,b);drawControllerReticle(selected,controllerOrigin,b);return}const sniperProjected=wp.kind==='sniper',guideLen=sniperProjected?Math.max(430,Math.min(690,dist*2.9)):330,ratio=dist>0?guideLen/dist:0,rawGX=a.x+dx*ratio,rawGY=a.y+dy*ratio,eased=sniperProjected?smoothSniperProjectedPoint(rawGX,rawGY):{x:rawGX,y:rawGY},gx=eased.x,gy=eased.y;");
  patched = patched.replace("drawControllerReticle(selected,selected.muzzle.getWorldPosition(new THREE.Vector3()),b);return", "drawControllerReticle(selected,muzzleWorld(selected,b),b);return");
  patched = patched.replace("const releasePt=selected?.weaponKey==='sniper'&&aimOriginStage?", "const releasePt=selected?.weaponKey==='sniper'&&sniperAimSmooth?{x:sniperAimSmooth.x,y:sniperAimSmooth.y}:selected?.weaponKey==='sniper'&&aimOriginStage?");

  patched = patched.replace("if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid')endSoloPlayerTurnAfterShot();", "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='locator')endSoloPlayerTurnAfterShot();");
  patched = patched.replace("diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`)\n  }});return true", "diag('SUPPORT QUEUED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);if(!multiplayer&&attacker.side==='aurelian'&&battleStarted&&!matchEnded&&soloTurn==='aurelian')setTimeout(()=>{if(battleStarted&&!matchEnded&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()},180)\n  }});return true");
  patched = patched.replace("function advanceSupportTurn(side){\n  const call=supportCalls[side];if(call){", "function advanceSupportTurn(side){\n  const call=supportCalls[side];diag(call?'SUPPORT ARRIVAL CHECK':'SUPPORT WAITING',`${side} queued=${call?'Y':'N'} cooldown=${supportCooldown[side]||0}`);if(call){");

  patched = patched.replace("const tuned={...weapon,armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),impactStrength:1.38};spawnExplosionVisual(target,0xffb45b,1.72*hit.quality);", "const tuned={...weapon,kind:'explosive',name:'EXPLOSIVE BREACH ROUND',armorDamage:Math.round(weapon.armorDamage*hit.quality),damage:Math.round(weapon.damage*hit.quality),splash:Math.round(22*hit.quality),impactStrength:1.52};spawnExplosionVisual(target,0xffb45b,2.05*hit.quality);");
  patched = patched.replace("diag('SNIPER IMPACT',", "diag('SNIPER EXPLOSIVE IMPACT',");

  const impactPrediction = `function bombardierAimGuide(a,b){
  const p=bombardierTrajectoryProfile(a,b),rooms=opposingRooms(selected).userData.rooms,counts=new Map(),samples=[-.06,-.03,0,.03,.06],centerSim=he9BallisticStagePath(selected,a,b,p.power,0,true),pts=(centerSim.points||[]).filter((q,i)=>i%3===0||i===(centerSim.points||[]).length-1);
  for(const lane of samples){const sim=he9BallisticStagePath(selected,a,b,p.power,lane,true),hit=sim.hit;if(hit)counts.set(hit.roomIndex,(counts.get(hit.roomIndex)||0)+1)}
  if(enemyAimOutlineLayer){enemyAimOutlineLayer.innerHTML='';const t=performance.now()*.0045,breathe=.84+.16*Math.sin(t),scores=[];for(let i=0;i<rooms.length;i++){let score=(counts.get(i)||0)/samples.length;if(score<=0){let nearest=0;for(const [j,n] of counts){const r1=Math.floor(i/3),c1=i%3,r2=Math.floor(j/3),c2=j%3,d=Math.abs(r1-r2)+Math.abs(c1-c2);nearest=Math.max(nearest,(n/samples.length)*Math.max(0,.34-d*.12))}score=nearest}if(score>.05)scores.push({i,score})}
    for(const s of scores){const r=objectScreenRect(rooms[s.i].hitPlane,0),rect=document.createElementNS('http://www.w3.org/2000/svg','rect'),confidence=Math.min(.74,s.score*.66)*breathe;rect.setAttribute('x',r.x1-2);rect.setAttribute('y',r.y1-2);rect.setAttribute('width',Math.max(1,r.x2-r.x1+4));rect.setAttribute('height',Math.max(1,r.y2-r.y1+4));rect.setAttribute('rx','8');rect.setAttribute('fill','rgba(255,151,35,'+(confidence*.42).toFixed(3)+')');rect.setAttribute('stroke','rgba(255,202,85,'+(confidence*.82).toFixed(3)+')');rect.setAttribute('stroke-width',s.score>.5?'2.6':'1.5');rect.setAttribute('stroke-dasharray',s.score>.5?'9 5':'5 7');rect.style.filter='drop-shadow(0 0 '+Math.round(4+8*s.score)+'px rgba(255,135,20,'+confidence.toFixed(3)+'))';enemyAimOutlineLayer.appendChild(rect)}diag('HE9 TRAJECTORY PREVIEW','power='+Math.round(p.power)+' rooms='+scores.map(s=>(s.i+1)+':'+Math.round(s.score*100)).join(','))}
  const visibleCount=Math.max(2,Math.ceil(pts.length*.5)),visiblePts=pts.slice(0,visibleCount),d=visiblePts.length?visiblePts.map((q,i)=>(i?'L ':'M ')+q.x.toFixed(2)+' '+q.y.toFixed(2)).join(' '):('M '+a.x+' '+a.y+' L '+b.x+' '+b.y);return{d,end:visiblePts.length?visiblePts[visiblePts.length-1]:b,profile:p};
}`;
  patched = patched.replace(/function bombardierAimGuide\(a,b\)\{[\s\S]*?\n\}\nfunction bombardierDescentPreview/, impactPrediction+'\nfunction bombardierDescentPreview');
  patched = patched.replace("aimPath.setAttribute('d',guide.d);if(wp.kind==='explosive')aimPath.style.opacity='0';", "aimPath.setAttribute('d',guide.d);if(wp.kind==='explosive'){aimPath.style.stroke='#69cfff';aimPath.style.strokeWidth='3';aimPath.style.strokeDasharray='10 8';aimPath.style.opacity='.78';aimPath.style.filter='drop-shadow(0 0 5px #2caeff)'}");
  patched = patched.replace("aimPath.setAttribute('d',guide.d);", "aimPath.setAttribute('d',guide.d);if(wp.kind==='explosive'){aimPath.style.stroke='#69cfff';aimPath.style.strokeWidth='3';aimPath.style.strokeDasharray='10 8';aimPath.style.opacity='.78';aimPath.style.filter='drop-shadow(0 0 5px #2caeff)'}");
  patched = patched.replace("function clearAim(){", "function clearAim(){sniperAimSmooth=null;if(enemyAimOutlineLayer)enemyAimOutlineLayer.innerHTML='';");

  patched = patched.replace('</head>', '<meta name="ac-earth-specialists-runtime" content="controller-safe-origin-ray-lock bombardier-half-guide-probability sniper-smoothed-explosive support-queue">\n</head>');
  return patched;
}
