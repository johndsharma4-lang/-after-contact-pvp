export function patchAimCameraHardFixRuntime(html) {
  if (html.includes('ac-aim-camera-hard-fix')) return html;

  const needle = `function updateBattleCamera(snap=false,frameDt=null){
  if(!battleStarted||typeof camera==='undefined')return;`;

  const replacement = `let acAimHardFrameLogged=false;
function updateBattleCamera(snap=false,frameDt=null){
  if(!battleStarted||typeof camera==='undefined')return;
  const acAimHardActive=!!(xrayOpen&&selected&&(aiming||tacticalAimView||(typeof acPresentation!=='undefined'&&acPresentation?.phase==='aim')));
  if(acAimHardActive){
    const shooterVisual=(typeof xrayRoomVisuals!=='undefined'&&xrayRoomVisuals?.find)?xrayRoomVisuals.find(v=>v.warrior===selected):null;
    const shooter=shooterVisual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(selected);
    const enemyRoot=selected.side==='aurelian'?earth:aure;
    const enemy=enemyRoot.getWorldPosition(new THREE.Vector3());
    const center=shooter.clone().lerp(enemy,.56);
    const span=Math.max(72,Math.abs(enemy.x-shooter.x)+46);
    const vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf));
    const targetPos=new THREE.Vector3(center.x,Math.max(shooter.y,enemy.y)+8,Math.max(104,zNeed+28));
    const targetLook=new THREE.Vector3(center.x,(shooter.y+enemy.y)*.5+1.2,2);
    const alpha=snap?1:.22;
    camera.position.lerp(targetPos,alpha);
    camera.zoom=THREE.MathUtils.lerp(camera.zoom,.96,alpha);
    camera.updateProjectionMatrix();
    camera.lookAt(targetLook);
    if(!acAimHardFrameLogged){acAimHardFrameLogged=true;diag('AIM CAMERA HARD FRAME',\`shooter=${'${'}selected.weaponKey} enemyVisible=Y cutawayVisible=Y z=${'${'}targetPos.z.toFixed(1)}\`)}
    return;
  }
  acAimHardFrameLogged=false;`;

  const next = html.replace(needle, replacement);
  if (next === html) {
    return html.replace('</head>', '<meta name="ac-aim-camera-hard-fix" content="MISS:updateBattleCamera">\n</head>');
  }

  return next
    .replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.75')
    .replace(/build=2026-09-(01|04)_[A-Z0-9_]+/g, 'build=2026-09-04_AIM_CAMERA_ENEMY_ALWAYS_VISIBLE')
    .replace('</head>', '<meta name="ac-aim-camera-hard-fix" content="OK:authoritative-two-vessel-aim-frame">\n</head>');
}
