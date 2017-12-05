// Palette array of 256 colors
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

export default function mandelbrot(buffer, width, height, pixel_size, x0, y0) {
  generatePalette();
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let cr = x0 + pixel_size * i;
      let ci = y0 + pixel_size * j;
      let pix = calculate(cr, ci);
      let idx = (j * width + i) * 4;
      let color = palette[pix];

      /*buffer[idx] = 255 - pix;
      buffer[idx + 1] = 255 - pix;
      buffer[idx + 2] = 255 - pix;
      buffer[idx + 3] = 255;*/

      buffer[idx] = color.r;
      buffer[idx + 1] = color.g;
      buffer[idx + 2] = color.b;
      buffer[idx + 3] = 255;
    }
  }
}
