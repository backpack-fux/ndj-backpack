import {NetworkName} from './enums';

export const testnetCoins: any = {
  [NetworkName.ethereum]: {
    // goerli
    USDT: '0xe802376580c10fe23f027e1e19ed9d54d4c9311e',
    USDC: '0x07865c6e87b9f70255377e024ace6630c1eaa37f', //
    DAI: '0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844', //
    WETH: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6', //
    WBTC: '0xc04b0d3107736c32e19f1c62b2af67be61d63a05',
    LINK: '0x326c977e6efc84e512bb9c30f76e30c160ed06fb', //
  },
  [NetworkName.polygon]: {
    // mumbai
    USDT: '0x3813e82e6f7098b9583fc0f33a962d02018b6803', //
    USDC: '0x566368d78dbdec50f04b588e152de3cec0d5889f', //
    DAI: '0xcb1e72786a6eb3b44c2a2429e317c8a2462cfeb1', //
    WETH: '0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa',
    WBTC: '0xeb8df6700e24802a5d435e5b0e4228065ca9e0f3', //
    LINK: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB', //
  },
  [NetworkName.binanceSmartChain]: {
    // testnet
    USDT: '0x337610d27c682e347c9cd60bd4b3b107c9d34ddd', //
    USDC: '0x64544969ed7ebf5f083679233325356ebe738930', //
    DAI: '0xec5dcb5dbf4b114c9d0f65bccab49ec54f6a0867', //
    WETH: '0x1e33833a035069f42d68d1f53b341643de1c018d',
    WBTC: '0x1f12b61a35ca147542001186dea23e34eb4d7d95', //
    LINK: '0x84b9b910527ad5c03a9ca831909e21e236ea7b06', //
  },
  [NetworkName.solana]: {
    // devnet
    USDC: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    USDT: 'HY6uvCfBQhKANRxBcYLBK7aUva8mT7mLP2SjrLLmipza',
    RAY: '3bsvftcGX66jB39fLJ2a9ipPgVGWsxEopgJxBfdjar3D',
  },
  [NetworkName.zilliqa]: {},
  [NetworkName.binance]: {},
  [NetworkName.avalanche]: {
    USDC: '0x5425890298aed601595a70ab815c96711a31bc65',
  },
};
