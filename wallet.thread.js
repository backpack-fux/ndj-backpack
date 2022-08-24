import './shim';
import 'react-native-url-polyfill/auto';
import {WalletService} from '@app/services';
import {generateMnemonicPhrase} from '@app/utils';
import {self} from 'react-native-threads';

// listen for messages
self.onmessage = async message => {
  try {
    const mnemonic = message || (await generateMnemonicPhrase());
    const spendWalletItems = await WalletService.createWallets(mnemonic);
    self.postMessage(JSON.stringify(spendWalletItems));
  } catch (err) {
    console.log(err);
    self.postMessage(`Error: ${err.message}`);
  }
};
