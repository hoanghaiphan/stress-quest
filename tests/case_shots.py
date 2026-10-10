# Screenshots of the new home and two cases (mid-investigation + debrief)
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
from cases import JS_STEP, HTML
OUT=sys.argv[1] if len(sys.argv)>1 else '/workspace/stress-quest'
with sync_playwright() as p:
  br=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  pg=br.new_page(viewport={'width':1400,'height':1000})
  pg.on('dialog',lambda d:d.accept())
  pg.goto(HTML);pg.wait_for_timeout(300)
  pg.evaluate("document.querySelectorAll('.modal-bg,.modal').forEach(m=>m.remove())")
  # give some progress for nicer home
  pg.evaluate("STORE.cases.c2={best:100,stars:3,rank:'Principal Engineer'};STORE.cases.c5={best:74,stars:2,rank:'Engineer'};save();showMap()")
  pg.wait_for_timeout(200);pg.screenshot(path=f'{OUT}/home.png',full_page=False)
  pg.screenshot(path=f'{OUT}/home_full.png',full_page=True)
  def play(cid,nsteps,mode,shot):
    pg.evaluate("id=>startCase(CASES.find(c=>c.id===id))",cid)
    n=0
    while n<nsteps:
      o=pg.evaluate(JS_STEP,mode)
      if o.get('act')!='continue':n+=1
    pg.wait_for_timeout(200);pg.screenshot(path=f'{OUT}/{shot}.png',full_page=True)
    for k in range(80):
      o=pg.evaluate(JS_STEP,mode)
      if o.get('done'):break
    pg.wait_for_timeout(200);pg.screenshot(path=f'{OUT}/{shot}_debrief.png',full_page=True)
  play('c1',3,'best','case_c1')
  play('c3',2,'best','case_c3')
  play('c8',3,'wrong','case_c8')
  br.close()
print('ok')
