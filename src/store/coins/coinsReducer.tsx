// model
import {
  ActionType,
  BaseCoin,
  SendTokenInfo,
  Token,
  ITransaction,
} from '@app/models';
import {createReducer} from '@app/store/createReducer';
// redux
import {
  setTokensReducer,
  setAccountCoinsReducer,
  toggleAccountCoinReducer,
  searchCoinsRequestReducer,
  searchCoinsResponseReducer,
  setIsLoadingTokensReducer,
  updateSendTokenInfoReducer,
  setSendTokenLoadingReducer,
  transferTokenSuccessReducer,
  setTokenReducer,
  getTransactionsRequestReducer,
  getTransactionsSuccessReducer,
  getTransactionsFailedReducer,
  deleteTokensFromWalletReducer,
  transferTokenFailedReducer,
  getBaseTokenReducer,
  getBaseTokenSuccessReducer,
  getTransferTransactionReducer,
} from './reducer';

export interface CoinsReducerType {
  accountCoins: BaseCoin[];
  tokens: {
    [account: string]: Token[];
  };
  token?: Token;
  transactions: ITransaction[];
  sendTokenInfo: SendTokenInfo;
  searchedCoins: BaseCoin[];
  isSearchingCoins: boolean;
  isLoadingTokens: boolean;
  isLoadingTransactions: boolean;
  isTransactionReached: boolean;
  baseCoinExpiresAt?: Date;
  isLoadingGetBaseCoin: boolean;
}

export const defaultState: CoinsReducerType = {
  accountCoins: [],
  tokens: {},
  transactions: [],
  isLoadingTransactions: false,
  searchedCoins: [],
  isSearchingCoins: false,
  isLoadingTokens: false,
  sendTokenInfo: {},
  isTransactionReached: false,
  isLoadingGetBaseCoin: false,
};

export const coinsReducer = createReducer<CoinsReducerType>(defaultState, {
  [ActionType.SET_IS_LOADING_TOKENS]: setIsLoadingTokensReducer,
  [ActionType.SET_TOKENS]: setTokensReducer,
  [ActionType.SET_TOKEN]: setTokenReducer,
  [ActionType.SET_ACCOUNT_COINS]: setAccountCoinsReducer,
  [ActionType.TOGGLE_ACCOUNT_COIN]: toggleAccountCoinReducer,
  [ActionType.SEARCH_COINS_REQUEST]: searchCoinsRequestReducer,
  [ActionType.SEARCH_COINS_RESPONSE]: searchCoinsResponseReducer,
  [ActionType.UPDATE_SEND_TOKEN_INFO]: updateSendTokenInfoReducer,
  [ActionType.SET_SEND_TOKEN_LOADING]: setSendTokenLoadingReducer,
  [ActionType.TRANSFER_TOKEN_SUCCESS]: transferTokenSuccessReducer,
  [ActionType.TRANSFER_TOKEN_FAILED]: transferTokenFailedReducer,
  [ActionType.GET_TRANSACTIONS_REQUEST]: getTransactionsRequestReducer,
  [ActionType.GET_TRANSACTIONS_SUCCESS]: getTransactionsSuccessReducer,
  [ActionType.GET_TRANSACTIONS_FAILED]: getTransactionsFailedReducer,
  [ActionType.DELETE_WALLET]: deleteTokensFromWalletReducer,
  [ActionType.GET_BASE_COINS]: getBaseTokenReducer,
  [ActionType.GET_BASE_COINS_SUCCESS]: getBaseTokenSuccessReducer,
  [ActionType.GET_TRANSFER_TRANSACTION]: getTransferTransactionReducer,
});
