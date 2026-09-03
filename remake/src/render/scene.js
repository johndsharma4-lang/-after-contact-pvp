import * as THREE from 'three';
import {buildShip3D,buildWarrior3D,roomPosition} from './builders.js';

export function createBattleScene(container,state){
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x02060d);
  const camera=new THREE.PerspectiveCamera(38,1,.1,500);camera.position.set(0,7,43);camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;container.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xbfd8ff,0x090b0f,1.35));const key=new THREE.DirectionalLight(0xffffff,3.4);key.position.set(-14,24,20);key.castShadow=true;scene.add(key);const rim=new THREE.DirectionalLight(0xffcb68,2.0);rim.position.set(18,8,-14);scene.add(rim);

  const shipA=buildShip3D('aurelian'),shipE=buildShip3D('earth');shipA.position.x=-13.5;shipE.position.x=13.5;shipA.rotation.y=.08;shipE.rotation.y=-.08;scene.add(shipA,shipE);
  const visuals=new Map();

  function ensureWarriorVisual(sideId,w){
    let entry=visuals.get(w.id);
    if(!entry||entry.profileId!==w.profileId){
      if(entry?.root)entry.root.parent?.remove(entry.root);
      const root=buildWarrior3D(w.profileId);root.scale.setScalar(.72);(sideId==='aurelian'?shipA:shipE).add(root);entry={root,profileId:w.profileId};visuals.set(w.id,entry);
    }
    const p=roomPosition(w.roomIndex);entry.root.position.set(p.x,p.y-.35,2.45);entry.root.visible=w.alive;entry.root.userData.warriorId=w.id;return entry;
  }

  function sync(){
    for(const [sideId,side] of Object.entries(state.sides))for(const w of side.warriors){
      const e=ensureWarriorVisual(sideId,w),selected=state.selectedWarriorId===w.id;
      e.root.scale.setScalar(selected ? .84 : .72);
      e.root.traverse(o=>{if(o.isMesh&&o.material?.emissive){o.material.emissiveIntensity=selected?Math.max(.8,o.material.emissiveIntensity||0):Math.min(.75,o.material.emissiveIntensity||0)}})
    }
  }

  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function pickWarrior(clientX,clientY){
    const rect=renderer.domElement.getBoundingClientRect();pointer.x=((clientX-rect.left)/rect.width)*2-1;pointer.y=-((clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects([...visuals.values()].map(v=>v.root),true);for(const hit of hits){let o=hit.object;while(o&&!o.userData?.warriorId)o=o.parent;if(o?.userData?.warriorId)return o.userData.warriorId}return null;
  }

  function resize(){const w=container.clientWidth||innerWidth,h=container.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  addEventListener('resize',resize);resize();
  let raf=0;function frame(){sync();renderer.render(scene,camera);raf=requestAnimationFrame(frame)}frame();
  return{scene,camera,renderer,pickWarrior,sync,destroy(){cancelAnimationFrame(raf);removeEventListener('resize',resize);renderer.dispose();renderer.domElement.remove()}};
}
