window.ShareCard=(()=>{
  const W=1080,H=1350;
  function rounded(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
  function create({mode,total,count,best,scores}){return new Promise(resolve=>{const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
    const g=c.createLinearGradient(0,0,W,H);if(mode==='ten'){g.addColorStop(0,'#ffedc8');g.addColorStop(1,'#f9b5a6');}else{g.addColorStop(0,'#c8f0df');g.addColorStop(1,'#b9c9fa');}c.fillStyle=g;c.fillRect(0,0,W,H);const cardBg=window.FactoryAssets?.get(mode==='ten'?'cardTen':'cardPerfect');if(cardBg)window.FactoryAssets.cover(c,cardBg,0,0,W,H);
    // distinct card background designs, vector fallback
    c.fillStyle='#ffffff66';for(let i=0;i<16;i++){let x=(i*173)%W,y=(i*257)%H;c.beginPath();c.arc(x,y,22+(i%4)*11,0,Math.PI*2);c.fill();}
    c.fillStyle='#fff8e9';rounded(c,75,75,930,1200,64);c.fill();c.strokeStyle=mode==='ten'?'#ffb49d':'#9fdcc4';c.lineWidth=12;c.stroke();
    c.textAlign='center';c.fillStyle='#b87658';c.font='900 34px system-ui,sans-serif';c.fillText('🍁 MOMIJI FACTORY 🍁',W/2,180);
    c.fillStyle='#fff';c.strokeStyle='#a65d43';c.lineWidth=12;c.lineJoin='round';c.font='1000 76px system-ui,sans-serif';c.strokeText('もみじ製作所',W/2,282);c.fillStyle='#f07968';c.fillText('もみじ製作所',W/2,282);
    c.fillStyle=mode==='ten'?'#ee8c72':'#8f75ce';rounded(c,294,334,492,82,40);c.fill();c.fillStyle='#fff';c.font='900 36px system-ui,sans-serif';c.fillText(mode==='ten'?'10匹もみじ':'パーフェクトもみじ',W/2,390);
    drawCardCat(c,W/2,610,300);
    c.fillStyle='#715244';c.font='800 30px system-ui,sans-serif';c.fillText(mode==='ten'?'今回の合計スコア':'今回の記録',W/2,845);
    const value=mode==='ten'?`${total}点`:`${count}匹`;c.font='1000 128px system-ui,sans-serif';c.lineWidth=16;c.strokeStyle='#fff';c.strokeText(value,W/2,1000);c.fillStyle='#f07968';c.fillText(value,W/2,1000);
    c.fillStyle='#987258';c.font='800 34px system-ui,sans-serif';c.fillText(mode==='ten'?`自己ベスト　${best} / 1000`:`自己ベスト　${best} 匹`,W/2,1075);
    if(mode==='ten'){c.font='700 21px system-ui,sans-serif';c.fillText(`評価　${scores.map((s,i)=>`${i+1}:${s}`).join('  ')}`,W/2,1135);}
    c.fillStyle='#ae8261';c.font='700 22px system-ui,sans-serif';c.fillText('家族といっしょに遊ぼう！',W/2,1215);c.font='500 17px system-ui,sans-serif';const url=location.href.split('#')[0];c.fillText(url.length>66?url.slice(0,63)+'…':url,W/2,1255);
    cv.toBlob(b=>resolve(b),'image/png');});}
  function drawCardCat(c,cx,cy,size){c.save();c.translate(cx-size/2,cy-size/2);c.fillStyle='#e9b47e';c.strokeStyle='#ad7757';c.lineWidth=8;c.beginPath();c.ellipse(size/2,size*.58,size*.29,size*.34,0,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#fff8ee';c.beginPath();c.ellipse(size*.25,size*.7,size*.085,size*.22,-.1,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(size*.75,size*.7,size*.085,size*.22,.1,0,Math.PI*2);c.fill();c.fillStyle='#e9b47e';c.beginPath();c.moveTo(size*.28,size*.38);c.lineTo(size*.22,size*.08);c.lineTo(size*.43,size*.23);c.quadraticCurveTo(size*.5,size*.19,size*.57,size*.23);c.lineTo(size*.78,size*.08);c.lineTo(size*.72,size*.38);c.quadraticCurveTo(size*.5,size*.48,size*.28,size*.38);c.fill();c.stroke();c.restore();}
  function message({mode,total,count}){const url=location.href.split('#')[0];return `もみじ製作所 🍁\n${mode==='ten'?`10匹もみじ：${total} / 1000点`:`パーフェクトもみじ：${count}匹！`}\nいっしょに遊ぼう！ ${url}`;}
  function download(blob,mode){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`momiji-${mode}-${Date.now()}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),10000);}
  function openLine(text){const url=`https://line.me/R/msg/text/?${encodeURIComponent(text)}`;window.open(url,'_blank','noopener,noreferrer');}
  return {create,message,download,openLine};
})();
