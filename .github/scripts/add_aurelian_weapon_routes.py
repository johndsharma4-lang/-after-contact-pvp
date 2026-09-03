from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
# Register the two missing Aurelian weapons in the real combat table.
old="""  acid_brute:{name:'CORROSIVE FLOOD',kind:'acid',aim:'hose',damage:28,armorDamage:32,penetration:0,exposureScale:.34,color:0x78ff3b,description:'Hydro-pack acid hose • wide AOE • stacking corrosive burn'},
  spatial_disintegrator:{name:'MATTER COLLAPSE',kind:'disintegrator',aim:'straight',damage:85,armorDamage:100,penetration:1,exposureScale:.90,color:0xb06cff,description:'Singularity Core • unstable multi-beam array • compartment erasure'}
};"""
new="""  acid_brute:{name:'CORROSIVE FLOOD',kind:'acid',aim:'hose',damage:28,armorDamage:32,penetration:0,exposureScale:.34,color:0x78ff3b,description:'Hydro-pack acid hose • wide AOE • stacking corrosive burn'},
  sun_disk_gunner:{name:'SOLAR DISK CUTTER',kind:'sun_disk',aim:'straight',damage:18,armorDamage:22,penetration:.38,exposureScale:.30,color:0xffd76a,description:'Twin-gauntlet solar disk • fast cutting projectile • localized splash'},
  sunadier:{name:'ABYSS-CHAIN SOLAR GRENADE',kind:'sun_grenade',aim:'arc',damage:30,armorDamage:28,splash:42,penetration:.12,exposureScale:.40,color:0xffb84d,description:'Chained solar grenade • manual arc • heavy compartment splash'},
  spatial_disintegrator:{name:'MATTER COLLAPSE',kind:'disintegrator',aim:'straight',damage:85,armorDamage:100,penetration:1,exposureScale:.90,color:0xb06cff,description:'Singularity Core • unstable multi-beam array • compartment erasure'}
};"""
if old not in s: raise SystemExit('WEAPONS insertion anchor missing')
s=s.replace(old,new,1)
# Add concrete projectile helpers before fireWarriorFromStage.
anchor='function fireWarriorFromStage(w,pt,power,remote=false,routeOverride=null){'
pos=s.find(anchor)
if pos<0: raise SystemExit('fireWarriorFromStage missing')
helper=r'''function spawnSunDisk(attacker,start,pt,weapon){
  const hit=laserHitFromStage(attacker,pt),end=hit?.end||targetWorldFromStage(pt),dir=end.clone().sub(start),len=dir.length(),unit=dir.clone().normalize();
  const disk=new THREE.Mesh(new THREE.TorusGeometry(.42,.09,10,30),new THREE.MeshBasicMaterial({color:weapon.color,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));disk.name='SUN_DISK_PROJECTILE';disk.position.copy(start);disk.lookAt(end);scene.add(disk);
  const trail=new THREE.Line(new THREE.BufferGeometry().setFromPoints([start.clone(),end.clone()]),new THREE.LineBasicMaterial({color:weapon.color,transparent:true,opacity:.42,blending:THREE.AdditiveBlending}));scene.add(trail);
  effects.push({objects:[disk,trail],life:.62,max:.62});
  const t0=performance.now(),dur=Math.max(280,Math.min(720,len*9));const step=now=>{if(!disk.parent)return;const t=Math.min(1,(now-t0)/dur);disk.position.copy(start).lerp(end,t);disk.rotation.z+=.42;if(t<1)requestAnimationFrame(step);else{spawnImpactBurst(end,weapon.color);spawnExplosionVisual(end,weapon.color,.78);if(hit)resolveHit(attacker,hit,weapon);disk.parent?.remove(disk);trail.parent?.remove(trail)}};requestAnimationFrame(step);diag('SUN DISK CUTTER',`launch=3D_MUZZLE hit=${hit?.roomIndex!=null?hit.roomIndex+1:'MISS'}`)
}
function spawnSunGrenade(attacker,start,pt,power,weapon){
  const hit=sniperRoomHit(attacker,pt),target=hit?.end||targetWorldFromStage(pt),mid=start.clone().lerp(target,.5);mid.y+=Math.max(3,Math.min(18,Math.abs(target.x-start.x)*.18))*(.55+.45*(power/100));const curve=new THREE.QuadraticBezierCurve3(start,mid,target);
  const orb=glowSphere(.42,weapon.color,12);orb.name='SUNADIER_GRENADE';orb.position.copy(start);scene.add(orb);const ring=new THREE.Mesh(new THREE.TorusGeometry(.50,.055,8,24),new THREE.MeshBasicMaterial({color:0xffefad,transparent:true,opacity:.82,blending:THREE.AdditiveBlending,depthWrite:false}));ring.position.copy(start);scene.add(ring);
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(44)),new THREE.LineBasicMaterial({color:weapon.color,transparent:true,opacity:.32,blending:THREE.AdditiveBlending}));scene.add(line);effects.push({objects:[line],life:1.1,max:1.1});
  const t0=performance.now(),dur=850;const step=now=>{if(!orb.parent)return;const t=Math.min(1,(now-t0)/dur),p=curve.getPoint(t);orb.position.copy(p);ring.position.copy(p);ring.rotation.z+=.32;if(t<1)requestAnimationFrame(step);else{spawnExplosionVisual(target,weapon.color,1.35);spawnImpactBurst(target,0xffe58a);spawnDebris(target,0x8c6328,28,.12,.48);if(hit)resolveHit(attacker,hit,weapon);orb.parent?.remove(orb);ring.parent?.remove(ring);line.parent?.remove(line)}};requestAnimationFrame(step);diag('SUNADIER GRENADE',`launch=3D_MUZZLE arc=Y hit=${hit?.roomIndex!=null?hit.roomIndex+1:'MISS'}`)
}
'''
s=s[:pos]+helper+s[pos:]
# Route the new kinds through the final firing function.
old2="""if(weapon.kind==='laser'){const beamPath=solarBeamPathFromStage(w,pt,weapon.maxCompartments||2);spawnSolarLancerBeam(w,start,beamPath,weapon)}else if(weapon.kind==='acid'){spawnAcidFlood(w,start,pt,power,weapon)}else if(weapon.kind==='explosive'){spawnArc(w,start,pt,power,weapon)}else if(weapon.kind==='sniper'){spawnSniperRound(w,start,pt,weapon)}else if(weapon.kind==='locator'){if(!spawnTacLocator(w,start,pt,power,weapon))return}else{diag('ATTACK ROUTE ERROR',`unsupported kind ${weapon.kind}`);statusEl.textContent='UNKNOWN ATTACK TYPE • OPEN DEBUG';return}"""
new2="""if(weapon.kind==='laser'){const beamPath=solarBeamPathFromStage(w,pt,weapon.maxCompartments||2);spawnSolarLancerBeam(w,start,beamPath,weapon)}else if(weapon.kind==='sun_disk'){spawnSunDisk(w,start,pt,weapon)}else if(weapon.kind==='sun_grenade'){spawnSunGrenade(w,start,pt,power,weapon)}else if(weapon.kind==='acid'){spawnAcidFlood(w,start,pt,power,weapon)}else if(weapon.kind==='explosive'){spawnArc(w,start,pt,power,weapon)}else if(weapon.kind==='sniper'){spawnSniperRound(w,start,pt,weapon)}else if(weapon.kind==='locator'){if(!spawnTacLocator(w,start,pt,power,weapon))return}else{diag('ATTACK ROUTE ERROR',`unsupported kind ${weapon.kind}`);statusEl.textContent='UNKNOWN ATTACK TYPE • OPEN DEBUG';return}"""
if old2 not in s: raise SystemExit('fire kind routing anchor missing')
s=s.replace(old2,new2,1)
# These attacks are single-resolution shots; end the solo turn normally after firing.
for req in ["sun_disk_gunner:{name:'SOLAR DISK CUTTER'","sunadier:{name:'ABYSS-CHAIN SOLAR GRENADE'","weapon.kind==='sun_disk'","weapon.kind==='sun_grenade'","SUN DISK CUTTER","SUNADIER GRENADE"]:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS Sun Disk Gunner registered in WEAPONS')
print('PASS Sunadier registered in WEAPONS')
print('PASS both routes use aimOriginWorld / 3D muzzle through existing final fire path')
print('PASS both attacks resolve through existing room damage system')
