// model
import {ActionType, Wallet} from '@app/models';
import {createReducer} from '@app/store/createReducer';
// redux
import {
  addWalletReducer,
  deleteWalletReducer,
  selectWalletReducer,
  setLoadingReducer,
  setMnemonicReducer,
  setWalletSessionsReducer,
  setCurrencyReducer,
  switchNetworkReducer,
} from './reducer';

export interface WalletsReducerType {
  loading: boolean;
  mnemonic?: string;
  wallets: Wallet[];
  walletId?: string;
  walletSessions: {[id: string]: string[]};
  currency: string;
  network: 'mainnet' | 'testnet';
}

export const defaultState: WalletsReducerType = {
  loading: false,
  wallets: [],
  walletSessions: {},
  currency: 'usd',
  network: 'mainnet',
};

export const walletsReducer = createReducer<WalletsReducerType>(defaultState, {
  [ActionType.LOADING]: setLoadingReducer,
  [ActionType.SET_MNEMONIC]: setMnemonicReducer,
  [ActionType.ADD_WALLET]: addWalletReducer,
  [ActionType.SELECT_WALLET]: selectWalletReducer,
  [ActionType.DELETE_WALLET]: deleteWalletReducer,
  [ActionType.SET_WALLET_SESSIONS]: setWalletSessionsReducer,
  [ActionType.SET_CURRENCY]: setCurrencyReducer,
  [ActionType.SWITCH_NETWORK]: switchNetworkReducer,
});
