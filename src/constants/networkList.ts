import {Network} from '@app/models';
import {NetworkName} from '.';

import BinanceIcon from '@app/assets/images/logos/binance.svg';
import SmartChainIcon from '@app/assets/images/logos/smartChain.svg';
import EthereumIcon from '@app/assets/images/logos/ethereum.svg';
import PolygonIcon from '@app/assets/images/logos/polygon.svg';
import SolanaIcon from '@app/assets/images/logos/solana.svg';
import ZilliqaIcon from '@app/assets/images/logos/zilliqa.svg';

export const networkName = {
  [NetworkName.ethereum]: 'Ethereum',
  [NetworkName.polygon]: 'Polygon',
  [NetworkName.binance]: 'Binance',
  [NetworkName.binanceSmartChain]: 'Smart Chain',
  [NetworkName.solana]: 'Solana',
  [NetworkName.zilliqa]: 'Zilliqa',
};

export const networkList: Network[] = [
  {
    name: 'Ethereum',
    network: NetworkName.ethereum,
    chainId: 1,
    currency: 'ETH',
    Icon: EthereumIcon,
    chain: 'eip155:1',
    explorer: 'https://etherscan.io/address',
  },
  {
    name: 'Polygon',
    network: NetworkName.polygon,
    chainId: 137,
    currency: 'MATIC',
    Icon: PolygonIcon,
    chain: 'eip155:137',
    explorer: 'https://polygonscan.com/address',
  },
  {
    name: 'BNB',
    network: NetworkName.binance,
    currency: 'BNB',
    Icon: BinanceIcon,
    chain: 'bep2',
    explorer: 'https://explorer.binance.org/address',
  },
  {
    name: 'Smart Chain',
    network: NetworkName.binanceSmartChain,
    currency: 'BNB',
    Icon: BinanceIcon,
    chain: 'bep20:1',
    chainId: 1,
    explorer: 'https://bscscan.com/address',
  },
  {
    name: 'Solana',
    network: NetworkName.solana,
    currency: 'SOL',
    Icon: SolanaIcon,
    chain: 'sol',
    explorer: 'https://solscan.io/account',
  },
  {
    name: 'Zilliqa',
    network: NetworkName.zilliqa,
    currency: 'ZIL',
    Icon: ZilliqaIcon,
    chain: 'zip',
    explorer: 'https://viewblock.io/zilliqa/address',
  },
];
