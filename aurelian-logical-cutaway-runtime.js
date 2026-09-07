export function patchAurelianLogicalCutawayRuntime(html){
  if(html.includes('ac-aurelian-logical-cutaway-v0414'))return html;
  const helper=String.raw`
function acSeparateAurelianLogicalCutaway(){
  if(!xrayOpen||localXraySide()!=='aurelian'||!xrayGroup)return;
  const nativeKeep=new Set();
  for(const v of xrayRoomVisuals||[]){
    if(v?.nativeRoom){v.nativeRoom.userData.acVisibleInterior=true;v.nativeRoom.traverse?.(o=>nativeKeep.add(o))}
    if(v?.rig3D)v.rig3D.traverse?.(o=>nativeKeep.add(o));
    if(v?.standAnchor)v.standAnchor.traverse?.(o=>nativeKeep.add(o));
  }
  let hiddenLegacy=0,visibleInterior=0,logicalHidden=0,roomRimsHidden=0,nativeRoomsVisible=0;
  xrayGroup.traverse(o=>{
    if(!o||o===xrayGroup)return;
    const n=String(o.name||'').toLowerCase();
    const logical=n.includes('hitplane')||n.includes('standanchor')||o.userData?.hitPlane||o.userData?.acLogicalRoom;
    if(logical&&o.isMesh&&o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(m){m.transparent=true;m.opacity=0;m.depthWrite=false}}logicalHidden++;return}
    if(nativeKeep.has(o)){
      if(o.isMesh){visibleInterior++;if(!n.includes('front_shutter'))o.visible=true}
      return;
    }
    if((o.isMesh||o.isLineSegments)&&o.geometry){o.visible=false;o.userData.acLegacyCutawayVisual=true;hiddenLegacy++}
  });
  for(const v of xrayRoomVisuals||[]){
    if(v?.nativeRoom){v.nativeRoom.visible=true;nativeRoomsVisible++}
    // The giant tic-tac-toe silhouette came from the EdgesGeometry rim wrapped around
    // every native room. It is presentation-only; floors, back panels, ceilings, side
    // walls, trim, lights and warrior stages remain visible.
    if(v?.rim){v.rim.visible=false;v.rim.userData.acRoomCageRimHidden=true;roomRimsHidden++}
    if(v?.rig3D){v.rig3D.visible=true;v.rig3D.traverse?.(o=>{if(o.isMesh)o.visible=true})}
    if(v?.frontShutter)v.frontShutter.visible=!!v.frontShutter.userData?.acAimClosed;
  }
  const signature=visibleInterior+'|'+hiddenLegacy+'|'+logicalHidden+'|'+roomRimsHidden+'|'+nativeRoomsVisible;
  if(acSeparateAurelianLogicalCutaway._last!==signature){acSeparateAurelianLogicalCutaway._last=signature;diag('AURELIAN CUTAWAY PRESENTATION','nativeInterior=VISIBLE nativeRooms='+nativeRoomsVisible+'/9 interiorMeshes='+visibleInterior+' legacyHidden='+hiddenLegacy+' roomCageRimsHidden='+roomRimsHidden+' logicalHitMeshes='+logicalHidden+' warriorRigs=VISIBLE')}
}
`;
  let patched=html;
  const insertion='function refreshPrivateXrayVisuals(){';
  if(!patched.includes('function acSeparateAurelianLogicalCutaway()'))patched=patched.replace(insertion,helper+'\n'+insertion);
  const needle='applyXrayShell();buildPrivateXray();acCleanAurelianInterior();for(const w of localXrayWarriors())';
  const replacement='applyXrayShell();buildPrivateXray();acCleanAurelianInterior();acSeparateAurelianLogicalCutaway();for(const w of localXrayWarriors())';
  const next=patched.replace(needle,replacement),openRoute=next!==patched;patched=next;
  const refreshNeedle='function refreshPrivateXrayVisuals(){\n  if(!xrayOpen||!xrayGroup)return;';
  const refreshReplacement='function refreshPrivateXrayVisuals(){\n  if(!xrayOpen||!xrayGroup)return;\n  if(localXraySide()===\'aurelian\'&&typeof acSeparateAurelianLogicalCutaway===\'function\')queueMicrotask(()=>{if(xrayOpen&&xrayGroup)acSeparateAurelianLogicalCutaway()});';
  const refreshed=patched.replace(refreshNeedle,refreshReplacement),refreshGuard=refreshed!==patched;patched=refreshed;
  return patched.replace('</head>','<meta id="ac-aurelian-logical-cutaway-v0414" name="ac-aurelian-logical-cutaway" content="openRoute:'+(openRoute?'OK':'MISS')+' refreshGuard:'+(refreshGuard?'OK':'MISS')+' nativeInterior:ALL_9_VISIBLE roomCageRims:HIDDEN aimPanels:CONTINUOUS_CURVED_HULL_SECTORS combatGeometry:PRESERVED warriorRigs:VISIBLE">\n</head>');
}
