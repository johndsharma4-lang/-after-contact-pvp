export function patchSolarLancerRuntime(html) {
  let patched = html;

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.30');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_SOLAR_LANCER_BEAM_RESTORED');

  // Sustained penetrating specialist: meaningful burn damage without returning to the old instant 48/42 spike.
  patched = patched.replace(
    "solar_lancer:{name:'SOLAR LANCER',kind:'laser',aim:'straight',damage:48,armorDamage:42,penetration:.72,exposureScale:.32,color:0xffd65a,maxCompartments:3,description:'Projected precision crosshair • instant solar lance • penetrates up to three compartments'}",
    "solar_lancer:{name:'SOLAR LANCER',kind:'laser',aim:'straight',damage:10,armorDamage:8,penetration:.72,exposureScale:.30,color:0xffd65a,duration:5,tickInterval:.5,maxCompartments:3,description:'Projected precision aim • sustained penetrating solar laser • burns visibly through up to three compartments'}"
  );

  patched = patched.replace(
    /if\(wp\.kind==='laser'\)\{[\s\S]*?\n    \}else\{\n      const sniperProjected=/,
    "if(wp.kind==='laser'){\n      const guideLen=Math.max(430,Math.min(690,dist*2.9)),ratio=dist>0?guideLen/dist:0,gx=a.x+dx*ratio,gy=a.y+dy*ratio;\n      aimPath.setAttribute('d',`M ${a.x} ${a.y} L ${gx} ${gy}`);aimPath.style.stroke='#ffd65a';aimPath.style.strokeWidth='3';aimPath.style.strokeDasharray='10 8';aimPath.style.filter='drop-shadow(0 0 2px #241400) drop-shadow(0 0 7px #ffcf55)';aimPath.style.opacity='.82';aimDot.style.opacity='0';muzzleDot.style.opacity='0';\n      if(sniperCrosshair){sniperCrosshair.setAttribute('transform',`translate(${gx} ${gy})`);sniperCrosshair.setAttribute('opacity','1')}\n    }else{\n      const sniperProjected="
  );

  patched = patched.replace(
    "selected?.weaponKey==='sniper'&&aimOriginStage",
    "(selected?.weaponKey==='sniper'||selected?.weaponKey==='solar_lancer')&&aimOriginStage"
  );

  patched = patched.replace(/function spawnSolarLancerPrecisionShot\([\s\S]*?(?=\nfunction spawnSolarLancerBeam)/, '');
  patched = patched.replace(/function spawnSolarLancerBeam\(attacker,start,beamPath,weapon\)\{return spawnSolarLancerPrecisionShot\(attacker,start,beamPath,weapon\)\}/g, '');
  patched = patched.replace(/spawnSolarLancerPrecisionShot\(w,start,beamPath,weapon\)/g, 'spawnSolarLancerBeam(w,start,beamPath,weapon)');

  patched = patched.replace('</head>', '<meta name="ac-solar-lancer-runtime" content="projected-aim sustained-penetration damage-10 armor-8 penetration-72">\n</head>');
  return patched;
}
