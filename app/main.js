// global style
require('./style.scss');
import {initWA, jsMultiFilter, renderByWorkers} from './utils';
import {renderByJS, renderByWA} from './utils/mandelbrot';

// workers
const WaWorker = require('./utils/wasm.worker');

const waVideo = document.getElementById('waVideo');

const waCanvas = document.getElementById('waCanvas');
const waContext = waCanvas.getContext('2d');
const jsCanvas = document.getElementById('jsCanvas');
const jsContext = jsCanvas.getContext('2d');

const canvasWA = document.getElementById('canvas1');
const contextWA = canvasWA.getContext('2d');
const canvasJS = document.getElementById('canvas2');
const contextJS = canvasJS.getContext('2d');

const filterList = document.querySelectorAll('.filter-item');
const pixel_size = 0.005, x0 = -2.0, y0 = -1.0;
const mag = 127, mult = 2, adj = 4;
let cw, cw2, chart, selectedFilter = 'sunset',
  t0 = 0, t1 = 0, t2 = 0, t3 = 0;

function visualizeData() {
  const time = +new Date() * 200;
  const point = [time, t1 - t0];
  const point2 = [time, t3 - t2];
  let series = chart.series[0],
    shift = series.data.length > 20;
  chart.series[0].addPoint(point, true, shift);
  chart.series[1].addPoint(point2, true, shift);
  setTimeout(visualizeData, 200);
}

window.onload = function () {
  chart = new Highcharts.Chart({
    chart: {
      renderTo: 'chart',
      defaultSeriesType: 'spline',
    },
    title: {
      text: 'Performance (Lower is better)'
    },
    xAxis: {
      type: 'datetime',
      tickPixelInterval: 150,
      maxZoom: 20 * 1000
    },
    yAxis: {
      minPadding: 0.2,
      maxPadding: 0.2,
      title: {
        text: 'Time (ms)',
        margin: 80
      }
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: false
        }
      }
    },
    series: [{
      name: 'WA',
      data: [],
    }, {
      name: 'JS',
      data: [],
    }]
  });
  visualizeData();
};

function resetFilter() {
  filterList.forEach(function (item) {
    item['className'] = 'filter-item';
  });
}

function onFilterSelected(e) {
  e.stopPropagation();
  resetFilter();
  selectedFilter = e.target.getAttribute('data-filter');
  e.target.className = [e.target.className, 'filter-item-selected'].join(' ');
}

initWA('hello.wasm')
  .then(instance => {
    const module = instance.exports;
    // create some filter for web assembly
    window.module = module;
    window.sunset = bindLastArgs(module.multi_filter, 4, mag, mult, adj);
    window.analogtv = bindLastArgs(module.multi_filter, 7, mag, mult, adj);
    window.emboss = bindLastArgs(module.multi_filter, 1, mag, mult, adj);
    // create some filter for javascript
    window.jssunset = bindLastArgs(jsMultiFilter, 4, mag, mult, adj);
    window.jsanalogtv = bindLastArgs(jsMultiFilter, 7, mag, mult, adj);
    window.jsemboss = bindLastArgs(jsMultiFilter, 1, mag, mult, adj);

    // fire event when video loaded
    waVideo.addEventListener('loadeddata', function () {
      // init worker
      const waWorker = new WaWorker();
      waWorker.postMessage({});
      cw = waCanvas.clientWidth;
      cw2 = jsCanvas.clientWidth;
      // filter select event
      filterList.forEach(function (node) {
        node.addEventListener('click', onFilterSelected, false);
      });
      draw();
      // filter select event
      draw2();
    });
    waVideo.src = 'assets/vid.mp4';
    // waVideo.src = 'assets/nature.mp4';

    // render mandelbrot
    /*const img = new Image();
    img.onload = () => {
      // render by WA
      renderByWA(module, canvasWA, pixel_size, x0, y0);
      renderByJS(canvasJS, pixel_size, x0, y0);
    };
    img.src = './images.jpeg';*/

  });

//to bind arguments in the right order
function bindLastArgs(func, ...boundArgs) {
  return function (...baseArgs) {
    return func(...baseArgs, ...boundArgs);
  }
}

function processVideoJS(pixels, context) {
  window[`js${selectedFilter}`](pixels.data, cw);
  context.putImageData(pixels, 0, 0);
}

function processVideoWA(pixels, context) {
  const length = pixels.data.length;
  const module = window.module;
  let ptr = module.alloc(length);
  let buffer = new Uint8ClampedArray(module.memory.buffer, ptr, length);
  buffer.set(pixels.data);
  window[selectedFilter](buffer.byteOffset, buffer.length, cw);
  pixels.data.set(buffer);
  context.putImageData(pixels, 0, 0);
  module.dealloc(ptr, length);
}

function draw() {
  if (waVideo.paused) return false;
  t0 = performance.now();
  waContext.drawImage(waVideo, 0, 0);
  let pixels = waContext.getImageData(0, 0, waCanvas.width, waCanvas.height);
  processVideoWA(pixels, waContext);
  t1 = performance.now();
  requestAnimationFrame(draw);
}

function draw2() {
  if (waVideo.paused) return false;
  t2 = performance.now();
  jsContext.drawImage(waVideo, 0, 0);
  let pixels = jsContext.getImageData(0, 0, jsCanvas.width, jsCanvas.height);
  processVideoJS(pixels, jsContext);
  t3 = performance.now();
  requestAnimationFrame(draw2);
}
