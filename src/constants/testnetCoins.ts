import {NetworkName} from './enums';

export const testnetCoins: any = {
  [NetworkName.ethereum]: {
    // kovan
    USDT: '0xf3e0d7bf58c5d455d31ef1c2d5375904df525105',
    USDC: '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115', //
    DAI: '0x04df6e4121c27713ed22341e7c7df330f56f289b', //
    WETH: '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1', //
    WBTC: '0xa0a5ad2296b38bd3e3eb59aaeaf1589e8d9a29a9',
    SHIB: '0xe9a1ed75621d9357c753e1436fe9eb63628bde67',
    LINK: '0xa36085F69e2889c224210F603D836748e7dC0088', //
  },
  [NetworkName.polygon]: {
    USDT: '0x3813e82e6f7098b9583fc0f33a962d02018b6803', //
    USDC: '0xe11a86849d99f524cac3e7a0ec1241828e332c62', //
    DAI: '0xcb1e72786a6eb3b44c2a2429e317c8a2462cfeb1', //
    WETH: '0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa',
    WBTC: '0xeb8df6700e24802a5d435e5b0e4228065ca9e0f3', //
    LINK: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB', //
  },
  [NetworkName.binanceSmartChain]: {
    USDT: '0x337610d27c682e347c9cd60bd4b3b107c9d34ddd', //
    USDC: '0x64544969ed7ebf5f083679233325356ebe738930', //
    DAI: '0xec5dcb5dbf4b114c9d0f65bccab49ec54f6a0867', //
    WETH: '0x1e33833a035069f42d68d1f53b341643de1c018d',
    WBTC: '0x1f12b61a35ca147542001186dea23e34eb4d7d95', //
    LINK: '0x84b9b910527ad5c03a9ca831909e21e236ea7b06', //
  },
};
