const path = require('path');

module.exports = {
  mode: 'production',

  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { url: false }
          }
        ]
      }
    ]
  },

  entry: {
    index: "./src/index.js",
    content: "./src/content.js"
  },

  experiments: {
    topLevelAwait: true
  },

  output: {
    filename: "[name].umd.js",
    path: path.resolve(__dirname, 'dist'),
  },
};
