import AvalancheService from './avalancheService';
import EthereumService from './ethereumService';
import PolygonService from './polygonService';
import SmartChainService from './smartChainService';
import WalletService from './walletService';

export { WalletService };

new EthereumService();
new PolygonService();
new SmartChainService();
new AvalancheService();
