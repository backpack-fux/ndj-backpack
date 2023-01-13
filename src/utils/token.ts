import {DEFAULT_COINS} from '@app/constants/coins';
import {Token} from '@app/models/coinTypes';

export const getNativeToken = (token: Token) => {
  const nativeToken = DEFAULT_COINS.find(
    coin => coin.contractAddress === token.network,
  );

  return nativeToken;
};
