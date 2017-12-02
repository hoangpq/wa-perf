const wrap = require('./wasm/wrap');

function fibonacci(x) {
  if (x <= 2) {
    return 1;
  } else {
    return fibonacci(x - 1) + fibonacci(x - 2);
  }
}

function createUint8Array(data) {
  const buffer = new ArrayBuffer(data.length);
  const array = new Uint8Array(buffer);
  array.set(data, 0);
  return array;
}

function processingData(data) {
  let pixels = [];
  const limit = 8000;
  const total = Math.round(data.length / limit) + 1;
  for (let i = 0; i < total; i++) {
    let start = i * limit;
    let end = (i + 1) * limit;
    if (i === total - 1) {
      // the last page
      end = data.length;
    }
    const result = get_array_data(createUint8Array(data.slice(start, end)));
    pixels = pixels.concat(...result);
  }
  return pixels;
}


function loadCanvas(dataURL) {
  const canvas = document.getElementById('myCanvas');
  const context = canvas.getContext('2d');
  // load image from data url
  const imageObj = new Image();
  imageObj.onload = function () {
    context.drawImage(this, 0, 0);
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    // const a = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    // const result = get_array_data(a);
    // console.log(result);
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = 255 - imgData.data[i];
      imgData.data[i + 1] = 255 - imgData.data[i + 1];
      imgData.data[i + 2] = 255 - imgData.data[i + 2];
      imgData.data[i + 3] = 255;
    }
    context.putImageData(imgData, 0, 0);
  };
  imageObj.src = dataURL;
}

const input = 40;

fetch('hello.wasm')
  .then(response => response.arrayBuffer())
  .then(bytes => WebAssembly.instantiate(bytes, {
    env: {
      memoryBase: 0,
      tableBase: 0,
      memory: new WebAssembly.Memory({
        initial: 4096
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
    // console.time('JS Execution');
    // console.log(fibonacci(input));
    // console.timeEnd('JS Execution');
    // console.time('Rust Execution');
    // console.log(instance.exports.fibonacci(input));
    // console.timeEnd('Rust Execution');

    const data = [1, 2, 3];
    const ptr = instance.exports.alloc(data.length + 1);
    const buffer = new ArrayBuffer(16777216);
    const heap = new Int8Array(buffer);
    heap.set(data, ptr);

    console.log(heap);


    function getValue(ptr, type, noSafe) {
      type = type || 'i8';
      if (type.charAt(type.length - 1) === '*') type = 'i32'; // pointers are 32-bit
      switch (type) {
        case 'i8':
          return heap[((ptr) >> 0)];
        default:
          console.log(`Runtime error`);
          return null;
      }
    }


    // const mutate_array = wrap(instance.exports, 'mutate_array', ['()', '()'], "Vec<u8>");
    // console.log(mutate_array(ptr, data.length));

    console.log(instance.exports.mutate_array(ptr, data.length));

    let buf = [];
    for (let i = 0; i < data.length; i++) {
      buf.push(getValue(ptr + i));
    }
    console.log(buf); // [ 2, 3, 4 ]

    window.memory = instance.exports.memory;
    window.get_array_data = wrap(instance.exports, "get_array_data", ["&[u8]"], "Vec<u8>");
    loadCanvas('./images.jpeg');
  });



