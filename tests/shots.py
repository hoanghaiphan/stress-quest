import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1366,'height':900})
        await pg.goto('file:///workspace/stress-quest/stress-quest.html')
        for lid in ['w1l1','w1l3','w1l4','w2l1','w2l3','w2l4','w2l5','w3l2','w3l3','w3l4','w3l5','boss']:
            await pg.evaluate(f'document.getElementById("modalRoot").innerHTML="";STORE.unlockAll=true;startLevel(LEVELS.find(l=>l.id==="{lid}"))')
            if lid=='w1l1': await pg.evaluate('(()=>{const r=document.querySelector(".levelwrap input[type=range]");r.value=700;r.dispatchEvent(new Event("input"))})()')
            await pg.screenshot(path=f's_{lid}.png')
        await pg.evaluate('openLevel("w1l2")'); await pg.screenshot(path='s_concept.png')
        await b.close()
asyncio.run(main())
