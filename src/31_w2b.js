defLevel({id:'w2l3',world:2,title:'Shape Functions & Element Types',short:'Linear vs quadratic interpolation, partition of unity, shear locking',
concept:`<p>Inside an element the field is interpolated from nodal values with <b>shape functions</b> N<sub>i</sub>(ξ) in natural coordinates ξ ∈ [−1, 1]:</p>
<div class="formula">u(ξ) = Σ N<sub>i</sub>(ξ)·u<sub>i</sub></div>
<div class="formula">Linear (2 nodes): N₁ = (1−ξ)/2, &nbsp;N₂ = (1+ξ)/2</div>
<div class="formula">Quadratic (3 nodes, ξ = −1, 0, +1): N₁ = ξ(ξ−1)/2, &nbsp;N₂ = 1−ξ², &nbsp;N₃ = ξ(ξ+1)/2</div>
<p>Properties: N<sub>i</sub> = 1 at its own node and 0 at the others (Kronecker-δ), and <b>Σ N<sub>i</sub> = 1</b> everywhere (partition of unity → rigid-body motion and constant strain represented exactly).</p>
<p>Linear elements have constant strain (1-D) and cannot represent curvature. A fully integrated 4-node quad (Q4) in bending keeps straight edges, which creates <b>parasitic shear strain</b> → artificially stiff: <b>shear locking</b>. Remedies: quadratic elements (Q8/20-node hex), reduced integration (+ hourglass control), incompatible modes, or several elements through thickness.</p>
<p>Compatible displacement-based elements are <b>too stiff</b>: displacements and strain energy converge from below.</p>`,
takeaway:'Shape functions interpolate nodal values; quadratic elements capture curvature and avoid shear locking in bending.',
build(sim){
 const N1=x=>(1-x)/2,N2=x=>(1+x)/2,Q1=x=>x*(x-1)/2,Q2=x=>1-x*x,Q3=x=>x*(x+1)/2;
 let mode='lin',u=[1,2,0.5],tgt=null;
 const t1=[Math.round(rnd(-2,3)*2)/2,Math.round(rnd(-2,3)*2)/2];if(t1[0]===t1[1])t1[1]+=1;const x1=Math.round(rnd(-0.9,0.9)*10)/10||0.3;const a1=N1(x1)*t1[0]+N2(x1)*t1[1];
 const x2=pick([-0.7,-0.5,-0.3,0.3,0.5,0.7]);const a2=Q1(x2);
 const tq=[Math.round(rnd(-2,2.5)*4)/4,Math.round(rnd(-2,2.5)*4)/4,Math.round(rnd(-2,2.5)*4)/4];{const av=(tq[0]+tq[2])/2;if(Math.abs(tq[1]-av)<0.75)tq[1]=av+(av>0.25?-1.25:1.25);}
 const C=makeCanvas(sim,680,450),ctx=C.ctx;
 const PS=plotArea(ctx,50,30,270,200,[-1.1,1.1],[-0.3,1.15]),PU=plotArea(ctx,390,30,270,200,[-1.1,1.1],[-3,3.5]);
 const nodes=()=>mode==='lin'?[-1,1]:[-1,0,1];
 const uf=x=>mode==='lin'?N1(x)*u[0]+N2(x)*u[1]:Q1(x)*u[0]+Q2(x)*u[1]+Q3(x)*u[2];
 function draw(){C.clear();
  PS.axes('ξ','Nᵢ(ξ)',{zero:true,nx:4,ny:4,yoff:30});const fs=mode==='lin'?[[N1,'#4fc3f7','N₁'],[N2,'#ffb74d','N₂']]:[[Q1,'#4fc3f7','N₁'],[Q2,'#66bb6a','N₂ (mid)'],[Q3,'#ffb74d','N₃']];
  fs.forEach(([f,c,l],k)=>{PS.line(f,-1,1,c,2.2);txt(ctx,l,PS.x+10+k*70,PS.y+14,c,'12px system-ui');});
  PS.line(x=>fs.reduce((s,f)=>s+f[0](x),0),-1,1,'#ffffff66',1.2,50,[4,4]);txt(ctx,'Σ Nᵢ',PS.x+PS.w-40,PS.Y(1)-6,'#ffffffaa','11px system-ui');
  PU.axes('ξ','u(ξ)',{zero:true,nx:4,ny:6,yoff:30});
  if(tgt){PU.line(x=>Q1(x)*tgt[0]+Q2(x)*tgt[1]+Q3(x)*tgt[2],-1,1,'#ef5350',2,200,[6,4]);txt(ctx,'target field',PU.x+8,PU.y+14,'#ef5350','11px system-ui');}
  PU.line(uf,-1,1,'#4fc3f7',2.5);const ns=nodes();ns.forEach((x,k)=>{const v=mode==='lin'?u[k===0?0:1]:u[k];dot(ctx,PU.X(x),PU.Y(v),8,'#ffd54f','#0c111b');txt(ctx,fmt(v,2),PU.X(x)+10,PU.Y(v)-8,'#ffd54f','11px system-ui');});
  txt(ctx,'drag the yellow nodal values',PU.x+PU.w,PU.y+PU.h+44,'#9aa6bf','10.5px system-ui','right');
  // locking illustration
  const yb=345;txt(ctx,'Pure bending of one element:',20,272,'#c9d2e6','bold 12px system-ui');
  ctx.save();ctx.translate(170,yb);ctx.strokeStyle='#66bb6a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,260,215,-Math.PI/2-0.32,-Math.PI/2+0.32);ctx.stroke();ctx.beginPath();ctx.arc(0,260,285,-Math.PI/2-0.3,-Math.PI/2+0.3);ctx.stroke();
  for(const s of[-1,1]){const a=-Math.PI/2+s*0.31;ctx.beginPath();ctx.moveTo(215*Math.cos(a),260+215*Math.sin(a));ctx.lineTo(285*Math.cos(a),260+285*Math.sin(a));ctx.stroke();}ctx.restore();
  txt(ctx,'exact: curved edges, right angles kept (γ = 0)',170,440,'#66bb6a','11.5px system-ui','center');
  ctx.save();ctx.translate(500,yb);ctx.strokeStyle='#ef5350';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-60,-25);ctx.lineTo(60,-25);ctx.lineTo(80,35);ctx.lineTo(-80,35);ctx.closePath();ctx.stroke();
  ctx.strokeStyle='#ffb74d';ctx.lineWidth=1;ctx.beginPath();ctx.arc(60,-25,14,Math.PI/2-0.32,Math.PI/2+0.0);ctx.stroke();txt(ctx,'γ ≠ 0',80,-22,'#ffb74d','11px system-ui');ctx.restore();
  txt(ctx,'Q4: straight edges → spurious shear strain → locking',500,440,'#ef5350','11.5px system-ui','center');}
 let dragK=-1;
 C.drag(p=>{dragK=-1;nodes().forEach((x,k)=>{const v=mode==='lin'?u[k===0?0:1]:u[k];if(Math.hypot(p.x-PU.X(x),p.y-PU.Y(v))<14)dragK=k;});if(dragK<0)return false;},
  p=>{const v=clamp(Math.round(PU.iY(p.y)*20)/20,-3,3.5);if(mode==='lin')u[dragK===0?0:1]=v;else u[dragK]=v;draw();},()=>{dragK=-1;});
 const row=el('div',{class:'row'});const bl=el('button',{class:'btn sm'},'Linear element'),bq=el('button',{class:'btn sm'},'Quadratic element');row.append(bl,bq);sim.appendChild(row);
 const setMode=m=>{mode=m;bl.className='btn sm'+(m==='lin'?' pri':'');bq.className='btn sm'+(m==='quad'?' pri':'');draw();};bl.onclick=()=>setMode('lin');bq.onclick=()=>setMode('quad');
 setMode('lin');
 return{tasks:[
  numTask(`<b>Linear element</b> with nodal values u₁ = ${t1[0]}, u₂ = ${t1[1]} (set in the plot). What is u at <b>ξ = ${x1}</b>?`,a1,{abs:0.02,tol:0,onShow:()=>{u=[t1[0],t1[1],0];setMode('lin');},explain:`N₁(${x1}) = ${fmt(N1(x1),3)}, N₂ = ${fmt(N2(x1),3)} → u = ${fmt(a1,3)}. Linear interpolation = straight line between the nodes.`}),
  numTask(`<b>Quadratic element</b>: evaluate the corner shape function <b>N₁(ξ) = ξ(ξ−1)/2 at ξ = ${x2}</b>.`,a2,{abs:0.005,tol:0,dec:3,onShow:()=>{setMode('quad');},explain:`N₁(${x2}) = ${x2}·(${x2}−1)/2 = ${fmt(a2,4)}. ${a2<0?'Yes, quadratic corner functions go negative between the other nodes – that is fine.':'Corner functions of quadratic elements are not monotonic: they turn negative for ξ > 0.'}`}),
  {type:'action',q:'Drag the three nodal values of the <b>quadratic element</b> so that it reproduces the red <b>target field</b> exactly, then submit.',btn:'Submit fit',onShow:()=>{tgt=tq;u=[0,0,0];setMode('quad');},
   check:()=>{const e=Math.max(...[0,1,2].map(k=>Math.abs(u[k]-tq[k])));return{ok:e<=0.1,msg:e<=0.1?'A quadratic field is reproduced exactly by quadratic shape functions once the nodal values match.':`Max nodal deviation ${fmt(e,2)} – the curve is fully defined by its three nodal values; match each node.`};},
   reveal:()=>`nodal values ${tq.join(', ')}`,explain:'A linear element could only produce the chord between the end nodes – to capture this curvature you would need several linear elements.'},
  {type:'choice',q:'Why must the shape functions of an element sum to 1 at every point (dashed line)?',opts:[
   {t:'So that a rigid-body translation (all u<sub>i</sub> equal) is reproduced exactly without strain',ok:true,why:'If all nodes move by c, u(ξ) = c·ΣN<sub>i</sub> = c → zero strain. Without this, rigid motion would generate fake stresses; it is part of the completeness requirement for convergence.'},
   {t:'To make the stiffness matrix symmetric',why:'Symmetry comes from the energy formulation (BᵀDB), not from ΣN = 1.'},
   {t:'So that the element mass is conserved',why:'Mass matrices use N too, but the essential reason is representing rigid motion/constant states.'},
   {t:'It is only a numerical convenience',why:'It is a convergence requirement (completeness).'}]},
  {type:'choice',q:'A thin cantilever is meshed with <b>one layer of fully integrated linear Q4</b> elements. The tip deflection is far below the beam-theory value. Why, and what helps?',opts:[
   {t:'Shear locking – use quadratic elements (or reduced integration with hourglass control / incompatible modes)',ok:true,why:'Straight-edged Q4 elements cannot bend without parasitic shear, which absorbs energy and stiffens the model, worst for slender elements.'},
   {t:'Hourglassing – switch to full integration',why:'Hourglassing (too flexible, zero-energy modes) is the problem of REDUCED integration; this model is too stiff.'},
   {t:'Volumetric locking – it only happens for rubber',why:'Volumetric locking is for ν → 0.5 (incompressible); steel bending gives shear locking.'},
   {t:'The load is too small for linear elements',why:'Linear analysis scales with load – the ratio to beam theory is load-independent.'}]},
  {type:'choice',q:'With compatible displacement-based elements, how does the computed displacement typically behave as the mesh is refined?',opts:[
   {t:'Increases toward the exact value (the FE model is too stiff – lower bound)',ok:true,why:'Restricting the displacement field to the element basis adds constraints → stiffer model → strain energy and displacements converge from below.'},
   {t:'Decreases toward the exact value (model too flexible)',why:'Only special formulations (e.g. some hybrid/reduced-integrated ones) behave too flexible.'},
   {t:'Is independent of mesh size',why:'Only if the exact solution lies in the element space (e.g. constant strain).'},
   {t:'Oscillates randomly',why:'Convergence of a well-posed linear FE model is monotonic in energy.'}]}
 ]};}});

defLevel({id:'w2l4',world:2,title:'Boundary Condition Detective',short:'Spot rigid-body motion, over-constraints, point loads, unit errors',
concept:`<p>Most bad FE results are not solver errors but <b>modelling errors</b>. Checklist:</p>
<ul><li><b>Under-constrained</b>: any rigid-body mode left (3 in 2-D, 6 in 3-D) → singular K ("zero pivot", "numerical singularity", huge displacements).</li>
<li><b>Over-constrained</b>: fixing more DOFs than reality (e.g. clamped faces, blocking Poisson contraction, wrong symmetry BCs) → too stiff, artificial stress peaks at supports.</li>
<li><b>Symmetry plane</b>: constrain only the displacement <i>normal</i> to the plane (and the in-plane rotations for shells/beams).</li>
<li><b>Point loads / point supports</b> on solids → singular stress (infinite in theory). Distribute the load over the real contact area; evaluate away from it (St-Venant).</li>
<li><b>Units</b>: FE codes are unit-less, so use a consistent set:</li></ul>
<div class="formula">mm – N – MPa (N/mm²) – tonne (t) – s &nbsp;&nbsp;→ steel E = 210 000, ρ = 7.85·10⁻⁹ t/mm³<br>m – N – Pa – kg – s &nbsp;&nbsp;→ steel E = 210·10⁹, ρ = 7850 kg/m³</div>
<p>Always sanity-check: reaction forces = applied loads, deformation plot plausible, hand calculation within the right order of magnitude.</p>`,
takeaway:'Constrain exactly the rigid-body modes reality constrains, avoid point loads on solids, and use a consistent unit system.',
build(sim){
 const C=makeCanvas(sim,680,330),ctx=C.ctx;const msgBox=el('div',{class:'small',style:'margin-top:8px;font-family:monospace;background:#0c111b;padding:8px;border-radius:8px;border:1px solid #2c3850'});sim.appendChild(msgBox);
 const tri=(x,y)=>{ctx.fillStyle='#9aa6bf';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-10,y+16);ctx.lineTo(x+10,y+16);ctx.closePath();ctx.fill();};
 const roll=(x,y)=>{tri(x,y);dot(ctx,x-5,y+20,3,'#9aa6bf');dot(ctx,x+5,y+20,3,'#9aa6bf');};
 const hatch=(x,y,h,side)=>{ctx.fillStyle='#56627e';ctx.fillRect(side<0?x-12:x,y,12,h);ctx.strokeStyle='#9aa6bf';for(let k=0;k<h;k+=10){ctx.beginPath();ctx.moveTo(side<0?x-12:x+12,y+k);ctx.lineTo(side<0?x-20:x+20,y+k+8);ctx.stroke();}};
 const cases=shuffle([
  {draw(){ctx.fillStyle='#24324d';ctx.fillRect(160,120,360,90);ctx.strokeStyle='#4fc3f7';ctx.strokeRect(160,120,360,90);roll(200,210);roll(480,210);arrow(ctx,520,165,600,165,'#ffb74d',3);txt(ctx,'F (horizontal)',560,150,'#ffb74d','12px system-ui','center');txt(ctx,'Plate on two rollers (only UY fixed), horizontal load',340,90,'#c9d2e6','13px system-ui','center');},
   log:'*** ERROR: Zero pivot at node 1287, DOF UX. Matrix is singular.\n*** WARNING: displacement magnitude 3.4e+12 mm',
   q:'The solver aborts. What is wrong and what is the fix?',opts:[['Rigid-body motion in x (and rotation) is unrestrained – add a constraint in x at one support (pin instead of roller)',1,'Rollers only fix UY. Nothing resists the horizontal load: K is singular in that direction.'],['The mesh is too coarse near the rollers',0,'Mesh density never causes a zero pivot of this kind.'],['The load is too large for a linear analysis',0,'Linear analysis scales with any load; singularity is a constraint issue.'],['Switch to quadratic elements',0,'Element order does not remove a rigid-body mode.']]},
  {draw(){ctx.fillStyle='#24324d';ctx.fillRect(140,130,400,60);ctx.strokeStyle='#4fc3f7';ctx.strokeRect(140,130,400,60);hatch(140,120,80,-1);hatch(540,120,80,1);txt(ctx,'all DOF fixed',120,225,'#ef5350','12px system-ui','center');txt(ctx,'UX = +0.5 mm, UY = UZ = 0 on whole face',560,225,'#ef5350','12px system-ui','center');txt(ctx,'Tensile bar: both end faces fully clamped',340,90,'#c9d2e6','13px system-ui','center');},
   log:'Max. von Mises at both ends 38 % higher than F/A; σy ≠ 0 near the faces. Test specimen showed uniform stress.',
   q:'Stress peaks appear at both clamped faces. Diagnosis?',opts:[['Over-constraint: the clamped faces block the Poisson contraction – constrain only the axial DOF (plus minimal rigid-body restraints)',1,'Real grips/loads let the section contract; fully fixing the faces creates artificial transverse stresses.'],['Under-constraint: the bar can rotate',0,'Both faces are completely fixed – there is no free rigid-body mode.'],['The material should be nonlinear',0,'The issue appears in a purely elastic model; it is caused by BCs.'],['Units are wrong',0,'Units would scale everything, not create local end peaks.']]},
  {draw(){ctx.fillStyle='#24324d';ctx.fillRect(140,140,400,70);ctx.strokeStyle='#4fc3f7';ctx.strokeRect(140,140,400,70);hatch(140,130,90,-1);arrow(ctx,400,60,400,138,'#ffb74d',3);dot(ctx,400,140,4,'#ffd54f');txt(ctx,'F on ONE node',410,80,'#ffb74d','12px system-ui');txt(ctx,'3-D solid cantilever, single-node force',340,40,'#c9d2e6','13px system-ui','center');},
   log:'Mesh 2 mm: σmax = 410 MPa at load node\nMesh 1 mm: σmax = 690 MPa\nMesh 0.5 mm: σmax = 1170 MPa (Sy = 355 MPa!)',
   q:'The stress at the load node keeps rising with refinement. What should you do?',opts:[['Distribute the force as a pressure/traction over the real contact area and evaluate stresses away from the load point',1,'A point force on a solid gives infinite theoretical stress (singularity). Far from it (St-Venant) the results are valid.'],['Use the finest mesh value and redesign for 1170 MPa',0,'That value is a mesh artefact and would increase further.'],['Switch to plastic material so the peak stops',0,'This hides the singularity behind plasticity; the load modelling itself is unphysical.'],['Coarsen the mesh at the load',0,'Arbitrary result; does not fix the cause.']]},
  {draw(){ctx.fillStyle='#24324d';ctx.fillRect(140,140,400,40);ctx.strokeStyle='#4fc3f7';ctx.strokeRect(140,140,400,40);hatch(140,130,60,-1);arrow(ctx,540,90,540,138,'#ffb74d',3);
   txt(ctx,'Geometry: mm   Force: 500 N   E = 210e9   ν = 0.3',340,240,'#ffd54f','13px monospace','center');txt(ctx,'Steel cantilever 400 × 40 × 20 mm',340,60,'#c9d2e6','13px system-ui','center');},
   log:'Tip deflection = 4.06e-6 mm\nHand calc (FL³/3EI): ≈ 4.1 mm',
   q:'Deflection is a factor of 10⁶ too small. What is the fix?',opts:[['Use consistent units: in mm–N–MPa enter E = 210 000 (N/mm²)',1,'E = 210e9 is in Pa (N/m²); with mm and N the code reads N/mm², so the beam became 10⁶ times too stiff.'],['Convert the force to kN',0,'That would make it worse/inconsistent: forces must be in N for the mm–N–MPa set.'],['Refine the mesh',0,'A factor 10⁶ is never a discretisation error.'],['Use a nonlinear solver',0,'The problem is the input data, not linearity.']]},
  {draw(){ctx.fillStyle='#24324d';ctx.beginPath();ctx.moveTo(280,250);ctx.arc(200,250,80,0,-Math.PI/2,true);ctx.lineTo(200,80);ctx.lineTo(480,80);ctx.lineTo(480,250);ctx.closePath();ctx.fill();ctx.strokeStyle='#4fc3f7';ctx.lineWidth=2;ctx.stroke();ctx.lineWidth=1;
   for(let k=0;k<6;k++){tri(290+k*35,252);}for(let k=0;k<4;k++){ctx.save();ctx.translate(198,100+k*20);ctx.rotate(Math.PI/2);tri(0,0);ctx.restore();}
   txt(ctx,'symmetry edges: UX = UY = 0 (all DOF fixed)',340,295,'#ef5350','12px system-ui','center');for(let k=0;k<4;k++)arrow(ctx,482,100+k*45,530,100+k*45,'#ffb74d',2);txt(ctx,'Quarter model of plate with hole',340,50,'#c9d2e6','13px system-ui','center');},
   log:'Peak stress at hole = 1.9·σnom (expected Kt ≈ 2.5)\nDisplacements much smaller than hand calculation.',
   q:'The quarter model looks too stiff. What is wrong?',opts:[['Wrong symmetry BCs: on a symmetry plane fix only the displacement normal to it (UY = 0 on the x-edge, UX = 0 on the y-edge)',1,'Fixing both DOFs glues the edges, preventing in-plane sliding/contraction that the full plate allows.'],['The model needs no constraints at all thanks to symmetry',0,'Symmetry BCs are exactly what removes the rigid-body modes – but only normal components.'],['Use a full model; symmetry is never allowed',0,'Symmetry is valid when geometry, material, loads and BCs are symmetric – just constrain correctly.'],['The hole is too coarse',0,'Even a coarse mesh would not make displacements far too small.']]},
  {draw(){ctx.fillStyle='#24324d';ctx.beginPath();ctx.moveTo(220,120);ctx.lineTo(460,120);ctx.lineTo(460,160);ctx.lineTo(300,160);ctx.lineTo(300,240);ctx.lineTo(220,240);ctx.closePath();ctx.fill();ctx.strokeStyle='#4fc3f7';ctx.stroke();txt(ctx,'Free–free modal analysis (no supports)',340,70,'#c9d2e6','13px system-ui','center');},
   log:'Mode 1–6: 0.0001 … 0.003 Hz\nMode 7: 412.8 Hz\nMode 8: 655.1 Hz',
   q:'A colleague says the first six "almost zero" frequencies prove the model is broken. Is it?',opts:[['No – an unsupported 3-D body has exactly 6 rigid-body modes at ~0 Hz; the first elastic mode is mode 7',1,'This is the expected (and a useful) check: 6 zero modes confirm the model is connected and has no extra mechanisms.'],['Yes – add supports, modal analysis cannot run free–free',0,'Free–free modal analyses are standard (e.g. for correlation with hammer tests).'],['Yes – the mesh has unconnected parts',0,'Unconnected parts would give MORE than 6 zero modes.'],['The units of density are wrong',0,'Density errors scale all frequencies, they do not create exactly 6 zero modes.']]}]).slice(0,5);
 let cur=0;function show(i){cur=i;C.clear();ctx.lineWidth=1;cases[i].draw();txt(ctx,'Case '+(i+1)+' / '+cases.length,12,20,'#9aa6bf','12px system-ui');msgBox.innerHTML='<b>Solver / post-processing log:</b><br>'+cases[i].log.replace(/\n/g,'<br>');}
 show(0);
 return{tasks:cases.map((c,i)=>({type:'choice',q:`<b>Case ${i+1}.</b> `+c.q,onShow:()=>show(i),opts:c.opts.map(o=>({t:o[0],ok:!!o[1],why:o[2]}))}))};}});
