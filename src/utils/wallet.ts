import {WalletItem} from '@app/models';
// import {Platform} from 'react-native';
import {Thread} from 'react-native-threads';
// const thread = new Thread(
//   Platform.OS === 'ios' ? './wallet.thread.js' : './wallet.thread.android.js',
// );
const thread = new Thread('./wallet.thread.js');

export const createNewWallet = async (
  mnemonic: string,
): Promise<WalletItem[]> => {
  // const wallets = await WalletService.createWallets(mnemonic);
  // return wallets;
  // if (Platform.OS === 'android') {
  //   const wallets = await WalletService.createWallets(mnemonic);
  //   return wallets;
  // }

  return new Promise((resolve, reject) => {
    console.log('create message');
    thread.postMessage(mnemonic);

    thread.onmessage = (message: string) => {
      console.log('message', message);
      if (message.startsWith('Error:')) {
        reject(new Error(message));
      } else {
        resolve(JSON.parse(message));
      }
    };
  });
};
