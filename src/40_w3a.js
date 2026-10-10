/* ===================== WORLD 3 ===================== */
defLevel({id:'w3l1',world:3,title:'Weibull Lab',short:'Median ranks, Weibull probability plot, read β and η',
concept:`<p>The 2-parameter <b>Weibull distribution</b> is the workhorse for life data:</p>
<div class="formula">F(t) = 1 − exp[−(t/η)<sup>β</sup>] &nbsp;&nbsp; R(t) = 1 − F(t)</div>
<p>β = <b>shape</b> (slope), η = <b>scale</b> (characteristic life: F(η) = 63.2 % for any β). Taking logs twice linearises it:</p>
<div class="formula">ln[−ln(1 − F)] = β·ln t − β·ln η &nbsp;&nbsp; → straight line, slope β, crosses F = 63.2 % at t = η</div>
<p>To plot n sorted failure times we estimate F with <b>median ranks</b> (Bernard's approximation):</p>
<div class="formula">F<sub>i</sub> ≈ (i − 0.3) / (n + 0.4)</div>
<p><b>Bathtub curve</b> interpretation of β:</p>
<ul><li>β &lt; 1: decreasing failure rate – <b>infant mortality</b> (manufacturing defects, burn-in helps)</li>
<li>β ≈ 1: constant failure rate – <b>random</b> failures (exponential distribution, MTTF = η)</li>
<li>β &gt; 1: increasing failure rate – <b>wear-out</b> (fatigue β≈2–4, preventive replacement makes sense)</li></ul>`,
takeaway:'Median ranks → Weibull plot → slope β (failure mode type), F = 63.2 % crossing → η.',
build(sim){
 const n=8;let t,beta0,eta0,fit;
 for(let k=0;k<200;k++){beta0=pick([0.6,0.7,1.0,2.0,2.8,3.5]);eta0=Math.round(rnd(800,6000)/10)*10;
  const us=shuffle([...Array(n)].map((_,i)=>(i+rnd(0.15,0.85))/n));t=us.map(u=>Math.round(eta0*Math.pow(-Math.log(1-u),1/beta0))).filter(v=>v>0).sort((a,b)=>a-b);
  if(t.length<n||new Set(t).size<n)continue;const F=t.map((_,i)=>(i+1-0.3)/(n+0.4));const r=linreg(t.map(Math.log),F.map(f=>Math.log(-Math.log(1-f))));fit={beta:r.m,eta:Math.exp(-r.b/r.m)};
  const b=fit.beta;if((b>0.82&&b<0.95)||(b>1.12&&b<1.3))continue;const cf=x=>x<0.95?0:x<=1.12?1:2;if(cf(b)!==cf(beta0))continue;break;}
 const Fr=t.map((_,i)=>(i+1-0.3)/(n+0.4));const cat=fit.beta<0.95?'inf':fit.beta<=1.12?'rand':'wear';
 const X=t.map(Math.log),Y=Fr.map(f=>Math.log(-Math.log(1-f)));
 let showRank3=false,showFit=false,showReadout=false;
 const xr=[Math.floor(Math.log10(t[0])*2)/2*Math.LN10-0.2,Math.ceil(Math.log10(t[n-1])*2)/2*Math.LN10+0.2];
 const C=makeCanvas(sim,680,420),ctx=C.ctx;const P=plotArea(ctx,70,20,420,340,xr,[Math.log(-Math.log(0.99)),Math.log(-Math.log(0.01))]);
 let L=[{x:xr[0]+0.25*(xr[1]-xr[0]),y:-3},{x:xr[0]+0.75*(xr[1]-xr[0]),y:-2.2}];let hov=null;
 const line=()=>{const m=(L[1].y-L[0].y)/(L[1].x-L[0].x);return{beta:m,eta:Math.exp(L[0].x-L[0].y/m)};};
 const tbl=el('div',{style:'margin-top:6px'});
 function table(){tbl.innerHTML='<table class="dt"><tr><th>i</th>'+t.map((_,i)=>`<td>${i+1}</td>`).join('')+'</tr><tr><th>t (h)</th>'+t.map(v=>`<td>${v}</td>`).join('')+'</tr><tr><th>F<sub>i</sub> median rank</th>'+Fr.map((f,i)=>`<td>${i===2&&!showRank3?'<b style="color:#ffb74d">?</b>':fmt(f,3)}</td>`).join('')+'</tr></table>';}
 function draw(){C.clear();const Fticks=[0.01,0.02,0.05,0.1,0.2,0.3,0.5,0.632,0.8,0.9,0.95,0.99];
  const xt=[];for(let d=Math.floor(xr[0]/Math.LN10);d<=Math.ceil(xr[1]/Math.LN10);d++)for(const mm of[1,2,5])if(Math.log(mm*10**d)>=xr[0]&&Math.log(mm*10**d)<=xr[1])xt.push(Math.log(mm*10**d));
  P.axes('time t (h, log scale)','unreliability F (%)',{xt,xf:v=>fmt(Math.exp(v),0),yt:Fticks.map(f=>Math.log(-Math.log(1-f))),yf:v=>fmt(100*(1-Math.exp(-Math.exp(v))),1),yoff:46});
  ctx.strokeStyle='#ffd54f66';ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(P.x,P.Y(0));ctx.lineTo(P.x+P.w,P.Y(0));ctx.stroke();ctx.setLineDash([]);txt(ctx,'63.2 %',P.x+P.w+4,P.Y(0)+4,'#ffd54f','11px system-ui');
  P.clip();
  if(showFit){const f=x=>fit.beta*(x-Math.log(fit.eta));P.line(f,xr[0],xr[1],'#66bb6a',1.5,2,[6,4]);}
  const m=(L[1].y-L[0].y)/(L[1].x-L[0].x);ctx.strokeStyle='#4fc3f7';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(P.X(xr[0]),P.Y(L[0].y+m*(xr[0]-L[0].x)));ctx.lineTo(P.X(xr[1]),P.Y(L[0].y+m*(xr[1]-L[0].x)));ctx.stroke();
  L.forEach(p=>dot(ctx,P.X(p.x),P.Y(p.y),8,'#4fc3f7','#fff'));
  X.forEach((x,i)=>{if(i===2&&!showRank3)return;dot(ctx,P.X(x),P.Y(Y[i]),5,'#ffb74d','#0c111b');});
  ctx.restore();
  const lx=505;txt(ctx,`n = ${n} failures`,lx,40,'#e6ebf5','bold 12px system-ui');txt(ctx,'● data (median ranks)',lx,62,'#ffb74d');txt(ctx,'━ your line (drag handles)',lx,82,'#4fc3f7');if(showFit)txt(ctx,'┅ least-squares fit',lx,102,'#66bb6a');
  if(showReadout){const l=line();txt(ctx,`your line: β = ${fmt(l.beta,2)}`,lx,135,'#4fc3f7','bold 12px system-ui');txt(ctx,`η = ${fmt(l.eta,0)} h`,lx+66,153,'#4fc3f7','bold 12px system-ui');}
  if(!showRank3)txt(ctx,'(point 3 appears once its rank is known)',lx,190,'#9aa6bf','10.5px system-ui');
  if(hov&&P.inside(hov)){const tt=Math.exp(P.iX(hov.x)),FF=1-Math.exp(-Math.exp(P.iY(hov.y)));const lab=`t=${fmt(tt,0)} h, F=${fmt(100*FF,1)} %`;ctx.fillStyle='#000c';ctx.fillRect(hov.x+8,hov.y-24,lab.length*6.4,18);txt(ctx,lab,hov.x+12,hov.y-11,'#ffd54f','11.5px system-ui');}}
 let dk=-1;C.hover=p=>{hov=p;draw();};
 C.drag(p=>{dk=-1;L.forEach((q,k)=>{if(Math.hypot(p.x-P.X(q.x),p.y-P.Y(q.y))<14)dk=k;});if(dk<0)return false;},p=>{hov=p;const nx=clamp(P.iX(p.x),xr[0],xr[1]),ny=clamp(P.iY(p.y),-4.6,1.5);const o=L[1-dk];if(Math.abs(nx-o.x)<0.05)return;L[dk]={x:nx,y:ny};draw();});
 sim.appendChild(tbl);table();draw();
 const catTxt={inf:'β < 1: infant mortality (decreasing failure rate)',rand:'β ≈ 1: random failures (constant failure rate)',wear:'β > 1: wear-out (increasing failure rate)'};
 return{tasks:[
  numTask(`Compute the <b>median rank F₃</b> of the 3rd failure (n = ${n}) with Bernard's approximation.`,Fr[2],{abs:0.002,tol:0,dec:4,explain:`F₃ = (3 − 0.3)/(${n} + 0.4) = ${fmt(Fr[2],4)}. Median ranks avoid F = 0 or 1 at the ends of the sample.`,onDone:()=>{showRank3=true;table();draw();}}),
  {type:'action',q:'Drag the two blue handles to fit a <b>straight line through the data points</b> (by eye, like on Weibull paper). Submit when happy.',btn:'Submit my fit',
   check:()=>{const l=line();const eb=Math.abs(l.beta-fit.beta)/fit.beta,ee=Math.abs(l.eta-fit.eta)/fit.eta;const ok=eb<=0.2&&ee<=0.12;
    return{ok,msg:ok?`Good fit! Your β = ${fmt(l.beta,2)} (LSQ ${fmt(fit.beta,2)}), η = ${fmt(l.eta,0)} h (LSQ ${fmt(fit.eta,0)} h).`:`Your line deviates too much (slope ${fmt(100*eb,0)} %, η ${fmt(100*ee,0)} % off the least-squares fit). Balance the points on both sides of the line.`};},
   onDone:()=>{showFit=true;draw();},reveal:'The green dashed least-squares line is shown now.',explain:'Rank regression (least squares on the linearised plot) is the standard analytic version of the eye-fit.'},
  numTask('Read the <b>shape parameter β</b> from the slope of the fitted (green) line. (Hover the plot for t and F readouts; slope = Δ ln(−ln(1−F)) / Δ ln t.)',fit.beta,{tol:0.12,dec:2,explain:`β ≈ ${fmt(fit.beta,2)} (true population value used to simulate: ${beta0}). With only ${n} points, β is uncertain by easily ±30 % – confidence bounds matter!`}),
  numTask('Read the <b>characteristic life η</b> (where the line crosses F = 63.2 %).',fit.eta,{unit:'h',tol:0.08,dec:0,explain:`η ≈ ${fmt(fit.eta,0)} h. At t = η, F = 1 − e⁻¹ = 63.2 % regardless of β.`,onDone:()=>{showReadout=true;draw();}}),
  {type:'choice',q:'What failure behaviour does this β indicate?',opts:['inf','rand','wear'].map(c=>({t:catTxt[c],ok:c===cat,why:`β ≈ ${fmt(fit.beta,2)}.`})),explain:'Bathtub curve: early failures (β<1) → useful-life random failures (β≈1) → wear-out (β>1).'},
  {type:'choice',q:'For which β does <b>scheduled preventive replacement</b> of a still-working part reduce failures?',opts:[
   {t:'Only β > 1 (wear-out): the failure rate increases with age',ok:true,why:'Replacing an aged part with a new one lowers the hazard only if the hazard increases with age.'},
   {t:'β < 1: replacing removes defects',why:'With β < 1 a new part is MORE likely to fail than a run-in one – replacement increases failures (burn-in/screening is the remedy).'},
   {t:'β = 1: random failures are prevented by maintenance',why:'Constant hazard: an old part is as good as new; replacement wastes money.'},
   {t:'Any β – replacement always helps',why:'Only for an increasing hazard.'}]}
 ]};}});

defLevel({id:'w3l2',world:3,title:'Reliability & B10 Life',short:'R(t), hazard rate, B-lives, MTTF and series systems',
concept:`<div class="formula">R(t) = exp[−(t/η)<sup>β</sup>] &nbsp;&nbsp; f(t) = (β/η)(t/η)<sup>β−1</sup>·e<sup>−(t/η)<sup>β</sup></sup> &nbsp;&nbsp; h(t) = f/R = (β/η)(t/η)<sup>β−1</sup></div>
<p><b>B<sub>p</sub> life</b>: time by which p % of the population has failed (bearings: B10 = L10):</p>
<div class="formula">B<sub>p</sub> = η·[−ln(1 − p/100)]<sup>1/β</sup> &nbsp;&nbsp; e.g. B10 = η·(0.10536)<sup>1/β</sup></div>
<div class="formula">MTTF = η·Γ(1 + 1/β)</div>
<p><b>Series system</b> (all k components must survive): R<sub>sys</sub> = Π R<sub>i</sub> = R<sup>k</sup> for identical parts. Parallel (redundant): R<sub>sys</sub> = 1 − Π(1 − R<sub>i</sub>).</p>
<p class="mut small">Γ(1.5) = 0.8862, Γ(1.333) = 0.8930, Γ(1.25) = 0.9064, Γ(1.4) = 0.8873, Γ(1.667) = 0.9027, Γ(2) = 1.</p>`,
takeaway:'B10 is far below η for small β; series systems are weaker than their weakest component.',
build(sim){
 const beta=pick([1.5,2,2.5,3,0.8,1.2]);const eta=Math.round(rnd(1000,8000)/100)*100;const t0=Math.round(eta*rnd(0.2,0.7)/50)*50;
 const R=t=>Math.exp(-Math.pow(t/eta,beta)),f=t=>beta/eta*Math.pow(t/eta,beta-1)*R(t),hz=t=>beta/eta*Math.pow(t/eta,beta-1);
 const B10=eta*Math.pow(-Math.log(0.9),1/beta),mttf=eta*gammaFn(1+1/beta);const target=pick([0.95,0.98,0.9]);const tT=eta*Math.pow(-Math.log(target),1/beta);const k=pick([3,4,5,6]);
 let tc=0;
 sim.appendChild(el('div',{class:'small mut'},`Component life: Weibull <b style="color:#e6ebf5">β = ${beta}, η = ${eta} h</b>`));
 const C=makeCanvas(sim,680,400),ctx=C.ctx;const tm=eta*2.2;
 const PR=plotArea(ctx,60,20,330,330,[0,tm],[0,1.05]),PF=plotArea(ctx,460,20,200,140,[0,tm],[0,Math.max(...[...Array(80)].map((_,i)=>f(tm*(i+0.5)/80)))*1.15]);
 const hmax=Math.min(hz(tm),hz(tm*0.02)*1.0+hz(tm));const PH=plotArea(ctx,460,215,200,135,[0,tm],[0,Math.max(hz(tm),hz(tm*0.03),beta/eta*1.2)]);
 function draw(){C.clear();PR.axes('t (h)','R(t)',{nx:4,ny:5});PR.line(R,0,tm,'#66bb6a',2.5);
  if(showB){ctx.setLineDash([4,4]);ctx.strokeStyle='#ffb74d';ctx.beginPath();ctx.moveTo(PR.X(0),PR.Y(0.9));ctx.lineTo(PR.X(B10),PR.Y(0.9));ctx.lineTo(PR.X(B10),PR.Y(0));ctx.stroke();ctx.setLineDash([]);txt(ctx,'B10',PR.X(B10)+4,PR.Y(0.05),'#ffb74d','bold 11px system-ui');}
  ctx.strokeStyle='#4fc3f7';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PR.X(tc),PR.Y(0));ctx.lineTo(PR.X(tc),PR.Y(1.05));ctx.stroke();dot(ctx,PR.X(tc),PR.Y(R(tc)),5,'#4fc3f7','#fff');
  txt(ctx,`t = ${fmt(tc,0)} h`,PR.X(tc)+(tc>tm*0.6?-6:6),PR.y+16,'#4fc3f7','12px system-ui',tc>tm*0.6?'right':'left');txt(ctx,`R = ${fmt(R(tc),4)}`,PR.X(tc)+(tc>tm*0.6?-6:6),PR.y+32,'#4fc3f7','bold 12px system-ui',tc>tm*0.6?'right':'left');
  PF.axes(null,'f(t)',{nx:3,ny:2,yf:v=>v.toExponential(0),yoff:44});PF.line(f,tm*0.002,tm,'#ba68c8',2);txt(ctx,'pdf',PF.x+PF.w-4,PF.y+14,'#ba68c8','11px system-ui','right');
  PH.axes('t (h)','h(t)',{nx:3,ny:2,yf:v=>v.toExponential(0),yoff:44});PH.clip();PH.line(hz,tm*0.002,tm,'#ef5350',2);ctx.restore();txt(ctx,beta>1?'hazard ↑ wear-out':beta<1?'hazard ↓ infant mortality':'constant hazard',PH.x+PH.w-4,PH.y+14,'#ef5350','11px system-ui','right');}
 let showB=false;
 const sl=slider(sim,'time t (h)',0,tm,tm/1000,0,v=>{tc=v;draw();},v=>fmt(v,0)+' h');draw();
 return{tasks:[
  numTask(`What is the <b>reliability R(t)</b> at t = ${t0} h?`,R(t0),{abs:0.005,tol:0,dec:4,explain:`R = exp[−(${t0}/${eta})<sup>${beta}</sup>] = ${fmt(R(t0),4)}. You can verify with the time slider.`}),
  numTask('Compute the <b>B10 life</b>.',B10,{unit:'h',tol:0.03,dec:0,explain:`B10 = ${eta}·(−ln 0.9)<sup>1/${beta}</sup> = ${fmt(B10,0)} h = ${fmt(100*B10/eta,1)} % of η.`,onDone:()=>{showB=true;draw();}}),
  {type:'action',q:`A customer requires <b>R = ${target}</b>. Drag the time slider to the <b>longest mission time</b> that still achieves it, then submit.`,btn:'Submit mission time',
   check:()=>{const ok=Math.abs(R(tc)-target)<=0.004;return{ok,msg:ok?`t ≈ ${fmt(tc,0)} h (exact ${fmt(tT,0)} h) – this is the B${fmt(100*(1-target),0)} life.`:`At t = ${fmt(tc,0)} h, R = ${fmt(R(tc),4)}. ${R(tc)>target?'You can go longer.':'Too long – reliability is below target.'}`};},reveal:()=>`t = ${fmt(tT,0)} h`},
  numTask('Compute the <b>mean time to failure</b> MTTF = η·Γ(1 + 1/β).',mttf,{unit:'h',tol:0.03,dec:0,explain:`Γ(1 + 1/${beta}) = ${fmt(gammaFn(1+1/beta),4)} → MTTF = ${fmt(mttf,0)} h. Note R(MTTF) = ${fmt(R(mttf),3)} – the "mean life" is not a safe life!`,hint:'Use the Γ values on the concept card (or Γ(x) via a calculator).'}),
  numTask(`A machine uses <b>${k} identical components in series</b>. What is the system reliability at t = ${t0} h?`,Math.pow(R(t0),k),{abs:0.005,tol:0,dec:4,explain:`R<sub>sys</sub> = R(t)<sup>${k}</sup> = ${fmt(R(t0),4)}<sup>${k}</sup> = ${fmt(Math.pow(R(t0),k),4)}. For Weibull parts in series: η<sub>sys</sub> = η·k<sup>−1/β</sup>, same β.`})
 ]};}});

defLevel({id:'w3l3',world:3,title:'Stress–Strength Interference',short:'Overlapping load & strength distributions; reach a reliability target cheaply',
concept:`<p>Both the applied stress L and the strength S scatter. Failure occurs when L &gt; S. For independent normal distributions the margin M = S − L is normal too:</p>
<div class="formula">μ<sub>M</sub> = μ<sub>S</sub> − μ<sub>L</sub> &nbsp;&nbsp; σ<sub>M</sub> = √(σ<sub>S</sub>² + σ<sub>L</sub>²)</div>
<div class="formula">z = (μ<sub>S</sub> − μ<sub>L</sub>) / √(σ<sub>S</sub>² + σ<sub>L</sub>²) &nbsp;&nbsp;&nbsp; R = Φ(z) &nbsp;&nbsp; P<sub>f</sub> = 1 − Φ(z)</div>
<p>Handy values: Φ(1.28) = 0.90, Φ(1.645) = 0.95, Φ(2.326) = 0.99, Φ(3.09) = 0.999, Φ(3.72) = 0.9999.</p>
<p>The <b>central safety factor</b> μ<sub>S</sub>/μ<sub>L</sub> alone says little: the same factor can give 99.99 % or 90 % reliability depending on the scatter. Reducing scatter (process control, inspection, better load knowledge) can be cheaper than adding strength.</p>`,
takeaway:'z = (μS − μL)/√(σS² + σL²) — reliability depends on both margin and scatter.',
build(sim){
 const muL=round5(rnd(200,350)),sL=round5(rnd(15,40)),Rt=pick([0.99,0.999,0.9999]);const zt=PhiInv(Rt);
 const cost=(m,s)=>0.1*m+400/s;
 let best=Infinity,bm,bs;for(let m=muL;m<=muL+400;m+=5)for(let s=8;s<=60;s++){if((m-muL)/Math.hypot(s,sL)>=zt&&cost(m,s)<best){best=cost(m,s);bm=m;bs=s;}}
 const m0=muL+round5(rnd(1.2,2.0)*sL),s0=rint(20,45);const z0=(m0-muL)/Math.hypot(s0,sL);
 let S={m:m0,s:s0};
 sim.appendChild(el('div',{class:'small mut'},`Load stress: <b style="color:#e6ebf5">μ<sub>L</sub> = ${muL} MPa, σ<sub>L</sub> = ${sL} MPa</b> (fixed by the application). Strength: adjustable. Part cost = 0.10 €/MPa · μ<sub>S</sub> + 400/σ<sub>S</sub> € (tight scatter needs costly process control).`));
 const C=makeCanvas(sim,680,360),ctx=C.ctx;const info=el('div',{class:'small',style:'margin-top:6px'});sim.appendChild(info);
 const npdf=(x,m,s)=>Math.exp(-0.5*((x-m)/s)**2)/(s*Math.sqrt(2*Math.PI));
 function draw(){C.clear();const xmax=Math.max(muL+4*sL,S.m+4*S.s,muL+450),xmin=Math.max(0,muL-4*sL);const ym=Math.max(npdf(0,0,sL),npdf(0,0,S.s))*1.15;
  const P=plotArea(ctx,60,20,600,280,[xmin,xmax],[0,ym]);P.axes('stress / strength (MPa)','probability density',{ny:4,yf:v=>v.toExponential(0),yoff:46});
  ctx.beginPath();ctx.moveTo(P.X(xmin),P.Y(0));for(let i=0;i<=400;i++){const x=xmin+(xmax-xmin)*i/400;ctx.lineTo(P.X(x),P.Y(Math.min(npdf(x,muL,sL),npdf(x,S.m,S.s))));}ctx.lineTo(P.X(xmax),P.Y(0));ctx.closePath();ctx.fillStyle='#ef535088';ctx.fill();
  P.line(x=>npdf(x,muL,sL),xmin,xmax,'#ffb74d',2.5);P.line(x=>npdf(x,S.m,S.s),xmin,xmax,'#4fc3f7',2.5);
  txt(ctx,'Load L',P.X(muL),P.Y(npdf(muL,muL,sL))-6,'#ffb74d','bold 12px system-ui','center');txt(ctx,'Strength S',P.X(S.m),P.Y(npdf(S.m,S.m,S.s))-6,'#4fc3f7','bold 12px system-ui','center');
  txt(ctx,'red: interference zone (not the failure probability itself!)',P.x+P.w,P.y+14,'#ef5350','11px system-ui','right');
  const z=(S.m-muL)/Math.hypot(S.s,sL),R=Phi(z),c=cost(S.m,S.s);
  info.innerHTML=`z = <b>${fmt(z,3)}</b> · R = <b>${R>0.99999?fmt(R,7):fmt(R,5)}</b> · P<sub>f</sub> = ${fmt((1-R)*1e6,1)} ppm · central SF μ<sub>S</sub>/μ<sub>L</sub> = ${fmt(S.m/muL,2)} · cost = <b>${fmt(c,2)} €</b>`;}
 slider(sim,'μS strength mean (MPa)',muL,muL+400,5,m0,v=>{S.m=v;draw();},v=>v+' MPa');slider(sim,'σS strength std (MPa)',8,60,1,s0,v=>{S.s=v;draw();},v=>v+' MPa');
 draw();
 return{tasks:[
  numTask(`For the <b>initial design</b> (μ<sub>S</sub> = ${m0}, σ<sub>S</sub> = ${s0} MPa): compute the safety index <b>z</b>.`,z0,{tol:0.02,dec:3,explain:`z = (${m0} − ${muL})/√(${s0}² + ${sL}²) = ${m0-muL}/${fmt(Math.hypot(s0,sL),2)} = ${fmt(z0,3)}.`}),
  numTask('What is the corresponding <b>reliability R</b> = Φ(z)?',Phi(z0),{abs:0.003,tol:0,dec:4,explain:`Φ(${fmt(z0,2)}) = ${fmt(Phi(z0),4)} → ${fmt((1-Phi(z0))*100,2)} % of parts fail – even though μ<sub>S</sub>/μ<sub>L</sub> = ${fmt(m0/muL,2)}.`}),
  {type:'action',q:`Design task: reach <b>R ≥ ${Rt}</b> (z ≥ ${fmt(zt,3)}) at <b>minimum cost</b> (within 3 % of the optimum). Use both sliders, then submit.`,btn:'Submit design',
   check:()=>{const z=(S.m-muL)/Math.hypot(S.s,sL),c=cost(S.m,S.s);if(z<zt-1e-9)return{ok:false,msg:`R = ${fmt(Phi(z),5)} < ${Rt}. Increase the margin or reduce scatter.`};
    if(c>best*1.03)return{ok:false,msg:`Reliable, but ${fmt(c,2)} € is more than 3 % above the achievable minimum. Try trading strength against scatter.`};return{ok:true,msg:`Cost ${fmt(c,2)} € (optimum ≈ ${fmt(best,2)} € at μ<sub>S</sub> ≈ ${bm}, σ<sub>S</sub> ≈ ${bs} MPa).`};},
   reveal:()=>`optimum ≈ ${fmt(best,2)} € at μ<sub>S</sub> = ${bm}, σ<sub>S</sub> = ${bs} MPa`,explain:'Both very low scatter (expensive control) and huge margins (expensive material) are costly – the optimum balances them.'},
  {type:'choice',q:'Two designs both have a central safety factor μ<sub>S</sub>/μ<sub>L</sub> = 1.5. What can you say about their reliability?',opts:[
   {t:'Nothing definite – it depends on the scatter of load and strength (z)',ok:true,why:'With small σ the reliability may be 0.99999; with large σ maybe only 0.9. The safety factor hides the statistics.'},
   {t:'Both have the same reliability',why:'Only the mean ratio is the same; z also depends on σ<sub>S</sub> and σ<sub>L</sub>.'},
   {t:'Both are 100 % reliable since SF > 1',why:'Distributions overlap – failures are possible whenever the tails interfere.'},
   {t:'Reliability = 1 − 1/SF = 33 %',why:'No such relation exists.'}]}
 ]};}});
