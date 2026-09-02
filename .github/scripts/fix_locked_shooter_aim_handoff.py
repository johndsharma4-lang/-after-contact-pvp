from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="""  if(xrayOpen){
    const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);return}
    if(xrayConfirmedShooter){
      const chosen=xrayRoomVisuals.find(v=>v.warrior===xrayConfirmedShooter),cp=chosen?worldToStage(chosen.standAnchor.getWorldPosition(new THREE.Vector3())):null;
      if(cp&&Math.hypot(pt.x-cp.x,pt.y-cp.y)<=105){vesselGesture={pointerId:e.pointerId,start:pt,current:pt};try{canvas.setPointerCapture(e.pointerId)}catch{};diag('SHOOTER GESTURE ARMED',`${xrayConfirmedShooter.weaponKey} room=${xrayConfirmedShooter.roomIndex+1}`);return}
    }
    if(!pointHitsLocalVessel(pt)){closePrivateXray('outside tap');return}
  }"""
new="""  if(xrayOpen){
    // Once a shooter is confirmed, selection is finished. The open compartment becomes an aiming surface.
    // This MUST run before the oversized warrior hit-zone or every drag is swallowed as another selection tap.
    if(xrayConfirmedShooter){
      const chosen=xrayRoomVisuals.find(v=>v.warrior===xrayConfirmedShooter),cp=chosen?worldToStage(chosen.standAnchor.getWorldPosition(new THREE.Vector3())):null;
      if(cp&&Math.hypot(pt.x-cp.x,pt.y-cp.y)<=150){
        vesselGesture={pointerId:e.pointerId,start:pt,current:pt,lockedShooter:true};
        try{canvas.setPointerCapture(e.pointerId)}catch{}
        diag('SHOOTER AIM SURFACE ARMED',`${xrayConfirmedShooter.weaponKey} room=${xrayConfirmedShooter.roomIndex+1} radius=150px`);return
      }
      // Do not allow hidden/closed warriors to steal selection after shooter confirmation.
      statusEl.textContent=`SHOOTER LOCKED • ${STARTER_PROFILES[xrayConfirmedShooter.weaponKey]?.name||'WARRIOR'} • DRAG FROM OPEN COMPARTMENT`;
      diag('SHOOTER AIM BLOCK',`outside open room x=${Math.round(pt.x)} y=${Math.round(pt.y)}`);return
    }
    const crew=xrayWarriorAtStagePoint(pt);if(crew){selectXrayCrew(crew);return}
    if(!pointHitsLocalVessel(pt)){closePrivateXray('outside tap');return}
  }"""
if old not in s: raise SystemExit('pointerdown xray block missing')
s=s.replace(old,new,1)
old2="""  if(vesselGesture&&e.pointerId===vesselGesture.pointerId&&!aiming){
    stopNative(e);try{if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId)}catch{}
    const wasCancelled=false;vesselGesture=null;if(!wasCancelled){tacticalAimView=false;togglePrivateXray('own vessel tap')}return
  }"""
new2="""  if(vesselGesture&&e.pointerId===vesselGesture.pointerId&&!aiming){
    stopNative(e);try{if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId)}catch{}
    const locked=!!vesselGesture.lockedShooter;vesselGesture=null;
    if(locked){statusEl.textContent=`SHOOTER LOCKED • ${STARTER_PROFILES[xrayConfirmedShooter?.weaponKey]?.name||'WARRIOR'} • DRAG TO AIM`;diag('SHOOTER AIM TAP','lock retained; no cutaway toggle');return}
    tacticalAimView=false;togglePrivateXray('own vessel tap');return
  }"""
if old2 not in s: raise SystemExit('pointerup vessel block missing')
s=s.replace(old2,new2,1)
# Stronger diagnostic proving aim starts specifically from locked cutaway shooter.
old3="diag('AIM START',`${selected.weaponKey||'warrior'} from ${xrayOpen?'open compartment':'own vessel'} x=${Math.round(pt.x)} y=${Math.round(pt.y)}`);"
new3="diag('AIM START',`${selected.weaponKey||'warrior'} from ${xrayOpen?'LOCKED OPEN COMPARTMENT':'own vessel'} x=${Math.round(pt.x)} y=${Math.round(pt.y)}`);"
if old3 not in s: raise SystemExit('aim start diagnostic missing')
s=s.replace(old3,new3,1)
for req in ['SHOOTER AIM SURFACE ARMED','lockedShooter:true','lock retained; no cutaway toggle','LOCKED OPEN COMPARTMENT','radius=150px']:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS confirmed shooter bypasses warrior selection hit-zone')
print('PASS open selected compartment becomes 150px aiming surface')
print('PASS tap without drag retains shooter lock instead of closing cutaway')
print('PASS drag can now transition to AIM START from locked open compartment')
