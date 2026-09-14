function replaceExact(source, before, after, status, key) {
  if (!source.includes(before)) return source;
  status[key] = true;
  return source.replace(before, after);
}

export function patchDestructionCinematicRuntime(html) {
  const status={endMatch:false,reset:false,breakaway:false};
  let patched=html;

  const breakawayArt=`const acArmorBreakawayFx=new Set();
function clearArmorBreakawayFx(){for(const root of acArmorBreakawayFx){root.parent?.remove(root)}acArmorBreakawayFx.clear()}
function spawnArmorBreakaway(room,stage=3){
  if(!room?.hitPlane||stage<3)return null;const faction=factionForWorldSide(room.visualSide),point=room.hitPlane.getWorldPosition(new THREE.Vector3()),root=new THREE.Group(),count=stage>=5?9:stage===4?6:4;
  root.name='AC_COMPARTMENT_ARMOR_BREAKAWAY';root.position.copy(point);scene.add(root);acArmorBreakawayFx.add(root);
  const faceColor=faction==='aurelian'?0xa86f23:faction==='earth'?0x657783:faction==='lizard'?0x365d40:0x4c405d,edgeColor=faction==='aurelian'?0xffce68:0xaed9ec,pieces=[];
  for(let i=0;i<count;i++){
    const w=.46+(i%3)*.22,h=.30+(i%2)*.20,shape=new THREE.Shape();shape.moveTo(-w,-h*.55);shape.lineTo(-w*.62,h*.72);shape.lineTo(w*.24,h);shape.lineTo(w,h*.18);shape.lineTo(w*.64,-h);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:.15+(i%3)*.055,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.035,bevelThickness:.035}),material=new THREE.MeshStandardMaterial({color:i%4===0?edgeColor:faceColor,metalness:.84,roughness:.38}),mesh=new THREE.Mesh(geometry,material);
    mesh.position.set((i%3-1)*.78+(Math.random()-.5)*.30,(Math.floor(i/3)-1)*.55+(Math.random()-.5)*.24,.18+(i%2)*.10);mesh.rotation.set(Math.random()*.35,Math.random()*.45,(i-count/2)*.13);mesh.castShadow=true;root.add(mesh);
    const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,24),new THREE.LineBasicMaterial({color:edgeColor,transparent:true,opacity:.78}));mesh.add(edge);
    pieces.push({mesh,velocity:new THREE.Vector3((Math.random()-.5)*(2.5+stage),1.8+Math.random()*(2.2+stage*.25),1.2+Math.random()*2.0),spin:new THREE.Vector3((Math.random()-.5)*5,(Math.random()-.5)*5,(Math.random()-.5)*7)});
  }
  const born=performance.now(),duration=stage>=5?2850:2200;function animate(now){if(!root.parent)return;const dt=Math.min(.035,Math.max(0,(now-(root.userData.last||born))/1000));root.userData.last=now;const t=(now-born)/duration;for(const p of pieces){p.velocity.y-=7.8*dt;p.mesh.position.addScaledVector(p.velocity,dt);p.mesh.rotation.x+=p.spin.x*dt;p.mesh.rotation.y+=p.spin.y*dt;p.mesh.rotation.z+=p.spin.z*dt;p.mesh.material.opacity=Math.max(0,1-Math.max(0,t-.72)/.28);p.mesh.material.transparent=t>.72}if(t<1)requestAnimationFrame(animate);else{root.parent?.remove(root);acArmorBreakawayFx.delete(root)}}requestAnimationFrame(animate);return root
}
`;
  if(!patched.includes('function spawnArmorBreakaway(room,stage=3)')){
    const before=patched;patched=patched.replace('function damageRoomVisual(room){',breakawayArt+'function damageRoomVisual(room){');status.breakaway=patched!==before;
  }
  patched=patched.replace("if(newStage===3){spawnDebris(p,0x625d55,22,.24,.54);ensureSmoke(room,p)}","if(newStage===3){spawnDebris(p,0x625d55,22,.24,.54);spawnArmorBreakaway(room,3);ensureSmoke(room,p)}");
  patched=patched.replace("if(newStage===4){spawnDebris(p,0x57524a,30,.34,.76);ensureSmoke(room,p);ensureFire(room,p)}","if(newStage===4){spawnDebris(p,0x57524a,30,.34,.76);spawnArmorBreakaway(room,4);ensureSmoke(room,p);ensureFire(room,p)}");
  patched=patched.replace("if(newStage===5){spawnDebris(p,0x514b44,44,.48,1.05);ensureSmoke(room,p);ensureFire(room,p);spawnImpactBurst(p,0xffc15a);diag('ROOM OPEN'","if(newStage===5){spawnDebris(p,0x514b44,44,.48,1.05);spawnArmorBreakaway(room,5);ensureSmoke(room,p);ensureFire(room,p);spawnImpactBurst(p,0xffc15a);diag('ROOM OPEN'");

  const oldEnd=`function endMatch(outcome,reason,fromNetwork=false){clearSoloAiTimer();setMusicMode('menu');
  if(matchEnded)return;
  matchEnded=true;solarActionLock=false;barrageActionLock=false;acidActionLock=false;refreshMovePad();aiming=false;pointerId=null;aimPath.setAttribute('d','');aimPath.style.opacity=0;aimDropPath.setAttribute('d','');aimDropPath.style.opacity=0;aimDot.style.opacity=0;muzzleDot.style.opacity=0;
  resultTitle.textContent=outcome;resultReason.textContent=reason;
  const breached=eRooms.userData.rooms.filter(r=>r.breach>=100).length,structureLost=Math.floor((1-Math.max(0,structureHp.earth)/STRUCTURE_MAX)*9+.0001),lost=Math.max(breached,structureLost);
  resultStats.textContent=\`SHOTS ${'${'}shots} • EARTH COMPARTMENTS LOST ${'${'}lost}/9\`;
  resultOverlay.classList.add('show');statusEl.textContent=\`MATCH COMPLETE • ${'${'}outcome}\`;if(multiplayer&&!fromNetwork)sendMp({type:'match_end',winner:outcome==='VICTORY'?localSide:opponentSide(),reason});
}`;
  const newEnd=`let endCinematicToken=0,endCinematicTimers=[];
function clearEndCinematic(){endCinematicToken++;for(const timer of endCinematicTimers)clearTimeout(timer);endCinematicTimers=[];for(const root of [aure,earth]){root.visible=true;root.scale.set(1,1,1);root.rotation.set(0,0,0)} }
function queueEndCinematic(fn,delay){const timer=setTimeout(fn,delay);endCinematicTimers.push(timer);return timer}
function showMatchResult(outcome,reason,loser){
  setMusicMode('menu');resultTitle.textContent=outcome;resultReason.textContent=reason;const rooms=loser==='aurelian'?aRooms:eRooms,breached=rooms.userData.rooms.filter(r=>r.breach>=100||r.erased).length,structureLost=Math.floor((1-Math.max(0,structureHp[loser])/STRUCTURE_MAX)*9+.0001),lost=Math.max(breached,structureLost);resultStats.textContent=\`SHOTS ${'${'}shots} • ${'${'}(FACTION_META[factionForSide(loser)]||FACTION_META.earth).short} COMPARTMENTS LOST ${'${'}lost}/9\`;resultOverlay.classList.add('show');statusEl.textContent=\`MATCH COMPLETE • ${'${'}outcome}\`;diag('DESTRUCTION CINEMATIC COMPLETE',\`loser=${'${'}loser} outcome=${'${'}outcome}\`)
}
function playDefeatCinematic(loser,outcome,reason){
  clearImpactFocus();prepareTerminalWreckFoundation(loser);const token=++endCinematicToken,root=loser==='aurelian'?aure:earth,rooms=(loser==='aurelian'?aRooms:eRooms).userData.rooms,order=[4,1,7,3,5,0,2,6,8],color=loser==='aurelian'?0xffbd35:0xff7138;
  statusEl.textContent=\`${'${'}outcome} CONFIRMED • FINAL DESTRUCTION • ${'${'}(FACTION_META[factionForSide(loser)]||FACTION_META.earth).short}\`;diag('DESTRUCTION CINEMATIC START',\`loser=${'${'}loser} outcome=${'${'}outcome} reason=${'${'}reason}\`);
  order.forEach((roomIndex,step)=>queueEndCinematic(()=>{if(token!==endCinematicToken)return;const room=rooms[roomIndex],point=room.hitPlane.getWorldPosition(new THREE.Vector3());spawnExplosionVisual(point,color,1.05+step*.06);spawnDebris(point,loser==='aurelian'?0x9a6b20:0x596570,12,.20,.62);spawnArmorBreakaway(room,5);kickCamera(.24+step*.025,.22);kickVesselVisual(loser,.75+step*.05);for(const part of [room.frame,room.cavity,room.edge,room.breachMask])if(part)part.visible=false;diag('DESTRUCTION SECTION',\`${'${'}loser} room=${'${'}roomIndex+1} step=${'${'}step+1}/9\`)},step*285));
  const collapseAt=order.length*285+180;queueEndCinematic(()=>{if(token!==endCinematicToken)return;const center=root.getWorldPosition(new THREE.Vector3());spawnExplosionVisual(center,0xff632e,3.2);spawnExplosionVisual(center.clone().add(new THREE.Vector3(-5,3,2)),0xffd15a,2.1);spawnExplosionVisual(center.clone().add(new THREE.Vector3(5,-2,-1)),0xff8a32,2.4);spawnDebris(center,0x55575a,14,.35,1.15);kickCamera(.62,.75);diag('DESTRUCTION CORE FAILURE',loser)},collapseAt);
  const vanishAt=collapseAt+520,start=performance.now();
  function collapseFrame(now){if(token!==endCinematicToken)return;const t=Math.max(0,Math.min(1,(now-start-collapseAt)/900));if(t>0){const s=Math.max(.02,1-t);root.scale.set(1+t*.38,s,s);root.rotation.z+=(loser==='aurelian'?-1:1)*.018}if(t<1){requestAnimationFrame(collapseFrame);return}root.visible=false;diag('DESTRUCTION SHIP DISAPPEAR',loser)}
  requestAnimationFrame(collapseFrame);
  queueEndCinematic(()=>{if(token!==endCinematicToken)return;root.visible=false;showMatchResult(outcome,reason,loser)},vanishAt+620);
}
function endMatch(outcome,reason,fromNetwork=false){clearSoloAiTimer();
  if(matchEnded)return;
  matchEnded=true;terminalCollapseActive=false;solarActionLock=false;barrageActionLock=false;acidActionLock=false;refreshMovePad();aiming=false;pointerId=null;aimPath.setAttribute('d','');aimPath.style.opacity=0;aimDropPath.setAttribute('d','');aimDropPath.style.opacity=0;aimDot.style.opacity=0;muzzleDot.style.opacity=0;damageFlash.queue=[];damageFlash.active=false;clearTimeout(damageFlash.t);damageFlash.style.opacity='0';resultOverlay.classList.remove('show');
  if(multiplayer&&!fromNetwork)sendMp({type:'match_end',winner:outcome==='VICTORY'?localSide:opponentSide(),reason});
  if(outcome==='DRAW'){showMatchResult(outcome,reason,opponentSide());return}
  const loser=multiplayer?(outcome==='VICTORY'?opponentSide():localSide):(outcome==='VICTORY'?'earth':'aurelian');playDefeatCinematic(loser,outcome,reason);
}`;
  const beforeEnd=patched;
  patched=patched.replace(/function endMatch\(outcome,reason,fromNetwork=false\)\{[\s\S]*?(?=\nfunction checkMatchEnd\(\))/,newEnd);
  status.endMatch=patched!==beforeEnd;
  patched=patched.replace("function clearEndCinematic(){endCinematicToken++;","function clearEndCinematic(){clearImpactFocus();endCinematicToken++;");
  patched=patched.replace("},step*285));","},step*300));");
  patched=patched.replace("const collapseAt=order.length*285+180;","const collapseAt=order.length*300+160;beginImpactFocus(loser,4,'FINAL DESTRUCTION',3900,true);");
  patched=patched.replace("spawnExplosionVisual(point,color,1.05+step*.06);spawnDebris(point,loser==='aurelian'?0x9a6b20:0x596570,12,.20,.62)","spawnExplosionVisual(point,color,1.28+step*.075);spawnDebris(point,loser==='aurelian'?0x9a6b20:0x596570,18,.20,.78)");
  patched=patched.replace("const vanishAt=collapseAt+520,start=performance.now();","const vanishAt=collapseAt+400,start=performance.now();");
  patched=patched.replace("(now-start-collapseAt)/900","(now-start-collapseAt)/700");
  patched=patched.replace("},vanishAt+620);","},vanishAt+450);");

  patched=replaceExact(
    patched,
    "function resetBattleWorld(nextPhase=null){\n  if(aiming)clearAim();",
    "function resetBattleWorld(nextPhase=null){\n  clearEndCinematic();clearArmorBreakawayFx();if(aiming)clearAim();",
    status,
    'reset'
  );

  patched=patched.replace(/3D LAB • MOBILE PVP TEST • v0\.33\.\d+/g,'3D LAB • MOBILE PVP TEST • v0.33.48');
  patched=patched.replace(/MATCH RECORDER v0\.33\.\d+/g,'MATCH RECORDER v0.33.48');
  patched=patched.replace(/build=2026-08-(28|29|30)_[A-Z0-9_]+/g,'build=2026-08-30_AURELIAN_CINEMATIC_ROUND_ROBIN');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>',`<meta name="ac-destruction-cinematic" content="${summary}">\n</head>`);
}
