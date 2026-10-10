defLevel({id:'w1l3',world:1,title:'Failure Criteria Duel',short:'von Mises vs Tresca, plus brittle Rankine & Coulomb–Mohr',
concept:`<p>Multi-axial stress states are compared with uniaxial strength through a <b>failure criterion</b>. In plane stress with principal stresses σ<sub>A</sub>, σ<sub>B</sub> (σ₃ = 0):</p>
<p><b>Ductile materials (yielding)</b></p>
<div class="formula">von Mises (distortion energy): σ<sub>vM</sub> = √(σ<sub>A</sub>² − σ<sub>A</sub>σ<sub>B</sub> + σ<sub>B</sub>²) ,&nbsp; n = S<sub>y</sub>/σ<sub>vM</sub></div>
<div class="formula">Tresca (max shear): σ<sub>Tr</sub> = max(|σ<sub>A</sub>|, |σ<sub>B</sub>|, |σ<sub>A</sub>−σ<sub>B</sub>|) ,&nbsp; n = S<sub>y</sub>/σ<sub>Tr</sub></div>
<p>In the σ<sub>A</sub>–σ<sub>B</sub> plane von Mises is an <b>ellipse</b>, Tresca an inscribed <b>hexagon</b> → Tresca is always equal or more conservative (max. difference 15.5 % in pure shear: τ<sub>y</sub> = 0.577 S<sub>y</sub> vs 0.5 S<sub>y</sub>).</p>
<p><b>Brittle materials (fracture)</b>, tensile strength S<sub>ut</sub> ≪ compressive strength S<sub>uc</sub>:</p>
<div class="formula">Rankine (max normal stress): σ₁ = S<sub>ut</sub> or σ₃ = −S<sub>uc</sub></div>
<div class="formula">Coulomb–Mohr (σ₁ ≥ 0 ≥ σ₃): σ₁/S<sub>ut</sub> − σ₃/S<sub>uc</sub> = 1/n</div>
<p class="mut small">Click anywhere in the diagram to probe a stress state.</p>`,
takeaway:'Ductile: von Mises (best fit) or Tresca (conservative). Brittle: Coulomb–Mohr is safer than Rankine in mixed tension–compression.',
build(sim){
 const Sy=round5(rnd(250,500));const Sut=round5(rnd(150,300)),Suc=round5(Sut*rnd(3,4));
 const vm=(a,b)=>Math.sqrt(a*a-a*b+b*b),tr=(a,b)=>Math.max(Math.abs(a),Math.abs(b),Math.abs(a-b));
 const want=Math.random()<0.55?'between':'any';let A,B;
 for(let k=0;k<500;k++){const f=rnd(0,2*Math.PI),r=Sy*rnd(0.7,1.25);A=round5(r*Math.cos(f));B=round5(r*Math.sin(f));const rv=vm(A,B)/Sy,rt=tr(A,B)/Sy;
  if(Math.abs(rv-1)<0.05||Math.abs(rt-1)<0.05)continue;if(want==='between'&&!(rt>1&&rv<1))continue;break;}
 const P1={a:A,b:B};const c1v=vm(A,B)<Sy,c1t=tr(A,B)<Sy;
 let A2,B2;do{const f=rnd(0,2*Math.PI),r=Sy*rnd(0.4,0.8);A2=round5(r*Math.cos(f));B2=round5(r*Math.sin(f));}while(vm(A2,B2)<0.25*Sy);
 const P2={a:A2,b:B2};const n2v=Sy/vm(A2,B2),n2t=Sy/tr(A2,B2);
 const A3=round5(Sut*rnd(0.2,0.55)),B3=-round5(Suc*rnd(0.3,0.7));const P3={a:A3,b:B3};const n3=1/(A3/Sut-B3/Suc),n3r=Math.min(Sut/A3,Suc/-B3);
 let mode='ductile',pts=[],probe=null;
 const C=makeCanvas(sim,680,450),ctx=C.ctx;
 const info=el('div',{class:'small',style:'margin-top:6px;min-height:40px'});sim.appendChild(info);
 const row=el('div',{class:'row'});const bm=el('button',{class:'btn sm'},'Switch to brittle material');row.appendChild(bm);sim.appendChild(row);
 bm.onclick=()=>{mode=mode==='ductile'?'brittle':'ductile';bm.textContent=mode==='ductile'?'Switch to brittle material':'Switch to ductile material';probe=null;draw();};
 let P;
 function draw(){C.clear();const rg=mode==='ductile'?[-1.45*Sy,1.45*Sy]:[-1.12*Suc,0.55*Suc];
  P=plotArea(ctx,60,15,400,400,rg,rg);P.axes('σA (MPa)','σB (MPa)',{zero:true});P.clip();
  const poly=(pts,col,fill)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(P.X(p[0]),P.Y(p[1])):ctx.moveTo(P.X(p[0]),P.Y(p[1])));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}ctx.strokeStyle=col;ctx.lineWidth=2.2;ctx.stroke();};
  if(mode==='ductile'){
   ctx.beginPath();for(let i=0;i<=360;i++){const f=i*Math.PI/180,c=Math.cos(f),s=Math.sin(f),r=Sy/Math.sqrt(c*c-c*s+s*s);i?ctx.lineTo(P.X(r*c),P.Y(r*s)):ctx.moveTo(P.X(r*c),P.Y(r*s));}ctx.closePath();ctx.fillStyle='#4fc3f71a';ctx.fill();ctx.strokeStyle='#4fc3f7';ctx.lineWidth=2.2;ctx.stroke();
   poly([[Sy,0],[Sy,Sy],[0,Sy],[-Sy,0],[-Sy,-Sy],[0,-Sy]],'#ffb74d');
   ctx.setLineDash([4,4]);ctx.strokeStyle='#ffffff40';ctx.beginPath();ctx.moveTo(P.X(-Sy*1.5),P.Y(Sy*1.5));ctx.lineTo(P.X(Sy*1.5),P.Y(-Sy*1.5));ctx.stroke();ctx.setLineDash([]);
  }else{
   poly([[-Suc,-Suc],[Sut,-Suc],[Sut,Sut],[-Suc,Sut]],'#ef5350');
   poly([[Sut,Sut],[Sut,0],[0,-Suc],[-Suc,-Suc],[-Suc,0],[0,Sut]],'#66bb6a','#66bb6a18');}
  ctx.restore();
  // legend
  const lx=478;let ly=30;const leg=(c,s)=>{ctx.fillStyle=c;ctx.fillRect(lx,ly-9,14,4);txt(ctx,s,lx+20,ly,'#c9d2e6');ly+=20;};
  if(mode==='ductile'){txt(ctx,'Ductile steel: Sy = '+Sy+' MPa',lx,ly,'#e6ebf5','bold 12px system-ui');ly+=22;leg('#4fc3f7','von Mises ellipse');leg('#ffb74d','Tresca hexagon');txt(ctx,'dashed: pure shear line σB = −σA',lx,ly,'#9aa6bf','11px system-ui');ly+=20;}
  else{txt(ctx,'Grey cast iron:',lx,ly,'#e6ebf5','bold 12px system-ui');ly+=18;txt(ctx,'Sut = '+Sut+' MPa, Suc = '+Suc+' MPa',lx,ly,'#e6ebf5');ly+=22;leg('#ef5350','Rankine (max normal)');leg('#66bb6a','Coulomb–Mohr');}
  ly+=10;pts.forEach(p=>{if(p.mode!==mode)return;dot(ctx,P.X(p.a),P.Y(p.b),6,p.col,'#fff');txt(ctx,p.lab,P.X(p.a)+9,P.Y(p.b)-8,p.col,'bold 12px system-ui');txt(ctx,`${p.lab}: (${p.a}, ${p.b}) MPa`,lx,ly,p.col,'12px system-ui');ly+=18;});
  if(probe){dot(ctx,P.X(probe.a),P.Y(probe.b),4,'#fff');}
 }
 C.drag(p=>{if(!P.inside(p))return false;probe={a:Math.round(P.iX(p.x)),b:Math.round(P.iY(p.y))};desc();draw();},p=>{if(P.inside(p)){probe={a:Math.round(P.iX(p.x)),b:Math.round(P.iY(p.y))};desc();draw();}});
 function desc(){if(!probe){info.innerHTML='';return;}const{a,b}=probe;
  if(mode==='ductile')info.innerHTML=`Probe (σA, σB) = (${a}, ${b}) MPa → σ<sub>vM</sub> = ${fmt(vm(a,b),0)} MPa (n = ${fmt(Sy/vm(a,b),2)}), Tresca σ<sub>Tr</sub> = ${fmt(tr(a,b),0)} MPa (n = ${fmt(Sy/tr(a,b),2)})`;
  else{const s1=Math.max(a,b,0),s3=Math.min(a,b,0);const cm=s1/Sut-s3/Suc;info.innerHTML=`Probe (σA, σB) = (${a}, ${b}) MPa → σ₁ = ${s1}, σ₃ = ${s3}; Coulomb–Mohr n = ${fmt(1/cm,2)}, Rankine n = ${fmt(Math.min(s1>0?Sut/s1:Infinity,s3<0?Suc/-s3:Infinity),2)}`;}}
 const setPts=a=>{pts=a;draw();};
 draw();
 const lbl=(v,t)=>v&&t?'Safe by both criteria':!v&&!t?'Yields by both criteria':v&&!t?'Safe by von Mises, yields by Tresca':'Yields by von Mises, safe by Tresca';
 const corr=lbl(c1v,c1t);
 return{tasks:[
  {type:'choice',q:`Stress state <b>P1 = (σA, σB) = (${P1.a}, ${P1.b}) MPa</b> in steel with S<sub>y</sub> = ${Sy} MPa. What do the criteria predict?`,onShow:()=>{mode='ductile';setPts([{...P1,lab:'P1',col:'#ffd54f',mode:'ductile'}]);},
   opts:['Safe by both criteria','Yields by both criteria','Safe by von Mises, yields by Tresca'].concat(corr==='Yields by von Mises, safe by Tresca'?[corr]:[]).map(t=>({t,ok:t===corr,why:`σ<sub>vM</sub> = ${fmt(vm(P1.a,P1.b),0)} MPa, σ<sub>Tr</sub> = ${fmt(tr(P1.a,P1.b),0)} MPa vs S<sub>y</sub> = ${Sy} MPa.`})),
   explain:'A point inside the closed curve is safe. Between hexagon and ellipse, Tresca already predicts yield while von Mises does not – this region is largest around pure shear.'},
  numTask(`State <b>P2 = (${P2.a}, ${P2.b}) MPa</b>. Compute the <b>von Mises safety factor</b> n = S<sub>y</sub>/σ<sub>vM</sub>.`,n2v,{tol:0.03,onShow:()=>setPts([{...P1,lab:'P1',col:'#ffd54f88',mode:'ductile'},{...P2,lab:'P2',col:'#ffd54f',mode:'ductile'}]),explain:`σ<sub>vM</sub> = √(${P2.a}² − (${P2.a})(${P2.b}) + ${P2.b}²) = ${fmt(vm(P2.a,P2.b),1)} MPa → n = ${fmt(n2v,3)}. Graphically: n is how far you could scale the load vector from the origin before hitting the ellipse.`}),
  numTask(`Same state P2: compute the <b>Tresca safety factor</b> (don't forget σ₃ = 0).`,n2t,{tol:0.03,explain:`σ<sub>Tr</sub> = max(|${P2.a}|, |${P2.b}|, |${P2.a}−(${P2.b})|) = ${fmt(tr(P2.a,P2.b),0)} MPa → n = ${fmt(n2t,3)}. Tresca n ≤ von Mises n always.${P2.a*P2.b>0?' With both stresses of the same sign, the largest Mohr circle is the one through σ₃ = 0.':''}`}),
  numTask(`Switch to <b>brittle cast iron</b> (S<sub>ut</sub> = ${Sut}, S<sub>uc</sub> = ${Suc} MPa). State <b>P3 = (${P3.a}, ${P3.b}) MPa</b>. Compute the <b>Coulomb–Mohr</b> safety factor.`,n3,{tol:0.03,onShow:()=>{mode='brittle';bm.textContent='Switch to ductile material';setPts([{...P3,lab:'P3',col:'#ffd54f',mode:'brittle'}]);},
   explain:`σ₁ = ${P3.a}, σ₃ = ${P3.b}: 1/n = ${P3.a}/${Sut} + ${-P3.b}/${Suc} = ${fmt(1/n3,4)} → n = ${fmt(n3,3)}.`,hint:'1/n = σ₁/Sut − σ₃/Suc with σ₃ negative.'}),
  {type:'choice',q:`For P3, the Rankine (max normal stress) criterion gives n = ${fmt(n3r,2)}. What does that tell you?`,opts:[
   {t:'Rankine is unconservative in the tension–compression quadrant; prefer Coulomb–Mohr (or modified Mohr) for brittle parts',ok:true,why:`Rankine ignores the interaction of σ₁ and σ₃: ${fmt(n3r,2)} > ${fmt(n3,2)}. Test data for cast iron in the 4th quadrant fall inside the Rankine square.`},
   {t:'Rankine is more conservative, so it should be used for safety',why:'Here Rankine predicts a HIGHER safety factor – the opposite of conservative.'},
   {t:'Both are equivalent for brittle materials',why:'They coincide only in the 1st and 3rd quadrants (same-sign stresses).'},
   {t:'Use von Mises instead, it is the standard for all metals',why:'von Mises describes yielding of ductile metals; brittle cast iron fractures and has very different tensile and compressive strengths.'}]}
 ]};}});

defLevel({id:'w1l4',world:1,title:'Beam Bending Designer',short:'Shear & moment diagrams, σ = M·y/I, pick the lightest section',
concept:`<p>A transversely loaded beam carries internal <b>shear force V(x)</b> and <b>bending moment M(x)</b>, linked by</p>
<div class="formula">dM/dx = V &nbsp;&nbsp; dV/dx = −q</div>
<p>Classic cases (point load P at position a, span L):</p>
<div class="formula">Simply supported: R<sub>1</sub> = P(L−a)/L, &nbsp;M<sub>max</sub> = P·a(L−a)/L &nbsp;(worst: a = L/2 → PL/4)<br>Cantilever: M<sub>max</sub> = P·a at the wall (worst: tip, a = L → PL)</div>
<p>Euler–Bernoulli bending stress varies linearly over the depth:</p>
<div class="formula">σ = M·y / I &nbsp;&nbsp;→&nbsp;&nbsp; σ<sub>max</sub> = M/W, &nbsp;W = I/c</div>
<div class="formula">Rectangle: I = bh³/12 &nbsp; Solid round: I = πD⁴/64 &nbsp; Tube: I = π(D⁴−d⁴)/64</div>
<p>Good bending sections put material far from the neutral axis (I-beams, tubes): high W per kg. Design: <b>W<sub>req</sub> = M<sub>max</sub>/σ<sub>allow</sub></b>.</p>`,
takeaway:'Find the worst load position, get Mmax, compute W_req = Mmax/σallow, then choose the section with the least mass that provides it.',
build(sim){
 const type=Math.random()<0.5?'ss':'cant';const L=pick([2,2.5,3,3.5,4]);const sa=pick([120,140,160,180]);
 const secs=[['Rect 30×60','r',30,60],['Rect 40×80','r',40,80],['Rect 50×100','r',50,100],['Rect 60×120','r',60,120],['Round Ø60','c',60],['Round Ø80','c',80],['Round Ø100','c',100],['Tube Ø89×4','t',88.9,4],['Tube Ø114×5','t',114.3,5],['Tube Ø140×6','t',139.7,6],['I 120×64','i',120,64,4.4,6.3],['I 160×82','i',160,82,5,7.4],['I 200×100','i',200,100,5.6,8.5],['I 240×120','i',240,120,6.2,9.8],['I 300×150','i',300,150,7.1,10.7]].map(s=>{
  let A,I,c;const[n,k,p1,p2,p3,p4]=s;
  if(k==='r'){A=p1*p2;I=p1*p2**3/12;c=p2/2;}else if(k==='c'){A=Math.PI*p1*p1/4;I=Math.PI*p1**4/64;c=p1/2;}
  else if(k==='t'){const d=p1-2*p2;A=Math.PI*(p1*p1-d*d)/4;I=Math.PI*(p1**4-d**4)/64;c=p1/2;}else{A=2*p2*p4+(p1-2*p4)*p3;I=(p2*p1**3-(p2-p3)*(p1-2*p4)**3)/12;c=p1/2;}
  return{n,k,p:[p1,p2,p3,p4],A,I,c,W:I/c,m:A*1e-6*7850};});
 const Mf=type==='ss'?L/4:L;let P,best,Mmax;
 for(let k=0;k<200;k++){const sorted=secs.slice().sort((a,b)=>a.W-b.W);const tgt=sorted[rint(3,sorted.length-3)];const Wreq=tgt.W*rnd(0.7,0.97);P=Math.max(1,Math.round(sa*Wreq/1e6/Mf*2)/2);Mmax=P*Mf;
  const feas=secs.filter(s=>Mmax*1e6/s.W<=sa);if(feas.length<3||feas.length>secs.length-3)continue;best=feas.reduce((a,b)=>a.m<b.m?a:b);
  if(feas.some(s=>s!==best&&s.m<best.m*1.03))continue;break;}
 const Wreq=Mmax*1e6/sa/1000;// cm3
 let a=L*rnd(0.15,0.4),sel=-1;
 sim.appendChild(el('div',{class:'small mut'},`${type==='ss'?'Simply supported':'Cantilever'} steel beam · L = ${L} m · P = ${P} kN · σ<sub>allow</sub> = ${sa} MPa · ρ = 7850 kg/m³ (self-weight neglected)`));
 const C=makeCanvas(sim,680,470),ctx=C.ctx;const X0=70,X1=520;const bx=x=>X0+(X1-X0)*x/L;
 const R1=()=>type==='ss'?P*(L-a)/L:P;
 const V=x=>type==='ss'?(x<a?R1():R1()-P):(x<a?P:0);
 const M=x=>type==='ss'?(x<a?R1()*x:R1()*x-P*(x-a)):(x<a?-P*(a-x):0);
 const PV=plotArea(ctx,X0,150,X1-X0,95,[0,L],[-1.2*P,1.2*P]);
 const PM=type==='ss'?plotArea(ctx,X0,300,X1-X0,120,[0,L],[-0.05*P*L,0.3*P*L]):plotArea(ctx,X0,300,X1-X0,120,[0,L],[-1.1*P*L,0.12*P*L]);
 function draw(){C.clear();
  // beam
  ctx.fillStyle='#78909c';ctx.fillRect(X0,80,X1-X0,14);
  if(type==='ss'){ctx.fillStyle='#9aa6bf';ctx.beginPath();ctx.moveTo(X0,94);ctx.lineTo(X0-12,116);ctx.lineTo(X0+12,116);ctx.fill();dot(ctx,X1,104,9,'#9aa6bf');ctx.fillRect(X1-16,113,32,3);
   txt(ctx,'R₁='+fmt(R1(),2)+' kN',X0,132,'#66bb6a','11px system-ui','center');txt(ctx,'R₂='+fmt(P-R1(),2)+' kN',X1,132,'#66bb6a','11px system-ui','center');}
  else{ctx.fillStyle='#56627e';ctx.fillRect(X0-18,55,18,65);for(let i=0;i<6;i++){ctx.strokeStyle='#9aa6bf';ctx.beginPath();ctx.moveTo(X0-18,60+i*10);ctx.lineTo(X0-26,68+i*10);ctx.stroke();}
   txt(ctx,'M_wall='+fmt(P*a,2)+' kN·m',X0+4,132,'#66bb6a','11px system-ui');}
  arrow(ctx,bx(a),22,bx(a),78,'#ffb74d',3,11);dot(ctx,bx(a),22,7,'#ffb74d');txt(ctx,`P = ${P} kN @ a = ${fmt(a,2)} m (drag)`,bx(a)+10,30,'#ffb74d','12px system-ui');
  // diagrams
  const area=(Q,f,col)=>{ctx.beginPath();ctx.moveTo(Q.X(0),Q.Y(0));for(let i=0;i<=400;i++){const x=L*i/400;ctx.lineTo(Q.X(x),Q.Y(f(x)));}ctx.lineTo(Q.X(L),Q.Y(0));ctx.closePath();ctx.fillStyle=col+'33';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();};
  PV.axes(null,'V (kN)',{zero:true,ny:4,yoff:40});area(PV,x=>V(x-1e-9),'#4fc3f7');
  PM.axes('x (m)','M (kN·m)',{zero:true,ny:4,yoff:40});area(PM,M,'#ba68c8');
  const xm=type==='ss'?a:0,mm=M(xm);dot(ctx,PM.X(xm),PM.Y(mm),5,'#ffd54f');txt(ctx,'|M|max = '+fmt(Math.abs(mm),2)+' kN·m',PM.X(xm)+(type==='ss'&&a>L*0.6?-8:8),PM.Y(mm)+(mm>0?-8:16),'#ffd54f','bold 12px system-ui',type==='ss'&&a>L*0.6?'right':'left');
  txt(ctx,'Shear force',X1+10,165,'#4fc3f7','12px system-ui');txt(ctx,'Bending moment',X1+10,300,'#ba68c8','12px system-ui');txt(ctx,type==='ss'?'(sagging +)':'(hogging −)',X1+10,315,'#9aa6bf','11px system-ui');
  // section preview
  if(sel>=0){const s=secs[sel];const cx=605,cy=390,sc=70/Math.max(s.c*2,100);ctx.save();ctx.translate(cx-30,cy);ctx.fillStyle='#78909c';
   if(s.k==='r')ctx.fillRect(-s.p[0]/2*sc,-s.c*sc,s.p[0]*sc,2*s.c*sc);else if(s.k==='c'){dot(ctx,0,0,s.c*sc,'#78909c');}else if(s.k==='t'){dot(ctx,0,0,s.c*sc,'#78909c');dot(ctx,0,0,(s.c-s.p[1])*sc,'#0c111b');}
   else{const[h,b,tw,tf]=s.p;ctx.fillRect(-b/2*sc,-h/2*sc,b*sc,tf*sc);ctx.fillRect(-b/2*sc,h/2*sc-tf*sc,b*sc,tf*sc);ctx.fillRect(-tw/2*sc,-h/2*sc,tw*sc,h*sc);}
   const smax=Math.abs(M(xm))*1e6/s.W;ctx.strokeStyle='#ef5350';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(45-25,-s.c*sc);ctx.lineTo(45+25,s.c*sc);ctx.stroke();ctx.strokeStyle='#9aa6bf';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(45,-s.c*sc-4);ctx.lineTo(45,s.c*sc+4);ctx.stroke();
   ctx.restore();txt(ctx,'σ(y) linear',cx+15,cy-48,'#ef5350','10.5px system-ui','center');}
 }
 C.drag(p=>{if(p.y<10||p.y>140)return false;a=clamp(L*(p.x-X0)/(X1-X0),0.02*L,L);upd();},p=>{a=clamp(L*(p.x-X0)/(X1-X0),0.02*L,L);upd();});
 const tbl=el('div',{style:'max-height:210px;overflow:auto;margin-top:8px'});sim.appendChild(tbl);
 function upd(){draw();const Mc=type==='ss'?Math.abs(M(a)):Math.abs(M(0));
  tbl.innerHTML='<table class="dt"><tr><th style="text-align:left">Section (click to select)</th><th>A (cm²)</th><th>mass (kg/m)</th><th>W (cm³)</th><th>σ at current |M|max (MPa)</th></tr>'+secs.map((s,i)=>{const sg=Mc*1e6/s.W;return`<tr data-i="${i}" style="cursor:pointer;${i===sel?'background:#173247':''}"><td style="text-align:left">${i===sel?'▶ ':''}${s.n}</td><td>${fmt(s.A/100,2)}</td><td>${fmt(s.m,2)}</td><td>${fmt(s.W/1000,1)}</td><td style="color:${sg<=sa?'#66bb6a':'#ef5350'}">${fmt(sg,0)}</td></tr>`;}).join('')+'</table>';
  tbl.querySelectorAll('tr[data-i]').forEach(r=>r.onclick=()=>{sel=+r.dataset.i;upd();});}
 upd();
 return{tasks:[
  {type:'action',q:`Drag the load P to the position that produces the <b>largest bending moment</b> in the beam, then submit.`,btn:'Submit load position',
   check:()=>{const ok=type==='ss'?Math.abs(a-L/2)<=0.02*L:a>=0.98*L;return{ok,msg:ok?(type==='ss'?'Midspan: Mmax = Pa(L−a)/L is maximal at a = L/2.':'The tip: the wall moment P·a grows linearly with the lever arm a.'):`At a = ${fmt(a,2)} m the moment is not maximal. ${type==='ss'?'Look at how Pa(L−a)/L varies with a.':'What lever arm does the wall see?'}`};},
   reveal:()=>type==='ss'?`a = L/2 = ${L/2} m`:`a = L = ${L} m (tip)`,explain:'Always design for the worst credible load position (influence-line thinking).'},
  numTask('For that worst case, what is <b>|M|<sub>max</sub></b>?',Mmax,{unit:'kN·m',tol:0.02,explain:type==='ss'?`M<sub>max</sub> = PL/4 = ${P}×${L}/4 = ${fmt(Mmax,3)} kN·m at midspan.`:`M<sub>max</sub> = PL = ${P}×${L} = ${fmt(Mmax,3)} kN·m at the wall (hogging).`}),
  numTask('Compute the <b>required section modulus W<sub>req</sub></b> = |M|<sub>max</sub>/σ<sub>allow</sub>.',Wreq,{unit:'cm³',tol:0.03,explain:`W<sub>req</sub> = ${fmt(Mmax,3)}·10⁶ N·mm / ${sa} MPa = ${fmt(Wreq*1000,0)} mm³ = ${fmt(Wreq,1)} cm³.`,hint:'kN·m → N·mm is ×10⁶; mm³ → cm³ is ÷1000.'}),
  {type:'action',q:'Select (click) the <b>lightest section</b> in the table that keeps σ<sub>max</sub> ≤ σ<sub>allow</sub> for the worst load case, then submit. (Keep the load at its worst position.)',btn:'Submit selected section',
   check:()=>{if(sel<0)return{ok:false,msg:'Click a row in the table first.'};const s=secs[sel],sg=Mmax*1e6/s.W;if(sg>sa)return{ok:false,msg:`${s.n}: σ = ${fmt(sg,0)} MPa > ${sa} MPa – overstressed!`};
    if(s!==best)return{ok:false,msg:`${s.n} is safe (σ = ${fmt(sg,0)} MPa) but ${fmt(s.m,2)} kg/m is not the minimum mass.`};return{ok:true,msg:`${s.n}: σ = ${fmt(sg,0)} MPa, only ${fmt(s.m,2)} kg/m.`};},
   reveal:()=>`<b>${best.n}</b> (${fmt(best.m,2)} kg/m, W = ${fmt(best.W/1000,1)} cm³)`,explain:'Compare W per kg: I-sections and tubes place material far from the neutral axis, so they reach the required W with much less mass than solid rectangles or rounds.'},
  {type:'choice',q:'Where in the cross-section does the bending normal stress σ = My/I reach its maximum?',opts:[
   {t:'At the outer fibres (largest |y|), zero at the neutral axis',ok:true,why:'σ is linear in y: maximum at y = ±c, zero at the neutral (centroidal) axis.'},
   {t:'At the neutral axis',why:'At the neutral axis σ = 0; it is the transverse SHEAR stress that peaks there.'},
   {t:'Uniform over the section',why:'That would be pure axial loading (σ = F/A), not bending.'},
   {t:'At the web–flange junction',why:'Not for bending normal stress – though local stresses there matter for other reasons.'}]}
 ]};}});
