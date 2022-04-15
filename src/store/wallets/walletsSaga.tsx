import {fork} from 'redux-saga/effects';
import {createWalletWatcher, reloadWatcher} from './sagas';

export default [fork(reloadWatcher), fork(createWalletWatcher)];
