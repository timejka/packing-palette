// Extracts a small dominant-color palette from an already-loaded <img>
// element using median-cut color quantization over a downsampled canvas.

const SAMPLE_SIZE = 100;

export function loadImageForExtraction(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

function getPixels(img) {
  const scale = Math.min(SAMPLE_SIZE / img.naturalWidth, SAMPLE_SIZE / img.naturalHeight, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Throws SecurityError if the image tainted the canvas (no CORS headers).
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // skip transparent pixels
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  return pixels;
}

function channelRange(bucket, channel) {
  let min = 255;
  let max = 0;
  for (const p of bucket) {
    if (p[channel] < min) min = p[channel];
    if (p[channel] > max) max = p[channel];
  }
  return max - min;
}

function widestChannel(bucket) {
  const ranges = [0, 1, 2].map((c) => channelRange(bucket, c));
  return ranges.indexOf(Math.max(...ranges));
}

function medianCut(pixels, count) {
  let buckets = [pixels];

  while (buckets.length < count) {
    let splitIndex = -1;
    let splitChannel = 0;
    let maxRange = 0;

    buckets.forEach((bucket, i) => {
      if (bucket.length < 2) return;
      const channel = widestChannel(bucket);
      const range = channelRange(bucket, channel);
      // A bucket with zero range is a single solid color already — splitting
      // it would just produce two buckets that average back to the same
      // color, i.e. duplicate palette entries. Only split buckets that
      // still have some actual color variation left.
      if (range > maxRange) {
        maxRange = range;
        splitIndex = i;
        splitChannel = channel;
      }
    });

    if (splitIndex === -1) break;

    const bucket = buckets[splitIndex];
    bucket.sort((a, b) => a[splitChannel] - b[splitChannel]);
    const mid = Math.floor(bucket.length / 2);
    buckets.splice(splitIndex, 1, bucket.slice(0, mid), bucket.slice(mid));
  }

  return buckets
    .filter((b) => b.length > 0)
    .map((bucket) => {
      const sum = bucket.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
      return {
        rgb: sum.map((v) => Math.round(v / bucket.length)),
        weight: bucket.length,
      };
    })
    .sort((a, b) => b.weight - a.weight);
}

function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Extracts `count` dominant colors from a loaded image, most dominant first.
 * Returns an array of hex strings. Throws if the canvas is tainted (image
 * host didn't send permissive CORS headers) — callers should catch this.
 */
export function extractPalette(img, count = 4) {
  const pixels = getPixels(img);
  if (pixels.length === 0) return [];
  return medianCut(pixels, count).map((c) => rgbToHex(c.rgb));
}
