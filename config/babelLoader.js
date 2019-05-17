const { supportedBrowsers } = require('./supportedBrowsers');

exports.babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [['@babel/preset-env', { targets: supportedBrowsers }]]
  }
};
