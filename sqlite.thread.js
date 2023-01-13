import './shim';
import 'react-native-url-polyfill/auto';
import self from './selfThread';

import {sqliteService} from '@app/services/sqllite';

// listen for messages
self.onmessage = async message => {
  try {
    const baseCoins = JSON.parse(message);
    await sqliteService.setBaseCoins(baseCoins);
    self.postMessage('success');
  } catch (err) {
    self.postMessage(`Error: ${err.message}`);
  }
};
