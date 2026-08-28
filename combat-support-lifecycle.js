export function patchCombatSupportLifecycle(html) {
  let patched = html;

  // Do not hand the solo turn to the AI while the TAC-LINK locator is still in flight.
  patched = patched.replace(
    "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid')endSoloPlayerTurnAfterShot();",
    "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='locator')endSoloPlayerTurnAfterShot();"
  );

  // A successful locator impact first commits the support call, then ends the player's action.
  // This removes the race where the next-turn support hook could run before supportCalls[side] existed.
  patched = patched.replace(
    "diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`)\n  }});return true",
    "diag('SUPPORT QUEUED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);diag('TAC-LINK ATTACHED',`${attacker.side} room=${hit.roomIndex+1} delayed=1_team_turn cooldown=3`);if(!multiplayer&&attacker.side==='aurelian'&&battleStarted&&!matchEnded&&soloTurn==='aurelian')setTimeout(()=>{if(battleStarted&&!matchEnded&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()},180)\n  }});return true"
  );

  // Make the delayed state observable every time the turn hook runs.
  patched = patched.replace(
    "function advanceSupportTurn(side){\n  const call=supportCalls[side];if(call){",
    "function advanceSupportTurn(side){\n  const call=supportCalls[side];diag(call?'SUPPORT ARRIVAL CHECK':'SUPPORT WAITING',`${side} queued=${call?'Y':'N'} cooldown=${supportCooldown[side]||0}`);if(call){"
  );

  // Recorder/build identity for this lifecycle fix.
  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.22');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_CONTROLLER_SUPPORT_LIFECYCLE');
  patched = patched.replace('</head>', '<meta name="ac-support-lifecycle" content="locator-impact-before-turn-pass">\n</head>');

  return patched;
}
