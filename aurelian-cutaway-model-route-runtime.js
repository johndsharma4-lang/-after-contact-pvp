export function patchAurelianCutawayModelRouteRuntime(html){
  if(html.includes('ac-aurelian-cutaway-model-route-v0363'))return html;
  const needle="function buildCutawayOnlyWarrior3D(type){\n  if(type==='bombardier')return buildEarthBombardierBattle3D();";
  const replacement="function buildCutawayOnlyWarrior3D(type){\n  if(type==='solar_lancer')return acBuildSolarLancerRebuilt();\n  if(type==='sun_disk_gunner')return acBuildSunDiskGunnerRebuilt();\n  if(type==='sunadier')return acBuildSunadierRebuilt();\n  if(type==='bombardier')return buildEarthBombardierBattle3D();";
  let patched=html.replace(needle,replacement);
  const routed=patched!==html;
  patched=patched.replace(/MATCH RECORDER v0\.3[56]\.[0-9]+/g,'MATCH RECORDER v0.36.3');
  patched=patched.replace(/build=2026-09-04_[A-Z0-9_]+/g,'build=2026-09-04_AURELIAN_LIVE_CUTAWAY_ROUTE');
  return patched.replace('</head>',`<meta id="ac-aurelian-cutaway-model-route-v0363" name="ac-aurelian-cutaway-model-route" content="liveFactory:${routed?'OK':'MISS'}">\n</head>`);
}
