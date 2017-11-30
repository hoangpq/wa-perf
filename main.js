function fibonacci(x) {
    if (x <= 2) {
        return 1;
    } else {
        return fibonacci(x - 1) + fibonacci(x - 2);
    }
}

const input = 40;
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
    });
