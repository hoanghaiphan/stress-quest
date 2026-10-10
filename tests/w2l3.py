import asyncio,re
from playwright.async_api import async_playwright
exec(open('solvers.py').read())
SEED='(()=>{let s=12345;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};})()'
async def run(pg,vals=None):
    await pg.evaluate(SEED+';document.getElementById("modalRoot").innerHTML="";STORE.unlockAll=true;startLevel(LEVELS.find(l=>l.id==="w2l3"))')
    for k in range(2):
        a=await pg.evaluate(f'(()=>{{const t=CURRENT.tasks[{k}];return typeof t.ans==="function"?t.ans():t.ans}})()')
        await pg.fill('.task input',repr(a)); await pg.click('.ansrow .btn'); await pg.click('text=Next task')
    if vals:
        PX=lambda xi:390+(xi+1.1)/2.2*270; PY=lambda v:30+200-(v+3)/6.5*200
        for xi,v in zip([-1,0,1],vals): await cv_drag(pg,PX(xi),PY(0),PX(xi),PY(v))
    await pg.click('text=Submit fit')
    if not vals: await pg.click('text=Submit fit')
    return await pg.inner_text('.fb')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1366,'height':900}); await pg.goto('file:///workspace/stress-quest/stress-quest.html')
        r=await run(pg); vals=[float(x) for x in re.search(r'nodal values ([-\d., ]+)',r).group(1).rstrip('.').split(', ')]; print(vals)
        print(await run(pg,vals)); await pg.screenshot(path='s_w2l3_fit.png'); await b.close()
asyncio.run(main())
