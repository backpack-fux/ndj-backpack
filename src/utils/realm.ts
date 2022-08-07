import {BaseCoin} from '@app/models';
import {Thread} from 'react-native-threads';

const thread = new Thread('./realm.thread.js');

export const searchBaseCoins = async (search: string): Promise<BaseCoin[]> => {
  return new Promise(resolve => {
    thread.postMessage(search);

    thread.onmessage = (message: string) => {
      resolve(JSON.parse(message));
    };
  });
};
