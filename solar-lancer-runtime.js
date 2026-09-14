export function patchSolarLancerRuntime(html) {
  let patched = html;

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.31');
  patched = patched.replace(/build=2026-08-28_[A-Z0-9_]+/g, 'build=2026-08-28_SOLAR_LANCER_STAGED_PENETRATION');

  // Weapon damage, timing, penetration and visible aim are owned by index.html. This compatibility
  // runtime only lets the existing precision-release path recognize Solar Lancer; it must never
  // rewrite the lance back into the retired five-second sustained beam or replace its preview.

  patched = patched.replace(
    "selected?.weaponKey==='sniper'&&aimOriginStage",
    "(selected?.weaponKey==='sniper'||selected?.weaponKey==='solar_lancer')&&aimOriginStage"
  );

  patched = patched.replace('</head>', '<meta name="ac-solar-lancer-runtime" content="projected-aim immediate-staged-penetration damage-48 armor-72 stage-580ms">\n</head>');
  return patched;
}
