const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',

  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { url: false }
          }
        ]
      }
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],

  entry: {
    content: "./src/content.js"
  },

  experiments: {
    topLevelAwait: true
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, 'dist'),
  },
};
