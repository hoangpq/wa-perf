export default function mandelbrot(buffer, width, height, pixel_size, x0, y0) {
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let cr = x0 + pixel_size * i;
      let ci = y0 + pixel_size * j;
      let [zr, zi] = [0.0, 0.0];
      let count = 0;
      for (let k = 0; k < 256; k++) {
        let [zrzi, zr2, zi2] = [zr * zi, zr * zr, zi * zi];
        zr = zr2 - zi2 + cr;
        zi = zrzi + zrzi + ci;
        count++;
        if (zi2 + zr2 >= 2.0) {
          break;
        }
      }
      let k = Math.min(255, count);
      let idx = (j * width * i);
      buffer[4 * idx] = 255 - k;
      buffer[4 * idx + 1] = 255 - k;
      buffer[4 * idx + 2] = 255 - k;
      buffer[4 * idx + 3] = 255;
    }
  }
}
