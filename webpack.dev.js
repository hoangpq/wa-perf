const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  output: {
    publicPath: 'dist',
  },
  devServer: {
    contentBase: path.join(__dirname, 'app'),
    compress: true,
    port: 9090,
    inline: true,
  }
});
