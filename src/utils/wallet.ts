import {WalletItem} from '@app/models';
import {WalletService} from '@app/services';
import {Platform} from 'react-native';
import {Thread} from 'react-native-threads';

const thread = new Thread('./wallet.thread.js');

export const createNewWallet = async (
  mnemonic: string,
): Promise<WalletItem[]> => {
  if (Platform.OS === 'android') {
    const wallets = await WalletService.createWallets(mnemonic);
    return wallets;
  }

  return new Promise((resolve, reject) => {
    thread.postMessage(mnemonic);

    thread.onmessage = (message: string) => {
      if (message.startsWith('Error:')) {
        reject(new Error(message));
      } else {
        resolve(JSON.parse(message));
      }
    };
  });
};
