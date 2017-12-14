import RenderWorker from './renderer.worker';

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
    memory[ptr + i] = buffer[i];
  }
  memory[ptr + len] = 0;
  return ptr;
}

function newArray(module, data) {
  let len = data.length;
  let ptr = module.alloc(len + 1);
  let memory = new Uint8Array(module.memory.buffer);
  for (let i = 0; i < len; i++) {
    memory[ptr + i] = data[i];
  }
  memory[ptr + len] = 0;
  return ptr;
}

function* getValue(module, ptr, size = 1) {
  let memory = new Uint8Array(module.memory.buffer);
  let i = ptr;
  let limit = ptr + size;
  while (i < limit) {
    if (memory[ptr] === undefined) {
      throw new Error("Tried to read undef mem");
    }
    yield memory[i];
    i += 1;
  }
}

export function renderByWorkers(imgDataJS, canvasJS, contextJS, callback) {
  let bufSize = canvasJS.width * canvasJS.height * 4;
  const sharedBuffer = new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * bufSize);
  let jsBuffer = new Uint8ClampedArray(sharedBuffer);
  let completed = 0;
  let num_of_workers = 10;
  let range = canvasJS.width / num_of_workers;
  for (let i = 0; i < num_of_workers; i++) {
    let start = i * range;
    let end = (i + 1) * range;
    const renderWorker = new RenderWorker();
    renderWorker.addEventListener('message', () => {
      completed++;
      imgDataJS.data.set(jsBuffer);
      contextJS.putImageData(imgDataJS, 0, 0);
      renderWorker.terminate();
      if (completed === num_of_workers) {
        callback();
      }
    });
    renderWorker.postMessage({
      buffer: jsBuffer,
      canvas: {width: canvasJS.width, height: canvasJS.height},
      start,
      end,
    });
  }
}

export function jsMultiFilter(canvas, data, width, filterType, mag, mult, adj) {
  const length = data.length;
  let i = 0;
  while (i < length) {
    if (i % 4 !== 3) {
      let p1 = 0, p2 = 0;
      if (i + adj < length) {
        p1 = data[i + adj];
      }
      if (i + width * 4 < length) {
        p2 = data[i + width * 4];
      }
      data[i] = mag + mult * data[i] - p1 - p2;
    }
    i += filterType;
  }
}

const waEnv = {
  memoryBase: 0,
  tableBase: 0,
  memory: new WebAssembly.Memory({
    initial: 256,
    maximum: 4096,
  }),
  table: new WebAssembly.Table({
    initial: 0,
    element: 'anyfunc'
  }),
};

export function initWA(module) {
  return fetch(module)
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {
      env: waEnv,
    }))
    .then(results => {
      return results.instance;
    });
}
