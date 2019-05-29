const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const htmlWebpackPlugin = new HtmlWebpackPlugin({
  filename: './index.html',
  template: path.join(__dirname, 'demo/src/index.html'),
});

module.exports = {
  devServer: {
    port: 3001,
  },
  devtool: 'inline-source-map',
  entry: path.join(__dirname, 'demo/src/index.js'),
  mode: 'development',
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.(js|jsx)$/,
      use: 'babel-loader',
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    }],
  },
  plugins: [htmlWebpackPlugin],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
