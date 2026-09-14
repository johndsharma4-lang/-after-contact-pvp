import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {pathToFileURL,fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const vendor=process.env.AC_HULL_VENDOR||path.resolve(root,'../vendor/node_modules');
const THREE=await import(pathToFileURL(path.join(vendor,'three/build/three.module.js')));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const start=html.indexOf('function buildEarthRebuiltBase('),end=html.indexOf('function buildCutawayOnlyWarrior3D(',start);
assert.ok(start>=0&&end>start,'Earth rebuilt model block exists');
const ctx=vm.createContext({THREE});vm.runInContext(html.slice(start,end),ctx);
const specs=[['Bombardier','buildEarthBombardierBattle3D','HE9_HEAVY_LAUNCHER'],['Sniper','buildEarthSniperBattle3D','M96_LONG_RIFLE'],['Combat Controller','buildEarthControllerBattle3D','TAC_LINK_COMMAND_PACK']];
const roots=[];
for(const [label,factory,equipment] of specs){
  const model=ctx[factory]();roots.push(model);model.updateMatrixWorld(true);assert.equal(model.userData.modelFidelity,'EARTH_REBUILT_CANON_HIGH',label+' fidelity');assert.ok(model.getObjectByName(equipment),label+' unique equipment');assert.ok(model.userData.muzzle,label+' live muzzle');
  const rig=model.userData.rig;for(const key of['pelvis','torso','head','shoulders','armL','armR','elbowL','elbowR','hipL','hipR','kneeL','kneeR','weapon'])assert.ok(rig[key],label+' '+key);
  let meshes=0,vertices=0;model.traverse(o=>{if(!o.isMesh)return;meshes++;vertices+=o.geometry.attributes.position.count});assert.ok(meshes>=30,label+' layered mesh count');assert.ok(vertices>=1200,label+' geometry detail');
  const size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());assert.ok(size.y>3.1&&size.x>1.2,label+' readable silhouette');console.log('PASS '+label+' articulated high-detail rig meshes='+meshes+' vertices='+vertices);
}
assert.equal(roots.length,3);assert.equal(new Set(roots.map(r=>r.name)).size,3);console.log('PASS exactly three distinct Earth warrior factories with live weapon origins');
