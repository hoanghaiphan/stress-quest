/* ===================== LEARNING LAYER: modes, judge, calculator, hints, glossary tooltips, mastery ===================== */
const MODES={learner:{icon:'🌱',name:'Learner',desc:'Mentor explanations, free hints, formula helpers, generous tolerance (±5 %), multiple-choice rescue after a miss, rounded numbers in cases, guided steps.'},
 engineer:{icon:'🛠',name:'Engineer',desc:'The full investigations. Hints available but they cost a little score; engineering tolerances; two tries.'},
 expert:{icon:'🔥',name:'Expert',desc:'No hints, no formula helpers, one try per calculation. For the confident.'}};
function MODE(){return MODES[STORE.mode]?STORE.mode:'learner';}
const isLearner=()=>MODE()==='learner',isExpert=()=>MODE()==='expert';
function setMode(m){STORE.mode=m;save();updModeBadge();}
function updModeBadge(){const b=$('#modeBadge');if(b){const M=MODES[MODE()];b.textContent=M.icon+' '+M.name;}}
function modePicker(after){const d=el('div',{class:'modes'});Object.keys(MODES).forEach(k=>{const M=MODES[k];const b=el('button',{class:'btn sm'+(MODE()===k?' on':''),title:M.desc,'data-mode':k},M.icon+' '+M.name);b.onclick=()=>{setMode(k);toast(M.icon+' '+M.name+' mode');if(after)after();};d.appendChild(b);});return d;}

/* ---------- safe expression parser (answer boxes + calculator) ---------- */
function evalExpr(src){let s=String(src).toLowerCase().replace(/\s+/g,'').replace(/,/g,'.').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/[−–]/g,'-').replace(/²/g,'^2').replace(/³/g,'^3').replace(/√/g,'sqrt').replace(/π/g,'pi');
 let i=0;const err=()=>{throw new Error('parse');};
 const F={sqrt:Math.sqrt,ln:Math.log,log:Math.log10,exp:Math.exp,abs:Math.abs,sin:x=>Math.sin(x*Math.PI/180),cos:x=>Math.cos(x*Math.PI/180),tan:x=>Math.tan(x*Math.PI/180)};
 function expr(){let v=term();while(s[i]==='+'||s[i]==='-'){const o=s[i++];const w=term();v=o==='+'?v+w:v-w;}return v;}
 function term(){let v=unary();while(s[i]==='*'||s[i]==='/'){const o=s[i++];const w=unary();v=o==='*'?v*w:v/w;}return v;}
 function unary(){if(s[i]==='-'){i++;return -unary();}if(s[i]==='+'){i++;return unary();}return power();}
 function power(){const b=atom();if(s[i]==='^'){i++;return Math.pow(b,unary());}return b;}
 function atom(){if(s[i]==='('){i++;const v=expr();if(s[i]!==')')err();i++;return v;}
  const m=/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(s.slice(i));if(m){i+=m[0].length;return parseFloat(m[0]);}
  const f=/^(sqrt|ln|log|exp|abs|sin|cos|tan)\(/.exec(s.slice(i));if(f){i+=f[1].length;return F[f[1]](atom());}
  if(s.slice(i,i+2)==='pi'){i+=2;return Math.PI;}err();}
 const v=expr();if(i!==s.length)err();return v;}
function parseAnswer(str){const t=String(str||'').trim();if(!t)return NaN;if(/^[-+]?\d*[.,]?\d+(e[-+]?\d+)?$/i.test(t))return parseFloat(t.replace(',','.'));try{return evalExpr(t);}catch(e){return NaN;}}

/* ---------- smart numeric judging with unit-mistake detection ---------- */
function judgeSmart(v,a,o){o=o||{};const L=isLearner(),exact=(o.tol===0&&!o.abs&&!o.logtol);
 let tol=Math.max((o.tol==null?0.03:o.tol)*Math.abs(a),o.abs||0);if(L&&!exact)tol=Math.max(tol,0.05*Math.abs(a),(o.abs||0)*1.5);
 let ok;if(o.logtol){const lt=L?Math.max(o.logtol,0.05):o.logtol;ok=v*a>0&&Math.abs(Math.log10(v/a))<=lt;}else ok=Math.abs(v-a)<=tol+1e-12;
 if(ok)return{ok:true,msg:''};const m=mistakeMsg(v,a,o.unit,tol);return{ok:false,msg:m.msg,unit:m.unit};}
function mistakeMsg(v,a,unit,tol){const u=String(unit||'').replace(/<[^>]+>/g,'');if(!a||!isFinite(v))return{msg:'Not quite.'};const r=v/a;const near=(f,e)=>Math.abs(r/f-1)<=(e||0.06);
 const U=(msg)=>({msg:'🔎 <b>Unit check:</b> '+msg,unit:true});
 if(near(-1))return{msg:'Check the sign! The size is right but the sign is flipped (tension +, compression −).'};
 if(/MPa/.test(u)){if(near(1e6))return U('your value is 1,000,000× too big – it looks like <b>Pa</b> (N/m²). 1 MPa = 10⁶ Pa = 1 N/mm².');
  if(near(1e-6))return U('your value is 1,000,000× too small – did you mix <b>m² and mm²</b>? (1 m² = 10⁶ mm²). With N and mm you get MPa directly.');
  if(near(1e3))return U('1000× too big – <b>kPa instead of MPa</b>, or a length in mm where m was needed (N·mm vs N·m)?');
  if(near(1e-3))return U('1000× too small – did you use <b>kN instead of N</b> (1 kN = 1000 N), or GPa / m instead of mm?');}
 if(/^mm/.test(u)){if(near(1e-3))return U('looks like <b>metres</b> – the answer is asked in mm (1 m = 1000 mm).');if(near(0.1))return U('looks like <b>cm</b> – the answer is asked in mm (1 cm = 10 mm).');if(near(1e3))return U('1000× too big – µm instead of mm, or a stress in Pa somewhere?');}
 if(/kN/.test(u)){if(near(1e3))return U('looks like <b>N</b> – the answer is asked in kN (divide by 1000).');if(near(1/9.81,0.03)||near(1e3/9.81,0.03))return U('looks like a <b>mass</b>. Force = mass × g (9.81 m/s²).');}
 if(u==='N'){if(near(1/9.81,0.03))return U('that is the <b>mass in kg</b>. Weight force F = m·g = m × 9.81 m/s² (in N).');if(near(1e-3))return U('looks like <b>kN</b> – the answer is asked in N (× 1000).');}
 if(/N·mm/.test(u)&&near(1e-3))return U('looks like <b>N·m</b> – the answer is asked in N·mm (× 1000).');
 if(/N·m$/.test(u)&&near(1e3))return U('looks like <b>N·mm</b> – the answer is asked in N·m (÷ 1000).');
 if(u==='%'){if(near(0.01))return U('you entered a <b>fraction</b> – multiply by 100 to get %.');}
 else if(!u&&near(100))return U('that looks like a <b>percentage</b> – enter it as a plain ratio (e.g. 0.25, not 25).');
 if(near(1e3)||near(1e-3))return U('off by a factor of 1000 – check unit prefixes (k, M) and mm vs m.');
 if(near(1e6)||near(1e-6))return U('off by 10⁶ – check mm² vs m² or Pa vs MPa.');
 if(near(9.81,0.03)||near(1/9.81,0.03))return U('off by g = 9.81 – mixing up mass (kg) and force (N)? F = m·g.');
 if(near(2,0.04)||near(0.5,0.04))return{msg:'Off by exactly a factor of 2 – diameter vs radius? one side vs both? amplitude vs range?'};
 if(near(4,0.04)||near(0.25,0.04))return{msg:'Off by a factor of 4 – did you use r instead of d in A = πd²/4 (or the other way round)?'};
 if(near(100,0.03)||near(0.01,0.03))return{msg:'Off by 100 – percent vs fraction?'};
 if(near(10,0.03)||near(0.1,0.03))return{msg:'Off by a factor of 10 – a decimal slip or cm vs mm?'};
 if(Math.abs(v-a)<=3*tol)return{msg:'Very close! Just outside the tolerance – check your rounding of intermediate values.'};
 return{msg:'Not quite – your value is '+(v>a?'too high':'too low')+'.'};}

/* multiple-choice rescue values */
function mcOptions(a,dec){const fs=shuffle([0.5,2,0.7,1.4,4,0.25,10,0.1]).slice(0,3);const opts=[a,...fs.map(f=>a*f)];const d=dec==null?3:dec;
 const lab=x=>{const s=fmt(x,Math.abs(x)>=100?Math.max(0,Math.min(d,1)):Math.max(d,2));return s;};
 const seen=new Set();return shuffle(opts.map((x,k)=>({v:x,ok:k===0,t:lab(x)})).filter(o=>{if(seen.has(o.t))return false;seen.add(o.t);return true;}));}

/* ---------- calculator ---------- */
let CALC_TARGET=null;
function calcInit(){if($('#calc'))return;const c=el('div',{id:'calc'},`<div class="row" style="justify-content:space-between;margin-bottom:6px"><b>🧮 Calculator</b><button class="btn sm" id="calcX">✕</button></div>
 <input id="calcIn" placeholder="e.g. 5000/(pi*10^2/4)" autocomplete="off"><div class="res" id="calcRes"></div>
 <div class="keys">${['7','8','9','/','(','4','5','6','*',')','1','2','3','-','^','0','.','pi','+','sqrt(','ln(','log(','sin(','cos(','⌫'].map(k=>`<button class="btn sm" data-k="${k}">${k}</button>`).join('')}</div>
 <div class="row" style="margin-top:8px"><button class="btn sm" id="calcC">Clear</button><button class="btn sm pri" id="calcUse">Use result ↵</button></div>
 <div class="small mut" style="margin-top:6px">sin/cos/tan use degrees · log = log₁₀ · ln = natural log · 2e5 = 2·10⁵</div>`);document.body.appendChild(c);
 const inp=$('#calcIn'),res=$('#calcRes');const upd=()=>{const v=parseAnswer(inp.value);res.textContent=inp.value?(isFinite(v)?'= '+(+v.toPrecision(8)):'…'):'';};
 inp.addEventListener('input',upd);c.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==='⌫')inp.value=inp.value.slice(0,-1);else inp.value+=k;upd();inp.focus();});
 $('#calcX').onclick=()=>c.style.display='none';$('#calcC').onclick=()=>{inp.value='';upd();};
 $('#calcUse').onclick=()=>{const v=parseAnswer(inp.value);if(isFinite(v)&&CALC_TARGET&&document.body.contains(CALC_TARGET)&&!CALC_TARGET.disabled){CALC_TARGET.value=String(+v.toPrecision(6));CALC_TARGET.focus();toast('Copied into the answer box');}else toast(isFinite(v)?'Result: '+(+v.toPrecision(6)):'Cannot evaluate');};}
function calcOpen(target){calcInit();if(target)CALC_TARGET=target;$('#calc').style.display='block';$('#calcIn').focus();}

/* ---------- mastery & spaced repetition ---------- */
const SR_INT=[0,10*60e3,24*3600e3,3*24*3600e3,7*24*3600e3,21*24*3600e3];
function skillState(id){if(!STORE.skills[id])STORE.skills[id]={m:0,n:0,box:0,due:0,last:0};return STORE.skills[id];}
function masteryName(m){return m>=90?'Mastered 🏆':m>=70?'Proficient':m>=40?'Practising':m>0?'Learning':'New';}
function masteryCol(m){return m>=90?'#ffd54f':m>=70?'#66bb6a':m>=40?'#4fc3f7':m>0?'#ffb74d':'#3a4560';}
function addMastery(id,q){if(!id||typeof SKILLS==='undefined')return;const ids=Array.isArray(id)?id:[id];ids.forEach(k=>{if(!SKILLS[k])return;const s=skillState(k);const before=masteryName(s.m);
 const target=100*clamp(q,0,1);s.m=Math.round(clamp(s.m+(target>=s.m?0.3:0.15)*(target-s.m),0,100));s.n++;s.last=Date.now();
 s.box=q>=0.8?Math.min(5,s.box+1):q>=0.4?s.box:Math.max(0,s.box-1);s.due=Date.now()+SR_INT[s.box];
 const after=masteryName(s.m);if(after!==before&&s.m>=40){toast(`🎉 Skill up! ${SKILLS[k].icon} ${SKILLS[k].name} → ${after}`);if(s.m>=70)celebrate();}});save();}
function celebrate(){const p=el('div',{class:'party'});for(let i=0;i<26;i++){const e=el('i',{style:`left:${Math.random()*100}%;animation-delay:${Math.random()*0.6}s`},pick(['🎉','⭐','✨','🔧','📐','🏆']));p.appendChild(e);}document.body.appendChild(p);setTimeout(()=>p.remove(),2600);}

/* ---------- hint ladder ---------- */
// tiers: array of 3 functions returning html (they may also act on the UI, e.g. strike options)
function hintLadder(parent,tiers,onUse){const box=el('div',{class:'hints'});parent.appendChild(box);let used=0;
 if(isExpert()){box.appendChild(el('div',{class:'small mut'},'🔥 Expert mode – no hints.'));return{used:()=>0,box};}
 const cost=MODE()==='engineer'?[' ',' (−10 %)',' (−20 %)']:['','',''];
 const lbl=['💡 Hint 1/3: a nudge','💡 Hint 2/3: formula & why','💡 Hint 3/3: worked substitution'];
 const b=el('button',{class:'btn sm hintbtn'},lbl[0]+cost[0]);box.appendChild(b);
 b.onclick=()=>{if(used>=tiers.length)return;const h=tiers[used]();used++;box.insertBefore(el('div',{class:'hint'},`<b>Hint ${used}:</b> ${h}`),b);if(onUse)onUse(used);
  if(used>=tiers.length)b.remove();else b.textContent=lbl[used]+cost[used];};
 return{used:()=>used,box,disable(){b.remove();}};}
function hintFactor(used){if(MODE()!=='engineer')return 1;return 1-0.1*Math.max(0,used-1);}
function maskAnswer(html,a,dec){if(!html)return '';const ds=[dec,0,1,2,3,4].filter(x=>x!=null);for(const d of ds){const s=fmt(a,d);if(s.length>=2&&html.includes(s)){return html.split(s).join('<b class="blank">?</b>');}}return html;}
function mentorHTML(say,name){return `<div class="mentor"><div class="av">🦉</div><div><div class="name">${name||'Ada · your mentor'}</div><div class="say">${say}</div></div></div>`;}

/* ---------- glossary tooltips ---------- */
const TERMS=[
 ['von Mises','An "equivalent stress": it combines several stresses (pull, push, shear) into one number you can compare with the yield strength of a ductile metal. σ<sub>vM</sub> = √(σ² + 3τ²) for one normal and one shear stress.'],
 ['Tresca','A yield criterion based on the largest shear stress. Slightly more conservative than von Mises.'],
 ['Kt','Stress concentration factor: how many times higher the peak stress at a hole, notch or corner is than the average ("nominal") stress. σ<sub>max</sub> = K<sub>t</sub>·σ<sub>nom</sub>.'],
 ['Kf','Fatigue notch factor: the "effective" Kt for fatigue, a bit lower than Kt for small, sharp notches.'],
 ['stress concentration','A local rise in stress at holes, notches, sharp corners or cracks – the force "crowds" around the obstacle.'],
 ['endurance limit','For steels: the stress amplitude below which a part can survive (practically) unlimited load cycles. Symbol S<sub>e</sub>.'],
 ['fatigue','Failure caused by many repeated load cycles, at stresses below the static strength. Think of bending a paperclip back and forth.'],
 ['Goodman','A straight-line rule that combines alternating and mean stress for fatigue: σ<sub>a</sub>/S<sub>e</sub> + σ<sub>m</sub>/S<sub>ut</sub> = 1/n.'],
 ['S–N curve','Stress amplitude (S) versus number of cycles to failure (N), usually on log scales. Lower stress → longer life.'],
 ['B10','The time (or number of cycles) by which 10 % of a population has failed. A common reliability target for bearings and products.'],
 ['B-basis','A conservative "design allowable": a value that 90 % of the population exceeds, with 95 % confidence.'],
 ['Weibull','A statistical distribution for lifetimes: F(t) = 1 − exp[−(t/η)<sup>β</sup>]. Its shape β tells you HOW things fail.'],
 ['β','Weibull shape parameter (beta): β < 1 early failures, β ≈ 1 random failures, β > 1 wear-out.'],
 ['η','Weibull characteristic life (eta): the time by which 63.2 % have failed.'],
 ['suspension','A unit that has NOT failed yet when the data were collected ("censored" data). It still carries information: it survived at least that long.'],
 ['mesh','The pattern of small elements an FE model is divided into. Finer mesh → more detail, but more computing time.'],
 ['element','A small piece of an FE model (like a brick in a wall). Elements are connected at nodes.'],
 ['node','A point where FE elements connect. The computer solves for the displacement of every node.'],
 ['boundary condition','How an FE model is held (supports) and loaded. Wrong boundary conditions = wrong answer, no matter how fine the mesh.'],
 ['singularity','A point (e.g. a perfectly sharp inner corner) where the computed stress grows without limit as the mesh is refined. The number is not physical.'],
 ['convergence','The FE result stops changing (much) when the mesh is refined further – then you can trust the number.'],
 ['FEA','Finite element analysis: a computer method that splits a part into many small elements to compute stresses and deflections.'],
 ['safety factor','Strength divided by the actual stress (n = S/σ). n = 2 means the part could carry twice the load before failing.'],
 ['yield strength','The stress at which a metal starts to deform permanently (it does not spring back). Symbol S<sub>y</sub>.'],
 ['tensile strength','The highest stress a material can carry in a tensile test before it breaks. Symbol S<sub>ut</sub> or R<sub>m</sub>.'],
 ['MPa','Megapascal: 1 MPa = 1 N/mm² = 10⁶ Pa. The everyday unit for stresses in engineering.'],
 ['bending moment','Force × lever arm (N·mm). It is what makes a beam bend; the stress is σ = M/W.'],
 ['section modulus','W – how well a cross-section resists bending stress. For a rectangle W = b·h²/6 (height counts twice!).'],
 ['moment of inertia','I – how stiff a cross-section is in bending. For a rectangle I = b·h³/12 (height counts three times!).'],
 ['Young\'s modulus','E – the stiffness of a material: stress per unit strain. Steel ≈ 210 000 MPa, aluminium ≈ 70 000 MPa.'],
 ['strain','Relative stretch: change in length ÷ original length (no unit). ε = σ/E in the elastic range.'],
 ['preload','The tension built into a bolt when you tighten it. It clamps the joint and protects the bolt from fatigue.'],
 ['Charpy','A pendulum impact test on a notched bar. The absorbed energy (J) shows how tough (not brittle) a steel is at a given temperature.'],
 ['Paris law','Crack growth per cycle: da/dN = C·(ΔK)<sup>m</sup>. Bigger stress range or longer crack → faster growth.'],
 ['fracture toughness','K<sub>c</sub> – the resistance of a material to an existing crack. When K = Yσ√(πa) reaches K<sub>c</sub>, the crack runs.'],
 ['hoop stress','The "around" stress in the wall of a pressurised pipe or cylinder: σ = pR/t for thin walls.'],
 ['FMEA','Failure Mode and Effects Analysis: list what can go wrong, rate Severity, Occurrence and Detection (1–10), and act on the worst first.'],
 ['RPN','Risk priority number in FMEA: S × O × D. Always look at high Severity too, not only the RPN.'],
 ['Pareto','The 80/20 idea: a few causes produce most of the problems. Sort categories by count and attack the biggest first.'],
 ['standard deviation','A measure of scatter: how far values typically are from the mean. Small = consistent, large = unpredictable.'],
 ['reliability','The probability that a part survives (does not fail) for a given time under given conditions. R = 1 − F.'],
 ['interference','Stress–strength interference: failures happen where the "load" and "strength" distributions overlap.'],
 ['median rank','An estimate of the fraction failed for the i-th failure in a sample: F ≈ (i − 0.3)/(n + 0.4).'],
 ['Lamé','Exact formulas for stresses in thick-walled cylinders; the hoop stress is highest at the inner surface.'],
 ['joint constant','C = k<sub>b</sub>/(k<sub>b</sub> + k<sub>m</sub>): the share of an external load change that the bolt "feels" while the joint stays clamped.']];
[['suspensions','suspension'],['elements','element'],['nodes','node'],['boundary conditions','boundary condition'],['singularities','singularity'],['stress concentrations','stress concentration'],['safety factors','safety factor']].forEach(([a,b])=>{const d=TERMS.find(x=>x[0]===b);if(d)TERMS.push([a,d[1]]);});
const TERM_MAP={};TERMS.forEach(([t,d])=>TERM_MAP[t.toLowerCase()]=d);
const TERM_RE=new RegExp('(^|[^\\wα-ω])('+TERMS.map(([t])=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length).join('|')+')(?=$|[^\\wα-ω])','i');
function annotate(root){if(!root||!root.querySelectorAll)return;const used=new Set([...root.querySelectorAll('.term')].map(x=>x.dataset.term));
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||p.closest('button,input,textarea,select,option,canvas,script,style,.term,h1,h2,h3,#tip,#calc,summary,.tprog,header,.pnode,.casecard,.lvl,.mcrow'))return NodeFilter.FILTER_REJECT;return TERM_RE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;}});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(n=>{const m=TERM_RE.exec(n.nodeValue);if(!m)return;const term=m[2],key=term.toLowerCase();if(used.has(key))return;used.add(key);
  const start=m.index+m[1].length;const after=n.splitText(start);after.nodeValue.length>term.length&&after.splitText(term.length);
  const sp=document.createElement('span');sp.className='term';sp.dataset.term=key;sp.tabIndex=0;after.parentNode.replaceChild(sp,after);sp.textContent=term;});}
function tipInit(){if($('#tip'))return;const t=el('div',{id:'tip'});document.body.appendChild(t);
 const show=(sp)=>{const d=TERM_MAP[sp.dataset.term];if(!d)return;t.innerHTML=`<b>${sp.textContent}</b> – ${d}`;t.style.display='block';const r=sp.getBoundingClientRect();
  let x=Math.min(window.innerWidth-345,Math.max(8,r.left));let y=r.bottom+6;if(y+120>window.innerHeight)y=Math.max(8,r.top-t.offsetHeight-6);t.style.left=x+'px';t.style.top=y+'px';};
 document.addEventListener('mouseover',e=>{const sp=e.target.closest&&e.target.closest('.term');if(sp)show(sp);});
 document.addEventListener('mouseout',e=>{if(e.target.closest&&e.target.closest('.term'))t.style.display='none';});
 document.addEventListener('click',e=>{const sp=e.target.closest&&e.target.closest('.term');if(sp)show(sp);else t.style.display='none';},true);
 document.addEventListener('focusin',e=>{if(e.target.classList&&e.target.classList.contains('term'))show(e.target);});
 let pending=false;const obs=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;obs.disconnect();try{annotate($('#app'));annotate($('#modalRoot'));}finally{watch();}});});
 const watch=()=>{obs.observe($('#app'),{childList:true,subtree:true});obs.observe($('#modalRoot'),{childList:true,subtree:true});};watch();}
