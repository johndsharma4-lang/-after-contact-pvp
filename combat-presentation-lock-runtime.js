function replaceExact(source, needle, replacement, status, key) {
  const next = source.replace(needle, replacement);
  status[key] = next !== source;
  return next;
}

function replaceSection(source, startMarker, endMarker, replacement, status, key) {
  const start = source.indexOf(startMarker);
  const end = start < 0 ? -1 : source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) return source;
  status[key] = true;
  return source.slice(0, start) + replacement + '\n' + source.slice(end);
}

export function patchCombatPresentationLockRuntime(html) {
  let patched = html;
  const status = {
    cutaway:false,
    cutawayArt:false,
    weaponCard:false,
    selectedHud:false,
    actionTurn:false,
    multiplayerFire:false,
    multiplayerTurn:false,
    multiplayerRecovery:false,
    multiplayerReject:false,
    destructionEnd:false,
    impactCamera:false,
    impactTrigger:false,
    earthCutaway:false,
    earthHullPanels:false,
    xrayCamera:false,
    damageCallout:false,
    physicalCutaway:false,
    impactReveal:false,
    messageSequence:false,
    tornWreck:false,
    particleBudget:false
  };

  patched = replaceExact(
    patched,
    "g.position.copy(roomRoot.position);g.position.x=0;g.rotation.copy(roomRoot.rotation);g.scale.copy(roomRoot.scale);",
    "g.position.copy(roomRoot.position);if(factionForWorldSide(localXraySide())==='earth')g.position.x=0;g.rotation.copy(roomRoot.rotation);g.scale.copy(roomRoot.scale);",
    status,
    'cutaway'
  );
  patched = patched.replace(
    "const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2,spreadX=faction==='earth'?1.35:2.35,spreadY=faction==='earth'?1.28:1.30;",
    "const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2,spreadX=faction==='earth'?1.35:1.12,spreadY=faction==='earth'?1.28:.72;"
  );
  patched = patched.replace(
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,.92,false)),68);",
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,faction==='earth'?.92:0,false)),68);"
  );
  patched = patched.replace(
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,faction==='earth'?.92:0,false)),68);cutaway.position.set(0,0,.10);g.add(cutaway);",
    "const cutaway=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.32),xrayBasic(0x0d0b08,faction==='earth'?.92:0,false)),68);cutaway.position.set(0,0,.10);g.add(cutaway);if(faction==='aurelian'){g.userData.aurelianHullCutaway=true;const aperture=markXray(new THREE.Mesh(new THREE.CircleGeometry(width*.50,72),xrayBasic(0x120603,.82,false)),67);aperture.scale.set(1,.38,1);aperture.position.set(0,0,.08);g.add(aperture);const hullShoulder=markXray(new THREE.Mesh(new THREE.RingGeometry(width*.50,width*.66,72),xrayBasic(0xb96d1e,.92,false)),68);hullShoulder.scale.set(1,.38,1);hullShoulder.position.set(0,0,.10);g.add(hullShoulder);const apertureRim=markXray(new THREE.Mesh(new THREE.RingGeometry(width*.485,width*.515,72),xrayBasic(0xffd669,.98,true)),70);apertureRim.scale.set(1,.38,1);apertureRim.position.set(0,0,.22);g.add(apertureRim);for(const side of[-1,1]){const panel=markXray(new THREE.Mesh(new THREE.CircleGeometry(width*.35,56,side<0?0:Math.PI,Math.PI),xrayBasic(0xd5892c,.96,false)),70);panel.scale.set(1,.38,1);panel.position.set(side*width*.42,height*.28,1.10);panel.rotation.z=side*.18;panel.rotation.y=side*.72;g.add(panel);const edge=markXray(new THREE.Mesh(new THREE.RingGeometry(width*.33,width*.355,56,1,side<0?0:Math.PI,Math.PI),xrayBasic(0xffffb0,1,true)),71);edge.scale.copy(panel.scale);edge.position.copy(panel.position);edge.rotation.copy(panel.rotation);g.add(edge)}const hinge=markXray(new THREE.Mesh(new THREE.BoxGeometry(width*.72,.20,.20),xrayBasic(0xffc65f,.96,true)),72);hinge.position.set(0,height*.25,.72);g.add(hinge)}"
  );
  patched = patched.replace(
    "new THREE.LineBasicMaterial({color:0xd69a46,transparent:true,opacity:.76,depthTest:false,depthWrite:false})",
    "new THREE.LineBasicMaterial({color:0xffd76a,transparent:true,opacity:faction==='earth'?.76:0,depthTest:false,depthWrite:false})"
  );
  patched = patched.replace(
    "xrayBasic(0x4b5961,faction==='earth' ? .22 : .66,false)",
    "xrayBasic(0x4b5961,faction==='earth' ? .22 : .035,false)"
  );
  patched = patched.replace(
    "xrayBasic(0x111820,faction==='earth' ? .34 : .96,false)",
    "xrayBasic(0x111820,faction==='earth' ? .34 : .12,false)"
  );
  patched = patched.replace(
    "new THREE.LineBasicMaterial({color:0xb8894a,transparent:true,opacity:.74,depthTest:false,depthWrite:false})",
    "new THREE.LineBasicMaterial({color:0xffcf63,transparent:true,opacity:faction==='earth'?.74:.16,depthTest:false,depthWrite:false})"
  );
  patched = replaceExact(
    patched,
    "const fullH=w.passive?1.70:2.62,fullW=w.passive ? .96 : 1.50;",
    "const fullH=w.passive?1.70:(faction==='aurelian'?4.20:2.62),fullW=w.passive?.96:(faction==='aurelian'?2.75:1.50);",
    status,
    'cutawayArt'
  );
  patched = patched.replace(
    "restoreXrayShell();const root=localCommandVessel(),rooms=localXrayRooms(),pal=localXrayPaletteSet();",
    "restoreXrayShell();const root=localCommandVessel(),rooms=localXrayRooms(),pal=localXrayPaletteSet(),faction=factionForWorldSide(localXraySide());"
  );
  patched = patched.replace(
    "c.opacity=Math.min(.035,c.opacity??1);",
    "c.opacity=Math.min(faction==='aurelian'?.075:.035,c.opacity??1);"
  );
  patched = patched.replace(
    "const earthInterior=factionForWorldSide(localXraySide())==='earth';v.shell.material.opacity=(earthInterior ? .20 : .62)+b*.08;v.cavity.material.opacity=(earthInterior ? .30 : .92)+b*.04;v.edge.material.opacity=.64+pulse*.10-b*.14;v.damage.material.opacity=b>0?.05+b*.34:0;",
    "const earthInterior=factionForWorldSide(localXraySide())==='earth';v.shell.material.opacity=(earthInterior?.20:.025)+b*(earthInterior?.08:.025);v.cavity.material.opacity=(earthInterior?.30:.10)+b*(earthInterior?.04:.04);v.edge.material.opacity=(earthInterior?.64:.14)+pulse*(earthInterior?.10:.04)-b*(earthInterior?.14:.03);v.damage.material.opacity=b>0?.05+b*.34:0;"
  );
  patched = patched.replace("statusEl.textContent='FORTRESS CUTAWAY • TAP A NAMED WARRIOR'", "statusEl.textContent=factionForWorldSide(localXraySide())==='aurelian'?'AURELIAN HULL OPEN • SELECT WARRIOR':'FORTRESS CUTAWAY • TAP A NAMED WARRIOR'");
  patched = patched.replace("statusEl.textContent='FORTRESS CUTAWAY • SELECT YOUR WARRIOR'", "statusEl.textContent=factionForWorldSide(localXraySide())==='aurelian'?'AURELIAN HULL OPEN • SELECT WARRIOR':'FORTRESS CUTAWAY • SELECT YOUR WARRIOR'");
  patched = patched.replace("if(w.sprite)w.sprite.visible=show&&!xrayMine&&!enemyExposed;", "if(w.sprite)w.sprite.visible=show&&!xrayMine&&(!enemyExposed||!w.passive);");
  patched = patched.replace("if(w.healthBase)w.healthBase.visible=healthVisible;", "if(w.healthBase)w.healthBase.visible=healthVisible&&w.passive;");
  patched = patched.replace("if(w.healthFill){w.healthFill.visible=healthVisible;", "if(w.healthFill){w.healthFill.visible=healthVisible&&w.passive;");

  const restoredShell = patched.replace(
    "function restoreXrayShell(){for(const item of xrayShellState){if(!item.mesh)continue;const originals=new Set(Array.isArray(item.material)?item.material:[item.material]),temporary=Array.isArray(item.mesh.material)?item.mesh.material:[item.mesh.material];for(const m of temporary)if(m&&!originals.has(m))m.dispose?.();item.mesh.material=item.material}xrayShellState=[]}",
    "function restoreXrayShell(){for(const item of xrayShellState){if(!item.mesh)continue;if(Object.hasOwn(item,'visible'))item.mesh.visible=item.visible;if(item.material){const originals=new Set(Array.isArray(item.material)?item.material:[item.material]),temporary=Array.isArray(item.mesh.material)?item.mesh.material:[item.mesh.material];for(const m of temporary)if(m&&!originals.has(m))m.dispose?.();item.mesh.material=item.material}}xrayShellState=[]}"
  );
  status.physicalCutaway = restoredShell !== patched;
  patched = restoredShell;
  patched = patched.replace(
    "  })\n}\nfunction buildPrivateXray(){",
    "  });const skin=localXraySide()==='aurelian'?factionSkinA:factionSkinE,cavityBox=new THREE.Box3().setFromObject(rooms).expandByScalar(2.4);for(const part of skin?.children||[]){if(!part.visible||part.userData?.wreckPersistent)continue;const partBox=new THREE.Box3().setFromObject(part);if(!partBox.isEmpty()&&partBox.intersectsBox(cavityBox)){xrayShellState.push({mesh:part,visible:part.visible});part.visible=false}}const health=localCommandVessel()?.userData?.vesselHealth;for(const shell of[health?.shield,health?.hull]){if(!shell)continue;xrayShellState.push({mesh:shell,visible:shell.visible});shell.visible=false}\n}\nfunction buildPrivateXray(){"
  );

  const physicalCutawayOwner = String.raw`function applyXrayShell(){
  restoreXrayShell();const side=localXraySide(),skin=side==='aurelian'?factionSkinA:factionSkinE,roomRoot=localXrayRooms(),rooms=roomRoot.userData.rooms,faction=factionForWorldSide(side),hidden=new Set();
  const hide=mesh=>{if(!mesh||hidden.has(mesh)||mesh.visible===false)return;hidden.add(mesh);xrayShellState.push({mesh,visible:mesh.visible});mesh.visible=false};
  const modules=skin?.userData?.damageModules||[];for(const i of[1,4,7])hide(modules[i]);
  const center=rooms[4].hitPlane.getWorldPosition(new THREE.Vector3()),aperture=new THREE.Box3().setFromCenterAndSize(center,new THREE.Vector3(9.2,13.6,10.5)),candidates=[];
  for(const part of skin?.children||[]){if(!part?.isMesh||!part.visible||part.userData?.wreckPersistent||part.userData?.healthVisual)continue;const box=new THREE.Box3().setFromObject(part);if(box.isEmpty()||!box.intersectsBox(aperture))continue;const size=box.getSize(new THREE.Vector3());candidates.push({part,volume:size.x*size.y*size.z})}
  candidates.sort((a,b)=>b.volume-a.volume);for(const item of candidates.slice(0,faction==='earth'?6:4))hide(item.part);
  const health=localCommandVessel()?.userData?.vesselHealth;for(const shell of[health?.shield,health?.hull])hide(shell);
  diag('PHYSICAL HULL REMOVAL','side='+side+' hiddenPanels='+hidden.size+' grid=N')
}
function buildPrivateXray(){
  if(xrayGroup){localCommandVessel().remove(xrayGroup);disposeXrayObject(xrayGroup)}
  const roomRoot=localXrayRooms(),pal=localXrayPaletteSet(),faction=factionForWorldSide(localXraySide()),localCrew=localXrayWarriors().filter(w=>!w.passive).slice(0,3);xrayRoomVisuals=[];
  const g=new THREE.Group();g.name='PRIVATE_HULL_CAVITY_LOCAL_ONLY';g.userData.xrayVisual=true;g.userData.physicalHullCavity=true;g.position.copy(roomRoot.position);g.rotation.copy(roomRoot.rotation);g.scale.copy(roomRoot.scale);
  const width=15.2,height=8.8,depth=4.4,hullColor=faction==='aurelian'?0x9a591b:0x42535e,edgeColor=faction==='aurelian'?0xffcc59:0xa9eaff,inside=xrayBasic(0x081016,.99,false),hull=xrayBasic(hullColor,.98,false),edge=xrayBasic(edgeColor,.92,true),burn=xrayBasic(0x25100a,.88,false);
  const back=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,height,.42),inside),68);back.position.z=-1.72;g.add(back);const floor=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,.30,depth),burn),69);floor.position.set(0,-height*.49,-.10);g.add(floor);const ceiling=markXray(new THREE.Mesh(new THREE.BoxGeometry(width,.26,depth),inside.clone()),69);ceiling.position.set(0,height*.49,-.12);g.add(ceiling);for(const side of[-1,1]){const wall=markXray(new THREE.Mesh(new THREE.BoxGeometry(.30,height,depth),hull.clone()),70);wall.position.set(side*width*.49,0,-.12);g.add(wall)}
  for(const y of[-2.65,0,2.65]){const rib=markXray(new THREE.Mesh(new THREE.BoxGeometry(width-.48,.13,.32),edge.clone()),72);rib.position.set(0,y,-.02);g.add(rib)}for(const x of[-5.05,0,5.05]){const rib=markXray(new THREE.Mesh(new THREE.BoxGeometry(.14,height-.42,.34),edge.clone()),72);rib.position.set(x,0,-.01);g.add(rib)}
  for(const x of[-5.0,0,5.0]){const consoleBox=markXray(new THREE.Mesh(new THREE.BoxGeometry(2.1,.70,.72),xrayBasic(0x253642,.96,false)),73);consoleBox.position.set(x,-2.84,.34);g.add(consoleBox);const display=markXray(new THREE.Mesh(new THREE.PlaneGeometry(1.34,.42),xrayBasic(x===0?pal.core:pal.main,.72,true)),74);display.position.set(x,-2.63,.72);g.add(display)}
  const rim=markXray(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(width,height,depth)),new THREE.LineBasicMaterial({color:edgeColor,transparent:true,opacity:.88,depthTest:false,depthWrite:false})),76);rim.position.z=-.08;g.add(rim);
  for(const side of[-1,1]){const panel=markXray(new THREE.Mesh(new THREE.BoxGeometry(width*.51,height*1.02,.46),hull.clone()),78);panel.position.set(side*width*.255,0,.38);panel.userData.cutawayPanel={closed:panel.position.clone(),open:new THREE.Vector3(side*width*.67,.32,1.55),rotation:new THREE.Euler(0,side*.94,side*.06)};g.add(panel)}
  if(!xraySelectedCrew||!localCrew.includes(xraySelectedCrew))xraySelectedCrew=localCrew.find(w=>w.isCaptain)||localCrew[0]||null;
  localCrew.forEach((w,i)=>{const x=localCrew.length===1?0:(i-(localCrew.length-1)/2)*4.75,dead=w.hp<=0,marker=new THREE.Group();marker.userData.xrayVisual=true;marker.userData.xrayWarrior=w;marker.position.set(x,dead?-1.0:-.34,.62);g.add(marker);const art=xrayArtTextureForWarrior(w),fullH=faction==='aurelian'?4.25:3.90,fullW=faction==='aurelian'?2.72:2.34,hit=markXray(new THREE.Mesh(new THREE.PlaneGeometry(3.55,5.15),new THREE.MeshBasicMaterial({transparent:true,opacity:.001,depthTest:false,depthWrite:false,side:THREE.DoubleSide})),88);hit.userData.xrayWarrior=w;marker.add(hit);const base=markXray(new THREE.Sprite(new THREE.SpriteMaterial({map:art,color:0x050607,transparent:true,opacity:dead?.24:.46,rotation:dead?Math.PI/2:0,depthTest:false,depthWrite:false})),82);base.scale.set(dead?fullH*.72:fullW*1.08,dead?fullW*.90:fullH*1.05,1);base.position.z=-.02;marker.add(base);const fill=markXray(new THREE.Sprite(new THREE.SpriteMaterial({map:art,color:dead?0x626970:0xffffff,transparent:true,opacity:dead?.26:1,rotation:dead?Math.PI/2:0,depthTest:false,depthWrite:false,blending:THREE.NormalBlending})),84);fill.scale.set(dead?fullH*.68:fullW,dead?fullW*.86:fullH,1);fill.userData.fixedDamageScale=fill.scale.clone();marker.add(fill);const aura=markXray(new THREE.Mesh(new THREE.RingGeometry(1.18,1.34,6),xrayBasic(w.assignedColor,.62,true)),81);aura.rotation.z=Math.PI/6;marker.add(aura);const aaWidth=2.35,aaY=2.12,aaBack=markXray(new THREE.Mesh(new THREE.BoxGeometry(aaWidth,.18,.10),xrayBasic(0x03101a,.86,false)),85);aaBack.position.set(0,aaY,.10);marker.add(aaBack);const aaFill=markXray(new THREE.Mesh(new THREE.BoxGeometry(aaWidth-.10,.10,.12),xrayBasic(0x9deeff,.96,true)),86);aaFill.position.set(0,aaY,.16);marker.add(aaFill);const label=makeXrayCrewLabel(w);label.position.set(0,-2.47,.16);marker.add(label);xrayRoomVisuals.push({warriorMarker:marker,warrior:w,base,fill,aura,aaBack,aaFill,label,hit,dead,aaWidth:aaWidth-.10,fullH,fullW,index:w.roomIndex})});
  xrayScanBand=null;xrayGroup=g;localCommandVessel().add(g);animatePhysicalCutawayPanels(g);refreshPrivateXrayVisuals();diag('PHYSICAL HULL CAVITY','warriors='+localCrew.length+' oldGrid=N')
}`;
  patched = replaceSection(patched,'function applyXrayShell(){','function buildPrivateXray(){',physicalCutawayOwner.slice(0,physicalCutawayOwner.indexOf('function buildPrivateXray(){')),status,'earthHullPanels');
  patched = replaceSection(patched,'function buildPrivateXray(){','function refreshPrivateXrayVisuals(){',physicalCutawayOwner.slice(physicalCutawayOwner.indexOf('function buildPrivateXray(){')),status,'cutaway');

  const damageReactionHelper = `function spawnCrewDamageReaction(w,amount,killed=false){
  if(!w?.sprite||!w.active)return;const room=w.roomGroup?.userData?.rooms?.[w.roomIndex],impactSprite=w.impactRevealSprite?.parent?w.impactRevealSprite:null,revealed=!!impactSprite||(warriorShouldBeVisible(w)&&(!w.passive||crewExposureTier(room)>=3));if(!room||!revealed)return;
  const point=impactSprite?impactSprite.getWorldPosition(new THREE.Vector3()):warriorWorld(w),objects=[],flare=glowSphere(killed?1.10:.72,killed?0xff542f:0xffd27a,14);flare.material.transparent=true;flare.material.opacity=.86;flare.position.copy(point);scene.add(flare);objects.push(flare);const ring=new THREE.Mesh(new THREE.RingGeometry(.34,killed?1.25:.86,32),new THREE.MeshBasicMaterial({color:killed?0xff5533:0xffe5a1,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));ring.position.copy(point);ring.lookAt(camera.position);scene.add(ring);objects.push(ring);for(let i=0;i<8;i++){const spark=glowSphere(.07+Math.random()*.08,i%3?0xff9b39:0xffffff,8);spark.material.transparent=true;spark.material.opacity=.92;spark.position.copy(point).add(new THREE.Vector3((Math.random()-.5)*1.2,(Math.random()-.5)*1.7,.35));scene.add(spark);objects.push(spark)}effects.push({objects,life:killed?.82:.48,max:killed?.82:.48});
  const token=(w.damageReactionSeq||0)+1;w.damageReactionSeq=token;const sprites=[w.sprite,impactSprite].filter((s,i,a)=>s?.parent&&a.indexOf(s)===i),states=sprites.map(sprite=>({sprite,base:sprite.position.clone(),scale:(sprite.userData.fixedDamageScale||sprite.scale).clone(),color:sprite.material.color.clone(),rotation:sprite.material.rotation||0,opacity:sprite.material.opacity})),start=performance.now(),duration=killed?980:660;
  (function react(now){if(w.damageReactionSeq!==token)return;const t=Math.min(1,(now-start)/duration),kick=Math.sin(Math.PI*t)*(killed?.72:.34),side=w.side==='earth'?-1:1;for(const state of states){const sprite=state.sprite;if(!sprite.parent)continue;sprite.position.copy(state.base).add(new THREE.Vector3(side*kick,killed?-t*t*.78:-Math.sin(Math.PI*t)*.10,.12*Math.sin(Math.PI*t)));sprite.scale.copy(state.scale);sprite.material.rotation=state.rotation+side*(killed?.72:.16)*Math.sin(Math.PI*t);sprite.material.color.setHex(t<.30?0xffffff:t<.66?0xff6a3d:0x6b241c);if(killed)sprite.material.opacity=Math.max(.22,1-t*.76)}if(t<1){requestAnimationFrame(react);return}for(const state of states){const sprite=state.sprite;if(!sprite.parent)continue;sprite.scale.copy(state.scale);if(!killed){sprite.position.copy(state.base);sprite.material.rotation=state.rotation;sprite.material.color.copy(state.color);sprite.material.opacity=state.opacity}}})(start);diag('CREW DAMAGE REACTION',(w.displayName||STARTER_PROFILES[w.weaponKey]?.name||'WARRIOR')+' hpHit='+Math.round(amount)+' killed='+(killed?'Y':'N')+' fixedScale=Y')
}
`;
  if(!patched.includes('function spawnCrewDamageReaction('))patched=patched.replace('function applyWarriorDamage(w,amount,label,attacker=null){', damageReactionHelper+'function applyWarriorDamage(w,amount,label,attacker=null){');
  patched = patched.replace("oldColor=sprite.material.color.clone(),start=performance.now()", "oldColor=sprite.material.color.clone(),oldRotation=sprite.material.rotation||0,start=performance.now()");
  patched = patched.replace("sprite.rotation.z=side*(killed?.62:.20)*Math.sin(Math.PI*t);", "sprite.material.rotation=oldRotation+side*(killed?.62:.20)*Math.sin(Math.PI*t);");
  patched = patched.replace("sprite.position.copy(base);sprite.rotation.z=0;sprite.scale.copy(baseScale);", "sprite.position.copy(base);sprite.material.rotation=oldRotation;sprite.scale.copy(baseScale);");
  patched = patched.replace("if(hpDamage>0&&w.sprite){const old=w.sprite.material.color.clone();w.sprite.material.color.setHex(0xff7048);setTimeout(()=>{if(w.sprite?.material)w.sprite.material.color.copy(old)},140)}", "if(hpDamage>0)spawnCrewDamageReaction(w,hpDamage,w.hp===0)");

  const sequencedMessages = patched.replace(
    "function flashDamage(text){\n  const now=performance.now();damageFlash.textContent=text;damageFlash.style.opacity='1';\n  if(!flashDamage.visibleSince||now-flashDamage.visibleSince>620)flashDamage.visibleSince=now;\n  clearTimeout(flashDamage.t);const remaining=Math.max(70,360-(now-flashDamage.visibleSince));\n  flashDamage.t=setTimeout(()=>{damageFlash.style.opacity='0';flashDamage.visibleSince=0},remaining)\n}",
    "function flashDamage(text){flashDamage.queue=flashDamage.queue||[];if(flashDamage.active){if(flashDamage.queue.length<4)flashDamage.queue.push(text);return}flashDamage.active=true;damageFlash.textContent=text;damageFlash.style.opacity='1';clearTimeout(flashDamage.t);flashDamage.t=setTimeout(()=>{damageFlash.style.opacity='0';setTimeout(()=>{flashDamage.active=false;const next=flashDamage.queue.shift();if(next)flashDamage(next)},110)},480)}"
  );
  status.messageSequence = sequencedMessages !== patched;
  patched = sequencedMessages;
  patched = patched.replace("flashDamage(`${state} • RESISTED ${absorbed}`);return{absorbed,passed,blocked:passed<=0,openBefore:false}", "diag('SHIELD NOTICE',`${state} resisted=${absorbed}`);return{absorbed,passed,blocked:passed<=0,openBefore:false}");

  patched = replaceExact(
    patched,
    ":`${name} SELECTED • WEAPON DEVELOPMENT PENDING`;",
    ":`${profile?.weapon||WEAPONS[w.weaponKey]?.name||name} • ${WEAPONS[w.weaponKey]?.description||'COMBAT READY'}`;",
    status,
    'weaponCard'
  );
  patched = patched.replace(
    "if(wd)wd.textContent=w.weaponKey==='acid_brute'?'CORROSIVE FLOOD • hydro-pack acid hose • stacking AOE':w.weaponKey==='spatial_disintegrator'?'MATTER COLLAPSE • Singularity Core • unstable array':w.weaponKey==='bombardier'?'HE-9 barrage • explosive siege fire':w.weaponKey==='sniper'?'EXPLOSIVE BREACH ROUND • precise compartment shot • small AOE':w.weaponKey==='combat_controller'?'TAC-LINK LOCATOR • delayed adaptive support • 3-turn cooldown':'5s burn-through • 2 compartments • exposes survivors';",
    "if(wd)wd.textContent=WEAPONS[w.weaponKey]?.description||p.weapon||'COMBAT READY';"
  );

  const hudHelper = `function updateSelectedBattleHud(w){
  if(!w)return;const profile=STARTER_PROFILES[w.weaponKey],meta=FACTION_META[factionForSide(w.side)]||FACTION_META.aurelian,target=document.getElementById(w.side==='aurelian'?'leftFactionSub':'rightFactionSub');
  if(target&&profile)target.textContent=\`${'${'}profile.name} • ${'${'}profile.weapon||WEAPONS[w.weaponKey]?.name||'COMBAT READY'} • ROOM ${'${'}Number.isInteger(w.roomIndex)?w.roomIndex+1:'-'}\`;
  diag('ACTIVE WARRIOR HUD',\`${'${'}w.side} ${'${'}w.weaponKey} room=${'${'}Number.isInteger(w.roomIndex)?w.roomIndex+1:'-'}\`)
}
`;
  if (!patched.includes('function updateSelectedBattleHud(')) {
    const next = patched.replace('function selectWarrior(w){', hudHelper + 'function selectWarrior(w){');
    status.selectedHud = next !== patched;
    patched = next;
  }
  patched = patched.replace("  selected=w;\n  for(const x of allWarriors)", "  selected=w;updateSelectedBattleHud(w);\n  for(const x of allWarriors)");

  patched = replaceExact(
    patched,
    "if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid')endSoloPlayerTurnAfterShot();",
    "if(!['laser','explosive','acid','locator','solar_disk','sunadier'].includes(firedKind))endSoloPlayerTurnAfterShot();",
    status,
    'actionTurn'
  );
  if(!status.actionTurn){const next=patched.replace("if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='locator')endSoloPlayerTurnAfterShot();", "if(!['laser','explosive','acid','locator','solar_disk','sunadier'].includes(firedKind))endSoloPlayerTurnAfterShot();");status.actionTurn=next!==patched;patched=next}
  patched = patched.replaceAll("statusEl.textContent='SOLAR LANCER • BURN IN PROGRESS'", "statusEl.textContent='AURELIAN WEAPON • ATTACK IN PROGRESS'");
  patched = patched.replace("solarActionLock?'SOLAR LANCER • BURN IN PROGRESS'", "solarActionLock?'AURELIAN WEAPON • ATTACK IN PROGRESS'");

  const oldFireHandler = "if(m.type==='fire'){networkApplying=true;const team=m.side==='earth'?eWarriors:aWarriors,w=team.find(x=>x.active&&x.weaponKey===m.warrior)||team.find(x=>x.active&&x.hp>0)||team[0],routed=m.warrior||w?.weaponKey;diag('REMOTE ATTACK ROUTE',`${m.side} faction=${m.faction||mpFactionState?.[m.side]?.faction||'-'} warrior=${routed||'-'}`);fireWarriorFromStage(w,m.point,m.power,true,routed);networkApplying=false;mpRound=m.round||mpRound;if(Number.isInteger(m.turnCount))turnsTaken=m.turnCount;setMpTurn(m.nextTurn);return}";
  const newFireHandler = "if(m.type==='fire'){networkApplying=true;const team=m.side==='earth'?eWarriors:aWarriors,routed=m.warrior||m.weapon,w=team.find(x=>x.active&&x.weaponKey===routed)||team.find(x=>x.active&&x.hp>0)||team[0],point=m.point||m.aim;diag('REMOTE ATTACK ROUTE',`${m.side} faction=${m.faction||mpFactionState?.[m.side]?.faction||'-'} warrior=${routed||'-'}`);if(w&&point)fireWarriorFromStage(w,point,m.power,true,routed||w.weaponKey);else diag('REMOTE ATTACK ERROR',`warrior=${routed||'-'} point=${point?'Y':'N'}`);networkApplying=false;mpRound=m.round||mpRound;if(Number.isInteger(m.turnCount))turnsTaken=m.turnCount;return}";
  patched = replaceExact(patched, oldFireHandler, newFireHandler, status, 'multiplayerFire');

  const oldTurnHandler = "if(m.type==='turn'){mpRound=m.round||mpRound;if(Number.isInteger(m.turnCount))turnsTaken=m.turnCount;setMpTurn(m.turn);diag('ACTION TURN RELEASE',`turn=${m.turn} round=${mpRound} action=${turnsTaken}/${TURN_LIMIT}`);return}";
  const newTurnHandler = "if(m.type==='turn'){const nextTurn=m.turn||m.nextTurn||m.side,validTurn=nextTurn==='aurelian'||nextTurn==='earth',release=()=>{if(!validTurn){diag('ACTION TURN ERROR','missing authoritative turn');recoverMpAuthoritativeState('missing turn payload');return}mpRound=m.round||mpRound;if(Number.isInteger(m.turnCount))turnsTaken=m.turnCount;setMpTurn(nextTurn);diag('ACTION TURN RELEASE',`turn=${nextTurn} round=${mpRound} action=${turnsTaken}`)};if(solarActionLock||barrageActionLock||acidActionLock){const started=Date.now(),wait=()=>{if((solarActionLock||barrageActionLock||acidActionLock)&&Date.now()-started<12000){setTimeout(wait,100);return}release()};diag('ACTION TURN HOLD',`turn=${nextTurn||'MISSING'} waiting for weapon resolution`);wait();return}release();return}";
  patched = replaceExact(patched, oldTurnHandler, newTurnHandler, status, 'multiplayerTurn');
  const oldRecovery = "mpPlayStarted=true;mpPlayReady=true;mpHandshakePhase='battle_recovered';\n      startNetworkBattle({type:'start',deployments:st.deployments,factions:st.factions,turn:st.turn||'aurelian',round:st.round||1,positions:st.positions,moveUsed:st.moveUsed,recovered:true});\n      if(battleStarted){\n        mpRound=st.round||mpRound;setMpTurn(st.turn||currentTurn);applyAuthoritativeMovementState(st,'recovery');ensureLocalBattleWarriorActive('authoritative recovery');rearmMultiplayerInput(`recovery:${reason}`,320);\n      }";
  const newRecovery = "mpPlayStarted=true;mpPlayReady=true;mpHandshakePhase='battle_recovered';\n      if(!battleStarted)startNetworkBattle({type:'start',deployments:st.deployments,factions:st.factions,turn:st.turn||'aurelian',round:st.round||1,positions:st.positions,moveUsed:st.moveUsed,recovered:true});\n      else{mpRound=st.round||mpRound;setMpTurn(st.turn||currentTurn);applyAuthoritativeMovementState(st,'recovery');ensureLocalBattleWarriorActive('authoritative recovery');rearmMultiplayerInput(`recovery:${reason}`,320);diag('MP LIVE RESUME',`turn=${st.turn||currentTurn} worldReset=N`)}";
  patched = replaceExact(patched, oldRecovery, newRecovery, status, 'multiplayerRecovery');
  const oldErrorHandler = "if(m.type==='error'){diag('NETWORK REJECT',`${m.code||'ERROR'} ${m.message||'Unknown network error'}`);statusEl.textContent=`NETWORK • ${m.message}`;mpStatus.textContent=m.message;if(m.code==='INVALID_SHOT'||m.code==='NOT_TURN'||m.code==='MATCH_INACTIVE')rearmMultiplayerInput(`server reject:${m.code}`,240);return}";
  const newErrorHandler = "if(m.type==='error'){diag('NETWORK REJECT',`${m.code||'ERROR'} ${m.message||'Unknown network error'}`);statusEl.textContent=`NETWORK • ${m.message}`;mpStatus.textContent=m.message;if(m.code==='NOT_TURN'){mpInputArmAt=Date.now()+600;recoverMpAuthoritativeState('server reject:NOT_TURN');return}if(m.code==='ACTION_LOCKED'){setTimeout(()=>{if(multiplayer&&!matchEnded&&currentTurn===localSide)rearmMultiplayerInput('server action lock elapsed',0)},700);return}if(m.code==='INVALID_SHOT'||m.code==='MATCH_INACTIVE')rearmMultiplayerInput(`server reject:${m.code}`,240);return}";
  patched = replaceExact(patched, oldErrorHandler, newErrorHandler, status, 'multiplayerReject');
  patched = patched.replace(
    "mpTurn.textContent=`TURN ${Math.min(TURN_LIMIT,turnsTaken+1)}/${TURN_LIMIT} • ${mine?'YOUR TURN':`${fm.short} TURN`}`;",
    "mpTurn.textContent=`ROUND ${mpRound} • ${mine?'YOUR TURN':`${fm.short} TURN`}`;"
  );

  patched = replaceExact(
    patched,
    "function completeTurn(){turnsTaken=Math.min(TURN_LIMIT,turnsTaken+1);diag('TURN COMPLETE',`${turnsTaken}/${TURN_LIMIT}`);return turnsTaken>=TURN_LIMIT&&resolveTurnLimit()}",
    "function completeTurn(){turnsTaken+=1;diag('TURN COMPLETE',`${turnsTaken} • two-condition victory mode`);checkMatchEnd();return matchEnded}",
    status,
    'destructionEnd'
  );

  patched = patched.replace(
    "const rect=objectScreenRect(rooms[i].hitPlane,0),entry=lineRectEntry(startStage,farStage,rect);if(entry)hits.push({room:rooms[i],roomIndex:i,entry,source:'exact-ray'});",
    "const room=rooms[i],occupant=warriors.find(w=>w.roomIndex===i&&w.hp>0)||null;if((room.erased||room.armor<=0)&&!occupant)continue;const rect=objectScreenRect(room.hitPlane,18),entry=lineRectEntry(startStage,farStage,rect);if(entry)hits.push({room,roomIndex:i,entry,source:'visible-ray'});"
  );
  patched = patched.replace(
    "hits.sort((a,b)=>a.entry.t-b.entry.t);const path=hits.slice(0,maxCompartments).map(h=>{const warrior=warriors.find(w=>w.roomIndex===h.roomIndex&&w.hp>0)||null;return{room:h.room,roomIndex:h.roomIndex,end:stagePointToRoomWorld(h.entry,h.room),warrior,direct:!!warrior,source:'exact-ray'}});",
    "if(!hits.length){const hull=visibleHullLineHit(attacker,startStage,farStage);if(hull){const i=nearestDamageableRoomToStagePoint(rooms,hull.hit);hits.push({room:rooms[i],roomIndex:i,entry:hull.hit,source:'visible-hull'})}}hits.sort((a,b)=>a.entry.t-b.entry.t);const path=hits.slice(0,maxCompartments).map(h=>{const warrior=warriors.find(w=>w.roomIndex===h.roomIndex&&w.hp>0)||null;return{room:h.room,roomIndex:h.roomIndex,end:stagePointToRoomWorld(h.entry,h.room),warrior,direct:!!warrior,source:h.source||'visible-ray'}});"
  );
  patched = patched.replace(
    "function resolveCaptainElimination(w,attacker){\n  if(!w?.isCaptain)return false;\n  if(FEATURE_FLAGS.multiWarriorSwitching){awardCaptainDamageBonus(w,attacker);return false}\n  const localCaptain=w.side===localWorldSide(),meta=FACTION_META[factionForSide(w.side)]||FACTION_META.earth;\n  diag('CAPTAIN MATCH END',`side=${w.side} local=${localCaptain?'Y':'N'} switching=N`);endMatch(localCaptain?'DEFEAT':'VICTORY',`${meta.short} CAPTAIN ELIMINATED`);return true\n}",
    "function resolveCaptainElimination(w,attacker){\n  if(!w?.isCaptain)return false;awardCaptainDamageBonus(w,attacker);diag('CAPTAIN ELIMINATION CONTINUES',`side=${w.side} structure=${Math.round(structureHp[w.side]||0)} crew remaining=${(w.side==='aurelian'?aCrew:eCrew).filter(x=>x.active&&x.hp>0).length}`);return false\n}"
  );
  patched = patched.replace(
    "const earthAlive=eCrew.some(w=>w.active&&w.hp>0),aurelianAlive=aCrew.some(w=>w.active&&w.hp>0);",
    "const earthAlive=eWarriors.some(w=>w.active&&w.hp>0),aurelianAlive=aWarriors.some(w=>w.active&&w.hp>0),earthShadowsAlive=eShadows.filter(w=>w.active&&w.hp>0).length,aurelianShadowsAlive=aShadows.filter(w=>w.active&&w.hp>0).length;diag('VICTORY CREW CHECK',`earthCombat=${earthAlive?'ALIVE':'DOWN'} earthBackground=${earthShadowsAlive} aurelianCombat=${aurelianAlive?'ALIVE':'DOWN'} aurelianBackground=${aurelianShadowsAlive}`);"
  );
  patched = patched.replace(
    "if(hit.room.erased){diag('HIT RESULT',`${weapon.name} MISS`);statusEl.textContent=`${weapon.name} • MISS • NO DAMAGE`;updateDamageMonitor(null,-1,0,attacker);flashDamage('MISS');return{armorDamage:0,unitDamage:0}}",
    "if(hit.room.erased&&weapon.kind==='solar_disk'&&hit.warrior?.active&&hit.warrior.hp>0){const unitDamage=applyWarriorDamage(hit.warrior,weapon.damage||28,'SUN DISK OPEN-COMPARTMENT SLICE',attacker),structureDamage=applyStructureDamage(attacker,Math.max(4,Math.round((weapon.armorDamage||30)*.42)),'SUN DISK OPEN-COMPARTMENT SLICE');diag('SUN DISK EXPOSED CREW SLICE',`room=${hit.roomIndex+1} unit=${unitDamage} hull=${structureDamage}`);statusEl.textContent=`SUN DISK CUTTER • EXPOSED ROOM ${hit.roomIndex+1} • UNIT -${unitDamage}`;flashDamage(`SLICE • -${unitDamage} UNIT`);return{armorDamage:0,unitDamage,structureDamage}}if(hit.room.erased){diag('HIT RESULT',`${weapon.name} MISS`);statusEl.textContent=`${weapon.name} • MISS • NO DAMAGE`;updateDamageMonitor(null,-1,0,attacker);flashDamage('MISS');return{armorDamage:0,unitDamage:0}}"
  );
  patched = patched.replace(
    "const room=hit.room,index=hit.roomIndex,before=room.armor;\n    const shield=absorbShieldHit(attacker,index,weapon.armorDamage||4,'SOLAR EXACT RAY',hit.end);",
    "const room=hit.room,index=hit.roomIndex,before=room.armor,channelOcc=opposing(attacker).find(w=>w.roomIndex===index&&w.hp>0);if((room.erased||room.armor<=0)&&!channelOcc){const channelDamage=applyStructureDamage(attacker,weapon.armorDamage||4,'SOLAR OPEN CHANNEL');spawnImpactBurst(hit.end,0xffe8a4);diag('SOLAR OPEN CHANNEL',`room=${index+1} rearHull=${channelDamage}`);continue}\n    const shield=absorbShieldHit(attacker,index,weapon.armorDamage||4,'SOLAR EXACT RAY',hit.end);"
  );

  const impactHelpers = `let impactFocusSide=null,impactFocusPoint=null,impactFocusUntil=0,impactFocusTimer=null;
function beginImpactFocus(side,roomIndex,label,duration=1750,force=false){
  if(xrayOpen||(!force&&matchEnded))return;const roomSet=side==='aurelian'?aRooms:eRooms,room=Number.isInteger(roomIndex)?roomSet?.userData?.rooms?.[roomIndex]:null;impactFocusSide=side;impactFocusPoint=room?.hitPlane?.getWorldPosition(new THREE.Vector3())||null;impactFocusUntil=performance.now()+duration;document.body.classList.add('acImpactFocus');clearTimeout(impactFocusTimer);impactFocusTimer=setTimeout(()=>{impactFocusSide=null;impactFocusPoint=null;impactFocusUntil=0;document.body.classList.remove('acImpactFocus');if(battleStarted)updateBattleCamera()},duration+140);diag('IMPACT CAMERA',\`side=\${side} room=\${Number.isInteger(roomIndex)?roomIndex+1:'HULL'} label=\${label||'IMPACT'} hold=\${duration}\`)
}
function clearImpactFocus(){clearTimeout(impactFocusTimer);impactFocusTimer=null;impactFocusSide=null;impactFocusPoint=null;impactFocusUntil=0;document.body.classList.remove('acImpactFocus');clearImpactCompartmentReveal()}
function animatePhysicalCutawayPanels(group){const panels=[];group?.traverse(o=>{if(o.userData?.cutawayPanel)panels.push(o)});const start=performance.now(),duration=620;(function open(now){if(!group?.parent)return;const t=Math.min(1,(now-start)/duration),e=1-Math.pow(1-t,3);for(const p of panels){const d=p.userData.cutawayPanel;p.position.copy(d.closed).lerp(d.open,e);p.rotation.set(d.rotation.x*e,d.rotation.y*e,d.rotation.z*e)}if(t<1)requestAnimationFrame(open)})(start)}
let activeImpactCompartmentReveal=null;
function clearImpactCompartmentReveal(){const state=activeImpactCompartmentReveal;if(!state)return;activeImpactCompartmentReveal=null;clearTimeout(state.timer);for(const obj of state.hidden)if(obj?.parent)obj.visible=true;for(const item of state.removedPanels||[])if(item?.mesh?.parent)item.mesh.visible=item.visible;if(state.occupant){state.occupant.impactRevealSprite=null;state.occupant.impactRevealGroup=null}if(state.module)state.module.visible=state.moduleWasVisible&&!state.room.erased&&!state.module.userData?.structureHpHidden;state.group?.parent?.remove(state.group)}
function spawnImpactCompartmentReveal(attacker,hit,duration=1450){
 if(!hit?.room||!Number.isInteger(hit.roomIndex))return;clearImpactCompartmentReveal();const room=hit.room,targetSide=structureTargetSide(attacker),targetCrew=opposing(attacker),hidden=[];
 for(const other of targetCrew)for(const key of['sprite','xrayGlow','healthBase','healthFill']){const obj=other[key];if(obj?.visible){hidden.push(obj);obj.visible=false}}
 const skin=targetSide==='aurelian'?factionSkinA:factionSkinE,module=skin?.userData?.damageModules?.[hit.roomIndex]||null,moduleWasVisible=!!module?.visible,removedPanels=[];if(module)module.visible=false;const removePanel=mesh=>{if(!mesh||mesh===module||mesh.visible===false||mesh.userData?.healthVisual||mesh.userData?.xrayVisual||removedPanels.some(x=>x.mesh===mesh))return;removedPanels.push({mesh,visible:mesh.visible});mesh.visible=false};if(hit.hullObject&&isDescendantOf(hit.hullObject,skin))removePanel(hit.hullObject);if(!removedPanels.length){const aperture=new THREE.Box3().setFromCenterAndSize(room.hitPlane.getWorldPosition(new THREE.Vector3()),new THREE.Vector3(6.2,5.2,7.2)),choices=[];for(const part of skin?.children||[]){if(!part?.isMesh||!part.visible||part.userData?.wreckPersistent)continue;const box=new THREE.Box3().setFromObject(part);if(box.isEmpty()||!box.intersectsBox(aperture))continue;const size=box.getSize(new THREE.Vector3());choices.push({part,volume:size.x*size.y*size.z})}choices.sort((a,b)=>b.volume-a.volume);for(const choice of choices.slice(0,2))removePanel(choice.part)}
 const group=new THREE.Group(),point=room.hitPlane.getWorldPosition(new THREE.Vector3()),rotation=room.hitPlane.getWorldQuaternion(new THREE.Quaternion()),aurelianTarget=factionForSide(targetSide)==='aurelian';group.position.copy(point);group.quaternion.copy(rotation);group.renderOrder=110;scene.add(group);
 const metal=new THREE.MeshStandardMaterial({color:aurelianTarget?0x8c4f18:0x485761,metalness:.72,roughness:.34,depthTest:false}),edgeMat=new THREE.MeshStandardMaterial({color:aurelianTarget?0xffc85a:0x9adfff,emissive:aurelianTarget?0xff7b18:0x318ac0,emissiveIntensity:.72,metalness:.62,roughness:.28,depthTest:false}),inside=new THREE.MeshStandardMaterial({color:0x111820,metalness:.30,roughness:.76,depthTest:false}),burn=new THREE.MeshStandardMaterial({color:0x24100a,emissive:0x5a1608,emissiveIntensity:.42,metalness:.18,roughness:.92,depthTest:false});
 const back=new THREE.Mesh(new THREE.BoxGeometry(5.65,4.05,.38),inside),floor=new THREE.Mesh(new THREE.BoxGeometry(5.65,.28,2.55),burn),ceiling=new THREE.Mesh(new THREE.BoxGeometry(5.65,.22,2.20),inside),leftWall=new THREE.Mesh(new THREE.BoxGeometry(.24,4.05,2.35),metal),rightWall=leftWall.clone();back.position.z=-.92;floor.position.set(0,-1.92,.16);ceiling.position.set(0,1.92,-.05);leftWall.position.set(-2.74,0,-.02);rightWall.position.set(2.74,0,-.02);group.add(back,floor,ceiling,leftWall,rightWall);
 for(const y of[-1.18,0,1.18]){const rib=new THREE.Mesh(new THREE.BoxGeometry(5.42,.10,.16),edgeMat);rib.position.set(0,y,.05);group.add(rib)}for(const x of[-1.78,0,1.78]){const rib=new THREE.Mesh(new THREE.BoxGeometry(.10,3.72,.16),edgeMat);rib.position.set(x,0,.06);group.add(rib)}
 const panels=[];for(const side of[-1,1]){const panel=new THREE.Mesh(new THREE.BoxGeometry(2.82,4.16,.34),metal);panel.position.set(side*1.42,0,.28);panel.userData.closed=panel.position.clone();panel.userData.open=new THREE.Vector3(side*3.44,.22,1.02);panel.userData.openRotation=side*.96;group.add(panel);panels.push(panel)}
 const occupant=targetCrew.find(w=>w.active&&w.hp>0&&w.roomIndex===hit.roomIndex)||null;if(occupant?.sprite?.material?.map){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:occupant.sprite.material.map,color:0xffffff,transparent:true,opacity:1,depthTest:false,depthWrite:false}));sprite.position.set(0,-.34,.62);sprite.scale.set(occupant.passive?1.42:2.18,occupant.passive?2.38:3.46,1);sprite.userData.fixedDamageScale=sprite.scale.clone();sprite.renderOrder=114;group.add(sprite);occupant.impactRevealUntil=performance.now()+duration;occupant.impactRevealSprite=sprite;occupant.impactRevealGroup=group}
 const born=performance.now();(function open(now){if(!group.parent)return;const t=Math.min(1,(now-born)/520),e=1-Math.pow(1-t,3);for(const panel of panels){panel.position.copy(panel.userData.closed).lerp(panel.userData.open,e);panel.rotation.y=panel.userData.openRotation*e}if(t<1)requestAnimationFrame(open)})(born);
 const timer=setTimeout(()=>{if(activeImpactCompartmentReveal?.group===group)clearImpactCompartmentReveal()},duration+220);activeImpactCompartmentReveal={group,room,module,moduleWasVisible,removedPanels,hidden,occupant,timer};diag('IMPACT CUTAWAY',\`side=\${targetSide} room=\${hit.roomIndex+1} warrior=\${occupant?.weaponKey||'NONE'} oldXray=N fixedScale=Y hullPanelRemoved=\${removedPanels.length}\`)
}
`;
  patched = replaceExact(patched,'let cameraLastUpdate=performance.now();',impactHelpers+'let cameraLastUpdate=performance.now();',status,'impactCamera');
  patched = replaceExact(
    patched,
    `  }else{
    desiredPos=new THREE.Vector3(midX,(tactical?27.5:23.5)+midY*.11+altExtra*.22,safeZ);`,
    `  }else if(impactFocusSide&&now<impactFocusUntil){
    const focusRoot=impactFocusSide==='aurelian'?aure:earth,rootPoint=focusRoot.getWorldPosition(new THREE.Vector3()),focus=impactFocusPoint?rootPoint.clone().lerp(impactFocusPoint,.22):rootPoint;desiredPos=new THREE.Vector3(focus.x,focus.y+6.2,focus.z+84);desiredLook=new THREE.Vector3(focus.x,focus.y+.6,focus.z);desiredZoom=.98;
  }else{
    impactFocusSide=null;desiredPos=new THREE.Vector3(midX,(tactical?27.5:23.5)+midY*.11+altExtra*.22,safeZ);`,
    status,
    'impactCamera'
  );
  patched = replaceExact(
    patched,
    "const impactSide=structureTargetSide(attacker),impactStrength=Math.max(.45,Math.min(1.8,weapon.impactStrength||1));",
    "const impactSide=structureTargetSide(attacker),impactStrength=Math.max(.45,Math.min(1.8,weapon.impactStrength||1)),focusHold=weapon.kind==='sunadier'?2300:weapon.kind==='solar_disk'?1900:weapon.kind==='laser'?1450:weapon.kind==='explosive'?1550:1750;beginImpactFocus(impactSide,hit.roomIndex,weapon.name,focusHold);spawnImpactCompartmentReveal(attacker,hit,focusHold);",
    status,
    'impactTrigger'
  );

  patched = replaceExact(
    patched,
    "g.position.copy(roomRoot.position);if(factionForWorldSide(localXraySide())==='earth')g.position.x=0;g.rotation.copy(roomRoot.rotation);g.scale.copy(roomRoot.scale);",
    "g.position.copy(roomRoot.position);g.rotation.copy(roomRoot.rotation);g.scale.copy(roomRoot.scale);",
    status,
    'earthCutaway'
  );
  patched = patched.replace("const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2,spreadX=faction==='earth'?1.35:1.12,spreadY=faction==='earth'?1.28:.72;","const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2,spreadX=faction==='earth'?1.08:1.12,spreadY=faction==='earth'?.84:.72;");
  patched = patched.replace("xrayBasic(0x0d0b08,faction==='earth'?.92:0,false)","xrayBasic(0x0d0b08,faction==='earth'?.08:0,false)");
  patched = patched.replace("map:earthFortressCutawayTex,color:0xffffff,transparent:true,opacity:.58","map:earthFortressCutawayTex,color:0xffffff,transparent:true,opacity:.24");
  patched = replaceExact(
    patched,
    "g.add(hinge)}",
    "g.add(hinge)}else{g.userData.earthHullCutaway=true;const rear=markXray(new THREE.Mesh(new THREE.BoxGeometry(width*1.08,height*1.10,.30),xrayBasic(0x101820,.34,false)),67);rear.position.set(0,0,.02);g.add(rear);for(const side of[-1,1]){const panel=markXray(new THREE.Mesh(new THREE.BoxGeometry(width*.50,height*1.04,.34),xrayBasic(side<0?0x4f6572:0x394b57,.94,false)),70);panel.position.set(side*width*.53,.18,1.05);panel.rotation.y=side*.76;panel.rotation.z=side*.035;g.add(panel);const ribs=markXray(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(width*.50,height*1.04,.38)),new THREE.LineBasicMaterial({color:0xaad7ee,transparent:true,opacity:.78,depthTest:false,depthWrite:false})),71);ribs.position.copy(panel.position);ribs.rotation.copy(panel.rotation);g.add(ribs)}for(const y of[-1,1]){const rail=markXray(new THREE.Mesh(new THREE.BoxGeometry(width*1.08,.18,.20),xrayBasic(0x8ca6b3,.88,true)),72);rail.position.set(0,y*height*.54,.72);g.add(rail)}}",
    status,
    'earthHullPanels'
  );
  patched = patched.replace("xrayBasic(0x4b5961,faction==='earth' ? .22 : .035,false)","xrayBasic(0x4b5961,faction==='earth' ? .07 : .035,false)");
  patched = patched.replace("xrayBasic(0x111820,faction==='earth' ? .34 : .12,false)","xrayBasic(0x111820,faction==='earth' ? .16 : .12,false)");
  patched = patched.replace("opacity:faction==='earth'?.74:.16","opacity:faction==='earth'?.24:.16");
  patched = patched.replace("const fullH=w.passive?1.70:(faction==='aurelian'?4.20:2.62),fullW=w.passive?.96:(faction==='aurelian'?2.75:1.50);","const fullH=w.passive?1.52:(faction==='aurelian'?4.20:3.55),fullW=w.passive?.88:(faction==='aurelian'?2.75:2.18);");
  patched = patched.replace("marker.position.set(p.x,p.y-(dead?cellH*.25:0),.82);", "marker.position.set(p.x,p.y-(dead?cellH*.25:0),.28);");
  patched = patched.replace(
    "panel.scale.set(1,.38,1);panel.position.set(side*width*.42,height*.28,1.10);panel.rotation.z=side*.18;panel.rotation.y=side*.72;g.add(panel);",
    "panel.scale.set(1,.38,1);panel.position.set(0,0,.34);panel.userData.cutawayPanel={closed:panel.position.clone(),open:new THREE.Vector3(side*width*.42,height*.28,1.10),rotation:new THREE.Euler(0,side*.72,side*.18)};g.add(panel);"
  );
  patched = patched.replace(
    "edge.scale.copy(panel.scale);edge.position.copy(panel.position);edge.rotation.copy(panel.rotation);g.add(edge)",
    "edge.scale.copy(panel.scale);edge.position.set(0,0,.36);edge.userData.cutawayPanel={closed:edge.position.clone(),open:new THREE.Vector3(side*width*.42,height*.28,1.12),rotation:new THREE.Euler(0,side*.72,side*.18)};g.add(edge)"
  );
  patched = patched.replace(
    "panel.position.set(side*width*.53,.18,1.05);panel.rotation.y=side*.76;panel.rotation.z=side*.035;g.add(panel);",
    "panel.position.set(side*width*.25,.18,.34);panel.userData.cutawayPanel={closed:panel.position.clone(),open:new THREE.Vector3(side*width*.60,.18,1.05),rotation:new THREE.Euler(0,side*.76,side*.035)};g.add(panel);"
  );
  patched = patched.replace(
    "ribs.position.copy(panel.position);ribs.rotation.copy(panel.rotation);g.add(ribs)",
    "ribs.position.copy(panel.position);ribs.userData.cutawayPanel={closed:ribs.position.clone(),open:new THREE.Vector3(side*width*.60,.18,1.08),rotation:new THREE.Euler(0,side*.76,side*.035)};g.add(ribs)"
  );
  patched = patched.replace("xrayGroup=g;localCommandVessel().add(g);refreshPrivateXrayVisuals()", "xrayGroup=g;localCommandVessel().add(g);animatePhysicalCutawayPanels(g);refreshPrivateXrayVisuals()");
  patched = patched.replaceAll("statusEl.textContent=factionForWorldSide(localXraySide())==='aurelian'?'AURELIAN HULL OPEN • SELECT WARRIOR':'FORTRESS CUTAWAY • TAP A NAMED WARRIOR'", "statusEl.textContent='PHYSICAL HULL CUTAWAY • TAP A WARRIOR'");
  patched = patched.replaceAll("statusEl.textContent=factionForWorldSide(localXraySide())==='aurelian'?'AURELIAN HULL OPEN • SELECT WARRIOR':'FORTRESS CUTAWAY • SELECT YOUR WARRIOR'", "statusEl.textContent='PHYSICAL HULL CUTAWAY • SELECT YOUR WARRIOR'");
  patched = replaceExact(
    patched,
    "desiredPos=new THREE.Vector3(xrayCenter.x,xrayCenter.y+2.8,xrayCenter.z+46);\n    desiredLook=new THREE.Vector3(xrayCenter.x,xrayCenter.y,xrayCenter.z);\n    desiredZoom=1.14;",
    "desiredPos=new THREE.Vector3(xrayCenter.x,xrayCenter.y+3.8,xrayCenter.z+58);\n    desiredLook=new THREE.Vector3(xrayCenter.x,xrayCenter.y,xrayCenter.z);\n    desiredZoom=1.04;",
    status,
    'xrayCamera'
  );

  const damageCalloutHelper = `function spawnCrewDamageCallout(w,aaDamage,hpDamage){
  if(!w?.sprite||(!aaDamage&&!hpDamage))return;const room=w.roomGroup?.userData?.rooms?.[w.roomIndex],impactSprite=w.impactRevealSprite?.parent?w.impactRevealSprite:null,revealed=room&&(impactSprite||(w.impactRevealUntil||0)>performance.now()||(warriorShouldBeVisible(w)&&(!w.passive||crewExposureTier(room)>=3)));if(!revealed)return;const c=document.createElement('canvas');c.width=384;c.height=112;const x=c.getContext('2d');x.fillStyle='rgba(4,8,12,.90)';x.fillRect(8,8,368,96);x.strokeStyle=hpDamage?'#ff7048':'#79e7ff';x.lineWidth=5;x.strokeRect(8,8,368,96);x.fillStyle='#ffffff';x.textAlign='center';x.textBaseline='middle';x.font='900 32px system-ui';x.fillText((aaDamage?'−'+Math.round(aaDamage)+' AA':'')+(aaDamage&&hpDamage?'  •  ':'')+(hpDamage?'−'+Math.round(hpDamage)+' HP':''),192,56);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,opacity:1,depthTest:false,depthWrite:false}));sprite.scale.set(3.7,1.08,1);sprite.position.copy(impactSprite?impactSprite.getWorldPosition(new THREE.Vector3()):warriorWorld(w)).add(new THREE.Vector3(0,2.05,.72));sprite.renderOrder=120;scene.add(sprite);effects.push({objects:[sprite],life:.92,max:.92})
}
`;
  if(!patched.includes('function spawnCrewDamageCallout(')){const next=patched.replace('function spawnCrewDamageReaction(w,amount,killed=false){',damageCalloutHelper+'function spawnCrewDamageReaction(w,amount,killed=false){');status.damageCallout=next!==patched;patched=next}
  status.impactReveal = patched.includes('function spawnImpactCompartmentReveal(') && patched.includes('IMPACT CUTAWAY');
  patched = patched.replace("if(hpDamage>0)spawnCrewDamageReaction(w,hpDamage,w.hp===0);","if(aaDamage||hpDamage)spawnCrewDamageCallout(w,aaDamage,hpDamage);if(hpDamage>0)spawnCrewDamageReaction(w,hpDamage,w.hp===0);");
  patched = patched.replace("const token=(w.damageReactionSeq||0)+1;w.damageReactionSeq=token;const sprite=w.sprite,base=sprite.position.clone(),baseScale=sprite.scale.clone(),oldColor=sprite.material.color.clone(),oldRotation=sprite.material.rotation||0,start=performance.now(),duration=killed?620:360;","const token=(w.damageReactionSeq||0)+1;w.damageReactionSeq=token;const sprite=w.sprite,base=sprite.position.clone(),baseScale=sprite.scale.clone(),oldColor=sprite.material.color.clone(),oldRotation=sprite.material.rotation||0,start=performance.now(),duration=killed?980:660;");
  patched = patched.replace("sprite.scale.copy(baseScale).multiplyScalar(1+.08*Math.sin(Math.PI*t));","sprite.scale.copy(baseScale).multiplyScalar(1+.035*Math.sin(Math.PI*t));");
  patched = patched.replace("sprite.position.copy(state.base).add(new THREE.Vector3(side*kick,killed?-t*t*.78:-Math.sin(Math.PI*t)*.10,.12*Math.sin(Math.PI*t)));sprite.scale.copy(state.scale);sprite.material.rotation=state.rotation+side*(killed?.72:.16)*Math.sin(Math.PI*t);sprite.material.color.setHex(t<.30?0xffffff:t<.66?0xff6a3d:0x6b241c);if(killed)sprite.material.opacity=Math.max(.22,1-t*.76)","sprite.position.copy(state.base).add(new THREE.Vector3(side*kick,killed?-t*t*1.42:-Math.sin(Math.PI*t)*.10,.12*Math.sin(Math.PI*t)));sprite.scale.copy(state.scale);sprite.material.rotation=state.rotation+side*(killed?1.28:.16)*(killed?t:Math.sin(Math.PI*t));sprite.material.color.setHex(t<.30?0xffffff:t<.66?0xff6a3d:0x6b241c);if(killed)sprite.material.opacity=Math.max(.06,1-t*.94)");

  patched = replaceExact(patched,"if(room.exteriorScar){room.exteriorScar.visible=true;room.exteriorScar.material.color.setHex(0x020104);room.exteriorScar.material.opacity=.96}","if(room.exteriorScar)room.exteriorScar.visible=false",status,'tornWreck');
  patched = replaceExact(patched,"Math.min(24,Math.round(10+scale*3))","Math.min(11,Math.round(6+scale*1.6))",status,'particleBudget');
  patched = patched.replace("opacity:.95,blending:THREE.AdditiveBlending","opacity:.52,blending:THREE.AdditiveBlending");
  patched = patched.replace("opacity:.82,blending:THREE.AdditiveBlending","opacity:.62,blending:THREE.AdditiveBlending");

  patched = patched.replace(/3D LAB • MOBILE PVP TEST • v0\.33\.\d+/g, '3D LAB • MOBILE PVP TEST • v0.33.48');
  patched = patched.replace(/MATCH RECORDER v0\.33\.\d+/g, 'MATCH RECORDER v0.33.48');
  patched = patched.replace(/build=2026-08-(28|29|30)_[A-Z0-9_]+/g, 'build=2026-08-30_AURELIAN_CINEMATIC_ROUND_ROBIN');
  status.cutaway=patched.includes('PRIVATE_HULL_CAVITY_LOCAL_ONLY')&&!patched.includes('PRIVATE_PHYSICAL_CUTAWAY_LOCAL_ONLY');status.cutawayArt=patched.includes('xrayArtTextureForWarrior');status.earthCutaway=patched.includes("faction==='earth'")&&patched.includes('PRIVATE_HULL_CAVITY_LOCAL_ONLY');status.earthHullPanels=patched.includes('PHYSICAL HULL REMOVAL');status.physicalCutaway=patched.includes('physicalHullCavity')&&patched.includes('oldGrid=N');status.impactReveal=patched.includes('function spawnImpactCompartmentReveal(')&&patched.includes('IMPACT CUTAWAY');
  const summary = Object.entries(status).map(([key,value])=>`${key}:${value?'OK':'MISS'}`).join(' ');
  patched = patched.replace('</head>', `<style id="ac-combat-presentation-css">body.acImpactFocus #movePad,body.acImpactFocus #aimHud{opacity:.10!important;pointer-events:none!important}body.acImpactFocus #rangeBadge{opacity:.18!important}body.acImpactFocus #status{background:rgba(3,9,14,.88)!important;border-color:#ffd36a!important}#damageFlash{max-width:38%!important;font-size:clamp(12px,1.55vw,20px)!important;padding:4px 10px!important;text-shadow:0 2px 7px #000,0 0 8px currentColor!important}.xrayCrewCard.show{backdrop-filter:blur(7px)}</style><meta name="ac-combat-presentation-lock" content="${summary}">\n</head>`);
  return patched;
}
