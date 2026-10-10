import asyncio, re, sys
from playwright.async_api import async_playwright
URL='file:///workspace/stress-quest/stress-quest.html'
import os
WRONG=bool(os.environ.get('WRONG'))
ROUNDS=int(sys.argv[1]) if len(sys.argv)>1 else 3
import math
async def cv_drag(pg,x1,y1,x2,y2,W=680):
    bb=await (await pg.query_selector('.levelwrap canvas')).bounding_box(); sc=bb['width']/W
    await pg.mouse.move(bb['x']+x1*sc,bb['y']+y1*sc); await pg.mouse.down()
    await pg.mouse.move(bb['x']+(x1+x2)/2*sc,bb['y']+(y1+y2)/2*sc); await pg.mouse.move(bb['x']+x2*sc,bb['y']+y2*sc); await pg.mouse.up()
async def set_range(pg,idx,val):
    await pg.evaluate('([i,v])=>{const r=document.querySelectorAll(".levelwrap input[type=range]")[i];r.value=v;r.dispatchEvent(new Event("input"))}',[idx,val])
async def simtext(pg): return await pg.inner_text('.levelwrap > .card:first-child')
async def solve_action(pg,lid,ti):
    T=await simtext(pg)
    if lid=='w1l2' and ti==3:
        m=re.search(r'σx = (-?\d+) MPa, σy = (-?\d+) MPa, τxy = (-?\d+)',T); sx,sy,t=map(float,m.groups())
        th=0.5*math.degrees(math.atan2(2*t,sx-sy)); await set_range(pg,3,round(th*2)/2)
    if lid=='w1l4' and ti==0:
        L=float(re.search(r'L = ([\d.]+) m',T).group(1)); ss='Simply' in T
        await cv_drag(pg,200,50,295 if ss else 519.5,50)
    if lid=='w1l4' and ti==3:
        sa=float(re.search(r'σallow = (\d+)',T.replace('\n',' ').replace('σ\nallow','σallow')).group(1)) if re.search(r'σallow = (\d+)',T) else None
        rows=await pg.query_selector_all('tr[data-i]'); best=None
        for r in rows:
            c=[x.strip() for x in (await r.inner_text()).split('\t')]
            mass=float(c[2].replace(',','')); sg=float(c[4].replace(',',''))
            if sg<=sa and (best is None or mass<best[0]): best=(mass,r)
        await best[1].click()
    if lid=='w2l1' and ti==1:
        cells=await pg.query_selector_all('.mat > div'); vals=[await c.inner_text() for c in cells]
        for r in range(1,5):
            row=vals[r*5+1:r*5+5]; nz=sum(1 for k,v in enumerate(row) if k!=r-1 and v.strip()!='0')
            if nz==1: hd=await pg.query_selector_all('.mat > div'); await hd[r*5].click()
    if lid=='w2l2' and ti==1:
        for k in range(4): await pg.click('text=+ Refine (h/2)')
    if lid=='w2l3' and ti==2:
        await cv_drag(pg,390+270*(0.1/2.2),30+200*(3.5/6.5),390+270*(0.1/2.2),60)
    if lid=='w3l1' and ti==1:
        ts=[float(x.replace(',','')) for x in re.search(r't \(h\)\t(.*)',T).group(1).split('\t')]
        n=len(ts); F=[(i+1-0.3)/(n+0.4) for i in range(n)]; X=[math.log(v) for v in ts]; Y=[math.log(-math.log(1-f)) for f in F]
        mx=sum(X)/n; my=sum(Y)/n; b=sum((x-mx)*(y-my) for x,y in zip(X,Y))/sum((x-mx)**2 for x in X); a=my-b*mx
        xr=[math.floor(math.log10(ts[0])*2)/2*math.log(10)-0.2, math.ceil(math.log10(ts[-1])*2)/2*math.log(10)+0.2]
        yr=[math.log(-math.log(0.99)),math.log(-math.log(0.01))]
        PX=lambda v:70+(v-xr[0])/(xr[1]-xr[0])*420; PY=lambda v:20+340-(v-yr[0])/(yr[1]-yr[0])*340
        for frac,y0,yt in [(0.25,-3,-2.5),(0.75,-2.2,0.8)]:
            x=xr[0]+frac*(xr[1]-xr[0]); xt=min(max((yt-a)/b,xr[0]+0.05),xr[1]-0.05); yt=a+b*xt; await cv_drag(pg,PX(x),PY(y0),PX(xt),PY(yt))
    if lid=='w3l2' and ti==2:
        beta=float(re.search(r'β = ([\d.]+)',T).group(1)); eta=float(re.search(r'η = (\d+)',T).group(1))
        q=await pg.inner_text('.task .q'); tgt=float(re.search(r'R = ([\d.]+)',q).group(1).rstrip('.')); await set_range(pg,0,eta*(-math.log(tgt))**(1/beta))
    if lid=='w3l3' and ti==2:
        muL=float(re.search(r'μ\s*L\s*= (\d+)',T).group(1)); sL=float(re.search(r'σ\s*L\s*= (\d+)',T).group(1))
        q=await pg.inner_text('.task .q'); Rt=float(re.search(r'R ≥ ([\d.]+)',q).group(1)); zt=float(re.search(r'z ≥ ([\d.]+)',q).group(1))
        best=None
        for m in range(int(muL),int(muL)+401,5):
            for sd in range(8,61):
                if (m-muL)/math.hypot(sd,sL)>=zt+1e-3:
                    c=0.1*m+400/sd
                    if best is None or c<best[0]: best=(c,m,sd)
        await set_range(pg,0,best[1]); await set_range(pg,1,best[2])
    if lid=='w3l5' and ti==2:
        pool={'Man':['Operator not trained on the new torque procedure','Inspector fatigue on night shift'],'Machine':['Worn cutting tool not replaced','Spindle runout out of tolerance'],'Method':['Work instruction omits tempering step','Clamping sequence not specified'],'Material':['Bar stock with sulphide inclusions from new supplier','Wrong alloy delivered (mix-up)'],'Measurement':['Torque wrench out of calibration','Gauge R&R of 45 %'],'Mother Nature':['High humidity in paint shop','Temperature swings in the hall overnight']}
        inv={t:c for c,l in pool.items() for t in l}
        rows=await pg.query_selector_all('.levelwrap .row:has(select)')
        for r in rows:
            t=(await (await r.query_selector('span')).inner_text()).strip(); await (await r.query_selector('select')).select_option(inv[t])

async def main():
    errs=[]; report=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1366,'height':900})
        pg.on('console',lambda m: errs.append('console.'+m.type+': '+m.text) if m.type in('error','warning') else None)
        pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(300)
        await pg.screenshot(path='/workspace/stress-quest/test/intro.png')
        await pg.click('#modalRoot .btn.pri')
        await pg.evaluate("m=>setMode(m)", os.environ.get('SQ_MODE','learner'))
        await pg.screenshot(path='/workspace/stress-quest/map.png',full_page=True)
        ids=await pg.evaluate('LEVELS.map(l=>l.id)')
        for rnd in range(ROUNDS):
          for lid in ids:
            await pg.evaluate(f'STORE.unlockAll=true;startLevel(LEVELS.find(l=>l.id==="{lid}"))')
            n=await pg.evaluate('CURRENT.tasks.length'); okc=0; stuck=False
            for ti in range(n):
                t=await pg.evaluate(f'(()=>{{const t=CURRENT.tasks[{ti}];return {{type:t.type,tries:t.tries||2}}}})()')
                side='.levelwrap > .card:nth-child(2)'
                if t['type']=='num':
                    a=await pg.evaluate(f'(()=>{{const t=CURRENT.tasks[{ti}];return typeof t.ans==="function"?t.ans():t.ans}})()')
                    if WRONG:
                        await pg.fill(side+' input','98765'); await pg.click(side+' .ansrow .btn.pri'); await pg.fill(side+' input','-0.001'); await pg.click(side+' .ansrow .btn.pri')
                    else:
                        await pg.fill(side+' input',repr(a)); await pg.click(side+' .ansrow .btn.pri')
                elif t['type']=='choice':
                    oks=await pg.evaluate(f'CURRENT.tasks[{ti}].opts.filter(o=>o.ok).map(o=>o.t)')
                    btns=await pg.query_selector_all(side+' .choices .btn')
                    if WRONG:
                        oks=['__none__']
                        for bt in btns:
                            if not await bt.is_disabled(): await bt.click()
                    want=await pg.evaluate('(h)=>{const d=document.createElement("div");d.innerHTML=h;return d.textContent.trim()}',oks[0])
                    for bt in btns:
                        if (await bt.text_content()).strip() == want: await bt.click(); break
                    else: report.append(f'{lid} t{ti}: choice text not matched')
                else:
                    # special interactive solvers
                    if lid=='w2l1' and ti==0:
                        chips=await pg.query_selector_all('.chip')
                        for k in range(len(chips)):
                            chips=await pg.query_selector_all('.chip'); txt=await chips[k].inner_text()
                            m=re.search(r'nodes (\d)–(\d)',txt); i,j=int(m.group(1)),int(m.group(2))
                            await chips[k].click()
                            for (r,c) in [(i,i),(i,j),(j,i),(j,j)]:
                                cells=await pg.query_selector_all('.mat > div'); await cells[r*5+c].click()
                    await solve_action(pg,lid,ti)
                    if lid=='w3l5' and ti==0:
                        while True:
                            chips=await pg.query_selector_all('.chip:not(.done)')
                            if not chips: break
                            best=None;bv=-1
                            for c in chips:
                                v=int((await c.inner_text()).split(':')[1]);
                                if v>bv: bv=v;best=c
                            await best.click()
                    if lid=='w3l5' and ti==2:
                        await pg.evaluate('0')
                    for k in range(3):
                        nxt=await pg.query_selector(side+' .row .btn.pri')
                        if nxt: break
                        await pg.click(side+' .task .btn.pri')
                await pg.wait_for_timeout(30)
                fb=await pg.query_selector(side+' .fb')
                cls=await fb.get_attribute('class'); txtfb=(await fb.inner_text())[:160]
                if 'ok' in cls: okc+=1
                else: report.append(f'{lid} t{ti} {t["type"]}: NOT OK -> {txtfb}')
                nxt=await pg.query_selector(side+' .row .btn.pri')
                if not nxt:
                    # numeric/choice second try fallback
                    await pg.click(side+' .task .btn:not([disabled])') if await pg.query_selector(side+' .task .btn:not([disabled])') else None
                    nxt=await pg.query_selector(side+' .row .btn.pri')
                if not nxt: report.append(f'{lid} t{ti}: STUCK'); stuck=True; break
                if rnd==0 and ((lid=='w1l2' and ti==3) or (lid=='w3l1' and ti==3) or (lid=='w1l5' and ti==2) or (lid=='w2l2' and ti==1)):
                    await pg.screenshot(path=f'/workspace/stress-quest/{lid}.png',full_page=True)
                await nxt.click()
            if not stuck:
                await pg.wait_for_timeout(50)
                res=await pg.inner_text('#modalRoot')
                report.append(f'round{rnd} {lid}: {okc}/{n} ok | '+res.replace("\n"," ")[:60])
                await pg.evaluate('document.getElementById("modalRoot").innerHTML=""')
        await pg.evaluate('showGlossary()'); await pg.screenshot(path='/workspace/stress-quest/test/glossary.png',full_page=True)
        await pg.evaluate('showMap()'); await pg.screenshot(path='/workspace/stress-quest/map.png',full_page=True)
        pm=await b.new_page(viewport={'width':390,'height':844}); await pm.goto(URL); await pm.evaluate('document.getElementById("modalRoot").innerHTML="";STORE.unlockAll=true;startLevel(LEVELS.find(l=>l.id==="w1l4"))'); await pm.screenshot(path='/workspace/stress-quest/test/mobile_beam.png',full_page=True)
        await b.close()
    print('\n'.join(report)); print('ERRORS:',len(errs)); print('\n'.join(errs[:40]))
asyncio.run(main())
