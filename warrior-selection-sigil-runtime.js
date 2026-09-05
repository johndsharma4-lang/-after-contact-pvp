export function patchWarriorSelectionSigilRuntime(html){
 if(html.includes('ac-warrior-selection-sigil-v0368'))return html;
 let patched=html;
 const helper=String.raw`
let acSelectionSigil=null;
function acClearSelectionSigil(){if(acSelectionSigil?.parent)acSelectionSigil.parent.remove(acSelectionSigil);acSelectionSigil=null}
function acFactionSigilStyle(w){const f=typeof factionForSide==='function'?factionForSide(w?.side):null;if(f==='aurelian')return{color:0xffc64a,kind:'sun'};if(f==='lizard')return{color:0x62ff8b,kind:'claw'};if(f==='gray'||f==='grays')return{color:0xb779ff,kind:'psi'};return{color:0x63cfff,kind:'earth'}}
function acBuildSelectionSigil(w,rig){
 acClearSelectionSigil();if(!w||!rig)return;
 const style=acFactionSigilStyle(w),g=new THREE.Group();g.name='AC_SELECTED_FACTION_SIGIL';g.userData.acSelectionSigil=true;
 const mat=new THREE.MeshBasicMaterial({color:style.color,transparent:true,opacity:.94,depthWrite:false,depthTest:false,side:THREE.DoubleSide});
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.27,.035,8,24),mat);ring.rotation.x=Math.PI/2;g.add(ring);
 if(style.kind==='sun'){for(let i=0;i<8;i++){const ray=new THREE.Mesh(new THREE.ConeGeometry(.045,.22,4),mat),a=i*Math.PI/4;ray.rotation.z=-a;ray.position.set(Math.cos(a)*.39,Math.sin(a)*.39,0);g.add(ray)}}
 else if(style.kind==='earth'){for(let i=0;i<4;i++){const bar=new THREE.Mesh(new THREE.BoxGeometry(.10,.24,.035),mat),a=i*Math.PI/2;bar.rotation.z=a;bar.position.set(Math.cos(a)*.32,Math.sin(a)*.32,0);g.add(bar)}}
 else if(style.kind==='claw'){for(let i=-1;i<=1;i++){const tooth=new THREE.Mesh(new THREE.ConeGeometry(.055,.30,5),mat);tooth.rotation.z=Math.PI;tooth.position.set(i*.16,.02-Math.abs(i)*.05,0);g.add(tooth)}}
 else{const inner=new THREE.Mesh(new THREE.TorusGeometry(.12,.025,7,18),mat);inner.rotation.x=Math.PI/2;g.add(inner);for(let i=0;i<3;i++){const node=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),mat);const a=i*Math.PI*2/3;node.position.set(Math.cos(a)*.34,Math.sin(a)*.34,0);g.add(node)}}
 g.position.set(0,2.55,.72);g.scale.setScalar(.01);g.renderOrder=999;rig.add(g);acSelectionSigil=g;
 const born=performance.now();(function animate(now){if(!g.parent||acSelectionSigil!==g)return;const t=Math.min(1,(now-born)/240),e=1-Math.pow(1-t,3),pulse=1+Math.sin(now*.006)*.045;g.scale.setScalar(e*pulse);g.rotation.z+=.008;requestAnimationFrame(animate)})(born)
}
function acRefreshSelectionSigil(w){const visual=xrayRoomVisuals?.find?.(v=>v.warrior===w),rig=visual?.rig3D;if(rig)acBuildSelectionSigil(w,rig)}
`;
 if(!patched.includes('let acSelectionSigil='))patched=patched.replace('let acTacticalCutaway=',helper+'\nlet acTacticalCutaway=');
 patched=patched.replace("xraySelectedCrew=w;xrayConfirmedShooter=w;restoreFullCutawayStage();selectWarrior(w);setCutawayFiringStage(w);refreshPrivateXrayVisuals();","xraySelectedCrew=w;xrayConfirmedShooter=w;restoreFullCutawayStage();selectWarrior(w);setCutawayFiringStage(w);refreshPrivateXrayVisuals();acRefreshSelectionSigil(w);");
 patched=patched.replace("function acTacticalCutawayClose(){acTacticalCutaway.mode='closed';acTacticalCutaway.aimProgress=0}","function acTacticalCutawayClose(){acTacticalCutaway.mode='closed';acTacticalCutaway.aimProgress=0;acClearSelectionSigil()}");
 return patched.replace('</head>','<meta id="ac-warrior-selection-sigil-v0368" name="ac-warrior-selection-sigil" content="FACTION_3D_SIGIL">\n</head>')
}
