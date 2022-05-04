import {colors} from '@app/assets/colors.config';
import {Dimensions} from 'react-native';

export * from './abis';
export * from './enums';
export * from './networkList';

let width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;

let narrowScreenSide = width <= height ? width : height;
let broadScreenSide = width > height ? width : height;

export const SQUARE_DIMENSIONS = {
  WIDTH: narrowScreenSide,
  HEIGHT: broadScreenSide,
  BLUE_INPUT_WIDTH: narrowScreenSide * 0.56,
  ICON_PADDING_FROM_WHEEL: broadScreenSide * 0.01,
};

export const menuSize = SQUARE_DIMENSIONS.WIDTH * 0.74;
export const menuIconSize = SQUARE_DIMENSIONS.WIDTH * 0.09;
export const menuIconRadius = menuSize / 2 + menuIconSize / 2 + 0;
export const menuHeight =
  menuSize + menuIconRadius - menuSize / 2 + menuIconSize;

export const borderWidth = 1;
export const ETHERSCAN = {
  mainnet: 'https://api.etherscan.io/api',
  ropsten: 'https://api-ropsten.etherscan.io/api/',
  rinkeby: 'https://api-rinkeby.etherscan.io/api/',
  kovan: 'https://api-kovan.etherscan.io/api/',
};

export const POLYGONSCAN = {
  mainnet: 'https://api.polygonscan.com/api',
  testnet: 'https://api-testnet.polygonscan.com/api',
};

export const BSCSCAN = {
  mainnet: 'https://api.bscscan.com//api',
  testnet: 'https://api-testnet.bscscan.com/api',
};

export const BNBAPI = {
  testnet: 'https://testnet-dex.binance.org/',
  mainnet: 'https://dex.binance.org/',
};

export const autoLockList = [
  {value: 0, label: 'Immediate'},
  {value: 1, label: 'If away for 1 minute'},
  {value: 5, label: 'If away for 5 minutes'},
  {value: 60, label: 'If away for 1 hour'},
  {value: 300, label: 'If away for 5 hours'},
];

export const shadow = {
  shadowColor: colors.secondary,
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowOpacity: 1,
  shadowRadius: 6,

  elevation: 6,
};
