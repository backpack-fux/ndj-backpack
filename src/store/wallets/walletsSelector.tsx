import {RootState} from '@app/models';
import {createSelector} from 'reselect';

const getLoading = (state: RootState) => state.wallets.loading;
const getMnemonic = (state: RootState) => state.wallets.mnemonic;
const getSelectedWallet = (state: RootState) => state.wallets.selectedWallet;
const getWallets = (state: RootState) => state.wallets.wallets;
const getWalletSessions = (state: RootState) => state.wallets.walletSessions;
const getCurrency = (state: RootState) => state.wallets.currency;

export const walletsLoadingSelector = createSelector(
  getLoading,
  loading => loading,
);

export const mnemonicSelector = createSelector(
  getMnemonic,
  mnemonic => mnemonic,
);

export const selectedWalletSelector = createSelector(
  getSelectedWallet,
  wallet => wallet,
);

export const walletSessionsSelector = createSelector(
  getWalletSessions,
  sessions => sessions,
);

export const currencySelector = createSelector(
  getCurrency,
  currency => currency || 'usd',
);

export const walletsSelector = createSelector(getWallets, wallets => wallets);
