export function patchAurelianLogicalCutawayRuntime(html){
  if(html.includes('ac-aurelian-logical-cutaway-v0454'))return html;
  const helper=String.raw`
function acSeparateAurelianLogicalCutaway(){
  if(!xrayOpen||localXraySide()!=='aurelian'||!xrayGroup)return;
  const nativeKeep=new Set();
  for(const v of xrayRoomVisuals||[]){
    if(v?.nativeRoom){v.nativeRoom.userData.acVisibleInterior=true;v.nativeRoom.traverse?.(o=>nativeKeep.add(o))}
    if(v?.rig3D)v.rig3D.traverse?.(o=>nativeKeep.add(o));
    if(v?.standAnchor)v.standAnchor.traverse?.(o=>nativeKeep.add(o));
  }
  let hiddenLegacy=0,visibleInterior=0,logicalHidden=0,nativeRoomsVisible=0,cutawayOccludersHidden=0;
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

  // v0.45.4: fixed canon geometry is now aperture-clear structural framing. Keep
  // that frame and the exhaust bank visible so the rooms still read as one ship.
  // Only geometry explicitly tagged as an occluder may retract here; door panels
  // remain owned by setCutawayBayOpen and combat/selection geometry is untouched.
  const vesselRoot=(typeof localVessel==='function'?localVessel():null)||xrayGroup.parent;
  if(vesselRoot?.traverse)vesselRoot.traverse(o=>{
    if(!o||nativeKeep.has(o))return;
    if(o.userData?.acCutawayOccluder===true&&o.visible!==false){o.visible=false;o.userData.acCutawayShellHidden=true;cutawayOccludersHidden++}
  });

  for(const v of xrayRoomVisuals||[]){
    if(v?.nativeRoom){v.nativeRoom.visible=true;nativeRoomsVisible++}
    if(v?.rig3D){v.rig3D.visible=true;v.rig3D.traverse?.(o=>{if(o.isMesh)o.visible=true})}
    if(v?.frontShutter)v.frontShutter.visible=!!v.frontShutter.userData?.acAimClosed;
  }
  const closedBays=(xrayRoomVisuals||[]).filter(v=>v?.nativeRoom?.userData?.acAimClosedBay).length,signature=visibleInterior+'|'+hiddenLegacy+'|'+logicalHidden+'|'+nativeRoomsVisible+'|'+closedBays+'|'+cutawayOccludersHidden;
  if(acSeparateAurelianLogicalCutaway._last!==signature){acSeparateAurelianLogicalCutaway._last=signature;diag('AURELIAN CUTAWAY PRESENTATION','nativeInterior=VISIBLE physicalBays='+nativeRoomsVisible+'/6 shapedRoleInteriors=6 logicalRooms=9 interiorMeshes='+visibleInterior+' fixedFrame=VISIBLE exhaustBank=VISIBLE cutawayOccludersHidden='+cutawayOccludersHidden+' closedBayInteriorsHidden='+closedBays+' legacyHidden='+hiddenLegacy+' logicalHitMeshes='+logicalHidden+' warriorRigs=VISIBLE_SELECTABLE')}
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
  return patched.replace('</head>','<meta id="ac-aurelian-logical-cutaway-v0454" name="ac-aurelian-logical-cutaway" content="openRoute:'+(openRoute?'OK':'MISS')+' refreshGuard:'+(refreshGuard?'OK':'MISS')+' fixedFrameDuringCutaway:VISIBLE apertureOcclusion:NONE exhaustBank:VISIBLE warriorRigs:VISIBLE_SELECTABLE combatGeometry:PRESERVED">\n</head>');
}
