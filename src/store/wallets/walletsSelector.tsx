import {RootState} from '@app/models';
import {createSelector} from 'reselect';

const getLoading = (state: RootState) => state.wallets.loading;
const getMnemonic = (state: RootState) => state.wallets.mnemonic;
const getSelectedWallet = (state: RootState) =>
  state.wallets.wallets.find(w => w.id === state.wallets.walletId);
const getWallets = (state: RootState) => state.wallets.wallets;
const getWalletSessions = (state: RootState) => state.wallets.walletSessions;
const getCurrency = (state: RootState) => state.wallets.currency;
const getNetwork = (state: RootState) => state.wallets.network;
const getAppReady = (state: RootState) => state.wallets.ready;
const getSpendWallet = (state: RootState) =>
  state.wallets.wallets.find(w => w.id === 'spend');
const getIsReady = (state: RootState) => state.wallets.ready;
const getIsReadFieldGuide = (state: RootState) =>
  state.wallets.isReadFieldGuide;

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

export const spendWalletSelector = createSelector(
  getSpendWallet,
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

export const appReadySelector = createSelector(getAppReady, ready => ready);

export const networkSelector = createSelector(getNetwork, network => network);

export const walletsSelector = createSelector(getWallets, wallets => wallets);

export const isReadySelector = createSelector(getIsReady, isReady => isReady);
export const isReadFieldGuideSelector = createSelector(
  getIsReadFieldGuide,
  select => select,
);
