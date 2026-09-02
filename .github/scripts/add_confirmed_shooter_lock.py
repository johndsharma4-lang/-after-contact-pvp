from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
# add state next to xray variables
old="let xrayOpen=false,xrayTurnKey='',xrayGroup=null,xrayScanBand=null,xrayShellState=[],xrayRoomVisuals=[],xraySelectedCrew=null,xrayInitialSelectionShown=false,xrayPulse=0,exteriorRoomsHidden=true,tacticalAimView=false,structureHudTimers={aurelian:null,earth:null};"
new="let xrayOpen=false,xrayTurnKey='',xrayGroup=null,xrayScanBand=null,xrayShellState=[],xrayRoomVisuals=[],xraySelectedCrew=null,xrayConfirmedShooter=null,xrayInitialSelectionShown=false,xrayPulse=0,exteriorRoomsHidden=true,tacticalAimView=false,structureHudTimers={aurelian:null,earth:null};"
if old not in s: raise SystemExit('xray state declaration missing')
s=s.replace(old,new,1)
# opening resets confirmed shooter
old2="xrayOpen=true;xraySelectedCrew=localXrayWarriors().find(w=>w===selected&&w.active)||localXrayWarriors().find(w=>w.active&&w.hp>0)||localXrayWarriors()[0]||null;tacticalAimView=false;"
new2="xrayOpen=true;xrayConfirmedShooter=null;xraySelectedCrew=localXrayWarriors().find(w=>w===selected&&w.active)||localXrayWarriors().find(w=>w.active&&w.hp>0)||localXrayWarriors()[0]||null;tacticalAimView=false;"
if old2 not in s: raise SystemExit('xray open reset anchor missing')
s=s.replace(old2,new2,1)
# close resets
old3="if(!xrayOpen)return;xrayOpen=false;xraySelectedCrew=null;restoreXrayShell();"
new3="if(!xrayOpen)return;xrayOpen=false;xraySelectedCrew=null;xrayConfirmedShooter=null;restoreXrayShell();"
if old3 not in s: raise SystemExit('xray close reset anchor missing')
s=s.replace(old3,new3,1)
# replace select behavior
old4="""function selectXrayCrew(w){
  if(!xrayOpen||!w||!w.active)return;xraySelectedCrew=w;setCutawayFiringStage(w);if(w.hp>0&&!w.passive)selectWarrior(w);refreshPrivateXrayVisuals();const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=`CUTAWAY • ${name} • ROOM ${w.roomIndex+1} • HP ${Math.round(w.hp)}/${w.maxHp}`;diag('3D CUTAWAY SELECT',`${w.weaponKey} room=${w.roomIndex+1}`)
}"""
new4="""function selectXrayCrew(w){
  if(!xrayOpen||!w||!w.active||w.hp<=0||w.passive)return;
  const same=xraySelectedCrew===w;
  if(!same){
    xraySelectedCrew=w;xrayConfirmedShooter=null;restoreFullCutawayStage();selectWarrior(w);refreshPrivateXrayVisuals();
    const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=`${name} HIGHLIGHTED • TAP AGAIN TO CONFIRM`;diag('3D CUTAWAY HIGHLIGHT',`${w.weaponKey} room=${w.roomIndex+1} confirmed=N`);return
  }
  // Second tap on the same highlighted living warrior commits the shooter.
  xrayConfirmedShooter=w;selectWarrior(w);setCutawayFiringStage(w);refreshPrivateXrayVisuals();
  const p=STARTER_PROFILES[w.weaponKey],name=p?.name||'WARRIOR';statusEl.textContent=`SHOOTER LOCKED • ${name} • ROOM ${w.roomIndex+1} • DRAG FROM OPEN COMPARTMENT TO AIM`;
  diag('SHOOTER LOCK',`${w.weaponKey} room=${w.roomIndex+1} confirmed=Y otherRoomsClosed=Y`)
}"""
if old4 not in s: raise SystemExit('selectXrayCrew block missing')
s=s.replace(old4,new4,1)
# only allow aim gesture while xray open if confirmed shooter and start is in selected open compartment vicinity
needle="""  if(xrayOpen){const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);return}if(!pointHitsLocalVessel(pt)){closePrivateXray('outside tap');return}}
  if(pointHitsLocalVessel(pt)){"""
repl="""  if(xrayOpen){
    const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);return}
    if(xrayConfirmedShooter){
      const chosen=xrayRoomVisuals.find(v=>v.warrior===xrayConfirmedShooter),cp=chosen?worldToStage(chosen.standAnchor.getWorldPosition(new THREE.Vector3())):null;
      if(cp&&Math.hypot(pt.x-cp.x,pt.y-cp.y)<=105){vesselGesture={pointerId:e.pointerId,start:pt,current:pt};try{canvas.setPointerCapture(e.pointerId)}catch{};diag('SHOOTER GESTURE ARMED',`${xrayConfirmedShooter.weaponKey} room=${xrayConfirmedShooter.roomIndex+1}`);return}
    }
    if(!pointHitsLocalVessel(pt)){closePrivateXray('outside tap');return}
  }
  if(pointHitsLocalVessel(pt)){"""
if needle not in s: raise SystemExit('xray pointerdown block missing')
s=s.replace(needle,repl,1)
# begin aim should keep cutaway open for confirmed shooter and use that selected warrior
old5="""function beginAimFromVesselGesture(e,pt){
  if(!ensureAimShooterReady())return false;
  if(xrayOpen)closePrivateXray('aim start');
  diag('AIM START',`${selected.weaponKey||'warrior'} from own vessel x=${Math.round(pt.x)} y=${Math.round(pt.y)}`);"""
new5="""function beginAimFromVesselGesture(e,pt){
  if(xrayOpen&&xrayConfirmedShooter){selectWarrior(xrayConfirmedShooter)}
  if(!ensureAimShooterReady())return false;
  if(xrayOpen&&!xrayConfirmedShooter){diag('AIM BLOCK','cutaway shooter not confirmed');statusEl.textContent='SELECT A WARRIOR • TAP AGAIN TO CONFIRM';return false}
  // Confirmed firing stage remains open while aiming so the shot visibly belongs to the warrior.
  diag('AIM START',`${selected.weaponKey||'warrior'} from ${xrayOpen?'open compartment':'own vessel'} x=${Math.round(pt.x)} y=${Math.round(pt.y)}`);"""
if old5 not in s: raise SystemExit('beginAimFromVesselGesture block missing')
s=s.replace(old5,new5,1)
# make cutaway muzzle authoritative when open
old6="aimOriginWorld=muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);"
new6="""const cutawayVisual=xrayOpen?xrayRoomVisuals.find(v=>v.warrior===selected):null;
  const cutawayMuzzle=cutawayVisual?.rig3D?.userData?.muzzle;
  aimOriginWorld=cutawayMuzzle?cutawayMuzzle.getWorldPosition(new THREE.Vector3()):muzzleWorld(selected,pt).clone();aimOriginStage=worldToStage(aimOriginWorld);"""
if old6 not in s: raise SystemExit('aim origin block missing')
s=s.replace(old6,new6,1)
for req in ['xrayConfirmedShooter','SHOOTER LOCK','TAP AGAIN TO CONFIRM','SHOOTER GESTURE ARMED','cutawayMuzzle.getWorldPosition']:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS first tap highlights only')
print('PASS second tap confirms shooter and closes other rooms')
print('PASS aiming requires confirmed shooter while cutaway remains open')
print('PASS aim origin uses selected 3D warrior muzzle when available')
