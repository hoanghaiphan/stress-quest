/* ---------- INTRO CASE i1: rod ---------- */
defCase({id:'i1',icon:'🪝',title:'Will This Rod Hold?',level:1,domains:['s'],inspired:'Hyatt Regency 1981 (check the whole load path)',intro:true,
teaser:'A workshop wants to hang a chain hoist from one threaded steel rod. Is the M8 rod they have good enough? Your first real calculation: force → stress → safety factor.',
build(){
 const m=rint(8,18)*25,F=m*g9,Sy=240,nReq=5;const rods=[['M6',20.1],['M8',36.6],['M10',58.0],['M12',84.3],['M16',157]].map(([n,A])=>({n,A,s:F/A,sf:Sy*A/F}));
 const best=rods.find(r=>r.sf>=nReq);const p=rods[1];
 return{brief:{avatar:'🧔',who:'Ben Okoye',role:'Owner of a small engine workshop',quote:`We want to lift engines of up to ${m} kg with a chain hoist hanging from a single threaded rod screwed into the ceiling beam. I have M8 rods lying around. Good enough?`,
  story:`<p>The rod is steel of property class 4.6 – yield strength <b>S<sub>y</sub> = 240 MPa</b>. Because people work under the load, the workshop's rule is a <b>safety factor of at least ${nReq}</b> against yielding. For threaded rods the load-carrying area is the <b>stress area A<sub>s</sub></b> (a bit smaller than the nominal circle, because of the thread).</p>`,
  data:tbl(rods.map(r=>[r.n,fmt(r.A,1)]),['Rod','Stress area A<sub>s</sub> (mm²)'])},
  sh:200,sketch:(c)=>{c.fillStyle='#3c4a62';c.fillRect(200,18,240,22);txt(c,'ceiling beam',450,34,'#9aa6bf');c.strokeStyle='#cfd8dc';c.lineWidth=4;c.beginPath();c.moveTo(320,40);c.lineTo(320,110);c.stroke();txt(c,'threaded rod',332,80,'#4fc3f7');
   c.fillStyle='#ffb74d';c.fillRect(300,110,40,26);txt(c,'hoist',350,128,'#ffb74d');c.strokeStyle='#9aa6bf';c.lineWidth=2;c.beginPath();c.moveTo(320,136);c.lineTo(320,160);c.stroke();c.fillStyle='#6d7a96';c.fillRect(280,160,80,32);txt(c,`engine ${m} kg`,370,182,'#e6ebf5');arrow(c,250,150,250,190,'#ef5350',2);txt(c,'F = m·g',190,175,'#ef5350');},
 steps:[
  {type:'decide',title:'What decides?',sk:'stress',h1:'Think of the snow and skis: what matters is how concentrated the force is.',q:'What decides whether the rod is strong enough?',opts:[
   O('The stress in the rod (force divided by its stress area) compared with the steel\'s strength',1,'Exactly – the same force is harmless in a thick rod and dangerous in a thin one.'),
   O('Only the weight – the hoist is rated for 500 kg, so it is fine',0.15,'The hoist rating says nothing about the rod that holds the hoist.'),
   O('The length of the rod',0.1,'For a rod in tension the length changes the stretch, not the stress.'),
   O('The colour of the zinc coating',0,'Coatings protect against rust, not overload.')]},
  {type:'compute',title:'Force',sk:'stress',q:`What force does the ${m} kg engine pull on the rod? (g = 9.81 m/s²)`,ans:F,unit:'N',tol:0.02,dec:0,fm:'F = m·g',h1:'Mass (kg) is not a force. Multiply by g to get newtons.',explain:`F = ${m}·9.81 = ${fmt(F,0)} N (≈ ${fmt(F/1000,2)} kN).`},
  {type:'compute',title:'Stress in M8',sk:'stress',q:'Compute the tensile stress in the M8 rod.',ans:p.s,unit:'MPa',tol:0.02,dec:1,fm:'σ = F / A<sub>s</sub>  (N / mm² = MPa)',look:'Data sheet: stress area of M8.',h1:'Divide the force (N) by the M8 stress area (mm²).',explain:`σ = ${fmt(F,0)} N / 36.6 mm² = ${fmt(p.s,1)} MPa.`},
  {type:'compute',title:'Safety factor M8',sk:'sf',q:'Safety factor of the M8 rod against yielding?',ans:p.sf,tol:0.03,dec:2,fm:'n = S<sub>y</sub> / σ',h1:'Strength on top, stress below.',explain:`n = 240 / ${fmt(p.s,1)} = ${fmt(p.sf,2)}.`},
  {type:'decide',title:'Is M8 OK?',sk:'sf',q:`The rule asks for n ≥ ${nReq}. Is the M8 rod acceptable?`,opts:[
   O(`No – n = ${fmt(p.sf,2)} is below the required ${nReq}`,1,'The rod would probably hold the static weight, but the margin for jerks, wear and flaws is too small for a load above people.'),
   O('Yes – n is above 1, so it holds',0.1,`n > 1 only means it holds on paper today. The rule (n ≥ ${nReq}) exists for jerks when the chain snaps tight, thread damage and corrosion.`,{s:-20}),
   O('Cannot be decided without FEA',0.1,'A simple rod in tension is a textbook hand calculation – no FEA needed.',{t:-5})]},
  {type:'decide',title:'Choose the rod',sk:'sf',h1:'Compute n = S<sub>y</sub>·A<sub>s</sub>/F for each size and take the smallest one with n ≥ 5.',q:'Which rod do you recommend? (smallest size that meets the rule)',noShuffle:true,opts:rods.map(r=>({t:`${r.n} (A<sub>s</sub> = ${fmt(r.A,1)} mm²)`,q:r===best?1:r.sf>=nReq?0.6:0.05,fb:`σ = ${fmt(r.s,1)} MPa → n = ${fmt(r.sf,2)} ${r.sf>=nReq?'≥':'<'} ${nReq}. ${r===best?'Smallest compliant size.':r.sf>=nReq?'Safe, but bigger than necessary.':'Does not meet the rule.'}`,fx:r.sf>=nReq?{c:-2}:{s:-25}}))},
  {type:'final',title:'Advice to Ben',sk:'sf',q:'Your advice:',opts:[
   O(`Use an ${best.n} rod (n ≈ ${fmt(best.sf,1)}), and also check the ceiling beam, the anchor/nut and the hoist rating – mark the maximum load on the hoist.`,1,'Whole load path checked, clear limit for users.',{},null,`Ben installs the ${best.n} rod; a local structural engineer confirms the beam. Two years later the hoist is still lifting engines every week.`),
   O('Use the M8 – it holds the weight with n above 1.',0.05,'',{s:-40},null,'A few months later, a jerk when an engine slips on the chain overloads the M8 rod; it yields at the thread and the engine drops onto the workbench. Luckily nobody is under it.'),
   O('Use the biggest rod you can find, no calculation needed.',0.4,'Safe, but without a calculation you cannot say how safe – and the beam may still be the weak link.',{c:-10},null,'The M16 rod holds – but the anchor in the ceiling beam had never been checked. It is fine this time.')]}],
 debrief:{chain:['Turn the mass into a force: F = m·g.','Find the area that really carries the load (thread stress area).','Stress σ = F/A, then safety factor n = S<sub>y</sub>/σ.','Compare with the required n and pick the smallest compliant size.','Check the whole load path – rod, nut, anchor, beam.'],
  concepts:[['Stress, strength & stress–strain','w1l1'],['Failure criteria & safety','w1l3']],
  pitfalls:['Using kg as if it were a force (forgetting g = 9.81).','Using the nominal diameter instead of the thread stress area.','Thinking n > 1 is "safe enough" – rules ask for margins for good reasons.','Checking one part and forgetting the connection it hangs from.'],
  history:'<b>Hyatt Regency, Kansas City (1981):</b> the hotel\'s walkways hung from steel rods. A change in the detailing made one connection carry twice the intended load; the connection failed and 114 people died. The lesson for every hanging load: check the whole load path, and review every design change.'}};}});

/* ---------- INTRO CASE i2: bookshelf ---------- */
defCase({id:'i2',icon:'📚',title:'Why Did the Bookshelf Sag?',level:1,domains:['s'],inspired:'Galileo\'s beam (1638)',intro:true,
teaser:'A student\'s shelf smiles at him every morning. Will it break? Bigger board or a support in the middle? Learn the difference between strength and stiffness.',
build(){
 const L=rint(8,10)*100,b=250,h=pick([16,18]),q=rint(6,9)*5;const w=q*g9/1000,M=w*L*L/8,W=b*h*h/6,sig=M/W,E=2500,I=b*h*h*h/12,del=5*w*Math.pow(L,4)/(384*E*I),fs=12;
 const dThick=del*Math.pow(h/25,3),dMid=del/16,dOak=del*E/11000;
 return{brief:{avatar:'🧑‍🎓',who:'Jonas',role:'Student, proud owner of 300 books',quote:'My shelf sags like a smile in the middle. Will it break one day? Should I buy a thicker board, or add a bracket in the middle?',
  story:`<p>The shelf is a particleboard plank, <b>${L} mm</b> long between the two shelf pins, <b>${b} mm</b> deep and <b>${h} mm</b> thick, full of books – about <b>${q} kg per metre</b>. The plank simply rests on the pins (simply supported).</p>`,
  data:tbl([['Particleboard stiffness E','2 500 MPa'],['Particleboard bending strength','≈ 12 MPa'],['"Looks OK" sag limit','L/300 = '+fmt(L/300,1)+' mm']])},
  sh:180,sketch:(c)=>{c.fillStyle='#6d5a43';c.beginPath();c.moveTo(120,60);c.quadraticCurveTo(320,110,520,60);c.lineTo(520,75);c.quadraticCurveTo(320,125,120,75);c.closePath();c.fill();
   for(let k=0;k<22;k++){const x=135+k*17;const y=60+25*(1-Math.pow((x+6-320)/200,2))-31;c.fillStyle=['#4fc3f7','#ba68c8','#ffb74d','#66bb6a'][k%4];c.fillRect(x,y,12,32);}
   dot(c,120,82,6,'#9aa6bf');dot(c,520,82,6,'#9aa6bf');txt(c,`L = ${L} mm`,280,150,'#9aa6bf');txt(c,'sag δ',330,128,'#ef5350');arrow(c,320,75,320,100,'#ef5350',2);},
 steps:[
  {type:'decide',title:'Sag or break?',sk:'mat',h1:'Is a bendy thing always a weak thing? Think of a rubber band.',q:'Jonas mixes up two questions. Which statement is right?',opts:[
   O('Sagging is about stiffness (how much it deflects); breaking is about strength (stress vs material strength). Check both.',1,'Two different properties, two different calculations.'),
   O('A shelf that sags is about to break',0.1,'Not necessarily: a stiffness problem is not a strength problem.'),
   O('Sagging does not matter at all',0.2,'Big sag looks bad, books slide, and wood-based boards creep – the sag grows over months.')]},
  {type:'compute',title:'Load per mm',sk:'stress',q:`The books weigh ${q} kg per metre. What is the load w in N per <b>mm</b> of shelf?`,ans:w,unit:'N/mm',tol:0.02,dec:3,fm:'w = (kg per m)·9.81 / 1000  (N/m → N/mm)',h1:'First kg → N (× 9.81), then per metre → per millimetre (÷ 1000).',explain:`w = ${q}·9.81/1000 = ${fmt(w,3)} N/mm.`},
  {type:'compute',title:'Bending moment',sk:'bend',q:'Maximum bending moment in the middle of the shelf (evenly spread load, simply supported)?',ans:M,unit:'N·mm',tol:0.02,dec:0,fm:'M = w·L²/8',h1:'Use w from the last step and L in mm.',explain:`M = ${fmt(w,3)}·${L}²/8 = ${fmt(M,0)} N·mm.`},
  {type:'compute',title:'Bending stress',sk:'bend',q:'Bending stress in the board?',ans:sig,unit:'MPa',tol:0.03,dec:2,fm:'σ = M/W · W = b·h²/6 (b = depth of the shelf, h = thickness)',h1:'The board bends about its thin side: h = thickness, b = depth.',explain:`W = ${b}·${h}²/6 = ${fmt(W,0)} mm³ → σ = ${fmt(M,0)}/${fmt(W,0)} = ${fmt(sig,2)} MPa.`},
  {type:'decide',title:'Will it break?',sk:'sf',q:'Particleboard bending strength ≈ 12 MPa. Will the shelf break?',opts:[
   O(`No – σ ≈ ${fmt(sig,1)} MPa gives a safety factor of about ${fmt(fs/sig,1)}`,1,'The board is strong enough. The problem is something else.'),
   O('Yes – it is sagging, so it is failing',0.05,'Sag is not failure. The stress is well below the strength.'),
   O('Impossible to say without a lab test',0.2,'A simple beam calculation answers this well.')]},
  {type:'compute',title:'How much sag?',sk:'mat',q:'Compute the sag in the middle: δ = 5·w·L⁴/(384·E·I), with I = b·h³/12.',ans:del,unit:'mm',tol:0.04,dec:1,fm:'δ = 5·w·L⁴/(384·E·I) · I = b·h³/12 (mm⁴) · E = 2500 MPa',h1:'Compute I first (thickness cubed!), then plug everything in N and mm.',explain:`I = ${b}·${h}³/12 = ${fmt(I,0)} mm⁴ → δ = 5·${fmt(w,3)}·${L}⁴/(384·2500·${fmt(I,0)}) = ${fmt(del,1)} mm – much more than L/300 = ${fmt(L/300,1)} mm.`},
  {type:'decide',title:'The fix',sk:'bend',h1:'Sag grows with L⁴ and shrinks with h³ and E. Which change attacks the biggest exponent?',q:'Which fix reduces the sag most effectively and cheaply?',opts:[
   O('A bracket in the middle (two spans of L/2)',1,`Sag ∝ L⁴: halving the span gives at least 16× less sag → about ${fmt(dMid,1)} mm or less. Cheap and very effective.`),
   O('A 25 mm board of the same particleboard',0.75,`I ∝ h³: (${h}/25)³ → about ${fmt(dThick,1)} mm. Works, but you need a new board.`,{c:-5}),
   O('Solid oak of the same thickness (E ≈ 11 000 MPa)',0.6,`About ${fmt(dOak,1)} mm – 4.4× stiffer material, but expensive.`,{c:-10}),
   O('Flip the board upside down',0.15,'It straightens for a while, then creeps back. It treats the symptom, not the cause.'),
   O('Stronger screws in the shelf pins',0,'The pins are not the problem; the board is too flexible.')]},
  {type:'final',title:'Advice to Jonas',sk:'bend',q:'Your advice:',opts:[
   O('It will not break, but it is too flexible: add a middle bracket (or a thicker board). Put the heaviest books near the supports. Particleboard creeps, so the sag would keep growing.',1,'',{},null,'Jonas adds a €3 bracket. The shelf is straight – and stays straight a year later.'),
   O('It will break soon – throw it away.',0.1,'',{c:-15},null,'Jonas buys a new shelf of the same kind. It sags just like the old one.'),
   O('Nothing to do – it won\'t break.',0.35,'',{},null,'True, it doesn\'t break – but particleboard creeps: after a year the sag has roughly doubled and the books slide to the middle.')]}],
 debrief:{chain:['Separate strength (will it break?) from stiffness (how much does it bend?).','Load → bending moment M = wL²/8 → stress σ = M/W → compare with strength.','Sag δ = 5wL⁴/(384EI): span to the 4th power, thickness to the 3rd.','Choose the fix that attacks the biggest exponent: shorter span.'],
  concepts:[['Beam bending','w1l4'],['Stiffness and E','w1l1']],
  pitfalls:['Treating sag as a strength problem.','Forgetting that W = bh²/6 and I = bh³/12 depend strongly on thickness.','Mixing N/m and N/mm.','Ignoring creep in wood-based boards and plastics.'],
  history:'<b>Galileo Galilei</b> analysed the breaking strength of a cantilever beam in his <i>Two New Sciences</i> (1638) – one of the first attempts at a beam theory. His stress distribution was not correct; the beam theory we use today (Euler–Bernoulli) was developed in the 18th century.'}};}});

/* ---------- INTRO CASE i3: which part fails first ---------- */
defCase({id:'i3',icon:'🛴',title:'Which Part Fails First?',level:1,domains:['t'],inspired:'everyday reliability',intro:true,
teaser:'Two suppliers of e-scooter folding hinges. One has the better average lifetime. The fleet manager wants the better one. Averages can lie – find out how.',
build(){
 let X,Y;const T=40;for(let g=0;g<500;g++){Y=[...Array(6)].map(()=>Math.round(60+5*randn()));X=[...Array(4)].map(()=>Math.round(88+6*randn())).concat([rint(18,30),rint(22,36)]);X=shuffle(X);
  if(Math.min(...Y)>T+5&&X.filter(x=>x<T).length===2&&mean(X)>mean(Y)+3)break;}
 const mX=mean(X),mY=mean(Y),early=100*X.filter(x=>x<T).length/6;
 return{brief:{avatar:'👩‍💼',who:'Aylin Demir',role:'Fleet manager, e-scooter sharing',quote:'Supplier X\'s hinges last longer on average – the test lab says so. Let\'s order 5,000 from X. Agreed?',
  story:`<p>The folding hinge is replaced at every service, after about <b>${T} thousand</b> folding/riding load cycles. A hinge that breaks before that can make a rider fall. The lab tested <b>6 hinges</b> from each supplier to failure on a rig.</p>`,
  data:tbl([['Supplier X',...X],['Supplier Y',...Y]],['Life (thousand cycles)','#1','#2','#3','#4','#5','#6'])},
  sh:170,sketch:(c)=>{const P=plotArea(c,70,15,540,110,[0,110],[0,3]);P.axes('life (thousand cycles)','',{yt:[1,2],yf:v=>v===2?'X':'Y',yoff:30});c.strokeStyle='#ef5350';c.setLineDash([5,4]);c.beginPath();c.moveTo(P.X(T),15);c.lineTo(P.X(T),125);c.stroke();c.setLineDash([]);txt(c,'service',P.X(T)+4,28,'#ef5350');
   X.forEach(x=>dot(c,P.X(x),P.Y(2),6,'#ffb74d','#0c111b'));Y.forEach(y=>dot(c,P.X(y),P.Y(1),6,'#4fc3f7','#0c111b'));},
 steps:[
  {type:'compute',title:'Average X',sk:'stat',q:'Mean life of supplier X (thousand cycles)?',ans:mX,tol:0.01,dec:1,unit:'k cycles',fm:'mean = (sum of all values)/number of values',h1:'Add the six X values and divide by 6.',explain:`(${X.join(' + ')})/6 = ${fmt(mX,1)}.`},
  {type:'compute',title:'Average Y',sk:'stat',q:'Mean life of supplier Y?',ans:mY,tol:0.01,dec:1,unit:'k cycles',fm:'mean = (sum of all values)/number of values',h1:'Same as before, with the Y row.',explain:`(${Y.join(' + ')})/6 = ${fmt(mY,1)} – lower than X.`},
  {type:'decide',title:'Higher average = better?',sk:'stat',h1:'Look at the dot plot: where are the X dots relative to the red service line?',q:'X has the higher mean. Does that make X the better hinge?',opts:[
   O('Not necessarily – look at the spread and especially the weakest parts',1,'Failures happen in the weak tail, not at the average.'),
   O('Yes – a higher average always means fewer failures',0.05,'An average can hide a few very early failures.'),
   O('No – lower average is always better',0,'That makes no sense either; it\'s about the whole distribution.')]},
  {type:'compute',title:'Early failures X',sk:'stat',q:`What percentage of the X hinges failed BEFORE the ${T} thousand cycle service interval?`,ans:early,unit:'%',abs:1,tol:0,dec:1,fm:'fraction = count below the line / total × 100',h1:'Count the X values below '+T+', divide by 6.',explain:`${X.filter(x=>x<T).length} of 6 = ${fmt(early,1)} %. Supplier Y: 0 of 6.`},
  {type:'decide',title:'Supplier',sk:'rel',q:'Which supplier do you recommend?',opts:[
   O('Supplier Y – every tested hinge outlived the service interval, with small scatter',1,'Consistency is what keeps riders safe here.'),
   O('Supplier X – the higher average wins',0.05,`One in three X hinges broke before service – that is ${fmt(early,0)} % of riders at risk.`,{s:-30}),
   O('Test 20 more of each first',0.55,'More data is always welcome, but the early failures of X are already a clear warning.',{t:-15}),
   O('Order half from each',0.2,'Half the fleet would still carry the early-failure risk.',{s:-15})]},
  {type:'final',title:'Advice to Aylin',sk:'stat',q:'Your message to Aylin:',opts:[
   O(`Order from Y. X looks better on average, but ${fmt(early,0)} % of its hinges failed before the service interval – for a safety part the weakest units matter. Ask X to find the cause of the early failures; with only 6 samples, keep monitoring field returns.`,1,'',{},null,'The Y hinges go into service. Field data after a year: no hinge failures before service. Supplier X later finds a heat-treatment problem in part of its production.'),
   O('Order from X – longer life on average.',0.05,'',{s:-40},null,'Within months several hinges break in service. Two riders are injured; the fleet is grounded for inspection.'),
   O('Both are fine – the averages are close.',0.2,'',{s:-20},null,'Half the scooters get X hinges; early hinge failures start to appear in the field.')]}],
 debrief:{chain:['Compute the averages – but don\'t stop there.','Plot all the data against the requirement (service interval).','Count how many fall short: the weak tail decides safety.','Recommend the consistent supplier; ask for the root cause of early failures.','Small samples: keep collecting data.'],
  concepts:[['Scatter & allowables','w3l4'],['Load vs strength scatter','w3l3'],['Weibull (next step)','w3l1']],
  pitfalls:['Judging by the average alone.','Ignoring a "few" early failures as outliers.','Over-trusting 6 samples – real decisions need more data and field monitoring.'],
  history:''}};}});
