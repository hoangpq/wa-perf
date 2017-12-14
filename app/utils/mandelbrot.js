let palette = [];

function generatePalette() {
  // Calculate a gradient
  let roffset = 24;
  let goffset = 16;
  let boffset = 0;
  for (let i = 0; i < 256; i++) {
    palette[i] = {r: roffset, g: goffset, b: boffset};
    if (i < 64) {
      roffset += 3;
    } else if (i < 128) {
      goffset += 3;
    } else if (i < 192) {
      boffset += 3;
    }
  }
}

function calculate(cr, ci) {
  let count = 0;
  let zr = 0.0;
  let zi = 0.0;
  while (count < 256) {
    let zrzi = zr * zi;
    let zr2 = zr * zr;
    let zi2 = zi * zi;
    zr = zr2 - zi2 + cr;
    zi = zrzi + zrzi + ci;
    count++;
    if (zi2 + zr2 >= 2.0) {
      break;
    }
  }
  return Math.min(255, count);
}

export function renderByJS(canvas, pixel_size, x0, y0, start = 0, end = 0) {
  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const data = context.getImageData(0, 0, width, height)
  const length = width * height * 4;
  let buffer = new Uint8ClampedArray(length);
  console.time('Javascript');
  generatePalette();
  let _start = 0;
  let _end = width;
  if (end !== 0) {
    _start = start;
    _end = end;
  }
  for (let i = _start; i < _end; i++) {
    for (let j = 0; j < height; j++) {
      let cr = x0 + pixel_size * i;
      let ci = y0 + pixel_size * j;
      let pix = calculate(cr, ci);
      let idx = (j * width + i) * 4;
      let color = palette[pix];
      buffer[idx] = color.r;
      buffer[idx + 1] = color.g;
      buffer[idx + 2] = color.b;
      buffer[idx + 3] = 255;
    }
  }
  console.timeEnd('Javascript');
  data.data.set(buffer);
  context.putImageData(data, 0, 0);
}

export function renderByWA(module, canvas, pixel_size, x0, y0, start = 0, end = 0) {
  const context = canvas.getContext('2d');
  let data = context.getImageData(0, 0, canvas.width, canvas.height);
  const length = canvas.width * canvas.height * 4;
  let ptr = module.alloc(length);
  let buffer = new Uint8ClampedArray(module.memory.buffer, ptr, length);
  console.time('Web Assembly');
  module.mandelbrot(buffer.byteOffset, buffer.length, canvas.width, canvas.height, pixel_size, x0, y0, start, end);
  module.dealloc(ptr, length);
  data.data.set(buffer);
  context.putImageData(data, 0, 0);
  console.timeEnd('Web Assembly');
}
