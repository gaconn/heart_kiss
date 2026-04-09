(function initHeartAppUtils(global) {
  const HeartApp = global.HeartApp || {};

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function easeInOutCubic(value) {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function easeOutBack(value) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
  }

  function mixColorArray(from, to, amount) {
    return [
      Math.round(lerp(from[0], to[0], amount)),
      Math.round(lerp(from[1], to[1], amount)),
      Math.round(lerp(from[2], to[2], amount)),
    ];
  }

  function mixColorString(from, to, amount) {
    const [red, green, blue] = mixColorArray(from, to, amount);
    return `rgb(${red}, ${green}, ${blue})`;
  }

  function rgbaString(color, alpha = 1) {
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
  }

  function loadSvgImage(svgText) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to load heart.svg as image"));
      };

      image.src = objectUrl;
    });
  }

  function loadRasterImage(path, label) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        resolve(image);
      };

      image.onerror = () => {
        reject(new Error(`Unable to load ${label}`));
      };

      image.src = path;
    });
  }

  function sampleSvgDotColor(sampleContext, dot) {
    const left = Math.max(0, Math.floor(dot.x - dot.width / 2));
    const top = Math.max(0, Math.floor(dot.y - dot.height / 2));
    const width = Math.max(1, Math.ceil(dot.width));
    const height = Math.max(1, Math.ceil(dot.height));
    const imageData = sampleContext.getImageData(left, top, width, height).data;

    let red = 0;
    let green = 0;
    let blue = 0;
    let totalAlpha = 0;

    for (let index = 0; index < imageData.length; index += 4) {
      const alpha = imageData[index + 3] / 255;
      if (alpha <= 0.01) {
        continue;
      }

      red += imageData[index] * alpha;
      green += imageData[index + 1] * alpha;
      blue += imageData[index + 2] * alpha;
      totalAlpha += alpha;
    }

    if (totalAlpha <= 0) {
      return [255, 145, 182];
    }

    return [
      Math.round(red / totalAlpha),
      Math.round(green / totalAlpha),
      Math.round(blue / totalAlpha),
    ];
  }

  HeartApp.utils = {
    clamp,
    lerp,
    easeOutCubic,
    easeInOutCubic,
    easeOutBack,
    mixColorArray,
    mixColorString,
    rgbaString,
    loadSvgImage,
    loadRasterImage,
    sampleSvgDotColor,
  };

  global.HeartApp = HeartApp;
})(window);