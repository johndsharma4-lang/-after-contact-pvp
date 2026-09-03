from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')
orig=s

def sub_once(pattern,repl,label,flags=re.S):
    global s
    s2,n=re.subn(pattern,repl,s,count=1,flags=flags)
    if n!=1: raise SystemExit(f'{label}: expected 1 replacement, got {n}')
    s=s2

# 1) Remove the legacy canvas/silhouette texture factory used only by battle warrior sprites.
sub_once(r"function makeCrewSilhouetteTexture\(kind='generic'\)\{.*?function makeWarriors\(side,roomGroup,roomIndices,texture,weaponKey,options=\{\}\)\{.*?\n  return out\n\}",r'''function makeWarriors(side,roomGroup,roomIndices,texture,weaponKey,options={}){
  const out=[];
  for(let i=0;i<roomIndices.length;i++){
    const roomIndex=roomIndices[i],room=roomGroup.userData.rooms[roomIndex],role=options.role||'captain',isCaptain=role==='captain',assignedColor=options.assignedColors?.[i]??(side==='aurelian'?0xf0c65a:0x74d9ff);
    // Authoritative non-rendering combat anchor. Legacy 2-D Sprite/CanvasTexture warrior art is removed.
    const anchor=new THREE.Object3D();anchor.name=`WARRIOR_ANCHOR_${side}_${i}`;anchor.position.copy(room.local).add(new THREE.Vector3(0,-.1,-.75));roomGroup.add(anchor);
    const marker=new THREE.Object3D();marker.name=`WARRIOR_SELECTION_ANCHOR_${side}_${i}`;marker.position.copy(room.local).add(new THREE.Vector3(0,-.05,-.95));roomGroup.add(marker);
    const captainBeaconMat=isCaptain?new THREE.MeshBasicMaterial({color:assignedColor,transparent:true,opacity:.74,depthTest:false,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}):null;
    const captainBeacon=isCaptain?new THREE.Mesh(new THREE.RingGeometry(1.38,1.58,6),captainBeaconMat):null;
    if(captainBeacon){captainBeacon.position.copy(room.local).add(new THREE.Vector3(0,-.10,.46));captainBeacon.rotation.z=Math.PI/6;captainBeacon.renderOrder=80;captainBeacon.visible=false;roomGroup.add(captainBeacon)}
    const hpBack=box(2.75,.22,.16,0x08111b,.05,.9);hpBack.position.copy(room.local).add(new THREE.Vector3(0,1.78,-.64));roomGroup.add(hpBack);
    const hpFill=box(2.55,.12,.18,0x74dfff,.05,.65);hpFill.position.copy(room.local).add(new THREE.Vector3(0,1.78,-.53));roomGroup.add(hpFill);
    const w={side,index:i,anchor,marker,markerMat:null,xrayGlow:null,captainBeacon,hpBack,hpFill,healthBase:null,healthFill:null,healthHeight:2.14,roomIndex,hp:100,maxHp:100,aa:60,maxAa:60,aaLevel:1,weaponKey,roomGroup,role,isCaptain,passive:role==='shadow',canAttack:isCaptain,active:true,assignedColor,displayName:role==='shadow'?`SHADOW ${i+1}`:null,captainBonusAwarded:false,model3D:null};
    marker.userData.warrior=w;out.push(w)
  }
  return out
}''','replace legacy warrior sprite constructor')

# 2) Existing exterior Solar Lancer model uses the anchor, never a Sprite position.
s=s.replace('model.position.copy(w.sprite.position);','model.position.copy(w.anchor.position);')
s=s.replace('w.sprite.material.opacity=0; // keep sprite for hit-testing/position math, just invisible','// Legacy battle sprite removed; anchor drives combat position math.')

# 3) Room relocation uses anchors only.
s=s.replace("  w.sprite.position.copy(room.local).add(new THREE.Vector3(0,-.1,-.75));\n  if(w.model3D){w.model3D.position.copy(w.sprite.position);w.model3D.position.z+=1.35;}","  w.anchor.position.copy(room.local).add(new THREE.Vector3(0,-.1,-.75));\n  if(w.model3D){w.model3D.position.copy(w.anchor.position);w.model3D.position.z+=1.35;}")

# 4) Identity color sync no longer manages silhouette maps.
sub_once(r"function syncCrewIdentityColors\(\)\{.*?\n\}",'''function syncCrewIdentityColors(){
  for(const w of [...aWarriors,...eWarriors])w.assignedColor=factionCrewColor(w.side);
  for(const w of allWarriors)if(w.captainBeacon?.material)w.captainBeacon.material.color.setHex(w.assignedColor)
}''','syncCrewIdentityColors')

# 5) Visibility controls only real models/3-D helpers; never 2-D warrior sprites.
sub_once(r"function setWarriorObjectsVisible\(w,visible\)\{.*?\n\}",'''function setWarriorObjectsVisible(w,visible){
  if(!w)return false;
  const on=!!visible;
  if(w.anchor)w.anchor.visible=on;
  if(w.marker)w.marker.visible=on;
  if(w.hpBack)w.hpBack.visible=on;
  if(w.hpFill)w.hpFill.visible=on;
  if(w.model3D)w.model3D.visible=!!(on&&w.active&&w.hp>0);
  if(!on&&w.captainBeacon)w.captainBeacon.visible=false;
  if(w.hpEl)w.hpEl.style.display='none';
  return true;
}''','setWarriorObjectsVisible')

# 6) Profile changes update combat identity only. No texture loading into battle sprites.
sub_once(r"function applyProfileToWarrior\(w,type\)\{.*?\n\}",'''function applyProfileToWarrior(w,type){
  const profile=STARTER_PROFILES[type]||STARTER_PROFILES.solar_lancer;if(!w)return;
  w.weaponKey=type;w.faction=profile.faction;w.maxHp=profile.stats?.hp||100;w.hp=Math.min(w.hp,w.maxHp);if(w.nameText)w.nameText.textContent=profile.name;
  // Battle identity is data + 3-D rig only. Character-card artwork is UI and is never injected into combat.
}''','applyProfileToWarrior')

# 7) Position helpers are anchor-based.
s=s.replace('function warriorWorld(w){return w.sprite.getWorldPosition(new THREE.Vector3())}','function warriorWorld(w){return w.anchor.getWorldPosition(new THREE.Vector3())}')
s=s.replace("function warriorAtStagePoint(pt){let best=null,bestDist=Infinity;const pool=localSide==='earth'?eWarriors:aWarriors.filter(w=>w.active);for(const w of pool){if(w.hp<=0||!w.sprite.visible)continue;const p=worldToStage(warriorWorld(w)),d=Math.hypot(pt.x-p.x,pt.y-p.y);if(d<bestDist&&d<=90){best=w;bestDist=d}}return best}","function warriorAtStagePoint(pt){let best=null,bestDist=Infinity;const pool=localSide==='earth'?eWarriors:aWarriors.filter(w=>w.active);for(const w of pool){if(w.hp<=0||!warriorShouldBeVisible(w))continue;const p=worldToStage(warriorWorld(w)),d=Math.hypot(pt.x-p.x,pt.y-p.y);if(d<bestDist&&d<=90){best=w;bestDist=d}}return best}")

# 8) Reset no longer revives old sprite opacity/rotation.
s=s.replace("w.acidStacks=0;w.acidStackSeq=(w.acidStackSeq||0)+1;w.sprite.material.opacity=w.passive?.68:1;w.sprite.material.rotation=0;","w.acidStacks=0;w.acidStackSeq=(w.acidStackSeq||0)+1;")

# 9) Armor hit no longer depends on Sprite existence.
s=s.replace('function spawnAtmosphereArmorHit(w){if(!w?.sprite)return;','function spawnAtmosphereArmorHit(w){if(!w?.anchor)return;')

# 10) Damage flash targets the real 3-D model/cutaway rig instead of recoloring a Sprite.
old="if(remaining>0){const before=w.hp;w.hp=Math.max(0,w.hp-remaining);hpDamage=before-w.hp;if(hpDamage>0&&w.sprite){const old=w.sprite.material.color.clone();w.sprite.material.color.setHex(0xff7048);setTimeout(()=>{if(w.sprite?.material)w.sprite.material.color.copy(old)},140)}}"
new="if(remaining>0){const before=w.hp;w.hp=Math.max(0,w.hp-remaining);hpDamage=before-w.hp;if(hpDamage>0)flashWarrior3DHit(w)}"
if old not in s: raise SystemExit('applyWarriorDamage sprite flash anchor missing')
s=s.replace(old,new,1)

# 11) Remove 2-D cutaway art lookup and 2-D hit/casualty popup. Replace with actual-rig reaction.
sub_once(r"function xrayArtTextureForWarrior\(w\)\{.*?\nfunction disposeXrayObject",'''function combatRigForWarrior(w){
  const cutaway=xrayRoomVisuals?.find?.(v=>v.warrior===w)?.rig3D;
  return cutaway||w?.model3D||null
}
function flashWarrior3DHit(w){
  const rig=combatRigForWarrior(w);if(!rig)return;
  const originals=[];rig.traverse(o=>{if(o.isMesh&&o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(m?.color)originals.push([m,m.color.clone(),m.emissive?.clone?.(),m.emissiveIntensity]);if(m?.color)m.color.lerp(new THREE.Color(0xff7048),.72);if(m?.emissive){m.emissive.setHex(0xff3a18);m.emissiveIntensity=Math.max(1.3,m.emissiveIntensity||0)}}}});setTimeout(()=>{for(const [m,c,e,ei] of originals){m.color?.copy?.(c);if(e)m.emissive.copy(e);if(Number.isFinite(ei))m.emissiveIntensity=ei}},150)
}
function disposeXrayObject''','remove xray art lookup')

sub_once(r"function spawnSolarCrewReaction\(w,point,killed=false\)\{.*?\n\}",'''function spawnSolarCrewReaction(w,point,killed=false){
  const rig=combatRigForWarrior(w);if(point)spawnImpactBurst(point,killed?0xff6a42:w.assignedColor);
  if(!rig)return null;
  flashWarrior3DHit(w);
  const start=performance.now(),baseRot=rig.rotation.z,baseY=rig.position.y,baseScale=rig.scale.clone(),duration=killed?720:420;
  const step=now=>{if(!rig.parent)return;const t=Math.min(1,(now-start)/duration),pulse=Math.sin(t*Math.PI);rig.rotation.z=baseRot+(killed?-.72*t:.12*Math.sin(t*Math.PI*4)*pulse);rig.position.y=baseY-(killed?.55*t:.10*pulse);rig.scale.copy(baseScale).multiplyScalar(1+(killed?-.08*t:.05*pulse));if(t<1)requestAnimationFrame(step);else if(!killed){rig.rotation.z=baseRot;rig.position.y=baseY;rig.scale.copy(baseScale)}};requestAnimationFrame(step);return rig
}''','spawnSolarCrewReaction')

# 12) Replace 2-D anonymous falling silhouettes with tiny 3-D mannequins.
s=s.replace("if(showAnonymousFigure){const figure=new THREE.Sprite(new THREE.SpriteMaterial({map:crewSilhouetteTexture,color:0xa9b0b5,transparent:true,opacity:.78,depthTest:false,depthWrite:false}));figure.name='ANONYMOUS_FALLING_OCCUPANT';figure.scale.set(1.05,1.84,1);figure.position.set(0,-.05,.20);figure.renderOrder=53;chunk.add(figure)}","if(showAnonymousFigure){const figure=new THREE.Group();figure.name='ANONYMOUS_FALLING_OCCUPANT_3D';const fm=new THREE.MeshStandardMaterial({color:0xa9b0b5,roughness:.72,metalness:.08});const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.72,4,8),fm),head=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),fm);body.position.y=-.08;head.position.y=.68;figure.add(body,head);figure.position.set(0,-.05,.20);chunk.add(figure)}")
s=s.replace("const figure=new THREE.Sprite(new THREE.SpriteMaterial({map:crewSilhouetteTexture,color:0xa9b0b5,transparent:true,opacity:.76,depthTest:false,depthWrite:false}));figure.name='ANONYMOUS_DEMO_OCCUPANT';figure.scale.set(1.0,1.78,1);figure.position.set(0,-.10,.10);figure.visible=false;figure.renderOrder=94;falling.add(figure);","const figure=new THREE.Group();figure.name='ANONYMOUS_DEMO_OCCUPANT_3D';const demoMat=new THREE.MeshStandardMaterial({color:0xa9b0b5,roughness:.72,metalness:.08});const demoBody=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.72,4,8),demoMat),demoHead=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),demoMat);demoBody.position.y=-.08;demoHead.position.y=.68;figure.add(demoBody,demoHead);figure.position.set(0,-.10,.10);figure.visible=false;falling.add(figure);")

# 13) In-world cutaway status labels are removed from the 3-D room; the DOM crew card remains authoritative.
sub_once(r"function makeXrayCrewLabel\(w\)\{.*?\n\}",'''function makeXrayCrewLabel(w){const label=new THREE.Group();label.name='CUTAWAY_STATUS_LABEL_DISABLED_2D_REMOVED';label.userData.xrayVisual=true;return label}''','makeXrayCrewLabel')

# 14) Concealment no longer toggles Sprite/silhouette layers.
sub_once(r"function syncWarriorConcealment\(w\)\{.*?\nfunction updateUnitVisuals",'''function syncWarriorConcealment(w){
  if(!w)return;const isMine=!multiplayer?w.side==='aurelian':w.side===localSide,xrayMine=xrayOpen&&isMine,show=warriorShouldBeVisible(w);
  if(w.anchor)w.anchor.visible=show&&!xrayMine;
  if(w.marker)w.marker.visible=show&&!xrayMine;
  if(w.model3D)w.model3D.visible=!!(show&&!xrayMine&&w.active&&w.hp>0);
  if(w.captainBeacon)w.captainBeacon.visible=!xrayMine&&show&&w.active&&w.hp>0&&w.isCaptain&&w.aa<=0;
  if(w.hpBack)w.hpBack.visible=false;if(w.hpFill)w.hpFill.visible=false;if(w.hpEl)w.hpEl.style.display='none'
}
function updateUnitVisuals''','syncWarriorConcealment')

# 15) Unit update cannot use Sprite visibility or 2-D health-fill silhouettes.
s=s.replace("    if(w.model3D){const own3D=!multiplayer?w.side==='aurelian':w.side===localSide;w.model3D.visible=!!(w.active&&w.hp>0&&(own3D||w.sprite.visible));}","    if(w.model3D)w.model3D.visible=!!(w.active&&w.hp>0&&warriorShouldBeVisible(w)&&!(xrayOpen&&(!multiplayer?w.side==='aurelian':w.side===localSide)));" )
sub_once(r"\n    if\(w\.healthFill\)\{.*?\n  \}\n\}","\n  }\n}",'remove 2d health fill update')

# 16) Recorder ghost check no longer references removed 2-D layers.
s=s.replace("allWarriors.filter(w=>!w.active&&((w.sprite&&w.sprite.visible)||(w.marker&&w.marker.visible)||(w.hpBack&&w.hpBack.visible)||(w.hpFill&&w.hpFill.visible)||(w.healthBase&&w.healthBase.visible)||(w.healthFill&&w.healthFill.visible))).length===0","allWarriors.filter(w=>!w.active&&((w.model3D&&w.model3D.visible)||(w.marker&&w.marker.visible)||(w.hpBack&&w.hpBack.visible)||(w.hpFill&&w.hpFill.visible))).length===0")

# 17) Remove any residual direct legacy sprite property references in battle code; this should be zero.
for bad in ['w.sprite','w?.sprite','crewSilhouetteTexture','crewTextureForSide','xrayArtTextureForWarrior','SOLAR_CREW_HIT','SOLAR_CASUALTY']:
    if bad in s: raise SystemExit(f'residual legacy battle 2-D reference: {bad}')

# Menu/deployment <img> artwork and DOM/SVG HUD are intentionally preserved: they are UI, not battle-world warrior rendering.
marker='BATTLE_2D_WARRIOR_RENDERING_REMOVED_2026_09_02'
if marker not in s:s=s.replace('<title>After Contact — RECOVERY • Known Working Ocean 0.0</title>',f'<title>After Contact — RECOVERY • Known Working Ocean 0.0</title>\n<!-- {marker} -->',1)

p.write_text(s,encoding='utf-8')
print('PASS removed battle THREE.Sprite warrior bodies')
print('PASS removed canvas silhouette warrior layers')
print('PASS removed 2-D solar hit/casualty popup art')
print('PASS combat positioning now uses non-rendering 3-D anchors')
print('PASS hit reaction targets live 3-D rig')
print('PASS anonymous fall/demo occupants use 3-D geometry')
print('PASS menu/deployment artwork left untouched')
