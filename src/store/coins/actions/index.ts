// model
import {
  ActionType,
  BaseCoin,
  ITransaction,
  SendTokenInfo,
  Token,
} from '@app/models';

export const setAccountCoins = (payload: BaseCoin[]) => {
  return {
    type: ActionType.SET_ACCOUNT_COINS,
    payload,
  };
};

export const addAccountCoin = (payload: {
  account: string;
  coins: BaseCoin[];
}) => {
  return {
    type: ActionType.ADD_ACCOUNT_COIN,
    payload,
  };
};

export const toggleAccountCoin = (payload: {
  coin: BaseCoin;
  enabled: boolean;
}) => {
  return {
    type: ActionType.TOGGLE_ACCOUNT_COIN,
    payload,
  };
};

export const setIsLoadingTokens = (payload: boolean) => {
  return {
    type: ActionType.SET_IS_LOADING_TOKENS,
    payload,
  };
};

export const setTokens = (payload: {account: string; tokens: Token[]}) => {
  return {
    type: ActionType.SET_TOKENS,
    payload,
  };
};

export const setToken = (payload: Token | BaseCoin) => {
  return {
    type: ActionType.SET_TOKEN,
    payload,
  };
};

export const searchCoinsRequest = (payload: string) => {
  return {
    type: ActionType.SEARCH_COINS_REQUEST,
    payload,
  };
};

export const searchCoinsResponse = (payload: BaseCoin[]) => {
  return {
    type: ActionType.SEARCH_COINS_RESPONSE,
    payload,
  };
};

export const selectSendToken = (payload: BaseCoin) => {
  return {
    type: ActionType.SELECT_SEND_TOKEN,
    payload,
  };
};

export const setSendTokenLoading = (payload: boolean) => {
  return {
    type: ActionType.SET_SEND_TOKEN_LOADING,
    payload,
  };
};

export const updateSendTokenInfo = (payload: SendTokenInfo) => {
  return {
    type: ActionType.UPDATE_SEND_TOKEN_INFO,
    payload,
  };
};

export const getTransferTransaction = () => {
  return {
    type: ActionType.GET_TRANSFER_TRANSACTION,
  };
};

export const transferTokenRequest = () => {
  return {
    type: ActionType.TRANSFER_TOKEN_REQUEST,
  };
};

export const transferTokenSuccess = () => {
  return {
    type: ActionType.TRANSFER_TOKEN_SUCCESS,
  };
};

export const getTransactions = (payload: {
  token: BaseCoin;
  page: number;
  limit: number;
}) => {
  return {
    type: ActionType.GET_TRANSACTIONS_REQUEST,
    payload,
  };
};

export const getTransactionsSuccess = (payload: {
  transactions: ITransaction[];
  page: number;
}) => {
  return {
    type: ActionType.GET_TRANSACTIONS_SUCCESS,
    payload,
  };
};

export const getTransactionsFailed = (payload: string) => {
  return {
    type: ActionType.GET_TRANSACTIONS_FAILED,
    payload,
  };
};
