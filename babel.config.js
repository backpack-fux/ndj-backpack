const path = require('path');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        resolvePath(sourcePath, currentFile, opts) {
          if (
            sourcePath === 'react-native' &&
            currentFile.includes('node_modules') &&
            currentFile.includes('@react-navigation') === false &&
            currentFile.includes('react-native-threads') === false &&
            currentFile.includes('react-native-url-polyfill') === false &&
            currentFile.includes('react-native-permissions') === false &&
            currentFile.includes('react-native-randombytes') === false &&
            currentFile.includes('react-native') === false &&
            currentFile.includes('asyncstorage-down') === false &&
            currentFile.includes('react-redux') === false &&
            currentFile.includes('rn-qr-generator') === false &&
            currentFile.includes('react-native-haptic-feedback') === false &&
            currentFile.includes('react-native-snap-carousel') === false &&
            currentFile.includes('react-native-snap-carousel') === false &&
            currentFile.includes('react-native-camera') === false &&
            currentFile.includes(
              '@react-native-async-storage/async-storage',
            ) === false &&
            currentFile.includes('node_modules\\react-native\\') === false
          ) {
            return path.resolve(__dirname, 'resolver/react-native');
          }
          /**
           * The `opts` argument is the options object that is passed through the Babel config.
           * opts = {
           *   extensions: [".js"],
           *   resolvePath: ...,
           * }
           */
          return undefined;
        },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
