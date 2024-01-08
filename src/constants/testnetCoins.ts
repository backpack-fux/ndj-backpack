import {NetworkName} from './enums';

export const testnetCoins: any = {
  [NetworkName.ethereum]: {
    // Sepolia
    USDT: '0x7169d38820dfd117c3fa1f22a697dba58d90ba06',
    USDC: '0x8267cF9254734C6Eb452a7bb9AAF97B392258b21',
    DAI: '0x3e622317f8c93f7328350cf0b56d9ed4c620c5d6',
    WETH: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    LINK: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
  },
  [NetworkName.polygon]: {
    // mumbai
    USDT: '0x3813e82e6f7098b9583fc0f33a962d02018b6803', //
    'USDC.E': '0x566368d78dbdec50f04b588e152de3cec0d5889f', //
    USDC: '0x9999f7fea5938fd3b1e26a12c3f2fb024e194f97', //
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
