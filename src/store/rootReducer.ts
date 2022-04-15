import {combineReducers} from 'redux';

import {walletsReducer} from '@app/store/wallets/walletsReducer';
import {coinsReducer} from '@app/store/coins/coinsReducer';

export default () =>
  combineReducers({
    wallets: walletsReducer,
    coins: coinsReducer,
  });
