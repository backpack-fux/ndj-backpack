import {
  Action,
  BaseCoin,
  ITransaction,
  SendTokenInfo,
  Token,
} from '@app/models';
import {CoinsReducerType} from '../coinsReducer';

export function setBaseCoinsReducer(
  state: CoinsReducerType,
  {payload}: Action<BaseCoin[]>,
) {
  return {
    ...state,
    baseCoins: payload,
  };
}

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
  {payload}: Action<Token[]>,
) {
  return {
    ...state,
    tokens: payload,
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
  const coins = state.accountCoins || [];

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
    accountCoins: coins,
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

export function selectSendTokenReducer(
  state: CoinsReducerType,
  {payload}: Action<Token>,
) {
  return {
    ...state,
    sendTokenInfo: {
      token: payload,
    },
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
      isTransferred: true,
    },
  };
}

export function getTransactionsRequestReducer(state: CoinsReducerType) {
  return {
    ...state,
    isLoadingTransactions: true,
    transactions: [],
  };
}

export function getTransactionsSuccessReducer(
  state: CoinsReducerType,
  {payload}: Action<ITransaction[]>,
) {
  return {
    ...state,
    isLoadingTransactions: false,
    transactions: payload,
  };
}

export function getTransactionsFailedReducer(state: CoinsReducerType) {
  return {
    ...state,
    isLoadingTransactions: false,
  };
}
