export function patchAurelianInteriorCleanupRuntime(html){
 if(html.includes('ac-aurelian-interior-cleanup-v0370'))return html;
 const helper=String.raw`
function acCleanAurelianInterior(){
 if(!xrayOpen||localXraySide()!=='aurelian'||!xrayGroup)return;
 const keep=new Set();
 for(const v of xrayRoomVisuals||[]){let o=v?.rig3D;while(o&&o!==xrayGroup){keep.add(o);o=o.parent}}
 xrayGroup.traverse(o=>{
   if(!o||o===xrayGroup||keep.has(o)||o.userData?.acSelectionSigil)return;
   const n=String(o.name||'').toLowerCase();
   if(n.includes('warrior')||n.includes('muzzle')||n.includes('standanchor')||n.includes('hitplane'))return;
   if(n.includes('lamp')||n.includes('sunlamp')||n.includes('ceiling')||n.includes('beam')||n.includes('brace')||n.includes('rafter')){o.visible=false;return}
   if(o.isMesh&&o.geometry){
     if(!o.geometry.boundingBox)o.geometry.computeBoundingBox?.();const b=o.geometry.boundingBox;
     if(b){const sx=(b.max.x-b.min.x)*Math.abs(o.scale.x||1),sy=(b.max.y-b.min.y)*Math.abs(o.scale.y||1);if((sx>.9&&sy<.24)||(sy>.9&&sx<.24)){o.material?.transparent!==undefined&&(o.material.transparent=true);if(o.material?.opacity!==undefined)o.material.opacity=Math.min(o.material.opacity,.32)}}
   }
 });
 for(const v of xrayRoomVisuals||[]){const cell=v?.rig3D?.parent;if(cell?.userData)cell.userData.acCleanStage=true}
}
`;
 let patched=html;
 if(!patched.includes('function acCleanAurelianInterior()'))patched=patched.replace('let acTacticalCutaway=',helper+'\nlet acTacticalCutaway=');
 patched=patched.replace('applyXrayShell();buildPrivateXray();for(const w of localXrayWarriors())','applyXrayShell();buildPrivateXray();acCleanAurelianInterior();for(const w of localXrayWarriors())');
 return patched.replace('</head>','<meta id="ac-aurelian-interior-cleanup-v0370" name="ac-aurelian-interior-cleanup" content="CLEAR_WARRIOR_STAGES">\n</head>')
}
