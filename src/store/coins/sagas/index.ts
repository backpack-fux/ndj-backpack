import {delay, put, select, takeLatest} from 'redux-saga/effects';
import {
  ActionType,
  BaseCoin,
  Token,
  CoinGeckoCoin,
  CoinGeckoCoinDetail,
  RootState,
  Wallet,
  Action,
  ITransaction,
} from '@app/models';
import {getCoinGeckoCoinList, getCoinGeckoDetail} from '@app/apis';
import * as _ from 'lodash';
import {networkList, NetworkName} from '@app/constants';
import {
  getTransactionsFailed,
  getTransactionsSuccess,
  refreshTokens,
  searchCoinsResponse,
  setAccountCoins,
  setBaseCoins,
  setIsLoadingTokens,
  setSendTokenLoading,
  setTokens,
  transferTokenSuccess,
  updateSendTokenInfo,
} from '../actions';
import {DEFAULT_COINS} from '@app/constants/coins';
import {WalletService} from '@app/services';
import {showSnackbar} from '@app/utils';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';

function* accountCoins({payload}: Action<Wallet>) {
  const coins = payload.network
    ? DEFAULT_COINS.filter(coin => coin.network === payload.network)
    : DEFAULT_COINS;

  yield put(setAccountCoins(coins));
  yield put(refreshTokens());
}

function* getBalances(
  wallet: Wallet,
  coins: BaseCoin[],
  coinDetails: CoinGeckoCoinDetail[],
) {
  const tokens: Token[] = [];

  for (const baseCoin of coins) {
    const detail = coinDetails.find(c => c.id === baseCoin.id);
    const token: Token = {
      ...baseCoin,
      image: detail?.image,
      price: detail?.current_price,
      highPrice: detail?.high_24h,
      lowPrice: detail?.low_24h,
      priceChange: detail?.price_change_24h,
      priceChangePercent: detail?.price_change_percentage_24h,
    };
    const contractAddress =
      token.contractAddress !== token.network
        ? token.contractAddress
        : undefined;
    const accountAddress = wallet.wallets.find(
      w => w.network === token.network,
    )?.address;

    if (accountAddress) {
      try {
        const balance: number = yield WalletService.getBalanceOf(
          token.network,
          accountAddress,
          contractAddress,
        );

        token.balance = balance;
      } catch (err) {
        console.log(
          'get balance error',
          token.network,
          token.contractAddress,
          err,
        );
      }
    }

    tokens.push(token);
  }

  yield put(setTokens({account: wallet.id, tokens}));
}

function* getTokens({payload}: Action<Wallet>) {
  try {
    yield put(setIsLoadingTokens(true));

    yield delay(1000);
    const state: RootState = yield select();
    const wallets = state.wallets.wallets;
    const currency = state.wallets.currency;
    const walletCoins = state.coins.accountCoins;
    const enabledCoins = walletCoins.filter(
      c => c.enabled || DEFAULT_COINS.map(d => d.id).includes(c.id),
    );

    if ((!wallets?.length && payload) || !walletCoins?.length) {
      yield put(setIsLoadingTokens(false));
      return;
    }

    const coinDetails: CoinGeckoCoinDetail[] = yield getCoinGeckoDetail(
      enabledCoins,
      currency,
    );

    // if (payload) {
    //   yield getBalances(payload, enabledCoins, coinDetails);
    // } else {

    // }
    for (const wallet of wallets) {
      yield getBalances(wallet, enabledCoins, coinDetails);
    }

    const newCoins: BaseCoin[] = [];
    for (const coin of walletCoins) {
      const detail = coinDetails.find(c => c.id === coin.id);

      newCoins.push({
        ...coin,
        image: detail?.image || coin.image,
      });
    }

    yield put(setAccountCoins(newCoins));
    yield put(setIsLoadingTokens(false));
  } catch (err) {
    console.log(err);
    yield put(setIsLoadingTokens(false));
  }
}

function* searchCoins({payload}: Action<string>) {
  try {
    const state: RootState = yield select();
    const baseCoins = state.coins.baseCoins;

    const searchedCoins = baseCoins
      .filter(c =>
        networkList.map(network => network.network).includes(c.network),
      )
      .filter(
        c =>
          c.name.toLowerCase().includes(payload.toLowerCase()) ||
          c.symbol.toLowerCase().includes(payload.toLowerCase()),
      )
      .slice(0, 100);

    if (!searchCoins.length) {
      yield put(searchCoinsResponse([]));
      return;
    }

    const res: CoinGeckoCoinDetail[] = yield getCoinGeckoDetail(searchedCoins);

    const newCoins: BaseCoin[] = [];
    for (const coin of searchedCoins) {
      const detail = res.find(c => c.id === coin.id);

      newCoins.push({
        ...coin,
        image: detail?.image || coin.image,
      });
    }

    yield put(searchCoinsResponse(newCoins));
  } catch (err) {
    yield put(searchCoinsResponse([]));
  }
}

function* getBaseCoins() {
  try {
    yield delay(1000);
    const state: RootState = yield select();

    if (!state.coins.accountCoins.length) {
      yield put(setAccountCoins(DEFAULT_COINS));
    }

    if (state.coins.baseCoins.length) {
      return;
    }

    const coins: CoinGeckoCoin[] = yield getCoinGeckoCoinList();
    const baseCoins: BaseCoin[] = [];

    for (const coin of coins) {
      if (_.isEmpty(coin.platforms)) {
        continue;
      }

      for (const network of Object.keys(coin.platforms)) {
        baseCoins.push({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          contractAddress: coin.platforms[network],
          network: network as NetworkName,
        });
      }
    }

    yield put(setBaseCoins(baseCoins));
  } catch (err) {}
}

function* getPriceOfSendToken({payload}: Action<Token>) {
  try {
    yield put(setSendTokenLoading(true));
    const state: RootState = yield select();
    const selectedWallet = selectedWalletSelector(state);
    const sendTokenInfo = state.coins.sendTokenInfo;
    const tokens = state.coins.tokens;

    const wallet = selectedWallet?.wallets.find(
      e => e.network === payload.network,
    );
    const token = ((selectedWallet && tokens[selectedWallet.id]) || []).find(
      a => a.contractAddress === payload.contractAddress,
    );

    const res: CoinGeckoCoinDetail[] = yield getCoinGeckoDetail([payload]);
    const details = res[0];

    if (details) {
      yield put(
        updateSendTokenInfo({
          ...sendTokenInfo,
          fromAccount: wallet?.address,
          balance: token?.balance || 0,
          token: {
            ...sendTokenInfo.token,
            image: details?.image,
            price: details?.current_price,
            highPrice: details?.high_24h,
            lowPrice: details?.low_24h,
            priceChange: details?.price_change_24h,
            priceChangePercent: details?.price_change_percentage_24h,
          } as Token,
        }),
      );
    }
  } catch (err) {
    console.log('getPriceOfSendToken', err);
  } finally {
    yield put(setSendTokenLoading(false));
  }
}

function* getTransferTransaction() {
  try {
    yield put(setSendTokenLoading(true));
    const state: RootState = yield select();
    const sendTokenInfo = state.coins.sendTokenInfo;
    const selectedWallet = selectedWalletSelector(state);
    const privateKey = selectedWallet?.wallets.find(
      wallet => wallet.network === sendTokenInfo.token?.network,
    )?.privateKey;

    if (
      privateKey &&
      sendTokenInfo?.token &&
      sendTokenInfo.toAccount &&
      Number(sendTokenInfo.amount)
    ) {
      const tokenAddress =
        sendTokenInfo.token.contractAddress !== sendTokenInfo.token.network
          ? sendTokenInfo.token.contractAddress
          : undefined;
      const res: {transaction: any; fee: number} = yield WalletService.transfer(
        privateKey,
        sendTokenInfo.token.network,
        sendTokenInfo.toAccount,
        Number(sendTokenInfo.amount),
        tokenAddress,
      );

      yield put(
        updateSendTokenInfo({
          ...sendTokenInfo,
          transaction: res.transaction,
          fee: res.fee,
        }),
      );
    }
  } catch (err: any) {
    showSnackbar(err.message);
  } finally {
    yield put(setSendTokenLoading(false));
  }
}

function* transferToken() {
  try {
    yield put(setSendTokenLoading(true));
    const state: RootState = yield select();
    const sendTokenInfo = state.coins.sendTokenInfo;
    const selectedWallet = selectedWalletSelector(state);
    const privateKey = selectedWallet?.wallets.find(
      wallet => wallet.network === sendTokenInfo.token?.network,
    )?.privateKey;

    if (privateKey && sendTokenInfo?.transaction && sendTokenInfo.token) {
      yield WalletService.sendTransaction(
        privateKey,
        sendTokenInfo.token.network,
        sendTokenInfo.transaction,
      );

      yield put(transferTokenSuccess());

      showSnackbar(
        `Transferred ${
          sendTokenInfo.amount
        } ${sendTokenInfo.token.symbol.toUpperCase()} successfully`,
      );
    }
  } catch (err: any) {
    showSnackbar(err.message);
  } finally {
    yield put(setSendTokenLoading(false));
  }
}

export function* getTransactions({payload}: Action<BaseCoin>) {
  try {
    const state: RootState = yield select();
    const selectedWallet = selectedWalletSelector(state);

    if (!selectedWallet) {
      return;
    }

    const wallet = selectedWallet.wallets.find(
      w => w.network === payload.network,
    );

    if (!wallet) {
      return;
    }

    const transactions: ITransaction[] = yield WalletService.getTransactions(
      payload.network,
      wallet.address,
      payload.contractAddress !== payload.network
        ? payload.contractAddress
        : undefined,
    );

    yield put(getTransactionsSuccess(transactions));
  } catch (err: any) {
    showSnackbar(err.message);
    yield put(getTransactionsFailed(err.message));
  }
}

export function* getBaseCoinsWatcher() {
  yield takeLatest(ActionType.INIT_STORE as any, getBaseCoins);
}

export function* accountCoinsWatcher() {
  yield takeLatest(ActionType.ADD_WALLET as any, accountCoins);
}

export function* getTokensWatcher() {
  yield takeLatest(ActionType.INIT_STORE as any, getTokens);
  yield takeLatest(ActionType.SET_CURRENCY as any, getTokens);
  yield takeLatest(ActionType.REFRESH_TOKENS as any, getTokens);
  yield takeLatest(ActionType.TRANSFER_TOKEN_SUCCESS as any, getTokens);
}

export function* searchCoinsWatcher() {
  yield takeLatest(ActionType.SEARCH_COINS_REQUEST as any, searchCoins);
}

export function* getPriceOfSendTokenWatcher() {
  yield takeLatest(ActionType.SELECT_SEND_TOKEN as any, getPriceOfSendToken);
}

export function* transferTokenWatcher() {
  yield takeLatest(ActionType.TRANSFER_TOKEN_REQUEST as any, transferToken);
}

export function* getTransferTransactionWatcher() {
  yield takeLatest(
    ActionType.GET_TRANSFER_TRANSACTION as any,
    getTransferTransaction,
  );
}

export function* getTransactionsWatcher() {
  yield takeLatest(ActionType.GET_TRANSACTIONS_REQUEST as any, getTransactions);
}
