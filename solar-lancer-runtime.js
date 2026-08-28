export function patchSolarLancerRuntime(html) {
  let patched = html;

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.25');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_SOLAR_LANCER_PRECISION_AIM');

  patched = patched.replace(
    "solar_lancer:{name:'SOLAR LANCER',kind:'laser',aim:'straight',damage:6,armorDamage:4,penetration:.62,exposureScale:.22,color:0xffd65a,duration:5,tickInterval:.5,maxCompartments:3,description:'5s focused coherent laser • surgical three-compartment burn • exposes survivors'}",
    "solar_lancer:{name:'SOLAR LANCER',kind:'laser',aim:'straight',damage:48,armorDamage:42,penetration:.72,exposureScale:.32,color:0xffd65a,maxCompartments:3,description:'Projected precision crosshair • instant solar lance • penetrates up to three compartments'}"
  );

  // Remove the old special laser aiming presentation. Solar Lancer now uses the same projected
  // downrange crosshair control model as the Sniper, while retaining a gold solar visual identity.
  patched = patched.replace(
    /if\(wp\.kind==='laser'\)\{[\s\S]*?\n    \}else\{\n      const sniperProjected=/,
    "if(wp.kind==='laser'){\n      const precisionProjected=true,guideLen=Math.max(430,Math.min(690,dist*2.9)),ratio=dist>0?guideLen/dist:0,gx=a.x+dx*ratio,gy=a.y+dy*ratio;\n      aimPath.setAttribute('d',`M ${a.x} ${a.y} L ${gx} ${gy}`);aimPath.style.stroke='#ffd65a';aimPath.style.strokeWidth='3';aimPath.style.strokeDasharray='10 8';aimPath.style.filter='drop-shadow(0 0 2px #241400) drop-shadow(0 0 7px #ffcf55)';aimPath.style.opacity='.80';aimDot.style.opacity='0';muzzleDot.style.opacity='0';\n      if(sniperCrosshair){sniperCrosshair.setAttribute('transform',`translate(${gx} ${gy})`);sniperCrosshair.setAttribute('opacity','1');sniperCrosshair.style.color='#ffd65a'}\n    }else{\n      const sniperProjected="
  );

  // Use the projected crosshair position as the actual release point for both Sniper and Solar Lancer.
  patched = patched.replace(
    "selected?.weaponKey==='sniper'&&aimOriginStage",
    "(selected?.weaponKey==='sniper'||selected?.weaponKey==='solar_lancer')&&aimOriginStage"
  );

  const precisionShot = `function spawnSolarLancerPrecisionShot(attacker,start,beamPath,weapon){
  const localAction=(!multiplayer&&attacker.side==='aurelian')||(multiplayer&&attacker.side===localSide);solarActionLock=true;diag('ACTION LOCK',\`${'${'}localAction?'LOCAL':'REMOTE'} SOLAR_LANCER_PRECISION\`);refreshMovePad();
  const path=(beamPath?.path||[]).slice(0,weapon.maxCompartments||3),end=(path[path.length-1]?.end||beamPath?.end||start.clone().add(new THREE.Vector3(attacker.side==='aurelian'?40:-40,0,0))).clone();
  const outerMat=new THREE.LineBasicMaterial({color:0xffb52e,transparent:true,opacity:.62,depthWrite:false,blending:THREE.AdditiveBlending}),coreMat=new THREE.LineBasicMaterial({color:0xfff7cf,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending});
  const geom=new THREE.BufferGeometry().setFromPoints([start,end]),outer=new THREE.Line(geom.clone(),outerMat),core=new THREE.Line(geom.clone(),coreMat);outer.material.linewidth=5;scene.add(outer,core);spawnImpactBurst(start,0xffe9a3);
  let totalDamage=0,totalArmor=0;
  path.forEach((hit,i)=>{const scale=Math.max(.48,1-i*.22),tuned={...weapon,name:'SOLAR LANCE',damage:Math.round(weapon.damage*scale),armorDamage:Math.round(weapon.armorDamage*scale),impactStrength:1.28-i*.12};spawnImpactBurst(hit.end,i===0?0xffffff:0xffcf55);spawnDebris(hit.end,0xffb43d,Math.max(12,24-i*5),.12,.42);resolveHit(attacker,hit,tuned);totalDamage+=tuned.damage;totalArmor+=tuned.armorDamage});
  if(!path.length){spawnImpactBurst(end,0xffcf55);resolveHit(attacker,null,weapon)}
  kickCamera(.24,.16);statusEl.textContent=path.length?\`SOLAR LANCER • PRECISION HIT • ${'${'}path.length} COMPARTMENT${'${'}path.length===1?'':'S'}\`:'SOLAR LANCER • MISS';diag('SOLAR PRECISION SHOT',\`rooms=${'${'}path.map(h=>h.roomIndex+1).join('>')||'-'} damage=${'${'}totalDamage} armor=${'${'}totalArmor}\`);
  effects.push({objects:[outer,core],life:.18,max:.18});
  setTimeout(()=>{solarActionLock=false;refreshMovePad();if(localAction&&!multiplayer&&battleStarted&&!matchEnded&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()},190);
}`;

  if (!patched.includes('function spawnSolarLancerPrecisionShot(')) {
    patched = patched.replace('function spawnSolarLancerBeam(attacker,start,beamPath,weapon){', precisionShot + '\nfunction spawnSolarLancerBeam(attacker,start,beamPath,weapon){');
  }

  // Replace the old five-second beam implementation in the served game. Keep only a compatibility
  // wrapper so no stale caller can reactivate the retired burn-beam code path.
  patched = patched.replace(
    /function spawnSolarLancerBeam\(attacker,start,beamPath,weapon\)\{[\s\S]*?(?=\nfunction [A-Za-z_])/,
    "function spawnSolarLancerBeam(attacker,start,beamPath,weapon){return spawnSolarLancerPrecisionShot(attacker,start,beamPath,weapon)}"
  );

  patched = patched.replace(
    "spawnSolarLancerBeam(w,start,beamPath,weapon)",
    "spawnSolarLancerPrecisionShot(w,start,beamPath,weapon)"
  );

  patched = patched.replace('</head>', '<meta name="ac-solar-lancer-runtime" content="sniper-style-projected-aim instant-precision-lance old-beam-retired">\n</head>');
  return patched;
}
