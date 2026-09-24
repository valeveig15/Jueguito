const screens = {
  intro: document.getElementById('screenIntro'),
  game: document.getElementById('screenGame'),
  final: document.getElementById('screenFinal')
};
const gameContent = document.getElementById('gameContent');
const levelLabel = document.getElementById('levelLabel');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const toast = document.getElementById('toast');
const soundToggle = document.getElementById('soundToggle');
const cowCounter = document.getElementById('cowCounter');
const floatLayer = document.getElementById('floatLayer');
const machineReadout = document.getElementById('machineReadout');

let level = 1;
let soundOn = true;
let cowsCaught = 0;
let milkPercent = 0;
let chaos = 0;
let timers = [];

function clearTimers(){ timers.forEach(t => clearTimeout(t)); timers = []; }
function later(fn, ms){ const id = setTimeout(fn, ms); timers.push(id); return id; }
function showScreen(name){ Object.values(screens).forEach(s => s.classList.remove('active')); screens[name].classList.add('active'); }
function updateCowCounter(){ cowCounter.textContent = `🐄 ${cowsCaught}`; }
function showToast(msg, ms=1600){ toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), ms); }

function sound(type='tap'){
  if(!soundOn) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if(!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  const map = { tap:[430,.09,'sine'], cow:[165,.18,'square'], win:[660,.28,'triangle'], error:[105,.2,'sawtooth'], milk:[510,.07,'sine'] };
  const [freq,dur,wave] = map[type] || map.tap;
  osc.type = wave; osc.frequency.setValueAtTime(freq,ctx.currentTime);
  gain.gain.setValueAtTime(.0001,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.07,ctx.currentTime+.01); gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+dur);
  osc.start(); osc.stop(ctx.currentTime+dur); osc.onended=()=>ctx.close();
}

function floatEmoji(emoji,x=innerWidth/2,y=innerHeight/2){
  const el=document.createElement('div'); el.className='float-thing'; el.textContent=emoji; el.style.left=`${x}px`; el.style.top=`${y}px`; floatLayer.appendChild(el); setTimeout(()=>el.remove(),1800);
}
function burst(emoji,count=6){ for(let i=0;i<count;i++) setTimeout(()=>floatEmoji(emoji,innerWidth*(.3+Math.random()*.4),innerHeight*(.45+Math.random()*.15)),i*60); }

function updateProgress(){ const pct = level*20; levelLabel.textContent=`Prueba ${level} de 5`; progressText.textContent=`${pct}%`; progressBar.style.width=`${pct}%`; }
function nextLevel(){ sound('tap'); level++; updateProgress(); renderLevel(); }
function renderLevel(){ clearTimers(); if(level===1) renderAudit(); if(level===2) renderRunaway(); if(level===3) renderMilk(); if(level===4) renderPoop(); if(level===5) renderBoss(); }

function renderAudit(){
  gameContent.innerHTML=`<div class="game-card">
    <div class="game-kicker">PRUEBA 01 · PARTE MÉDICO NO OFICIAL</div>
    <h2>¿Qué tan tambo viene el día?</h2>
    <p class="game-copy">Elegí una. El sistema promete juzgarte menos que una vaca mirándote fijo.</p>
    <div class="choices">
      <button class="choice-btn" data-k="look">🐄 Una vaca me mira raro.<small>Probablemente sabe cosas.</small></button>
      <button class="choice-btn" data-k="mud">👢 El barro ya ganó.<small>Ni siquiera hubo pelea.</small></button>
      <button class="choice-btn" data-k="milk">🥛 Estoy hecho 63% leche.<small>El resto es cafeína y dignidad.</small></button>
      <button class="choice-btn" data-k="fine">😎 Todo bajo control.<small>Esta respuesta activó una alerta.</small></button>
    </div></div>`;
  const replies={look:'Confirmado: esa vaca está redactando un informe sobre vos.',mud:'Resultado: el barro 1 — vos 0. Partido terminado.',milk:'Composición química preocupante, pero funcional.',fine:'Mentirle al sistema no mejora el diagnóstico.'};
  gameContent.querySelectorAll('.choice-btn').forEach(btn=>btn.addEventListener('click',()=>{ chaos+=2; sound('cow'); burst('🐄',3); showToast(replies[btn.dataset.k]); later(nextLevel,800); },{once:true}));
}

function renderRunaway(){
  gameContent.innerHTML=`<div class="game-card">
    <div class="game-kicker">PRUEBA 02 · RETORNO RESPONSABLE</div>
    <h2>Listo. Volvé a trabajar.</h2>
    <p class="game-copy">Solo tenés que tocar el botón correcto. Tranquilo, no tiene ninguna trampa ridícula.</p>
    <div class="paddock-zone" id="paddockZone">
      <button class="runaway-btn" id="runawayBtn">Volver con las vacas</button>
      <button class="good-btn" id="goodBtn">Bueno, 30 segundos más</button>
    </div></div>`;
  const zone=document.getElementById('paddockZone'), run=document.getElementById('runawayBtn'), good=document.getElementById('goodBtn'); let escapes=0;
  const phrases=['🐄 Te están esperando','No tan rápido','La vaca dijo que no','Casi','JAJA no','Seguís acá','Bueno, rendite'];
  const move=()=>{escapes++; chaos++; const maxX=Math.max(20,zone.clientWidth-run.offsetWidth-18), maxY=Math.max(20,zone.clientHeight-run.offsetHeight-78); run.style.left=`${18+Math.random()*Math.max(1,maxX-18)}px`; run.style.top=`${16+Math.random()*Math.max(1,maxY-16)}px`; run.textContent=phrases[Math.min(escapes-1,phrases.length-1)]; sound('tap'); if(escapes===5) burst('🐄',5);};
  run.addEventListener('mouseenter',move); run.addEventListener('touchstart',e=>{e.preventDefault();move()},{passive:false}); run.addEventListener('click',move);
  good.addEventListener('click',()=>{showToast(escapes>3?'Excelente. Finalmente aceptaste tu destino.':'Decisión madura. Bastante sospechosa.'); nextLevel();},{once:true});
}

function renderMilk(){
  gameContent.innerHTML=`<div class="game-card">
    <div class="game-kicker">PRUEBA 03 · ORDEÑE ABSOLUTAMENTE FALSO</div>
    <h2>Llená el tanque.</h2>
    <p class="game-copy">Tenés 7 segundos. Tocá la vaca como si tu prestigio rural dependiera de esto.</p>
    <div class="scoreline"><span>Golpes de prestigio: <strong id="milkHits">0</strong></span><span>Tiempo: <strong id="milkTime">7.0</strong>s</span></div>
    <div class="milk-layout"><div class="milk-panel"><button class="milk-button" id="milkButton">🐄</button></div><div class="milk-meter"><div class="milk-fill" id="milkFill"></div><div class="milk-percent" id="milkPercent">0%</div></div></div></div>`;
  const btn=document.getElementById('milkButton'), fill=document.getElementById('milkFill'), pct=document.getElementById('milkPercent'), hitsEl=document.getElementById('milkHits'), timeEl=document.getElementById('milkTime');
  let hits=0, active=true; const start=performance.now();
  btn.addEventListener('click',()=>{ if(!active)return; hits++; milkPercent=Math.min(100,hits*4); hitsEl.textContent=hits; pct.textContent=`${milkPercent}%`; fill.style.height=`${milkPercent}%`; sound('milk'); floatEmoji(Math.random()>.45?'🥛':'💧',innerWidth*.5+(Math.random()-.5)*160,innerHeight*.54); });
  function tick(){ if(!active)return; const rem=Math.max(0,7-(performance.now()-start)/1000); timeEl.textContent=rem.toFixed(1); if(rem>0) requestAnimationFrame(tick); }
  tick();
  later(()=>{active=false; btn.disabled=true; chaos+=Math.floor(hits/4); const msg=milkPercent>=100?'Producción absurda. Las vacas están considerando sindicalizarse.':milkPercent>=64?'Nivel aceptable. Ninguna vaca presentó queja formal.':'El tanque quedó medio triste, pero nadie murió.'; showToast(msg,1900); burst('🥛',6); later(nextLevel,1500);},7000);
}

function renderPoop(){
  gameContent.innerHTML=`<div class="game-card" id="poopCard">
    <div class="game-kicker">PRUEBA 04 · SUPERVIVENCIA DE CAMPO</div>
    <h2>Esquivá el desastre.</h2>
    <p class="game-copy">Mové al tambero. Evitá 💩. Agarrá 🥛. Sí, este proyecto perdió toda seriedad.</p>
    <div class="scoreline"><span>Puntos: <strong id="fieldScore">0</strong></span><span>Golpes: <strong id="hitsTaken">0</strong>/3</span></div>
    <div class="poop-panel" id="poopPanel"><div class="player" id="player">🧑‍🌾</div></div>
    <div class="lane-controls"><button class="arcade-btn" id="leftBtn">← IZQ</button><button class="arcade-btn" id="rightBtn">DER →</button></div></div>`;
  const panel=document.getElementById('poopPanel'), player=document.getElementById('player'), scoreEl=document.getElementById('fieldScore'), hitEl=document.getElementById('hitsTaken'), card=document.getElementById('poopCard'); let pos=50, score=0,hits=0,active=true;
  const move=d=>{pos=Math.max(7,Math.min(93,pos+d));player.style.left=`${pos}%`;sound('tap')};
  document.getElementById('leftBtn').onclick=()=>move(-13); document.getElementById('rightBtn').onclick=()=>move(13);
  const key=e=>{if(!active)return;if(e.key==='ArrowLeft')move(-10);if(e.key==='ArrowRight')move(10)}; window.addEventListener('keydown',key);
  function spawn(){ if(!active)return; const good=Math.random()<.28, el=document.createElement('div'); el.className='drop'; el.textContent=good?'🥛':'💩'; el.dataset.good=good?'1':'0'; el.style.left=`${5+Math.random()*88}%`; el.style.animationDuration=`${1.6+Math.random()*.8}s`; panel.appendChild(el);
    const checker=setInterval(()=>{ if(!active||!el.isConnected){clearInterval(checker);return} const a=el.getBoundingClientRect(),b=player.getBoundingClientRect(); if(a.bottom>b.top&&a.top<b.bottom&&a.right>b.left&&a.left<b.right){clearInterval(checker);el.remove(); if(good){score+=2;sound('win');floatEmoji('🥛',b.left,b.top); } else {hits++;chaos+=3;sound('error');card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake');floatEmoji('💩',b.left,b.top); } scoreEl.textContent=score;hitEl.textContent=hits; if(hits>=3) finishField(); }},40);
    setTimeout(()=>el.remove(),2500);
  }
  const spawner=setInterval(spawn,470);
  function finishField(){ if(!active)return;active=false;clearInterval(spawner);window.removeEventListener('keydown',key); panel.querySelectorAll('.drop').forEach(x=>x.remove()); const msg=hits>=3?'Tres impactos. El campo ha hablado.':'Sobreviviste. Tu calzado, posiblemente no.'; showToast(msg,1700); later(nextLevel,1350); }
  later(finishField,9000);
}

function renderBoss(){
  let step=0;
  const rounds=[
    {q:'Muu. Informe de situación: ¿por qué abandonaste tu puesto?',a:['Control de calidad remoto.','Fui secuestrado por una web.','No puedo declarar sin mi abogado.']},
    {q:'Muu. Segunda pregunta: ¿quién autorizó esta pausa?',a:['La autoridad competente: yo.','Nadie. Por eso es divertida.','Una vaca de otro establecimiento.']},
    {q:'Muu. Última: ¿merecés una compensación?',a:['Obviamente.','Quiero apelar la pregunta.','Depende del premio.']}
  ];
  const draw=()=>{const r=rounds[step];gameContent.innerHTML=`<div class="game-card"><div class="game-kicker">PRUEBA 05 · ENTREVISTA CON GERENCIA</div><h2>La vaca jefa quiere explicaciones.</h2><div class="boss-wrap"><div class="boss-cow">🐄</div><div><div class="speech">${r.q}</div><div class="boss-options">${r.a.map((x,i)=>`<button data-i="${i}">${x}</button>`).join('')}</div></div></div></div>`;
    gameContent.querySelectorAll('.boss-options button').forEach(btn=>btn.onclick=()=>{cowsCaught++;updateCowCounter();chaos+=Number(btn.dataset.i)+1;sound('cow');burst('🐄',2); if(step<rounds.length-1){step++;showToast(['Respuesta registrada. La vaca no parece convencida.','La gerencia bovina toma nota.','Se escuchó un muu administrativo.'][step]);later(draw,650)}else{showToast('Aprobado. Pero la vaca dejó un último problema.');later(renderCipher,900)}})};
  draw();
}

function renderCipher(){
  const layers = [
    {
      title:'CAPA 01 · EL CÓDIGO IMPOSIBLE',
      clue:'La vaca dejó 16 marcas distintas. No son números normales.',
      strong:'Pista extra: pensá en una base que termina en F.',
      expected:'YXBpIGxzYWFwcyBoIGZzdXYgYnZmIHp6cHQgUA==',
      code:'595842704947787A595746776379426F49475A7A64585967596E5A6D494870366348516755413D3D'
    },
    {
      title:'CAPA 02 · 64 CORRALES',
      clue:'Bien. Ahora parece texto raro, pero vive en un sistema de 64 símbolos.',
      strong:'Pista extra: Base64. Sí, la vaca estudió informática.',
      expected:'api lsaaps h fsuv bvf zzpt P',
      code:'YXBpIGxzYWFwcyBoIGZzdXYgYnZmIHp6cHQgUA=='
    },
    {
      title:'CAPA 03 · EL TRACTOR SOSPECHOSO',
      clue:'El tractor hizo todo el recorrido marcha atrás. Tal vez el mensaje también.',
      strong:'Pista extra: invertí absolutamente todos los caracteres.',
      expected:'P tpzz fvb vusf h spaasl ipa',
      code:'api lsaaps h fsuv bvf zzpt P'
    },
    {
      title:'CAPA 04 · EL RELOJ DEL TAMBO',
      clue:'Última capa. El reloj está exactamente 7 horas adelantado. Hay que devolver cada letra a su lugar.',
      strong:'Pista extra: cifrado César, desplazamiento -7.',
      expectedHash:'ce96c61eeea9a251395242b6f37b66a0736523038a95fca548151d9433eed3ae',
      code:'P tpzz fvb vusf h spaasl ipa'
    }
  ];
  let stage=0, errors=0, hints=0;
  const secretChars=[73,32,109,105,115,115,32,121,111,117,32,111,110,108,121,32,97,32,108,105,116,116,108,101,32,98,105,116];

  function draw(){
    const r=layers[stage];
    gameContent.innerHTML=`<div class="game-card cipher-card">
      <div class="game-kicker">FINAL BOSS · PROTOCOLO MUU-256</div>
      <div class="cipher-head"><div><h2>${r.title}</h2><p class="game-copy">Hay un mensaje escondido abajo. Si lo descifrás, ganás. Si no, la vaca queda legalmente a cargo.</p></div><div class="cipher-lock">${stage===3?'🔐':'🔒'}</div></div>
      <div class="cipher-status"><span>CAPA ${stage+1}/4</span><span>ERRORES ${errors}</span><span>PISTAS ${hints}</span></div>
      <div class="cipher-code" id="cipherCode">${r.code}</div>
      <button class="tiny-copy" id="copyCodeBtn">Copiar código</button>
      <div class="cipher-clue"><span>🐄 PISTA</span><p>${r.clue}</p><button id="hintBtn">Necesito una pista menos elegante</button><div id="extraHint" class="extra-hint"></div></div>
      <div class="cipher-entry">
        <label for="cipherInput">Tu resultado de esta capa</label>
        <textarea id="cipherInput" rows="2" spellcheck="false" autocomplete="off" placeholder="Pegá o escribí acá lo que logres descifrar..."></textarea>
        <button class="primary-btn" id="checkCipher">Probar código</button>
      </div>
      <div id="cipherFeedback" class="cipher-feedback" aria-live="polite"></div>
    </div>`;
    const input=document.getElementById('cipherInput');
    input.focus();
    document.getElementById('copyCodeBtn').onclick=async()=>{try{await navigator.clipboard.writeText(r.code);showToast('Código copiado. La vaca no vio nada.')}catch{showToast('Copiar falló. Ataque bovino sospechado.')}};
    document.getElementById('hintBtn').onclick=()=>{hints++;document.getElementById('extraHint').textContent=r.strong;sound('cow');burst('🐄',2)};
    document.getElementById('checkCipher').onclick=check;
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();check()}});
  }

  function normalise(v){return v.trim().replace(/\r?\n/g,' ').replace(/\s+/g,' ')}
  async function sha256(v){const data=new TextEncoder().encode(v);const digest=await crypto.subtle.digest('SHA-256',data);return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('')}
  async function check(){
    const r=layers[stage], input=document.getElementById('cipherInput'), feedback=document.getElementById('cipherFeedback');
    const got=normalise(input.value);
    const valid=stage===3 ? (await sha256(got.toLowerCase())===r.expectedHash) : (got.toLowerCase()===normalise(r.expected).toLowerCase());
    if(valid){
      sound('win');
      feedback.className='cipher-feedback ok';
      feedback.textContent=stage===3?'✓ TODAS LAS CAPAS ROTAS. Abriendo mensaje…':`✓ CAPA ${stage+1} ROTA. Preparando la siguiente…`;
      burst(stage===3?'✨':'🔓',5);
      chaos+=2;
      if(stage===3){later(finishGame,1200)}else{stage++;later(draw,1050)}
    }else{
      errors++;chaos++;
      sound('error');
      feedback.className='cipher-feedback bad';
      const taunts=['✗ La vaca miró tu respuesta y suspiró.','✗ Eso desbloqueó exactamente nada.','✗ Casi seguro acabás de hackear una tostadora.','✗ La gerencia bovina solicita otro intento.','✗ Código rechazado. Muu.'];
      feedback.textContent=taunts[(errors-1)%taunts.length];
      gameContent.querySelector('.cipher-card').classList.remove('shake');void gameContent.querySelector('.cipher-card').offsetWidth;gameContent.querySelector('.cipher-card').classList.add('shake');
      if(errors%3===0) burst('🐄',4);
    }
  }
  draw();
}

function finishGame(){
  sound('win');
  document.getElementById('secretMessage').textContent=String.fromCharCode(73,32,109,105,115,115,32,121,111,117,32,111,110,108,121,32,97,32,108,105,116,116,108,101,32,98,105,116);
  document.getElementById('finalCows').textContent=cowsCaught;
  document.getElementById('finalMilk').textContent=`${milkPercent}%`;
  document.getElementById('finalChaos').textContent=chaos;
  document.getElementById('finalMessage').textContent='Contra todo pronóstico, derrotaste a la criptografía bovina.';
  showScreen('final');
  launchConfetti();
  burst('🐄',8);
}

function launchConfetti(){
  const canvas=document.getElementById('confettiCanvas'),ctx=canvas.getContext('2d'),dpr=devicePixelRatio||1;canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;ctx.setTransform(dpr,0,0,dpr,0,0);
  const icons=['🐄','🥛','🌾','✨']; const items=Array.from({length:65},()=>({x:Math.random()*innerWidth,y:-40-Math.random()*300,vy:2+Math.random()*3,vx:-1+Math.random()*2,r:Math.random()*6,vr:-.08+Math.random()*.16,icon:icons[Math.floor(Math.random()*icons.length)]})); const start=performance.now();
  function frame(now){ctx.clearRect(0,0,innerWidth,innerHeight);items.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.font='25px serif';ctx.fillText(p.icon,0,0);ctx.restore()});if(now-start<2600)requestAnimationFrame(frame);else ctx.clearRect(0,0,innerWidth,innerHeight)} requestAnimationFrame(frame);
}

function resetGame(){level=1;cowsCaught=0;milkPercent=0;chaos=0;updateCowCounter();updateProgress();document.getElementById('copyFeedback').textContent='';showScreen('intro');}

document.getElementById('startBtn').addEventListener('click',()=>{resetGame();showScreen('game');renderLevel();sound('tap')});
document.getElementById('panicBtn').addEventListener('click',()=>{chaos++;sound('error');showToast('Solicitud rechazada: una vaca firmó tu permiso de descanso.');document.getElementById('panicBtn').textContent=['No puedo, estoy trabajando','Insisto: estoy trabajando','La vaca autorizó la pausa','Bueno, capaz 4 minutos'][Math.min(chaos,3)];});
document.getElementById('replayBtn').addEventListener('click',resetGame);
document.getElementById('copyBtn').addEventListener('click',async()=>{const text=document.getElementById('secretMessage').textContent;try{await navigator.clipboard.writeText(text);document.getElementById('copyFeedback').textContent='Mensaje copiado. Evidencia oficialmente comprometida.';}catch{document.getElementById('copyFeedback').textContent=text;}sound('tap')});
soundToggle.addEventListener('click',()=>{soundOn=!soundOn;soundToggle.textContent=soundOn?'🔊':'🔇';soundToggle.setAttribute('aria-label',soundOn?'Desactivar sonido':'Activar sonido');if(soundOn)sound('tap')});

const reads=['ESCANEANDO...','TRABAJANDO... DEMASIADO','NIVEL DE BARRO: VARIABLE','VACAS: SOSPECHOSAS','PAUSA: RECOMENDADA'];let ri=0;setInterval(()=>{ri=(ri+1)%reads.length;machineReadout.textContent=reads[ri]},1800);
