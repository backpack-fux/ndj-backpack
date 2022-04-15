/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const extraNodeModules = require('node-libs-browser');
const defaultSourceExts =
  require('metro-config/src/defaults/defaults').sourceExts;

const defaultAssetExts =
  require('metro-config/src/defaults/defaults').assetExts;

module.exports = {
  resolver: {
    assetExts: defaultAssetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultSourceExts, 'cjs', 'svg'],
    extraNodeModules,
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
