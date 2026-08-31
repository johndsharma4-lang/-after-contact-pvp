function replaceExact(source, before, after, status, key) {
  if (!source.includes(before)) return source;
  status[key] = true;
  return source.replace(before, after);
}

export function patchSoloEarthRoundRobinRuntime(html) {
  const status = {state:false, chooser:false, runner:false, reset:false};
  let patched = html;

  patched = replaceExact(
    patched,
    "let soloTurn='aurelian',soloRound=1,soloAiTimer=null;",
    "let soloTurn='aurelian',soloRound=1,soloAiTimer=null,soloEarthRotationIndex=0;",
    status,
    'state'
  );

  const oldChooser = `function chooseSoloAiTargetRoom(){
  const rooms=aRooms.userData.rooms;
  const candidates=rooms.map((room,index)=>({room,index,score:(100-room.armor)+Math.random()*38}));
  candidates.sort((a,b)=>b.score-a.score);
  return candidates[0];
}`;
  const newChooser = `function chooseSoloAiTargetRoom(attacker=null){
  const rooms=aRooms.userData.rooms,crew=[...aWarriors,...aShadows];
  const candidates=rooms.map((room,index)=>{const occupant=crew.find(w=>w.active&&w.hp>0&&w.roomIndex===index),damage=100-Math.max(0,room.armor),open=room.erased||room.armor<=0;let score=damage+Math.random()*24;if(occupant)score+=attacker?.weaponKey==='sniper'?115:62;if(open&&!occupant)score-=90;return{room,index,occupant,score}}).filter(x=>x.score>-60);
  candidates.sort((a,b)=>b.score-a.score);
  return candidates[0]||null;
}
function chooseSoloEarthWarrior(){
  const order=['bombardier','sniper','combat_controller'];
  for(let offset=0;offset<order.length;offset++){
    const slot=(soloEarthRotationIndex+offset)%order.length,key=order[slot],w=eWarriors.find(x=>x.active&&x.hp>0&&x.weaponKey===key);
    if(!w)continue;if(key==='combat_controller'&&supportCooldown.earth>0){diag('EARTH AI ROTATION SKIP',\`COMBAT CONTROLLER cooldown=${'${'}supportCooldown.earth}\`);continue}
    soloEarthRotationIndex=(slot+1)%order.length;diag('EARTH AI ROTATION',\`${'${'}STARTER_PROFILES[key]?.name||key} • slot ${'${'}slot+1}/3\`);return w;
  }
  return null;
}
function finishSoloEarthSpecialistTurn(label,delay){
  clearSoloAiTimer();soloAiTimer=setTimeout(()=>{soloAiTimer=null;if(multiplayer||!battleStarted||matchEnded||soloTurn!=='earth')return;diag('EARTH AI ACTION COMPLETE',label);if(!completeTurn()){soloRound++;setSoloTurn('aurelian')}},delay);
}`;
  patched = replaceExact(patched, oldChooser, newChooser, status, 'chooser');

  const oldRunner = `function runSoloEarthTurn(){
  if(multiplayer||!battleStarted||matchEnded||soloTurn!=='earth')return;
  const enemy=eWarriors[0];
  if(!enemy||enemy.hp<=0){checkMatchEnd();if(!matchEnded){soloRound++;setSoloTurn('aurelian')}return}
  const target=chooseSoloAiTargetRoom();
  if(!target)return;
  statusEl.textContent=\`ROUND ${'${'}soloRound} • EARTH AI FIRING HE-9\`;
  const solution=solveSoloHe9Shot(enemy,target),pt=solution.aim,power=solution.power;
  try{
    diag('AI HE9 SOLUTION',\`targetRoom=${'${'}target.index+1} result=${'${'}solution.exact?'EXACT':'PHYSICAL_FALLBACK'} elevation=${'${'}Math.round(solution.elevation||0)} power=${'${'}Math.round(power)}\`);
    fireWarriorFromStage(enemy,pt,power,false);
    diag('AI BARRAGE WAIT','turn held until all ten missiles resolve');
  }catch(err){
    diag('AI HE9 RECOVERY',String(err?.stack||err?.message||err));
    barrageActionLock=false;refreshMovePad();
    if(!completeTurn()){soloRound++;setSoloTurn('aurelian')}
  }
}`;
  const newRunner = `function runSoloEarthTurn(){
  if(multiplayer||!battleStarted||matchEnded||soloTurn!=='earth')return;
  const enemy=chooseSoloEarthWarrior();
  if(!enemy){checkMatchEnd();if(!matchEnded){diag('EARTH AI ROTATION','no available specialist • turn skipped');soloRound++;setSoloTurn('aurelian')}return}
  const target=chooseSoloAiTargetRoom(enemy);
  if(!target){soloRound++;setSoloTurn('aurelian');return}
  try{
    if(enemy.weaponKey==='bombardier'){
      statusEl.textContent=\`ROUND ${'${'}soloRound} • EARTH BOMBARDIER FIRING HE-9\`;
      const solution=solveSoloHe9Shot(enemy,target),pt=solution.aim,power=solution.power;
      diag('AI HE9 SOLUTION',\`targetRoom=${'${'}target.index+1} result=${'${'}solution.exact?'EXACT':'PHYSICAL_FALLBACK'} elevation=${'${'}Math.round(solution.elevation||0)} power=${'${'}Math.round(power)}\`);
      fireWarriorFromStage(enemy,pt,power,false);diag('AI BARRAGE WAIT','turn held until all ten missiles resolve');return;
    }
    const pt=worldToStage(target.room.hitPlane.getWorldPosition(new THREE.Vector3()));
    if(enemy.weaponKey==='sniper'){
      statusEl.textContent=\`ROUND ${'${'}soloRound} • EARTH SNIPER TAKING THE SHOT\`;diag('EARTH AI SNIPER',\`targetRoom=${'${'}target.index+1} occupant=${'${'}target.occupant?.displayName||'NONE'}\`);fireWarriorFromStage(enemy,pt,100,false);finishSoloEarthSpecialistTurn('SNIPER',1450);return;
    }
    statusEl.textContent=\`ROUND ${'${'}soloRound} • EARTH COMBAT CONTROLLER MARKING ROOM ${'${'}target.index+1}\`;diag('EARTH AI CONTROLLER',\`targetRoom=${'${'}target.index+1} cooldown=${'${'}supportCooldown.earth}\`);fireWarriorFromStage(enemy,pt,82,false);finishSoloEarthSpecialistTurn('COMBAT CONTROLLER',1900);
  }catch(err){
    diag('EARTH AI RECOVERY',String(err?.stack||err?.message||err));barrageActionLock=false;refreshMovePad();if(!completeTurn()){soloRound++;setSoloTurn('aurelian')}
  }
}`;
  patched = replaceExact(patched, oldRunner, newRunner, status, 'runner');

  patched = replaceExact(
    patched,
    "clearSoloAiTimer();soloTurn='aurelian';soloRound=1;turnsTaken=0;",
    "clearSoloAiTimer();soloTurn='aurelian';soloRound=1;soloEarthRotationIndex=0;turnsTaken=0;",
    status,
    'reset'
  );

  patched = patched.replace(/3D LAB • MOBILE PVP TEST • v0\.33\.\d+/g, '3D LAB • MOBILE PVP TEST • v0.33.48');
  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.48');
  patched = patched.replace(/build=2026-08-(28|29|30)_[A-Z0-9_]+/g, 'build=2026-08-30_AURELIAN_CINEMATIC_ROUND_ROBIN');
  const summary=Object.entries(status).map(([k,v])=>`${k}:${v?'OK':'MISS'}`).join(' ');
  return patched.replace('</head>', `<meta name="ac-solo-earth-round-robin" content="${summary}">\n</head>`);
}
