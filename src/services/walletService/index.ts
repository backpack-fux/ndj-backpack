import BinanceService from './binanceService';
import EthereumService from './ethereumService';
import PolygonService from './polygonService';
import SolanaService from './solanaService';
import ZilliqaService from './zilliqaService';
import SmartChainService from './smartChainService';
import WalletService from './walletService';
import AvalancheService from './avalancheService';

export {WalletService};

new BinanceService();
new EthereumService();
new ZilliqaService();
new SolanaService();
new PolygonService();
new SmartChainService();
new AvalancheService();
