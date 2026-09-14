import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {pathToFileURL,fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),vendor=process.env.AC_HULL_VENDOR||path.resolve(root,'../vendor/node_modules');
const THREE=await import(pathToFileURL(path.join(vendor,'three/build/three.module.js'))),raw=fs.readFileSync(path.join(root,'index.html'),'utf8'),router=fs.readFileSync(path.join(root,'router-worker.js'),'utf8'),imports=new Map([...router.matchAll(/import \{ (\w+) \} from '\.\/([^']+)';/g)].map(m=>[m[1],m[2]]));
let full=raw;for(const [,name] of router.matchAll(/html=(patch\w+)\((?:rawHtml|html)\)/g)){const file=imports.get(name);assert.ok(file,name);const module=await import(pathToFileURL(path.join(root,file)));full=module[name](full)}
const start=full.indexOf('function acAurelianShape('),end=full.indexOf('const factionStandards=',start);assert.ok(start>=0&&end>start);
const box=(w,h,d,c,metalness=.5,roughness=.5)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,metalness,roughness})),ctx=vm.createContext({THREE,box});vm.runInContext(full.slice(start,end),ctx);
const mat=(color,metalness=.5,roughness=.5,emissive=0)=>new THREE.MeshStandardMaterial({color,metalness,roughness,emissive}),skin=new THREE.Group(),legacy=box(10,10,2,0xffffff);skin.add(legacy);ctx.buildEarthDirectorFortress(skin,5,mat);skin.updateMatrixWorld(true);
assert.equal(legacy.visible,false);assert.equal(skin.userData.acCutawayBayPanels.length,6);assert.equal(skin.userData.acCutawayBayLayout.length,6);assert.equal(new Set(skin.userData.acCutawayBayPanels).size,6);
assert.deepEqual(Array.from(skin.userData.acCutawayBayLayout,r=>r.role),['COMMAND_CENTER','MISSILE_ARMORY','FIRE_CONTROL','BARRACKS','ENGINEERING','FORTRESS_CANNON']);
const cannon=skin.getObjectByName('EARTH_FORTRESS_HEAVY_CANNON');assert.equal(cannon.parent,skin.userData.acCutawayBayPanels[5]);
function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))yes=!yes}return yes}
const ray=new THREE.Raycaster();let samples=0;for(const s of skin.userData.acCutawayBayLayout)for(let x=-s.w*.36;x<=s.w*.36;x+=.58)for(let y=-s.h*.34;y<=s.h*.34;y+=.50){if(!inside([x,y],s.points.map(p=>[p[0]*.80,p[1]*.80])))continue;ray.set(new THREE.Vector3(s.x+x,s.y+y,30),new THREE.Vector3(0,0,-1));const hits=ray.intersectObject(skin.userData.acPrimaryHull,true).filter(h=>h.point.z>2);assert.equal(hits.length,0,'Earth armor blocks bay '+s.index+' at '+[x,y]+' by '+hits.map(h=>h.object.name));samples++}
console.log('PASS Earth has exactly six physical compartments, six removable exterior modules, six military roles, and '+samples+' clear aperture rays');
