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
