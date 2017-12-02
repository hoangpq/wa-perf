const path = require('path');

module.exports = {
  entry: './main.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: 'babel-loader',
        include: [
          path.resolve(__dirname, 'wasm'),
        ]
      }
    ]
  }
};
