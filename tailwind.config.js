const {colors} = require('@app/assets/colors.config');
const {Platform} = require('react-native');

module.exports = {
  purge: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pink200: colors.secondaryLight,
        pink500: colors.secondary,
        purple500: colors.primary,
        purple200: colors.primaryLight,
        gray500: colors.textPrimary,
        gray300: colors.gray,
        gray200: colors.textGray,
        yellow200: colors.yellow,
      },
      borderRadius: {
        xl: '1rem',
      },
    },
    fontFamily: {
      mono: [Platform.OS === 'android' ? 'Nicomoji' : 'NicoMoji+'],
    },
  },
};
