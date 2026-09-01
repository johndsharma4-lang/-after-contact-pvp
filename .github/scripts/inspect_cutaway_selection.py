from pathlib import Path
s=Path('index.html').read_text(encoding='utf-8').splitlines()
terms=['warriorCutaway','selectedWarrior','xrayOpen','setSelectedWarrior','selectHud','EXIT CUTAWAY','cutaway','setWarriorObjectsVisible','updateUnitVisuals','sprite.visible']
hits=[]
for i,line in enumerate(s):
    low=line.lower()
    if any(t.lower() in low for t in terms): hits.append(i)
ranges=[]
for i in hits:
    a=max(0,i-14);b=min(len(s),i+22)
    if ranges and a<=ranges[-1][1]+3:ranges[-1]=(ranges[-1][0],max(ranges[-1][1],b))
    else:ranges.append((a,b))
out=[]
for a,b in ranges:
    out.append(f'--- LINES {a+1}-{b} ---')
    out.extend(f'{j+1}: {s[j]}' for j in range(a,b))
Path('cutaway-selection-diagnostic.txt').write_text('\n'.join(out),encoding='utf-8')
print('WROTE',len(out),'lines')
