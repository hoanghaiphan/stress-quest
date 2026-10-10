/* ===================== WORLD 2 ===================== */
function gsolve(A,b){const n=b.length;A=A.map(r=>r.slice());b=b.slice();for(let i=0;i<n;i++){let p=i;for(let r=i+1;r<n;r++)if(Math.abs(A[r][i])>Math.abs(A[p][i]))p=r;[A[i],A[p]]=[A[p],A[i]];[b[i],b[p]]=[b[p],b[i]];
 for(let r=i+1;r<n;r++){const f=A[r][i]/A[i][i];for(let c=i;c<n;c++)A[r][c]-=f*A[i][c];b[r]-=f*b[i];}}const x=new Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=b[i];for(let c=i+1;c<n;c++)s-=A[i][c]*x[c];x[i]=s/A[i][i];}return x;}
defLevel({id:'w2l1',world:2,title:'Stiffness Matrix Assembly',short:'Assemble K from spring elements, apply BCs, solve K·u = F',
concept:`<p>The FEM turns a structure into elements connected at nodes. For a 1-D spring/bar element between nodes i and j:</p>
<div class="formula">k<sup>(e)</sup> = k · [ 1 −1 ; −1 1 ] &nbsp;&nbsp; (bar: k = EA/L)</div>
<p><b>Assembly</b>: each entry of the element matrix is <i>added</i> to the global matrix at the rows/columns of its global node numbers: k₁₁→K<sub>ii</sub>, k₁₂→K<sub>ij</sub>, k₂₁→K<sub>ji</sub>, k₂₂→K<sub>jj</sub>. Node numbering does not need to follow the geometry!</p>
<div class="formula">K · u = F</div>
<p>Before boundary conditions K is <b>singular</b> (det K = 0): the structure can translate as a rigid body. Applying <b>u = 0 at fixed nodes</b> = deleting those rows and columns. Solve the reduced system for the free displacements, then recover the <b>reactions</b> from the deleted rows: R = K<sub>row</sub>·u.</p>`,
takeaway:'Element matrices are scattered into the global matrix using the connectivity table; BCs remove rigid-body modes so K becomes invertible.',
build(sim){
 const ks=[rint(2,10)*50,rint(2,10)*50,rint(2,10)*50];const perm=shuffle([1,2,3,4]);const NN={A:perm[0],B:perm[1],C:perm[2],D:perm[3]};
 const els=[['A','B'],['B','C'],['C','D']].map((p,e)=>({e:e+1,k:ks[e],i:NN[p[0]],j:NN[p[1]],done:new Set()}));
 const ln=pick(['B','C']);const F=rint(1,5)*1000;
 const K=[0,1,2,3].map(()=>[0,0,0,0]);let selE=null,mistakes=0,fixed=new Set(),bcMode=false,solved=false;
 const Kfull=[0,1,2,3].map(()=>[0,0,0,0]);els.forEach(E=>{const i=E.i-1,j=E.j-1;Kfull[i][i]+=E.k;Kfull[j][j]+=E.k;Kfull[i][j]-=E.k;Kfull[j][i]-=E.k;});
 const free=[1,2,3,4].filter(n=>n!==NN.A&&n!==NN.D);const Fv=free.map(n=>n===NN[ln]?F:0);
 const uf=gsolve(free.map(r=>free.map(c=>Kfull[r-1][c-1])),Fv);const U=[0,0,0,0];free.forEach((n,k)=>U[n-1]=uf[k]);
 const RA=Kfull[NN.A-1].reduce((s,v,c)=>s+v*U[c],0);
 sim.appendChild(el('div',{class:'small mut'},`Three springs between two rigid walls. Stiffnesses in N/mm, force F = ${F} N at the node marked in orange. Node numbers are the <b>global</b> numbers (deliberately not in geometric order).`));
 const C=makeCanvas(sim,680,190),ctx=C.ctx;
 function draw(){C.clear();const xs=[90,250,410,570],y=95;const ord=['A','B','C','D'];
  ctx.fillStyle='#56627e';ctx.fillRect(40,45,18,100);ctx.fillRect(622,45,18,100);
  ctx.strokeStyle='#78909c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(58,y);ctx.lineTo(xs[0],y);ctx.moveTo(xs[3],y);ctx.lineTo(622,y);ctx.stroke();
  const sc=solved?Math.min(60/Math.max(...U.map(Math.abs)),1e4):0;const dx=ord.map(p=>sc*U[NN[p]-1]);
  for(let e=0;e<3;e++){const xa=xs[e]+dx[e]+12,xb=xs[e+1]+dx[e+1]-12;ctx.strokeStyle=els[e].done.size===4?'#4fc3f7':'#9aa6bf';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xa,y);
   const nz=10;for(let z=1;z<nz;z++)ctx.lineTo(xa+(xb-xa)*z/nz,y+(z%2?-12:12));ctx.lineTo(xb,y);ctx.stroke();
   txt(ctx,`e${e+1}: k=${els[e].k}`,(xs[e]+xs[e+1])/2,y-26,'#c9d2e6','12px system-ui','center');
   if(solved){const f=els[e].k*(U[els[e].j-1]-U[els[e].i-1])*(NN[ord[e+1]]===els[e].j?1:-1);txt(ctx,`N=${fmt(f,0)} N`,(xs[e]+xs[e+1])/2,y+34,f>=0?'#ef5350':'#42a5f5','11px system-ui','center');}}
  ord.forEach((p,k)=>{const n=NN[p];const fx=fixed.has(n);dot(ctx,xs[k]+dx[k],y,13,fx?'#7a3236':'#24324d',p===ln?'#ffb74d':'#4fc3f7');txt(ctx,n,xs[k]+dx[k],y+1,'#fff','bold 13px system-ui','center','middle');
   if(solved)txt(ctx,'u='+fmt(U[n-1],3),xs[k]+dx[k],y+58,'#ffd54f','11px system-ui','center');});
  const k=ord.indexOf(ln);arrow(ctx,xs[k]+16,y-40,xs[k]+70,y-40,'#ffb74d',3);txt(ctx,'F = '+F+' N',xs[k]+16,y-48,'#ffb74d','bold 12px system-ui');
  if(solved)txt(ctx,'deformed shape (exaggerated); N>0 tension',340,180,'#9aa6bf','11px system-ui','center');}
 const chips=el('div',{style:'margin-top:8px'});sim.appendChild(chips);
 const msg=el('div',{class:'small',style:'min-height:22px;margin:4px 0'});
 const gridBox=el('div');sim.appendChild(gridBox);sim.appendChild(msg);
 function renderChips(){chips.innerHTML='<span class="small mut">Element connectivity table: </span>';els.forEach(E=>{const c=el('span',{class:'chip'+(selE===E?' sel':'')+(E.done.size===4?' done':'')},`e${E.e}: nodes ${E.i}–${E.j}, k=${E.k}`);
  c.onclick=()=>{if(E.done.size===4||bcMode)return;selE=E;renderChips();renderGrid();msg.innerHTML=`Element e${E.e} connects global nodes ${E.i} and ${E.j}: click the 4 cells of K where its entries [+k −k; −k +k] go.`;};chips.appendChild(c);});}
 function renderGrid(){gridBox.innerHTML='';const g=el('div',{class:'mat',style:'grid-template-columns:repeat(5,auto)'});
  g.appendChild(el('div',{class:'hdr'},'K'));for(let c=1;c<=4;c++)g.appendChild(el('div',{class:'hdr'},'u'+c));
  for(let r=1;r<=4;r++){const h=el('div',{class:'hdr',style:bcMode?'cursor:pointer;color:#ffb74d':''},(fixed.has(r)?'🔒 ':'')+'row '+r);h.onclick=()=>{if(!bcMode)return;fixed.has(r)?fixed.delete(r):fixed.add(r);renderGrid();draw();};g.appendChild(h);
   for(let c=1;c<=4;c++){const v=K[r-1][c-1];const d=el('div',{class:(fixed.has(r)||fixed.has(c))?'bc':''},v===0?'<span class="mut">0</span>':fmt(v,0));
    if(selE&&(selE.done.has(r+','+c)))d.classList.add('hl');
    d.onclick=()=>cell(r,c);g.appendChild(d);}}
  gridBox.appendChild(g);}
 function cell(r,c){if(bcMode){msg.innerHTML='Click the <b>row labels</b> to mark fixed DOFs.';return;}if(!selE){msg.innerHTML='First pick an element from the connectivity table.';return;}
  const E=selE,key=r+','+c;const ok=(r===E.i||r===E.j)&&(c===E.i||c===E.j);
  if(!ok){mistakes++;msg.innerHTML=`❌ Cell (${r},${c}) does not belong to e${E.e}: its entries only go to rows/columns ${E.i} and ${E.j}.`;return;}
  if(E.done.has(key)){msg.innerHTML='Already added.';return;}
  E.done.add(key);K[r-1][c-1]+=r===c?E.k:-E.k;msg.innerHTML=`✔ Added ${r===c?'+':'−'}${E.k} to K(${r},${c}). ${r===c?'Diagonal: +k':'Off-diagonal coupling: −k'}`;
  if(E.done.size===4){selE=null;msg.innerHTML+=` · e${E.e} fully assembled!`;}renderChips();renderGrid();draw();}
 renderChips();renderGrid();draw();
 const red=el('div',{class:'small',style:'margin-top:6px'});sim.appendChild(red);
 return{tasks:[
  {type:'action',q:'<b>Assemble the global stiffness matrix.</b> Pick an element, then click the 4 cells of K where its entries go. Repeat for all elements, then submit.',btn:'Check assembly',
   check:()=>{const all=els.every(E=>E.done.size===4);if(!all)return{ok:false,msg:'Not all elements are fully assembled yet.'};return{ok:true,partial:Math.max(0.4,1-0.15*mistakes),msg:`Assembled with ${mistakes} misplaced click(s). Note each row sums to zero → K is singular (rigid-body translation u = [1,1,1,1] gives zero force).`};},
   tries:99,explain:'Diagonal K<sub>ii</sub> = sum of stiffnesses connected to node i; off-diagonal K<sub>ij</sub> = −k of the element joining i and j (0 if not connected).'},
  {type:'action',q:'<b>Apply the boundary conditions</b>: both walls are fixed (u = 0). Click the <b>row labels</b> of the fixed DOFs, then submit.',btn:'Apply BCs',onShow:()=>{bcMode=true;selE=null;renderChips();renderGrid();msg.innerHTML='Click the row labels to lock DOFs (rows/columns are removed).';},
   check:()=>{const want=[NN.A,NN.D].sort().join();const got=[...fixed].sort().join();return{ok:want===got,msg:want===got?`Rows/columns ${NN.A} and ${NN.D} are removed; the remaining 2×2 system is non-singular.`:'Those are not (only) the nodes attached to the walls. Look at the sketch: which global numbers sit at the walls?'};},
   reveal:()=>`fixed nodes: ${NN.A} and ${NN.D}`,onDone:()=>{fixed=new Set([NN.A,NN.D]);renderGrid();draw();}},
  numTask(()=>`Reduced system (free DOFs ${free.join(', ')}):<br><span class="formula" style="display:block">[${free.map(r=>free.map(c=>Kfull[r-1][c-1]).join('  ')).join(' ; ')}] · [u${free[0]} ; u${free[1]}] = [${Fv.join(' ; ')}]</span>Solve for the <b>displacement of the loaded node ${NN[ln]}</b>.`,U[NN[ln]-1],{unit:'mm',tol:0.02,dec:4,
   explain:`Solving the 2×2 system: u${free[0]} = ${fmt(uf[0],4)} mm, u${free[1]} = ${fmt(uf[1],4)} mm.`,hint:'2×2 inverse: [a b; c d]⁻¹ = 1/(ad−bc)·[d −b; −c a]',onDone:()=>{solved=true;draw();}}),
  numTask(()=>`Recover the <b>reaction force at node ${NN.A}</b> (left wall) from row ${NN.A} of the full K: R = Σ K<sub>${NN.A}j</sub>·u<sub>j</sub>. Sign: + = pointing in +x (right).`,RA,{unit:'N',tol:0.02,dec:1,
   explain:`R<sub>${NN.A}</sub> = −k₁·u<sub>${NN.B}</sub> = ${fmt(RA,1)} N. The two wall reactions sum to −F = ${-F} N (equilibrium check!).`}),
  {type:'choice',q:'Why could K not be inverted before the boundary conditions were applied?',opts:[
   {t:'The structure could move as a rigid body – zero-energy mode, det K = 0',ok:true,why:'K·[1,1,1,1]ᵀ = 0: a rigid translation needs no force, so K has a zero eigenvalue. Every FE model must suppress all rigid-body modes (6 in 3-D).'},
   {t:'The springs had different stiffnesses',why:'Different stiffnesses are fine; singularity comes from missing supports.'},
   {t:'The node numbering was not sequential',why:'Numbering only affects bandwidth/efficiency, not singularity.'},
   {t:'There were too few elements',why:'Even one element is solvable once supported.'}]}
 ]};}});

defLevel({id:'w2l2',world:2,title:'Mesh Convergence Lab',short:'h-refinement on a plate with hole vs a singular re-entrant corner',
concept:`<p>The FE solution approaches the exact solution as elements get smaller (<b>h-refinement</b>) or higher order (<b>p-refinement</b>). Displacements converge fastest; <b>stresses</b> (derivatives of displacements) converge more slowly, so do a <b>mesh convergence study</b>: refine until the quantity of interest changes by less than ~2–5 %.</p>
<div class="formula">Plate with hole: σ<sub>peak</sub> → K<sub>t</sub>·σ<sub>nom</sub> (finite, convergent)</div>
<p>At a <b>sharp re-entrant corner</b> linear-elastic theory predicts infinite stress (Williams): σ ∝ r<sup>λ−1</sup>. For a 90° re-entrant corner (270° material wedge) λ ≈ 0.544:</p>
<div class="formula">σ ∝ r<sup>−0.456</sup> &nbsp;&nbsp; → halving the element size raises the peak by 2<sup>0.456</sup> ≈ 1.37 – forever.</div>
<p>Such <b>singularities</b> also occur at point loads, point supports and sharp contact edges. The peak value there is a mesh artefact, not a result. Model the real fillet radius, or assess the stress away from the singularity (St-Venant), or use fracture-mechanics/hot-spot methods.</p>
<p class="mut small">Note: the FE peak values in this lab come from a realistic convergence model (not a live solver).</p>`,
takeaway:'Converged stress = refine until changes are small. A value that keeps growing with refinement is a singularity – do not report it.',
build(sim){
 const dW=Math.round(rnd(0.15,0.45)*100)/100,Kt=KtHole(dW),sn=round5(rnd(60,150)),sth=Kt*sn;
 const ns=[2,4,8,16,32,64];let geo='hole',lv={hole:0,L:0};const hist={hole:{},L:{}};
 const sFE=(g,n)=>g==='hole'?sth*(1-0.6*Math.pow(2/n,1.8)):sn*1.6*Math.pow(n/2,0.456);
 const nel=(g,n)=>g==='hole'?n*Math.max(1,n/2):3*n*n;
 const C=makeCanvas(sim,680,400),ctx=C.ctx;
 const row=el('div',{class:'row'});sim.appendChild(row);
 const bC=el('button',{class:'btn'},'− Coarsen'),bR=el('button',{class:'btn pri'},'+ Refine (h/2)'),bG=el('button',{class:'btn'},'Switch to L-bracket');row.append(bC,bR,bG);
 const info=el('div',{class:'small',style:'margin-top:6px'});sim.appendChild(info);
 bR.onclick=()=>{if(lv[geo]<ns.length-1)lv[geo]++;solve();};bC.onclick=()=>{if(lv[geo]>0)lv[geo]--;solve();};
 bG.onclick=()=>{geo=geo==='hole'?'L':'hole';bG.textContent=geo==='hole'?'Switch to L-bracket':'Switch to plate with hole';solve();};
 function solve(){const n=ns[lv[geo]];hist[geo][n]=sFE(geo,n);draw();
  const ks=Object.keys(hist[geo]).map(Number).sort((a,b)=>a-b);
  info.innerHTML=`<b>${geo==='hole'?'Plate with hole':'L-bracket (sharp corner)'}</b> · σ<sub>nom</sub> = ${sn} MPa${geo==='hole'?' · d/W = '+dW:''} · history: `+ks.map((k,i)=>{const v=hist[geo][k];const p=hist[geo][ks[i-1]];return`${nel(geo,k)} el → <b>${fmt(v,1)}</b> MPa${p&&ks[i-1]===k/2?` (${v>p?'+':''}${fmt(100*(v-p)/p,1)} %)`:''}`;}).join(' · ');}
 function draw(){C.clear();const n=ns[lv[geo]];const x0=30,y0=40,S=300;
  if(geo==='hole'){const a=dW*S,m=Math.max(1,n/2);const node=(i,j)=>{const th=Math.PI/2*i/n;const ix=a*Math.cos(th),iy=a*Math.sin(th);let ox,oy;if(th<=Math.PI/4){ox=S;oy=S*Math.tan(th);}else{ox=S/Math.tan(th);oy=S;}const s=Math.pow(j/m,1.6);return[x0+ix+s*(ox-ix),y0+S-(iy+s*(oy-iy))];};
   for(let i=0;i<n;i++)for(let j=0;j<m;j++){const p=[node(i,j),node(i+1,j),node(i+1,j+1),node(i,j+1)];const cx=(p[0][0]+p[2][0])/2-x0,cy=y0+S-(p[0][1]+p[2][1])/2;const r=Math.hypot(cx,cy),th=Math.atan2(cy,cx);
    const q=a*a/(r*r),c2=Math.cos(2*th),s2=Math.sin(2*th);const srr=0.5*(1-q)+0.5*(1+3*q*q-4*q)*c2,stt=0.5*(1+q)-0.5*(1+3*q*q)*c2,trt=-0.5*(1-3*q*q+2*q)*s2;const c=Math.cos(th),s=Math.sin(th);
    const v=(srr*c*c+stt*s*s-2*trt*s*c)/3*(sFE('hole',n)/sth);ctx.beginPath();p.forEach((P,k)=>k?ctx.lineTo(...P):ctx.moveTo(...P));ctx.closePath();ctx.fillStyle=heat(v);ctx.fill();ctx.strokeStyle='#0008';ctx.lineWidth=n>32?0.4:0.8;ctx.stroke();}
   txt(ctx,'Quarter model (2 symmetry planes)',x0,y0-14,'#9aa6bf','11px system-ui');for(let k=0;k<5;k++)arrow(ctx,x0+S+4,y0+20+k*65,x0+S+24,y0+20+k*65,'#ffb74d',1.5,6);
   ctx.strokeStyle='#ffd54f';ctx.lineWidth=2;dot(ctx,x0,y0+S-a,4,'#ffd54f');txt(ctx,'peak',x0+6,y0+S-a-6,'#ffd54f','11px system-ui');}
  else{const h=S/2/n;for(let i=0;i<2*n;i++)for(let j=0;j<2*n;j++){if(i>=n&&j>=n)continue;const cx=(i+0.5)*h,cy=(j+0.5)*h;const r=Math.hypot(cx-S/2,cy-S/2)/S;const v=0.25*Math.pow(r/0.5,-0.456)*Math.pow(n/2,0)*0.9;
    ctx.fillStyle=heat(Math.min(1,v*(1+0.15*Math.log2(n))));ctx.fillRect(x0+i*h,y0+S-(j+1)*h,h,h);ctx.strokeStyle='#0008';ctx.lineWidth=n>32?0.3:0.8;ctx.strokeRect(x0+i*h,y0+S-(j+1)*h,h,h);}
   ctx.fillStyle='#56627e';ctx.fillRect(x0,y0+S,S,8);for(let k=0;k<4;k++)arrow(ctx,x0+S/2+10+k*35,y0+S/2-4,x0+S/2+10+k*35,y0+S/2-28,'#ffb74d',1.5,6);
   dot(ctx,x0+S/2,y0+S/2,4,'#ffd54f');txt(ctx,'sharp re-entrant corner',x0+S/2+6,y0+S/2+16,'#ffd54f','11px system-ui');txt(ctx,'L-bracket, fixed base, load on arm',x0,y0-14,'#9aa6bf','11px system-ui');}
  txt(ctx,`${nel(geo,n)} elements · peak σ = ${fmt(sFE(geo,n),1)} MPa`,x0,y0+S+30,'#e6ebf5','bold 13px system-ui');
  // convergence plot
  const allv=[...Object.values(hist.hole),...Object.values(hist.L),sth];const P=plotArea(ctx,410,30,250,300,[0.5,6.5],[0,Math.max(...allv)*1.12]);
  P.axes('refinement level (elements double per level)','peak stress (MPa)',{xt:[1,2,3,4,5,6],xf:t=>ns[t-1],yoff:40});
  ctx.setLineDash([6,4]);ctx.strokeStyle='#66bb6a';ctx.beginPath();ctx.moveTo(P.x,P.Y(sth));ctx.lineTo(P.x+P.w,P.Y(sth));ctx.stroke();ctx.setLineDash([]);
  if(Object.keys(hist.hole).length>2||geo==='L')txt(ctx,'Kt·σnom',P.x+P.w-4,P.Y(sth)-4,'#66bb6a','11px system-ui','right');
  [['hole','#4fc3f7'],['L','#ef5350']].forEach(([g,col])=>{const ks=Object.keys(hist[g]).map(Number).sort((a,b)=>a-b);ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ks.forEach((k,i)=>{const x=P.X(ns.indexOf(k)+1),y=P.Y(hist[g][k]);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();ks.forEach(k=>dot(ctx,P.X(ns.indexOf(k)+1),P.Y(hist[g][k]),4,col));});
  txt(ctx,'● hole',P.x+6,P.y+14,'#4fc3f7','11px system-ui');txt(ctx,'● L-corner',P.x+56,P.y+14,'#ef5350','11px system-ui');txt(ctx,'n per quarter arc / side',P.x+P.w/2,P.y+P.h+44,'#9aa6bf','10px system-ui','center');
 }
 solve();
 return{tasks:[
  numTask(`First the target: what is the <b>theoretical peak stress</b> at the hole (d/W = ${dW}, σ<sub>nom</sub> = ${sn} MPa on the net section)?`,sth,{unit:'MPa',tol:0.03,dec:1,explain:`K<sub>t</sub> = ${fmt(Kt,3)} → σ<sub>peak</sub> = ${fmt(sth,1)} MPa (green dashed line).`,hint:'Kt = 3 − 3.13(d/W) + 3.66(d/W)² − 1.53(d/W)³'}),
  {type:'action',q:'Refine the <b>plate-with-hole</b> mesh step by step until the peak stress changes by <b>less than 2 %</b> from the previous level. Submit at the first level that satisfies this.',btn:'Submit converged mesh',onShow:()=>{if(geo!=='hole')bG.click();},
   check:()=>{if(geo!=='hole')return{ok:false,msg:'Switch back to the plate with hole.'};const n=ns[lv.hole],p=hist.hole[n/2];if(!p)return{ok:false,msg:'You need the result of the previous (coarser) level to judge convergence – refine step by step.'};const ch=Math.abs(hist.hole[n]-p)/hist.hole[n];
    if(ch>=0.02)return{ok:false,msg:`Change from the previous level is ${fmt(100*ch,1)} % – not converged yet.`};if(hist.hole[n/4]&&Math.abs(hist.hole[n/2]-hist.hole[n/4])/hist.hole[n/2]<0.02)return{ok:true,partial:0.7,msg:'Converged – though one level coarser was already enough (extra cost for nothing).'};
    return{ok:true,msg:`Change ${fmt(100*ch,2)} % < 2 %. Peak ${fmt(hist.hole[n],1)} MPa vs theory ${fmt(sth,1)} MPa (${fmt(100*(hist.hole[n]-sth)/sth,1)} %).`};},
   reveal:'Converged at 32 elements around the quarter arc.',explain:'The FE peak approaches K<sub>t</sub>σ<sub>nom</sub> from below; stresses need finer meshes than displacements, especially where gradients are steep.'},
  {type:'choice',q:'Now switch to the <b>L-bracket</b> and refine it several times. What happens to the corner peak stress?',onShow:()=>{if(geo!=='L')bG.click();},opts:[
   {t:'It keeps increasing without limit – a stress singularity',ok:true,why:'σ ∝ r^−0.456: every refinement samples closer to r = 0, so the peak grows by ≈37 % per halving.'},
   {t:'It converges to Kt ≈ 3 like the hole',why:'A sharp corner has zero radius → Kt → ∞ in linear elasticity.'},
   {t:'It decreases as the mesh is refined',why:'Refinement captures steeper gradients – it raises the peak.'},
   {t:'It oscillates because of numerical noise',why:'The growth is systematic and predictable (power law), not noise.'}]},
  numTask('From your L-bracket history: by what <b>factor</b> does the peak stress grow each time the element size is halved?',Math.pow(2,0.456),{tol:0.03,explain:'Factor = 2<sup>0.456</sup> ≈ 1.372, from σ ∝ r<sup>λ−1</sup> with λ = 0.5445 for a 90° re-entrant corner. A constant ratio per refinement is the fingerprint of a singularity.',hint:'Divide two successive peak values.'}),
  {type:'choice',q:'The real bracket has a sharp corner in CAD. What is the sound engineering response?',opts:[
   {t:'Model the actual fillet radius (and refine there), or assess stresses away from the singularity with an appropriate method (e.g. hot-spot / linearised stress)',ok:true,why:'Real parts have a radius; with it, the peak converges. Otherwise use methods that do not rely on the singular peak.'},
   {t:'Report the value from the finest mesh as it is the most accurate',why:'There is no converged value to report – a finer mesh would give an even larger number.'},
   {t:'Use a coarse mesh so the peak looks reasonable',why:'That hides the problem; the result is arbitrary and mesh-dependent.'},
   {t:'Switch to a higher Young\'s modulus',why:'In a load-driven linear model E does not change stresses much – and it does not remove the singularity.'}]}
 ]};}});
