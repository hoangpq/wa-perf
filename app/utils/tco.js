function fib(n) {
  function _fib(n, a, b) {
    if (n === 0) {
      return b;
    } else {
      return _fib(n - 1, a + b, a);
    }
  }

  return _fib(n, 1, 0)
}


console.time('fib');
let f = fib(1200);
console.timeEnd('fib');
console.log(f);


// the fibonacci sequence
// 1, 1, 2, 3, 5, 8, 13, 21 ...

// 5, 1, 0
// 4, 1, 1
// 3, 2, 1
// 2, 3, 2
// 1, 5, 3
// done -> 3


// fact tco
function fact(n) {
  function _fact(n, s = 1) {
    if (n === 0 || n === 1) {
      return s;
    } else {
      return _fact(n - 1, s * n);
    }
  }

  return _fact(n, 1);
}

let factor = fact(5);
console.log(factor);

// 5, 1
// 4, 1 * 5
// 3, 1 * 5 * 4
// 2, 1 * 5 * 4 * 3
// 1, 1 * 5 * 4 * 3 * 2

