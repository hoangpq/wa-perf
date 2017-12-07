import {renderByJS} from './mandelbrot';

self.addEventListener('message', (message) => {
  const {buffer, canvas, start, end} = message.data;
  console.log(start, end);
  // const sharedArray = new Uint8ClampedArray(message.data);
  const pixel_size = 0.005;
  const x0 = -2.0;
  const y0 = -1.0;
  renderByJS(buffer, canvas.width, canvas.height, pixel_size, x0, y0, start, end);
  self.postMessage({});
});
