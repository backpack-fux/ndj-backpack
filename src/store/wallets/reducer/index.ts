import {Action, Wallet} from '@app/models';
import {WalletsReducerType} from '../walletsReducer';
import _ from 'lodash';

export function setLoadingReducer(
  state: WalletsReducerType,
  {payload}: Action<boolean>,
) {
  return {
    ...state,
    loading: payload,
  };
}

export function setMnemonicReducer(
  state: WalletsReducerType,
  {payload}: Action<string>,
) {
  return {
    ...state,
    mnemonic: payload,
  };
}

export function addWalletReducer(
  state: WalletsReducerType,
  {payload}: Action<Wallet>,
) {
  return {
    ...state,
    wallets: [...state.wallets, payload],
    selectedWallet: payload,
  };
}

export function selectWalletReducer(
  state: WalletsReducerType,
  {payload}: Action<Wallet>,
) {
  return {
    ...state,
    selectedWallet: payload,
  };
}

export function setWalletsReducer(
  state: WalletsReducerType,
  {payload}: Action<Wallet[]>,
) {
  return {
    ...state,
    wallets: payload,
  };
}

export function deleteWalletReducer(
  state: WalletsReducerType,
  {payload}: Action<Wallet>,
) {
  const wallets: Wallet[] = _.cloneDeep(state.wallets);
  let selectedWallet = state.selectedWallet;

  const index = wallets.findIndex(w => w.id === payload.id);

  if (index > -1) {
    wallets.splice(index, 1);
  }

  if (selectedWallet?.id === payload.id) {
    selectedWallet = wallets[0];
  }

  return {
    ...state,
    wallets: [...wallets],
    selectedWallet,
  };
}

export function setWalletSessionsReducer(
  state: WalletsReducerType,
  {payload}: Action<{[id: string]: string[]}>,
) {
  return {
    ...state,
    walletSessions: payload,
  };
}

export function setCurrencyReducer(
  state: WalletsReducerType,
  {payload}: Action<string>,
) {
  return {
    ...state,
    currency: payload,
  };
}
