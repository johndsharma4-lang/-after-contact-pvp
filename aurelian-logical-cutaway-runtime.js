export function patchAurelianLogicalCutawayRuntime(html){
  if(html.includes('ac-aurelian-logical-cutaway-v0408'))return html;
  const helper=String.raw`
function acSeparateAurelianLogicalCutaway(){
  if(!xrayOpen||localXraySide()!=='aurelian'||!xrayGroup)return;
  const warriorKeep=new Set();
  for(const v of xrayRoomVisuals||[]){let o=v?.rig3D;while(o&&o!==xrayGroup){warriorKeep.add(o);o=o.parent}}
  let hidden=0;
  xrayGroup.traverse(o=>{
    if(!o||o===xrayGroup||warriorKeep.has(o))return;
    const n=String(o.name||'').toLowerCase();
    const logical=n.includes('hitplane')||n.includes('standanchor')||o.userData?.hitPlane||o.userData?.acLogicalRoom;
    if(logical){if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(m){m.transparent=true;m.opacity=0;m.depthWrite=false}}}return}
    if(o.isMesh&&o.geometry){o.visible=false;o.userData.acLogicalCutawayHidden=true;hidden++}
  });
  for(const v of xrayRoomVisuals||[]){if(v?.rig3D){v.rig3D.visible=true;v.rig3D.traverse?.(o=>{if(o.userData?.acLogicalCutawayHidden){delete o.userData.acLogicalCutawayHidden;o.visible=true}})}}
  diag('AURELIAN CUTAWAY PRESENTATION','logicalRooms=Y oldCageHidden='+hidden+' warriorRigs=VISIBLE');
}
`;
  let patched=html;
  const insertion='function refreshPrivateXrayVisuals(){';
  if(!patched.includes('function acSeparateAurelianLogicalCutaway()'))patched=patched.replace(insertion,helper+'\n'+insertion);
  const needle='applyXrayShell();buildPrivateXray();acCleanAurelianInterior();for(const w of localXrayWarriors())';
  const replacement='applyXrayShell();buildPrivateXray();acCleanAurelianInterior();acSeparateAurelianLogicalCutaway();for(const w of localXrayWarriors())';
  const next=patched.replace(needle,replacement),ok=next!==patched;patched=next;
  return patched.replace('</head>','<meta id="ac-aurelian-logical-cutaway-v0408" name="ac-aurelian-logical-cutaway" content="route:'+(ok?'OK':'MISS')+' combatGeometry:PRESERVED visibleLegacyCage:HIDDEN warriorRigs:VISIBLE">\n</head>');
}
