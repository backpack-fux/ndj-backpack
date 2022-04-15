import {NetworkName} from '@app/constants';

export interface Network {
  name: string;
  network: NetworkName;
  chainId?: number;
  currency: string;
  Icon: any;
  chain: string;
  explorer: string;
}
