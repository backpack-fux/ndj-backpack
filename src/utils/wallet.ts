import {WalletItem} from '@app/models';
import {Thread} from 'react-native-threads';
const thread = new Thread('./wallet.thread.js');

export const createNewWallet = async (
  mnemonic: string,
): Promise<WalletItem[]> => {
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
