/* 調整用パラメータ：ここを変更すると採点と演出の基本値を調整できます。 */
window.GAME_CONFIG = Object.freeze({
  TARGET_BACK_WIDTH_RATIO: 0.15, TARGET_BACK_HEIGHT_RATIO: 0.32,
  // 理想塗りの中心。猫の背中領域（BACK）の左上を(0,0)、右下を(1,1)とする割合です。
  TARGET_BACK_CENTER_X_RATIO: 0.57, TARGET_BACK_CENTER_Y_RATIO: 0.47,
  SCORE_ALPHA_THRESHOLD: 0.35, BRUSH_RADIUS_RATIO: 0.052,
  BRUSH_SOFTNESS: 0.82, PAINT_STRENGTH: 0.72,
  SCORE_EFFECT_MS: 1150, MOVE_MS: 720, PERFECT_BASE_SECONDS: 10,
  PERFECT_TIME_FACTOR: 0.8, CONTINUE_SCORE: 80,
  BELT_Y_RATIO: 0.85, // ベルト上端と猫の接地点。画面高さに対する比率。
  GAME_CAT_IMAGE: 'assets/momiji.png', // プレイ画面の猫。
  SHARE_CARD_CAT_IMAGE: 'assets/relaxedMom.png', // 共有カード中央の猫。モード共通。
  AUDIO_FILES: { bgm: 'assets/audio/bgm_factory.mp3', spray: 'assets/audio/sfx_spray.mp3', score: 'assets/audio/sfx_score.mp3' },
});
