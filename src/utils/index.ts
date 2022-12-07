import {networkList, networkName, NetworkName} from '@app/constants';
import {BaseCoin, News, Token, Wallet} from '@app/models';
import numeral from 'numeral';
import {Alert, Dimensions} from 'react-native';
import {currencies} from '@app/constants/currencies';
import * as _ from 'lodash';
import * as queryString from 'query-string';
import {
  check,
  RESULTS,
  request,
  openSettings,
  Permission,
} from 'react-native-permissions';
import Toast from 'react-native-toast-message';

//@ts-ignore
import bip39 from 'react-native-bip39';
import {DEFAULT_COINS} from '@app/constants/coins';
import {permissionName} from '@app/constants/permission';

export function readableNumString(value: number) {
  const log = Math.log10(value);

  if (log === Infinity || log === -Infinity) {
    return '0';
  }

  if (Math.floor(log) >= -3) {
    return `${Number(value.toFixed(3))}`;
  }

  return `${Number(value.toFixed(Math.abs(Math.floor(log))))}`;
}

export function shuffle(array: any) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export const normalizeNumber = (
  value: number = 0,
  defaultDecimal: number = 2,
) => {
  const log = Math.log10(value);
  let defaultFormat = '0,0';

  if (defaultDecimal) {
    defaultFormat += '.';
    for (let i = 0; i < defaultDecimal; i += 1) {
      defaultFormat += '0';
    }
  }

  if (log === -Infinity || log === Infinity) {
    return numeral(0).format(defaultFormat);
  }

  if (log > 0) {
    return numeral(value).format(defaultFormat);
  }

  const d = Math.floor(log * -1);

  if (d > 10 && d > defaultDecimal) {
    return '0';
  }

  return Number(value.toFixed(d + 2)).toString();
};

export const formatNumber = (value: Number, format = '0,0.00') => {
  return numeral(value).format(format);
};

export const formatCurrency = (value: number, currency: string) => {
  const val = normalizeNumber(value);
  const currencyItem = currencies.find(c => c.cc === currency);

  if (!currencyItem) {
    return `$${val}`;
  }

  return `${currencyItem.symbol.toUpperCase()}${
    currencyItem.symbol.length === 1 ? '' : ' '
  }${val}`;
};

export const getNetworkByChain = (chain: string, network: string) => {
  return networkList.find(
    item =>
      `${item.chain}${
        item?.chainId && item.chainId[network]
          ? `:${item.chainId[network]}`
          : ''
      }` === chain,
  )?.network;
};

export const getPrivateKeyByNetworkAndAddress = (
  wallets: Wallet[],
  network: string,
  address: string,
) => {
  for (const account of wallets) {
    for (const wallet of account.wallets) {
      if (wallet.network === network && wallet.address === address) {
        return wallet.privateKey;
      }
    }
  }

  return null;
};

export const sleep = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getDomainName = (link?: string) => {
  if (!link) {
    return '';
  }

  try {
    const domain = new URL(link);

    return domain?.hostname?.replace('www.', '') || '';
  } catch (err) {
    return '';
  }
};

export const apx = (size = 0) => {
  let width = Dimensions.get('window').width;
  return (width / 750) * size;
};

export const mapDecryptNews = ({
  id,
  date,
  link,
  title,
  custom_fields,
}: any): News => ({
  id: id as string,
  date: date as string,
  link: link as string,
  title: title.rendered as string,
  image: custom_fields.featured_image_url as string,
  description: custom_fields.yoast.metadesc as string,
});

export const showNetworkName = (
  network: NetworkName,
  chain: 'testnet' | 'mainnet',
) => {
  if (chain === 'mainnet') {
    return `${networkName[network]}`;
  }

  let name = 'Testnet';

  switch (network) {
    case NetworkName.ethereum:
      name = 'Goerli';
      break;
    case NetworkName.polygon:
      name = 'Mumbai';
      break;
    case NetworkName.binanceSmartChain:
      name = 'BSC Testnet';
      break;
    case NetworkName.solana:
      name = `${networkName[network]} Devnet`;
      break;
    default:
      name = `${networkName[network]} Testnet`;
      break;
  }

  return name;
};

export const generateMnemonicPhrase = async (): Promise<string> => {
  const mnemonicString: string = await bip39.generateMnemonic(128);
  const words = mnemonicString.split(' ');
  if (words.length !== _.uniq(words).length) {
    return generateMnemonicPhrase();
  }

  return mnemonicString;
};

const levDist = function (s: string, t: string): number {
  var d: any = []; //2d matrix

  // Step 1
  var n = s.length;
  var m = t.length;

  if (n === 0) {
    return m;
  }
  if (m === 0) {
    return n;
  }

  //Create an array of arrays in javascript (a descending loop is quicker)
  for (var i = n; i >= 0; i--) {
    d[i] = [];
  }

  // Step 2
  for (var i = n; i >= 0; i--) {
    d[i][0] = i;
  }
  for (var j = m; j >= 0; j--) {
    d[0][j] = j;
  }

  // Step 3
  for (var i = 1; i <= n; i++) {
    var s_i = s.charAt(i - 1);

    // Step 4
    for (var j = 1; j <= m; j++) {
      //Check the jagged ld total so far
      if (i === j && d[i][j] > 4) {
        return n;
      }

      var t_j = t.charAt(j - 1);
      var cost = s_i === t_j ? 0 : 1; // Step 5

      //Calculate the minimum
      var mi = d[i - 1][j] + 1;
      var b = d[i][j - 1] + 1;
      var c = d[i - 1][j - 1] + cost;

      if (b < mi) {
        mi = b;
      }
      if (c < mi) {
        mi = c;
      }

      d[i][j] = mi; // Step 6

      //Damerau transposition
      if (
        i > 1 &&
        j > 1 &&
        s_i === t.charAt(j - 2) &&
        s.charAt(i - 2) === t_j
      ) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }

  // Step 7
  return d[n][m];
};

export const closeetBaseCoins = (baseCoins: BaseCoin[], str: string) => {
  return baseCoins.sort(function (a: BaseCoin, b: BaseCoin) {
    const aText = a.symbol.indexOf(str) > -1 ? a.symbol : a.name;
    const bText = b.symbol.indexOf(str) > -1 ? b.symbol : a.name;
    return levDist(aText, str) - levDist(bText, str);
  });
};

export const checkPermission = async (permission: Permission) => {
  try {
    let result = await check(permission);

    if (result === RESULTS.GRANTED) {
      return true;
    } else if (result === RESULTS.DENIED) {
      result = await request(permission);

      if (result === RESULTS.GRANTED) {
        return true;
      }
    }

    Alert.alert(
      'Permission Denied',
      `Go to the settings and allow ${permissionName[permission]} access?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: () => openSettings(),
        },
      ],
    );

    return false;
  } catch (err: any) {
    console.log(err);
    Toast.show({
      type: 'error',
      text1: err.message,
    });
    return false;
  }
};

const linkingURLs = ['wc://wc', 'ndj-backpack://wc', 'https://jxndao.com/wc'];

export const getDeepLink = (url: string) => {
  if (!url.startsWith('wc://wc') && url.startsWith('wc:')) {
    return url;
  }

  const data = queryString.parseUrl(url);
  const urlWithUri = `${data.url}?uri=`;
  const linkingURL = linkingURLs.find(entry => data.url.startsWith(entry));

  if (!linkingURL) {
    return;
  }

  const urlParam = url.replace(urlWithUri, '');

  return decodeURIComponent(urlParam);
};

export const getNativeToken = (token: Token) => {
  const nativeToken = DEFAULT_COINS.find(
    coin => coin.contractAddress === token.network,
  );

  return nativeToken;
};
