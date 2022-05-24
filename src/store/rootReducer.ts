import {combineReducers} from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer} from 'redux-persist';

import {walletsReducer} from '@app/store/wallets/walletsReducer';
import {coinsReducer} from '@app/store/coins/coinsReducer';

const coinsPersistConfig = {
  key: 'coins',
  storage: AsyncStorage,
  blacklist: ['baseCoins'],
};

export default () =>
  combineReducers({
    wallets: walletsReducer,
    coins: persistReducer<any, any>(coinsPersistConfig, coinsReducer),
  });
