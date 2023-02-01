import {
  Action,
  BaseCoin,
  ITransaction,
  SendTokenInfo,
  Token,
  Wallet,
} from '@app/models';
import moment from 'moment-timezone';
import {CoinsReducerType} from '../coinsReducer';
import * as _ from 'lodash';

export function setTokenReducer(
  state: CoinsReducerType,
  {payload}: Action<Token>,
) {
  return {
    ...state,
    token: payload,
    transactions: [],
  };
}

export function setTokensReducer(
  state: CoinsReducerType,
  {payload}: Action<{account: string; tokens: Token[]}>,
) {
  const tokens = state.tokens || {};
  tokens[payload.account] = payload.tokens;
  return {
    ...state,
    tokens,
  };
}

export function setAccountCoinsReducer(
  state: CoinsReducerType,
  {payload}: Action<Token[]>,
) {
  return {
    ...state,
    accountCoins: payload,
  };
}

export function toggleAccountCoinReducer(
  state: CoinsReducerType,
  {payload}: Action<{coin: BaseCoin; enabled: boolean}>,
) {
  const coins: BaseCoin[] = Object.assign([], state.accountCoins || []);

  const coin = coins.find(
    c => c.contractAddress === payload.coin.contractAddress,
  );

  if (coin) {
    coin.enabled = payload.enabled;
  } else {
    coins.push({
      ...payload.coin,
      enabled: payload.enabled,
    });
  }

  return {
    ...state,
    accountCoins: [...coins],
  };
}

export function searchCoinsRequestReducer(state: CoinsReducerType) {
  return {
    ...state,
    isSearchingCoins: true,
    searchedCoins: [],
  };
}

export function searchCoinsResponseReducer(
  state: CoinsReducerType,
  {payload}: Action<BaseCoin[]>,
) {
  return {
    ...state,
    searchedCoins: payload,
    isSearchingCoins: false,
  };
}

export function setIsLoadingTokensReducer(
  state: CoinsReducerType,
  {payload}: Action<boolean>,
) {
  return {
    ...state,
    isLoadingTokens: payload,
  };
}

export function updateSendTokenInfoReducer(
  state: CoinsReducerType,
  {payload}: Action<SendTokenInfo>,
) {
  return {
    ...state,
    sendTokenInfo: payload,
  };
}

export function setSendTokenLoadingReducer(
  state: CoinsReducerType,
  {payload}: Action<boolean>,
) {
  return {
    ...state,
    sendTokenInfo: {
      ...state.sendTokenInfo,
      isLoading: payload,
    },
  };
}

export function transferTokenSuccessReducer(state: CoinsReducerType) {
  return {
    ...state,
    sendTokenInfo: {
      ...state.sendTokenInfo,
      isSentSuccessFully: true,
      isLoading: false,
      fromAccount: undefined,
      toAccount: undefined,
      amount: undefined,
      amountUSD: undefined,
      fee: undefined,
      balance: undefined,
      transaction: undefined,
      status: undefined,
      date: undefined,
      isSendMax: undefined,
    },
  };
}

export function transferTokenFailedReducer(state: CoinsReducerType) {
  return {
    ...state,
    sendTokenInfo: {
      ...state.sendTokenInfo,
      status: 'failed',
    },
  };
}

export function getTransactionsRequestReducer(
  state: CoinsReducerType,
  {payload}: Action<{token: BaseCoin; page: number; limit: number}>,
) {
  const transactions = payload.page === 1 ? [] : state.transactions;
  return {
    ...state,
    isLoadingTransactions: true,
    isTransactionReached: false,
    transactions: [...transactions],
  };
}

export function getTransactionsSuccessReducer(
  state: CoinsReducerType,
  {payload}: Action<{transactions: ITransaction[]; page: number}>,
) {
  const transactions =
    payload.page === 1
      ? payload.transactions
      : [...state.transactions, ...payload.transactions];
  const isReached = payload.transactions.length === 0;
  return {
    ...state,
    isLoadingTransactions: false,
    isTransactionReached: isReached,
    transactions: [...transactions],
  };
}

export function getTransactionsFailedReducer(state: CoinsReducerType) {
  return {
    ...state,
    isLoadingTransactions: false,
  };
}

export function deleteTokensFromWalletReducer(
  state: CoinsReducerType,
  {payload}: Action<Wallet>,
) {
  const tokens = {
    ...state.tokens,
  };

  delete tokens[payload.id];
  return {
    ...state,
    tokens,
  };
}

export function getBaseTokenReducer(state: CoinsReducerType) {
  return {
    ...state,
    isLoadingGetBaseCoin: true,
  };
}

export function getBaseTokenSuccessReducer(
  state: CoinsReducerType,
  {payload}: Action<boolean>,
) {
  return {
    ...state,
    isLoadingGetBaseCoin: false,
    baseCoinExpiresAt: payload
      ? moment().add(1, 'week').toDate()
      : state.baseCoinExpiresAt,
  };
}

export function getTransferTransactionReducer(state: CoinsReducerType) {
  const sendTokenInfo = _.cloneDeep(state.sendTokenInfo);
  delete sendTokenInfo.fee;
  delete sendTokenInfo.transaction;

  return {
    ...state,
    sendTokenInfo,
  };
}
