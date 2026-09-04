export function patchAimCameraHardFixRuntime(html) {
  if (html.includes('ac-aim-camera-hard-fix')) return html;

  const needle = `function updateBattleCamera(snap=false,frameDt=null){
  if(!battleStarted||typeof camera==='undefined')return;`;

  const replacement = `let acAimHardFrameLogged=false;
function updateBattleCamera(snap=false,frameDt=null){
  if(!battleStarted||typeof camera==='undefined')return;
  const acPresentationAiming=typeof acPresentation!=='undefined'&&acPresentation?.phase==='aim';
  const acAimHardActive=!!(xrayOpen&&selected&&(aiming||acPresentationAiming));
  if(acAimHardActive){
    const shooterVisual=(typeof xrayRoomVisuals!=='undefined'&&xrayRoomVisuals?.find)?xrayRoomVisuals.find(v=>v.warrior===selected):null;
    const shooter=shooterVisual?.rig3D?.getWorldPosition?.(new THREE.Vector3())||warriorWorld(selected);
    const enemyRoot=selected.side==='aurelian'?earth:aure;
    const enemy=enemyRoot.getWorldPosition(new THREE.Vector3());
    const center=shooter.clone().lerp(enemy,.56);

    // Read the live aim cursor so the camera responds to the player's drag instead of freezing
    // at one static two-vessel composition. The motion is deliberately small so the enemy stays visible.
    let aimX=640,aimY=360;
    if(typeof aimDot!=='undefined'&&aimDot){
      const cx=Number(aimDot.getAttribute('cx')),cy=Number(aimDot.getAttribute('cy'));
      if(Number.isFinite(cx))aimX=cx;if(Number.isFinite(cy))aimY=cy;
    }
    const nx=Math.max(-1,Math.min(1,(aimX-640)/640)),ny=Math.max(-1,Math.min(1,(aimY-360)/360));
    const panX=nx*11,panY=-ny*6.5;

    const span=Math.max(82,Math.abs(enemy.x-shooter.x)+54);
    const vHalf=THREE.MathUtils.degToRad(camera.fov*.5),hHalf=Math.atan(Math.tan(vHalf)*camera.aspect),zNeed=(span*.5)/Math.max(.16,Math.tan(hHalf));
    const edgePressure=Math.max(Math.abs(nx),Math.abs(ny));
    const targetPos=new THREE.Vector3(center.x+panX,Math.max(shooter.y,enemy.y)+8+panY*.22,Math.max(116,zNeed+34+edgePressure*8));
    const targetLook=new THREE.Vector3(center.x+panX*.72,(shooter.y+enemy.y)*.5+1.2+panY*.42,2);
    const alpha=snap?1:.15;

    camera.position.lerp(targetPos,alpha);
    camera.zoom=THREE.MathUtils.lerp(camera.zoom,.92,alpha);
    camera.updateProjectionMatrix();
    camera.lookAt(targetLook);

    if(!acAimHardFrameLogged){
      acAimHardFrameLogged=true;
      diag('AIM CAMERA LIVE FRAME',\`shooter=${'${'}selected.weaponKey} enemyVisible=Y responsive=Y z=${'${'}targetPos.z.toFixed(1)}\`)
    }
    return;
  }
  acAimHardFrameLogged=false;`;

  const next = html.replace(needle, replacement);
  if (next === html) {
    return html.replace('</head>', '<meta name="ac-aim-camera-hard-fix" content="MISS:updateBattleCamera">\n</head>');
  }

  return next
    .replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.76')
    .replace(/build=2026-09-(01|04)_[A-Z0-9_]+/g, 'build=2026-09-04_RESPONSIVE_AIM_CAMERA_ENEMY_VISIBLE')
    .replace('</head>', '<meta name="ac-aim-camera-hard-fix" content="OK:responsive-two-vessel-aim-frame">\n</head>');
}
