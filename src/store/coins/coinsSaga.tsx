import {fork} from 'redux-saga/effects';
import {
  accountCoinsWatcher,
  getTokensWatcher,
  getBaseCoinsWatcher,
  searchCoinsWatcher,
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
  fork(getPriceOfSendTokenWatcher),
  fork(getTransferTransactionWatcher),
  fork(transferTokenWatcher),
  fork(getTransactionsWatcher),
];
