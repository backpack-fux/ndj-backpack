import {RootState} from '@app/models';
import {createSelector} from 'reselect';

const getCoinState = (state: RootState) => state.coins;

export const tokensSelector = createSelector(
  getCoinState,
  state => state.tokens,
);

export const tokenSelector = createSelector(getCoinState, state => state.token);

export const isLoadingTokensSelector = createSelector(
  getCoinState,
  state => state.isLoadingTokens,
);

export const accountCoinsSelector = createSelector(
  getCoinState,
  state => state.accountCoins,
);

export const searchedCoinsSelector = createSelector(
  getCoinState,
  state => state.searchedCoins,
);

export const isSearchingCoinsSelector = createSelector(
  getCoinState,
  state => state.isSearchingCoins,
);

export const sendTokenSelector = createSelector(
  getCoinState,
  state => state.sendTokenInfo.token,
);

export const sendTokenInfoSelector = createSelector(
  getCoinState,
  state => state.sendTokenInfo,
);

export const transactionsSelector = createSelector(
  getCoinState,
  state => state.transactions,
);

export const isLoadingTransactionsSelector = createSelector(
  getCoinState,
  state => state.isLoadingTransactions,
);
