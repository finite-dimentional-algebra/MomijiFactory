/* Optional local art. Missing files intentionally fall back to Canvas art. */
window.FactoryAssets = (() => {
  const sources = {
    momiji: 'assets/momiji.png',
    factory: 'assets/factory-bg.png',
    cardTen: 'assets/card-ten.png',
    cardPerfect: 'assets/card-perfect.png',
  };
  // momiji.png の透明余白を除いた猫本体。差し替え画像の余白が変わったらここを更新します。
  const momijiCrop = { x: 316, y: 220, width: 624, height: 980, sourceWidth: 1254, sourceHeight: 1254 };
  const images = {};
  for (const [key, src] of Object.entries(sources)) {
    const image = new Image();
    image.onload = () => { images[key] = image; };
    image.onerror = () => { delete images[key]; };
    image.src = src;
  }
  function get(key) { const image = images[key]; return image?.complete && image.naturalWidth > 0 ? image : null; }
  function cover(ctx, image, x, y, w, h) {
    const scale = Math.max(w / image.width, h / image.height);
    const sw = w / scale, sh = h / scale;
    ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, x, y, w, h);
  }
  function cropForMomiji(image) {
    // 621x972等、絵の領域だけで保存された縦長画像なら全面を使います。
    if (image.width / image.height < 0.8) return { x: 0, y: 0, width: image.width, height: image.height };
    // 現在の正方形キャンバス版は透明余白を除いて表示します。
    const crop = momijiCrop;
    return { x: image.width * crop.x / crop.sourceWidth, y: image.height * crop.y / crop.sourceHeight,
      width: image.width * crop.width / crop.sourceWidth, height: image.height * crop.height / crop.sourceHeight };
  }
  function drawMomiji(ctx, image, x, y, w, h) {
    const crop = cropForMomiji(image);
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, x, y, w, h);
  }
  function momijiAspect(image) { const crop = cropForMomiji(image); return crop.height / crop.width; }
  return { get, cover, drawMomiji, momijiAspect, sources };
})();
