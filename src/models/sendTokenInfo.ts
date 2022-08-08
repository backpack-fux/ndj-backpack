import {Token} from './coinTypes';

export interface SendTokenInfo {
  isLoading?: boolean;
  token?: Token;
  fromAccount?: string;
  toAccount?: string;
  amount?: string;
  fee?: number;
  balance?: number;
  transaction?: any;
  status?: string;
  date?: Date;
  isSendMax?: boolean;
}
