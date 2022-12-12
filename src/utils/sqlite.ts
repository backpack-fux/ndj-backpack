import {BaseCoin} from '@app/models';
import {sqliteService} from '@app/services/sqllite';
import {Platform} from 'react-native';
import {Thread} from 'react-native-threads';
const thread = Platform.OS === 'ios' ? new Thread('./sqlite.thread.js') : null;

export const saveBaseCoins = (baseCoins: BaseCoin[]) => {
  if (Platform.OS === 'android') {
    sqliteService.setBaseCoins(baseCoins);
    return;
  }

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
