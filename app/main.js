// global style
require('./style.scss');
const wrap = require('../wasm/wrap');
import WAWorker from 'worker-loader!./worker/script.js';
import {renderByJS, renderByWA} from './utils/mandelbrot';

function loadCanvas(dataURL, module) {
  const canvasWA = document.getElementById('canvas1');
  const contextWA = canvasWA.getContext('2d');

  const canvasJS = document.getElementById('canvas2');
  const contextJS = canvasJS.getContext('2d');

  // load image from data url
  const imageObj = new Image();
  imageObj.onload = function () {

    const imgDataWA = contextWA.getImageData(0, 0, canvasWA.width, canvasWA.height);
    const imgDataJS = contextJS.getImageData(0, 0, canvasJS.width, canvasJS.height);

    const pixel_size = 0.005;
    const x0 = -2.0;
    const y0 = -1.0;

    // render by WA
    let bufferLength = canvasWA.width * canvasWA.height * 4;
    let mPtr = module.alloc(bufferLength);
    console.time('Web Assembly');
    let buffer = new Uint8ClampedArray(module.memory.buffer, mPtr, bufferLength);
    renderByWA(module, buffer, canvasWA, pixel_size, x0, y0);
    imgDataWA.data.set(buffer);
    contextWA.putImageData(imgDataWA, 0, 0);
    console.timeEnd('Web Assembly');
    module.dealloc(mPtr, bufferLength);

    const sab = new SharedArrayBuffer(1024);
    const params = {buffer, sab, canvas: {width: canvasWA.width, height: canvasWA.height}};
    let worker = new WAWorker();
    worker.addEventListener('message', function (e) {

      console.log(sab[0]);
    });
    worker.postMessage(params);


    // render by JS
    /*let bufSize = canvasJS.width * canvasJS.height * 4;
    let jsBuffer = new Uint8ClampedArray(bufSize);
    console.time('Javascript');
    renderByJS(jsBuffer, canvasJS.width, canvasJS.height, pixel_size, x0, y0);
    imgDataJS.data.set(jsBuffer);
    contextJS.putImageData(imgDataJS, 0, 0);
    console.timeEnd('Javascript');*/
  };

  imageObj.src = dataURL;
}

fetch('hello.wasm')
  .then(response => response.arrayBuffer())
  .then(bytes => WebAssembly.instantiate(bytes, {
    env: {
      memoryBase: 0,
      tableBase: 0,
      memory: new WebAssembly.Memory({
        initial: 256,
      }),
      table: new WebAssembly.Table({
        initial: 0,
        element: 'anyfunc'
      })
    }
  }))
  .then(results => {
    console.log(results.module);
    return results.instance;
  })
  .then(instance => {
    const module = instance.exports;
    const str = "hello";
    const mutatedStr = mutateString(module, str);
    console.log(`mutated string: ${mutatedStr}`);
    loadCanvas('./images.jpeg', module);
  });


function mutateString(module, str) {
  const ptr = newString(module, str, str.length);
  module.mutate_pointer(ptr, str.length);
  const buffer = new Uint8Array(getValue(module, ptr, str.length));
  module.dealloc_str(ptr);
  const utf8Decoder = new TextDecoder("UTF-8");
  return utf8Decoder.decode(buffer);
}

function newString(module, str) {
  const utf8Encoder = new TextEncoder("UTF-8");
  let buffer = utf8Encoder.encode(str);
  let len = buffer.length;
  let ptr = module.alloc(len + 1);
  let memory = new Uint8Array(module.memory.buffer);
  for (let i = 0; i < len; i++) {
    memory[ptr + i] = buffer[i]
  }
  memory[ptr + len] = 0;
  return ptr
}

function newArray(module, data) {
  let len = data.length;
  let ptr = module.alloc(len + 1);
  let memory = new Uint8Array(module.memory.buffer);
  for (let i = 0; i < len; i++) {
    memory[ptr + i] = data[i]
  }
  memory[ptr + len] = 0;
  return ptr
}

function* getValue(module, ptr, size = 1) {
  let memory = new Uint8Array(module.memory.buffer);
  let i = ptr;
  let limit = ptr + size;
  while (i < limit) {
    if (memory[ptr] === undefined) {
      throw new Error("Tried to read undef mem")
    }
    yield memory[i];
    i += 1
  }
}
