# Screenshots for the learning layer: home/path, mentor intro in a case, hint ladder, skills map, lesson, unit check
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
from learn import CASE_STEP, HTML
OUT=sys.argv[1] if len(sys.argv)>1 else '/workspace/stress-quest'
with sync_playwright() as p:
  br=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  pg=br.new_page(viewport={'width':1400,'height':1000})
  pg.on('dialog',lambda d:d.accept())
  pg.goto(HTML);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(300)
  pg.screenshot(path=f'{OUT}/welcome.png')
  pg.evaluate("$('#modalRoot').innerHTML=''")
  # some progress
  pg.evaluate("""()=>{STORE.lessons={stress:{seen:true,done:true,best:100},sf:{seen:true,done:true,best:67},mat:{seen:true,done:true,best:100}};
    STORE.cases.i1={best:92,stars:3,rank:'Principal Engineer'};
    Object.assign(STORE.skills,{stress:{m:72,n:9,box:2,due:0,last:Date.now()},sf:{m:58,n:6,box:1,due:0,last:Date.now()},mat:{m:41,n:4,box:1,due:Date.now()+9e7,last:Date.now()},bend:{m:12,n:2,box:0,due:0,last:Date.now()}});save();showMap();}""")
  pg.wait_for_timeout(300);pg.screenshot(path=f'{OUT}/home_path.png')
  pg.screenshot(path=f'{OUT}/home_path_full.png',full_page=True)
  pg.evaluate("showSkills()");pg.wait_for_timeout(200);pg.screenshot(path=f'{OUT}/skills_map.png',full_page=True)
  pg.evaluate("openLesson('bend')");pg.wait_for_timeout(200);pg.screenshot(path=f'{OUT}/lesson_bend.png',full_page=True)
  # mentor intro inside a case (teach-before-test): i2, fresh skill 'bend' not yet seen
  pg.evaluate("startCase(CASES.find(c=>c.id==='i2'))");pg.wait_for_timeout(200)
  for k in range(30):
    if pg.evaluate("!!document.querySelector('#caseSide .mentorcheck')"):break
    pg.evaluate(CASE_STEP,'best')
  pg.evaluate("document.querySelector('#caseSide .mentorcheck button').click()");pg.wait_for_timeout(100)
  pg.screenshot(path=f'{OUT}/mentor_intro.png',full_page=True)
  # hint ladder in use: c1 compute step with all three hints (Engineer data shown inline is too dense -> use learner)
  pg.evaluate("STORE.lessons=Object.fromEntries(SKILL_ORDER.map(k=>[k,{seen:true,done:true}]));save();startCase(CASES.find(c=>c.id==='i1'))")
  for k in range(30):
    if pg.evaluate("CASE_CUR.K.steps[CASE_CUR.st.idx].title")=='Stress in M8' and pg.evaluate("!!document.querySelector('#caseSide .ansrow input')"):break
    pg.evaluate(CASE_STEP,'best')
  for k in range(3):pg.click('#caseSide .hintbtn');pg.wait_for_timeout(80)
  pg.evaluate("""()=>{const i=document.querySelector('#caseSide .ansrow input');i.value=String(CASE_CUR.K.steps[CASE_CUR.st.idx].ans*1e6);document.querySelector('#caseSide .ansrow button.pri').click();}""")
  pg.wait_for_timeout(150);pg.evaluate("calcOpen(document.querySelector('#caseSide .ansrow input'));$('#calcIn').value='3924/36.6';$('#calcIn').dispatchEvent(new Event('input'));$('#calc').style.right='auto';$('#calc').style.left='70px';")
  pg.wait_for_timeout(2900)
  pg.screenshot(path=f'{OUT}/hint_ladder.png',full_page=False)
  sh=pg.evaluate("document.querySelector('#caseSide').getBoundingClientRect().toJSON()")
  pg.screenshot(path=f'{OUT}/hint_ladder_full.png',full_page=True)
  br.close()
print('ok')
