import {fork} from 'redux-saga/effects';
import {
  accountCoinsWatcher,
  getTokensWatcher,
  searchCoinsWatcher,
  getPriceOfSendTokenWatcher,
  transferTokenWatcher,
  getTransferTransactionWatcher,
  getTransactionsWatcher,
  getBaseCoinsWatcher,
} from './sagas';

export default [
  fork(accountCoinsWatcher),
  fork(getTokensWatcher),
  fork(searchCoinsWatcher),
  fork(getPriceOfSendTokenWatcher),
  fork(getTransferTransactionWatcher),
  fork(transferTokenWatcher),
  fork(getTransactionsWatcher),
  fork(getBaseCoinsWatcher),
];
