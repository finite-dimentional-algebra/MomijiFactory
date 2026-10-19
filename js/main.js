(() => {
  const $=s=>document.querySelector(s), canvas=$('#scene'), ctx=canvas.getContext('2d');
  const screens=[...document.querySelectorAll('.screen')], ui=$('#playUI');
  const STORAGE='momiji-factory-v1', defaults={tenBest:0,perfectBest:0,bgm:35,sfx:65,muted:false};
  let saved=loadSave(), state='title', mode='ten', count=0,total=0,scores=[], bestBefore=0;
  let W=0,H=0,dpr=1,cat={x:0,target:0},painting=null,activePointer=null, timerId=0, deadline=0,remaining=0, resultLocked=false, transitionTimer=0, phaseRemaining=0,phaseDeadline=0,phaseCallback=null,effect=null, conveyor=0, lastFrame=0, hiddenBefore=null;
  let movementPhase='enter',moveDuration=GAME_CONFIG.MOVE_MS,movePausedRemaining=GAME_CONFIG.MOVE_MS;
  let audioUnlocked=false, layout={catX:0,catY:0,catW:0,catH:0,back:{}};
  function loadSave(){try{const x=JSON.parse(localStorage.getItem(STORAGE)||'{}');return {...defaults,...x};}catch(e){return {...defaults};}}
  function save(){try{localStorage.setItem(STORAGE,JSON.stringify({...saved,version:1}));}catch(e){}}
  function persistAudio(){const a=FactoryAudio.settings;saved.bgm=a.bgm;saved.sfx=a.sfx;saved.muted=a.muted;save();}
  function show(id){screens.forEach(s=>s.classList.add('hidden'));$(id).classList.remove('hidden');}
  function updateBest(){ $('#bestTen').textContent=saved.tenBest;$('#bestPerfect').textContent=saved.perfectBest;$('#titleBestTen').textContent=saved.tenBest;$('#titleBestPerfect').textContent=saved.perfectBest; }
  function soundInit(){if(!audioUnlocked){FactoryAudio.init();FactoryAudio.set({bgm:saved.bgm,sfx:saved.sfx,muted:saved.muted});audioUnlocked=true;}FactoryAudio.playBgm();}
  function fit(){const r=canvas.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2.5);W=r.width;H=r.height;canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  function roundedRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
  function drawFactory(c){
    const factory=FactoryAssets.get('factory');
    if(factory)FactoryAssets.cover(c,factory,0,0,W,H);
    else {const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#b8e9dc');sky.addColorStop(.64,'#dcf3d8');sky.addColorStop(1,'#ffe5b1');c.fillStyle=sky;c.fillRect(0,0,W,H);
      // Factory windows and pipes
      c.globalAlpha=.38;for(let i=0;i<4;i++){const x=(i*W/3+((i%2)*18))-18;c.fillStyle=i%2?'#fff7db':'#8ecab8';roundedRect(c,x,Math.max(100,H*.18),W*.19,Math.max(58,H*.12),16);c.fill();c.fillStyle='#fff';c.fillRect(x+W*.09,Math.max(100,H*.18),3,Math.max(58,H*.12));}
      c.globalAlpha=1;c.fillStyle='#edbf83';roundedRect(c,W*.06,H*.28,W*.17,12,6);c.fill();roundedRect(c,W*.78,H*.21,W*.16,12,6);c.fill();
      // Decorative harmless factory machines
      for(let i=0;i<3;i++){let x=W*(.04+i*.31),y=H*.36;c.fillStyle=['#f7ad82','#9bd6c6','#f3cb68'][i];roundedRect(c,x,y,W*.20,H*.19,18);c.fill();c.strokeStyle='#fff6da';c.lineWidth=4;c.stroke();c.fillStyle='#fff4db';c.beginPath();c.arc(x+W*.10,y+H*.075,Math.min(11,W*.035),0,Math.PI*2);c.fill();c.fillStyle='#d89073';c.fillRect(x+W*.04,y+H*.14,W*.12,5);}}
    // Conveyor
    const beltY=H*GAME_CONFIG.BELT_Y_RATIO,beltH=Math.max(54,H*.105);c.fillStyle='#8e7662';c.fillRect(0,beltY,W,beltH);c.fillStyle='#5d5147';c.fillRect(0,beltY+12,W,beltH-20);c.fillStyle='#aa9480';c.fillRect(0,beltY+beltH-9,W,9);
    c.save();c.beginPath();c.rect(0,beltY+12,W,beltH-21);c.clip();c.strokeStyle='#d6c3a2';c.lineWidth=4;for(let x=-40-(conveyor%56);x<W+56;x+=56){c.beginPath();c.moveTo(x,beltY+15);c.lineTo(x+30,beltY+beltH-10);c.stroke();}c.restore();
    // Floor bolts
    c.fillStyle='#e7c38c';for(let x=16;x<W;x+=48){c.beginPath();c.arc(x,beltY+8,3,0,Math.PI*2);c.fill();}
  }
  function catDims(){const sprite=FactoryAssets.get('momiji');const aspect=sprite?FactoryAssets.momijiAspect(sprite):1.08;const cw=Math.min(W*.60,260,H*.56/aspect),ch=cw*aspect;return {w:cw,h:ch};}
  function drawCat(c,cx,cy,w,h,alpha=1){const sprite=FactoryAssets.get('momiji');if(sprite){c.save();c.globalAlpha=alpha;FactoryAssets.drawMomiji(c,sprite,cx-w/2,cy-h/2,w,h);c.restore();return {x:cx-w/2,y:cy-h/2,w,h};}c.save();c.globalAlpha=alpha;c.translate(cx-w/2,cy-h/2);
    // soft shadow
    c.fillStyle='#845e4b35';c.beginPath();c.ellipse(w/2,h*.91,w*.39,h*.055,0,0,Math.PI*2);c.fill();
    // tail, white arms (all behind back)
    c.strokeStyle='#e9a96e';c.lineWidth=w*.095;c.lineCap='round';c.beginPath();c.moveTo(w*.73,h*.75);c.bezierCurveTo(w*.97,h*.78,w*.95,h*.98,w*.78,h*.91);c.stroke();
    c.fillStyle='#fff8ed';c.strokeStyle='#b97650';c.lineWidth=2;
    c.beginPath();c.ellipse(w*.28,h*.69,w*.14,h*.26,-.1,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.ellipse(w*.72,h*.69,w*.14,h*.26,.1,0,Math.PI*2);c.fill();c.stroke();
    // back - the playable ellipse comes from the same definition used by paint clip and scoring
    const b=Painting.BACK;const bx=w*b.x,by=h*b.y,bw=w*b.w,bh=h*b.h;Painting.ellipsePath(c,0,0,w,h);c.fillStyle='#e9b47e';c.fill();c.strokeStyle='#aa7251';c.lineWidth=2;c.stroke();
    // head and ears
    c.fillStyle='#e9b47e';c.strokeStyle='#aa7251';c.lineWidth=2;c.beginPath();c.moveTo(w*.29,h*.32);c.lineTo(w*.22,h*.06);c.quadraticCurveTo(w*.20,h*.01,w*.27,h*.09);c.lineTo(w*.42,h*.20);c.quadraticCurveTo(w*.5,h*.16,w*.58,h*.20);c.lineTo(w*.73,h*.08);c.quadraticCurveTo(w*.81,h*.03,w*.78,h*.12);c.lineTo(w*.71,h*.32);c.quadraticCurveTo(w*.5,h*.4,w*.29,h*.32);c.fill();c.stroke();
    c.fillStyle='#ed8e8c';c.beginPath();c.moveTo(w*.265,h*.105);c.lineTo(w*.285,h*.245);c.lineTo(w*.36,h*.21);c.fill();c.beginPath();c.moveTo(w*.735,h*.105);c.lineTo(w*.715,h*.245);c.lineTo(w*.64,h*.21);c.fill();
    // subtle fur tufts and paws
    c.strokeStyle='#cf9868';c.lineWidth=2;c.beginPath();c.moveTo(w*.39,h*.47);c.quadraticCurveTo(w*.5,h*.43,w*.61,h*.47);c.stroke();
    c.fillStyle='#fff9ee';c.beginPath();c.ellipse(w*.38,h*.91,w*.17,h*.07,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(w*.62,h*.91,w*.17,h*.07,0,0,Math.PI*2);c.fill();
    c.restore();return {x:cx-w/2,y:cy-h/2,w,h};}
  function draw(){if(!W||!H)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);drawFactory(ctx);
    const {w,h}=catDims(),beltY=H*GAME_CONFIG.BELT_Y_RATIO,cy=beltY-h*.5;let x=cat.x??W*.5;
    if(state==='moving'){const t=Math.min(1,(performance.now()-moveStart)/moveDuration);x=moveFrom+(moveTo-moveFrom)*ease(t);if(t>=1)completeMove(x);}
    // AUTHOR MODE START: 作成者プレビュー中は猫を画面中央に固定します。
    if(state==='author')x=W*.5;
    // AUTHOR MODE END
    layout={...drawCat(ctx,x,cy,w,h),cx:x,cy};
    // AUTHOR MODE START: 一時的な採点目標の可視化。公開前にこの呼び出しと下の関数を削除できます。
    if(state==='author')drawAuthorModeGuide(ctx,layout);
    // AUTHOR MODE END
    if(painting?.layer&&state==='painting')drawPaint(ctx,painting.layer,layout);
    if(effect&&state==='evaluating')drawEffect(ctx,performance.now());
  }
  function ease(t){return 1-Math.pow(1-t,3)}
  function backBounds(catBox){const b=Painting.BACK;return {x:catBox.x+catBox.w*b.x,y:catBox.y+catBox.h*b.y,w:catBox.w*b.w,h:catBox.h*b.h};}
  function drawPaint(c,layer,box){const b=backBounds(box);c.save();Painting.ellipsePath(c,box.x,box.y,box.w,box.h);c.clip();c.drawImage(layer.canvas,b.x,b.y,b.w,b.h);c.restore();}
  // AUTHOR MODE START: 理想サイズの紫色オーバーレイ。通常プレイ中は呼び出されません。
  function drawAuthorModeGuide(c,box){const b=backBounds(box),center=Painting.targetCenter(),rx=b.w*GAME_CONFIG.TARGET_BACK_WIDTH_RATIO/2,ry=b.h*GAME_CONFIG.TARGET_BACK_HEIGHT_RATIO/2;c.save();c.beginPath();c.ellipse(box.x+box.w*center.x,box.y+box.h*center.y,rx,ry,0,0,Math.PI*2);c.fillStyle='rgba(151, 89, 220, 0.48)';c.fill();c.lineWidth=2;c.strokeStyle='rgba(111, 48, 178, 0.92)';c.stroke();c.restore();}
  // AUTHOR MODE END
  function drawEffect(c,now){const age=now-effect.started,t=Math.max(0,1-age/GAME_CONFIG.SCORE_EFFECT_MS);if(t<=0)return;const y=layout.cy-layout.h*.48-age*.018;c.save();c.globalAlpha=t;c.textAlign='center';c.font=`1000 ${Math.max(18,Math.min(29,W*.075))}px ui-rounded,system-ui,sans-serif`;c.lineWidth=6;c.lineJoin='round';c.strokeStyle='#fff8e9';c.strokeText(effect.label,layout.cx,y);c.fillStyle=effect.score>=80?'#ef7861':'#8e6dce';c.shadowColor='#ac724b';c.shadowBlur=8;c.shadowOffsetY=3;c.fillText(effect.label,layout.cx,y);c.font=`1000 ${Math.max(21,Math.min(34,W*.09))}px ui-rounded,system-ui,sans-serif`;c.strokeText(`${effect.score}点`,layout.cx,y+35);c.fillStyle='#ffc84d';c.fillText(`${effect.score}点`,layout.cx,y+35);c.restore();}
  let moveStart=0,moveFrom=0,moveTo=0;
  function resizeLayer(){const b=backBounds(layout);painting={layer:Painting.create(Math.max(80,Math.round(b.w*2)),Math.max(100,Math.round(b.h*2))),bounds:b};}
  function pointerPos(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function handleDown(e){if((state!=='ready'&&!(state==='painting'&&activePointer===null))||resultLocked)return;soundInit();const p=pointerPos(e),b=layout.back=backBounds(layout);if(p.x<b.x||p.x>b.x+b.w||p.y<b.y||p.y>b.y+b.h)return;
    if(state==='ready'){state='painting';resizeLayer();FactoryAudio.event('spray');}activePointer=e.pointerId;canvas.setPointerCapture?.(e.pointerId);paintAt(p);$('#playTip').textContent='いい感じに塗って、離してね！';e.preventDefault();}
  function paintAt(p){const b=painting.bounds,r=Math.max(5,Math.min(b.w,b.h)*GAME_CONFIG.BRUSH_RADIUS_RATIO);const x=(p.x-b.x)/b.w*painting.layer.canvas.width,y=(p.y-b.y)/b.h*painting.layer.canvas.height;Painting.stroke(painting.layer,x,y,r*painting.layer.canvas.width/b.w);}
  function handleMove(e){if(state!=='painting'||e.pointerId!==activePointer)return;const p=pointerPos(e);paintAt(p);e.preventDefault();}
  function handleUp(e){if(state!=='painting'||e.pointerId!==activePointer)return;try{canvas.releasePointerCapture?.(e.pointerId);}catch{} activePointer=null;painting.layer.last=null;finish(false);e.preventDefault();}
  function finish(timeout){if((state!=='painting'&&state!=='ready')||resultLocked)return;resultLocked=true;clearInterval(timerId);timerId=0;state='evaluating';const b=painting?.bounds||backBounds(layout);const raw=painting?Painting.measure(painting.layer,0,0,painting.layer.canvas.width,painting.layer.canvas.height):null;const sc=Painting.score(raw);scores.push(sc.total);total+=sc.total;count++;if(sc.total===100)FactoryAudio.event('perfect');else FactoryAudio.event('score');effect={score:sc.total,label:Painting.label(sc.total),started:performance.now()};
    if(mode==='ten'&&count>=10){schedulePhase(GAME_CONFIG.SCORE_EFFECT_MS,()=>endGame(false));return;}
    if(mode==='perfect'&&sc.total<GAME_CONFIG.CONTINUE_SCORE){schedulePhase(GAME_CONFIG.SCORE_EFFECT_MS,()=>endGame(true));return;}
    schedulePhase(GAME_CONFIG.SCORE_EFFECT_MS,()=>{if(state==='evaluating'){effect=null;state='moving';resultLocked=false;beginMove(layout.cx,-layout.w,'exit');FactoryAudio.event('move');}});
  }
  function schedulePhase(ms,callback){clearTimeout(transitionTimer);phaseCallback=callback;phaseRemaining=ms;phaseDeadline=performance.now()+ms;transitionTimer=setTimeout(()=>{phaseCallback=null;phaseRemaining=0;transitionTimer=0;callback();},ms);}
  function startTimer(resuming=false){clearInterval(timerId);if(mode!=='perfect')return;if(!resuming)remaining=GAME_CONFIG.PERFECT_BASE_SECONDS*Math.pow(GAME_CONFIG.PERFECT_TIME_FACTOR,Math.floor(count/10));deadline=performance.now()+remaining*1000;timerId=setInterval(()=>{if(state!=='ready'&&state!=='painting')return;remaining=Math.max(0,(deadline-performance.now())/1000);$('#timer').textContent=remaining.toFixed(1);$('#timerPill').classList.toggle('urgent',remaining<3);if(remaining<=0){clearInterval(timerId);timerId=0;finish(true);}},50);}
  function beginMove(from,to,phase){movementPhase=phase;moveFrom=from;moveTo=to;moveDuration=GAME_CONFIG.MOVE_MS;movePausedRemaining=moveDuration;moveStart=performance.now();}
  function completeMove(x){if(state!=='moving')return;cat.x=x;if(movementPhase==='exit'){cat.x=W+layout.w;beginMove(cat.x,W*.5,'enter');FactoryAudio.event('move');return;}arrive(x);}
  function arrive(x){if(state!=='moving')return;cat.x=x;state='ready';painting=null;resultLocked=false;effect=null;$('#progress').textContent=mode==='ten'?`${count+1} / 10`:`${count+1} 匹`;startTimer();}
  function begin(selected){soundInit();mode=selected;count=0;total=0;scores=[];bestBefore=mode==='ten'?saved.tenBest:saved.perfectBest;state='moving';show('#playUI');$('#modeLabel').textContent=mode==='ten'?'10匹もみじ':'パーフェクトもみじ';$('#progress').textContent=mode==='ten'?'1 / 10':'1 匹';$('#timerPill').classList.toggle('hidden',mode!=='perfect');$('#playTip').textContent='背中にスプレーしてね！';cat.x=W+layout.w;beginMove(cat.x,W*.5,'enter');FactoryAudio.event('move');}
  function endGame(perfectFail){clearInterval(timerId);timerId=0;resultLocked=true;state='result';FactoryAudio.stopBgm();let updated=false;if(mode==='ten'&&total>saved.tenBest){saved.tenBest=total;updated=true;}if(mode==='perfect'&&count>saved.perfectBest){saved.perfectBest=count;updated=true;}save();updateBest();show('#resultScreen');$('#shareStatus').textContent='';$('#resultIcon').textContent=updated?'🏆':perfectFail?'🐾':'🎉';$('#resultEyebrow').textContent=updated?'NEW PERSONAL BEST!':'FACTORY REPORT';$('#resultTitle').textContent=updated?'ベスト更新！':perfectFail?'もう少し！':'できあがり！';$('#resultScore').textContent=mode==='ten'?`${total}点`:`${count}匹`;
    $('#resultSub').textContent=mode==='ten'?`10匹の合計 / 1000　　自己ベスト ${saved.tenBest}点`: `最高記録 ${saved.perfectBest}匹　${perfectFail?'80点未満で終了':'記録更新！'}`;
    $('#scoreList').textContent=mode==='ten'?`今回の評価　${scores.map((x,i)=>`${i+1}:${x}`).join('　')}`:`最後のもみじ：${scores.at(-1)??0}点 · ${Painting.label(scores.at(-1)??0)}`;
    $('#retryButton').textContent='もう一度';FactoryAudio.event(updated?'perfect':'score');}
  function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),2300);}
  function pause(){if(!['ready','painting','moving','evaluating'].includes(state))return;hiddenBefore=state;if(mode==='perfect'&&timerId){remaining=Math.max(0,(deadline-performance.now())/1000);clearInterval(timerId);timerId=0;}if(state==='evaluating'&&transitionTimer){phaseRemaining=Math.max(0,phaseDeadline-performance.now());clearTimeout(transitionTimer);transitionTimer=0;}if(state==='moving'){const t=Math.min(1,(performance.now()-moveStart)/moveDuration);const current=moveFrom+(moveTo-moveFrom)*ease(t);movePausedRemaining=Math.max(0,moveDuration-(performance.now()-moveStart));moveFrom=current;cat.x=current;}if(state==='painting'){activePointer=null;painting.layer.last=null;state='paused';}else state='paused';stateBeforePause=hiddenBefore;show('#pauseScreen');}
  let stateBeforePause='ready';
  function resume(){soundInit();state=stateBeforePause;show('#playUI');if(state==='ready'||state==='painting'){if(mode==='perfect')startTimer(true);}else if(state==='moving'){moveDuration=Math.max(1,movePausedRemaining);moveStart=performance.now();}else if(state==='evaluating'){effect.started=performance.now();if(phaseCallback)schedulePhase(phaseRemaining,phaseCallback);} }
  function backToTitle(){clearInterval(timerId);clearTimeout(transitionTimer);state='title';resultLocked=false;FactoryAudio.playBgm();show('#titleScreen');}
  function drawCard(){return window.ShareCard.create({mode,total,count,best:mode==='ten'?saved.tenBest:saved.perfectBest,scores});}
  async function share(){const status=$('#shareStatus');status.textContent='共有カードを準備中…';const blob=await drawCard();const file=new File([blob],`momiji-${mode}.png`,{type:'image/png'});const text=window.ShareCard.message({mode,total,count});try{if(navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({files:[file],text,title:'もみじ製作所'});status.textContent='共有メニューを開きました。';return;}}catch(e){if(e.name==='AbortError'){status.textContent='共有をキャンセルしました。画像保存やLINE共有を使えます。';return;}}
    window.ShareCard.download(blob,mode);status.textContent='画像を保存しました。LINE共有は次の画面で開けます。';window.ShareCard.openLine(text);}
  function bind(){canvas.addEventListener('pointerdown',handleDown);canvas.addEventListener('pointermove',handleMove);canvas.addEventListener('pointerup',handleUp);canvas.addEventListener('pointercancel',handleUp);canvas.addEventListener('lostpointercapture',e=>{if(state==='painting')handleUp(e)});
    $('#startButton').onclick=()=>{soundInit();FactoryAudio.event('tap');updateBest();show('#modeScreen');};document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{FactoryAudio.event('tap');begin(b.dataset.mode);});
    // AUTHOR MODE START: タイトルから確認画面に入り、終了ボタンでタイトルへ戻ります。
    $('#authorModeButton').onclick=()=>{state='author';show('#authorScreen');$('#authorExitButton').focus();};$('#authorExitButton').onclick=()=>{state='title';show('#titleScreen');};
    // AUTHOR MODE END
    document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show('#titleScreen'));$('#pauseButton').onclick=pause;$('#resumeButton').onclick=resume;
    $('#returnTitleButton').onclick=()=>{if(confirm('進行中のゲームを終了して、タイトルへ戻りますか？'))backToTitle();};$('#resultTitleButton').onclick=backToTitle;$('#retryButton').onclick=()=>begin(mode);
    $('#settingsButton').onclick=()=>{soundInit();show('#settingsScreen');};$('#closeSettings').onclick=()=>show('#titleScreen');$('#soundQuick').onclick=()=>{saved.muted=!FactoryAudio.settings.muted;FactoryAudio.set({muted:saved.muted});persistAudio();$('#muteToggle').checked=saved.muted;};
    $('#bgmVolume').value=saved.bgm;$('#sfxVolume').value=saved.sfx;$('#muteToggle').checked=saved.muted;$('#bgmVolume').oninput=e=>{FactoryAudio.set({bgm:+e.target.value});persistAudio();};$('#sfxVolume').oninput=e=>{FactoryAudio.set({sfx:+e.target.value});persistAudio();};$('#muteToggle').onchange=e=>{FactoryAudio.set({muted:e.target.checked});persistAudio();};$('#shareButton').onclick=share;
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&['ready','painting','moving','evaluating'].includes(state))pause();});window.addEventListener('resize',fit);window.addEventListener('orientationchange',()=>setTimeout(fit,100));}
  function loop(now){if(!lastFrame)lastFrame=now;const dt=Math.min(60,now-lastFrame);lastFrame=now;if(state==='moving')conveyor+=dt*.12;draw();requestAnimationFrame(loop);}
  fit();bind();updateBest();FactoryAudio.set({bgm:saved.bgm,sfx:saved.sfx,muted:saved.muted});requestAnimationFrame(loop);
})();
