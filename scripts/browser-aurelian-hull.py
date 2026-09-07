from pathlib import Path
from urllib.parse import urlparse
import json, io, os, shutil, mimetypes
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(os.environ.get('AC_HULL_ROOT','/mnt/data/ac-hull-work')); SOURCE=Path(os.environ.get('AC_HULL_SOURCE',str(ROOT/'source'))); OUT=ROOT/'test-output'; OUT.mkdir(exist_ok=True)
html=(OUT/'compiled.html').read_text()
hook=r'''
window.__hullReview={
  get:()=>({phase:gameFlowPhase,battleStarted,xrayOpen,soloTurn,round:soloRound,rooms:aure.userData?.rooms?.length,crew:aWarriors.filter(w=>w.active).map(w=>({weapon:w.weaponKey,room:w.roomIndex,hp:w.hp})),panels:factionSkinA?.userData?.acCutawayBayPanels?.map(p=>({name:p.name,visible:p.visible})),draws:renderer.info.render.calls,tris:renderer.info.render.triangles,diag:diagLines.slice(-18)}),
  start:()=>{musicEnabled=false;saveStorySeen();if(storyActive)endStoryIntro();multiplayer=false;localSide='aurelian';showFactionSelect();chooseFaction('aurelian');showCharacterSelect();continueToDeployment(null);[0,1,2].forEach((room,i)=>placeWarriorInSlot(i,room));startBattle(null);for(const id of ['homeOverlay','titleScreen','ndaOverlay','mpLobby','factionOverlay','characterOverlay','deployOverlay']){const e=document.getElementById(id);if(e){e.classList.remove('show');e.classList.add('hidden');e.style.display='none'}}return gameFlowPhase},
  open:()=>openPrivateXray('browser regression'),close:()=>closePrivateXray('browser regression'),
  cycle:()=>{for(let i=0;i<5;i++){closePrivateXray('browser cycle');openPrivateXray('browser cycle')}return xrayRoomVisuals.length},
  select:(index)=>{const v=xrayRoomVisuals.find(v=>v.warrior?.active&&v.warrior.hp>0&&v.index===index);if(!v)return false;selectXrayCrew(v.warrior);return true},
  seal:(progress)=>{const w=xrayRoomVisuals.find(v=>v.warrior?.active&&v.warrior.hp>0)?.warrior;if(!w)return false;acDirectorApplyAimSeal(w,progress);return {closed:xrayRoomVisuals.filter(v=>v.exteriorPanel?.visible).length,exhaust:factionSkinA.getObjectByName('AURELIAN_CANON_EXHAUST_CLUSTER').visible}},
  inspect:()=>({crew:xrayRoomVisuals.filter(v=>v.warrior).map(v=>({index:v.index,room:v.warrior.roomIndex,visible:v.rig3D?.visible,p:v.standAnchor?.getWorldPosition(new THREE.Vector3()).toArray()})),exhaust:!!factionSkinA.getObjectByName('AURELIAN_CANON_EXHAUST_CLUSTER'),cockpitParent:factionSkinA.getObjectByName('AURELIAN_CANON_COCKPIT')?.parent?.name,cannonParent:factionSkinA.getObjectByName('AURELIAN_CANON_SOLAR_CANNON_ART')?.parent?.name}),
  aimState:()=>({aiming,shots,soloTurn,round:soloRound,selected:selected?.weaponKey,mode:acDirector.mode,closed:xrayRoomVisuals.filter(v=>v.exteriorPanel?.visible).length,origin:aimOriginWorld?.toArray(),beamOrigin:acDirector.origin?.toArray(),events:diagLines.filter(x=>/AIM RELEASE| FIRE |DIRECTOR BEAM|TURN VFX RELEASE|SOLO HANDOFF/.test(x))}),
  pressPoint:()=>{const v=xrayRoomVisuals.find(v=>v.warrior?.weaponKey==='solar_lancer');return v?worldToStage(v.standAnchor.getWorldPosition(new THREE.Vector3())):null},
  screenshot:()=>{renderer.render(scene,camera)},
  rigBounds:()=>xrayRoomVisuals.filter(v=>v.warrior).map(v=>({index:v.index,r:objectScreenRect(v.rig3D,0)})),
  canvasRect:()=>{const r=renderer.domElement.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}}
};
'''
html=html.replace("try{if(bootState){bootState.textContent='SYSTEM READY",hook+"\ntry{if(bootState){bootState.textContent='SYSTEM READY")
(OUT/'browser.html').write_text(html)
buf=io.BytesIO();Image.new('RGBA',(8,8),(190,190,190,255)).save(buf,format='PNG');placeholder=buf.getvalue()
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_BIN') or shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1280,'height':820},device_scale_factor=1)
    errors=[];console=[];placeholder_assets=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('console',lambda msg:console.append(msg.type+': '+msg.text) if msg.type=='error' else None)
    def handle(route):
        url=urlparse(route.request.url); name=url.path
        if url.hostname=='cdn.jsdelivr.net' and '/three@0.179.1/' in name:
            fp=ROOT/'vendor/node_modules/three'/name.split('/three@0.179.1/',1)[1]
            if fp.is_file():route.fulfill(status=200,content_type='application/javascript',body=fp.read_bytes());return
        if name=='/' or name=='/index.html':route.fulfill(status=200,content_type='text/html',body=html);return
        if name.startswith('/api/'):
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'accepted':True,'version':'1.0','name':'local test'}));return
        fp=SOURCE/name.lstrip('/')
        if fp.is_file():route.fulfill(status=200,content_type=mimetypes.guess_type(name)[0] or 'application/octet-stream',body=fp.read_bytes());return
        if name.endswith(('.png','.jpeg','.jpg','.webp','.svg','.gif','.ico')):placeholder_assets.append(name);route.fulfill(status=200,content_type='image/png',body=placeholder);return
        route.fulfill(status=204,body='')
    page.route('**/*',handle)
    page.goto('http://127.0.0.1:8765/',wait_until='load',timeout=30000)
    
    try: page.wait_for_function('!!window.__hullReview',timeout=15000)
    except Exception:
        print('BOOT ERRORS',errors,console[-10:]);raise
    result={'initial':page.evaluate('window.__hullReview.get()'),'assetNote':'Production source and assets; any missing decorative image fallbacks are listed separately.'}
    result['startPhase']=page.evaluate('window.__hullReview.start()');page.wait_for_timeout(1400)
    result['battle']=page.evaluate('window.__hullReview.get()')
    page.evaluate('window.__hullReview.close()');page.wait_for_timeout(900)
    assert page.locator('#storyIntro').evaluate("e=>!e.classList.contains('show')"), 'Intro still covers render'
    page.locator('#stageShell').screenshot(path=str(OUT/'exterior-render.png'))
    page.evaluate('window.__hullReview.open()');page.wait_for_timeout(1300)
    result['cutaway']=page.evaluate('window.__hullReview.inspect()')
    page.locator('#stageShell').screenshot(path=str(OUT/'cutaway-render.png'))
    result['cycledBays']=page.evaluate('window.__hullReview.cycle()');page.wait_for_timeout(200)
    result['seal']=page.evaluate('window.__hullReview.seal(1)')
    page.evaluate('window.__hullReview.close()');page.evaluate('window.__hullReview.open()');page.wait_for_timeout(600)
    point=page.evaluate('window.__hullReview.pressPoint()');rect=page.evaluate('window.__hullReview.canvasRect()')
    assert point, 'Solar Lancer cannot be selected'
    x=rect['x']+point['x']*rect['w']/1280;y=rect['y']+point['y']*rect['h']/720
    page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+18,y-2,steps=2);page.wait_for_timeout(250)
    page.mouse.move(min(rect['x']+rect['w']-15,x+540),max(rect['y']+20,y-150),steps=12);page.wait_for_timeout(1100)
    result['aim']=page.evaluate('window.__hullReview.aimState()')
    page.locator('#stageShell').screenshot(path=str(OUT/'aim-render.png'))
    page.mouse.up();page.wait_for_timeout(150)
    result['release']=page.evaluate('window.__hullReview.aimState()')
    (OUT/'browser-report.json').write_text(json.dumps(result,indent=2))
    page.wait_for_function("window.__hullReview.aimState().round>=2 && window.__hullReview.aimState().soloTurn==='aurelian'",timeout=60000)
    result['nextTurn']=page.evaluate('window.__hullReview.aimState()')
    result['placeholderAssets']=placeholder_assets;result['errors']=errors;result['consoleErrors']=console[-10:]
    (OUT/'browser-report.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result,indent=2))
    browser.close()
    assert result['battle']['battleStarted'], 'Battle did not start'
    assert len(result['cutaway']['crew'])==3, 'Missing visible crew'
    assert result['cycledBays']==6, 'Cutaway did not rebuild all bays'
    assert result['seal']['closed']==5 and result['seal']['exhaust'], 'Seal/exhaust failure'
    assert result['aim']['aiming'] and result['aim']['selected']=='solar_lancer', 'Pointer aiming failed'
    assert result['release']['shots']==result['aim']['shots']+1, 'Release did not fire exactly once'
    assert result['nextTurn']['round']==2, 'Turn advanced incorrectly'
    assert all(v['visible'] for v in result['cutaway']['crew']), 'Crew not visible'
    assert not errors, 'JavaScript runtime errors: '+str(errors)
