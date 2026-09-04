function replaceOnce(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

export function patchCutawayLifecycleRuntime(html) {
  let patched = html;
  const status = { helper:false, aim:false, fire:false, soloTurn:false, mpTurn:false };

  const helper = `function acForceExteriorBattleView(reason='combat lifecycle'){
  if(!battleStarted||matchEnded)return false;
  const wasOpen=!!xrayOpen;
  if(wasOpen)closePrivateXray(reason);
  tacticalAimView=false;
  if(typeof updateBattleCamera==='function')updateBattleCamera();
  if(wasOpen)diag('CUTAWAY FORCE CLOSE',reason+' exterior=Y');
  return wasOpen
}
`;

  if (!patched.includes('function acForceExteriorBattleView(')) {
    const next = patched.replace('function beginAimFromVesselGesture', helper + 'function beginAimFromVesselGesture');
    status.helper = next !== patched;
    patched = next;
  } else status.helper = true;

  if (!patched.includes("acForceExteriorBattleView('aim start')")) {
    const next = patched.replace(/function beginAimFromVesselGesture\(([^)]*)\)\{/, "function beginAimFromVesselGesture($1){acForceExteriorBattleView('aim start');");
    status.aim = next !== patched;
    patched = next;
  } else status.aim = true;

  if (!patched.includes("acForceExteriorBattleView('fire commit')")) {
    const next = patched.replace(/function fireSelectedFromStage\(([^)]*)\)\{/, "function fireSelectedFromStage($1){acForceExteriorBattleView('fire commit');");
    status.fire = next !== patched;
    patched = next;
  } else status.fire = true;

  if (!patched.includes("acForceExteriorBattleView('solo turn handoff')")) {
    const next = patched.replace(/function endSoloPlayerTurnAfterShot\(([^)]*)\)\{/, "function endSoloPlayerTurnAfterShot($1){acForceExteriorBattleView('solo turn handoff');");
    status.soloTurn = next !== patched;
    patched = next;
  } else status.soloTurn = true;

  if (!patched.includes("acForceExteriorBattleView('multiplayer turn handoff')")) {
    const next = patched.replace(/function setMpTurn\(([^)]*)\)\{/, "function setMpTurn($1){acForceExteriorBattleView('multiplayer turn handoff');");
    status.mpTurn = next !== patched;
    patched = next;
  } else status.mpTurn = true;

  // A cutaway is a selection surface only. It must never remain the persistent camera
  // for aiming, firing, AI/opponent turns, or the start of the next turn. Impact reveals
  // remain independent and may still open briefly when an actual projectile hits a room.
  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.65');
  patched = patched.replace(/build=2026-09-01_[A-Z0-9_]+/g, 'build=2026-09-04_CUTAWAY_LIFECYCLE_EXTERIOR_COMBAT');

  const summary = Object.entries(status).map(([key,value])=>`${key}:${value?'OK':'MISS'}`).join(' ');
  patched = patched.replace('</head>', `<meta name="ac-cutaway-lifecycle" content="${summary}">\n</head>`);
  return patched;
}
