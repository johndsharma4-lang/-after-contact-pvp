export function patchCombatAuthorityRuntime(html){
  if(html.includes('ac-combat-authority-v0380'))return html;
  let patched=html;
  const status={origin:false,release:false,watchdog:false,input:false,forward:false,scale:false,stage:false,camera:false};

  // AIM AUDIT: weapon animation is allowed to follow the pointer, but it must never rewrite
  // the mathematical aim origin/start point after the gesture begins. That moving origin was
  // corrupting power, direction, tactical zoom progress and projectile geometry simultaneously.
  let next=patched.replace(/acWarriorRefreshAimOrigin\(selected,b,false\);/g,'acWarriorPoseAim(selected,b,false);');status.origin=next!==patched;patched=next;
  next=patched.replace(/acWarriorRefreshAimOrigin\(acReleaseWarrior,pt,true\);/g,'acWarriorPoseAim(acReleaseWarrior,pt,true);');status.release=next!==patched;patched=next;
  next=patched.replace(/acWarriorRefreshAimOrigin\(w,pt,true\);fireWarriorFromStage/g,'acWarriorPoseAim(w,pt,true);fireWarriorFromStage');status.watchdog=next!==patched;patched=next;

  // INPUT/PHYSICS AUDIT: keep pointer coordinates inside the real 1280x720 stage and measure
  // tactical progress from the immutable gesture start. Never remap the actual shot target.
  const trackRe=/function acTrackTacticalAimPoint\(raw\)\{[\s\S]*?\n\}/;
  const trackFn=`function acTrackTacticalAimPoint(raw){
 if(!raw)return raw;
 const pt={x:Math.max(0,Math.min(1280,raw.x)),y:Math.max(0,Math.min(720,raw.y))};
 if(!xrayOpen||!aiming||!selected||!startPx)return pt;
 acTacticalCutaway.mode='aimPullback';
 const enemyRoot=selected.side==='aurelian'?earth:aure,enemyStage=worldToStage(enemyRoot.getWorldPosition(new THREE.Vector3())),dir=Math.sign(enemyStage.x-startPx.x)||1,forward=Math.max(0,(pt.x-startPx.x)*dir);
 acTacticalCutaway.inputProgress=Math.max(0,Math.min(1,forward/210));
 return pt
}`;
  next=patched.replace(trackRe,trackFn);status.input=next!==patched;patched=next;

  const forwardRe=/function acAimForwardValid\(pt\)\{[\s\S]*?\n\}/;
  const forwardFn=`function acAimForwardValid(pt){
 if(!selected||!startPx||!pt)return true;
 const p={x:Math.max(0,Math.min(1280,pt.x)),y:Math.max(0,Math.min(720,pt.y))},enemyRoot=selected.side==='aurelian'?earth:aure,enemyStage=worldToStage(enemyRoot.getWorldPosition(new THREE.Vector3())),dir=Math.sign(enemyStage.x-startPx.x)||1;
 return (p.x-startPx.x)*dir>18
}`;
  next=patched.replace(forwardRe,forwardFn);status.forward=next!==patched;patched=next;

  // STAGING AUDIT: the measured Lancer was ~5.5 world units tall in a 4.35-unit room.
  // Reduce only cutaway warrior scale; ship, rooms, hit planes and battle models stay untouched.
  next=patched.replace(/rig3D\.scale\.setScalar\(\.92\)/g,'rig3D.scale.setScalar(.70)');status.scale=next!==patched;patched=next;

  // Selection is not a hull-closing event. The eight non-shooter rooms close progressively while aiming.
  next=patched.replace(/module\.visible=i!==w\.roomIndex&&!room\?\.erased&&\(room\?\.breach\?\?0\)<100;/g,'module.visible=false;');status.stage=next!==patched;patched=next;

  // CAMERA AUDIT: there were multiple camera owners. Tactical aiming gets first refusal while a
  // gesture is active; projectile/beam presentation resumes ownership immediately after firing.
  if(!patched.includes('AC_AUTHORITY_AIM_CAMERA')){
    next=patched.replace('  acDirectorBusy();\n  if(xrayOpen&&acTacticalCutawayCamera(snap))return;',"  acDirectorBusy();\n  /* AC_AUTHORITY_AIM_CAMERA */\n  if(xrayOpen&&aiming&&selected&&acTacticalCutawayCamera(snap))return;");
    if(next===patched)next=patched.replace('  acDirectorBusy();\n',"  acDirectorBusy();\n  /* AC_AUTHORITY_AIM_CAMERA */\n  if(xrayOpen&&aiming&&selected&&typeof acTacticalCutawayCamera==='function'&&acTacticalCutawayCamera(snap))return;\n");
    status.camera=next!==patched;patched=next;
  }else status.camera=true;

  // Make the recorder/build identify the audited control stack rather than an older feature patch.
  patched=patched.replace(/MATCH RECORDER v0\.34\.4/g,'MATCH RECORDER v0.38.0');
  patched=patched.replace(/build=2026-09-05_[A-Z0-9_]+/g,'build=2026-09-05_COMBAT_AUTHORITY_AUDIT');
  const summary=Object.entries(status).map(([k,v])=>k+':'+(v?'OK':'MISS')).join(' ');
  return patched.replace('</head>','<meta id="ac-combat-authority-v0380" name="ac-combat-authority" content="'+summary+'">\n</head>')
}
