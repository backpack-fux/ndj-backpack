import {Token} from './coinTypes';

export interface SendTokenInfo {
  isLoading?: boolean;
  token?: Token;
  fromAccount?: string;
  toAccount?: string;
  amount?: string;
  fee?: number;
  isTransferred?: boolean;
  balance?: number;
  transaction?: any;
}
