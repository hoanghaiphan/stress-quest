/* ===================== WORLD 1 ===================== */
defLevel({id:'w1l1',world:1,title:'Stress–Strain Explorer',short:'Pull a tensile bar to fracture; read E, yield and UTS',
concept:`<p>In a tensile test a bar of initial area A₀ and gauge length L₀ is pulled. We plot <b>engineering stress</b> vs <b>engineering strain</b>:</p>
<div class="formula">σ = F / A₀ &nbsp;&nbsp;&nbsp; ε = ΔL / L₀</div>
<ul><li><b>Elastic region</b>: linear, Hooke's law <span class="formula" style="display:inline-block;margin:2px">σ = E·ε</span> – unloading returns to zero strain.</li>
<li><b>Yield strength S<sub>y</sub></b>: onset of plastic flow. For materials without a sharp yield point it is defined with the <b>0.2 % offset</b> line (parallel to E, shifted by ε = 0.002).</li>
<li><b>Strain hardening</b>: stress rises with plastic strain up to the <b>ultimate tensile strength S<sub>u</sub> (UTS)</b>, the maximum engineering stress.</li>
<li><b>Necking</b> starts at the UTS (Considère: dσ<sub>true</sub>/dε<sub>true</sub> = σ<sub>true</sub>); deformation localises and engineering stress falls until <b>fracture</b>.</li>
<li>Unloading from the plastic range follows a line of slope E → <b>permanent set</b>.</li></ul>
<p class="mut small">Tip: the elastic part is tiny on the full strain axis, so use the zoom inset (bottom right). Hover over the traced curve to read values.</p>`,
takeaway:'E is the slope of the elastic line, Sy marks the start of plasticity, Su is the peak of the engineering curve where necking begins.',
build(sim){
 const mats=[{n:'Structural steel',E:200,Sy:[250,420],r:[1.3,1.6],eu:[0.12,0.2],ef:[0.08,0.12]},{n:'Aluminium alloy',E:70,Sy:[180,320],r:[1.1,1.3],eu:[0.07,0.11],ef:[0.04,0.07]},{n:'Titanium alloy',E:110,Sy:[780,950],r:[1.06,1.14],eu:[0.06,0.09],ef:[0.04,0.06]},{n:'Copper alloy',E:120,Sy:[150,300],r:[1.4,1.8],eu:[0.2,0.3],ef:[0.08,0.15]}];
 const m=pick(mats);const E=m.E*1000*rnd(0.96,1.04);const Sy=round5(rnd(...m.Sy));const Su=round5(Sy*rnd(...m.r));
 const ey=Sy/E,eu=rnd(...m.eu),ef=eu+rnd(...m.ef),sf=0.8*Su;const d0=rint(8,14);const A0=Math.PI*d0*d0/4;
 function sig(e){if(e<=ey)return E*e;if(e<=eu){const s=(e-ey)/(eu-ey);return Sy+(Su-Sy)*(1-Math.pow(1-s,2.4));}if(e<=ef){const s=(e-eu)/(ef-eu);return Su-(Su-sf)*s*s;}return 0;}
 let eps=0,hov=null;
 sim.appendChild(el('div',{class:'small mut'},`Material: <b style="color:#e6ebf5">${m.n}</b> · round specimen d₀ = ${d0} mm (A₀ = ${fmt(A0,1)} mm²)`));
 const C=makeCanvas(sim,680,450),ctx=C.ctx;
 const P=plotArea(ctx,60,110,600,290,[0,ef*1.08*100],[0,Su*1.18]);
 const Pi=plotArea(ctx,420,265,220,110,[0,ey*3.5*100],[0,Sy*1.3]);
 const sl=slider(sim,'Elongation (strain)',0,1000,1,0,v=>{eps=v/1000*ef*1.02;draw();},v=>fmt(v/1000*ef*1.02*100,2)+' %');
 sim.appendChild(el('div',{class:'legend'},'Drag the slider to load the specimen. Hover the curve (main plot or zoom inset) for a σ–ε readout. Dashed line = elastic unloading path.'));
 C.hover=p=>{hov=p;draw();};
 function draw(){C.clear();const broken=eps>ef;
  // bar
  const L0=360,ex=Math.min(eps,ef)*1.6,len=L0*(1+ex),x0=340-len/2,yc=48,hh=18;
  ctx.fillStyle='#56627e';ctx.fillRect(x0-40,yc-30,40,60);ctx.fillRect(x0+len,yc-30,40,60);
  const neck=eps>eu?Math.min(1,(eps-eu)/(ef-eu)):0;const wid=hh/Math.sqrt(1+ex*0.6);
  const s=sig(Math.min(eps,ef));ctx.fillStyle=broken?'#555':heat(s/Su);
  ctx.beginPath();const N=80;for(let i=0;i<=N;i++){const x=x0+len*i/N;const u=(i/N-0.5);const w=wid*(1-0.55*neck*Math.exp(-u*u/0.004));if(broken&&Math.abs(u)<0.004)continue;i?ctx.lineTo(x,yc-w):ctx.moveTo(x,yc-w);}
  for(let i=N;i>=0;i--){const x=x0+len*i/N;const u=(i/N-0.5);const w=wid*(1-0.55*neck*Math.exp(-u*u/0.004));ctx.lineTo(x,yc+w);}ctx.closePath();ctx.fill();
  if(broken){ctx.fillStyle='#0c111b';ctx.fillRect(338,yc-hh-2,6,2*hh+4);}
  arrow(ctx,x0-45,yc,x0-85,yc,'#ffb74d',2);arrow(ctx,x0+len+45,yc,x0+len+85,yc,'#ffb74d',2);
  const phase=eps===0?'Unloaded':eps<=ey?'Elastic':eps<=eu?'Yielded – strain hardening':eps<=ef?'Necking!':'FRACTURE 💥';
  txt(ctx,phase,20,96,broken?'#ef5350':'#ffb74d','bold 13px system-ui');
  txt(ctx,`F = ${fmt(s*A0/1000,2)} kN   σ = ${fmt(s,0)} MPa`,660,96,'#c9d2e6','12px system-ui','right');
  // main plot
  P.axes('Engineering strain ε (%)','Engineering stress σ (MPa)');
  const em=Math.min(eps,ef);P.line(e=>sig(e/100),0,em*100,'#4fc3f7',2.5,500);
  if(em>ey&&!broken){const ep=em-sig(em)/E;P.line(e=>E*(e/100-ep),ep*100,em*100,'#ffb74d',1.2,10,[5,4]);txt(ctx,'permanent set ≈ '+fmt(ep*100,2)+' %',P.X(ep*100)+4,P.Y(0)-6,'#ffb74d','11px system-ui');}
  if(broken){dot(ctx,P.X(ef*100),P.Y(sf),5,'#ef5350');}
  dot(ctx,P.X(em*100),P.Y(sig(em)),4,'#fff');
  // inset
  ctx.fillStyle='#0c111b';ctx.fillRect(Pi.x-34,Pi.y-14,Pi.w+40,Pi.h+44);
  Pi.axes(null,null,{nx:4,ny:3,yoff:30});txt(ctx,'zoom: ε ≤ '+fmt(ey*350,2)+' %',Pi.x+4,Pi.y-3,'#9aa6bf','10px system-ui');
  Pi.clip();Pi.line(e=>sig(e/100),0,Math.min(em,ey*3.5)*100,'#4fc3f7',2,200);
  if(em>ey)Pi.line(e=>E*(e/100-0.002),0.2,Math.min(ey*3.5,0.002+Sy*1.3/E)*100,'#7986cb',1,20,[3,3]);ctx.restore();
  if(em>ey)txt(ctx,'0.2 % offset',Pi.X(0.2)+4,Pi.Y(Sy*0.15),'#7986cb','10px system-ui');
  // hover readout
  if(hov){let Q=null;if(Pi.inside(hov))Q=Pi;else if(P.inside(hov))Q=P;
   if(Q){const e=Q.iX(hov.x)/100;if(e<=em&&e>=0){const sv=sig(e);ctx.strokeStyle='#ffffff55';ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(Q.X(e*100),Q.y+Q.h);ctx.lineTo(Q.X(e*100),Q.Y(sv));ctx.lineTo(Q.x,Q.Y(sv));ctx.stroke();ctx.setLineDash([]);
     dot(ctx,Q.X(e*100),Q.Y(sv),4,'#ffd54f');const lab=`ε=${fmt(e*100,Q===Pi?3:2)}%  σ=${fmt(sv,0)} MPa`;ctx.fillStyle='#000c';ctx.fillRect(hov.x+8,hov.y-24,lab.length*6.3,18);txt(ctx,lab,hov.x+12,hov.y-11,'#ffd54f','11.5px system-ui');}}}
 }
 draw();
 return{tasks:[
  numTask('Pull the bar until it breaks, then read the <b>yield strength S<sub>y</sub></b> (the knee of the curve – use the zoom inset).',Sy,{unit:'MPa',tol:0.06,dec:0,explain:`Yielding starts where the curve departs from the straight Hooke line: S<sub>y</sub> ≈ ${Sy} MPa. For a gradual knee you would use the 0.2 % offset line.`}),
  numTask('Read the <b>ultimate tensile strength S<sub>u</sub></b>.',Su,{unit:'MPa',tol:0.03,dec:0,explain:'S<sub>u</sub> is the maximum of the <i>engineering</i> curve. Beyond it, the true stress in the neck keeps rising but the load falls because the area shrinks.'}),
  numTask("Determine <b>Young's modulus E</b> from the elastic slope in the zoom inset (σ/ε).",E/1000,{unit:'GPa',tol:0.08,dec:0,explain:`E = σ/ε in the linear part ≈ ${fmt(E/1000,0)} GPa (${m.n}). Remember ε in % → divide by 100!`,hint:'E = σ / ε, with ε as a pure number (0.1 % = 0.001), then convert MPa → GPa.'}),
  numTask(`What is the <b>maximum force</b> this d₀ = ${d0} mm specimen can carry?`,Su*A0/1000,{unit:'kN',tol:0.03,explain:`F<sub>max</sub> = S<sub>u</sub>·A₀ = ${Su} MPa × ${fmt(A0,1)} mm² = ${fmt(Su*A0/1000,2)} kN (MPa·mm² = N).`}),
  {type:'choice',q:'At which point does <b>necking</b> begin?',opts:[{t:'At the ultimate tensile strength (maximum load)',ok:true,why:'Necking (plastic instability) starts at maximum load: strain hardening can no longer compensate the area reduction (Considère criterion).'},{t:'At the yield strength',why:'At yield the bar still deforms uniformly; hardening stabilises the deformation.'},{t:'At fracture',why:'Fracture ends the neck formation – it starts much earlier, at the maximum load.'},{t:'At the proportional limit',why:'The proportional limit is the end of linear elasticity – long before any instability.'}]}
 ]};}});

defLevel({id:'w1l2',world:1,title:"Mohr's Circle Workshop",short:'Rotate the stress element, find principal & max shear stresses',
concept:`<p>For plane stress (σ<sub>x</sub>, σ<sub>y</sub>, τ<sub>xy</sub>) the stresses on a face rotated by θ are</p>
<div class="formula">σ<sub>x'</sub> = (σ<sub>x</sub>+σ<sub>y</sub>)/2 + (σ<sub>x</sub>−σ<sub>y</sub>)/2·cos2θ + τ<sub>xy</sub>·sin2θ<br>τ<sub>x'y'</sub> = −(σ<sub>x</sub>−σ<sub>y</sub>)/2·sin2θ + τ<sub>xy</sub>·cos2θ</div>
<p>All these states lie on <b>Mohr's circle</b> with</p>
<div class="formula">C = (σ<sub>x</sub>+σ<sub>y</sub>)/2 &nbsp;&nbsp; R = √[((σ<sub>x</sub>−σ<sub>y</sub>)/2)² + τ<sub>xy</sub>²]<br>σ<sub>1,2</sub> = C ± R &nbsp;&nbsp; τ<sub>max,in-plane</sub> = R &nbsp;&nbsp; tan 2θ<sub>p</sub> = 2τ<sub>xy</sub>/(σ<sub>x</sub>−σ<sub>y</sub>)</div>
<p>A rotation θ of the element is a rotation 2θ on the circle. On principal planes τ = 0. Remember the <b>third principal stress σ₃ = 0</b> in plane stress: absolute max shear is</p>
<div class="formula">τ<sub>abs,max</sub> = max(|σ₁−σ₂|, |σ₁|, |σ₂|) / 2</div>
<p class="mut small">Plot convention here: τ plotted <b>downward-positive</b>, so element and circle rotate in the same sense (counter-clockwise for +θ).</p>`,
takeaway:'σ1,2 = C ± R; the principal planes have zero shear; when σ1 and σ2 have the same sign, the out-of-plane shear (σ1/2) governs.',
build(sim){
 let sx,sy,txy;do{sx=rint(-12,16)*10;sy=(Math.random()<0.5?rint(1,12):rint(-10,12))*10;if(Math.random()<0.5&&sx<0)sx=-sx;txy=rint(-16,16)*5;}while(Math.abs(txy)<15||Math.abs(sx-sy)<20);
 const G={sx,sy,txy};const C0=(sx+sy)/2,R0=Math.hypot((sx-sy)/2,txy),s1=C0+R0,s2=C0-R0;const thp=0.5*Math.atan2(2*txy,sx-sy)*180/Math.PI;
 const tabs=Math.max(Math.abs(s1-s2),Math.abs(s1),Math.abs(s2))/2;
 let S={sx,sy,txy,th:0};
 sim.appendChild(el('div',{class:'small mut'},`Task state: <b style="color:#e6ebf5">σx = ${sx} MPa, σy = ${sy} MPa, τxy = ${txy} MPa</b>`));
 const C=makeCanvas(sim,680,400),ctx=C.ctx;
 const tr=th=>{const a=(S.sx-S.sy)/2,c=(S.sx+S.sy)/2,t=th*Math.PI/90;return{sxp:c+a*Math.cos(t)+S.txy*Math.sin(t),syp:c-a*Math.cos(t)-S.txy*Math.sin(t),tp:-a*Math.sin(t)+S.txy*Math.cos(t)};};
 function draw(){C.clear();const{sxp,syp,tp}=tr(S.th);
  // element
  const cx=135,cy=200,h=55,th=-S.th*Math.PI/180;// screen y down -> ccw is negative
  ctx.save();ctx.translate(cx,cy);ctx.rotate(th);
  ctx.fillStyle='#24324d';ctx.strokeStyle='#4fc3f7';ctx.lineWidth=2;ctx.fillRect(-h,-h,2*h,2*h);ctx.strokeRect(-h,-h,2*h,2*h);
  const sc=v=>Math.sign(v)*(12+Math.min(45,Math.abs(v)*0.22));
  const nArrow=(v,dir)=>{if(Math.abs(v)<0.5)return;const L=sc(v);const col=v>0?'#ef5350':'#42a5f5';
   for(const s of[1,-1]){const bx=dir==='x'?s*h:0,by=dir==='y'?-s*h:0;const ux=dir==='x'?s:0,uy=dir==='y'?-s:0;
    if(v>0)arrow(ctx,bx+ux*4,by+uy*4,bx+ux*(4+Math.abs(L)),by+uy*(4+Math.abs(L)),col,2.5);else arrow(ctx,bx+ux*(4+Math.abs(L)),by+uy*(4+Math.abs(L)),bx+ux*4,by+uy*4,col,2.5);}};
  nArrow(sxp,'x');nArrow(syp,'y');
  if(Math.abs(tp)>0.5){const L=Math.min(50,12+Math.abs(tp)*0.25)*Math.sign(tp),col='#ffb74d';// +tau: on +x face points +y (up on screen)
   arrow(ctx,h+8,L/2,h+8,-L/2,col,2);arrow(ctx,-h-8,-L/2,-h-8,L/2,col,2);arrow(ctx,-L/2,-h-8,L/2,-h-8,col,2);arrow(ctx,L/2,h+8,-L/2,h+8,col,2);}
  ctx.restore();
  txt(ctx,`θ = ${fmt(S.th,1)}°`,cx,40,'#e6ebf5','bold 14px system-ui','center');
  txt(ctx,`σx' = ${fmt(sxp,1)}   σy' = ${fmt(syp,1)}`,cx,345,'#c9d2e6','12.5px system-ui','center');
  txt(ctx,`τx'y' = ${fmt(tp,1)} MPa`,cx,365,'#ffb74d','12.5px system-ui','center');
  txt(ctx,'red = tension, blue = compression',cx,388,'#9aa6bf','10.5px system-ui','center');
  // Mohr
  const c=(S.sx+S.sy)/2,R=Math.hypot((S.sx-S.sy)/2,S.txy)||1;const lo=Math.min(c-R,0),hi=Math.max(c+R,0);
  const px=290,pw=370,py=20,ph=350;const span=Math.max((hi-lo)*1.25,2*R*1.25*pw/ph,40);const sxr=[(lo+hi)/2-span/2,(lo+hi)/2+span/2];const tsp=span*ph/pw;
  const P=plotArea(ctx,px,py,pw,ph,sxr,[tsp/2,-tsp/2]);// tau downward positive
  P.axes('σ (MPa)','τ (MPa, ↓ positive)',{zero:true,yoff:30});
  ctx.strokeStyle='#ba68c8';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(P.X(c),P.Y(0),R*pw/span,0,7);ctx.stroke();
  ctx.strokeStyle='#e6ebf5';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(P.X(sxp),P.Y(tp));ctx.lineTo(P.X(syp),P.Y(-tp));ctx.stroke();
  dot(ctx,P.X(sxp),P.Y(tp),6,'#ef5350');txt(ctx,"X'",P.X(sxp)+8,P.Y(tp)-6,'#ef5350','bold 12px system-ui');
  dot(ctx,P.X(syp),P.Y(-tp),6,'#42a5f5');txt(ctx,"Y'",P.X(syp)+8,P.Y(-tp)-6,'#42a5f5','bold 12px system-ui');
  dot(ctx,P.X(c),P.Y(0),3,'#ba68c8');
  if(showP){dot(ctx,P.X(c+R),P.Y(0),4,'#66bb6a');dot(ctx,P.X(c-R),P.Y(0),4,'#66bb6a');txt(ctx,'σ₁='+fmt(c+R,1),P.X(c+R)+4,P.Y(0)+16,'#66bb6a');txt(ctx,'σ₂='+fmt(c-R,1),P.X(c-R)-4,P.Y(0)+16,'#66bb6a','12px system-ui','right');}
 }
 let showP=false;
 const s_x=slider(sim,'σx (MPa)',-200,200,5,sx,v=>{S.sx=v;draw();});
 const s_y=slider(sim,'σy (MPa)',-200,200,5,sy,v=>{S.sy=v;draw();});
 const s_t=slider(sim,'τxy (MPa)',-120,120,5,txy,v=>{S.txy=v;draw();});
 const s_th=slider(sim,'Rotate θ (°)',-90,90,0.5,0,v=>{S.th=v;draw();},v=>fmt(v,1)+'°');
 const row=el('div',{class:'row'});row.appendChild(el('button',{class:'btn sm',onclick:()=>{S={sx,sy,txy,th:S.th};s_x.set(sx);s_y.set(sy);s_t.set(txy);draw();}},'Reset to task state'));sim.appendChild(row);
 draw();
 return{tasks:[
  numTask('Find the <b>maximum principal stress σ₁</b> (rotate the element or use C ± R).',s1,{unit:'MPa',abs:Math.max(2,0.02*R0),tol:0,dec:1,explain:`C = ${fmt(C0,1)}, R = ${fmt(R0,2)} → σ₁ = C + R = ${fmt(s1,1)} MPa.`}),
  numTask('Find the <b>minimum in-plane principal stress σ₂</b>.',s2,{unit:'MPa',abs:Math.max(2,0.02*R0),tol:0,dec:1,explain:`σ₂ = C − R = ${fmt(s2,1)} MPa.`}),
  numTask('What is the <b>maximum in-plane shear stress</b>?',R0,{unit:'MPa',abs:Math.max(2,0.02*R0),tol:0,dec:1,explain:'τ<sub>max,in-plane</sub> equals the circle radius R; it acts on planes at 45° to the principal planes (top/bottom of the circle).'}),
  {type:'action',q:"Use the θ slider to rotate the element to the <b>principal orientation where the x'-face carries σ₁</b> (τ = 0), then submit.",btn:'Submit current θ',onShow:()=>{S={sx,sy,txy,th:S.th};s_x.set(sx);s_y.set(sy);s_t.set(txy);draw();},
   check:()=>{let d=((S.th-thp)%180+180)%180;if(d>90)d-=180;const ok=Math.abs(d)<=2;const st=tr(S.th);
    return{ok,msg:ok?`θp = ½·atan2(2τxy, σx−σy) = ${fmt(thp,1)}°. τ' ≈ 0 and σx' = σ₁.`:(Math.abs(Math.abs(d)-90)<=2?"That plane carries σ₂, not σ₁ (90° off) – on the circle you are on the opposite end of the diameter.":`At θ = ${fmt(S.th,1)}° the shear is still τ' = ${fmt(st.tp,1)} MPa – principal planes have zero shear.`)};},
   reveal:()=>`θp = ${fmt(thp,1)}°`,onDone:()=>{showP=true;draw();},explain:'Rotating the element by θ moves point X\' by 2θ around the circle. Principal points are where the circle crosses the σ-axis.'},
  numTask('Plane stress means σ₃ = 0. What is the <b>absolute maximum shear stress</b> (3-D)?',tabs,{unit:'MPa',abs:Math.max(2,0.02*R0),tol:0,dec:1,
   explain:()=>`τ<sub>abs</sub> = max(|σ₁−σ₂|, |σ₁|, |σ₂|)/2 = ${fmt(tabs,1)} MPa. ${s1*s2>0?'Here σ₁ and σ₂ have the same sign, so the out-of-plane circle (with σ₃ = 0) is the biggest – the in-plane value R would be unconservative!':'Here σ₁ and σ₂ have opposite signs, so the in-plane circle is the largest and τ<sub>abs</sub> = R.'}`})
 ]};}});
