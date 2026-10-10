"use strict";
/* ================= Utilities ================= */
const $=s=>document.querySelector(s);
function el(tag,attrs,html){const e=document.createElement(tag);if(attrs)for(const k in attrs){if(k==='style')e.style.cssText=attrs[k];else if(k.startsWith('on'))e.addEventListener(k.slice(2),attrs[k]);else e.setAttribute(k,attrs[k]);}if(html!=null)e.innerHTML=html;return e;}
const rnd=(a,b)=>a+Math.random()*(b-a);
const rint=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function fmt(x,d){if(d==null)d=2;if(!isFinite(x))return '∞';const a=Math.abs(x);if(a!==0&&(a>=1e6||a<1e-3))return x.toExponential(Math.max(1,d));return (+x.toFixed(d)).toLocaleString('en-US',{maximumFractionDigits:d});}
function sig(x,n){if(x===0)return 0;const p=Math.pow(10,n-1-Math.floor(Math.log10(Math.abs(x))));return Math.round(x*p)/p;}
const round5=x=>Math.round(x/5)*5;
function erf(x){// Abramowitz-Stegun 7.1.26 (|err|<1.5e-7)
 const s=x<0?-1:1;x=Math.abs(x);const t=1/(1+0.3275911*x);
 const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return s*y;}
const Phi=z=>0.5*(1+erf(z/Math.SQRT2));
function PhiInv(p){// Acklam's algorithm
 const a=[-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00],
 b=[-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01],
 c=[-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549671671163525e+00,4.374664141464968e+00,2.938163982698783e+00],
 d=[7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];
 const pl=0.02425;let q,r;
 if(p<pl){q=Math.sqrt(-2*Math.log(p));return(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
 if(p>1-pl){q=Math.sqrt(-2*Math.log(1-p));return-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
 q=p-0.5;r=q*q;return(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);}
function randn(){let u=0,v=0;while(u===0)u=Math.random();while(v===0)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function gammaFn(z){// Lanczos
 if(z<0.5)return Math.PI/(Math.sin(Math.PI*z)*gammaFn(1-z));z-=1;const g=7,p=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
 let x=p[0];for(let i=1;i<g+2;i++)x+=p[i]/(z+i);const t=z+g+0.5;return Math.sqrt(2*Math.PI)*Math.pow(t,z+0.5)*Math.exp(-t)*x;}
function linreg(xs,ys){const n=xs.length;let sx=0,sy=0,sxx=0,sxy=0;for(let i=0;i<n;i++){sx+=xs[i];sy+=ys[i];sxx+=xs[i]*xs[i];sxy+=xs[i]*ys[i];}const m=(n*sxy-sx*sy)/(n*sxx-sx*sx);return{m,b:(sy-m*sx)/n};}
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const stdev=a=>{const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1));};

/* ================= Canvas helpers ================= */
function makeCanvas(parent,W,H){
 const cv=el('canvas');const dpr=Math.min(window.devicePixelRatio||1,2);cv.width=W*dpr;cv.height=H*dpr;cv.style.aspectRatio=W+'/'+H;
 parent.appendChild(cv);const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
 const C={cv,ctx,W,H,
  pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};},
  clear(){ctx.clearRect(0,0,W,H);},
  drag(down,move,up){let act=false;
   cv.addEventListener('pointerdown',e=>{const p=C.pos(e);if(down(p)!==false){act=true;cv.setPointerCapture(e.pointerId);e.preventDefault();}});
   cv.addEventListener('pointermove',e=>{const p=C.pos(e);if(act)move(p);else if(C.hover)C.hover(p);});
   cv.addEventListener('pointerup',e=>{if(act){act=false;up&&up();}});
   cv.addEventListener('pointerleave',()=>{if(!act&&C.hover)C.hover(null);});}
 };return C;}
function plotArea(ctx,x,y,w,h,xr,yr){
 const P={x,y,w,h,xr,yr,
  X:v=>x+(v-xr[0])/(xr[1]-xr[0])*w, Y:v=>y+h-(v-yr[0])/(yr[1]-yr[0])*h,
  iX:px=>xr[0]+(px-x)/w*(xr[1]-xr[0]), iY:py=>yr[0]+(y+h-py)/h*(yr[1]-yr[0]),
  inside:p=>p.x>=x&&p.x<=x+w&&p.y>=y&&p.y<=y+h,
  axes(xl,yl,opt){opt=opt||{};ctx.save();ctx.strokeStyle='#2c3850';ctx.fillStyle='#9aa6bf';ctx.font='11px system-ui';ctx.lineWidth=1;
   const xt=opt.xt||niceTicks(xr[0],xr[1],opt.nx||6),yt=opt.yt||niceTicks(yr[0],yr[1],opt.ny||5);
   ctx.textAlign='center';ctx.textBaseline='top';
   xt.forEach(t=>{const px=P.X(t);ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(px,y+h);ctx.stroke();ctx.fillText(opt.xf?opt.xf(t):fmtTick(t),px,y+h+4);});
   ctx.textAlign='right';ctx.textBaseline='middle';
   yt.forEach(t=>{const py=P.Y(t);ctx.beginPath();ctx.moveTo(x,py);ctx.lineTo(x+w,py);ctx.stroke();ctx.fillText(opt.yf?opt.yf(t):fmtTick(t),x-4,py);});
   ctx.strokeStyle='#56627e';ctx.lineWidth=1.3;
   if(Math.min(...xr)<=0&&Math.max(...xr)>=0&&opt.zero){ctx.beginPath();ctx.moveTo(P.X(0),y);ctx.lineTo(P.X(0),y+h);ctx.stroke();}
   if(Math.min(...yr)<=0&&Math.max(...yr)>=0&&opt.zero){ctx.beginPath();ctx.moveTo(x,P.Y(0));ctx.lineTo(x+w,P.Y(0));ctx.stroke();}
   ctx.strokeRect(x,y,w,h);
   ctx.fillStyle='#c9d2e6';ctx.font='12px system-ui';ctx.textAlign='center';ctx.textBaseline='bottom';
   if(xl)ctx.fillText(xl,x+w/2,y+h+30);
   if(yl){ctx.save();ctx.translate(x-(opt.yoff||38),y+h/2);ctx.rotate(-Math.PI/2);ctx.textBaseline='middle';ctx.fillText(yl,0,0);ctx.restore();}
   ctx.restore();},
  line(fn,a,b,col,lw,n,dash){n=n||300;ctx.save();ctx.strokeStyle=col;ctx.lineWidth=lw||2;if(dash)ctx.setLineDash(dash);ctx.beginPath();let st=false;
   for(let i=0;i<=n;i++){const t=a+(b-a)*i/n,v=fn(t);if(!isFinite(v)){st=false;continue;}const px=P.X(t),py=P.Y(v);if(!st){ctx.moveTo(px,py);st=true;}else ctx.lineTo(px,py);}ctx.stroke();ctx.restore();},
  clip(){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();}
 };return P;}
function niceTicks(a,b,n){if(a>b){const t=a;a=b;b=t;}const span=b-a;let st=Math.pow(10,Math.floor(Math.log10(span/n)));const e=span/n/st;st*=e>5?10:e>2?5:e>1?2:1;const out=[];for(let t=Math.ceil(a/st)*st;t<=b+1e-9*span;t+=st)out.push(+t.toFixed(10));return out;}
function fmtTick(t){const a=Math.abs(t);if(a!==0&&(a>=1e5||a<1e-3))return t.toExponential(0);return +t.toFixed(4)+'';}
function dot(ctx,x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,7);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function txt(ctx,s,x,y,col,font,al,bl){ctx.fillStyle=col||'#e6ebf5';ctx.font=font||'12px system-ui';ctx.textAlign=al||'left';ctx.textBaseline=bl||'alphabetic';ctx.fillText(s,x,y);}
function arrow(ctx,x1,y1,x2,y2,col,lw,hs){hs=hs||8;ctx.save();ctx.strokeStyle=ctx.fillStyle=col;ctx.lineWidth=lw||2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
 const a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-hs*Math.cos(a-0.4),y2-hs*Math.sin(a-0.4));ctx.lineTo(x2-hs*Math.cos(a+0.4),y2-hs*Math.sin(a+0.4));ctx.closePath();ctx.fill();ctx.restore();}
function heat(t){// 0..1 -> blue-green-yellow-red
 t=clamp(t,0,1);const stops=[[0,[30,60,200]],[0.25,[30,170,230]],[0.5,[60,200,90]],[0.75,[240,220,40]],[1,[230,40,40]]];
 for(let i=1;i<stops.length;i++)if(t<=stops[i][0]){const[a,c1]=stops[i-1],[b,c2]=stops[i];const f=(t-a)/(b-a);return`rgb(${c1.map((c,k)=>Math.round(c+(c2[k]-c)*f)).join(',')})`;}return'rgb(230,40,40)';}

/* slider row helper: returns input element */
function slider(parent,label,min,max,step,val,onInput,fmtFn){
 let g=parent.querySelector(':scope > .ctrl');if(!g){g=el('div',{class:'ctrl'});parent.appendChild(g);}
 const lab=el('label',null,label),inp=el('input',{type:'range',min,max,step,value:val}),out=el('output');
 const f=fmtFn||(v=>v);const upd=()=>{out.textContent=f(+inp.value);};upd();
 inp.addEventListener('input',()=>{upd();onInput(+inp.value);});
 g.append(lab,inp,out);inp.set=v=>{inp.value=v;upd();};return inp;}

/* ================= Persistence ================= */
const SKEY='stressQuest_v1';
let STORE={levels:{},cases:{},unlockAll:false,seenIntro:false};
try{const s=JSON.parse(localStorage.getItem(SKEY)||'null');if(s&&s.levels)STORE=Object.assign(STORE,s);}catch(e){}
if(!STORE.cases)STORE.cases={};
function save(){try{localStorage.setItem(SKEY,JSON.stringify(STORE));}catch(e){}}
function starsFor(score){return score>=90?3:score>=70?2:score>=40?1:0;}
function starHTML(n,max){max=max||3;let s='';for(let i=0;i<max;i++)s+=i<n?'★':'<span class="off">★</span>';return`<span class="stars">${s}</span>`;}
function totalStars(){return Object.values(STORE.levels).reduce((s,l)=>s+(l.stars||0),0);}

/* ================= Registry ================= */
const WORLDS=[
 {id:1,name:'World 1 · Strength Theory',sub:'Stress–strain, Mohr, failure criteria, beams, fatigue',col:'var(--w1)',icon:'🏗'},
 {id:2,name:'World 2 · Finite Element Method',sub:'Stiffness matrices, meshes, elements, BCs, results',col:'var(--w2)',icon:'🔷'},
 {id:3,name:'World 3 · Statistics for Failure Analysis',sub:'Weibull, reliability, interference, confidence, RCA',col:'var(--w3)',icon:'📊'}];
const LEVELS=[];
function defLevel(o){LEVELS.push(o);}
function isUnlocked(lv){if(STORE.unlockAll)return true;
 if(lv.id==='boss'){return Object.values(STORE.levels).filter(l=>l.stars>0).length>=8;}
 const ws=LEVELS.filter(l=>l.world===lv.world);const i=ws.indexOf(lv);if(i<=0)return true;const prev=STORE.levels[ws[i-1].id];return !!(prev&&prev.stars>0);}

/* ================= Modal & toast ================= */
function modal(html,buttons){const root=$('#modalRoot');root.innerHTML='';const m=el('div',{class:'modal'});const b=el('div',{class:'box'},html);const r=el('div',{class:'row',style:'justify-content:flex-end;margin-top:16px'});
 (buttons||[{t:'OK',pri:true}]).forEach(bt=>{r.appendChild(el('button',{class:'btn'+(bt.pri?' pri':''),onclick:()=>{root.innerHTML='';bt.fn&&bt.fn();}},bt.t));});
 b.appendChild(r);m.appendChild(b);root.appendChild(m);return b;}
function toast(s){const t=el('div',{class:'toast'},s);document.body.appendChild(t);setTimeout(()=>t.remove(),2200);}

/* ================= Task runner ================= */
// task types: num {q, ans()/ans, tol (rel), abs, unit, explain}, choice {q, opts:[{t,ok,why}]}, action {q, btn, check()->{ok,msg,partial}}
function numTask(q,ans,o){o=o||{};return Object.assign({type:'num',q,ans},o);}
function runTasks(box,tasks,onFinish){
 let i=0;const res=[];
 const val=v=>typeof v==='function'?v():v;
 function bar(){const b=el('div',{class:'tprog'});tasks.forEach((t,k)=>{const s=k<res.length?(res[k]>=0.99?'done':res[k]>0?'half':'miss'):k===i?'cur':'';b.appendChild(el('i',{class:s}));});return b;}
 function render(){
  const t=tasks[i];box.innerHTML='';if(t.onShow)t.onShow();
  box.appendChild(bar());const tk=el('div',{class:'task'});box.appendChild(tk);
  tk.appendChild(el('div',{class:'q'},`<span class="tag">Task ${i+1}/${tasks.length}</span> `+val(t.q)));
  const area=el('div');tk.appendChild(area);const fb=el('div',{class:'fb'});tk.appendChild(fb);
  const nx=el('div',{class:'row'});tk.appendChild(nx);
  let attempts=0,finished=false;const tries=t.tries||2;
  const explain=()=>t.explain?'<div style="margin-top:6px" class="small">💡 '+val(t.explain)+'</div>':'';
  function done(score,cls,msg){finished=true;res.push(score);fb.className='fb '+cls;fb.innerHTML=msg+explain();
   area.querySelectorAll('button,input').forEach(b=>b.disabled=true);if(t.onDone)t.onDone(score);
   nx.appendChild(el('button',{class:'btn pri',onclick:()=>{i++;if(i<tasks.length)render();else finish();}},i<tasks.length-1?'Next task ▶':'Finish level ✔'));
   box.replaceChild(bar(),box.firstChild);}
  function grade(r){if(finished)return;attempts++;
   if(r.ok){const sc=(attempts===1?1:0.5)*(r.partial==null?1:r.partial);done(sc,'ok','✅ <b>Correct!</b> '+(r.msg||'')+(attempts>1?' <span class="mut">(half credit – 2nd try)</span>':''));}
   else if(attempts<tries){fb.className='fb bad';fb.innerHTML='❌ '+(r.msg||'Not quite.')+' <span class="mut">Try once more (half credit).</span>';}
   else done(0,'bad','❌ '+(r.msg||'Not quite.')+(t.type!=='choice'&&t.ans!=null?` <br>The answer is <b>${fmt(val(t.ans),t.dec==null?3:t.dec)}${t.unit?' '+t.unit:''}</b>.`:'')+(t.reveal?' '+val(t.reveal):''));}
  if(t.type==='num'){
   const r=el('div',{class:'ansrow'});const inp=el('input',{type:'text',inputmode:'decimal',placeholder:'your answer'});const b=el('button',{class:'btn pri'},'Check');
   r.append(inp);if(t.unit)r.append(el('span',{class:'mut'},t.unit));r.append(b);area.appendChild(r);
   const go=()=>{const v=parseFloat(inp.value.replace(',','.'));if(!isFinite(v)){fb.className='fb info';fb.textContent='Please enter a number.';return;}
    const a=val(t.ans);const tol=Math.max((t.tol==null?0.03:t.tol)*Math.abs(a),t.abs||0);const err=Math.abs(v-a);
    if(t.logtol){const ok=Math.abs(Math.log10(Math.abs(v)/Math.abs(a)))<=t.logtol&&v*a>0;grade({ok,msg:ok?`Exact value ≈ ${fmt(a,3)}${t.unit?' '+t.unit:''}.`:`Your value is off by a factor of ${fmt(Math.max(v/a,a/v),2)}.`});return;}
    if(err<=tol)grade({ok:true,msg:`Exact value: ${fmt(a,t.dec==null?3:t.dec)}${t.unit?' '+t.unit:''}.`});
    else{let m='Not quite.';if(Math.abs(v+a)<=tol)m='Check the sign!';else if(a!==0&&[1e3,1e-3,1e6,1e-6].some(f=>Math.abs(v*f-a)<=tol))m='Magnitude off by a power of 1000 – check your units!';else if(err<=3*tol)m='Close, but outside the tolerance (±'+fmt(tol,3)+').';else m+=v>a?' Your value is too high.':' Your value is too low.';
     if(t.hint)m+=' <i>Hint: '+val(t.hint)+'</i>';grade({ok:false,msg:m});}};
   b.onclick=go;inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();});setTimeout(()=>inp.focus({preventScroll:true}),30);
  }else if(t.type==='choice'){
   const c=el('div',{class:'choices'});area.appendChild(c);const opts=t.noShuffle?t.opts:shuffle(t.opts);
   opts.forEach(o=>{const b=el('button',{class:'btn'},o.t);c.appendChild(b);b.onclick=()=>{if(finished)return;
    if(o.ok){b.classList.add('right');grade({ok:true,msg:o.why||''});}
    else{b.classList.add('wrong');b.disabled=true;grade({ok:false,msg:o.why||'That is not right.'});if(finished){[...c.children].forEach((bb,k)=>{if(opts[k].ok)bb.classList.add('right');});fb.innerHTML+='<br>Correct answer: <b>'+opts.find(x=>x.ok).t+'</b>';}}};});
  }else if(t.type==='action'){
   const b=el('button',{class:'btn pri'},t.btn||'Submit');area.appendChild(b);b.onclick=()=>grade(t.check());
   if(t.extra)area.appendChild(t.extra);
  }
 }
 function finish(){const score=Math.round(100*res.reduce((a,b)=>a+b,0)/tasks.length);onFinish(score);}
 render();
}

/* ================= Screens ================= */
let CURRENT=null;
function cleanup(){if(CURRENT&&CURRENT.stop)CURRENT.stop();CURRENT=null;}
function updHeader(){const cs=typeof CASES!=='undefined'?CASES.filter(k=>(STORE.cases[k.id]||{}).best!=null).length:0;$('#hdrStars').innerHTML='📁 '+cs+'/'+(typeof CASES!=='undefined'?CASES.length:0)+' cases &nbsp; ★ '+totalStars()+' / '+(LEVELS.length*3);}
function showMap(){cleanup();updHeader();const app=$('#app');app.innerHTML='';window.scrollTo(0,0);
 const done=LEVELS.filter(l=>(STORE.levels[l.id]||{}).stars>0).length;
 if(typeof renderCaseHome==='function')renderCaseHome(app);
 app.appendChild(el('div',{class:'hero',style:'margin-top:26px'},`<div style="flex:1;min-width:260px"><h2 style="margin:0 0 4px">🎯 Training grounds</h2><p>Drill the individual tools in three worlds. Each level starts with a concept card, then hands-on tasks with tolerance-checked answers and explanations. Case Files link back here whenever a concept needs a refresher.</p></div>
  <div><div class="small mut">Training progress: ${done}/${LEVELS.length} levels</div><div class="prog"><i style="width:${100*done/LEVELS.length}%"></i></div></div>`));
 const ws=el('div',{class:'worlds'});app.appendChild(ws);
 WORLDS.forEach(w=>{const c=el('div',{class:'world',style:`border-top:4px solid ${w.col}`});
  c.appendChild(el('h2',null,w.icon+' '+w.name));c.appendChild(el('p',{class:'sub'},w.sub));
  LEVELS.filter(l=>l.world===w.id).forEach((l,k)=>{const st=STORE.levels[l.id]||{};const un=isUnlocked(l);
   const d=el('div',{class:'lvl'+(un?'':' locked'),'data-id':l.id},`<div class="num" style="background:${w.col}">${un?w.id+'-'+(k+1):'🔒'}</div><div class="t"><b>${l.title}</b><small>${l.short}</small></div><div>${starHTML(st.stars||0)}<div class="small mut" style="text-align:right">${st.best!=null?'best '+st.best+'%':''}</div></div>`);
   d.onclick=()=>{if(un)openLevel(l.id);else toast('Earn at least 1 ★ in the previous level to unlock (or enable "unlock all" in ⚙).');};c.appendChild(d);});
  ws.appendChild(c);});
 const boss=LEVELS.find(l=>l.id==='boss');
 if(boss){const un=isUnlocked(boss);const st=STORE.levels.boss||{};
  const b=el('div',{class:'boss'},`<div style="font-size:40px">🐉</div><div style="flex:1;min-width:220px"><h2>Final Boss: The Failure Review Board</h2><div class="mut small">${boss.short} ${un?'':'<br>🔒 Unlocks after earning stars in 8 levels (or enable "unlock all" in ⚙).'}</div></div><div>${starHTML(st.stars||0)}</div>`);
  const bt=el('button',{class:'btn pri'},un?'Fight!':'Locked');bt.disabled=!un;bt.onclick=()=>openLevel('boss');b.appendChild(bt);app.appendChild(b);}
}
function openLevel(id){const lv=LEVELS.find(l=>l.id===id);
 modal(`<div class="tag">${lv.world?WORLDS[lv.world-1].name:'Final challenge'}</div><h2>📖 ${lv.title}</h2>${lv.concept}`,[{t:'Back to map',fn:()=>{}},{t:'Start level ▶',pri:true,fn:()=>startLevel(lv)}]);}
function startLevel(lv){cleanup();const app=$('#app');app.innerHTML='';window.scrollTo(0,0);
 const head=el('div',{class:'lvhead'});head.appendChild(el('button',{class:'btn sm',onclick:showMap},'◀ Map'));
 head.appendChild(el('h2',null,lv.title));head.appendChild(el('span',{class:'tag'},lv.world?WORLDS[lv.world-1].name:'Boss'));
 head.appendChild(el('button',{class:'btn sm',onclick:()=>modal(`<h2>📖 ${lv.title}</h2>${lv.concept}`)},'📖 Concept'));
 head.appendChild(el('button',{class:'btn sm',onclick:()=>startLevel(lv)},'↻ New parameters'));
 app.appendChild(head);
 const wrap=el('div',{class:'levelwrap'});const sim=el('div',{class:'card'});const side=el('div',{class:'card'});wrap.append(sim,side);app.appendChild(wrap);
 const inst=lv.build(sim);CURRENT=inst;
 runTasks(side,inst.tasks,score=>{const prev=STORE.levels[lv.id]||{};const stars=starsFor(score);
  STORE.levels[lv.id]={stars:Math.max(prev.stars||0,stars),best:Math.max(prev.best||0,score)};save();updHeader();
  modal(`<div class="results"><h2>${stars===3?'Outstanding!':stars===2?'Well done!':stars===1?'Level cleared':'Keep practicing'}</h2><div class="big">${'★'.repeat(stars)}<span style="color:#3a4560">${'★'.repeat(3-stars)}</span></div><p>Score: <b>${score}%</b> ${prev.best!=null?'· previous best '+prev.best+'%':''}</p><p class="mut small">${lv.takeaway||''}</p></div>`,
   [{t:'Replay (new numbers)',fn:()=>startLevel(lv)},{t:'Back to map',pri:true,fn:showMap}]);});
}
function showGlossary(){cleanup();const app=$('#app');app.innerHTML='';window.scrollTo(0,0);
 app.appendChild(el('div',{class:'lvhead'},'<h2>📘 Cheat sheet – formulas &amp; concepts</h2>'));app.appendChild(el('div',null,GLOSSARY));}
function settings(){modal(`<h2>Settings</h2><label><input type="checkbox" id="ua" ${STORE.unlockAll?'checked':''}> Unlock all levels (practice mode)</label><p class="mut small">Progress is stored in your browser's localStorage under "${SKEY}".</p><button class="btn" id="rst">🗑 Reset all progress</button>`,
 [{t:'Close',pri:true,fn:()=>{STORE.unlockAll=$('#ua')?STORE.unlockAll:STORE.unlockAll;save();showMap();}}]);
 $('#ua').onchange=e=>{STORE.unlockAll=e.target.checked;save();};
 $('#rst').onclick=()=>{if(confirm('Reset all progress?')){STORE={levels:{},cases:{},unlockAll:false,seenIntro:true};save();$('#modalRoot').innerHTML='';showMap();}};}
