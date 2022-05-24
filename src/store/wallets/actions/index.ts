// model
import {NetworkName} from '@app/constants';
import {ActionType, Wallet} from '@app/models';

export const setLoading = (payload: boolean) => {
  return {
    type: ActionType.LOADING,
    payload,
  };
};

export const setMnemonic = (payload: string) => {
  return {
    type: ActionType.SET_MNEMONIC,
    payload,
  };
};

export const createWallet = (payload: {
  mnemonic: string;
  name?: string;
  network?: NetworkName;
}) => {
  return {
    type: ActionType.CREATE_WALLET,
    payload,
  };
};

export const addWallet = (payload: Wallet) => {
  return {
    type: ActionType.ADD_WALLET,
    payload,
  };
};

export const deleteWallet = (payload: Wallet) => {
  return {
    type: ActionType.DELETE_WALLET,
    payload,
  };
};

export const selectWallet = (payload: Wallet) => {
  return {
    type: ActionType.SELECT_WALLET,
    payload,
  };
};

export const setWallets = (payload: Wallet[]) => {
  return {
    type: ActionType.SET_WALLETS,
    payload,
  };
};

export const setWalletSession = (payload: {[id: string]: string[]}) => {
  return {
    type: ActionType.SET_WALLET_SESSIONS,
    payload,
  };
};

export const setCurrency = (payload: string) => {
  return {
    type: ActionType.SET_CURRENCY,
    payload,
  };
};

export const refreshWallets = () => {
  return {
    type: ActionType.REFRESH_WALLETS,
  };
};
