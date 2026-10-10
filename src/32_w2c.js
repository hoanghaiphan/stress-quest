defLevel({id:'w2l5',world:2,title:'Results Interpretation',short:'Averaged vs unaveraged stresses, which stress for which criterion',
concept:`<p>FE stresses are computed at integration (Gauss) points inside each element and are <b>discontinuous</b> between elements. Post-processors extrapolate them to nodes and show either:</p>
<ul><li><b>Unaveraged (element nodal)</b> – each element shows its own values → jumps between elements.</li>
<li><b>Averaged (nodal)</b> – values of all elements sharing a node are averaged → smooth, nicer, but can hide errors.</li></ul>
<div class="formula">σ<sub>node,avg</sub> = (1/m) Σ σ<sub>node</sub><sup>(e)</sup> &nbsp;&nbsp; jump = max − min over the m elements</div>
<p>A large difference between averaged and unaveraged values signals <b>discretisation error → refine</b>. Never average across <b>material or thickness boundaries</b> or across parts – stresses are physically discontinuous there.</p>
<p><b>Which stress for which check?</b></p>
<ul><li>Ductile metals, static strength: <b>von Mises</b> (or Tresca) vs S<sub>y</sub>.</li>
<li>Brittle materials (cast iron, ceramics, glass): <b>max principal</b> σ₁ vs S<sub>ut</sub> (Coulomb–Mohr if compression matters).</li>
<li>Fatigue: principal-stress ranges / critical-plane methods (von Mises loses the sign of mean stress!).</li>
<li>Displacements converge faster than stresses; judge convergence on stresses.</li></ul>`,
takeaway:'Compare averaged and unaveraged plots to estimate mesh error; pick the stress measure that matches the failure mechanism.',
build(sim){
 const nx=8,ny=5;const vals=[];const f=(x,y)=>90+170*Math.exp(-(Math.pow((x-nx)/3.2,2)+Math.pow(y/2.2,2)));
 for(let i=0;i<nx;i++){vals.push([]);for(let j=0;j<ny;j++)vals[i].push(f(i+0.5,j+0.5)*(1+0.12*((i+j)%2?1:-1)));}
 const NI=5,NJ=2;// node N at grid point (5,2) shared by elements (4,1),(5,1),(4,2),(5,2)
 const base=round5(rnd(150,210));const four=[base+rint(-6,6)*5,base+rint(-6,6)*5,base+rint(-6,6)*5,base+rint(-6,6)*5];
 if(Math.max(...four)-Math.min(...four)<30)four[0]+=40;
 [[4,1],[5,1],[4,2],[5,2]].forEach(([i,j],k)=>vals[i][j]=four[k]);
 const avg=mean(four);let show='un';
 const nodeAvg=(I,J)=>{const a=[];for(const[di,dj]of[[-1,-1],[0,-1],[-1,0],[0,0]]){const i=I+di,j=J+dj;if(i>=0&&j>=0&&i<nx&&j<ny)a.push(vals[i][j]);}return mean(a);};
 const C=makeCanvas(sim,680,360),ctx=C.ctx;const x0=40,y0=30,h=60;const lo=80,hi=280;
 function draw(){C.clear();
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const X=x0+i*h,Y=y0+(ny-1-j)*h;
   if(show==='un'){ctx.fillStyle=heat((vals[i][j]-lo)/(hi-lo));ctx.fillRect(X,Y,h,h);}
   else{const a=nodeAvg(i,j),b=nodeAvg(i+1,j),c=nodeAvg(i+1,j+1),d=nodeAvg(i,j+1);const s=8;for(let p=0;p<s;p++)for(let q=0;q<s;q++){const u=(p+0.5)/s,v=(q+0.5)/s;const val=a*(1-u)*(1-v)+b*u*(1-v)+c*u*v+d*(1-u)*v;ctx.fillStyle=heat((val-lo)/(hi-lo));ctx.fillRect(X+p*h/s,Y+h-(q+1)*h/s,h/s+0.5,h/s+0.5);}}
   ctx.strokeStyle='#0c111b';ctx.lineWidth=1;ctx.strokeRect(X,Y,h,h);}
  [[4,1],[5,1],[4,2],[5,2]].forEach(([i,j])=>{const X=x0+i*h,Y=y0+(ny-1-j)*h;txt(ctx,show==='un'?fmt(vals[i][j],0):'',X+h/2,Y+h/2,'#000','bold 13px system-ui','center','middle');});
  const Nx=x0+NI*h,Ny=y0+(ny-NJ)*h;dot(ctx,Nx,Ny,6,'#fff','#000');txt(ctx,'N',Nx+8,Ny-8,'#fff','bold 13px system-ui');
  if(show==='av')txt(ctx,fmt(nodeAvg(NI,NJ),1),Nx+10,Ny+16,'#fff','bold 13px system-ui');
  ctx.fillStyle='#ffb74d';for(let k=0;k<ny;k++)arrow(ctx,x0+nx*h+4,y0+k*h+h/2,x0+nx*h+30,y0+k*h+h/2,'#ffb74d',1.5,6);
  for(let k=0;k<=40;k++){ctx.fillStyle=heat(k/40);ctx.fillRect(600,y0+300-k*7,24,7.5);}txt(ctx,hi+' MPa',630,y0+8,'#c9d2e6','11px system-ui');txt(ctx,lo+' MPa',630,y0+300,'#c9d2e6','11px system-ui');
  txt(ctx,show==='un'?'UNAVERAGED (element) stresses – note the jumps':'AVERAGED (nodal) stresses – smooth contour',x0,y0+ny*h+25,'#e6ebf5','bold 13px system-ui');}
 const row=el('div',{class:'row'});const bu=el('button',{class:'btn sm pri'},'Unaveraged'),ba=el('button',{class:'btn sm'},'Averaged');row.append(bu,ba);sim.appendChild(row);
 bu.onclick=()=>{show='un';bu.className='btn sm pri';ba.className='btn sm';draw();};ba.onclick=()=>{show='av';ba.className='btn sm pri';bu.className='btn sm';draw();};
 sim.appendChild(el('div',{class:'legend'},'Coarse linear-element mesh near a stress raiser (right edge loaded). Values = von Mises stress extrapolated to node N from each of its 4 elements.'));
 draw();
 return{tasks:[
  numTask(`The four elements around node N report ${four.join(', ')} MPa at N. What does the <b>averaged nodal plot</b> show at N?`,avg,{unit:'MPa',tol:0.01,dec:1,explain:`Average = (${four.join(' + ')})/4 = ${fmt(avg,1)} MPa. Toggle "Averaged" to see it.`}),
  numTask('What is the <b>stress jump</b> (max − min of the element values) at node N, as a percentage of the averaged value?',100*(Math.max(...four)-Math.min(...four))/avg,{unit:'%',tol:0.03,dec:1,explain:`(${Math.max(...four)} − ${Math.min(...four)})/${fmt(avg,1)} = ${fmt(100*(Math.max(...four)-Math.min(...four))/avg,1)} %. Many analysts treat jumps above ~10 % in critical regions as "mesh not fine enough".`}),
  {type:'choice',q:'What does such a large jump at N tell you?',opts:[
   {t:'Discretisation error is large there – refine the mesh (the averaged plot looks smoother than the truth)',ok:true,why:'In the exact solution the stress is continuous in homogeneous material; jumps measure how far the FE field is from it.'},
   {t:'The material is yielding at N',why:'The analysis is linear – the jump is a numerical, not physical, effect.'},
   {t:'Nothing – the averaged value is always exact',why:'Averaging hides error; it does not remove it.'},
   {t:'The load is applied incorrectly',why:'Not necessarily; it shows the mesh is too coarse for the local gradient.'}]},
  {type:'choice',q:'A weld joins a steel bracket and an aluminium plate (different materials, same mesh). Should nodal stresses be averaged across the interface?',opts:[
   {t:'No – stresses are physically discontinuous at material boundaries; average per part/material only',ok:true,why:'Different stiffness means different stress at the same strain: averaging would mix two real, different values.'},
   {t:'Yes – averaging always improves accuracy',why:'Averaging across real discontinuities produces wrong values on both sides.'},
   {t:'Only if the elements are quadratic',why:'Element order does not matter here – the physics is discontinuous.'}]},
  {type:'choice',q:'Static strength check of a <b>ductile steel</b> shaft: which result do you compare with S<sub>y</sub>?',opts:[
   {t:'von Mises equivalent stress',ok:true,why:'Yielding of ductile metals is governed by distortion energy (von Mises) – or Tresca for a conservative check.'},
   {t:'Maximum principal stress',why:'That is for brittle fracture.'},
   {t:'σ<sub>xx</sub> in the global coordinate system',why:'A component depends on the coordinate system; failure criteria need invariants.'},
   {t:'Total displacement',why:'Displacement is a stiffness check, not a strength check.'}]},
  {type:'choice',q:'Same model, but the part is <b>grey cast iron</b> (brittle). Which result is decisive in tension regions?',opts:[
   {t:'Maximum principal stress σ₁ vs S<sub>ut</sub> (Coulomb–Mohr when compression is significant)',ok:true,why:'Brittle materials fail by tensile fracture driven by the largest normal stress.'},
   {t:'von Mises vs S<sub>ut</sub>',why:'von Mises is insensitive to the sign (tension/compression) – fatal for brittle materials with S<sub>uc</sub> ≫ S<sub>ut</sub>.'},
   {t:'Tresca vs S<sub>y</sub>',why:'Cast iron has no distinct yield point; it fractures.'},
   {t:'Minimum principal stress',why:'Compression is the strong direction of brittle materials.'}]}
 ]};}});
