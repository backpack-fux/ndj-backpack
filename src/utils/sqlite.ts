import {BaseCoin} from '@app/models';
// import {sqliteService} from '@app/services/sqllite';
import {Thread} from 'react-native-threads';
const thread = new Thread('./sqlite.thread.js');

export const saveBaseCoins = (baseCoins: BaseCoin[]) => {
  // sqliteService.setBaseCoins(baseCoins);
  // if (Platform.OS === 'android') {
  //   sqliteService.setBaseCoins(baseCoins);
  //   return;
  // }

  return new Promise((resolve, reject) => {
    console.log('send message');
    thread.postMessage(JSON.stringify(baseCoins));

    thread.onmessage = (message: string) => {
      console.log('received message', message);
      if (message === 'success') {
        resolve(message);
      } else {
        reject(message);
      }
    };
  });
};
