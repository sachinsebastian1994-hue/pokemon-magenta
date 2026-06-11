/* ============ main.js — boot, title, scaling ============ */

function fitStage(){
  const stage = document.getElementById('stage');
  stage.style.transform = 'none';
  const sw = stage.offsetWidth, sh = stage.offsetHeight;
  const scale = Math.min(innerWidth/sw, innerHeight/sh) * 0.97;
  stage.style.transform = `scale(${scale})`;
}

function showTitle(){
  Game.state='title';
  const t = document.getElementById('title');
  t.classList.remove('hidden');
  const stars = Array.from({length:18},()=>{
    const x=Math.random()*96, y=Math.random()*96, d=Math.random()*1.6;
    return `<i style="left:${x}%;top:${y}%;animation-delay:${d}s"></i>`;
  }).join('');
  const hasSave = !!localStorage.getItem(SAVE_KEY);
  t.innerHTML = `
    <div class="t-stars">${stars}</div>
    <h1>POKéMON</h1>
    <h2>MAGENTA VERSION</h2>
    <img class="t-mon" alt="MEW">
    <div class="t-press">- PRESS A TO START -</div>
    <div class="t-cont">${hasSave?'SAVE DATA FOUND':'D-PAD MOVE &nbsp; A OK &nbsp; B BACK &nbsp; START MENU'}</div>`;
  setMonSprite(t.querySelector('.t-mon'), 151, false);

  const ctx = Input.push({onKey: async k=>{
    if(k!=='a' && k!=='start') return;
    Input.pop(ctx);
    SFX.sel();
    let cont = false;
    if(hasSave){
      const pick = await showMenu(['CONTINUE','NEW GAME'], {host:t, bottom:'14px', left:'14px'});
      cont = pick===0;
      if(pick===-1){ showTitleAgain(); return; }
    }
    await fadeOut();
    t.classList.add('hidden');
    if(cont && loadGame()){
      pushWorldCtx();
      Game.state='world';
      drawWorld();
      await fadeIn();
    } else {
      startNewGame();
    }
  }});
  function showTitleAgain(){ t.classList.add('hidden'); showTitle(); }
}

async function startNewGame(){
  Game.party=[]; Game.pc=[]; Game.bag={}; Game.flags={};
  Game.seen=new Set(); Game.caught=new Set();
  buildMaps();              /* fresh world (restores ground items) */
  Game.enterMap('home',4,5,'down');
  pushWorldCtx();
  Game.state='world';
  drawWorld();
  await fadeIn();
  Game.state='busy';
  await showText(`MOM: ${Game.name}! You're finally awake.\nPROF. OAK dropped by — he has a surprise for you at his LAB!`);
  await showText("MOM: It's the building with the gray roof,\njust south of the crossing. Good luck, sweetie!");
  Game.state='world';
}

window.addEventListener('load', ()=>{
  if(('ontouchstart' in window) || navigator.maxTouchPoints>0)
    document.body.classList.add('touch');
  buildTileset();
  buildMaps();
  Input.init();
  startLoop();
  fitStage();
  showTitle();
});
window.addEventListener('resize', fitStage);
window.addEventListener('orientationchange', ()=>setTimeout(fitStage,150));
