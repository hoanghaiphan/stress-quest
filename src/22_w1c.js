const KtHole=r=>3.0-3.13*r+3.66*r*r-1.53*r*r*r;// Roark/Peterson, finite-width plate with central hole, net-section nominal stress
defLevel({id:'w1l5',world:1,title:'Notches & Fatigue',short:'Kt of a plate with hole, Haigh/Goodman diagram, Basquin S–N life',
concept:`<p><b>Stress concentration</b>: geometric discontinuities raise the local peak stress above the nominal one:</p>
<div class="formula">σ<sub>max</sub> = K<sub>t</sub> · σ<sub>nom</sub> &nbsp;&nbsp; plate with central hole (net section): K<sub>t</sub> ≈ 3.00 − 3.13(d/W) + 3.66(d/W)² − 1.53(d/W)³</div>
<p>(Infinite plate: K<sub>t</sub> = 3, Kirsch.) For fatigue, K<sub>f</sub> = 1 + q(K<sub>t</sub> − 1); here we assume full notch sensitivity q = 1 → K<sub>f</sub> = K<sub>t</sub>.</p>
<p><b>Cyclic loading</b> between σ<sub>min</sub> and σ<sub>max</sub>:</p>
<div class="formula">σ<sub>a</sub> = (σ<sub>max</sub> − σ<sub>min</sub>)/2 &nbsp;&nbsp; σ<sub>m</sub> = (σ<sub>max</sub> + σ<sub>min</sub>)/2 &nbsp;&nbsp; R = σ<sub>min</sub>/σ<sub>max</sub></div>
<p><b>Mean-stress criteria</b> (Haigh diagram), safety factor n:</p>
<div class="formula">Goodman: σ<sub>a</sub>/S<sub>e</sub> + σ<sub>m</sub>/S<sub>ut</sub> = 1/n<br>Gerber: nσ<sub>a</sub>/S<sub>e</sub> + (nσ<sub>m</sub>/S<sub>ut</sub>)² = 1<br>Soderberg: σ<sub>a</sub>/S<sub>e</sub> + σ<sub>m</sub>/S<sub>y</sub> = 1/n</div>
<p><b>S–N curve (Basquin)</b> for 10³ ≤ N ≤ 10⁶: S = a·N<sup>b</sup>, through 0.9S<sub>ut</sub> at 10³ and S<sub>e</sub> at 10⁶:</p>
<div class="formula">b = −log₁₀(0.9S<sub>ut</sub>/S<sub>e</sub>)/3 &nbsp;&nbsp; a = (0.9S<sub>ut</sub>)²/S<sub>e</sub> &nbsp;&nbsp; N = (σ<sub>ar</sub>/a)<sup>1/b</sup></div>
<p>With mean stress use the Goodman-equivalent fully reversed amplitude <b>σ<sub>ar</sub> = σ<sub>a</sub>/(1 − σ<sub>m</sub>/S<sub>ut</sub>)</b>. If σ<sub>ar</sub> ≤ S<sub>e</sub> (n ≥ 1) → infinite life (steels).</p>`,
takeaway:'Apply Kt (Kf) to the nominal stresses, split into σa and σm, then check the Haigh diagram; if n<1 estimate life with Basquin.',
build(sim){
 let Sut,Sy,Se,dW,Kt,smax,smin,sa,sm,nG,ok=false;
 for(let k=0;k<300&&!ok;k++){Sut=round5(rnd(600,1000));Sy=round5(Sut*rnd(0.65,0.8));Se=round5(Sut*rnd(0.38,0.48));dW=Math.round(rnd(0.1,0.5)*100)/100;Kt=KtHole(dW);
  const R=Math.round(rnd(-0.3,0.4)*10)/10;const nT=Math.random()<0.5?rnd(0.6,0.92):rnd(1.08,1.6);
  const sal=1/nT/(1/Se+((1+R)/(1-R))/Sut);const sml=sal*(1+R)/(1-R);smax=Math.round((sal+sml)/Kt);smin=Math.round(R*smax);
  sa=Kt*(smax-smin)/2;sm=Kt*(smax+smin)/2;nG=1/(sa/Se+sm/Sut);ok=Math.abs(nG-1)>0.06&&sm>0&&Kt*smax<Sut;}
 const b=-Math.log10(0.9*Sut/Se)/3,aB=Math.pow(0.9*Sut,2)/Se;const sar=sa/(1-sm/Sut);const Nlife=Math.pow(sar/aB,1/b);
 const nGer=0.5*Math.pow(Sut/sm,2)*(sa/Se)*(-1+Math.sqrt(1+Math.pow(2*sm*Se/(Sut*sa),2)));
 const finite=nG<1;
 sim.appendChild(el('div',{class:'small mut'},`Steel: <b style="color:#e6ebf5">S<sub>ut</sub> = ${Sut}, S<sub>y</sub> = ${Sy}, corrected S<sub>e</sub> = ${Se} MPa</b> · task: d/W = ${dW}, nominal net-section σ<sub>max</sub> = ${smax}, σ<sub>min</sub> = ${smin} MPa`));
 let S={dW,smax,smin};
 const C=makeCanvas(sim,680,520),ctx=C.ctx;
 const PK=plotArea(ctx,405,20,255,180,[0,0.65],[1.8,3.1]);const PH=plotArea(ctx,60,265,300,205,[0,Sut*1.05],[0,Se*1.45]);const PS=plotArea(ctx,440,265,220,205,[3,7],[0,Sut]);
 function draw(){C.clear();const kt=KtHole(S.dW),la=kt*(S.smax-S.smin)/2,lm=kt*(S.smax+S.smin)/2;
  // plate with Kirsch field (visual)
  const x0=20,x1=330,y0=40,y1=200,cx=(x0+x1)/2,cy=(y0+y1)/2,a=S.dW*(y1-y0)/2;
  for(let x=x0;x<x1;x+=4)for(let y=y0;y<y1;y+=4){const dx=x+2-cx,dy=y+2-cy,r=Math.hypot(dx,dy);if(r<a)continue;const th=Math.atan2(dy,dx),c2=Math.cos(2*th),s2=Math.sin(2*th),q=a*a/(r*r);
   const srr=0.5*(1-q)+0.5*(1+3*q*q-4*q)*c2,stt=0.5*(1+q)-0.5*(1+3*q*q)*c2,trt=-0.5*(1-3*q*q+2*q)*s2;const c=Math.cos(th),s=Math.sin(th);const sxx=srr*c*c+stt*s*s-2*trt*s*c;
   ctx.fillStyle=heat(sxx/3);ctx.fillRect(x,y,4,4);}
  ctx.strokeStyle='#e6ebf5';ctx.lineWidth=1.5;ctx.strokeRect(x0,y0,x1-x0,y1-y0);dot(ctx,cx,cy,a,'#0c111b','#e6ebf5');
  for(let i=0;i<5;i++){const y=y0+12+i*34;arrow(ctx,x0-2,y,x0-16,y,'#ffb74d',1.5,5);arrow(ctx,x1+2,y,x1+16,y,'#ffb74d',1.5,5);}
  txt(ctx,'σxx field (Kirsch shape, visual)',x0,y0-8,'#9aa6bf','11px system-ui');txt(ctx,`Kt = ${fmt(kt,3)}`,cx,y1+18,'#ffd54f','bold 13px system-ui','center');
  ctx.strokeStyle='#9aa6bf';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1+22,y0);ctx.lineTo(x1+22,y1);ctx.stroke();txt(ctx,'W',x1+26,cy,'#9aa6bf');
  // Kt chart
  PK.axes('d/W','Kt',{nx:6,ny:4,yoff:32});PK.line(KtHole,0,0.65,'#ffd54f',2);dot(ctx,PK.X(S.dW),PK.Y(kt),5,'#fff');
  // Haigh
  PH.axes('σm (MPa)','σa (MPa)',{nx:5,ny:5});PH.clip();
  PH.line(m=>Se*(1-m/Sut),0,Sut,'#4fc3f7',2);PH.line(m=>Se*(1-(m/Sut)**2),0,Sut,'#66bb6a',2);PH.line(m=>Se*(1-m/Sy),0,Sy,'#ba68c8',2);PH.line(m=>Sy-m,0,Sy,'#ef5350',1.3,50,[5,4]);
  ctx.strokeStyle='#ffffff55';ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(PH.X(0),PH.Y(0));ctx.lineTo(PH.X(lm*4),PH.Y(la*4));ctx.stroke();ctx.setLineDash([]);
  dot(ctx,PH.X(lm),PH.Y(la),6,'#ffd54f','#fff');ctx.restore();
  const lg=[['#4fc3f7','Goodman'],['#66bb6a','Gerber'],['#ba68c8','Soderberg'],['#ef5350','Langer (yield)']];lg.forEach((g,i)=>{ctx.fillStyle=g[0];ctx.fillRect(PH.x+PH.w-92,PH.y+8+i*15,12,3);txt(ctx,g[1],PH.x+PH.w-76,PH.y+13+i*15,'#c9d2e6','10.5px system-ui');});
  // S-N
  PS.axes('log₁₀ N (cycles)','S (MPa)',{nx:4,ny:5,yoff:34});const bb=-Math.log10(0.9*Sut/Se)/3,aa=Math.pow(0.9*Sut,2)/Se;
  PS.line(l=>l<=6?aa*Math.pow(10,l*bb):Se,3,7,'#ffb74d',2.2);
  const nn=1/(la/Se+lm/Sut);const ar=la/(1-lm/Sut);
  if(lm<Sut){if(ar>Se){const N=Math.pow(ar/aa,1/bb);const lN=clamp(Math.log10(N),3,7);dot(ctx,PS.X(lN),PS.Y(Math.min(ar,Sut)),5,'#ef5350','#fff');txt(ctx,'N≈'+fmt(N,0),PS.X(lN)+6,PS.Y(Math.min(ar,Sut))-6,'#ef5350','11px system-ui');}
   else{dot(ctx,PS.X(6.8),PS.Y(ar),5,'#66bb6a','#fff');txt(ctx,'∞ life',PS.X(6.8),PS.Y(ar)+16,'#66bb6a','11px system-ui','right');}}
  out.innerHTML=`Current: K<sub>t</sub> = ${fmt(kt,3)} · local σ<sub>a</sub> = ${fmt(la,1)} MPa · σ<sub>m</sub> = ${fmt(lm,1)} MPa · Goodman n = ${fmt(nn,3)} · σ<sub>ar</sub> = ${fmt(ar,1)} MPa`;
 }
 const out=el('div',{class:'small',style:'margin-top:6px'});sim.appendChild(out);
 const s1=slider(sim,'d/W',0.05,0.6,0.01,dW,v=>{S.dW=v;draw();});
 const s2=slider(sim,'σmax,nom (MPa)',0,600,1,smax,v=>{S.smax=v;if(S.smin>v){S.smin=v;s3.set(v);}draw();});
 const s3=slider(sim,'σmin,nom (MPa)',-300,600,1,smin,v=>{S.smin=Math.min(v,S.smax);draw();});
 const row=el('div',{class:'row'});row.appendChild(el('button',{class:'btn sm',onclick:()=>{S={dW,smax,smin};s1.set(dW);s2.set(smax);s3.set(smin);draw();}},'Reset to task values'));sim.appendChild(row);
 draw();
 const tasks=[
  numTask(`Determine <b>K<sub>t</sub></b> for the plate with d/W = ${dW}.`,Kt,{tol:0.03,explain:`K<sub>t</sub> = 3 − 3.13·${dW} + 3.66·${dW}² − 1.53·${dW}³ = ${fmt(Kt,3)}. Wider holes lower K<sub>t</sub> (based on the net section) toward 2 as d/W → 1.`}),
  numTask(`Nominal stress cycles between ${smin} and ${smax} MPa. Compute the <b>local alternating stress σ<sub>a</sub></b> at the hole edge (K<sub>f</sub> = K<sub>t</sub>).`,sa,{unit:'MPa',tol:0.03,dec:1,explain:`σ<sub>a</sub> = K<sub>t</sub>(σ<sub>max</sub> − σ<sub>min</sub>)/2 = ${fmt(Kt,3)}×(${smax} − ${smin})/2 = ${fmt(sa,1)} MPa.`}),
  numTask('Compute the <b>local mean stress σ<sub>m</sub></b>.',sm,{unit:'MPa',tol:0.03,dec:1,explain:`σ<sub>m</sub> = K<sub>t</sub>(σ<sub>max</sub> + σ<sub>min</sub>)/2 = ${fmt(sm,1)} MPa. (For ductile steel without local yielding K<sub>f</sub> is applied to both components.)`}),
  numTask(`Compute the <b>Goodman fatigue safety factor</b> n (S<sub>e</sub> = ${Se}, S<sub>ut</sub> = ${Sut} MPa).`,nG,{tol:0.04,explain:`1/n = ${fmt(sa,1)}/${Se} + ${fmt(sm,1)}/${Sut} = ${fmt(1/nG,4)} → n = ${fmt(nG,3)}. In the Haigh diagram n is the ratio of the distance to the Goodman line along the load line (dashed) to the distance of the point.`}),
  {type:'choice',q:'Does the part have <b>infinite life</b> according to Goodman?',opts:[{t:'Yes – infinite life (n ≥ 1)',ok:!finite,why:`Goodman n = ${fmt(nG,2)}.`},{t:'No – finite life (n < 1)',ok:finite,why:`Goodman n = ${fmt(nG,2)}.`}],noShuffle:true,explain:finite?'The point lies above the Goodman line: the part will fail after a finite number of cycles.':'The point lies below the Goodman line. Note that Soderberg would be more conservative, Gerber less.'}];
 if(finite)tasks.push(numTask(`Estimate the <b>life N</b> with Basquin, using σ<sub>ar</sub> = σ<sub>a</sub>/(1 − σ<sub>m</sub>/S<sub>ut</sub>).`,Nlife,{unit:'cycles',logtol:0.1,explain:`σ<sub>ar</sub> = ${fmt(sar,1)} MPa; b = ${fmt(b,4)}, a = ${fmt(aB,0)} MPa → N = (σ<sub>ar</sub>/a)<sup>1/b</sup> ≈ ${fmt(Nlife,0)} cycles. (Tolerance ±25 % – life predictions are inherently scattered!)`,hint:'b = −log10(0.9Sut/Se)/3, a = (0.9Sut)²/Se'}));
 else tasks.push(numTask('Compute the less conservative <b>Gerber safety factor</b>.',nGer,{tol:0.04,explain:`n<sub>Gerber</sub> = ½(S<sub>ut</sub>/σ<sub>m</sub>)²(σ<sub>a</sub>/S<sub>e</sub>)[−1 + √(1 + (2σ<sub>m</sub>S<sub>e</sub>/(S<sub>ut</sub>σ<sub>a</sub>))²)] = ${fmt(nGer,3)} > Goodman ${fmt(nG,3)}. Gerber fits ductile test data best; Goodman is the common conservative design choice.`,hint:'Solve the quadratic nσa/Se + (nσm/Sut)² = 1 for n.'}));
 return{tasks};}});
