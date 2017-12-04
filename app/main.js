// global style
require('./style.scss');
const wrap = require('../wasm/wrap');

function fibonacci(x) {
  if (x <= 2) {
    return 1;
  } else {
    return fibonacci(x - 1) + fibonacci(x - 2);
  }
}

function loadCanvas(dataURL, module) {
  const canvas = document.getElementById('myCanvas');
  const context = canvas.getContext('2d');
  // load image from data url
  const imageObj = new Image();
  imageObj.onload = function () {
    // context.drawImage(this, 0, 0);
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    // create buffer to hold data
    /*const ptr = newArray(module, data);
    module.filter(ptr, data.length);
    const uInt8 = new Uint8Array(getValue(module, ptr, data.length));
    for (let i = 0; i < data.length; i++) {
      imgData.data[i] = uInt8[i];
    }
    // dealloc pointer
    module.dealloc(ptr, data.length);*/

    // context.putImageData(imgData, 0, 0);
    /*for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = 255 - imgData.data[i];
      imgData.data[i + 1] = 255 - imgData.data[i + 1];
      imgData.data[i + 2] = 255 - imgData.data[i + 2];
      imgData.data[i + 3] = 255;
    }*/

    // create buffer
    let bufferLength = canvas.width * canvas.height * 4;
    let mPtr = module.alloc(bufferLength);
    let buffer = new Uint8ClampedArray(module.memory.buffer, mPtr, bufferLength);

    const pixel_size = 0.005;
    const x0 = -2.0;
    const y0 = -1.0;
    render(pixel_size, x0, y0);

    document.querySelector('#render-btn').addEventListener('click', function (e) {
      e.stopPropagation();
      const pixel_size = parseFloat(document.querySelector('#pixel_size').value);
      const x0 = parseFloat(document.querySelector('#x0').value);
      const y0 = parseFloat(document.querySelector('#y0').value);
      render(pixel_size, x0, y0);
    });

    function render(pixel_size, x0, y0) {
      module.mandelbrot(buffer.byteOffset, buffer.length, canvas.width, canvas.height, pixel_size, x0, y0);
      imgData.data.set(buffer);
      context.putImageData(imgData, 0, 0);
    }

    // module.dealloc(mPtr, bufferLength);
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
        maximum: 4096,
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
