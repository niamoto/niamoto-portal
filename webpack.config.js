const path = require('path');
const DashboardPlugin = require("webpack-dashboard/plugin");


module.exports = {
  mode: "production",
  entry: {
    "/data_shape/static/shape/js/": "./niamoto_portal/static/js/shape/main.js",
    "/data_plot/static/plot/js/": "./niamoto_portal/static/js/plot/main.js",
    "/data_taxon/static/taxon/js/": "./niamoto_portal/static/js/taxon/main.js",
  },
  output: {
    filename: "[name]main.min.js",
    path: path.resolve(__dirname, "apps")
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"]
        }
      }
    }, {
      test: /\.scss$/,
      use: [{
        loader: "style-loader" // creates style nodes from JS strings
      }, {
        loader: "css-loader" // translates CSS into CommonJS
      }, {
        loader: "sass-loader" // compiles Sass to CSS
      }]
    }]
  },
  plugins: [
    new DashboardPlugin()
  ]
};