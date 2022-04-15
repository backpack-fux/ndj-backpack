import {BaseCoin} from '@app/models';
import {NetworkName} from './enums';

export const DEFAULT_COINS: BaseCoin[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'eth',
    contractAddress: NetworkName.ethereum,
    network: NetworkName.ethereum,
    enabled: true,
  },
  {
    id: 'matic-network',
    name: 'Polygon',
    symbol: 'matic',
    contractAddress: NetworkName.polygon,
    network: NetworkName.polygon,
    enabled: true,
  },
  {
    id: 'zilliqa',
    name: 'Zilliqa',
    symbol: 'zil',
    contractAddress: NetworkName.zilliqa,
    network: NetworkName.zilliqa,
    enabled: true,
  },
  {
    id: 'binancecoin',
    name: 'BNB',
    symbol: 'bnb',
    contractAddress: NetworkName.binance,
    network: NetworkName.binance,
    enabled: true,
  },
  {
    id: 'binancecoin',
    name: 'Smart Chain',
    symbol: 'bnb',
    contractAddress: NetworkName.binanceSmartChain,
    network: NetworkName.binanceSmartChain,
    enabled: true,
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    contractAddress: NetworkName.solana,
    network: NetworkName.solana,
    enabled: true,
  },
];
