(function initHeartModule(global) {
  const HeartApp = global.HeartApp || {};
  const { config } = HeartApp;
  const {
    clamp,
    lerp,
    easeOutCubic,
    easeInOutCubic,
    easeOutBack,
    mixColorArray,
    mixColorString,
    rgbaString,
    loadSvgImage,
    sampleSvgDotColor,
  } = HeartApp.utils;

  function buildBoundarySeeds(pathNode, count) {
    const length = pathNode.getTotalLength();
    const points = [];

    for (let index = 0; index < count; index += 1) {
      const position = (index / count) * length;
      const point = pathNode.getPointAtLength(position);
      points.push({ x: point.x, y: point.y });
    }

    return points;
  }

  function createSampler(heartPath) {
    const offscreen = document.createElement("canvas");
    offscreen.width = 500;
    offscreen.height = 500;
    const offscreenContext = offscreen.getContext("2d");
    offscreenContext.fillStyle = "#000";
    offscreenContext.fill(heartPath);

    return {
      isInside(x, y) {
        return offscreenContext.isPointInPath(heartPath, x, y);
      },
    };
  }

  function buildFillSeeds(state) {
    const sampler = createSampler(state.heartPath);
    const points = [];
    const step = config.fillGridStep;
    const jitter = config.fillGridJitter;

    for (let y = state.heartBox.y; y <= state.heartBox.y + state.heartBox.height; y += step) {
      for (let x = state.heartBox.x; x <= state.heartBox.x + state.heartBox.width; x += step) {
        const jitteredX = x + (Math.random() - 0.5) * jitter;
        const jitteredY = y + (Math.random() - 0.5) * jitter;
        if (sampler.isInside(jitteredX, jitteredY)) {
          points.push({ x: jitteredX, y: jitteredY });
        }
      }
    }

    return points;
  }

  function createParticle(state, index, target, isEdge) {
    const sourceDot = state.decorativeDots[index % state.decorativeDots.length] || {
      x: target.x,
      y: state.heartBox.y - 50,
      width: 10,
      height: 10,
    };

    const drift = (Math.random() - 0.5) * 34;
    return {
      target,
      sourceDot,
      startX: sourceDot.x + drift,
      startY: state.heartBox.y - 160 - Math.random() * 170,
      travelDuration: config.travelMin + Math.random() * (config.travelMax - config.travelMin),
      radius: (isEdge ? 1.34 : 1.04) + Math.random() * (isEdge ? 1.04 : 0.72),
      opacity: isEdge ? 0.9 : 0.72 + Math.random() * 0.18,
      trail: 18 + Math.random() * 36,
      twinkle: Math.random() * Math.PI * 2,
    };
  }

  function buildHeartParticles(state) {
    state.particles.length = 0;

    for (let index = 0; index < config.edgeParticleCount; index += 1) {
      const target = state.boundarySeeds[index % state.boundarySeeds.length];
      state.particles.push(createParticle(state, index, target, true));
    }

    for (let index = 0; index < state.fillSeeds.length; index += 1) {
      const target = state.fillSeeds[index];
      state.particles.push(createParticle(state, index + config.edgeParticleCount, target, false));
    }

    state.particles.sort((left, right) => left.target.y - right.target.y);
    const maxTravel = config.travelMax;
    const delayWindow = Math.max(config.formationDuration - maxTravel - 220, config.formationDuration * 0.58);
    state.particles.forEach((particle, index) => {
      const verticalBias = clamp((particle.target.y - state.heartBox.y) / state.heartBox.height, 0, 1);
      particle.delay = (index / state.particles.length) * delayWindow + verticalBias * 140;
    });
  }

  function buildBurstParticles(state) {
    state.bursts = state.decorativeDots.map((dot, index) => {
      const boundary = state.boundarySeeds[index % state.boundarySeeds.length] || {
        x: state.heartBox.x + state.heartBox.width / 2,
        y: state.heartBox.y + state.heartBox.height / 2,
      };

      return {
        origin: {
          x: lerp(boundary.x, state.heartBox.x + state.heartBox.width / 2, 0.38),
          y: lerp(boundary.y, state.heartBox.y + state.heartBox.height / 2, 0.38),
        },
        target: { x: dot.x, y: dot.y },
        color: dot.color,
        delay: config.formationDuration + 150 + Math.random() * 540,
        duration: 1100 + Math.random() * 650,
        baseRadius: Math.max(dot.width, dot.height) * 0.15 + 3,
        opacity: 0.5 + Math.random() * 0.28,
        wobble: Math.random() * Math.PI * 2,
        sparkleRate: 0.003 + Math.random() * 0.003,
      };
    });
  }

  function buildDrizzleParticles(state) {
    state.drizzle = Array.from({ length: config.drizzleCount }, (_, index) => {
      const seed = state.decorativeDots[index % state.decorativeDots.length] || {
        x: state.heartBox.x + state.heartBox.width / 2,
        y: state.heartBox.y,
      };

      return {
        x: seed.x + (Math.random() - 0.5) * 90,
        y: state.heartBox.y - 140 - Math.random() * 160,
        speed: 0.9 + Math.random() * 1.05,
        length: 22 + Math.random() * 34,
        opacity: 0.12 + Math.random() * 0.14,
      };
    });
  }

  function createBackdropSvgText(svgRoot) {
    const clone = svgRoot.cloneNode(true);

    Array.from(clone.children).forEach((child) => {
      const isDefs = child.tagName === "defs";
      const isBackgroundLayer = child.tagName === "g" && child.getAttribute("id") === "BACKGROUND";

      if (!isDefs && !isBackgroundLayer) {
        child.remove();
      }
    });

    return new XMLSerializer().serializeToString(clone);
  }

  function drawImageCover(ctx, image, width, height, alpha = 1) {
    const imageRatio = image.width / image.height;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;

    if (canvasRatio > imageRatio) {
      drawHeight = width / imageRatio;
    } else {
      drawWidth = height * imageRatio;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    ctx.restore();
  }

  async function parseSvgText(state, svgText) {
    const parser = new DOMParser();
    const documentSvg = parser.parseFromString(svgText, "image/svg+xml");
    const imported = document.importNode(documentSvg.documentElement, true);

    imported.setAttribute(
      "style",
      "position: fixed; left: -9999px; top: -9999px; width: 500px; height: 500px; opacity: 0; pointer-events: none;",
    );

    document.body.appendChild(imported);
    state.hiddenSvgRoot = imported;

    const mainPathNode = imported.querySelector("clipPath path");
    if (!mainPathNode) {
      throw new Error("Heart path not found in heart.svg");
    }

    const backdropSvgText = createBackdropSvgText(documentSvg.documentElement);
    const [svgImage, backdropImage] = await Promise.all([
      loadSvgImage(svgText),
      loadSvgImage(backdropSvgText),
    ]);

    state.svgImage = svgImage;
    state.backdropImage = backdropImage;
    state.heartPathData = mainPathNode.getAttribute("d") || "";
    state.heartPath = new Path2D(state.heartPathData);
    state.heartBox = mainPathNode.getBBox();

    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 500;
    sampleCanvas.height = 500;
    const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
    sampleContext.drawImage(state.svgImage, 0, 0, 500, 500);

    const mainCenter = {
      x: state.heartBox.x + state.heartBox.width / 2,
      y: state.heartBox.y + state.heartBox.height / 2,
    };

    const objectPaths = Array.from(imported.querySelectorAll("g#OBJECTS > path"));
    state.decorativeDots = objectPaths
      .filter((node) => node !== mainPathNode)
      .map((node) => {
        const box = node.getBBox();
        const dot = {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
          width: box.width,
          height: box.height,
          area: box.width * box.height,
        };

        return {
          ...dot,
          color: sampleSvgDotColor(sampleContext, dot),
        };
      })
      .filter((dot) => {
        const maxDimension = Math.max(dot.width, dot.height);
        const distance = Math.hypot(dot.x - mainCenter.x, dot.y - mainCenter.y);
        return dot.area > 5 && dot.area < config.dotThreshold && maxDimension < 48 && distance > 88;
      });

    const seenDots = new Set();
    state.decorativeDots = state.decorativeDots.filter((dot) => {
      const key = `${Math.round(dot.x)}-${Math.round(dot.y)}`;
      if (seenDots.has(key)) {
        return false;
      }
      seenDots.add(key);
      return true;
    });

    state.boundarySeeds = buildBoundarySeeds(mainPathNode, 260);
    state.fillSeeds = buildFillSeeds(state);
    buildHeartParticles(state);
    buildBurstParticles(state);
    buildDrizzleParticles(state);
  }

  function getSceneState(time) {
    const cycle = time % config.totalDuration;
    const formation = clamp(cycle / config.formationDuration, 0, 1);
    const settle = clamp((cycle - config.formationDuration) / config.settleDuration, 0, 1);
    const burst = clamp((cycle - config.formationDuration) / config.burstDuration, 0, 1);
    const colorShift = clamp((cycle - config.formationDuration + 260) / 2100, 0, 1);
    const hold = clamp((cycle - config.formationDuration - config.burstDuration) / config.holdDuration, 0, 1);
    const underpaintAlpha = clamp((formation - 0.14) / 0.58, 0, 1);

    return {
      cycle,
      formation,
      settle: easeOutCubic(settle),
      burst: easeOutCubic(burst),
      colorShift: easeOutCubic(colorShift),
      underpaintAlpha: easeOutCubic(underpaintAlpha),
      hold,
      heartAlpha: clamp((cycle - config.formationDuration + 180) / 1250, 0, 1),
    };
  }

  function drawBackground(ctx, state, scene) {
    const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
    const bloom = scene.colorShift;

    gradient.addColorStop(0, mixColorString([9, 7, 11], [255, 240, 245], bloom));
    gradient.addColorStop(0.5, mixColorString([20, 11, 18], [255, 228, 238], bloom));
    gradient.addColorStop(1, mixColorString([26, 13, 23], [255, 217, 230], bloom));

    ctx.clearRect(0, 0, state.width, state.height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);

    const halo = ctx.createRadialGradient(
      state.width / 2,
      state.height * 0.4,
      40,
      state.width / 2,
      state.height * 0.4,
      Math.max(state.width, state.height) * 0.45,
    );

    halo.addColorStop(0, `rgba(255, 124, 171, ${0.02 + bloom * 0.18})`);
    halo.addColorStop(0.45, `rgba(255, 120, 165, ${0.01 + bloom * 0.08})`);
    halo.addColorStop(1, "rgba(255, 120, 165, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, state.width, state.height);

    if (state.backdropImage) {
      const backdropAlpha = clamp(0.16 + scene.colorShift * 0.42 + scene.heartAlpha * 0.18, 0, 0.72);
      drawImageCover(ctx, state.backdropImage, state.width, state.height, backdropAlpha);
    }
  }

  function drawHeartBase(ctx, state, scene) {
    ctx.save();
    ctx.translate(state.heartOffsetX, state.heartOffsetY);
    ctx.scale(state.heartScale, state.heartScale);

    const darkHeart = [11, 10, 15];
    const pinkHeart = [232, 63, 122];
    const fillColor = mixColorString(darkHeart, pinkHeart, scene.colorShift);

    const glow = ctx.createRadialGradient(
      state.heartBox.x + state.heartBox.width / 2,
      state.heartBox.y + state.heartBox.height * 0.34,
      12,
      state.heartBox.x + state.heartBox.width / 2,
      state.heartBox.y + state.heartBox.height / 2,
      state.heartBox.width * 0.76,
    );

    glow.addColorStop(0, `rgba(255, 203, 222, ${scene.colorShift * 0.24})`);
    glow.addColorStop(1, "rgba(255, 203, 222, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(state.heartBox.x - 80, state.heartBox.y - 80, state.heartBox.width + 160, state.heartBox.height + 180);

    if (scene.underpaintAlpha > 0) {
      ctx.globalAlpha = scene.underpaintAlpha * 0.78;
      ctx.fillStyle = mixColorString(darkHeart, [86, 56, 70], scene.colorShift * 0.32);
      ctx.fill(state.heartPath);
    }

    ctx.globalAlpha = scene.heartAlpha;
    ctx.fillStyle = fillColor;
    ctx.fill(state.heartPath);

    ctx.strokeStyle = `rgba(255, 224, 235, ${scene.colorShift * 0.3})`;
    ctx.lineWidth = 1.4 / state.heartScale;
    ctx.stroke(state.heartPath);

    if (state.svgImage) {
      const artworkAlpha = Math.max(0, (scene.heartAlpha - 0.18) / 0.82) * (0.35 + scene.colorShift * 0.65);
      if (artworkAlpha > 0) {
        ctx.globalAlpha = artworkAlpha;
        ctx.drawImage(state.svgImage, 0, 0, 500, 500);
      }
    }

    ctx.restore();
  }

  function drawDrizzle(ctx, state, mapPoint, time, scene) {
    if (scene.formation > 0.98) {
      return;
    }

    const drizzleColor = mixColorArray([124, 26, 58], [238, 88, 142], scene.colorShift);

    for (const drop of state.drizzle) {
      const mappedTop = mapPoint({ x: drop.x, y: drop.y });
      const travel = (time * drop.speed * 0.09 + drop.x) % (state.height * 0.45);
      const x = mappedTop.x;
      const y = mappedTop.y + travel;

      ctx.strokeStyle = rgbaString(drizzleColor, drop.opacity * (1 - scene.formation));
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y - drop.length);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  function drawFormationParticles(ctx, state, mapPoint, time, scene) {
    const charcoal = [15, 12, 17];
    const deepHeart = [82, 33, 58];
    const rose = [232, 63, 122];
    const mist = [255, 206, 221];
    const ember = [176, 42, 88];
    const hotGlow = [255, 122, 166];
    const core = mixColorString(charcoal, rose, scene.colorShift);
    const halo = mixColorString(deepHeart, mist, scene.colorShift);
    const trailColor = mixColorArray(deepHeart, hotGlow, scene.colorShift);
    const glowInner = mixColorArray(ember, [255, 168, 194], scene.colorShift);
    const glowOuter = mixColorArray(deepHeart, [255, 132, 176], scene.colorShift);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const particle of state.particles) {
      const life = clamp((scene.cycle - particle.delay) / particle.travelDuration, 0, 1);
      if (life <= 0) {
        continue;
      }

      const eased = easeInOutCubic(life);
      const current = {
        x: lerp(particle.startX, particle.target.x, eased),
        y: lerp(particle.startY, particle.target.y, eased),
      };
      const mapped = mapPoint(current);
      const targetMapped = mapPoint(particle.target);
      const settled = life >= 1;
      const alpha = particle.opacity * (settled ? 1 : 0.52 + eased * 0.48) * (1 - scene.hold * 0.35);
      const radius = particle.radius * state.heartScale * (settled ? 1 : 0.8 + eased * 0.42);

      if (!settled) {
        ctx.strokeStyle = rgbaString(trailColor, alpha * 0.28);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mapped.x, mapped.y - particle.trail * state.heartScale * 0.52);
        ctx.lineTo(mapped.x, mapped.y);
        ctx.stroke();
      }

      const glow = ctx.createRadialGradient(mapped.x, mapped.y, 0, mapped.x, mapped.y, radius * 4.2);
      glow.addColorStop(0, rgbaString(glowInner, alpha * 0.52));
      glow.addColorStop(0.45, rgbaString(glowOuter, alpha * 0.26));
      glow.addColorStop(1, rgbaString(glowOuter, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mapped.x, mapped.y, radius * 4.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = settled ? core : halo;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(mapped.x, mapped.y, Math.max(radius, settled ? 0.9 : 0.72), 0, Math.PI * 2);
      ctx.fill();

      if (settled && scene.heartAlpha > 0.18) {
        ctx.globalAlpha = alpha * 0.22;
        ctx.beginPath();
        ctx.moveTo(targetMapped.x, targetMapped.y);
        ctx.lineTo(mapped.x, mapped.y);
        ctx.strokeStyle = `rgba(255, 210, 222, ${alpha * 0.2})`;
        ctx.stroke();
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawBurstDots(ctx, state, mapPoint, time, scene) {
    if (scene.cycle < config.formationDuration) {
      return;
    }

    const sparkleA = [255, 224, 236];
    const sparkleB = [255, 241, 178];
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const burst of state.bursts) {
      const rawLocal = (scene.cycle - burst.delay) / burst.duration;
      if (rawLocal <= 0) {
        continue;
      }

      const local = clamp(rawLocal, 0, 1);
      const eased = easeOutBack(local);
      const current = {
        x: lerp(burst.origin.x, burst.target.x, eased),
        y: lerp(burst.origin.y, burst.target.y, eased),
      };
      const mapped = mapPoint(current);
      const twinkle = 0.5 + 0.5 * Math.sin(time * burst.sparkleRate + burst.wobble);
      const pulse = 0.9 + twinkle * 0.2;
      const settled = rawLocal >= 1;
      const radius = burst.baseRadius * state.heartScale * (settled ? 0.9 + twinkle * 0.2 : (1.45 - local * 0.4) * pulse);
      const alpha = settled
        ? burst.opacity * (0.72 + twinkle * 0.28)
        : burst.opacity * (0.5 + local * 0.4 + scene.colorShift * 0.2);
      const sparkleColor = mixColorArray(sparkleA, sparkleB, twinkle);

      const glow = ctx.createRadialGradient(mapped.x, mapped.y, 0, mapped.x, mapped.y, radius * 3.8);
      glow.addColorStop(0, rgbaString(sparkleColor, alpha * (settled ? 0.7 : 0.55)));
      glow.addColorStop(0.5, rgbaString(burst.color, alpha * 0.24));
      glow.addColorStop(1, rgbaString(sparkleColor, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mapped.x, mapped.y, radius * 3.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = rgbaString(burst.color, 1);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(mapped.x, mapped.y, Math.max(radius, 0.8), 0, Math.PI * 2);
      ctx.fill();

      if (settled) {
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = rgbaString(sparkleColor, 1);
        ctx.beginPath();
        ctx.arc(mapped.x, mapped.y, Math.max(radius * 0.42, 0.45), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  HeartApp.heart = {
    parseSvgText,
    getSceneState,
    drawBackground,
    drawHeartBase,
    drawDrizzle,
    drawFormationParticles,
    drawBurstDots,
  };

  global.HeartApp = HeartApp;
})(window);