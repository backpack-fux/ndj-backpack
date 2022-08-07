import {createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import logger from 'redux-logger';

import rootReducer from './rootReducer';
import rootSaga from './rootSaga';
import {RootState} from '@app/models';

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware();

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: [],
};

const persistedReducer = persistReducer<RootState, any>(
  persistConfig,
  rootReducer(),
);
// Mount it on the Store
const store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));

// Run the saga
sagaMiddleware.run(rootSaga);

export default store;
export const persistor = persistStore(store);
