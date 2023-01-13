import {BaseCoin} from '@app/models';
import {Thread} from 'react-native-threads';
const thread = new Thread('./sqlite.thread.js');

export const saveBaseCoins = (baseCoins: BaseCoin[]) => {
  return new Promise((resolve, reject) => {
    thread.postMessage(JSON.stringify(baseCoins));

    thread.onmessage = (message: string) => {
      if (message === 'success') {
        resolve(message);
      } else {
        reject(message);
      }
    };
  });
};
