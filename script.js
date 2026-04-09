(function initHeartScene(global) {
  const HeartApp = global.HeartApp;
  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");
  const state = HeartApp.createState();
  const dpr = Math.min(global.devicePixelRatio || 1, 2);

  const heart = HeartApp.heart;
  const characters = HeartApp.characters;

  function mapPoint(point) {
    return {
      x: point.x * state.heartScale + state.heartOffsetX,
      y: point.y * state.heartScale + state.heartOffsetY,
    };
  }

  function updateLayout() {
    const targetWidth = state.width * 0.32;
    const targetHeight = state.height * 0.36;

    state.heartScale = Math.min(
      targetWidth / state.heartBox.width,
      targetHeight / state.heartBox.height,
    );

    const heartCenterX = state.heartBox.x + state.heartBox.width / 2;
    const heartCenterY = state.heartBox.y + state.heartBox.height / 2;
    const canvasCenterX = state.width / 2;
    const canvasCenterY = state.height * 0.42;

    state.heartOffsetX = canvasCenterX - heartCenterX * state.heartScale;
    state.heartOffsetY = canvasCenterY - heartCenterY * state.heartScale;
    characters.updateLayout(state);
  }

  function resize() {
    state.width = global.innerWidth;
    state.height = global.innerHeight;

    canvas.width = Math.floor(state.width * dpr);
    canvas.height = Math.floor(state.height * dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (state.heartBox) {
      updateLayout();
    }
  }

  function drawScene(time) {
    const scene = heart.getSceneState(time);
    heart.drawBackground(ctx, state, scene);
    heart.drawDrizzle(ctx, state, mapPoint, time, scene);
    heart.drawHeartBase(ctx, state, scene);
    heart.drawFormationParticles(ctx, state, mapPoint, time, scene);
    characters.drawCharacters(ctx, state, scene, time);
    heart.drawBurstDots(ctx, state, mapPoint, time, scene);
  }

  function frame(time) {
    if (!state.ready) {
      return;
    }

    drawScene(time);
    global.requestAnimationFrame(frame);
  }

  async function initialize() {
    resize();

    try {
      const response = await fetch(HeartApp.paths.svg);
      if (!response.ok) {
        throw new Error("Unable to fetch heart.svg");
      }

      const svgText = await response.text();
      await Promise.all([
        heart.parseSvgText(state, svgText),
        characters.loadAssets(state),
      ]);

      updateLayout();
      state.ready = true;
      global.requestAnimationFrame(frame);
    } catch (error) {
      console.error(error);
      ctx.clearRect(0, 0, state.width, state.height);
      ctx.fillStyle = "#ffdce7";
      ctx.font = "16px Georgia";
      ctx.textAlign = "center";
      ctx.fillText("Khong the tai asset de render animation.", state.width / 2, state.height / 2);
    }
  }

  global.addEventListener("resize", resize);
  initialize();
})(window);
