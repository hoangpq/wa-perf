let worker = null;
if (window.Worker) {
  console.log(`Starting...`);
  worker = new Worker('worker/script.js');
  worker.onmessage = function (evt) {
    console.log(evt.data);
  }
}

function mandelbrotWorker(module, buffer, num_of_worker = 4) {
  for (let i = 0; i < num_of_worker; i++) {

  }
}
