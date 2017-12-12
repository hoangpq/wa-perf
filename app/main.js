// global style
require('./style.scss');
import {initWA, renderByWorkers} from './utils';
import {renderByJS, renderByWA, processVideo} from './utils/mandelbrot';

const canvasWA = document.getElementById('canvas1');
const contextWA = canvasWA.getContext('2d');
const canvasJS = document.getElementById('canvas2');
const contextJS = canvasJS.getContext('2d');
const imgDataWA = contextWA.getImageData(0, 0, canvasWA.width, canvasWA.height);
const imgDataJS = contextJS.getImageData(0, 0, canvasJS.width, canvasJS.height);

const pixel_size = 0.005;
const x0 = -2.0;
const y0 = -1.0;

function loadCanvas(dataURL, module) {
  // load image from data url
  const imageObj = new Image();
  imageObj.onload = () => {
    // render by WA
    let length = canvasWA.width * canvasWA.height * 4;
    let mPtr = module.alloc(length);
    console.time('Web Assembly');
    let buffer = new Uint8ClampedArray(module.memory.buffer, mPtr, length);
    renderByWA(module, buffer, canvasWA, pixel_size, x0, y0);
    imgDataWA.data.set(buffer);
    contextWA.putImageData(imgDataWA, 0, 0);
    console.timeEnd('Web Assembly');
    module.dealloc(mPtr, length);
  };
  imageObj.src = dataURL;
}

function renderByJs() {
  // render by JS
  let bufSize = canvasJS.width * canvasJS.height * 4;
  let jsBuffer = new Uint8ClampedArray(bufSize);
  console.time('Javascript');
  renderByJS(jsBuffer, canvasJS.width, canvasJS.height, pixel_size, x0, y0);
  imgDataJS.data.set(jsBuffer);
  contextJS.putImageData(imgDataJS, 0, 0);
  console.timeEnd('Javascript');
}


/*console.time('Javascript');
renderByWorkers(imgDataJS, canvasJS, contextJS, () => {
  console.timeEnd('Javascript');
});*/

const waVideo = document.getElementById('waVideo');
const caVideo = document.getElementById('waCanvas');
const caContext = caVideo.getContext('2d');

let cw;

initWA('hello.wasm')
  .then(instance => {
    const module = instance.exports;
    // const str = "hello";
    // const mutatedStr = mutateString(module, str);
    // loadCanvas('./images.jpeg', module);
    // load video
    window.module = module;
    waVideo.onloadeddata = function () {
      caVideo.setAttribute('height', waVideo.videoHeight + 'px');
      caVideo.setAttribute('width', waVideo.videoWidth + 'px');
      cw = caVideo.clientWidth;
      draw();
    };
    waVideo.src = 'assets/vid.mp4';
  });

//to bind arguments in the right order
function bindLastArgs(func, ...boundArgs) {
  return function (...baseArgs) {
    return func(...baseArgs, ...boundArgs);
  }
}

let mag = 127, mult = 2, adj = 4;

// let sunset = bindLastArgs(window.module.multi_filter, 4, mag, mult, adj);

function grayScale(pixels, context) {
  const length = pixels.data.length;
  const module = window.module;
  let ptr = module.alloc(length);
  let buffer = new Uint8ClampedArray(module.memory.buffer, ptr, length);
  buffer.set(pixels.data);
  module.multi_filter(buffer.byteOffset, buffer.length);
  pixels.data.set(buffer);
  context.putImageData(pixels, 0, 0);
  module.dealloc(ptr, length);
}

function draw() {
  if (waVideo.paused) return false;
  caContext.drawImage(waVideo, 0, 0);
  let pixels = caContext.getImageData(0, 0, waVideo.videoWidth, waVideo.videoHeight);
  grayScale(pixels, caContext);
  requestAnimationFrame(draw);
}

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
