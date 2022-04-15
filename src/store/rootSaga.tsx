import {all, put} from 'redux-saga/effects';
import {ActionType} from '@app/models';
// redux
import wallets from '@app/store/wallets/walletsSaga';
import coins from '@app/store/coins/coinsSaga';

export default function* start() {
  yield all([...wallets, ...coins]);
  // yield put({
  //   type: ActionType.INIT_STORE, // custom onInit action
  // });
}
