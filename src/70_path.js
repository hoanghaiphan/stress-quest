/* ===================== LEARNING PATH, LESSONS, SKILLS MAP, REVIEW ===================== */
const PATH=[['lesson','stress'],['lesson','sf'],['case','i1'],['lesson','mat'],['lesson','bend'],['case','i2'],['lesson','stat'],['case','i3'],
 ['lesson','crit'],['case','c2'],['lesson','kt'],['lesson','fat'],['case','c1'],['case','c5'],['lesson','fea'],['lesson','mesh'],['lesson','bc'],['case','c3'],['case','c4'],
 ['lesson','rel'],['case','c7'],['case','c8'],['lesson','weib'],['case','c6'],['lesson','rca'],['case','c10'],['lesson','frac'],['case','c9'],['boss','boss']].map(([t,id],k)=>({t,id,k}));
const CASE_NEEDS={i1:['stress','sf'],i2:['mat','bend'],i3:['stat'],c2:['crit'],c1:['kt','fat'],c5:['fat'],c3:['fea','mesh','bc'],c4:['crit'],c7:['rel'],c8:['stat','mat'],c6:['weib'],c10:['rca'],c9:['frac']};
CASES.sort((a,b)=>PATH.findIndex(n=>n.id===a.id)-PATH.findIndex(n=>n.id===b.id));
const lessonDone=id=>!!(STORE.lessons[id]||{}).done;
const caseDone=id=>(STORE.cases[id]||{}).best!=null;
function nodeTitle(n){return n.t==='lesson'?SKILLS[n.id].name:n.t==='case'?(CASES.find(c=>c.id===n.id)||{}).title:'Failure Review Board';}
function nodeDone(n){return n.t==='lesson'?lessonDone(n.id):n.t==='case'?caseDone(n.id):((STORE.levels.boss||{}).stars>0);}
function nodeUnlocked(n){if(STORE.unlockAll)return true;if(n.t==='boss')return isUnlocked(LEVELS.find(l=>l.id==='boss'));
 const prev=PATH.slice(0,n.k).filter(x=>x.t===n.t);if(n.t==='lesson')return !prev.length||nodeDone(prev[prev.length-1]);
 const needs=(CASE_NEEDS[n.id]||[]).every(lessonDone);return needs&&(!prev.length||nodeDone(prev[prev.length-1]));}
function caseUnlocked(id){const n=PATH.find(x=>x.id===id&&x.t==='case');return n?nodeUnlocked(n):true;}
function lockReason(n){if(n.t==='case'){const miss=(CASE_NEEDS[n.id]||[]).filter(k=>!lessonDone(k)).map(k=>SKILLS[k].name);const prev=PATH.slice(0,n.k).filter(x=>x.t==='case').pop();
  return (miss.length?'Needs the lesson'+(miss.length>1?'s':'')+': '+miss.join(', ')+'. ':'')+(prev&&!nodeDone(prev)?'Close "'+nodeTitle(prev)+'" first. ':'')+'(Or enable "unlock everything" in ⚙.)';}
 if(n.t==='lesson'){const prev=PATH.slice(0,n.k).filter(x=>x.t==='lesson').pop();return 'Finish the lesson "'+nodeTitle(prev)+'" first (or enable "unlock everything" in ⚙).';}
 return 'Unlocks after 6 lessons, 4 cases or stars in 8 training levels.';}
function nextPathNode(){return PATH.find(n=>!nodeDone(n)&&nodeUnlocked(n)&&n.t!=='boss')||null;}
function openPathNode(n){if(!nodeUnlocked(n)){toast('🔒 '+lockReason(n));return;}if(n.t==='lesson')openLesson(n.id);else if(n.t==='case')startCase(CASES.find(c=>c.id===n.id));else openLevel('boss');}
function seenSkills(){return SKILL_ORDER.filter(k=>(STORE.lessons[k]||{}).seen||skillState(k).n>0);}
function practiceNext(){const s=seenSkills().filter(k=>skillState(k).m<90).sort((a,b)=>skillState(a).m-skillState(b).m);return s[0]||null;}
function dueSkills(){const now=Date.now();return seenSkills().filter(k=>{const s=skillState(k);return s.n>0&&(s.due<=now||s.m<50);}).sort((a,b)=>skillState(a).m-skillState(b).m);}

function renderHome(app){
 const nL=SKILL_ORDER.filter(lessonDone).length,nC=CASES.filter(c=>caseDone(c.id)).length;const nx=nextPathNode();const pn=practiceNext();const due=dueSkills();
 const w=el('div',{class:'welcome'});app.appendChild(w);
 w.appendChild(el('div',{style:'font-size:56px;line-height:1'},'🦉'));
 const mid=el('div',{style:'flex:1;min-width:280px'},`<h2 style="margin:0 0 4px">${nL+nC===0?'Welcome to Stress Quest!':'Welcome back, engineer!'}</h2><p style="margin:0 0 8px">I'm <b>Ada</b>, your mentor. We'll learn strength, FEA and failure statistics step by step: short lessons with everyday examples, then real engineering cases where <i>you</i> make the call. No prior knowledge needed.</p>
  <div class="small mut">📗 Lessons ${nL}/${SKILL_ORDER.length} · 📁 Cases ${nC}/${CASES.length} · ★ Training ${totalStars()}/${LEVELS.length*3}</div><div class="prog" style="max-width:420px"><i style="width:${100*(nL+nC)/(SKILL_ORDER.length+CASES.length)}%"></i></div>`);w.appendChild(mid);
 const rt=el('div',{style:'display:flex;flex-direction:column;gap:8px;min-width:230px'});w.appendChild(rt);
 if(nx){const b=el('button',{class:'btn pri',id:'continueBtn',style:'font-size:15px;padding:10px 16px'},`▶ ${nL+nC===0?'Start':'Continue'}: ${nx.t==='lesson'?'📗':'📁'} ${nodeTitle(nx)}`);b.onclick=()=>openPathNode(nx);rt.appendChild(b);}
 else rt.appendChild(el('div',{class:'small'},'🏆 Path complete! Try the optional Review Board or replay cases in Expert mode.'));
 if(pn){const b=el('button',{class:'btn'},`🎯 Practice next: ${SKILLS[pn].icon} ${SKILLS[pn].name}`);b.onclick=()=>startPractice([pn],5,'Practice: '+SKILLS[pn].name);rt.appendChild(b);}
 if(due.length){const b=el('button',{class:'btn',id:'reviewBtn'},`🔁 Review (${due.length} skill${due.length>1?'s':''} due)`);b.onclick=startReview;rt.appendChild(b);}
 const mp=el('div',{class:'small mut'},'Difficulty: ');mp.appendChild(modePicker(showMap));rt.appendChild(mp);
 app.appendChild(el('div',{class:'sechead',id:'path'},'<h2>🧭 Learning path</h2><span class="small mut">Lessons 📗 teach a concept with an everyday example; cases 📁 put it to work on a real problem. Hover or tap dotted words for a definition.</span>'));
 const g=el('div',{class:'path'});app.appendChild(g);
 PATH.forEach(n=>{const done=nodeDone(n),un=nodeUnlocked(n),isNext=nx&&n===nx;const ic=n.t==='lesson'?SKILLS[n.id].icon:n.t==='case'?(CASES.find(c=>c.id===n.id)||{}).icon:'🐉';
  const sub=n.t==='lesson'?SKILLS[n.id].short:n.t==='case'?((STORE.cases[n.id]||{}).best!=null?'best '+STORE.cases[n.id].best+'% '+'★'.repeat(STORE.cases[n.id].stars||0):'case · '+'●'.repeat((CASES.find(c=>c.id===n.id)||{}).level||1)):'optional challenge';
  const d=el('div',{class:`pnode ${n.t}${done?' done':''}${un?'':' locked'}${isNext?' next':''}`,'data-node':n.t+':'+n.id},`<div class="pi">${done?'✓':un?n.k+1:'🔒'}</div><div class="k">${n.t==='lesson'?'📗 Lesson':n.t==='case'?'📁 Case':'🐉 Boss'} ${ic||''}</div><b>${nodeTitle(n)}</b><div class="small mut">${sub}</div>`);
  d.onclick=()=>openPathNode(n);g.appendChild(d);});
 renderCaseHome(app);renderTraining(app);}

function openLesson(id){cleanup();CUR_LEVEL=null;const S=SKILLS[id];const app=$('#app');app.innerHTML='';window.scrollTo(0,0);
 const head=el('div',{class:'lvhead'});head.appendChild(el('button',{class:'btn sm',onclick:showMap},'◀ Home'));head.appendChild(el('h2',null,`📗 Lesson: ${S.icon} ${S.name}`));
 head.appendChild(el('button',{class:'btn sm',onclick:showSkills},'🧠 Skills map'));app.appendChild(head);
 const wrap=el('div',{class:'levelwrap'});const left=el('div',{class:'card',id:'lessonCard'}),right=el('div',{class:'card',id:'lessonPractice'});wrap.append(left,right);app.appendChild(wrap);
 right.appendChild(el('div',{class:'steptitle'},'Practice'));right.appendChild(el('p',{class:'mut'},'Read Ada\'s explanation and answer the quick check first – then three practice questions appear here. Hints are on the 💡 button, the calculator on 🧮.'));
 if(S.levels&&S.levels.length){const r=el('div',{class:'row small'},'Want more? Training: ');S.levels.forEach(l=>{const L=LEVELS.find(x=>x.id===l);if(L)r.appendChild(el('button',{class:'btn sm',onclick:()=>openLevel(l)},L.title));});right.appendChild(r);}
 mentorBlock(left,S,()=>startLessonPractice(id,right),{intro:`Hi, I'm Ada! 👋 This lesson is about <b>${S.name}</b>. Read it at your own pace – the dotted words explain themselves when you hover or tap.`,btn:'Great – let\'s practise ▶'});}
function startLessonPractice(id,box){const S=SKILLS[id];box.innerHTML='';box.appendChild(el('div',{class:'steptitle'},'Practice · 3 questions'));const tb=el('div');box.appendChild(tb);
 runTasks(tb,skillTasks(id,3),score=>{const prev=STORE.lessons[id]||{};STORE.lessons[id]=Object.assign(prev,{seen:true,done:true,best:Math.max(prev.best||0,score)});save();updHeader();celebrate();
  const nx=nextPathNode();const m=skillState(id).m;
  modal(`<div class="results"><h2>Lesson complete! 🎉</h2>${mentorHTML(score>=67?'Excellent – you\'ve got the idea. Now let\'s use it on something real.':'Well done for working through it! Mistakes are how we learn – the next case will practise it again, and hints are always there.')}<p>Practice score: <b>${score}%</b></p><p>${S.icon} ${S.name}: <b>${masteryName(m)}</b> (${m}%)</p></div>`,
   [{t:'Back to the path',fn:showMap},...(nx?[{t:'Next: '+nodeTitle(nx)+' ▶',pri:true,fn:()=>openPathNode(nx)}]:[])]);},{sk:id,finishLabel:'Finish lesson ✔'});}

function startPractice(ids,n,title){cleanup();CUR_LEVEL=null;const app=$('#app');app.innerHTML='';window.scrollTo(0,0);
 const head=el('div',{class:'lvhead'});head.appendChild(el('button',{class:'btn sm',onclick:showMap},'◀ Home'));head.appendChild(el('h2',null,'🎯 '+title));head.appendChild(el('button',{class:'btn sm',onclick:showSkills},'🧠 Skills map'));app.appendChild(head);
 const wrap=el('div',{class:'levelwrap'});const left=el('div',{class:'card'}),right=el('div',{class:'card'});wrap.append(left,right);app.appendChild(wrap);
 left.appendChild(el('div',null,mentorHTML(ids.length>1?'Quick review! Short questions on the skills that are due or still a bit shaky. Spaced repetition makes knowledge stick.':`Let's strengthen <b>${SKILLS[ids[0]].name}</b>. Need a reminder first? Open the formula card below.`)));
 ids.forEach(k=>left.appendChild(el('div',{class:'formula'},`${SKILLS[k].icon} <b>${SKILLS[k].name}:</b> ${SKILLS[k].formula}`)));
 left.appendChild(el('div',{class:'row',style:'margin-top:8px'},''));ids.forEach(k=>left.lastChild.appendChild(el('button',{class:'btn sm',onclick:()=>openLesson(k)},'📗 Lesson: '+SKILLS[k].name)));
 const tasks=[];for(let i=0;i<n;i++){const k=ids[i%ids.length];tasks.push(skillTasks(k,1)[0]);}
 runTasks(right,shuffle(tasks),score=>{celebrate();modal(`<div class="results"><h2>${score>=80?'Superb! 🏆':score>=50?'Nice work! 👍':'Good effort! 🌱'}</h2><p>Score: <b>${score}%</b></p>${ids.map(k=>{const m=skillState(k).m;return `<div style="text-align:left;margin:6px 0">${SKILLS[k].icon} ${SKILLS[k].name}<div class="mbar"><i style="width:${m}%;background:${masteryCol(m)}"></i></div><span class="lvlname">${masteryName(m)} · ${m}%</span></div>`;}).join('')}</div>`,
  [{t:'Skills map',fn:showSkills},{t:'Back to the path',pri:true,fn:showMap}]);},{finishLabel:'Finish ✔'});}
function startReview(){let ids=dueSkills();if(!ids.length)ids=seenSkills().sort((a,b)=>skillState(a).m-skillState(b).m);if(!ids.length)ids=['stress'];startPractice(ids.slice(0,4),5,'Review session');}

function showSkills(){cleanup();CUR_LEVEL=null;updHeader();const app=$('#app');app.innerHTML='';window.scrollTo(0,0);
 const head=el('div',{class:'lvhead'});head.appendChild(el('button',{class:'btn sm',onclick:showMap},'◀ Home'));head.appendChild(el('h2',null,'🧠 Skills map'));app.appendChild(head);
 const pn=practiceNext(),due=dueSkills();const avg=Math.round(mean(SKILL_ORDER.map(k=>skillState(k).m)));
 const top=el('div',{class:'welcome',id:'skillTop'});top.appendChild(el('div',{style:'font-size:48px'},'🦉'));
 top.appendChild(el('div',{style:'flex:1;min-width:260px'},`<b>Overall mastery: ${avg}%</b><div class="mbar" style="max-width:420px"><i style="width:${avg}%;background:linear-gradient(90deg,var(--w1),var(--w2),var(--w3))"></i></div><div class="small">${pn?`My suggestion: practise <b>${SKILLS[pn].icon} ${SKILLS[pn].name}</b> next (${skillState(pn).m}%).`:'Start with the first lesson on the learning path – your skills will grow here as you answer questions.'}${due.length?` · ${due.length} skill${due.length>1?'s are':' is'} due for review.`:''}</div><div class="small mut">Mastery grows with every correct answer in lessons, cases, training and reviews. Levels: New → Learning → Practising (40 %) → Proficient (70 %) → Mastered (90 %).</div>`));
 const rr=el('div',{class:'row'});if(pn)rr.appendChild(el('button',{class:'btn pri',onclick:()=>startPractice([pn],5,'Practice: '+SKILLS[pn].name)},'🎯 Practice '+SKILLS[pn].name));if(due.length||seenSkills().length)rr.appendChild(el('button',{class:'btn',onclick:startReview},'🔁 Review session'));top.appendChild(rr);app.appendChild(top);
 const g=el('div',{class:'skillgrid'});app.appendChild(g);
 SKILL_ORDER.forEach(k=>{const S=SKILLS[k],s=skillState(k);const isDue=due.includes(k);
  const c=el('div',{class:'skill','data-skill':k},`<div class="row" style="justify-content:space-between"><h3>${S.icon} ${S.name}</h3>${isDue?'<span class="tag" style="color:#ffb74d">due</span>':''}</div><div class="small mut">${S.short}</div><div class="mbar"><i style="width:${s.m}%;background:${masteryCol(s.m)}"></i></div><div class="lvlname">${masteryName(s.m)} · ${s.m}% · ${s.n} answer${s.n===1?'':'s'}${lessonDone(k)?' · 📗 lesson done':''}</div>`);
  const r=el('div',{class:'row',style:'margin-top:8px'});r.appendChild(el('button',{class:'btn sm',onclick:()=>openLesson(k)},'📗 Lesson'));r.appendChild(el('button',{class:'btn sm',onclick:()=>startPractice([k],5,'Practice: '+S.name)},'🎯 Practice'));
  (S.levels||[]).forEach(l=>{const L=LEVELS.find(x=>x.id===l);if(L)r.appendChild(el('button',{class:'btn sm',title:'Training level',onclick:()=>openLevel(l)},'🏋 '+L.title));});c.appendChild(r);g.appendChild(c);});}
