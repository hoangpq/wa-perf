import RenderWorker from './renderer.worker';

const wasmCacheVersion = 1;

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

export function jsMultiFilter(data, width, filterType, mag, mult, adj) {
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
  /*return fetch(module)
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {
      env: waEnv,
    }))
    .then(results => {
      return results.instance;
    });*/
  return instantiateCachedURL(wasmCacheVersion, module, {env: waEnv});
}

// This library function fetches the wasm Module at 'url', instantiates it with
// the given 'importObject', and returns a Promise resolving to the finished
// wasm Instance. Additionally, the function attempts to cache the compiled wasm
// Module in IndexedDB using 'url' as the key. The entire site's wasm cache (not
// just the given URL) is versioned by dbVersion and any change in dbVersion on
// any call to instantiateCachedURL() will conservatively clear out the entire
// cache to avoid stale modules.
export function instantiateCachedURL(dbVersion, url, importObject) {
  const dbName = 'wasm-cache';
  const storeName = 'wasm';

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = reject.bind(null, 'Error opening wasm cache database');
      request.onsuccess = () => {
        resolve(request.result)
      };
      request.onupgradeneeded = event => {
        const db = request.result;
        if (db.objectStoreNames.contains(storeName)) {
          console.log(`Clearing out version ${event.oldVersion} wasm cache`);
          db.deleteObjectStore(storeName);
        }
        console.log(`Creating version ${event.newVersion} wasm cache`);
        db.createObjectStore(storeName)
      };
    });
  }

  // This helper function Promise-ifies the operation of looking up 'url' in the
  // given IDBDatabase.
  function lookupInDatabase(db) {
    return new Promise((resolve, reject) => {
      const store = db.transaction([storeName]).objectStore(storeName);
      const request = store.get(url);
      request.onerror = reject.bind(null, `Error getting wasm module ${url}`);
      request.onsuccess = event => {
        if (request.result)
          resolve(request.result);
        else
          reject(`Module ${url} was not found in wasm cache`);
      }
    });
  }

  // This helper function fires off an async operation to store the given wasm
  // Module in the given IDBDatabase.
  function storeInDatabase(db, module) {
    const store = db.transaction([storeName], 'readwrite').objectStore(storeName);
    const request = store.put(module, url);
    request.onerror = err => {
      console.log(`Failed to store in wasm cache: ${err}`)
    };
    request.onsuccess = err => {
      console.log(`Successfully stored ${url} in wasm cache`)
    };
  }

  // This helper function fetches 'url', compiles it into a Module,
  // instantiates the Module with the given import object.
  function fetchAndInstantiate() {
    return fetch(url).then(response =>
      response.arrayBuffer()
    ).then(buffer =>
      WebAssembly.instantiate(buffer, importObject)
    )
  }

  // With all the Promise helper functions defined, we can now express the core
  // logic of an IndexedDB cache lookup. We start by trying to open a database.
  return openDatabase().then(db => {
      // Now see if we already have a compiled Module with key 'url' in 'db':
      return lookupInDatabase(db).then(module => {
        // We do! Instantiate it with the given import object.
        console.log(`Found ${url} in wasm cache`);
        return WebAssembly.instantiate(module, importObject);
      }, errMsg => {
        // Nope! Compile from scratch and then store the compiled Module in 'db'
        // with key 'url' for next time.
        console.log(errMsg);
        return fetchAndInstantiate().then(results => {
          storeInDatabase(db, results.module);
          return results.instance;
        });
      })
    },
    errMsg => {
      // If opening the database failed (due to permissions or quota), fall back
      // to simply fetching and compiling the module and don't try to store the
      // results.
      console.log(errMsg);
      return fetchAndInstantiate().then(results =>
        results.instance
      );
    });

}
