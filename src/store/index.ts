import {createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {persistStore, persistReducer, createMigrate} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import logger from 'redux-logger';

import rootReducer from './rootReducer';
import rootSaga from './rootSaga';
import {RootState} from '@app/models';
import {migrations} from './migrations';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware();

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  blacklist: [],
  migrate: createMigrate(migrations, {debug: true}),
  stateReconciler: autoMergeLevel2,
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
