import {delay, put, select, takeLatest} from 'redux-saga/effects';
import {
  ActionType,
  BaseCoin,
  Token,
  CoinGeckoCoinDetail,
  RootState,
  Wallet,
  Action,
  ITransaction,
  CoinGeckoCoin,
} from '@app/models';
import * as _ from 'lodash';
import moment from 'moment-timezone';
import Toast from 'react-native-toast-message';

import {getCoinGeckoCoinList, getCoinGeckoDetail} from '@app/apis';
import {networkList, NetworkName} from '@app/constants';
import {
  getBaseCoinsSuccess,
  getTransactionsFailed,
  getTransactionsSuccess,
  searchCoinsResponse,
  setAccountCoins,
  setIsLoadingTokens,
  setSendTokenLoading,
  setTokens,
  transferTokenSuccess,
  updateSendTokenInfo,
} from '../actions';
import {DEFAULT_COINS} from '@app/constants/coins';
import {WalletService} from '@app/services';
import {closeetBaseCoins} from '@app/utils';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';
import {refreshWallets} from '@app/store/wallets/actions';
import {sqliteService} from '@app/services/sqllite';

function* getBaseCoins() {
  try {
    yield delay(1000);
    const state: RootState = yield select();
    const baseCoinExpiresAt =
      state.coins.baseCoinExpiresAt && moment(state.coins.baseCoinExpiresAt);

    const now = moment();

    if (baseCoinExpiresAt && baseCoinExpiresAt.isAfter(now)) {
      yield put(getBaseCoinsSuccess(false));
      return;
    }

    const coins: CoinGeckoCoin[] = yield getCoinGeckoCoinList();
    const baseCoins: BaseCoin[] = [];

    for (const coin of coins) {
      if (_.isEmpty(coin.platforms)) {
        continue;
      }

      for (const platform of Object.keys(coin.platforms)) {
        const network = networkList.find(item => item.network === platform);

        if (!network) {
          continue;
        }

        baseCoins.push({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          contractAddress: coin.platforms[platform],
          network: platform as NetworkName,
        });
      }
    }

    yield sqliteService.setBaseCoins(baseCoins);
    yield put(getBaseCoinsSuccess(true));
  } catch (err) {
    yield put(getBaseCoinsSuccess(false));
  }
}

function* accountCoins({payload}: Action<Wallet>) {
  const state: RootState = yield select();

  if (state.coins.accountCoins.length) {
    return;
  }

  const coins = payload.network
    ? DEFAULT_COINS.filter(coin => coin.network === payload.network)
    : DEFAULT_COINS;

  yield put(setAccountCoins(coins));
  yield put(refreshWallets());
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
    let enabledCoins = walletCoins.filter(
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
    const searchKey = payload.toLowerCase().trim();

    if (!searchKey) {
      yield put(searchCoinsResponse([]));
      return;
    }

    const baseCoins: BaseCoin[] = yield sqliteService.searchBaseCoins(
      searchKey,
    );

    const searchedDefaultCoins = DEFAULT_COINS.filter(coin =>
      coin.name.toLowerCase().includes(searchKey),
    );

    const searchedCoins = closeetBaseCoins(baseCoins, searchKey)
      .filter(c => !searchedDefaultCoins.map(d => d.id).includes(c.id))
      .filter(c =>
        networkList.map(network => network.network).includes(c.network),
      )
      .slice(0, 100);
    let result = searchedDefaultCoins.concat(searchedCoins);

    if (!result.length) {
      yield put(searchCoinsResponse([]));
      return;
    }

    const res: CoinGeckoCoinDetail[] = yield getCoinGeckoDetail(result, 'usd');

    const newCoins: BaseCoin[] = [];
    for (const coin of result) {
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
            ...token,
            image: details?.image,
            price: details?.current_price,
            highPrice: details?.high_24h,
            lowPrice: details?.low_24h,
            priceChange: details?.price_change_24h,
            priceChangePercent: details?.price_change_percentage_24h,
          } as Token,
          transaction: undefined,
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
        sendTokenInfo.isSendMax,
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
    Toast.show({
      type: 'error',
      text1: err.message,
    });
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
      Toast.show({
        type: 'success',
        text1: `Transferred ${
          sendTokenInfo.amount
        } ${sendTokenInfo.token.symbol.toUpperCase()} successfully`,
      });
    }
  } catch (err: any) {
    Toast.show({
      type: 'error',
      text1: err.message,
    });
  } finally {
    yield put(setSendTokenLoading(false));
  }
}

export function* getTransactions({
  payload,
}: Action<{
  token: BaseCoin;
  page: number;
  limit: number;
}>) {
  const token = payload.token;
  try {
    const state: RootState = yield select();
    const selectedWallet = selectedWalletSelector(state);

    if (!selectedWallet) {
      return;
    }

    const wallet = selectedWallet.wallets.find(
      w => w.network === token.network,
    );

    if (!wallet) {
      return;
    }

    const transactions: ITransaction[] = yield WalletService.getTransactions(
      token.network,
      wallet.address,
      token.contractAddress !== token.network
        ? token.contractAddress
        : undefined,
      payload.page,
      payload.limit,
    );

    yield put(getTransactionsSuccess({transactions, page: payload.page}));
  } catch (err: any) {
    Toast.show({
      type: 'error',
      text1: err.message,
    });
    yield put(getTransactionsFailed(err.message));
  }
}

export function* accountCoinsWatcher() {
  yield takeLatest(ActionType.ADD_WALLET as any, accountCoins);
}

export function* getTokensWatcher() {
  yield takeLatest(ActionType.INIT_STORE as any, getTokens);
  yield takeLatest(ActionType.SET_CURRENCY as any, getTokens);
  yield takeLatest(ActionType.REFRESH_WALLETS as any, getTokens);
  yield takeLatest(ActionType.ADD_WALLET as any, getTokens);
  yield takeLatest(ActionType.TRANSFER_TOKEN_SUCCESS as any, getTokens);
  yield takeLatest(ActionType.SWITCH_NETWORK as any, getTokens);
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

export function* getBaseCoinsWatcher() {
  yield takeLatest(ActionType.GET_BASE_COINS as any, getBaseCoins);
}
