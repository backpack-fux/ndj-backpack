import {Action, Wallet} from '@app/models';
import {WalletsReducerType} from '../walletsReducer';
import _ from 'lodash';
import {WalletService} from '@app/services';

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
    walletId: state.walletId || payload.id,
  };
}

export function selectWalletReducer(
  state: WalletsReducerType,
  {payload}: Action<Wallet>,
) {
  return {
    ...state,
    walletId: payload.id,
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
  let selectedWalletId = state.walletId;

  const index = wallets.findIndex(w => w.id === payload.id);

  if (index > -1) {
    wallets.splice(index, 1);
  }

  if (selectedWalletId === payload.id) {
    selectedWalletId = wallets[0]?.id;
  }

  return {
    ...state,
    wallets: [...wallets],
    walletId: selectedWalletId,
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

export function switchNetworkReducer(
  state: WalletsReducerType,
  {payload}: Action<'mainnet' | 'testnet'>,
) {
  WalletService.switchNetwork(payload);
  for (const wallet of state.wallets) {
    for (const walletItem of wallet.wallets) {
      walletItem.setIsTestNet(payload === 'testnet');
    }
  }
  return {
    ...state,
    network: payload,
  };
}

export function setReadyReducer(state: WalletsReducerType) {
  return {
    ...state,
    ready: true,
  };
}

export function renameWalletReducer(
  state: WalletsReducerType,
  {payload}: Action<{id: string; name: string}>,
) {
  const wallets = [...state.wallets];
  const wallet = wallets.find(w => w.id === payload.id);
  if (wallet) {
    wallet.name = payload.name;
  }

  return {
    ...state,
    wallets,
  };
}
