var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  entry: './demo/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './demo/dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, './demo/dist'),
    port: 4615,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.s?css$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader', // compiles Sass to CSS, using Node Sass by default
        ],
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin()]
};