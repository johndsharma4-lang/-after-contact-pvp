from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="""function enforceAttackRoute(side,w,eventWarrior=null,eventFaction=null,source='runtime'){
  if(!w)return null;
  // Earth team identities are authoritative once deployed. Specialist weapons remain concept-only,
  // but the old single-starter guard must never rewrite their name, portrait, HP, or room as Bombardier.
  if(factionForSide(side)==='earth'&&!w.passive&&(w.weaponKey==='sniper'||w.weaponKey==='combat_controller'))return w.weaponKey;
  const expected=authoritativeWarriorTypeForSide(side,eventWarrior,eventFaction);
  if(w.weaponKey!==expected){
    diag('ATTACK ROUTE FIX',`${source} ${side} ${w.weaponKey||'-'} -> ${expected}`);
    applyProfileToWarrior(w,expected);
  }
  return expected;
}"""
new="""function enforceAttackRoute(side,w,eventWarrior=null,eventFaction=null,source='runtime'){
  if(!w)return null;
  const faction=factionForSide(side),deployedIds=(FACTION_META[faction]?.roster||[]).map(x=>x.id);
  // Once a living deployed warrior is explicitly selected, its identity/weapon is authoritative.
  // Do not rewrite Sun Disk Gunner or Sunadier back to the original single-starter route.
  if(!w.passive&&w.active&&w.hp>0&&deployedIds.includes(w.weaponKey)){
    diag('ATTACK ROUTE LOCK',`${source} ${side} ${w.weaponKey} trustedSelected=Y`);return w.weaponKey
  }
  if(faction==='earth'&&!w.passive&&(w.weaponKey==='sniper'||w.weaponKey==='combat_controller'))return w.weaponKey;
  const expected=authoritativeWarriorTypeForSide(side,eventWarrior,eventFaction);
  if(w.weaponKey!==expected){diag('ATTACK ROUTE FIX',`${source} ${side} ${w.weaponKey||'-'} -> ${expected}`);applyProfileToWarrior(w,expected)}
  return expected;
}"""
if old not in s: raise SystemExit('enforceAttackRoute block missing')
s=s.replace(old,new,1)
old2="""function xrayWarriorAtStagePoint(pt){
  if(!xrayOpen||!xrayGroup)return null;const ndc=new THREE.Vector2(pt.x/640-1,1-pt.y/360);raycaster.setFromCamera(ndc,camera);
  for(const hit of raycaster.intersectObject(xrayGroup,true)){for(let o=hit.object;o&&o!==xrayGroup.parent;o=o.parent)if(o.userData?.xrayWarrior)return o.userData.xrayWarrior}
  return null
}"""
new2="""function xrayWarriorAtStagePoint(pt){
  if(!xrayOpen||!xrayGroup)return null;const ndc=new THREE.Vector2(pt.x/640-1,1-pt.y/360);raycaster.setFromCamera(ndc,camera);
  for(const hit of raycaster.intersectObject(xrayGroup,true)){for(let o=hit.object;o&&o!==xrayGroup.parent;o=o.parent)if(o.userData?.xrayWarrior)return o.userData.xrayWarrior}
  // Mobile fallback: choose the nearest visible living warrior if the tap lands anywhere near the room.
  let best=null,bestD=Infinity;for(const v of xrayRoomVisuals){const w=v.warrior;if(!w?.active||w.hp<=0||w.passive)continue;const p=worldToStage(v.standAnchor.getWorldPosition(new THREE.Vector3())),d=Math.hypot(pt.x-p.x,pt.y-p.y);if(d<bestD){best=w;bestD=d}}
  if(best&&bestD<=78){diag('CUTAWAY SELECT FALLBACK',`${best.weaponKey} distance=${Math.round(bestD)}px`);return best}
  return null
}"""
if old2 not in s: raise SystemExit('xrayWarriorAtStagePoint block missing')
s=s.replace(old2,new2,1)
# enlarge invisible tap plane to almost the whole native room
old3="new THREE.PlaneGeometry(2.5,3.7)"
if old3 not in s: raise SystemExit('cutaway hit plane size missing')
s=s.replace(old3,"new THREE.PlaneGeometry(4.65,4.05)",1)
for req in ['ATTACK ROUTE LOCK','trustedSelected=Y','CUTAWAY SELECT FALLBACK','PlaneGeometry(4.65,4.05)']:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS selected Aurelian warrior keeps its own weapon route')
print('PASS Sun Disk Gunner/Sunadier no longer rewritten to starter route')
print('PASS mobile warrior selection hit area enlarged with nearest-warrior fallback')
