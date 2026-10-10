/* ===================== INIT ===================== */
$('#bMap').onclick=showMap;$('#logo').onclick=showMap;$('#bGloss').onclick=showGlossary;$('#bSet').onclick=settings;$('#bSkills').onclick=showSkills;$('#bCalc').onclick=()=>calcOpen();$('#modeBadge').onclick=settings;
tipInit();calcInit();updModeBadge();
showMap();
if(!STORE.seenIntro){STORE.seenIntro=true;save();const box=modal(`<h2>⚙ Welcome to Stress Quest</h2>${mentorHTML("Hi, I'm Ada! I'll be your mentor. Stress Quest teaches how engineers make sure things don't break – from <b>what stress is</b> up to fatigue, FEA and failure statistics. You don't need any prior knowledge.")}
<ol><li><b>🧭 Learning path</b> – short lessons (plain words, an everyday analogy, a tiny worked example, a quick check) alternate with <b>📁 cases</b>: real engineering problems where you make the decisions.</li>
<li><b>💡 Hints</b> in every step: a nudge → the formula and why → a worked substitution. <b>🧮</b> calculator always available; answer boxes also accept expressions like 5000/78.5.</li>
<li><b>🧠 Skills map</b> – watch your mastery grow, get "practise next" suggestions and short review sessions.</li>
<li><b>🏋 Training grounds</b> and an optional <b>🐉 Review Board</b> for extra practice.</li></ol>
<p><b>Choose your difficulty</b> (you can change it anytime in ⚙):</p><div id="introModes"></div><p class="small mut" id="introModeDesc">${MODES[MODE()].desc}</p>`,[{t:"Let's go!",pri:true}]);
 const slot=box.querySelector('#introModes');const fill=()=>{slot.innerHTML='';slot.appendChild(modePicker(()=>{fill();showMap();}));box.querySelector('#introModeDesc').textContent=MODES[MODE()].desc;};fill();}
