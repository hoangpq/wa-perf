import {renderByWA, initWA} from '../utils/mandelbrot';

onmessage = function (evt) {
  const {buffer, canvas, sab} = evt.data;
  initWA('hello.wasm')
    .then(instance => {

      sab[0] = 100;
      const module = instance.exports;
      console.log('wasm loaded');
      try {
        const pixel_size = 0.005;
        const x0 = -2.0;
        const y0 = -1.0;
      } catch (e) {
        console.log(e);
      }

      // console.log(buffer);

      postMessage('done');
    });
};
