import './shim';
import 'react-native-url-polyfill/auto';
import {self} from 'react-native-threads';
import {realmService} from '@app/services/realm';

// listen for messages
self.onmessage = async message => {
  try {
    console.log('------------------------------');
    const baseCoins = await realmService.searchBaseCoins(message);
    self.postMessage(JSON.stringify(baseCoins));
  } catch (err) {
    self.postMessage(JSON.stringify([]));
  }
};
