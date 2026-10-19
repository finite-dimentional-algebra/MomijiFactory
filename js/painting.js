/* 描画表示と採点で共有する、猫の背中の楕円形定義（猫ローカル 0..1）。 */
window.Painting = (() => {
  const BACK = { x: 0.25, y: 0.30, w: 0.50, h: 0.54 };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));
  function ellipsePath(ctx, x, y, w, h) { ctx.beginPath(); ctx.ellipse(x + w * BACK.x + w * BACK.w / 2, y + h * BACK.y + h * BACK.h / 2, w * BACK.w / 2, h * BACK.h / 2, 0, 0, Math.PI * 2); }
  function create(w, h) {
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(w)); canvas.height = Math.max(1, Math.round(h));
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); return { canvas, ctx, last: null, empty: true };
  }
  function dab(layer, x, y, radius, config = GAME_CONFIG) {
    const { ctx, canvas } = layer; if (!ctx) return;
    const r = Math.max(2, radius); const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${config.PAINT_STRENGTH})`); g.addColorStop(config.BRUSH_SOFTNESS, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    layer.empty = false; layer.last = { x, y };
  }
  function stroke(layer, x, y, radius) {
    const last = layer.last;
    if (!last) return dab(layer, x, y, radius);
    const d = Math.hypot(x - last.x, y - last.y); const steps = Math.max(1, Math.ceil(d / Math.max(2, radius * 0.28)));
    for (let i = 1; i <= steps; i++) { const t = i / steps; dab(layer, last.x + (x-last.x)*t, last.y + (y-last.y)*t, radius); }
    layer.last = { x, y };
  }
  function measure(layer, minX, minY, maxX, maxY) {
    const { ctx, canvas } = layer; if (!ctx || layer.empty) return null;
    const x0 = clamp(Math.floor(minX), 0, canvas.width - 1), y0 = clamp(Math.floor(minY), 0, canvas.height - 1);
    const ww = Math.max(1, Math.min(canvas.width - x0, Math.ceil(maxX) - x0)), hh = Math.max(1, Math.min(canvas.height - y0, Math.ceil(maxY) - y0));
    const data = ctx.getImageData(x0, y0, ww, hh).data, threshold = GAME_CONFIG.SCORE_ALPHA_THRESHOLD * 255;
    let n = 0, sx = 0, sy = 0, lx = ww, ly = hh, hx = -1, hy = -1;
    for (let y=0; y<hh; y++) for (let x=0; x<ww; x++) { if (data[(y*ww+x)*4+3] >= threshold) { n++; sx+=x; sy+=y; lx=Math.min(lx,x); ly=Math.min(ly,y); hx=Math.max(hx,x); hy=Math.max(hy,y); } }
    if (!n) return null;
    return { cx: (sx/n+x0)/canvas.width, cy: (sy/n+y0)/canvas.height, w: (hx-lx+1)/canvas.width, h: (hy-ly+1)/canvas.height };
  }
  function score(paint, back = BACK) {
    if (!paint) return { total: 0, center: 0, width: 0, height: 0 };
    const backW=back.w, backH=back.h;
    const targetCx=back.x+backW*clamp(GAME_CONFIG.TARGET_BACK_CENTER_X_RATIO,0,1);
    const targetCy=back.y+backH*clamp(GAME_CONFIG.TARGET_BACK_CENTER_Y_RATIO,0,1);
    const dx=paint.cx-targetCx, dy=paint.cy-targetCy;
    const normalizer=Math.hypot(backW/2, backH/2), targetW=backW*GAME_CONFIG.TARGET_BACK_WIDTH_RATIO, targetH=backH*GAME_CONFIG.TARGET_BACK_HEIGHT_RATIO;
    const center=clamp(100*(1-Math.hypot(dx,dy)/normalizer),0,100), width=clamp(100*(1-Math.abs(paint.w-targetW)/targetW),0,100), height=clamp(100*(1-Math.abs(paint.h-targetH)/targetH),0,100);
    return { total: Math.round((center+width+height)/3), center, width, height };
  }
  function label(n) { return n===100 ? 'Perfect Momiji！！' : n>=80 ? 'Great！！' : n>=50 ? 'Nice！！' : 'Warabi'; }
  function targetCenter(back=BACK) { return { x: back.x+back.w*clamp(GAME_CONFIG.TARGET_BACK_CENTER_X_RATIO,0,1), y: back.y+back.h*clamp(GAME_CONFIG.TARGET_BACK_CENTER_Y_RATIO,0,1) }; }
  return { BACK, ellipsePath, create, dab, stroke, measure, score, targetCenter, label };
})();
