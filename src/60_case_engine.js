/* ===================== CASE FILES ENGINE ===================== */
const CASES=[];function defCase(o){CASES.push(o);}
let CASE_CUR=null;
const VV=(x,st)=>typeof x==='function'?x(st):x;
function numJudge(v,t,a){const tol=Math.max((t.tol==null?0.03:t.tol)*Math.abs(a),t.abs||0);
 if(t.logtol){const ok=v*a>0&&Math.abs(Math.log10(Math.abs(v)/Math.abs(a)))<=t.logtol;return{ok,msg:ok?'':`Off by a factor of ${fmt(Math.max(v/a,a/v),2)}.`};}
 if(Math.abs(v-a)<=tol)return{ok:true,msg:''};let m='Not quite.';if(Math.abs(v+a)<=tol)m='Check the sign!';else if(a!==0&&[1e3,1e-3,1e6,1e-6].some(f=>Math.abs(v*f-a)<=tol))m='Off by a power of 1000 – check units!';else if(Math.abs(v-a)<=3*tol)m='Close, but outside the tolerance.';else m+=v>a?' Too high.':' Too low.';return{ok:false,msg:m};}
function renderCaseHome(app){
 const solved=CASES.filter(c=>(STORE.cases[c.id]||{}).best!=null).length;
 app.appendChild(el('div',{class:'casehero',id:'caseFiles',style:'margin-top:26px'},`<div style="font-size:54px">📁</div><div style="flex:1;min-width:260px"><h2>Case Files <span class="tag" style="font-size:12px;vertical-align:middle">Problem-based learning</span></h2><p>Real-world engineering problems. You are the engineer: read the brief, talk to the stakeholder, decide which data to request and which analysis to run, crunch the numbers, and make the call. Decisions move the <b>🛡 safety</b>, <b>💰 budget</b> and <b>⏱ schedule</b> meters – and some lead to field returns months later. Every case ends with a debrief linking back to the lessons, Training levels and the real incidents that inspired it. The three <b>intro cases</b> need no prior knowledge.</p></div><div><div class="small mut">Cases closed: ${solved}/${CASES.length}</div><div class="prog"><i style="width:${100*solved/Math.max(1,CASES.length)}%"></i></div></div>`));
 const g=el('div',{class:'cases'});app.appendChild(g);
 CASES.forEach((c,k)=>{const s=STORE.cases[c.id]||{};const un=typeof caseUnlocked!=='function'||caseUnlocked(c.id);
  const d=el('div',{class:'casecard'+(un?'':' lockcase'),'data-case':c.id},`<div class="ct"><div class="ic">${un?c.icon:'🔒'}</div><div style="flex:1"><div class="small mut">${c.intro?'INTRO CASE':'CASE '+String(k+1).padStart(2,'0')} · ${'●'.repeat(c.level)}${'○'.repeat(3-c.level)}</div><h3>${c.title}</h3></div><div>${starHTML(s.stars||0)}</div></div><p>${c.teaser}</p><div class="row" style="margin-top:2px">${c.domains.map(x=>`<span class="dtag ${x}">${DOMNAME[x]}</span>`).join(' ')}${c.inspired?`<span class="small mut" style="margin-left:auto">inspired by: ${c.inspired}</span>`:''}</div>${s.best!=null?`<div class="small mut">best ${s.best}% · ${s.rank||''}</div>`:''}${un?'':`<div class="small mut">🔒 ${lockReason(PATH.find(n=>n.id===c.id))}</div>`}`);
  d.onclick=()=>{if(un)startCase(c);else toast('🔒 '+lockReason(PATH.find(n=>n.id===c.id)));};g.appendChild(d);});}
const DOMNAME={s:'Strength',f:'FEA',t:'Statistics'};
function caseRank(sc){return sc>=90?'Principal Engineer':sc>=75?'Senior Engineer':sc>=55?'Engineer':'Junior – needs review';}
function startCase(cs){cleanup();const app=$('#app');app.innerHTML='';window.scrollTo(0,0);CUR_LEVEL=null;
 NICE_NUM=isLearner();let K;try{K=cs.build();}finally{NICE_NUM=false;}
 if(typeof applyCaseMeta==='function')applyCaseMeta(cs.id,K);
 const st={f:{},m:{s:100,c:100,t:100},log:[],J:[],A:[],final:null,idx:0,K,hints:0,sks:new Set()};CASE_CUR={cs,K,st};CURRENT={stop(){CASE_CUR=null;}};
 const head=el('div',{class:'lvhead'});head.appendChild(el('button',{class:'btn sm',onclick:()=>{if(st.idx===0||confirm('Abandon this case? Progress in this case will be lost.'))showMap();}},'◀ Home'));
 head.appendChild(el('h2',null,cs.icon+' '+cs.title));cs.domains.forEach(x=>head.appendChild(el('span',{class:'dtag '+x},DOMNAME[x])));
 head.appendChild(el('button',{class:'btn sm',onclick:()=>modal('<h2>📘 Cheat sheet</h2>'+GLOSSARY)},'📘 Formulas'));
 head.appendChild(el('span',{class:'tag',style:'cursor:pointer',title:'Change difficulty (applies from the next case)',onclick:settings},MODES[MODE()].icon+' '+MODES[MODE()].name));app.appendChild(head);
 const wrap=el('div',{class:'levelwrap'});const file=el('div',{class:'card'}),side=el('div',{class:'card',id:'caseSide'});wrap.append(file,side);app.appendChild(wrap);
 const B=Object.assign({},K.brief);if(!B.sketch&&K.sketch){B.sketch=K.sketch;B.sh=K.sh;}file.appendChild(el('div',{class:'steptitle'},'Case file · brief'));
 file.appendChild(el('div',{class:'stake'},`<div class="av">${B.avatar}</div><div><div class="who"><b style="color:#e6ebf5">${B.who}</b> · ${B.role}</div><div class="quote">“${B.quote}”</div></div>`));
 file.appendChild(el('div',{style:'font-size:14.5px'},B.story));
 if(B.sketch){const C=makeCanvas(file,640,B.sh||250);B.sketch(C.ctx,640,B.sh||250);}
 if(B.data){if(isLearner()){const d=el('details',{class:'dsheet',id:'dataSheet'},`<summary>📊 Data sheet – tap to open (you will need it for the calculations)</summary><div style="margin-top:6px">${B.data}</div>`);file.appendChild(d);}else file.appendChild(el('div',{style:'margin-top:8px'},B.data));}
 const log=el('div',{class:'evlog'});file.appendChild(log);
 st.addEv=ev=>{if(!ev)return;let d;if(isLearner()){log.querySelectorAll('details.ev').forEach(x=>x.open=false);d=el('details',{class:'ev',open:'open'},`<summary><h4 style="display:inline">📎 ${ev.h}</h4> <span class="small mut">(new)</span></summary>${ev.html||''}`);}else d=el('div',{class:'ev'},`<h4>📎 ${ev.h}</h4>${ev.html||''}`);
  if(ev.draw){const C=makeCanvas(d,640,ev.H||240);ev.draw(C.ctx,640,ev.H||240);}log.appendChild(d);};
 renderCaseStep();}
function caseMeters(st){const m=st.m;const bar=(l,v)=>`<span>${l}</span><div class="meter"><i style="width:${clamp(v,0,100)}%;background:${v>66?'#66bb6a':v>33?'#ffb74d':'#ef5350'}"></i></div><span>${Math.round(clamp(v,0,100))}</span>`;
 return el('div',{class:'meters'},bar('🛡 Safety',m.s)+bar('💰 Budget',m.c)+bar('⏱ Schedule',m.t));}
function applyFx(st,fx){if(!fx)return'';let s=[];for(const k of['s','c','t'])if(fx[k]){st.m[k]=clamp(st.m[k]+fx[k],0,100);s.push(({s:'🛡',c:'💰',t:'⏱'})[k]+(fx[k]>0?'+':'')+fx[k]);}return s.length?`<div class="small mut" style="margin-top:4px">Meters: ${s.join(' · ')}</div>`:'';}
function qualTag(q){return q>=0.8?'<span class="qual g">✅ Strong call</span>':q>=0.4?'<span class="qual m">⚠ Acceptable, but not best</span>':'<span class="qual b">❌ Poor call</span>';}
function caseScore(st,s,q,kind){const f=hintFactor(st.stepHints||0);const v=q*f;(kind==='A'?st.A:st.J).push(kind==='A'?v:[v,s.type==='final'?2:(s.w||1)]);[].concat(s.sk||[]).forEach(k=>{st.sks.add(k);addMastery(k,v);});return v;}
function mentorBlock(box,S,onDone,opt){opt=opt||{};
 box.appendChild(el('div',null,mentorHTML(opt.intro||`Before we go on – a new idea you will need here: <b>${S.icon} ${S.name}</b>. Let me explain it in two minutes.`)));
 box.appendChild(el('div',{class:'lsec'},`<h4>In plain words</h4>${S.plain}`));
 box.appendChild(el('div',{class:'lsec'},`<h4>Everyday analogy</h4>${S.analogy}`));
 box.appendChild(el('div',{class:'lsec'},`<h4>Tiny worked example</h4>${S.example}`));
 box.appendChild(el('div',{class:'formula'},`📐 ${S.formula}`));
 const c=S.check;const ck=el('div',{class:'lsec'},`<h4>Quick check</h4><div class="q" style="margin-bottom:8px">${c.q}</div>`);box.appendChild(ck);
 const ch=el('div',{class:'choices mentorcheck'});ck.appendChild(ch);const fb=el('div',{class:'fb'});ck.appendChild(fb);let answered=false;
 shuffle(c.opts).forEach(o=>{const b=el('button',{class:'btn'},o.t);ch.appendChild(b);b.onclick=()=>{if(o.ok){[...ch.children].forEach(x=>x.disabled=true);b.classList.add('right');fb.className='fb ok';fb.innerHTML='✅ <b>Exactly!</b> '+o.why;
   if(!answered){addMastery(S.id,0.6);}answered=true;STORE.lessons[S.id]=Object.assign(STORE.lessons[S.id]||{},{seen:true});save();
   const nb=el('button',{class:'btn pri',style:'margin-top:10px'},opt.btn||'Got it – back to the case ▶');nb.onclick=onDone;ck.appendChild(nb);}
  else{b.classList.add('wrong');b.disabled=true;answered=true;fb.className='fb info';fb.innerHTML='Not quite – '+o.why+' <span class="mut">Try another one.</span>';}};});}
function renderCaseStep(){const{K,st,cs}=CASE_CUR;const side=$('#caseSide');
 let s=K.steps[st.idx];while(s&&s.skip&&s.skip(st)){st.idx++;s=K.steps[st.idx];}
 if(!s){finishCase();return;}
 side.innerHTML='';side.appendChild(caseMeters(st));st.stepHints=0;
 const bar=el('div',{class:'tprog'});K.steps.forEach((x,k)=>bar.appendChild(el('i',{class:k<st.idx?'done':k===st.idx?'cur':''})));side.appendChild(bar);
 const L=isLearner(),sks=[].concat(s.sk||[]).filter(k=>SKILLS[k]);
 if(L){const fresh=sks.find(k=>!(STORE.lessons[k]||{}).seen);if(fresh){side.appendChild(el('div',{class:'steptitle'},`Step ${st.idx+1}/${K.steps.length} · Mentor`));mentorBlock(side,SKILLS[fresh],()=>{renderCaseStep();window.scrollTo({top:0,behavior:'smooth'});});return;}
  if(st.idx===0&&!st.welcomed){st.welcomed=true;side.appendChild(el('div',null,mentorHTML(`Welcome to the case! Read the brief on the left, then take it one step at a time. Hints are free in Learner mode, words with a dotted underline explain themselves when you hover or tap them, and the 🧮 calculator is always there.`)));}}
 const lab={decide:'Decision',request:'Data request',compute:'Analysis',final:'Final recommendation',info:'Briefing'}[s.type];
 side.appendChild(el('div',{class:'steptitle'},`Step ${st.idx+1}/${K.steps.length} · ${lab}${s.title?' · '+s.title:''}`));
 if(s.onShow&&!s._shown){s._shown=true;s.onShow(st);}
 const area=el('div');const fb=el('div',{class:'fb'});const hb=el('div');const nx=el('div',{class:'row'});
 const next=()=>{nx.appendChild(el('button',{class:'btn pri',onclick:()=>{st.idx++;renderCaseStep();window.scrollTo({top:0,behavior:'smooth'});}},st.idx<K.steps.length-1?'Continue ▶':'Close the case → debrief'));
  const m=side.querySelector('.meters');m.replaceWith(caseMeters(st));if(s.evidence)st.addEv(VV(s.evidence,st));if(hl&&hl.disable)hl.disable();};
 let hl=null;const useHint=n=>{st.stepHints=n;st.hints++;};
 // Learner: complex calculation steps are worked through together with the mentor
 if(L&&s.adv&&s.type==='compute'){const a=VV(s.ans,st);if(s.store)st.f[s.store]=a;
  side.appendChild(el('div',{class:'q',style:'font-size:15px;margin-bottom:10px'},VV(s.q,st)));
  side.appendChild(el('div',null,mentorHTML(`This one is a bit advanced – let's work it out together. ${s.fm?'<div class="formula">📐 '+s.fm+'</div>':''}${VV(s.explain,st)}<div class="small mut" style="margin-top:6px">(Switch to Engineer mode to calculate it yourself.)</div>`)));
  side.append(area,fb,nx);st.log.push({step:s.title||lab,choice:'worked through with the mentor',q:1,calc:true,info:true});next();return;}
 side.appendChild(el('div',{class:'q',style:'font-size:15px;margin-bottom:10px'},VV(s.q,st)));
 if(L&&s.look)side.appendChild(el('div',{class:'focus'},'👀 <b>Look at:</b> '+VV(s.look,st)));
 if(s.type==='compute'&&!isExpert()){const fm=s.fm||(sks[0]?SKILLS[sks[0]].formula:'');if(fm&&L)side.appendChild(el('div',{class:'formula'},'📐 <b>Formula helper:</b> '+VV(fm,st)));}
 if(L&&s.type==='compute'){const ds=$('#dataSheet');if(ds)ds.open=true;}
 if(s.ref){const lv=LEVELS.find(l=>l.id===s.ref);if(lv)side.appendChild(el('button',{class:'btn sm',style:'margin-bottom:10px',onclick:()=>modal(`<div class="tag">Training refresher</div><h2>📖 ${lv.title}</h2>${lv.concept}`)},'📖 Refresher: '+lv.title));}
 side.append(area,fb,hb,nx);
 if(s.type==='decide'||s.type==='final'){const c=el('div',{class:'choices'});area.appendChild(c);const opts=s.noShuffle?VV(s.opts,st):shuffle(VV(s.opts,st));const btns=[];
  opts.forEach(o=>{const b=el('button',{class:'btn'},VV(o.t,st));btns.push(b);c.appendChild(b);b.onclick=()=>{[...c.children].forEach(x=>x.disabled=true);b.classList.add(o.q>=0.8?'right':'wrong');
   caseScore(st,s,o.q,'J');if(o.set)Object.assign(st.f,o.set);st.log.push({step:s.title||lab,choice:VV(o.t,st),q:o.q});
   if(s.type==='final')st.final=o;
   fb.className='fb '+(o.q>=0.8?'ok':o.q>=0.4?'info':'bad');fb.innerHTML=qualTag(o.q)+'<div style="margin-top:6px">'+VV(o.fb,st)+'</div>'+applyFx(st,o.fx)+(s.after?'<div class="small" style="margin-top:6px">💡 '+VV(s.after,st)+'</div>':'');
   if(o.q<0.8){const best=opts.reduce((a,b)=>b.q>a.q?b:a);fb.innerHTML+=`<div class="small" style="margin-top:6px">The strongest option was: <b>${VV(best.t,st)}</b></div>`;}
   if(L){const others=opts.filter(x=>x!==o&&VV(x.fb,st));if(others.length)fb.innerHTML+=`<details class="whyall"><summary>Why are the other options ${o.q>=0.8?'weaker':'better or worse'}? (tap)</summary><ul>${others.map(x=>`<li>${x.q>=0.8?'✅':x.q>=0.4?'⚠':'❌'} <b>${VV(x.t,st)}</b> – ${VV(x.fb,st)}</li>`).join('')}</ul></details>`;}
   next();};});
  const strike=keep=>{const live=opts.map((o,k)=>({o,b:btns[k]})).filter(x=>!x.b.disabled).sort((a,b)=>a.o.q-b.o.q);const out=[];while(live.length>keep){const x=live.shift();x.b.disabled=true;x.b.classList.add('struck');out.push(x.o);}return out;};
  hl=hintLadder(hb,[()=>VV(s.h1,st)||'Ask yourself: which option is backed by evidence, protects people first, and fixes the cause rather than the symptom?',
   ()=>{const g=strike(opts.length-1);return g.length?`Crossed out: <i>${VV(g[0].t,st)}</i>${g[0].fb?' – '+VV(g[0].fb,st):''}`:'';},
   ()=>{strike(2);return 'Only two options are left – one is clearly stronger. Which one deals with the root of the problem?';}],useHint);}
 else if(s.type==='request'){const box=el('div',{class:'req'});area.appendChild(box);const items=shuffle(s.items);const labs=[];const cbs=items.map(it=>{const l=el('label');const cb=el('input',{type:'checkbox'});l.append(cb,el('span',null,it.t+(it.cost?` <span class="mut small">(${it.cost})</span>`:'')));box.appendChild(l);labs.push(l);return cb;});
  const b=el('button',{class:'btn pri',style:'margin-top:6px'},'Send request');area.appendChild(b);
  b.onclick=()=>{cbs.forEach(c=>c.disabled=true);b.disabled=true;const ess=items.filter(i=>i.v===1).length;let got=0,bad=0,fx={c:0,t:0};const lines=[];
   items.forEach((it,k)=>{const on=cbs[k].checked;if(on){fx.c-=it.c||2;fx.t-=it.d||2;}if(it.v===1&&on)got++;if(it.v<=0&&on)bad++;
    lines.push(`<li>${on?(it.v===1?'✔':it.v>0?'➕':'✖'):(it.v===1?'⚠ <b>missed:</b>':'·')} ${it.t} – <span class="mut">${it.why}</span></li>`);});
   const q=clamp((ess?got/ess:1)-0.25*bad,0,1);caseScore(st,s,q,'J');st.log.push({step:s.title||lab,choice:`${got}/${ess} essential, ${bad} unnecessary`,q});
   fb.className='fb '+(q>=0.8?'ok':q>=0.4?'info':'bad');fb.innerHTML=qualTag(q)+`<ul class="small" style="margin:6px 0 0;padding-left:18px">${lines.join('')}</ul>`+applyFx(st,fx)+(s.after?'<div class="small">💡 '+VV(s.after,st)+'</div>':'');next();};
  hl=hintLadder(hb,[()=>VV(s.h1,st)||'Request only what can confirm or rule out a cause. Every request costs time and money.',
   ()=>{const k=items.findIndex(i=>i.v===1);if(k>=0)labs[k].classList.add('glow');return 'One essential item is highlighted: <i>'+items[k].t+'</i> – '+items[k].why;},
   ()=>{items.forEach((it,k)=>{if(it.v===1)labs[k].classList.add('glow');else if(it.v<=0)labs[k].classList.add('struck');});return 'All essential items are highlighted; the irrelevant ones are crossed out.';}],useHint);}
 else if(s.type==='compute'){const r=el('div',{class:'ansrow'});const inp=el('input',{type:'text',inputmode:'decimal',placeholder:L?'number or expression':'your answer'});const b=el('button',{class:'btn pri'},'Check');r.append(inp);if(s.unit)r.append(el('span',{class:'mut'},s.unit));r.append(b);if(!isExpert())r.append(el('button',{class:'btn sm',title:'Calculator',onclick:()=>calcOpen(inp)},'🧮'));area.appendChild(r);
  const mcBox=el('div');area.appendChild(mcBox);
  let tries=0,closed=false;const maxT=isExpert()?1:2;const a=VV(s.ans,st);
  const close=(sc,msgHead,v)=>{closed=true;inp.disabled=b.disabled=true;mcBox.querySelectorAll('button').forEach(x=>x.disabled=true);const ex='<div class="small" style="margin-top:6px">💡 '+VV(s.explain,st)+'</div>';
   caseScore(st,s,sc,'A');st.log.push({step:s.title||lab,choice:`${v==null?'(multiple choice)':inp.value} ${s.unit||''} (exact ${fmt(a,s.dec==null?3:s.dec)})`,q:sc,calc:true});if(s.store)st.f[s.store]=sc>0&&v!=null?v:a;
   fb.className='fb '+(sc>0?'ok':'bad');fb.innerHTML=msgHead+` Value: <b>${fmt(a,s.dec==null?3:s.dec)}${s.unit?' '+s.unit:''}</b>.`+ex+(sc>0?'':'<div class="small mut">The investigation continues with the correct value.</div>');next();};
  const showMC=()=>{if(!L||closed||mcBox.childNodes.length)return;mcBox.appendChild(el('div',{class:'small mut',style:'margin-top:8px'},'🛟 Type a new answer – or pick one of these:'));const row=el('div',{class:'mcrow'});
   mcOptions(a,s.dec).forEach(o=>{const bb=el('button',{class:'btn sm mc'},o.t+(s.unit?' '+s.unit:''));bb.onclick=()=>{if(closed)return;bb.classList.add(o.ok?'right':'wrong');close(o.ok?0.6:0,o.ok?'✅ <b>Good pick.</b>':'❌ That was not it.',null);};row.appendChild(bb);});mcBox.appendChild(row);};
  const go=()=>{if(closed)return;const v=parseAnswer(inp.value);if(!isFinite(v)){fb.className='fb info';fb.textContent='Please enter a number (or an expression like 2*3.5).';return;}
   const res=judgeSmart(v,a,s);tries++;
   if(res.ok)close(tries===1?1:(L?0.6:0.5),'✅ <b>Correct.</b>',v);
   else if(tries>=maxT)close(0,'❌ '+res.msg,v);
   else{fb.className='fb bad'+(res.unit?' unitmsg':'');fb.innerHTML='❌ '+res.msg+' <span class="mut">One more try.</span>';showMC();}};
  b.onclick=go;inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();});
  hl=hintLadder(hb,[()=>VV(s.h1,st)||`Find the numbers you need in the case file${s.unit?' – the answer is in <b>'+s.unit+'</b>':''}. Keep units consistent: N and mm give MPa.`,
   ()=>{const fm=VV(s.fm,st)||(sks[0]?SKILLS[sks[0]].formula:'');return (fm?`<div class="formula">📐 ${fm}</div>`:'')+(sks[0]?SKILLS[sks[0]].why:'');},
   ()=>'Worked substitution: '+maskAnswer(VV(s.explain,st),a,s.dec)+' <span class="mut">– finish the last step yourself.</span>'],useHint);}
 else if(s.type==='info'){next();}
}
function finishCase(){const{K,st,cs}=CASE_CUR;const sw=st.J.reduce((a,x)=>a+x[1],0);const J=sw?st.J.reduce((a,x)=>a+x[0]*x[1],0)/sw:1;const A=st.A.length?mean(st.A):1;const M=(st.m.s+st.m.c+st.m.t)/300;
 const score=Math.round(100*(0.55*J+0.3*A+0.15*M));const skl=[...st.sks].filter(k=>SKILLS[k]);const stars=starsFor(score);const prev=STORE.cases[cs.id]||{};const rank=caseRank(score);
 STORE.cases[cs.id]={best:Math.max(prev.best||0,score),stars:Math.max(prev.stars||0,stars),rank:score>=(prev.best||0)?rank:prev.rank};save();updHeader();
 const app=$('#app');app.innerHTML='';window.scrollTo(0,0);const D=K.debrief;const fo=st.final||{q:1};
 const head=el('div',{class:'lvhead'});head.appendChild(el('button',{class:'btn sm',onclick:showMap},'◀ Home'));head.appendChild(el('h2',null,`Debrief: ${cs.icon} ${cs.title}`));app.appendChild(head);
 const d=el('div',{class:'debrief'});app.appendChild(d);
 d.appendChild(el('div',{class:'outcome '+(fo.q>=0.8?'g':fo.q>=0.4?'m':'b')},`<div class="steptitle">What happened next</div><div style="font-size:15px">${VV(fo.outcome,st)||''}</div>`));
 const lv=id=>LEVELS.find(l=>l.id===id);
 d.appendChild(el('div',{class:'card'},`<div class="row" style="justify-content:space-between"><div><h3 style="margin:0">Case score: ${score}% <span class="stars" style="font-size:20px">${'★'.repeat(stars)}<span class="off">${'★'.repeat(3-stars)}</span></span></h3><div class="mut small">Rating: <b>${rank}</b>${prev.best!=null?' · previous best '+prev.best+'%':''}</div></div>
  <div class="dlist" style="min-width:300px"><span>🧠 Engineering judgment (55 %)</span><b>${Math.round(100*J)}%</b><span>🧮 Analysis accuracy (30 %)</span><b>${Math.round(100*A)}%</b><span>🛡💰⏱ Meters (15 %)</span><b>${Math.round(100*M)}%</b></div></div>
  <table class="dt" style="margin-top:10px"><tr><th style="text-align:left">Step</th><th style="text-align:left">Your choice</th><th>Quality</th></tr>${st.log.map(l=>`<tr><td style="text-align:left">${l.step}</td><td style="text-align:left">${l.choice}</td><td style="color:${l.q>=0.8?'#66bb6a':l.q>=0.4?'#ffb74d':'#ef5350'}">${Math.round(100*l.q)}%</td></tr>`).join('')}</table>`));
 if(skl.length)d.appendChild(el('div',{class:'card'},`<h3>🧠 Skills you practised</h3><div class="skillgrid">${skl.map(k=>{const m=skillState(k).m;return `<div><b>${SKILLS[k].icon} ${SKILLS[k].name}</b><div class="mbar"><i style="width:${m}%;background:${masteryCol(m)}"></i></div><span class="lvlname">${masteryName(m)} · ${m}%</span></div>`;}).join('')}</div>${st.hints?`<div class="small mut" style="margin-top:6px">You used ${st.hints} hint${st.hints>1?'s':''} – that's how learning works.</div>`:''}<div class="small" style="margin-top:6px">${score>=75?'🎉 Great work – you think like an engineer!':score>=50?'👍 Solid investigation. Replay with new numbers to sharpen it.':'🌱 Every expert started here. Check the reasoning chain below and try again – the numbers change each time.'}</div>`));
 d.appendChild(el('div',{class:'card'},`<h3>🔗 The reasoning chain</h3><ol>${D.chain.map(x=>`<li>${x}</li>`).join('')}</ol>`));
 const cc=el('div',{class:'card'},'<h3>🎯 Concepts used – train them</h3>');const row=el('div',{class:'row'});D.concepts.forEach(([t,id])=>{const L=lv(id);row.appendChild(el('button',{class:'btn sm',title:L?L.title:'',onclick:()=>{if(L)openLevel(id);}},`${t} → <span class="mut">${L?L.title:''}</span>`));});cc.appendChild(row);d.appendChild(cc);
 d.appendChild(el('div',{class:'card'},`<h3>⚠ Real-world pitfalls</h3><ul>${D.pitfalls.map(x=>`<li>${x}</li>`).join('')}</ul>`));
 if(D.history)d.appendChild(el('div',{class:'history'},`<div class="steptitle">From the history books</div>${D.history}`));
 const r=el('div',{class:'row',style:'margin-top:14px'});r.appendChild(el('button',{class:'btn',onclick:()=>startCase(cs)},'↻ Replay case (new numbers)'));r.appendChild(el('button',{class:'btn pri',onclick:showMap},'Back to the learning path'));if(typeof nextPathNode==='function'){const nn=nextPathNode();if(nn)r.appendChild(el('button',{class:'btn pri',onclick:()=>openPathNode(nn)},'Next on your path: '+nn.title+' ▶'));}d.appendChild(r);
 CASE_CUR=null;}
/* small option helper: O(text, quality, feedback, fx, set, outcome) */
function O(t,q,fb,fx,set,outcome){return{t,q,fb,fx,set,outcome};}
function R(t,v,why,c,d){return{t,v,why,c,d};}
function tbl(rows,head){return`<table class="dt">${head?'<tr>'+head.map(h=>`<th>${h}</th>`).join('')+'</tr>':''}${rows.map(r=>'<tr>'+r.map((c,i)=>i===0&&!head?`<th style="text-align:left">${c}</th>`:`<td>${c}</td>`).join('')+'</tr>').join('')}</table>`;}
