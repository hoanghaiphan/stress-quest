import sys, json, random
from playwright.sync_api import sync_playwright
HTML='file:///workspace/stress-quest/stress-quest.html'
ROUNDS=int(sys.argv[1]) if len(sys.argv)>1 else 3
JS_STEP=r"""
(mode)=>{
 const txt=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent.trim();};
 if(!CASE_CUR){return {done:true,debrief:!!document.querySelector('.debrief'),score:document.querySelector('.debrief h3')?.textContent};}
 const {K,st}=CASE_CUR;const side=document.querySelector('#caseSide');
 const cont=[...side.querySelectorAll('button.btn.pri')].find(b=>/Continue|Close the case/.test(b.textContent));
 if(cont){cont.click();return {act:'continue'};}
 const s=K.steps[st.idx];
 const pickMode=mode==='mixed'?(Math.random()<0.5?'best':'wrong'):mode;
 if(s.type==='decide'||s.type==='final'){const opts=VV(s.opts,st);let o;
   if(pickMode==='best')o=opts.reduce((a,b)=>b.q>a.q?b:a);else if(pickMode==='wrong')o=opts.reduce((a,b)=>b.q<a.q?b:a);else o=opts[Math.floor(Math.random()*opts.length)];
   const want=txt(VV(o.t,st));const b=[...side.querySelectorAll('.choices button')].find(x=>x.textContent.trim()===want);
   if(!b)return {err:'no button for '+want+' in '+s.title};b.click();return {act:'choose',q:o.q,title:s.title};}
 if(s.type==='request'){const labels=[...side.querySelectorAll('.req label')];
   s.items.forEach(it=>{const t=txt(it.t);const l=labels.find(x=>x.textContent.trim().startsWith(t));if(!l)throw new Error('no label '+t);
     const on=pickMode==='best'?it.v===1:pickMode==='wrong'?true:Math.random()<0.5;l.querySelector('input').checked=on;});
   [...side.querySelectorAll('button')].find(b=>b.textContent==='Send request').click();return {act:'request'};}
 if(s.type==='compute'){const a=VV(s.ans,st);if(!isFinite(a))return {err:'non-finite answer in '+s.title+': '+a};
   const inp=side.querySelector('.ansrow input');const b=side.querySelector('.ansrow button');
   inp.value=pickMode==='best'?String(a):String(a*3+7);b.click();
   if(!inp.disabled){inp.value=pickMode==='best'?String(a):String(a*5+11);b.click();}
   if(!inp.disabled)return {err:'compute did not close '+s.title};
   if(pickMode==='best'&&!side.querySelector('.fb.ok'))return {err:'exact answer rejected in '+s.title+' ans='+a};
   return {act:'compute',a};}
 return {err:'stuck at step '+st.idx+' type '+s.type};
}"""
def main():
  global ROUNDS
  errors=[];fails=[]
  with sync_playwright() as p:
    br=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=br.new_page(viewport={'width':1400,'height':1000})
    pg.on('console',lambda m: errors.append(m.text) if m.type=='error' else None)
    pg.on('pageerror',lambda e: errors.append(str(e)))
    pg.on('dialog',lambda d:d.accept())
    pg.goto(HTML);pg.wait_for_timeout(300)
    pg.evaluate("document.querySelectorAll('.modal-bg,.modal').forEach(m=>m.remove())")
    pg.evaluate("setMode('engineer')")  # classic engineer-mode auto-play; learner mode is covered by learn.py
    ids=pg.evaluate("CASES.map(c=>c.id)");print('cases',ids)
    res={}
    for cid in ids:
      for mode in ['best','wrong','mixed','random']:
        for r in range(ROUNDS):
          pg.evaluate("id=>startCase(CASES.find(c=>c.id===id))",cid)
          for k in range(80):
            out=pg.evaluate(JS_STEP,mode)
            if out.get('err'):fails.append((cid,mode,r,out['err']));break
            if out.get('done'):
              if not out.get('debrief'):fails.append((cid,mode,r,'no debrief'))
              res.setdefault((cid,mode),[]).append(out.get('score','').split('%')[0].replace('Case score: ',''))
              break
          else: fails.append((cid,mode,r,'loop limit'))
          # click concept buttons exist?
    # check refresher buttons/levels exist for all refs and concepts
    bad=pg.evaluate("""()=>{const out=[];CASES.forEach(c=>{const K=c.build();K.steps.forEach(s=>{if(s.ref&&!LEVELS.find(l=>l.id===s.ref))out.push(c.id+' ref '+s.ref);});K.debrief.concepts.forEach(([t,id])=>{if(!LEVELS.find(l=>l.id===id))out.push(c.id+' concept '+id);});});return out;}""")
    fails+= [('refs',b) for b in bad]
    # numeric sanity: build each case 200 times, check all compute answers finite & positive where expected
    ns=pg.evaluate("""()=>{const out=[];CASES.forEach(c=>{for(let i=0;i<200;i++){const K=c.build();const st={f:{},m:{s:100,c:100,t:100},K};K.steps.forEach(s=>{if(s.type==='compute'){const a=VV(s.ans,st);if(!isFinite(a))out.push(c.id+' '+s.title+' '+a);}if(s.opts){const o=VV(s.opts,st);if(!o.some(x=>x.q>=0.8))out.push(c.id+' no strong option in '+s.title);}});}});return [...new Set(out)].slice(0,30);}""")
    fails+= [('numeric',b) for b in ns]
    pg.evaluate("showMap()")
    hp=pg.evaluate("document.querySelectorAll('.casecard').length")
    print('home case cards',hp)
    br.close()
  for k,v in res.items():print(k,v)
  print('CONSOLE ERRORS',errors[:10])
  print('FAILS',fails[:30])
  print('RESULT', 'PASS' if not errors and not fails else 'FAIL')

if __name__=='__main__':
  main()
