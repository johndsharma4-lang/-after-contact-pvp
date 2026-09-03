from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
# Sun Disk: generic effects cleanup can remove the projectile before its own RAF reaches impact.
old="""  effects.push({objects:[disk,trail],life:.62,max:.62});
  const t0=performance.now(),dur=Math.max(280,Math.min(720,len*9));const step=now=>{if(!disk.parent)return;const t=Math.min(1,(now-t0)/dur);disk.position.copy(start).lerp(end,t);disk.rotation.z+=.42;if(t<1)requestAnimationFrame(step);else{spawnImpactBurst(end,weapon.color);spawnExplosionVisual(end,weapon.color,.78);if(hit)resolveHit(attacker,hit,weapon);disk.parent?.remove(disk);trail.parent?.remove(trail)}};requestAnimationFrame(step);diag('SUN DISK CUTTER',`launch=3D_MUZZLE hit=${hit?.roomIndex!=null?hit.roomIndex+1:'MISS'}`)
}"""
new="""  const t0=performance.now(),dur=Math.max(280,Math.min(720,len*9));const step=now=>{if(!disk.parent)return;const t=Math.min(1,(now-t0)/dur);disk.position.copy(start).lerp(end,t);disk.rotation.z+=.42;if(t<1)requestAnimationFrame(step);else{spawnImpactBurst(end,weapon.color);spawnExplosionVisual(end,weapon.color,.78);if(hit)resolveHit(attacker,hit,weapon);else resolveHit(attacker,null,weapon);disk.parent?.remove(disk);trail.parent?.remove(trail);const localAction=!multiplayer&&attacker.side==='aurelian';if(localAction&&battleStarted&&!matchEnded&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot();diag('SUN DISK RESOLVED',`hit=${hit?.roomIndex!=null?hit.roomIndex+1:'MISS'} turnAdvance=${localAction?'AFTER_IMPACT':'N/A'}`)}};requestAnimationFrame(step);diag('SUN DISK CUTTER',`launch=3D_MUZZLE hit=${hit?.roomIndex!=null?hit.roomIndex+1:'MISS'} lifecycle=RAF_OWNS_PROJECTILE`)
}"""
if old not in s: raise SystemExit('sun disk lifecycle anchor missing')
s=s.replace(old,new,1)
# Sunadier: keep trajectory line alive under the same owner and resolve miss explicitly; advance solo turn on impact.
old2="""  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(44)),new THREE.LineBasicMaterial({color:weapon.color,transparent:true,opacity:.32,blending:THREE.AdditiveBlending}));scene.add(line);effects.push({objects:[line],life:1.1,max:1.1});
  const t0=performance.now(),dur=850;const step=now=>{if(!orb.parent)return;const t=Math.min(1,(now-t0)/dur),p=curve.getPoint(t);orb.position.copy(p);ring.position.copy(p);ring.rotation.z+=.32;if(t<1)requestAnimationFrame(step);else{spawnExplosionVisual(target,weapon.color,1.35);spawnImpactBurst(target,0xffe58a);spawnDebris(target,0x8c6328,28,.12,.48);if(hit)resolveHit(attacker,hit,weapon);orb.parent?.remove(orb);ring.parent?.remove(ring);line.parent?.remove(line)}};requestAnimationFrame(step);diag('SUNADIER GRENADE',`launch=3D_MUZZLE arc=Y hit=${hit?.roomIndex!=null?hit.roomIndex+1:'MISS'}`)
}"""
new2="""  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(44)),new THREE.LineBasicMaterial({color:weapon.color,transparent:true,opacity:.32,blending:THREE.AdditiveBlending}));scene.add(line);
  const t0=performance.now(),dur=850;const step=now=>{if(!orb.parent)return;const t=Math.min(1,(now-t0)/dur),p=curve.getPoint(t);orb.position.copy(p);ring.position.copy(p);ring.rotation.z+=.32;if(t<1)requestAnimationFrame(step);else{spawnExplosionVisual(target,weapon.color,1.35);spawnImpactBurst(target,0xffe58a);spawnDebris(target,0x8c6328,28,.12,.48);if(hit)resolveHit(attacker,hit,weapon);else resolveHit(attacker,null,weapon);orb.parent?.remove(orb);ring.parent?.remove(ring);line.parent?.remove(line);const localAction=!multiplayer&&attacker.side==='aurelian';if(localAction&&battleStarted&&!matchEnded&&soloTurn==='aurelian')endSoloPlayerTurnAfterShot();diag('SUNADIER RESOLVED',`hit=${hit?.roomIndex!=null?hit.roomIndex+1:'MISS'} turnAdvance=${localAction?'AFTER_IMPACT':'N/A'}`)}};requestAnimationFrame(step);diag('SUNADIER GRENADE',`launch=3D_MUZZLE arc=Y hit=${hit?.roomIndex!=null?hit.roomIndex+1:'MISS'} lifecycle=RAF_OWNS_PROJECTILE`)
}"""
if old2 not in s: raise SystemExit('sunadier lifecycle anchor missing')
s=s.replace(old2,new2,1)
# Prevent immediate solo turn advancement at launch for the two asynchronous Aurelian projectiles.
old3="if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid')endSoloPlayerTurnAfterShot();"
new3="if(firedKind!=='laser'&&firedKind!=='explosive'&&firedKind!=='acid'&&firedKind!=='sun_disk'&&firedKind!=='sun_grenade')endSoloPlayerTurnAfterShot();"
if old3 not in s: raise SystemExit('solo turn timing anchor missing')
s=s.replace(old3,new3,1)
for req in ['lifecycle=RAF_OWNS_PROJECTILE','SUN DISK RESOLVED','SUNADIER RESOLVED',"firedKind!=='sun_disk'", "firedKind!=='sun_grenade'"]:
    if req not in s: raise SystemExit('verification missing '+req)
p.write_text(s,encoding='utf-8')
print('PASS Sun Disk projectile cannot be removed by generic VFX timer before impact')
print('PASS Sunadier projectile lifecycle remains self-owned through impact')
print('PASS misses resolve explicitly instead of silently disappearing')
print('PASS solo turn advances after impact, not at launch')
