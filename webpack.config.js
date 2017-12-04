const path = require('path');

module.exports = {
  'devtool': 'eval-source-map',
  entry: [
    'babel-polyfill',
    './app/main.js',
  ],
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
      },
      {
        test: /\.scss/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'},
          {loader: 'sass-loader'},
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'app'),
    compress: true,
    port: 9090,
    inline: true,
  }
};
