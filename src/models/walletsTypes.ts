import {NetworkName} from '@app/constants';

export enum WalletsActionType {
  INIT_STORE = 'persist/REHYDRATE',
  RELOAD = 'RELOAD',
  LOADING = 'LOADING',
  SET_MNEMONIC = 'wallets/MNEMONIC',
  CREATE_WALLET = 'wallets/CREATE_WALLET',
  ADD_WALLET = 'wallets/ADD_WALLET',
  DELETE_WALLET = 'wallets/DELETE_WALLET',
  SET_WALLETS = 'wallets/SET_WALLETS',
  SELECT_WALLET = 'WALLETS/SELECT_WALLET',
  SET_WALLET_SESSIONS = 'WALLETS/SET_WALLET_SESSIONS',
  SET_CURRENCY = 'WALLETS/SET_CURRENCY',
  REFRESH_WALLETS = 'WALLETS/REFRESH_WALLETS',
  SWITCH_NETWORK = 'WALLETS/SWITCH_NETWORK',
}

export interface Wallet {
  id: string;
  name: string;
  mnemonic: string;
  wallets: WalletKeys[];
  network?: NetworkName;
}

export type WalletKeys = {
  network: NetworkName;
  address: string;
  privateKey: string;
  ensInfo?: ENSInfo;
};

export interface ENSInfo {
  name: string;
  avatar?: string | null;
}
