import {NetworkName} from '@app/constants';

export interface BaseCoin {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  network: NetworkName;
  image?: string;
  enabled?: boolean;
  balance?: number;
}

export interface Token extends BaseCoin {
  price?: number;
  highPrice?: number;
  lowPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
  balance?: number;
}

export enum CoinsActionType {
  SET_TOKENS = 'coins/SET_TOKENS',
  SET_TOKEN = 'coins/SET_TOKEN',
  ADD_TOKEN = 'coins/ADD_TOKEN',
  ADD_COIN = 'coins/ADD_COIN',
  SET_BASE_COINS = 'coins/SET_BASE_COINS',
  SET_ACCOUNT_COINS = 'coins/SET_ACCOUNT_COINS',
  ADD_ACCOUNT_COIN = 'coins/ADD_ACCOUNT_COIN',
  DELETE_USER_COIN = 'coins/DELETE_USER_COIN',
  TOGGLE_ACCOUNT_COIN = 'coins/TOGGLE_ACCOUNT_COIN',
  SEARCH_COINS_REQUEST = 'coins/SEARCH_COINS_REQUEST',
  SEARCH_COINS_RESPONSE = 'coins/SEARCH_COINS_RESPONSE',
  SET_IS_LOADING_TOKENS = 'coins/SET_IS_LOADING_TOKENS',
  SELECT_SEND_TOKEN = 'coins/SELECT_SEND_TOKEN',
  UPDATE_SEND_TOKEN_INFO = 'coins/UPDATE_SEND_TOKEN_INFO',
  SET_SEND_TOKEN_LOADING = 'coins/SET_SEND_TOKEN_LOADING',
  TRANSFER_TOKEN_REQUEST = 'coins/TRANSFER_TOKEN_REQUEST',
  TRANSFER_TOKEN_SUCCESS = 'coins/TRANSFER_TOKEN_SUCCESS',
  TRANSFER_TOKEN_FAILED = 'coins/TRANSFER_TOKEN_FAILED',
  GET_TRANSFER_TRANSACTION = 'coins/GET_TRANSFER_TRANSACTION',
  GET_TRANSACTIONS_REQUEST = 'coins/GET_TRANSACTIONS_REQUEST',
  GET_TRANSACTIONS_SUCCESS = 'coins/GET_TRANSACTIONS_SUCCESS',
  GET_TRANSACTIONS_FAILED = 'coins/GET_TRANSACTIONS_FAILED',
}
