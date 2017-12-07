import RenderWorker from './renderer.worker';

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
