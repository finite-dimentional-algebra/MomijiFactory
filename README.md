# もみじ製作所

スマートフォン向けのスプレー採点ミニゲームです。Vanilla HTML/CSS/JavaScriptだけで動作し、ビルドや外部ネットワーク接続は不要です。

## 起動

`index.html` をブラウザで開きます。ローカルファイルで保存・共有APIに制約が出るブラウザでは、GitHub Pagesまたは簡易HTTPサーバーを使ってください。入力、採点、Canvasカード生成はオフラインでも利用できます。

## GitHub Pages

リポジトリのルートにこのフォルダの内容を置き、Settings → Pages で対象ブランチのルートを公開します。HTMLはCSS/JSを相対パスで読み込むため、`username.github.io/repository/` のようなサブパスでも動作します。

## 調整

採点と演出の主な値は `js/config.js` にあります。

- `TARGET_BACK_WIDTH_RATIO` / `TARGET_BACK_HEIGHT_RATIO`: 背中に対する目標の横幅・縦幅
- `SCORE_ALPHA_THRESHOLD`: 採点マスクとして扱うアルファ閾値
- `BRUSH_RADIUS_RATIO`, `BRUSH_SOFTNESS`, `PAINT_STRENGTH`: 塗料ブラシのサイズ・柔らかさ・強度
- `SCORE_EFFECT_MS`, `MOVE_MS`: 採点演出と猫の移動時間
- `PERFECT_BASE_SECONDS`, `PERFECT_TIME_FACTOR`, `CONTINUE_SCORE`: パーフェクトモードの時間・継続点

塗りの描画、クリップ、採点に使う背中の楕円は `js/painting.js` の `BACK` ひとつで定義しています。

## 音声と画像

音声パスは `js/config.js` の `AUDIO_FILES` にまとまっています。現在はWeb Audio APIの短い生成音を使い、音声ファイルがなくても再生できます。独自の音源に置き換える場合は `js/audio.js` の音声エンジンで読み込む処理を追加してください。

現在の猫、工場、ベルト、共有カード背景はCanvasで描画するオフライン素材です。猫は `js/main.js` の `drawCat`、工場は `drawFactory`、共有カードは `js/share.js` の `create` / `drawCardCat` で描画します。差し替え用プロンプトは `ASSET_PROMPTS.txt` にあります。画像生成ツールは利用できなかったため、画像ファイルは同梱していません。

## スコア共有

結果カードは1080×1350のPNGとしてCanvasから生成します。対応ブラウザでは画像と文章をOS共有メニューに渡し、非対応時にはPNG保存とLINEテキスト共有を利用します。共有APIやファイル共有の対応はブラウザにより異なります。ゲームURLも共有文とカードに含めます。

## データ

各モードの自己ベスト、音量、ミュート設定は `localStorage` の `momiji-factory-v1` に保存します。利用できない場合もゲームは初期値で動作します。
