import {delay, put, takeLatest} from 'redux-saga/effects';
import {Action, ActionType, Wallet, WalletKeys} from '@app/models';
import {addWallet, setLoading} from '../actions';
import {showSnackbar} from '@app/utils';
import {NetworkName} from '@app/constants';
import {WalletService} from '@app/services';

function* reload() {
  try {
    yield put(setLoading(true));
  } catch (err: any) {
    showSnackbar(err.message);
  } finally {
    yield put(setLoading(false));
  }
}

function* createWallet({
  payload,
}: Action<{mnemonic: string; name?: string; network?: NetworkName}>) {
  yield put(setLoading(true));
  yield delay(1000);
  try {
    const wallets: WalletKeys[] = yield WalletService.createWallets(
      payload.mnemonic,
      payload.network,
    );

    const wallet: Wallet = {
      id: (Math.random() + 1).toString(36).substring(7),
      name: payload.name || 'Main Wallet',
      network: payload.network,
      mnemonic: payload.mnemonic,
      wallets,
    };
    yield put(addWallet(wallet));
  } catch (err: any) {
    showSnackbar(err.message);
  } finally {
    yield put(setLoading(false));
  }
}

export function* reloadWatcher() {
  yield takeLatest(ActionType.INIT_STORE as any, reload);
  yield takeLatest(ActionType.RELOAD as any, reload);
}

export function* createWalletWatcher() {
  yield takeLatest(ActionType.CREATE_WALLET as any, createWallet);
}
