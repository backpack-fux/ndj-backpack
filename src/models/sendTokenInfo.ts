import {User} from '@standard-crypto/farcaster-js';
import {Token} from './coinTypes';

export interface SendTokenInfo {
  isLoading?: boolean;
  token?: Token;
  fromAccount?: string;
  toAccount?: string;
  amount?: string;
  amountUSD?: string;
  fee?: number;
  balance?: number;
  transaction?: any;
  status?: string;
  date?: Date;
  isSendMax?: boolean;
  farcaster?: User;
  isSentSuccessFully?: boolean;
}
