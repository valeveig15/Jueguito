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
const bondTop = document.getElementById('bondTop');
const floatLayer = document.getElementById('floatLayer');

let soundOn = true;
let timers = [];
let cowsCaught = 0;
let bond = 0;
let chaos = 0;
let encounterIndex = 0;
let deck = [];
let battle = null;
let rewardShown = false;

const ENCOUNTERS = [
  {
    name:'Ternero del Caos', icon:'🐮', hp:16, tint:'meadow',
    intro:'Se escapó del corral y ahora exige combate formal.',
    intents:[
      {name:'Cabezazo experimental', damage:3, text:'va a probar si sos más duro que un poste'},
      {name:'Muu intimidatorio', damage:2, text:'prepara un muu innecesariamente dramático'},
      {name:'Carrera sin motivo', damage:4, text:'tomó velocidad y nadie sabe por qué'}
    ]
  },
  {
    name:'Barro Ancestral', icon:'🟤', hp:22, tint:'mud',
    intro:'No es barro común. Este barro tiene agenda propia.',
    intents:[
      {name:'Bota secuestrada', damage:4, text:'intenta quedarse legalmente con una de tus botas'},
      {name:'Chapuzón crítico', damage:5, text:'se prepara para arruinar pantalón y dignidad'},
      {name:'Terreno pegajoso', damage:3, weaken:true, text:'va a dejar tu próxima carta ofensiva medio deprimida'}
    ]
  },
  {
    name:'Tractor con Opiniones', icon:'🚜', hp:28, tint:'tractor',
    intro:'Arrancó solo. Peor: parece tener argumentos.',
    intents:[
      {name:'Acelerón administrativo', damage:5, text:'viene derecho y con exceso de confianza'},
      {name:'Bocinazo existencial', damage:3, text:'planea cuestionar todas tus decisiones'},
      {name:'Motor recalentado', damage:6, text:'carga un ataque ridículamente ruidoso'}
    ]
  },
  {
    name:'La Vaca Jefa', icon:'🐄', hp:34, tint:'boss',
    intro:'Gerencia bovina. Tiene autoridad, mirada fija y cero paciencia.',
    intents:[
      {name:'Auditoría sorpresa', damage:5, text:'quiere revisar por qué estás jugando esto en horario laboral'},
      {name:'Muu disciplinario', damage:6, text:'prepara un comunicado interno de una sola sílaba'},
      {name:'Mirada de supervisión', damage:4, weaken:true, text:'te mira como si supiera exactamente lo que hiciste'}
    ]
  }
];

const CARD_LIBRARY = {
  bucket:{id:'bucket',name:'Balde Táctico',cost:1,type:'attack',icon:'🪣',rarity:'common',text:'Hace 4 de daño.',effect:{damage:4}},
  coffee:{id:'coffee',name:'Mate de Emergencia',cost:0,type:'utility',icon:'🧉',rarity:'common',text:'Ganás 1 energía. Robás 1 carta.',effect:{energy:1,draw:1}},
  mud:{id:'mud',name:'Barro Estratégico',cost:1,type:'control',icon:'👢',rarity:'common',text:'Hace 2 de daño y reduce 2 el próximo ataque enemigo.',effect:{damage:2,weakenEnemy:2}},
  stare:{id:'stare',name:'Mirada de “Estoy Trabajando”',cost:2,type:'guard',icon:'😐',rarity:'uncommon',text:'Hace 4 de daño. Ganás 3 de escudo.',effect:{damage:4,shield:3}},
  holiday:{id:'holiday',name:'Vacaciones Psicológicas',cost:2,type:'heal',icon:'🏖️',rarity:'uncommon',text:'Recuperás 5 de vida. No hace preguntas.',effect:{heal:5}},
  gate:{id:'gate',name:'Portera Mal Cerrada',cost:1,type:'chaos',icon:'🚪',rarity:'uncommon',text:'Hace entre 2 y 7 de daño. La seguridad no garantiza nada.',effect:{randomDamage:[2,7]}},
  paperwork:{id:'paperwork',name:'Formulario 17-B: Muu',cost:2,type:'control',icon:'📋',rarity:'rare',text:'Hace 3 de daño. El enemigo pierde su próximo ataque fuerte.',effect:{damage:3,stun:true}},
  tacticalCow:{id:'tacticalCow',name:'Vaca Táctica',cost:3,type:'attack',icon:'🐄',rarity:'rare',text:'Hace 8 de daño. Técnicamente no estaba autorizada.',effect:{damage:8}},
  duoSpark:{id:'duoSpark',name:'Dúo: Mala Influencia',cost:1,type:'duo',icon:'✦',rarity:'duo',text:'Ganás 2 de Energía Dúo y 2 de escudo.',effect:{bond:2,shield:2}},
  classified:{id:'classified',name:'Mensaje Clasificado',cost:2,type:'duo',icon:'🔐',rarity:'duo',text:'Ganás 3 de Energía Dúo y robás una carta.',effect:{bond:3,draw:1}}
};

const DUO_QUESTIONS = [
  {
    q:'Si pudieras desaparecer 20 minutos del tambo sin consecuencias, ¿qué opción tiene más chances?',
    a:['Comer algo y volver como si nada.','Hablar conmigo “cinco minutos”.','No pienso declarar sin abogado.'],
    reactions:['Respuesta sospechosamente razonable.','El sistema detecta que “cinco” podría no significar cinco.','Defensa legal activada. Excelente.']
  },
  {
    q:'¿Quién tiene más posibilidades de convertir una conversación corta en una charla larguísima?',
    a:['Vos. Claramente.','Yo. No pienso defenderme.','Los dos y lo sabemos.'],
    reactions:['Acusación registrada.','Confesión voluntaria registrada.','El tribunal acepta esta respuesta.']
  },
  {
    q:'Elegí el buff más útil después de un día largo:',
    a:['Comida. Mucha.','Un rato sin hacer nada.','Una llamada que empezó sin motivo.'],
    reactions:['+2 estabilidad emocional ficticia.','Modo horizontal desbloqueado.','Duración estimada de la llamada: impredecible.']
  },
  {
    q:'La vaca jefa exige una respuesta oficial: ¿esta pausa está justificada?',
    a:['Sí, por razones científicas.','No, y eso la mejora.','La pregunta es capciosa.'],
    reactions:['La ciencia no fue consultada, pero acepta.','Caos aprobado.','La vaca llama a su asesor jurídico.']
  }
];

function cloneCard(id){ return {...CARD_LIBRARY[id], uid:`${id}-${Math.random().toString(36).slice(2,8)}`}; }
function initialDeck(){ return ['bucket','bucket','coffee','mud','stare','holiday','duoSpark','gate'].map(cloneCard); }
function clearTimers(){ timers.forEach(t=>clearTimeout(t)); timers=[]; }
function later(fn,ms){ const id=setTimeout(fn,ms); timers.push(id); return id; }
function showScreen(name){ Object.values(screens).forEach(s=>s.classList.remove('active')); screens[name].classList.add('active'); }
function updateTop(){ cowCounter.textContent=`🐄 ${cowsCaught}`; bondTop.textContent=`✦ ${bond}`; }
function showToast(msg,ms=1600){ toast.textContent=msg; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),ms); }

function sound(type='tap'){
  if(!soundOn) return;
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx) return;
  const ctx=new AudioCtx(), osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  const map={tap:[430,.08,'sine'],cow:[165,.17,'square'],win:[660,.25,'triangle'],error:[105,.18,'sawtooth'],card:[520,.08,'triangle'],hit:[185,.1,'square'],duo:[760,.22,'sine']};
  const [freq,dur,wave]=map[type]||map.tap;
  osc.type=wave; osc.frequency.setValueAtTime(freq,ctx.currentTime);
  gain.gain.setValueAtTime(.0001,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.065,ctx.currentTime+.01); gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+dur);
  osc.start(); osc.stop(ctx.currentTime+dur); osc.onended=()=>ctx.close();
}

function floatEmoji(emoji,x=innerWidth/2,y=innerHeight/2){
  const el=document.createElement('div'); el.className='float-thing'; el.textContent=emoji; el.style.left=`${x}px`; el.style.top=`${y}px`; floatLayer.appendChild(el); setTimeout(()=>el.remove(),1700);
}
function burst(emoji,count=6){ for(let i=0;i<count;i++) setTimeout(()=>floatEmoji(emoji,innerWidth*(.28+Math.random()*.44),innerHeight*(.4+Math.random()*.2)),i*60); }
function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function resetGame(){
  clearTimers(); cowsCaught=0; bond=0; chaos=0; encounterIndex=0; deck=initialDeck(); battle=null; rewardShown=false; updateTop(); updateProgress();
  document.getElementById('copyFeedback').textContent=''; showScreen('intro');
}
function updateProgress(){
  const pct=encounterIndex<4 ? (encounterIndex+1)*20 : 100;
  levelLabel.textContent=encounterIndex<4?`Encuentro ${encounterIndex+1} de 4`:'Final Boss';
  progressText.textContent=encounterIndex<4?`${pct}%`:'100%';
  progressBar.style.width=`${pct}%`;
}

function startAdventure(){
  resetGame(); showScreen('game'); renderEncounterIntro(); sound('tap');
}

function renderEncounterIntro(){
  clearTimers(); updateProgress(); const e=ENCOUNTERS[encounterIndex];
  gameContent.innerHTML=`<div class="game-card quest-intro ${e.tint}">
    <div class="game-kicker">ENCUENTRO ${encounterIndex+1} · CAMINO AL JEFE FINAL</div>
    <div class="quest-intro-grid">
      <div>
        <h2>${e.name}</h2>
        <p class="game-copy">${e.intro}</p>
        <div class="quest-rules"><span>🃏 Robá cartas</span><span>⚡ Gastá energía</span><span>🛡️ Bloqueá daño</span><span>✦ Cargá Energía Dúo</span></div>
        <button class="primary-btn" id="enterBattle">Entrar al combate</button>
      </div>
      <div class="enemy-poster"><div class="enemy-poster-icon">${e.icon}</div><span>${e.name}</span><small>HP ${e.hp} · amenaza rural</small></div>
    </div>
  </div>`;
  document.getElementById('enterBattle').onclick=()=>startBattle(e);
}

function startBattle(enemy){
  battle={
    enemy:{...enemy,currentHp:enemy.hp,intentIndex:0,weaken:0,stunned:false},
    player:{hp:22,maxHp:22,shield:0,energy:3,maxEnergy:3,weakened:false},
    drawPile:shuffle(deck.map(c=>({...c,uid:`${c.id}-${Math.random().toString(36).slice(2,8)}`}))),
    discard:[], hand:[], turn:1, log:['La partida empieza. Las vacas no aprobaron las reglas.'], questionUsed:false, duoReady:false
  };
  drawCards(5); renderBattle();
}
function refillDrawPile(){ if(!battle.drawPile.length && battle.discard.length){ battle.drawPile=shuffle(battle.discard); battle.discard=[]; battle.log.unshift('♻️ Barajaste el descarte. El caos vuelve al mazo.'); } }
function drawCards(n){
  for(let i=0;i<n;i++){
    refillDrawPile(); if(!battle.drawPile.length) return;
    battle.hand.push(battle.drawPile.pop());
  }
}
function currentIntent(){ return battle.enemy.intents[battle.enemy.intentIndex % battle.enemy.intents.length]; }

function renderBattle(){
  const b=battle, e=b.enemy, p=b.player, intent=currentIntent();
  gameContent.innerHTML=`<div class="battle-shell ${e.tint}">
    <div class="battle-topline"><span>TURNO ${b.turn}</span><span>MAZO ${b.drawPile.length}</span><span>DESCARTE ${b.discard.length}</span></div>
    <div class="battlefield">
      <div class="fighter enemy-side">
        <div class="combat-name">${e.name}</div>
        <div class="hp-row"><span>HP</span><div class="hp-track"><i style="width:${clamp(e.currentHp/e.hp*100,0,100)}%"></i></div><b>${Math.max(0,e.currentHp)}/${e.hp}</b></div>
        <div class="enemy-avatar-wrap"><div class="enemy-aura"></div><div class="enemy-avatar">${e.icon}</div></div>
        <div class="intent-card"><span>PRÓXIMA JUGADA</span><b>${e.stunned?'😵 Turno cancelado':intent.name}</b><small>${e.stunned?'La burocracia ganó este round.':intent.text}</small></div>
      </div>

      <div class="battle-center">
        <div class="versus-rune">VS</div>
        <div class="duo-meter"><span>ENERGÍA DÚO</span><div class="duo-orbs">${[1,2,3,4,5,6].map(i=>`<i class="${bond>=i?'lit':''}"></i>`).join('')}</div><small>${bond>=6?'¡DÚO BURST LISTO!':'6 puntos = ataque especial'}</small></div>
        <button class="duo-burst ${bond>=6?'ready':''}" id="duoBurst" ${bond<6?'disabled':''}>✦ DÚO BURST <small>8 daño + 4 escudo</small></button>
      </div>

      <div class="fighter player-side">
        <div class="combat-name">Tambero sospechosamente distraído</div>
        <div class="hp-row"><span>HP</span><div class="hp-track player-hp"><i style="width:${clamp(p.hp/p.maxHp*100,0,100)}%"></i></div><b>${p.hp}/${p.maxHp}</b></div>
        <div class="player-avatar-wrap"><div class="player-avatar">🧑‍🌾</div>${p.shield?`<div class="shield-badge">🛡 ${p.shield}</div>`:''}</div>
        <div class="energy-rack"><span>ENERGÍA</span><div>${Array.from({length:p.maxEnergy},(_,i)=>`<i class="${i<p.energy?'full':''}">⚡</i>`).join('')}</div><b>${p.energy}/${p.maxEnergy}</b></div>
        <button class="bond-question-btn" id="bondQuestion" ${b.questionUsed?'disabled':''}>💬 CARTA DÚO <small>${b.questionUsed?'ya usada':'pregunta + bonus'}</small></button>
      </div>
    </div>

    <div class="battle-log">${b.log.slice(0,2).map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="hand-zone">
      <div class="hand-label"><span>TU MANO</span><small>Jugá cartas y después terminá el turno.</small></div>
      <div class="card-hand">${b.hand.map((c,i)=>cardHTML(c,i)).join('')}</div>
    </div>
    <div class="turn-actions"><button class="secondary-btn" id="endTurn">Terminar turno</button></div>
  </div>`;

  gameContent.querySelectorAll('.play-card').forEach(btn=>btn.onclick=()=>playCard(Number(btn.dataset.index)));
  document.getElementById('endTurn').onclick=endTurn;
  document.getElementById('bondQuestion').onclick=openDuoQuestion;
  document.getElementById('duoBurst').onclick=useDuoBurst;
}

function cardHTML(c,index){
  const unaffordable=battle.player.energy<c.cost;
  return `<button class="play-card card-${c.type} rarity-${c.rarity} ${unaffordable?'locked':''}" data-index="${index}" ${unaffordable?'disabled':''}>
    <span class="card-cost">${c.cost}</span>
    <span class="card-rarity">${c.rarity==='duo'?'DÚO':c.rarity.toUpperCase()}</span>
    <span class="card-art">${c.icon}</span>
    <strong>${c.name}</strong>
    <small>${c.text}</small>
    <em>${c.type.toUpperCase()}</em>
  </button>`;
}

function playCard(index){
  const b=battle, c=b.hand[index]; if(!c || b.player.energy<c.cost) return;
  b.player.energy-=c.cost; b.hand.splice(index,1); b.discard.push(c); sound('card'); chaos++;
  const fx=c.effect;
  let damage=fx.damage||0;
  if(fx.randomDamage) damage=Math.floor(Math.random()*(fx.randomDamage[1]-fx.randomDamage[0]+1))+fx.randomDamage[0];
  if(b.player.weakened && damage>0){ damage=Math.max(1,damage-2); b.player.weakened=false; b.log.unshift('🟤 El barro redujo tu ataque en 2. Humillante.'); }
  if(damage){ b.enemy.currentHp-=damage; b.log.unshift(`${c.icon} ${c.name}: ${damage} de daño.`); sound('hit'); burst(c.icon,2); }
  if(fx.shield){ b.player.shield+=fx.shield; b.log.unshift(`🛡️ Ganaste ${fx.shield} de escudo.`); }
  if(fx.heal){ const before=b.player.hp; b.player.hp=clamp(b.player.hp+fx.heal,0,b.player.maxHp); b.log.unshift(`❤️ Recuperaste ${b.player.hp-before} de vida.`); }
  if(fx.energy){ b.player.energy=clamp(b.player.energy+fx.energy,0,b.player.maxEnergy+2); b.log.unshift(`⚡ +${fx.energy} energía.`); }
  if(fx.draw){ drawCards(fx.draw); }
  if(fx.weakenEnemy){ b.enemy.weaken+=fx.weakenEnemy; b.log.unshift(`🪤 Próximo ataque enemigo -${fx.weakenEnemy}.`); }
  if(fx.stun){ b.enemy.stunned=true; b.log.unshift('📋 El enemigo quedó atrapado en trámites y pierde su acción.'); }
  if(fx.bond){ bond=clamp(bond+fx.bond,0,12); updateTop(); sound('duo'); }
  if(b.enemy.currentHp<=0){ winBattle(); return; }
  renderBattle();
}

function openDuoQuestion(){
  if(battle.questionUsed) return;
  const q=DUO_QUESTIONS[encounterIndex % DUO_QUESTIONS.length];
  const modal=document.createElement('div'); modal.className='duo-modal';
  modal.innerHTML=`<div class="duo-modal-card"><div class="game-kicker">CARTA DÚO · SIN RESPUESTA CORRECTA</div><h3>${q.q}</h3><p>Elegí la que más te convenza. La vaca no tiene acceso a nuestros chats, por ahora.</p><div class="duo-options">${q.a.map((x,i)=>`<button data-i="${i}">${x}</button>`).join('')}</div></div>`;
  document.body.appendChild(modal);
  modal.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
    const i=Number(btn.dataset.i); battle.questionUsed=true; bond=clamp(bond+2,0,12); battle.player.energy=clamp(battle.player.energy+1,0,battle.player.maxEnergy+1); battle.log.unshift(`✦ ${q.reactions[i]} +2 Dúo, +1 energía.`); updateTop(); sound('duo'); burst('✦',6); modal.remove(); renderBattle();
  });
}

function useDuoBurst(){
  if(bond<6) return;
  bond-=6; battle.enemy.currentHp-=8; battle.player.shield+=4; battle.log.unshift('✦ DÚO BURST: 8 de daño + 4 de escudo. Absolutamente reglamentario.'); updateTop(); sound('win'); burst('✦',10);
  if(battle.enemy.currentHp<=0){ winBattle(); return; }
  renderBattle();
}

function endTurn(){
  const b=battle, e=b.enemy, intent=currentIntent();
  b.discard.push(...b.hand.splice(0));
  if(e.stunned){ e.stunned=false; b.log.unshift(`😵 ${e.name} perdió el turno. La burocracia funciona.`); }
  else {
    let dmg=Math.max(0,intent.damage-e.weaken); e.weaken=0;
    const blocked=Math.min(b.player.shield,dmg); b.player.shield-=blocked; dmg-=blocked; b.player.hp-=dmg;
    if(intent.weaken) b.player.weakened=true;
    b.log.unshift(`${e.icon} ${intent.name}: ${dmg} daño${blocked?` (${blocked} bloqueado)`:''}.`);
    sound(dmg?'error':'tap');
  }
  e.intentIndex++; b.turn++;
  if(b.player.hp<=0){ recoverFromDefeat(); return; }
  b.player.maxEnergy=clamp(3+Math.floor((b.turn-1)/3),3,5); b.player.energy=b.player.maxEnergy; b.player.shield=0; drawCards(5); renderBattle();
}

function recoverFromDefeat(){
  chaos+=4; gameContent.innerHTML=`<div class="game-card defeat-card"><div class="defeat-icon">💥</div><div class="game-kicker">DERROTA TÉCNICA</div><h2>La vaca presentó documentación mejor.</h2><p class="game-copy">No pasa nada: este juego no respeta suficientemente las consecuencias. Te devuelvo al combate con vida completa y una carta extra.</p><button class="primary-btn" id="retryBattle">Solicitar revancha administrativa</button></div>`;
  document.getElementById('retryBattle').onclick=()=>{ deck.push(cloneCard('coffee')); startBattle(ENCOUNTERS[encounterIndex]); };
}

function winBattle(){
  cowsCaught++; bond=clamp(bond+1,0,12); updateTop(); sound('win'); burst(ENCOUNTERS[encounterIndex].icon,8);
  if(encounterIndex===ENCOUNTERS.length-1){
    gameContent.innerHTML=`<div class="game-card victory-card"><div class="victory-rune">✦</div><div class="game-kicker">GERENCIA BOVINA DERROTADA</div><h2>Ganaste el combate. Grave error: había una segunda fase.</h2><p class="game-copy">La Vaca Jefa dejó un archivo cifrado. Obviamente decidió que esto necesitaba criptografía.</p><button class="primary-btn" id="toCipher">Abrir PROTOCOLO MUU-256</button></div>`;
    document.getElementById('toCipher').onclick=()=>{encounterIndex=4;updateProgress();renderCipher();};
    return;
  }
  renderReward();
}

function renderReward(){
  rewardShown=true;
  const pool=['tacticalCow','paperwork','classified','stare','holiday','gate'];
  const picks=shuffle(pool).slice(0,3).map(id=>CARD_LIBRARY[id]);
  gameContent.innerHTML=`<div class="game-card reward-screen"><div class="game-kicker">BOTÍN DEL ENCUENTRO</div><h2>Elegí una carta para sumar al mazo.</h2><p class="game-copy">Como todo sistema equilibrado, algunas decisiones son claramente más ridículas que otras.</p><div class="reward-cards">${picks.map((c,i)=>`<button class="reward-pick card-${c.type} rarity-${c.rarity}" data-id="${c.id}"><span class="card-cost">${c.cost}</span><span class="card-art">${c.icon}</span><strong>${c.name}</strong><small>${c.text}</small><em>AGREGAR AL MAZO</em></button>`).join('')}</div></div>`;
  gameContent.querySelectorAll('.reward-pick').forEach(btn=>btn.onclick=()=>{
    deck.push(cloneCard(btn.dataset.id)); encounterIndex++; rewardShown=false; sound('card'); showToast('Carta agregada al mazo. La vaca desaprueba el power creep.'); later(renderEncounterIntro,650);
  });
}

function renderCipher(){
  const layers=[
    {
      title:'CAPA 01 · EL CORRAL DE 16 MARCAS',
      clue:'La vaca dejó 16 símbolos posibles. Parecen números, pero llegan hasta la F.',
      strong:'Pista extra: agrupá de a dos caracteres.',
      revealTitle:'HEXadecimal',
      reveal:'Es hexadecimal. Tomá cada par de caracteres (por ejemplo 59, 58, 42) y convertí cada par a su carácter ASCII. Podés usar un conversor “Hex to Text” o interpretar cada par como un byte en base 16.',
      expected:'YXBpIGxzYWFwcyBoIGZzdXYgYnZmIHp6cHQgUA==',
      code:'595842704947787A595746776379426F49475A7A64585967596E5A6D494870366348516755413D3D'
    },
    {
      title:'CAPA 02 · LOS 64 CORRALES',
      clue:'Ahora parece texto, pero vive en un sistema de 64 símbolos y suele terminar con =.',
      strong:'Pista extra: el nombre del sistema empieza con “Base”.',
      revealTitle:'Base64',
      reveal:'Es Base64. Copiá todo el bloque exactamente como aparece y decodificalo con un “Base64 decoder”. El resultado será otro texto, todavía cifrado.',
      expected:'api lsaaps h fsuv bvf zzpt P',
      code:'YXBpIGxzYWFwcyBoIGZzdXYgYnZmIHp6cHQgUA=='
    },
    {
      title:'CAPA 03 · TRACTOR EN REVERSA',
      clue:'El tractor hizo todo el recorrido marcha atrás. Quizá el mensaje también.',
      strong:'Pista extra: no cambies letras: cambiá únicamente el orden.',
      revealTitle:'Texto invertido',
      reveal:'No hay un cifrado matemático: el texto está escrito al revés. Invertí el orden completo de todos los caracteres, desde el último hasta el primero.',
      expected:'P tpzz fvb vusf h spaasl ipa',
      code:'api lsaaps h fsuv bvf zzpt P'
    },
    {
      title:'CAPA 04 · EL RELOJ ADELANTADO',
      clue:'El reloj del tambo está 7 horas adelantado. Devolvé cada letra siete lugares.',
      strong:'Pista extra: Julio César tendría algo que decir al respecto.',
      revealTitle:'Cifrado César (-7)',
      reveal:'Es un cifrado César con desplazamiento de 7. Para decodificar, mové cada letra 7 posiciones hacia atrás en el alfabeto (P→I, t→m, etc.). Los espacios no cambian.',
      expectedHash:'ce96c61eeea9a251395242b6f37b66a0736523038a95fca548151d9433eed3ae',
      code:'P tpzz fvb vusf h spaasl ipa'
    }
  ];
  let stage=0, totalErrors=0, hints=0;
  const attemptsByStage=[0,0,0,0];
  const revealed=[false,false,false,false];

  function draw(){
    const r=layers[stage];
    gameContent.innerHTML=`<div class="game-card cipher-card">
      <div class="game-kicker">FINAL BOSS · PROTOCOLO MUU-256</div>
      <div class="cipher-head"><div><h2>${r.title}</h2><p class="game-copy">Rompé una capa por vez. Si fallás tres veces en una capa, el sistema deja de hacerse el interesante y te explica exactamente qué cifrado es.</p></div><div class="cipher-lock">${stage===3?'🔐':'🔒'}</div></div>
      <div class="cipher-status"><span>CAPA ${stage+1}/4</span><span>INTENTOS FALLIDOS ${attemptsByStage[stage]}/3</span><span>ERRORES TOTALES ${totalErrors}</span><span>PISTAS ${hints}</span></div>
      <div class="cipher-code" id="cipherCode">${r.code}</div>
      <button class="tiny-copy" id="copyCodeBtn">Copiar código</button>
      <div class="cipher-clue"><span>🐄 PISTA DE LA VACA</span><p>${r.clue}</p><button id="hintBtn">Necesito una pista menos elegante</button><div id="extraHint" class="extra-hint">${revealed[stage]?r.strong:''}</div></div>
      <div id="cipherReveal" class="cipher-reveal ${revealed[stage]?'show':''}">${revealed[stage]?`<div class="reveal-badge">AYUDA DESBLOQUEADA · ${r.revealTitle}</div><p>${r.reveal}</p>`:''}</div>
      <div class="cipher-entry"><label for="cipherInput">Tu resultado de esta capa</label><textarea id="cipherInput" rows="2" spellcheck="false" autocomplete="off" placeholder="Pegá o escribí acá lo que logres descifrar..."></textarea><button class="primary-btn" id="checkCipher">Probar código</button></div>
      <div id="cipherFeedback" class="cipher-feedback" aria-live="polite"></div>
    </div>`;
    const input=document.getElementById('cipherInput'); input.focus();
    document.getElementById('copyCodeBtn').onclick=async()=>{try{await navigator.clipboard.writeText(r.code);showToast('Código copiado. Nadie vio nada.')}catch{showToast('Copiar falló. La vaca culpa al Wi-Fi.')}};
    document.getElementById('hintBtn').onclick=()=>{hints++;document.getElementById('extraHint').textContent=r.strong;sound('cow');burst('🐄',2)};
    document.getElementById('checkCipher').onclick=check;
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();check();}});
  }

  function normalise(v){ return v.trim().replace(/\r?\n/g,' ').replace(/\s+/g,' '); }
  async function sha256(v){ const data=new TextEncoder().encode(v); const digest=await crypto.subtle.digest('SHA-256',data); return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join(''); }
  async function check(){
    const r=layers[stage], input=document.getElementById('cipherInput'), feedback=document.getElementById('cipherFeedback');
    const got=normalise(input.value);
    const valid=stage===3 ? (await sha256(got.toLowerCase())===r.expectedHash) : (got.toLowerCase()===normalise(r.expected).toLowerCase());
    if(valid){
      sound('win'); feedback.className='cipher-feedback ok'; feedback.textContent=stage===3?'✓ TODAS LAS CAPAS ROTAS. Abriendo mensaje…':`✓ CAPA ${stage+1} ROTA. Preparando la siguiente…`; burst(stage===3?'✨':'🔓',6); chaos+=2;
      if(stage===3){ later(finishGame,1200); } else { stage++; later(draw,950); }
    } else {
      attemptsByStage[stage]++; totalErrors++; chaos++; sound('error'); feedback.className='cipher-feedback bad';
      const taunts=['✗ La vaca miró tu respuesta y suspiró.','✗ Eso desbloqueó exactamente nada.','✗ Casi seguro acabás de hackear una tostadora.','✗ La gerencia bovina solicita otro intento.','✗ Código rechazado. Muu.'];
      feedback.textContent=taunts[(totalErrors-1)%taunts.length];
      const card=gameContent.querySelector('.cipher-card'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      if(attemptsByStage[stage]>=3 && !revealed[stage]){
        revealed[stage]=true; sound('duo'); burst('💡',7);
        const reveal=document.getElementById('cipherReveal'); reveal.classList.add('show'); reveal.innerHTML=`<div class="reveal-badge">3 INTENTOS · AYUDA DESBLOQUEADA · ${r.revealTitle}</div><p>${r.reveal}</p>`;
        document.getElementById('extraHint').textContent=r.strong;
        showToast(`Ayuda desbloqueada: ${r.revealTitle}. Ahora no hay excusas.`,2300);
      }
      const status=gameContent.querySelector('.cipher-status');
      if(status) status.innerHTML=`<span>CAPA ${stage+1}/4</span><span>INTENTOS FALLIDOS ${attemptsByStage[stage]}/3</span><span>ERRORES TOTALES ${totalErrors}</span><span>PISTAS ${hints}</span>`;
    }
  }
  draw();
}

function finishGame(){
  sound('win');
  document.getElementById('secretMessage').textContent=String.fromCharCode(73,32,109,105,115,115,32,121,111,117,32,111,110,108,121,32,97,32,108,105,116,116,108,101,32,98,105,116);
  document.getElementById('finalCows').textContent=cowsCaught;
  document.getElementById('finalBond').textContent=bond;
  document.getElementById('finalChaos').textContent=chaos;
  showScreen('final'); launchConfetti(); burst('🐄',8);
}

function launchConfetti(){
  const canvas=document.getElementById('confettiCanvas'),ctx=canvas.getContext('2d'),dpr=devicePixelRatio||1;
  canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;ctx.setTransform(dpr,0,0,dpr,0,0);
  const icons=['🐄','🃏','✦','🌾','✨']; const items=Array.from({length:72},()=>({x:Math.random()*innerWidth,y:-40-Math.random()*300,vy:2+Math.random()*3,vx:-1+Math.random()*2,r:Math.random()*6,vr:-.08+Math.random()*.16,icon:icons[Math.floor(Math.random()*icons.length)]})); const start=performance.now();
  function frame(now){ctx.clearRect(0,0,innerWidth,innerHeight);items.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.font='25px serif';ctx.fillText(p.icon,0,0);ctx.restore();});if(now-start<2800)requestAnimationFrame(frame);else ctx.clearRect(0,0,innerWidth,innerHeight);} requestAnimationFrame(frame);
}

document.getElementById('startBtn').addEventListener('click',startAdventure);
document.getElementById('panicBtn').addEventListener('click',()=>{chaos++;sound('error');const b=document.getElementById('panicBtn');const texts=['No puedo, estoy trabajando','Insisto: sigo trabajando','La vaca autorizó la pausa','Bueno, capaz una partida'];b.textContent=texts[Math.min(chaos,3)];showToast('Solicitud rechazada: el reglamento fue escrito por una vaca.');});
document.getElementById('replayBtn').addEventListener('click',resetGame);
document.getElementById('copyBtn').addEventListener('click',async()=>{const text=document.getElementById('secretMessage').textContent;try{await navigator.clipboard.writeText(text);document.getElementById('copyFeedback').textContent='Mensaje copiado. Evidencia oficialmente comprometida.';}catch{document.getElementById('copyFeedback').textContent=text;}sound('tap');});
soundToggle.addEventListener('click',()=>{soundOn=!soundOn;soundToggle.textContent=soundOn?'🔊':'🔇';soundToggle.setAttribute('aria-label',soundOn?'Desactivar sonido':'Activar sonido');if(soundOn)sound('tap');});

resetGame();
