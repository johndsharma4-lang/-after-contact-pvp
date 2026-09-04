export function patchAurelianRouteCompatRuntime(html) {
  let patched = html;

  if (!patched.includes('function spawnSunDisk(') || !patched.includes('function spawnSunadier(')) {
    return patched;
  }

  const routeMarker = "if(weapon.kind==='solar_disk'){spawnSunDisk(w,start,pt,weapon)}else if(weapon.kind==='sunadier'){spawnSunadier(w,start,pt,power,weapon)}else if(weapon.kind==='laser'){";

  if (!patched.includes("if(weapon.kind==='solar_disk'){spawnSunDisk(w,start,pt,weapon)}")) {
    patched = patched.replace(
      "if(weapon.kind==='laser'){",
      routeMarker
    );
  }

  patched = patched.replace(
    '</head>',
    '<meta name="ac-aurelian-route-compat" content="solar-disk-sunadier-dispatch-hardened">\n</head>'
  );

  return patched;
}
