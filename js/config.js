(function initHeartAppConfig(global) {
  const HeartApp = global.HeartApp || {};

  HeartApp.paths = {
    svg: "./icons/heart.svg",
    boySprite: "./icons/boy_walk.png",
    girlSprite: "./icons/girl_walk.png",
    kissIcon: "./icons/kiss.png",
  };

  HeartApp.config = {
    formationDuration: 8600,
    settleDuration: 1200,
    burstDuration: 2600,
    holdDuration: 1600,
    totalDuration: 14000,
    edgeParticleCount: 420,
    drizzleCount: 92,
    fillGridStep: 4.5,
    fillGridJitter: 1.15,
    dotThreshold: 1400,
    travelMin: 780,
    travelMax: 1540,
    boyFrameCount: 6,
    girlFrameCount: 6,
    characterStartDelay: 520,
    characterFrameDuration: 110,
    characterGap: 8,
    characterMeetRatio: 0.9,
    kissScaleInDuration: 220,
    kissHoldDuration: 240,
    kissFadeDuration: 240,
  };

  HeartApp.createState = function createState() {
    return {
      ready: false,
      width: 0,
      height: 0,
      heartScale: 1,
      heartOffsetX: 0,
      heartOffsetY: 0,
      particles: [],
      bursts: [],
      drizzle: [],
      decorativeDots: [],
      boundarySeeds: [],
      fillSeeds: [],
      heartPathData: "",
      heartPath: null,
      heartBox: null,
      hiddenSvgRoot: null,
      svgImage: null,
      backdropImage: null,
      sprites: {
        boy: null,
        girl: null,
        kiss: null,
      },
      spriteMetrics: {
        boy: null,
        girl: null,
      },
      characterLayout: null,
    };
  };

  global.HeartApp = HeartApp;
})(window);