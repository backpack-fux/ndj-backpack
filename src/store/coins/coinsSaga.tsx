import {fork} from 'redux-saga/effects';
import {
  accountCoinsWatcher,
  getTokensWatcher,
  getBaseCoinsWatcher,
  searchCoinsWatcher,
  cleanTokensWatcher,
  getPriceOfSendTokenWatcher,
  transferTokenWatcher,
  getTransferTransactionWatcher,
  getTransactionsWatcher,
} from './sagas';

export default [
  fork(getBaseCoinsWatcher),
  fork(accountCoinsWatcher),
  fork(getTokensWatcher),
  fork(searchCoinsWatcher),
  fork(cleanTokensWatcher),
  fork(getPriceOfSendTokenWatcher),
  fork(getTransferTransactionWatcher),
  fork(transferTokenWatcher),
  fork(getTransactionsWatcher),
];
