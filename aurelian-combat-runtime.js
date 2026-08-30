export function patchAurelianCombatRuntime(html) {
  let patched = html;

  patched = patched.replace(
    "spatial_disintegrator:{name:'MATTER COLLAPSE',kind:'disintegrator',aim:'straight',damage:85,armorDamage:100,penetration:1,exposureScale:.90,color:0xb06cff,description:'Singularity Core • unstable multi-beam array • compartment erasure'}",
    "spatial_disintegrator:{name:'MATTER COLLAPSE',kind:'disintegrator',aim:'straight',damage:85,armorDamage:100,penetration:1,exposureScale:.90,color:0xb06cff,description:'Singularity Core • unstable multi-beam array • compartment erasure'},\n  sun_disk_gunner:{name:'SUN DISK GUNNER',kind:'solar_disk',aim:'straight',damage:28,armorDamage:30,penetration:.72,exposureScale:.32,color:0xffb11f,maxCompartments:3,description:'Large spinning solar disk • slices up to three compartments • leaves stacking solar fire'},\n  sunadier:{name:'SUNADIER',kind:'sunadier',aim:'arc',damage:38,armorDamage:34,splash:24,penetration:0,exposureScale:.30,color:0xff8a18,description:'Abyss-chain solar grenade • chain releases at apex • primary blast plus bouncing scatter fire'}"
  );

  const helpers = String.raw`
function beginAurelianWeaponAction(attacker,label){
 solarActionLock=true;refreshMovePad();statusEl.textContent=label+' • ATTACK IN PROGRESS';diag('ACTION LOCK',(attacker.side===localWorldSide()?'LOCAL ':'REMOTE ')+label)
}
function finishAurelianWeaponAction(attacker,label){
 solarActionLock=false;refreshMovePad();diag('ACTION UNLOCK',(attacker.side===localWorldSide()?'LOCAL ':'REMOTE ')+label+' COMPLETE');
 if(!multiplayer&&battleStarted&&!matchEnded&&attacker.side==='aurelian'&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot()
}
function solarFireStack(attacker,room,index,stacks=1){
 if(!room||room.erased)return;room.solarFireStacks=Math.min(5,(room.solarFireStacks||0)+stacks);const s=room.solarFireStacks;room.solarFireSeq=(room.solarFireSeq||0)+1;const seq=room.solarFireSeq,p=room.hitPlane.getWorldPosition(new THREE.Vector3());
 for(let i=0;i<Math.min(12,5+s);i++){const f=glowSphere(.16+Math.random()*.22,i%2?0xff6f12:0xffd24a,7);f.material.transparent=true;f.material.opacity=.78;f.position.copy(p).add(new THREE.Vector3((Math.random()-.5)*2.4,(Math.random()-.5)*1.5,(Math.random()-.5)*1.0));scene.add(f);effects.push({objects:[f],life:1.5+Math.random()*.9,max:2.4})}
 [700,1400,2100].forEach((d,t)=>setTimeout(()=>{if(!battleStarted||matchEnded||room.solarFireSeq!==seq||room.erased)return;const ss=room.solarFireStacks||0,before=room.armor,burn=Math.min(before,1+ss*2);room.armor=Math.max(0,before-burn);room.breach=100-room.armor;damageRoomVisual(room);applyStructureDamage(attacker,before-room.armor,'SOLAR FIRE x'+ss);spawnImpactBurst(p,t%2?0xff7a18:0xffd65a);const occ=nearestWarriorInRoom(attacker,index,p);if(occ&&room.breach>=35)applyWarriorDamage(occ.w,Math.max(1,ss*2),'SOLAR FIRE',attacker);if(room.breach>=100)resolveVerticalCollapse(attacker,room,index);diag('SOLAR FIRE TICK','room='+(index+1)+' stacks='+ss+' armor='+(before-room.armor))},d))
}
function sunDiskRayHits(attacker,start,pt){
 const rooms=opposingRooms(attacker).userData.rooms,s=worldToStage(start),dx=pt.x-s.x,dy=pt.y-s.y,m=Math.hypot(dx,dy)||1,ux=dx/m,uy=dy/m,hits=[];
 for(let i=0;i<rooms.length;i++){const room=rooms[i];if(room.erased)continue;const r=objectScreenRect(room.hitPlane,0);let tmin=0,tmax=1800,ok=true;for(const axis of ['x','y']){const o=s[axis],d=axis==='x'?ux:uy,lo=axis==='x'?r.x1:r.y1,hi=axis==='x'?r.x2:r.y2;if(Math.abs(d)<1e-6){if(o<lo||o>hi){ok=false;break}}else{let a=(lo-o)/d,b=(hi-o)/d;if(a>b){const z=a;a=b;b=z}tmin=Math.max(tmin,a);tmax=Math.min(tmax,b);if(tmax<tmin){ok=false;break}}}if(ok&&tmin>=0)hits.push({t:tmin,room,roomIndex:i,end:room.hitPlane.getWorldPosition(new THREE.Vector3()),direct:true,warrior:opposing(attacker).find(w=>w.roomIndex===i&&w.hp>0)||null})}
 return hits.sort((a,b)=>a.t-b.t).slice(0,3)
}
function makeSunDiskVisual(start){
 const group=new THREE.Group(),bladeMat=new THREE.MeshBasicMaterial({color:0xffc229,transparent:true,opacity:.98,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),hotMat=new THREE.MeshBasicMaterial({color:0xffffdf,transparent:true,opacity:.98,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 const blade=new THREE.Mesh(new THREE.RingGeometry(.62,1.72,32),bladeMat),core=new THREE.Mesh(new THREE.CircleGeometry(.48,28),hotMat),rim=new THREE.Mesh(new THREE.TorusGeometry(1.74,.15,10,44),bladeMat);group.add(blade,core,rim);
 for(let i=0;i<16;i++){const tooth=new THREE.Mesh(new THREE.BoxGeometry(.48,.18,.12),bladeMat);const a=i*Math.PI*2/16;tooth.position.set(Math.cos(a)*1.92,Math.sin(a)*1.92,0);tooth.rotation.z=a;group.add(tooth)}
 group.position.copy(start);group.renderOrder=96;scene.add(group);
 const ghosts=[];for(let i=0;i<4;i++){const ghost=new THREE.Mesh(new THREE.RingGeometry(.70,1.62,28),new THREE.MeshBasicMaterial({color:0xff8a18,transparent:true,opacity:.18-i*.025,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));ghost.position.copy(start);ghost.renderOrder=94-i;scene.add(ghost);ghosts.push(ghost)}
 const trail=new THREE.Line(new THREE.BufferGeometry().setFromPoints([start,start]),new THREE.LineBasicMaterial({color:0xffc23d,transparent:true,opacity:.76,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(trail);return{group,ghosts,trail}
}
function spawnSunDisk(attacker,start,pt,weapon){
 beginAurelianWeaponAction(attacker,'SUN DISK CUTTER');const hits=sunDiskRayHits(attacker,start,pt),fallback=targetWorldFromStage(pt),end=(hits[hits.length-1]?.end||fallback).clone(),visual=makeSunDiskVisual(start),history=[start.clone(),start.clone(),start.clone(),start.clone()],t0=performance.now();statusEl.textContent='SUN DISK CUTTER • BLADE LAUNCHED';diag('SUN DISK FIRE','rooms='+(hits.map(h=>h.roomIndex+1).join('>')||'MISS'));
 (function fly(now){if(!visual.group.parent)return;const t=Math.min(1,(now-t0)/1080),ease=1-Math.pow(1-t,2.2),p=start.clone().lerp(end,ease);history.unshift(p.clone());history.length=5;visual.group.position.copy(p);visual.group.lookAt(camera.position);visual.group.rotation.z+=.48;visual.group.scale.setScalar(1+.12*Math.sin(t*28));visual.ghosts.forEach((g,i)=>{g.position.copy(history[i+1]||p);g.lookAt(camera.position);g.rotation.z-=t*(2+i*.35)});visual.trail.geometry.setFromPoints([start,p]);if(t<1){requestAnimationFrame(fly);return}scene.remove(visual.group,visual.trail,...visual.ghosts);if(!battleStarted||matchEnded){finishAurelianWeaponAction(attacker,'SUN DISK CUTTER');return}if(!hits.length){statusEl.textContent='SUN DISK CUTTER • MISS';flashDamage('MISS');setTimeout(()=>finishAurelianWeaponAction(attacker,'SUN DISK CUTTER'),420);return}hits.forEach((h,i)=>setTimeout(()=>{if(!battleStarted||matchEnded)return;spawnExplosionVisual(h.end,0xffa31d,1.35);spawnImpactBurst(h.end,0xffffc2);spawnDebris(h.end,0xff9b20,24,.16,.48);resolveHit(attacker,h,{...weapon,armorDamage:Math.round((weapon.armorDamage||30)*(1-i*.18)),damage:Math.round((weapon.damage||28)*(1-i*.15)),impactStrength:1.18});solarFireStack(attacker,h.room,h.roomIndex,1)},i*190));setTimeout(()=>finishAurelianWeaponAction(attacker,'SUN DISK CUTTER'),1150)})(t0)
}
function sunadierPrimaryHit(attacker,pt){const rooms=opposingRooms(attacker).userData.rooms;for(let i=0;i<rooms.length;i++){const r=objectScreenRect(rooms[i].hitPlane,10);if(pt.x>=r.x1&&pt.x<=r.x2&&pt.y>=r.y1&&pt.y<=r.y2)return{room:rooms[i],roomIndex:i,end:rooms[i].hitPlane.getWorldPosition(new THREE.Vector3()),direct:true,warrior:opposing(attacker).find(w=>w.roomIndex===i&&w.hp>0)||null}}return null}
function spawnSunadier(attacker,start,pt,power,weapon){
 beginAurelianWeaponAction(attacker,'SUNADIER ABYSS CHAIN');const hit=sunadierPrimaryHit(attacker,pt),target=(hit?.end||targetWorldFromStage(pt)).clone(),mid=start.clone().lerp(target,.5);mid.y+=14+Math.max(3,(power||50)*.11);const curve=new THREE.QuadraticBezierCurve3(start,mid,target),grenade=new THREE.Group(),core=glowSphere(.76,0xff9d20,18),halo=new THREE.Mesh(new THREE.SphereGeometry(1.04,18,12),new THREE.MeshBasicMaterial({color:0xffd36a,wireframe:true,transparent:true,opacity:.72,blending:THREE.AdditiveBlending,depthWrite:false}));grenade.add(core,halo);grenade.position.copy(start);scene.add(grenade);const beads=[];for(let i=0;i<16;i++){const b=glowSphere(.13,i%3===0?0xffffd0:0xff9a2b,7);b.material.transparent=true;b.material.opacity=.92;scene.add(b);beads.push(b)}const t0=performance.now();let released=false;statusEl.textContent='SUNADIER • ABYSS CHAIN ATTACHED';diag('SUNADIER LAUNCH','target='+(hit?hit.roomIndex+1:'MISS'));
 (function lob(now){if(!grenade.parent)return;const t=Math.min(1,(now-t0)/1280),p=curve.getPoint(t);grenade.position.copy(p);grenade.lookAt(camera.position);grenade.rotation.z+=.22;halo.scale.setScalar(1+.18*Math.sin(t*30));if(t<.58){beads.forEach((b,i)=>{const q=(i+1)/(beads.length+1),bp=start.clone().lerp(p,q);bp.y+=Math.sin(q*Math.PI*3+t*20)*.13;b.position.copy(bp);b.visible=true})}else if(t<.75){if(!released){released=true;diag('ABYSS CHAIN RELEASE','apex • chain snapping home');statusEl.textContent='SUNADIER • CHAIN RELEASED AT APEX'}const snap=1-(t-.58)/.17;beads.forEach((b,i)=>{b.position.copy(start.clone().lerp(p,snap*(i+1)/(beads.length+1)));b.visible=true})}else beads.forEach(b=>b.visible=false);if(t<1){requestAnimationFrame(lob);return}scene.remove(grenade,...beads);if(!battleStarted||matchEnded){finishAurelianWeaponAction(attacker,'SUNADIER ABYSS CHAIN');return}if(!hit){spawnExplosionVisual(target,0xff8a18,1.2);statusEl.textContent='SUNADIER • MISS';flashDamage('MISS');setTimeout(()=>finishAurelianWeaponAction(attacker,'SUNADIER ABYSS CHAIN'),520);return}spawnExplosionVisual(hit.end,0xff8a18,3.1);spawnExplosionVisual(hit.end.clone().add(new THREE.Vector3(.35,.2,.12)),0xffffa0,1.55);spawnImpactBurst(hit.end,0xffffd2);kickCamera(.44,.30);resolveHit(attacker,hit,{...weapon,impactStrength:1.65});solarFireStack(attacker,hit.room,hit.roomIndex,2);const rooms=opposingRooms(attacker).userData.rooms,candidates=[hit.roomIndex-1,hit.roomIndex+1,hit.roomIndex-3,hit.roomIndex+3].filter(i=>i>=0&&i<9&&((Math.abs(i-hit.roomIndex)===1&&Math.floor(i/3)===Math.floor(hit.roomIndex/3))||Math.abs(i-hit.roomIndex)===3)).sort(()=>Math.random()-.5).slice(0,3);candidates.forEach((ri,j)=>setTimeout(()=>{if(!battleStarted||matchEnded)return;const room=rooms[ri];if(!room||room.erased)return;const p=room.hitPlane.getWorldPosition(new THREE.Vector3()),mini=glowSphere(.34,0xffc13d,10);mini.position.copy(hit.end);scene.add(mini);const a=performance.now(),from=hit.end.clone(),apex=from.clone().lerp(p,.5);apex.y+=3.4;(function bounce(time){if(!mini.parent)return;const u=Math.min(1,(time-a)/520),q=new THREE.QuadraticBezierCurve3(from,apex,p).getPoint(u);mini.position.copy(q);mini.scale.setScalar(1+.25*Math.sin(u*18));if(u<1){requestAnimationFrame(bounce);return}scene.remove(mini);spawnExplosionVisual(p,0xffb02b,1.25);spawnImpactBurst(p,0xffffb0);resolveHit(attacker,{room,roomIndex:ri,end:p,direct:false,warrior:opposing(attacker).find(w=>w.roomIndex===ri&&w.hp>0)||null},{...weapon,name:'SUNADIER SCATTER',armorDamage:10,damage:8,splash:8,impactStrength:.78});solarFireStack(attacker,room,ri,1)})(a)},220+j*220));diag('SUNADIER SCATTER','primary='+(hit.roomIndex+1)+' scatter='+candidates.map(i=>i+1).join(','));setTimeout(()=>finishAurelianWeaponAction(attacker,'SUNADIER ABYSS CHAIN'),1850)})(t0)
}
`;

  if (!patched.includes('function spawnSunDisk(')) {
    patched = patched.replace('function spawnSolarLancerBeam(attacker,start,beamPath,weapon){', helpers + '\nfunction spawnSolarLancerBeam(attacker,start,beamPath,weapon){');
  }

  patched = patched.replace(
    "if(wp.aim==='straight'){\n    if(wp.kind==='laser'){",
    "if(wp.aim==='straight'){\n    if(wp.kind==='solar_disk'){const maxGuide=560,ratio=dist>0?Math.min(1,maxGuide/dist):0,gx=a.x+dx*ratio,gy=a.y+dy*ratio;aimPath.setAttribute('d',`M ${a.x} ${a.y} L ${gx} ${gy}`);aimPath.style.stroke='#ffbf28';aimPath.style.strokeWidth='5';aimPath.style.strokeDasharray='11 6';aimPath.style.opacity='.96';aimDot.setAttribute('cx',gx);aimDot.setAttribute('cy',gy);aimDot.style.opacity='.86';\n    }else if(wp.kind==='laser'){"
  );

  patched = patched.replace(
    "if(weapon.kind==='laser'){const beamPath=solarBeamPathFromStage(w,pt,weapon.maxCompartments||2);spawnSolarLancerBeam(w,start,beamPath,weapon)}else if(weapon.kind==='acid')",
    "if(weapon.kind==='laser'){const beamPath=solarBeamPathFromStage(w,pt,weapon.maxCompartments||2);spawnSolarLancerBeam(w,start,beamPath,weapon)}else if(weapon.kind==='solar_disk'){spawnSunDisk(w,start,pt,weapon)}else if(weapon.kind==='sunadier'){spawnSunadier(w,start,pt,power,weapon)}else if(weapon.kind==='acid')"
  );

  patched = patched.replace("new THREE.CylinderGeometry(.24,.24,1,16,1,true)", "new THREE.CylinderGeometry(.46,.46,1,18,1,true)");
  patched = patched.replace("new THREE.CylinderGeometry(.065,.065,1,12,1,true)", "new THREE.CylinderGeometry(.13,.13,1,14,1,true)");
  patched = patched.replace("opacity:.36,blending:THREE.AdditiveBlending", "opacity:.58,blending:THREE.AdditiveBlending");

  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.44');
  patched = patched.replace(/build=2026-08-(28|29|30)_[A-Z0-9_]+/g, 'build=2026-08-30_AURELIAN_COMBAT_PRESENTATION_LOCK');
  patched = patched.replace('</head>', '<meta name="ac-aurelian-combat" content="sun-disk-visible sunadier-visible action-held laser-readable solar-fire-stacks">\n</head>');
  return patched;
}
