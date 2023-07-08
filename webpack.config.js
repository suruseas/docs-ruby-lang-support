const path = require('path');

module.exports = {
  mode: 'development',

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
