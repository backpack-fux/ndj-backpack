import {NetworkName} from '@app/constants';

export interface Network {
  name: string;
  network: NetworkName;
  currency: string;
  Icon: any;
  chainId?: {[network: string]: number};
  chain: string;
  explorer: string;
}
