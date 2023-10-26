import {RootState} from '@app/models';

export const migrations: any = {
  0: (state: RootState): RootState => ({
    ...state,
  }),
  1: (state: RootState): RootState => ({
    ...state,
    coins: {
      ...state.coins,
      accountCoins: state.coins.accountCoins?.map(coin => {
        if (
          coin.contractAddress !== '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
        ) {
          return coin;
        }

        return {
          ...coin,
          name: 'USD Coin (PoS)',
          symbol: 'usdc.e',
        };
      }),
    },
  }),
};
