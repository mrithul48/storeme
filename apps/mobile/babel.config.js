const path = require('path');
const mobileNodeModules = path.resolve(__dirname, 'node_modules');

if (!process.env.NODE_PATH) {
  process.env.NODE_PATH = mobileNodeModules;
} else if (!process.env.NODE_PATH.includes(mobileNodeModules)) {
  process.env.NODE_PATH = `${mobileNodeModules}${path.delimiter}${process.env.NODE_PATH}`;
}
require('module').Module._initPaths();

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};

