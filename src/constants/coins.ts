import {BaseCoin} from '@app/models';
import {NetworkName} from './enums';

export const DEFAULT_COINS: BaseCoin[] = [
  {
    id: 'usd-coin',
    name: 'USD Coin',
    symbol: 'usdc',
    contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    network: NetworkName.ethereum,
    enabled: true,
  },
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
    enabled: false,
  },
  {
    id: 'zilliqa',
    name: 'Zilliqa',
    symbol: 'zil',
    contractAddress: NetworkName.zilliqa,
    network: NetworkName.zilliqa,
    enabled: false,
  },
  {
    id: 'binancecoin',
    name: 'BNB',
    symbol: 'bnb',
    contractAddress: NetworkName.binance,
    network: NetworkName.binance,
    enabled: false,
  },
  {
    id: 'binancecoin',
    name: 'Smart Chain',
    symbol: 'bnb',
    contractAddress: NetworkName.binanceSmartChain,
    network: NetworkName.binanceSmartChain,
    enabled: false,
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    contractAddress: NetworkName.solana,
    network: NetworkName.solana,
    enabled: false,
  },
];
