import {colors} from '@app/assets/colors.config';

export * from './abis';
export * from './enums';
export * from './networkList';
export * from './scanApis';

export const borderWidth = 1;

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
