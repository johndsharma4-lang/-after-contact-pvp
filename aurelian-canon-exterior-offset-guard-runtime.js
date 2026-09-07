export function patchAurelianCanonExteriorOffsetGuardRuntime(html){
  if(html.includes('ac-aurelian-canon-exterior-offset-guard-v0423'))return html;
  let patched=html;
  const needle="  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='AURELIAN_SIX_BAY_SOLAR_WARSHIP';structure.userData.acHullRadii=new THREE.Vector3(24.2,12.2,9.2);";
  const replacement="  if(cy){const offsetNames=/^AURELIAN_CANON_(?:PROW(?:_|$)|STERN_ARMOR$|DORSAL_|COCKPIT_BROW$|VENTRAL_KEEL$|CANNON_JAW_)/;for(const o of kit.children){if(offsetNames.test(String(o.name||'')))o.position.y+=cy}}\n  structure.userData.acCanonExterior=true;structure.userData.acCanonReference='AURELIAN_SIX_BAY_SOLAR_WARSHIP';structure.userData.acHullRadii=new THREE.Vector3(24.2,12.2,9.2);";
  const next=patched.replace(needle,replacement),guard=next!==patched;patched=next;
  patched=patched.replace(/MATCH RECORDER v0\.42\.2/g,'MATCH RECORDER v0.42.3');
  patched=patched.replace(/build=2026-09-07_AURELIAN_CANON_EXTERIOR_PASS/g,'build=2026-09-07_AURELIAN_CANON_EXTERIOR_OFFSET_GUARD');
  return patched.replace('</head>','<meta id="ac-aurelian-canon-exterior-offset-guard-v0423" name="ac-aurelian-canon-exterior-offset-guard" content="guard:'+(guard?'OK':'MISS')+' oppositeSideOffset:SAFE gameplay:UNCHANGED">\n</head>');
}
