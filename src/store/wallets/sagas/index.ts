import {delay, put, select, takeLatest} from 'redux-saga/effects';
import {
  Action,
  ActionType,
  ENSInfo,
  RootState,
  Wallet,
  WalletKeys,
} from '@app/models';
import {addWallet, setLoading, setWallets} from '../actions';
import {showSnackbar} from '@app/utils';
import {NetworkName} from '@app/constants';
import {WalletService} from '@app/services';

function* reload() {
  try {
    yield put(setLoading(true));

    yield delay(1000);
    const state: RootState = yield select();
    const accounts = state.wallets.wallets;
    const wallets: Wallet[] = [...accounts];
    for (const account of wallets) {
      for (const wallet of account.wallets) {
        try {
          const ensInfo: ENSInfo = yield WalletService.getENSInfo(
            wallet.network,
            wallet.address,
          );
          wallet.ensInfo = ensInfo;
        } catch (err) {
          console.log(err);
        }
      }
    }
    yield put(setWallets(wallets));
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
    const state: RootState = yield select();

    const accounts = state.wallets.wallets;
    const wallets: WalletKeys[] = yield WalletService.createWallets(
      payload.mnemonic,
      payload.network,
    );

    const wallet: Wallet = {
      id: (Math.random() + 1).toString(36).substring(7),
      name: payload.name || `Main Wallet ${accounts.length + 1}`,
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
  yield takeLatest(ActionType.REFRESH_WALLETS as any, reload);
}

export function* createWalletWatcher() {
  yield takeLatest(ActionType.CREATE_WALLET as any, createWallet);
}
