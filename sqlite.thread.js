import './shim';
import 'react-native-url-polyfill/auto';
import {self} from 'react-native-threads';
import {sqliteService} from '@app/services/sqllite';

// listen for messages
self.onmessage = async message => {
  try {
    const baseCoins = JSON.parse(message);
    sqliteService.setBaseCoins(baseCoins);
    self.postMessage('success');
  } catch (err) {
    self.postMessage(`Error: ${err.message}`);
  }
};
