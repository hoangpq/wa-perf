import {initWA} from '.';

self.addEventListener('message', (message) => {
  initWA('hello.wasm')
    .then((instance) => {
      const module = instance.exports;
      console.log(module.fib_tco(120));
    });
});
