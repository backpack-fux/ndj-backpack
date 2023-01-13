import '../shim';
import 'react-native-url-polyfill/auto';
import {WalletService} from '../src/services/walletService';

import self from './selfThread';

// listen for messages
self.onmessage = async message => {
  try {
    const spendWalletItems = await WalletService.createWallets(message);
    self.postMessage(JSON.stringify(spendWalletItems));
  } catch (err) {
    console.log(err);
    self.postMessage(`Error: ${err.message}`);
  }
};
