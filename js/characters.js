(function initCharactersModule(global) {
  const HeartApp = global.HeartApp || {};
  const { config } = HeartApp;
  const { clamp, easeOutBack, loadRasterImage } = HeartApp.utils;

  async function loadAssets(state) {
    const [boySprite, girlSprite, kissImage] = await Promise.all([
      loadRasterImage(HeartApp.paths.boySprite),
      loadRasterImage(HeartApp.paths.girlSprite),
      loadRasterImage(HeartApp.paths.kissIcon),
    ]);

    state.sprites.boy = boySprite;
    state.sprites.girl = girlSprite;
    state.sprites.kiss = kissImage;
  }

  function updateLayout(state) {
    const heartWidth = state.heartBox.width * state.heartScale;
    const heartHeight = state.heartBox.height * state.heartScale;
    const centerX = state.width / 2;
    const heartBottom = state.heartOffsetY + (state.heartBox.y + state.heartBox.height) * state.heartScale;
    const laneY = Math.min(state.height - 24, heartBottom + heartHeight * 0.12);
    const spriteHeight = heartHeight / 3;
    const boyFrameWidth = state.sprites.boy.width / config.boyFrameCount;
    const girlFrameWidth = state.sprites.girl.width / config.girlFrameCount;
    const boyWidth = spriteHeight * (boyFrameWidth / state.sprites.boy.height);
    const girlWidth = spriteHeight * (girlFrameWidth / state.sprites.girl.height);
    const sidePadding = Math.max(18, Math.min(state.width * 0.04, 36));
    const meetGap = Math.max(30, heartWidth * 0.045);

    state.characterLayout = {
      centerX,
      laneY,
      meetGap,
      leftStartX: sidePadding + boyWidth / 2,
      rightStartX: state.width - sidePadding - girlWidth / 2,
      boyTargetX: centerX - meetGap / 2 - boyWidth * 0.35,
      girlTargetX: centerX + meetGap / 2 + girlWidth * 0.35,
      spriteHeight,
      boyWidth,
      girlWidth,
    };
  }

  function getCharacterState(state, scene, time) {
    const layout = state.characterLayout;
    if (!layout) {
      return null;
    }

    const meetTime = config.formationDuration * config.characterMeetRatio;
    const travelProgress = clamp(
      (scene.cycle - config.characterStartDelay) / Math.max(1, meetTime - config.characterStartDelay),
      0,
      1,
    );
    const bob = Math.sin(time * 0.014) * 2.4;
    const strideFrame = Math.floor(time / config.characterFrameDuration) % config.boyFrameCount;
    const frame = travelProgress >= 1 ? 0 : strideFrame;

    return {
      boy: {
        x: layout.leftStartX + (layout.boyTargetX - layout.leftStartX) * travelProgress,
        y: layout.laneY + bob,
        frame,
        flip: false,
      },
      girl: {
        x: layout.rightStartX + (layout.girlTargetX - layout.rightStartX) * travelProgress,
        y: layout.laneY - bob,
        frame,
        flip: true,
      },
      progress: travelProgress,
    };
  }

  function getKissState(scene) {
    const meetTime = config.formationDuration * config.characterMeetRatio;
    const kissDuration = config.kissScaleInDuration + config.kissHoldDuration + config.kissFadeDuration;
    const showStart = meetTime;
    const local = clamp((scene.cycle - showStart) / kissDuration, 0, 1);
    const active = scene.cycle >= showStart && scene.cycle <= showStart + kissDuration;

    return {
      active,
      progress: local,
      scale: active ? easeOutBack(local) : 0,
      alpha: active ? (local < 0.72 ? 1 : 1 - (local - 0.72) / 0.28) : 0,
    };
  }

  function drawCharacterSprite(ctx, image, frameIndex, frameCount, x, y, targetHeight, flip) {
    const frameWidth = image.width / frameCount;
    const frameHeight = image.height;
    const targetWidth = targetHeight * (frameWidth / frameHeight);

    ctx.save();
    ctx.translate(x, y);
    if (flip) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      image,
      frameIndex * frameWidth,
      0,
      frameWidth,
      frameHeight,
      -targetWidth / 2,
      -targetHeight,
      targetWidth,
      targetHeight,
    );
    ctx.restore();

    return targetWidth;
  }

  function drawCharacterLabel(ctx, x, footY, text, spriteHeight) {
    const fontSize = Math.max(15, Math.round(spriteHeight * 0.17));
    const baselineY = footY + fontSize * 1.35;

    ctx.save();
    ctx.font = `600 ${fontSize}px Georgia`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const metrics = ctx.measureText(text);
    const paddingX = fontSize * 0.65;
    const backgroundWidth = metrics.width + paddingX * 2;
    const backgroundHeight = fontSize * 1.55;
    const radius = backgroundHeight / 2;
    const backgroundX = x - backgroundWidth / 2;
    const backgroundY = baselineY - backgroundHeight / 2;

    ctx.fillStyle = "rgba(23, 10, 18, 0.58)";
    ctx.beginPath();
    ctx.moveTo(backgroundX + radius, backgroundY);
    ctx.arcTo(backgroundX + backgroundWidth, backgroundY, backgroundX + backgroundWidth, backgroundY + backgroundHeight, radius);
    ctx.arcTo(backgroundX + backgroundWidth, backgroundY + backgroundHeight, backgroundX, backgroundY + backgroundHeight, radius);
    ctx.arcTo(backgroundX, backgroundY + backgroundHeight, backgroundX, backgroundY, radius);
    ctx.arcTo(backgroundX, backgroundY, backgroundX + backgroundWidth, backgroundY, radius);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 226, 235, 0.26)";
    ctx.stroke();

    ctx.fillStyle = "#fff1f5";
    ctx.fillText(text, x, baselineY);
    ctx.restore();
  }

  function drawCharacters(ctx, state, scene, time) {
    const { boy, girl, kiss } = state.sprites;
    if (!boy || !girl || !state.characterLayout) {
      return;
    }

    const actors = getCharacterState(state, scene, time);
    if (!actors) {
      return;
    }

    const shadowAlpha = 0.12 + scene.colorShift * 0.12;
    const shadowWidth = state.characterLayout.spriteHeight * 0.4;
    ctx.fillStyle = `rgba(15, 10, 18, ${shadowAlpha})`;

    for (const actor of [actors.boy, actors.girl]) {
      ctx.beginPath();
      ctx.ellipse(actor.x, actor.y + 6, shadowWidth, shadowWidth * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawCharacterSprite(ctx, boy, actors.boy.frame, config.boyFrameCount, actors.boy.x, actors.boy.y, state.characterLayout.spriteHeight, actors.boy.flip);
    drawCharacterSprite(ctx, girl, actors.girl.frame, config.girlFrameCount, actors.girl.x, actors.girl.y, state.characterLayout.spriteHeight, actors.girl.flip);
    drawCharacterLabel(ctx, actors.boy.x, actors.boy.y, "Quân", state.characterLayout.spriteHeight);
    drawCharacterLabel(ctx, actors.girl.x, actors.girl.y, "Ly", state.characterLayout.spriteHeight);

    if (kiss) {
      const kissState = getKissState(scene);
      if (kissState.active && kissState.alpha > 0) {
        const centerX = (actors.boy.x + actors.girl.x) / 2;
        const centerY = Math.min(actors.boy.y, actors.girl.y) - state.characterLayout.spriteHeight * 0.6;
        const size = state.characterLayout.spriteHeight * (0.45 + kissState.scale * 0.5);

        ctx.save();
        ctx.globalAlpha = kissState.alpha;
        ctx.drawImage(kiss, centerX - size / 2, centerY - size / 2, size, size);
        ctx.restore();
      }
    }
  }

  HeartApp.characters = {
    loadAssets,
    updateLayout,
    drawCharacters,
  };

  global.HeartApp = HeartApp;
})(window);