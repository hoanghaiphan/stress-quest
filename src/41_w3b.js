defLevel({id:'w3l4',world:3,title:'Scatter, Confidence & Allowables',short:'Log-normal fatigue data, confidence intervals, B-basis, outliers',
concept:`<p>Fatigue lives at one stress level scatter over a factor of 3–10. log₁₀N is usually close to <b>normal</b> → N is <b>log-normal</b> (positive, right-skewed, multiplicative effects). So do statistics on x = log₁₀N.</p>
<div class="formula">x̄ = Σx<sub>i</sub>/n &nbsp;&nbsp; s = √[Σ(x<sub>i</sub> − x̄)²/(n − 1)]</div>
<p><b>Confidence interval of the mean</b> (95 %, two-sided):</p>
<div class="formula">x̄ ± t<sub>0.975, n−1</sub> · s/√n &nbsp;&nbsp; (n = 10: t = 2.262)</div>
<p><b>Design allowables</b> cover the population, not just the mean (one-sided tolerance limits):</p>
<div class="formula">B-basis: 90 % of the population exceeds it, with 95 % confidence → x<sub>B</sub> = x̄ − k<sub>B</sub>·s (n = 10: k<sub>B</sub> = 2.355)<br>A-basis: 99 % / 95 % → x<sub>A</sub> = x̄ − k<sub>A</sub>·s (n = 10: k<sub>A</sub> = 3.981)</div>
<p><b>Outliers</b> – Grubbs' test: G = max|x<sub>i</sub> − x̄|/s; for n = 10, α = 0.05 (two-sided) G<sub>crit</sub> = 2.290. A statistical outlier is a <i>question</i>, not a licence to delete: inspect the fracture surface (defect? wrong test?) first.</p>`,
takeaway:'Work in log-life; the mean ± CI describes the average, tolerance-based A/B allowables protect the population.',
build(sim){
 const n=10,mu=rnd(5.0,5.8),sd=rnd(0.12,0.25);let x=[...Array(n)].map(()=>mu+sd*randn());const out=Math.random()<0.5;
 if(out)x[rint(0,n-1)]=mu-sd*rnd(4.2,5.5);
 x=x.map(v=>Math.round(v*1000)/1000);let xb,s,G,gi;
 const recalc=()=>{xb=mean(x);s=stdev(x);gi=0;x.forEach((v,i)=>{if(Math.abs(v-xb)>Math.abs(x[gi]-xb))gi=i;});G=Math.abs(x[gi]-xb)/s;};recalc();
 if(!out&&G>2.2){/* keep clean data clearly non-outlier */const k=gi;x[k]=Math.round((xb+(x[k]-xb)*0.6)*1000)/1000;recalc();}
 const isOut=G>2.290;const tv=2.262,kB=2.355;const ciL=xb-tv*s/Math.sqrt(n),ciU=xb+tv*s/Math.sqrt(n),xB=xb-kB*s;
 let showCI=false,showB=false,showOut=false;
 sim.appendChild(el('div',{class:'small mut'},`Constant-amplitude fatigue test, ${n} specimens at the same stress level. Statistics are done on x = log₁₀N.`));
 const C=makeCanvas(sim,680,330),ctx=C.ctx;
 const tb=el('div',{style:'margin-top:6px'});sim.appendChild(tb);
 tb.innerHTML='<table class="dt"><tr><th>#</th>'+x.map((_,i)=>`<td>${i+1}</td>`).join('')+'</tr><tr><th>N (cycles)</th>'+x.map(v=>`<td>${fmt(Math.pow(10,v),0)}</td>`).join('')+'</tr><tr><th>x = log₁₀N</th>'+x.map(v=>`<td>${v.toFixed(3)}</td>`).join('')+`</tr></table><div class="small" style="margin-top:6px">Sample statistics of x: <b>x̄ = ${xb.toFixed(4)}</b>, <b>s = ${s.toFixed(4)}</b> (n = ${n})</div>`;
 function draw(){C.clear();const lo=Math.min(...x,xb-4*s)-0.1,hi=Math.max(...x,xb+3.5*s)+0.1;const P=plotArea(ctx,60,20,600,240,[lo,hi],[0,1/(s*Math.sqrt(2*Math.PI))*1.25]);
  P.axes('x = log₁₀ N','density',{ny:3,yoff:40});
  P.line(v=>Math.exp(-0.5*((v-xb)/s)**2)/(s*Math.sqrt(2*Math.PI)),lo,hi,'#4fc3f7',2.2);
  if(showCI){ctx.fillStyle='#66bb6a33';ctx.fillRect(P.X(ciL),P.y,P.X(ciU)-P.X(ciL),P.h);txt(ctx,'95 % CI of mean',P.X(ciU)+4,P.y+14,'#66bb6a','11px system-ui');}
  if(showB){ctx.strokeStyle='#ef5350';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(P.X(xB),P.y);ctx.lineTo(P.X(xB),P.y+P.h);ctx.stroke();txt(ctx,'B-basis',P.X(xB)+4,P.y+30,'#ef5350','bold 11px system-ui');}
  x.forEach((v,i)=>dot(ctx,P.X(v),P.Y(0)-10-((i*7)%4)*9,6,i===gi&&isOut&&showOut?'#ef5350':'#ffb74d','#0c111b'));
  ctx.strokeStyle='#ffffff88';ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(P.X(xb),P.y);ctx.lineTo(P.X(xb),P.y+P.h);ctx.stroke();ctx.setLineDash([]);txt(ctx,'x̄',P.X(xb)+4,P.y+48,'#fff');
  txt(ctx,`N axis: 10^x  (x̄ → ${fmt(Math.pow(10,xb),0)} cycles)`,P.x+P.w,P.y+P.h+44,'#9aa6bf','11px system-ui','right');}
 draw();
 return{tasks:[
  numTask('Compute the <b>lower bound of the 95 % confidence interval</b> of the mean log-life x̄.',ciL,{abs:0.01,tol:0,dec:3,explain:`x̄ − t·s/√n = ${xb.toFixed(4)} − 2.262·${s.toFixed(4)}/√10 = ${ciL.toFixed(3)} → ${fmt(Math.pow(10,ciL),0)} cycles. This bounds the <i>mean</i> life only.`,onDone:()=>{showCI=true;draw();}}),
  numTask('Compute the <b>B-basis allowable life</b> in cycles: N<sub>B</sub> = 10^(x̄ − 2.355·s).',Math.pow(10,xB),{unit:'cycles',logtol:0.01,explain:`x<sub>B</sub> = ${xb.toFixed(4)} − 2.355·${s.toFixed(4)} = ${xB.toFixed(3)} → N<sub>B</sub> = ${fmt(Math.pow(10,xB),0)} cycles – a factor ${fmt(Math.pow(10,xb-xB),1)} below the median life. (Tolerance ±2.3 %)`,onDone:()=>{showB=true;draw();}}),
  {type:'choice',q:'What exactly does a <b>B-basis</b> value guarantee?',opts:[
   {t:'At least 90 % of the population exceeds it, stated with 95 % confidence',ok:true,why:'Two percentages: population coverage (90 %) and confidence in the estimate from a finite sample (95 %). A-basis: 99 %/95 %.'},
   {t:'The mean value with 95 % confidence',why:'That is a confidence bound on the mean, not a tolerance bound on the population.'},
   {t:'90 % of the specimens in this test exceeded it',why:'It is about the population, inferred from the sample including sampling uncertainty.'},
   {t:'10 % probability of failure at the mean life',why:'At the median life 50 % have failed.'}]},
  numTask('Grubbs test: compute <b>G = max|x<sub>i</sub> − x̄| / s</b> for the most extreme specimen.',G,{tol:0.02,dec:3,onDone:()=>{showOut=true;draw();},explain:`Most extreme: specimen #${gi+1}, x = ${x[gi].toFixed(3)} → G = ${fmt(Math.abs(x[gi]-xb),4)}/${s.toFixed(4)} = ${fmt(G,3)}.`}),
  {type:'choice',q:`With G<sub>crit</sub> = 2.290 (n = 10, α = 0.05), is specimen #${gi+1} a statistical outlier, and what do you do?`,opts:[
   {t:'Yes (G > G_crit) – investigate the specimen (fractography, test log) before deciding to exclude it',ok:isOut,why:`G = ${fmt(G,3)}${isOut?' > ':' < '}2.290.`},
   {t:'No (G ≤ G_crit) – keep it; the scatter is consistent with a normal sample',ok:!isOut,why:`G = ${fmt(G,3)}${isOut?' > ':' < '}2.290.`},
   {t:'Yes – delete it immediately to get a nicer allowable',ok:false,why:'Never delete without a physical reason: an early failure may reveal a real defect population (e.g. inclusions) that also exists in service parts!'}],
   explain:isOut?'An early failure 4–5 s below the mean often points to a different failure mechanism (e.g. pore or inclusion initiation). If it is real, the "outlier" may be the most important data point.':'Apparent extremes are expected in small samples; only a test result plus a physical explanation justifies exclusion.'},
  {type:'choice',q:'Why are fatigue lives usually analysed as <b>log-normal</b> (or Weibull) rather than normal?',opts:[
   {t:'Lives are positive and right-skewed, spreading over decades; log₁₀N is approximately normal',ok:true,why:'Multiplicative scatter sources (defect size, surface, microstructure) produce log-normal behaviour; a normal fit could even predict negative lives.'},
   {t:'Because the normal distribution has no standard deviation',why:'It does – but symmetric scatter does not match fatigue data.'},
   {t:'Because log-normal always gives longer lives',why:'The choice is about fitting the data shape, not about optimism.'},
   {t:'Fatigue lives are discrete counts',why:'Cycle counts are large; discreteness is irrelevant.'}]}
 ]};}});

defLevel({id:'w3l5',world:3,title:'Root Cause Toolbox',short:'Pareto chart, fishbone (Ishikawa 6M), FMEA RPN & severity',
concept:`<p><b>Pareto principle</b>: ~80 % of the problems come from ~20 % of the causes. Sort causes by frequency (or cost), plot bars in descending order with a cumulative-% line, attack the "vital few" first.</p>
<p><b>Fishbone (Ishikawa) diagram</b>: brainstorm potential causes of an effect, grouped by the <b>6M</b>: Man (people), Machine, Method, Material, Measurement, Mother Nature (environment). Then verify the likely ones with data (5 Whys, tests).</p>
<p><b>FMEA</b> (Failure Mode and Effects Analysis) rates each failure mode 1–10:</p>
<div class="formula">RPN = S × O × D &nbsp;&nbsp; (Severity × Occurrence × Detection; high D = hard to detect)</div>
<p>RPN ranks risks, but a high <b>severity</b> (S = 9–10: safety / legal) needs action regardless of RPN – that is why the AIAG-VDA FMEA (2019) replaced RPN ranking by <b>Action Priority</b> tables that weigh S first.</p>`,
takeaway:'Pareto focuses effort, fishbone structures hypotheses, FMEA ranks risks – but severity 9–10 always gets attention.',
build(sim){
 const names=['Porosity','Cold laps','Cracks','Dimensional','Inclusions','Surface finish','Misruns'];let cnt;
 for(let k=0;k<200;k++){cnt=names.map(()=>rint(3,60));const srt=cnt.slice().sort((a,b)=>b-a);if(new Set(srt).size<srt.length)continue;const tot=srt.reduce((a,b)=>a+b,0);let c=0,ok=true;srt.forEach(v=>{c+=v;if(Math.abs(c/tot-0.8)<0.025)ok=false;});if(ok&&srt[0]>srt[1]+3)break;}
 const tot=cnt.reduce((a,b)=>a+b,0);const order=names.map((n,i)=>i).sort((a,b)=>cnt[b]-cnt[a]);let cum=0,n80=0;for(const i of order){cum+=cnt[i];n80++;if(cum/tot>=0.8)break;}
 let picked=[],pmist=0;
 const pool={'Man':['Operator not trained on the new torque procedure','Inspector fatigue on night shift'],'Machine':['Worn cutting tool not replaced','Spindle runout out of tolerance'],'Method':['Work instruction omits tempering step','Clamping sequence not specified'],'Material':['Bar stock with sulphide inclusions from new supplier','Wrong alloy delivered (mix-up)'],'Measurement':['Torque wrench out of calibration','Gauge R&R of 45 %'],'Mother Nature':['High humidity in paint shop','Temperature swings in the hall overnight']};
 const cats=Object.keys(pool);const items=shuffle(cats.map(c=>({t:pick(pool[c]),c,a:null})));
 const fm=[['Bolt loosens (vibration)',rint(5,7),rint(5,8),rint(4,7)],['Weld crack at bracket',10,rint(2,3),rint(2,3)],['Paint blistering',rint(3,4),rint(5,7),rint(4,6)],['Seal leaks oil',rint(5,7),rint(4,6),rint(5,8)],['Connector corrosion',rint(4,6),rint(3,5),rint(6,8)]];
 for(let g=0;g<20;g++){const rp=fm.map(f=>f[1]*f[2]*f[3]);const mx=rp.indexOf(Math.max(...rp));if(rp.filter(v=>v===rp[mx]).length===1)break;fm[mx][2]=Math.min(10,fm[mx][2]+1);}
 const rpn2=fm.map(f=>f[1]*f[2]*f[3]);const top=rpn2.indexOf(Math.max(...rpn2));
 const C=makeCanvas(sim,680,250),ctx=C.ctx;const area=el('div',{style:'margin-top:8px'});sim.appendChild(area);
 function drawPareto(){C.clear();const P=plotArea(ctx,60,20,560,170,[0,names.length],[0,Math.max(...cnt)*1.1]);P.axes(null,'defects',{xt:[],ny:4});
  txt(ctx,`Casting defects – last quarter (total ${tot})`,P.x+4,P.y-6,'#c9d2e6','12px system-ui');
  let c=0;const pts=[];picked.forEach((i,k)=>{c+=cnt[i];ctx.fillStyle='#4fc3f7';ctx.fillRect(P.X(k)+6,P.Y(cnt[i]),P.X(1)-P.X(0)-12,P.Y(0)-P.Y(cnt[i]));txt(ctx,cnt[i],P.X(k+0.5),P.Y(cnt[i])-4,'#e6ebf5','11px system-ui','center');
   txt(ctx,names[i],P.X(k+0.5),P.Y(0)+14,'#9aa6bf','10.5px system-ui','center');pts.push([P.X(k+1)-((P.X(1)-P.X(0))/2),P.y+P.h-P.h*c/tot]);});
  ctx.strokeStyle='#ffb74d';ctx.lineWidth=2;ctx.beginPath();pts.forEach((p,k)=>k?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();pts.forEach(p=>dot(ctx,p[0],p[1],3.5,'#ffb74d'));
  const y80=P.y+P.h*0.2;ctx.setLineDash([5,4]);ctx.strokeStyle='#ef5350';ctx.beginPath();ctx.moveTo(P.x,y80);ctx.lineTo(P.x+P.w,y80);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'80 %',P.x+P.w+4,y80+4,'#ef5350','11px system-ui');txt(ctx,'100 %',P.x+P.w+4,P.y+4,'#ffb74d','11px system-ui');txt(ctx,'cum. %',P.x+P.w+4,P.y+P.h/2,'#ffb74d','10.5px system-ui');}
 function paretoUI(){area.innerHTML='<div class="small mut">Click the causes from <b>most</b> to <b>least</b> frequent to build the Pareto chart:</div>';
  names.forEach((nm,i)=>{const c=el('span',{class:'chip'+(picked.includes(i)?' done':'')},`${nm}: ${cnt[i]}`);c.onclick=()=>{if(picked.includes(i))return;const exp=order[picked.length];if(i!==exp&&cnt[i]!==cnt[exp]){pmist++;toast('Not the largest remaining count!');return;}picked.push(i);drawPareto();paretoUI();};area.appendChild(c);});}
 function drawFish(){C.clear();ctx.strokeStyle='#9aa6bf';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(30,125);ctx.lineTo(560,125);ctx.stroke();
  ctx.fillStyle='#7a3236';ctx.fillRect(560,95,110,60);txt(ctx,'Shaft fails',615,120,'#fff','bold 12px system-ui','center');txt(ctx,'early',615,138,'#fff','bold 12px system-ui','center');
  cats.forEach((c,k)=>{const x=110+(k%3)*165,up=k<3;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,up?25:225);ctx.lineTo(x+60,125);ctx.stroke();txt(ctx,c,x,up?18:243,'#ffb74d','bold 12px system-ui','center');
   items.filter(it=>it.a===c).forEach((it,j)=>txt(ctx,'• '+(it.t.length>30?it.t.slice(0,29)+'…':it.t),x+8+j*0,up?48+j*14:200-j*14,'#c9d2e6','10px system-ui'));});}
 function fishUI(){area.innerHTML='<div class="small mut">Assign each potential cause to its 6M category:</div>';items.forEach(it=>{const r=el('div',{class:'row',style:'margin-top:4px'});r.appendChild(el('span',{class:'small',style:'flex:1;min-width:200px'},it.t));
  const s=el('select');s.appendChild(el('option',{value:''},'– category –'));cats.forEach(c=>{const o=el('option',{value:c},c);if(it.a===c)o.selected=true;s.appendChild(o);});s.onchange=()=>{it.a=s.value||null;drawFish();};r.appendChild(s);area.appendChild(r);});}
 function fmeaUI(hl){C.clear();txt(ctx,'FMEA worksheet – see table below',20,30,'#c9d2e6','bold 13px system-ui');const P=plotArea(ctx,60,50,560,170,[0,fm.length],[0,Math.max(...rpn2)*1.15]);P.axes(null,'RPN',{xt:[],ny:4});
  if(hl)fm.forEach((f,k)=>{ctx.fillStyle=f[1]>=9?'#ef5350':'#ba68c8';ctx.fillRect(P.X(k)+10,P.Y(rpn2[k]),P.X(1)-P.X(0)-20,P.Y(0)-P.Y(rpn2[k]));txt(ctx,rpn2[k]+(f[1]>=9?' (S=10!)':''),P.X(k+0.5),P.Y(rpn2[k])-4,'#e6ebf5','11px system-ui','center');txt(ctx,f[0].split(' ')[0]+' '+f[0].split(' ')[1],P.X(k+0.5),P.Y(0)+14,'#9aa6bf','10.5px system-ui','center');});
  else txt(ctx,'(RPN bars appear after you answer)',P.x+P.w/2,P.y+P.h/2,'#9aa6bf','12px system-ui','center');
  area.innerHTML='<table class="dt"><tr><th style="text-align:left">Failure mode</th><th>S</th><th>O</th><th>D</th>'+(hl?'<th>RPN</th>':'')+'</tr>'+fm.map((f,k)=>`<tr><td style="text-align:left">${f[0]}</td><td>${f[1]}</td><td>${f[2]}</td><td>${f[3]}</td>${hl?'<td>'+rpn2[k]+'</td>':''}</tr>`).join('')+'</table>';}
 drawPareto();paretoUI();
 const weld=fm[1];
 return{tasks:[
  {type:'action',q:'<b>Pareto chart</b>: click the defect types in <b>descending</b> order until all bars are placed, then submit.',btn:'Submit Pareto chart',tries:99,onShow:()=>{drawPareto();paretoUI();},
   check:()=>picked.length<names.length?{ok:false,msg:'Place all defect types first.'}:{ok:true,partial:Math.max(0.4,1-0.15*pmist),msg:`Done with ${pmist} wrong click(s).`},explain:'Descending bars + cumulative line show at a glance where the effort pays off.'},
  numTask('What is the <b>minimum number of defect types</b> that together account for at least <b>80 %</b> of all defects?',n80,{abs:0,tol:0,dec:0,explain:`Cumulative: ${(()=>{let c=0;return order.map(i=>{c+=cnt[i];return names[i]+' '+fmt(100*c/tot,1)+'%';}).join(' → ');})()}. The first ${n80} are the "vital few".`}),
  {type:'action',q:'<b>Fishbone</b>: assign every potential cause of the early shaft failures to the correct <b>6M</b> category, then submit.',btn:'Check fishbone',onShow:()=>{drawFish();fishUI();},
   check:()=>{if(items.some(it=>!it.a))return{ok:false,msg:'Assign all causes first.'};const good=items.filter(it=>it.a===it.c).length;return{ok:good>=items.length-1,partial:good/items.length,msg:`${good}/${items.length} correctly classified.`+(good<items.length?' Misplaced: '+items.filter(it=>it.a!==it.c).map(it=>`"${it.t}" → ${it.c}`).join('; '):'')};},
   reveal:()=>items.map(it=>`${it.t} → <b>${it.c}</b>`).join('<br>'),explain:'Categories structure the brainstorming so no area is forgotten – but the fishbone only lists hypotheses; each must be verified with data.'},
  {type:'choice',q:'<b>FMEA</b>: which failure mode has the <b>highest RPN</b>?',onShow:()=>fmeaUI(false),opts:fm.map((f,k)=>({t:f[0],ok:k===top,why:`RPN = ${f[1]}×${f[2]}×${f[3]} = ${rpn2[k]}.`})),onDone:()=>fmeaUI(true),explain:`Highest: ${fm[top][0]} with RPN ${rpn2[top]}.`},
  {type:'choice',q:`"${weld[0]}" has S = 10 but only RPN = ${rpn2[1]}. How should it be treated?`,opts:[
   {t:'It needs action anyway: severity 9–10 (safety) gets priority regardless of RPN (AIAG-VDA Action Priority)',ok:true,why:'A rare but catastrophic failure can hide behind a low RPN – the product S×O×D treats S=10,O=2,D=2 like S=2,O=5,D=4!'},
   {t:'Ignore it – the RPN is below the others',why:'Pure RPN ranking is exactly the known weakness of classic FMEA.'},
   {t:'Lower the severity rating to 8 to be consistent',why:'Severity is fixed by the effect (injury, legal); only design changes can reduce it.'},
   {t:'Improve detection only, then close it',why:'Better detection helps, but for S=10 the preferred actions reduce occurrence or eliminate the mode by design.'}]}
 ]};}});
