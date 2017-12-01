function fibonacci(x) {
  if (x <= 2) {
    return 1;
  } else {
    return fibonacci(x - 1) + fibonacci(x - 2);
  }
}

function loadCanvas(dataURL) {
  const canvas = document.getElementById('myCanvas');
  const context = canvas.getContext('2d');
  // load image from data url
  const imageObj = new Image();
  imageObj.onload = function () {
    context.drawImage(this, 0, 0);
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    console.log(imgData);
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


const Module = {};
fetch('hello.wasm')
  .then(response => response.arrayBuffer())
  .then(bytes => WebAssembly.instantiate(bytes, {
    'env': {}
  }))
  .then(results => {
    console.time('JS Execution');
    console.log(fibonacci(input));
    console.timeEnd('JS Execution');
    // console.log(results.instance.exports.get_number(10));
    console.time('Rust Execution');
    console.log(results.instance.exports.fibonacci(input));
    console.timeEnd('Rust Execution');
    loadCanvas('./images.jpeg');
    console.log(results.instance.exports.get_array_data([1, 2, 4]));
  });
