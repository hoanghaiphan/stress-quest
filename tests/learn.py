"""Novice-path test suite for the learning layer (Playwright, headless Chromium).
Covers: all lessons (mentor check + practice with hints), all cases in Learner / Engineer / Expert mode on
best, wrong and 'novice' (hints + first answer wrong + multiple-choice rescue) paths, unit-mistake detection,
skills map, review session, boss in every mode, and zero console errors."""
import sys, json
from playwright.sync_api import sync_playwright
HTML='file:///workspace/stress-quest/stress-quest.html'
ROUNDS=int(sys.argv[1]) if len(sys.argv)>1 else 2
CASE_STEP=r"""
(mode)=>{
 const txt=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent.trim();};
 if(!CASE_CUR){return {done:true,debrief:!!document.querySelector('.debrief'),score:document.querySelector('.debrief h3')?.textContent};}
 const {K,st}=CASE_CUR;const side=document.querySelector('#caseSide');
 // mentor teach-before-test block
 const mc=side.querySelector('.mentorcheck');
 if(mc){const got=[...side.querySelectorAll('button.btn.pri')].find(b=>/back to the case/.test(b.textContent));if(got){got.click();return {act:'mentor-done'};}
   const S=Object.values(SKILLS).find(S=>[...mc.children].some(b=>b.textContent.trim()===txt(S.check.opts[0].t))&&[...mc.children].length===S.check.opts.length);
   const okT=txt(S.check.opts.find(o=>o.ok).t);const wrongT=txt(S.check.opts.find(o=>!o.ok).t);
   const live=[...mc.children].filter(b=>!b.disabled);
   const target=(mode==='novice'&&live.length===S.check.opts.length)?wrongT:okT;live.find(b=>b.textContent.trim()===target).click();return {act:'mentor-check'};}
 const cont=[...side.querySelectorAll('button.btn.pri')].find(b=>/Continue|Close the case/.test(b.textContent));
 if(cont){cont.click();return {act:'continue'};}
 const s=K.steps[st.idx];
 if(mode==='novice'){const hb=side.querySelector('.hintbtn');if(hb){hb.click();return {act:'hint'};}}
 const pickMode=mode==='novice'?'best':mode==='mixed'?(Math.random()<0.5?'best':'wrong'):mode;
 if(s.type==='decide'||s.type==='final'){const opts=VV(s.opts,st);let o;
   if(pickMode==='best')o=opts.reduce((a,b)=>b.q>a.q?b:a);else o=opts.reduce((a,b)=>b.q<a.q?b:a);
   const want=txt(VV(o.t,st));const b=[...side.querySelectorAll('.choices button')].find(x=>x.textContent.trim()===want);
   if(!b)return {err:'no button for '+want+' in '+s.title};if(b.disabled)return {err:'best option struck by hints in '+s.title};b.click();return {act:'choose',q:o.q};}
 if(s.type==='request'){const labels=[...side.querySelectorAll('.req label')];
   s.items.forEach(it=>{const t=txt(it.t);const l=labels.find(x=>x.textContent.trim().startsWith(t));if(!l)throw new Error('no label '+t);
     l.querySelector('input').checked=pickMode==='best'?it.v===1:true;});
   [...side.querySelectorAll('button')].find(b=>b.textContent==='Send request').click();return {act:'request'};}
 if(s.type==='compute'){const a=VV(s.ans,st);if(!isFinite(a))return {err:'non-finite answer in '+s.title};
   const inp=side.querySelector('.ansrow input');const b=side.querySelector('.ansrow button.pri');
   if(mode==='novice'){inp.value=String(a*3+50+3*Math.abs(a));b.click();const mcb=[...side.querySelectorAll('button.mc')];
     if(isLearner()){if(!mcb.length)return {err:'no MC rescue in '+s.title};let best=null,bd=1e99;mcb.forEach(x=>{const v=parseFloat(x.textContent.replace(/,/g,''));const d=Math.abs(v-a)/Math.max(1e-12,Math.abs(a));if(d<bd){bd=d;best=x;}});best.click();
       if(!side.querySelector('.fb.ok'))return {err:'MC rescue did not accept correct value in '+s.title+' a='+a+' opts='+mcb.map(x=>x.textContent).join('|')};return {act:'mc'};}
     if(!inp.disabled){inp.value=String(a);b.click();}return {act:'compute-2nd'};}
   inp.value=pickMode==='best'?String(a):String(a*3+7);b.click();
   if(!inp.disabled){inp.value=pickMode==='best'?String(a):String(a*5+11);b.click();}
   if(!inp.disabled)return {err:'compute did not close '+s.title};
   if(pickMode==='best'&&!side.querySelector('.fb.ok'))return {err:'exact answer rejected in '+s.title+' ans='+a};
   return {act:'compute'};}
 return {err:'stuck at step '+st.idx+' type '+s.type};
}"""
TASK_STEP=r"""
(mode)=>{ // drives runTasks UIs (lesson practice / review / boss) – box = the card containing .task
 const task=document.querySelector('.task');if(!task)return {none:true};
 const box=task.parentElement;
 const nxt=[...box.querySelectorAll('button.btn.pri')].find(b=>/Next task|Finish/.test(b.textContent));if(nxt){nxt.click();return {act:'next'};}
 if(mode==='novice'){const hb=box.querySelector('.hintbtn');if(hb){hb.click();return {act:'hint'};}}
 const T=window.__TASKS||null;
 const inp=task.querySelector('.ansrow input');
 if(inp){const a=window.__ANS();if(mode==='novice'&&!task.dataset.miss){task.dataset.miss=1;inp.value=String(a*3+50+3*Math.abs(a));task.querySelector('.ansrow button.pri').click();
    const mcb=[...task.querySelectorAll('.mcrow button')];if(mcb.length){let best=null,bd=1e99;mcb.forEach(x=>{const v=parseFloat(x.textContent.replace(/,/g,''));const d=Math.abs(v-a)/Math.max(1e-12,Math.abs(a));if(d<bd){bd=d;best=x;}});best.click();return {act:'mc'};}return {act:'miss'};}
   inp.value=String(a);task.querySelector('.ansrow button.pri').click();return {act:'num'};}
 const ch=[...task.querySelectorAll('.choices button')].filter(b=>!b.disabled);
 if(ch.length){const okT=window.__OK();const b=ch.find(x=>x.textContent.trim()===okT)||ch[0];b.click();return {act:'choice'};}
 return {err:'unknown task'};
}"""
def main():
    errors=[];fails=[];log=[]
    def F(*a):fails.append(a);print('FAIL',*a)
    with sync_playwright() as p:
      br=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
      pg=br.new_page(viewport={'width':1400,'height':1000})
      pg.on('console',lambda m: errors.append(m.text) if m.type=='error' else None)
      pg.on('pageerror',lambda e: errors.append(str(e)))
      pg.on('dialog',lambda d:d.accept())
      pg.goto(HTML);pg.wait_for_timeout(300)
      pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(300)
      assert pg.evaluate("MODE()")=='learner', 'default mode must be learner'
      pg.evaluate("$('#modalRoot').innerHTML=''")
      # instrument runTasks so the test can read the current task's answer
      pg.evaluate("""(()=>{const _rt=runTasks;window.__cur=null;
        window.__ANS=()=>{const t=window.__cur;return typeof t.ans==='function'?t.ans():t.ans;};
        window.__OK=()=>{const t=window.__cur;const d=document.createElement('div');d.innerHTML=t.opts.find(o=>o.ok).t;return d.textContent.trim();};})()""")
      # we hook via a MutationObserver-free approach: patch runTasks by wrapping tasks' onShow
      pg.evaluate("""(()=>{const _rt=runTasks;runTasks=function(box,tasks,fin,opt){tasks.forEach(t=>{const o=t.onShow;t.onShow=function(){window.__cur=t;if(o)o.apply(this,arguments);};});return _rt(box,tasks,fin,opt);};})()""")
      # unit-mistake detection checks (pure judge)
      um=pg.evaluate("""()=>{const r=[];const J=(v,a,u)=>judgeSmart(v,a,{unit:u,tol:0.02});
        r.push(['Pa',J(63.7e6,63.7,'MPa').msg]);r.push(['kN',J(0.0637,63.7,'MPa').msg]);r.push(['kg',J(50,490.5,'N').msg]);r.push(['m',J(0.028,28,'mm').msg]);
        r.push(['frac',J(0.33,33,'%').msg]);r.push(['d/r',J(4*12.5,12.5,'MPa').msg]);r.push(['sign',J(-12,12,'MPa').msg]);r.push(['ok5%',J(104,100,'MPa').ok]);r.push(['expr',parseAnswer('5000/(pi*10^2/4)')]);return r;}""")
      log.append(('unit-judge',um))
      exp={'Pa':'Pa','kN':'kN','kg':'mass','m':'metres','frac':'fraction','d/r':'factor of 4','sign':'sign'}
      for k,m in um:
        if k in exp and exp[k].lower() not in str(m).lower():F('unit msg',k,m)
      if um[7][1] is not True:F('learner 5% tolerance')
      if abs(um[8][1]-63.662)>0.01:F('expression parser',um[8][1])
      # --- lessons (novice path: wrong mini-check first, hints, MC rescue) ---
      skills=pg.evaluate("SKILL_ORDER")
      for k in skills:
        pg.evaluate("k=>openLesson(k)",k)
        for it in range(60):
          st=pg.evaluate("""()=>{const mc=document.querySelector('#lessonCard .mentorcheck');const go=[...document.querySelectorAll('#lessonCard button.btn.pri')].find(b=>/practise/.test(b.textContent));if(go){go.click();return 'go';}
            const S=SKILLS[document.querySelector('#lessonCard')?'%s':''];const txt=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent.trim();};
            const live=[...mc.children].filter(b=>!b.disabled);const wrong=S.check.opts.filter(o=>!o.ok).map(o=>txt(o.t));const ok=txt(S.check.opts.find(o=>o.ok).t);
            const b=live.length===S.check.opts.length?live.find(x=>wrong.includes(x.textContent.trim())):live.find(x=>x.textContent.trim()===ok);b.click();return 'check';}"""%k)
          if st=='go':break
        for it in range(80):
          r=pg.evaluate(TASK_STEP,'novice')
          if r.get('err'):F('lesson',k,r);break
          if r.get('none'):F('lesson no task',k);break
          if pg.evaluate("!!document.querySelector('#modalRoot .results')"):break
        else:F('lesson loop',k)
        if not pg.evaluate("k=>STORE.lessons[k]&&STORE.lessons[k].done",k):F('lesson not done',k)
        pg.evaluate("$('#modalRoot').innerHTML=''")
      log.append(('mastery after lessons',pg.evaluate("Object.fromEntries(SKILL_ORDER.map(k=>[k,skillState(k).m]))")))
      # --- skills map & review ---
      pg.evaluate("showSkills()");n=pg.evaluate("document.querySelectorAll('.skill').length")
      if n!=len(skills):F('skills map cards',n)
      pg.evaluate("startReview()")
      for it in range(60):
        r=pg.evaluate(TASK_STEP,'best')
        if r.get('err'):F('review',r);break
        if pg.evaluate("!!document.querySelector('#modalRoot .results')"):break
      else:F('review loop')
      pg.evaluate("$('#modalRoot').innerHTML=''")
      # --- path gating: fresh store, i1 unlocked after its lessons, c1 locked ---
      gate=pg.evaluate("""()=>{const save=JSON.stringify(STORE);STORE.lessons={};STORE.cases={};STORE.unlockAll=false;const a=[caseUnlocked('i1'),caseUnlocked('c1')];STORE.lessons={stress:{done:true},sf:{done:true}};a.push(caseUnlocked('i1'));STORE.unlockAll=true;a.push(caseUnlocked('c9'));STORE=JSON.parse(save);return a;}""")
      if gate!=[False,False,True,True]:F('gating',gate)
      # --- cases in all modes ---
      ids=pg.evaluate("CASES.map(c=>c.id)");res={}
      # reset lesson 'seen' flags so mentor intros appear inside cases in learner mode
      for mode,paths in [('learner',['novice','best','wrong','mixed']),('engineer',['novice','best','wrong']),('expert',['best','wrong'])]:
        pg.evaluate("m=>{setMode(m);STORE.unlockAll=true;}",mode)
        for path in paths:
          for r in range(ROUNDS):
            if mode=='learner' and path=='novice' and r==0:pg.evaluate("STORE.lessons={};save()")
            for cid in ids:
              pg.evaluate("id=>startCase(CASES.find(c=>c.id===id))",cid)
              for k in range(200):
                out=pg.evaluate(CASE_STEP,path)
                if out.get('err'):F(mode,path,cid,out['err']);break
                if out.get('done'):
                  if not out.get('debrief'):F(mode,path,cid,'no debrief')
                  res.setdefault((mode,path),[]).append(int((out.get('score') or '0').split('%')[0].replace('Case score: ','') or 0))
                  break
              else:F(mode,path,cid,'loop limit')
      for k,v in res.items():log.append(('scores',k,min(v),max(v),round(sum(v)/len(v))))
      # unit mistake inside a case (learner): i1 force step, enter mass in kg
      pg.evaluate("setMode('learner')")
      pg.evaluate("startCase(CASES.find(c=>c.id==='i1'))")
      for k in range(20):
        s=pg.evaluate("CASE_CUR.K.steps[CASE_CUR.st.idx].title")
        if s=='Force' and pg.evaluate("!!document.querySelector('#caseSide .ansrow input')"):break
        pg.evaluate(CASE_STEP,'best')
      msg=pg.evaluate("""()=>{const m=CASE_CUR.K.steps[CASE_CUR.st.idx];const kg=CASE_CUR.K.steps[1].ans/9.81;const i=document.querySelector('#caseSide .ansrow input');i.value=String(kg);document.querySelector('#caseSide .ansrow button.pri').click();return document.querySelector('#caseSide .fb').textContent;}""")
      log.append(('in-case unit msg',msg))
      if 'mass' not in msg:F('in-case unit detection',msg)
      # --- numeric sanity with Learner rounding (200 builds per case) ---
      ns=pg.evaluate("""()=>{const out=[];NICE_NUM=true;try{CASES.forEach(c=>{for(let i=0;i<200;i++){const K=c.build();applyCaseMeta(c.id,K);const st={f:{},m:{s:100,c:100,t:100},K};K.steps.forEach(s=>{if(s.type==='compute'){const a=VV(s.ans,st);if(!isFinite(a))out.push(c.id+' '+s.title+' '+a);}if(s.opts){const o=VV(s.opts,st);if(!o.some(x=>x.q>=0.8))out.push(c.id+' no strong option in '+s.title);}});}});}finally{NICE_NUM=false;}return [...new Set(out)].slice(0,30);}""")
      for b in ns:F('numeric(learner)',b)
      # --- boss in each mode ---
      for mode in ['learner','engineer','expert']:
        pg.evaluate("m=>{setMode(m);startLevel(LEVELS.find(l=>l.id==='boss'))}",mode)
        n=pg.evaluate("document.querySelectorAll('.tprog i').length")
        for it in range(80):
          r=pg.evaluate(TASK_STEP,'novice' if mode=='learner' else 'best')
          if r.get('err'):F('boss',mode,r);break
          if pg.evaluate("!!document.querySelector('#modalRoot .results')"):break
        log.append(('boss',mode,n))
        pg.evaluate("$('#modalRoot').innerHTML=''")
      # --- hint ladder in every Training level (learner) ---
      pg.evaluate("setMode('learner')")
      HN=[]
      for lid in pg.evaluate("LEVELS.map(l=>l.id)"):
        pg.evaluate("id=>{STORE.unlockAll=true;startLevel(LEVELS.find(l=>l.id===id))}",lid)
        for k in range(3):
          if pg.evaluate("!!document.querySelector('.hintbtn')"):pg.evaluate("document.querySelector('.hintbtn').click()")
        nh=pg.evaluate("document.querySelectorAll('.hints .hint').length")
        if nh<1:F('training hints',lid,nh)
        HN.append(nh)
      log.append(('training hint ladders',HN))
      # --- tooltips present ---
      pg.evaluate("setMode('learner');openLesson('crit')");pg.wait_for_timeout(200)
      nt=pg.evaluate("document.querySelectorAll('.term').length");log.append(('terms in crit lesson',nt))
      if nt<2:F('tooltips',nt)
      pg.hover('.term');pg.wait_for_timeout(100)
      if not pg.evaluate("getComputedStyle(document.querySelector('#tip')).display!=='none'"):F('tooltip hover')
      pg.evaluate("showMap()");pg.wait_for_timeout(200)
      if pg.evaluate("document.querySelectorAll('.pnode').length")<20:F('path nodes')
      br.close()
    for l in log:print(l)
    print('CONSOLE ERRORS',errors[:10])
    print('FAILS',len(fails))
    print('RESULT','PASS' if not errors and not fails else 'FAIL')

if __name__=='__main__':
    main()
