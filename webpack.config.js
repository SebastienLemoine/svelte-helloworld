const webpack = require("webpack");
const pkg = require("./package.json");
const path = require("path");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { supportedBrowsers } = require("./config/supportedBrowsers");
const { babelLoader } = require("./config/babelLoader");
const autoprefixer = require("autoprefixer");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const sass = require('node-sass');

let libraryName = pkg.name;
console.log("library: ", libraryName);

const mode = process.env.NODE_ENV || "development";
console.log("mode: ", mode);
const isDev = mode === "development";

module.exports = {
  mode,
  entry: {
    hello: [path.resolve(__dirname, "components/Hello.svelte")],
    test: [path.resolve(__dirname, "src/index.js")]
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "[name].js",
    chunkFilename: "[name].[id].js",
    library: libraryName,
    libraryTarget: "amd",
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.svelte$/,
            use: [
              babelLoader,
              {
                loader: "svelte-loader",
                options: {
                  emitCss: false,
                  legacy: true,
                  preprocess: {
                    style: ({ content, attributes }) => {
                      if (attributes.type !== "text/scss") return;
                      return new Promise((fulfil, reject) => {
                        sass.render(
                          {
                            data: content,
                            includePaths: ["src"],
                            sourceMap: true,
                            outFile: "x"
                          },
                          (err, result) => {
                            if (err) return reject(err);
                            fulfil({
                              code: result.css.toString(),
                              map: result.map.toString()
                            });
                          }
                        );
                      });
                    }
                  }
                }
              }
            ]
          },
          {
            test: /\.m?js$/,
            exclude: /node_modules\/(?!svelte)/,
            use: babelLoader
          },

          {
            test: /\.s?css$/,
            use: [
              isDev ? "style-loader" : MiniCssExtractPlugin.loader,
              {
                loader: "css-loader",
                options: {
                  importLoaders: 1
                }
              },
              {
                loader: "postcss-loader",
                options: {
                  ident: "postcss",
                  plugins: () =>
                    [
                      require("postcss-flexbugs-fixes"),
                      autoprefixer({
                        flexbox: "no-2009",
                        browsers: supportedBrowsers
                      }),
                      !isDev && require("cssnano")({ preset: "default" })
                    ].filter(Boolean)
                }
              },
              {
                loader: "sass-loader"
              }
            ]
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: false
    }),
    new FriendlyErrorsWebpackPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development"
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./src/index.html"),
      inject: true,
      minify: isDev
        ? undefined
        : {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true
          }
    }),
    new MiniCssExtractPlugin({
      filename: libraryName + ".css"
    })
  ],
  devServer: {
    port: 7000,
    contentBase: path.resolve(__dirname, "public"),
    historyApiFallback: true,
    inline: true,
    open: false,
    hot: true
  },
  devtool: "eval-source-map"
};
