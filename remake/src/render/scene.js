import * as THREE from 'three';
import {buildShip3D,buildWarrior3D,roomPosition} from './builders.js';

export function createBattleScene(container,state){
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x02060d);
  const camera=new THREE.PerspectiveCamera(38,1,.1,500);camera.position.set(0,7,43);camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;container.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xbfd8ff,0x090b0f,1.35));const key=new THREE.DirectionalLight(0xffffff,3.4);key.position.set(-14,24,20);key.castShadow=true;scene.add(key);const rim=new THREE.DirectionalLight(0xffcb68,2.0);rim.position.set(18,8,-14);scene.add(rim);

  const shipA=buildShip3D('aurelian'),shipE=buildShip3D('earth');shipA.position.x=-13.5;shipE.position.x=13.5;shipA.rotation.y=.08;shipE.rotation.y=-.08;scene.add(shipA,shipE);
  const shipForSide=id=>id==='aurelian'?shipA:shipE;
  const visuals=new Map(),fx=[];

  for(const [sideId,ship] of [['aurelian',shipA],['earth',shipE]])for(const room of ship.userData.rooms){
    room.userData.sideId=sideId;room.userData.roomIndex=room.userData.index;
    room.traverse(o=>{o.userData.sideId=sideId;o.userData.roomIndex=room.userData.index});
  }

  function ensureWarriorVisual(sideId,w){
    let entry=visuals.get(w.id);
    if(!entry||entry.profileId!==w.profileId){
      if(entry?.root)entry.root.parent?.remove(entry.root);
      const root=buildWarrior3D(w.profileId);root.scale.setScalar(.72);shipForSide(sideId).add(root);entry={root,profileId:w.profileId};visuals.set(w.id,entry);
    }
    const p=roomPosition(w.roomIndex);entry.root.position.set(p.x,p.y-.35,2.45);entry.root.visible=w.alive;entry.root.userData.warriorId=w.id;return entry;
  }

  function syncShip(sideId){
    const side=state.sides[sideId],ship=shipForSide(sideId);
    for(let i=0;i<side.rooms.length;i++){
      const roomState=side.rooms[i],room=ship.userData.rooms[i],targeted=state.target?.sideId===sideId&&state.target?.roomIndex===i;
      const open=targeted||side.warriors.some(w=>w.alive&&w.roomIndex===i&&(state.selectedWarriorId===w.id));
      room.userData.front.visible=!open;
      room.userData.frame.material.emissiveIntensity=targeted?1.8:.55;
      room.userData.frame.material.color.setHex(targeted?0xfff0a8:(sideId==='aurelian'?0xe0ad3a:0x6eb7d8));
      room.userData.cavity.material.color.setHex(roomState.erased?0x010102:roomState.breach>=75?0x120505:roomState.breach>=35?0x21120d:(sideId==='aurelian'?0x231910:0x161d22));
      const k=Math.max(.18,roomState.armor/100);room.userData.front.scale.set(1,k,k);
    }
  }

  function sync(){
    syncShip('aurelian');syncShip('earth');
    for(const [sideId,side] of Object.entries(state.sides))for(const w of side.warriors){
      const e=ensureWarriorVisual(sideId,w),selected=state.selectedWarriorId===w.id;
      e.root.scale.setScalar(selected ? .84 : .72);
      e.root.traverse(o=>{if(o.isMesh&&o.material?.emissive){o.material.emissiveIntensity=selected?Math.max(.8,o.material.emissiveIntensity||0):Math.min(.75,o.material.emissiveIntensity||0)}})
    }
  }

  function roomWorld(sideId,roomIndex,z=2.5){const ship=shipForSide(sideId),p=roomPosition(roomIndex).clone();p.z=z;return ship.localToWorld(p)}
  function muzzleWorld(attackerId){const entry=visuals.get(attackerId);if(!entry)return null;const muzzle=entry.root.userData.muzzle||entry.root;return muzzle.getWorldPosition(new THREE.Vector3())}

  function playWeapon(result){
    if(!result?.ok)return;const start=muzzleWorld(result.attackerId),end=roomWorld(result.targetSide,result.roomIndex,2.7);if(!start||!end)return;
    const color=result.weapon.kind==='beam'?0xffdd69:result.weapon.kind==='disk'?0xffbd4a:result.weapon.kind==='arc'?0xff8d32:0x74d9ff;
    if(result.weapon.kind==='beam'||result.weapon.kind==='precision'){
      const geo=new THREE.BufferGeometry().setFromPoints([start,end]),line=new THREE.Line(geo,new THREE.LineBasicMaterial({color,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthTest:false}));scene.add(line);fx.push({objects:[line],life:.18,max:.18});
    }else{
      const orb=new THREE.Mesh(result.weapon.kind==='disk'?new THREE.CylinderGeometry(.34,.34,.08,20):new THREE.SphereGeometry(.22,12,10),new THREE.MeshBasicMaterial({color,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthTest:false}));if(result.weapon.kind==='disk')orb.rotation.x=Math.PI/2;orb.position.copy(start);scene.add(orb);fx.push({objects:[orb],life:.52,max:.52,start:start.clone(),end:end.clone(),projectile:true,arc:result.weapon.kind==='arc'});
    }
    const flash=new THREE.Mesh(new THREE.SphereGeometry(.46,12,8),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthTest:false}));flash.position.copy(end);scene.add(flash);fx.push({objects:[flash],life:.28,max:.28});
  }

  function updateFx(dt){for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.life-=dt;const t=1-Math.max(0,f.life)/f.max;if(f.projectile){const p=f.start.clone().lerp(f.end,t);if(f.arc)p.y+=Math.sin(Math.PI*t)*4;f.objects[0].position.copy(p)}for(const o of f.objects)if(o.material)o.material.opacity=Math.max(0,f.life/f.max);if(f.life<=0){for(const o of f.objects)o.parent?.remove(o);fx.splice(i,1)}}}

  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function setPointer(clientX,clientY){const rect=renderer.domElement.getBoundingClientRect();pointer.x=((clientX-rect.left)/rect.width)*2-1;pointer.y=-((clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera)}
  function pickWarrior(clientX,clientY){setPointer(clientX,clientY);const hits=raycaster.intersectObjects([...visuals.values()].map(v=>v.root),true);for(const hit of hits){let o=hit.object;while(o&&!o.userData?.warriorId)o=o.parent;if(o?.userData?.warriorId)return o.userData.warriorId}return null}
  function pickRoom(clientX,clientY){setPointer(clientX,clientY);const hits=raycaster.intersectObjects([shipA,shipE],true);for(const hit of hits){let o=hit.object;while(o&&(!Number.isInteger(o.userData?.roomIndex)||!o.userData?.sideId))o=o.parent;if(o&&Number.isInteger(o.userData.roomIndex)&&o.userData.sideId)return{sideId:o.userData.sideId,roomIndex:o.userData.roomIndex}}return null}

  function resize(){const w=container.clientWidth||innerWidth,h=container.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  addEventListener('resize',resize);resize();
  let raf=0,last=performance.now();function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;sync();updateFx(dt);renderer.render(scene,camera);raf=requestAnimationFrame(frame)}raf=requestAnimationFrame(frame);
  return{scene,camera,renderer,pickWarrior,pickRoom,playWeapon,sync,destroy(){cancelAnimationFrame(raf);removeEventListener('resize',resize);renderer.dispose();renderer.domElement.remove()}};
}
