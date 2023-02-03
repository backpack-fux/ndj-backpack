import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as _ from 'lodash';
import {t} from 'react-native-tailwindcss';
import {useDispatch, useSelector} from 'react-redux';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

import {colors} from '@app/assets/colors.config';
import {Paragraph} from '@app/components';
import {
  getTransferTransaction,
  updateSendTokenInfo,
} from '@app/store/coins/actions';
import {
  sendTokenInfoSelector,
  tokenSelector,
  tokensSelector,
} from '@app/store/coins/coinsSelector';
import {
  currencySelector,
  selectedWalletSelector,
} from '@app/store/wallets/walletsSelector';

import {formatCurrency} from '@app/utils';
import {NetworkName} from '@app/constants';
import {useWallets} from './WalletsContext';
import {FarcasterIcon} from './FarcasterIcon';

const fontSize = 14;
const inputHeight = 25;

export const Farcaster = () => {
  const dispatch = useDispatch();
  const farcasterRef = useRef<any>();
  const selectedWallet = useSelector(selectedWalletSelector);
  const tokens = useSelector(tokensSelector);
  const currency = useSelector(currencySelector);
  const selectedToken = useSelector(tokenSelector);
  const [focusAmount, setFocusAmount] = useState(false);
  const [focusFarcaster, setFocusFarcaster] = useState(false);
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const farcaster = useMemo(() => sendTokenInfo.farcaster, [sendTokenInfo]);
  const {farcasterSearch, onChangeFarcasterSearch, scrollToEnd} = useWallets();
  const isNotAllowedToken = useMemo(
    () =>
      selectedToken &&
      ![
        NetworkName.ethereum,
        NetworkName.binanceSmartChain,
        NetworkName.polygon,
      ].includes(selectedToken?.network),
    [selectedToken],
  );

  const toAddress = useMemo(() => sendTokenInfo.toAccount, [sendTokenInfo]);
  const tokenList = (selectedWallet && tokens[selectedWallet.id]) || [];

  const totalBalance = tokenList
    .filter(token => token.id === selectedToken?.id)
    .reduce(
      (total, token) => total + (token.price || 0) * (token.balance || 0),
      0,
    );

  const onChangeFarcasterUserName = (value: string) => {
    onChangeFarcasterSearch(value);
  };

  const onBlueFarcasterSearach = () => {
    scrollToEnd(100);
  };

  const onFocusFarcasterUserName = () => {
    onChangeFarcasterSearch(farcaster?.username || '');
    setFocusFarcaster(true);
  };

  const onFocusAmount = () => {
    setFocusAmount(true);
    setFocusFarcaster(false);
    onChangeFarcasterSearch('');
  };

  const onBlurAmount = () => {
    setFocusAmount(false);
    sendGetTransactionRequest();
  };

  const onChangeAmount = (value: string) => {
    const tokenAmountUSD = !_.isNaN(Number(value)) ? Number(value) : 0;
    const tokenAmount = selectedToken?.price
      ? (tokenAmountUSD / selectedToken.price).toFixed(3)
      : '';

    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        amount: tokenAmount,
        amountUSD: value,
        transaction: undefined,
        isSentSuccessFully: false,
        isSendMax: false,
      }),
    );
  };

  const getFarcasterAddress = useCallback(async () => {
    let toAccount;
    if (farcaster && selectedWallet?.farcaster) {
      toAccount = await selectedWallet?.farcaster?.getAddressForUser(farcaster);
    }

    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        toAccount,
        transaction: undefined,
        isSentSuccessFully: false,
        isSendMax: false,
      }),
    );
  }, [farcaster]);

  const sendGetTransactionRequest = () => {
    if (
      sendTokenInfo.toAccount &&
      sendTokenInfo.amount &&
      !isNaN(Number(sendTokenInfo.amount)) &&
      Number(sendTokenInfo.amount) > 0
    ) {
      dispatch(getTransferTransaction());
    }
  };

  useEffect(() => {
    sendGetTransactionRequest();
  }, [toAddress]);

  useEffect(() => {
    getFarcasterAddress();
  }, [getFarcasterAddress]);

  useEffect(() => {
    if (!sendTokenInfo.token && selectedToken) {
      dispatch(
        updateSendTokenInfo({
          token: selectedToken,
        }),
      );
    }
  }, [sendTokenInfo, selectedToken]);

  useEffect(() => {
    if (farcaster) {
      setFocusFarcaster(false);
      onChangeFarcasterSearch('');
    }
  }, [farcasterRef, farcaster]);

  useEffect(() => {
    if (isNotAllowedToken) {
      Toast.show({
        type: 'error',
        text1: `It's not supported to send ${selectedToken?.name} token on ${selectedToken?.network} network`,
      });
    }
  }, [isNotAllowedToken]);

  return (
    <View>
      <View style={[t.pT1, t.pB4]}>
        <Paragraph text={selectedWallet?.name} align="center" type="bold" />
      </View>
      <View style={[t.itemsCenter, t.justifyCenter, t.mB4]}>
        <View
          style={[
            t.bgGray300,
            t.mL4,
            t.mR4,
            t.roundedLg,
            t.itemsCenter,
            t.justifyCenter,
            t.w40,
            {height: 30},
          ]}>
          <Paragraph text={formatCurrency(totalBalance, currency)} />
        </View>
      </View>
      <View style={[t.flexRow, t.justifyAround, t.itemsCenter]}>
        <FarcasterIcon
          uri={selectedWallet?.farcaster?.user?.pfp?.url}
          size={45}
        />
        <View>
          <Paragraph text="->" />
        </View>
        <FarcasterIcon uri={farcaster?.pfp?.url} size={45} />
      </View>
      <View style={[t.flex, t.flexRow, t.mT3]}>
        <View style={[t.bgGray300, t.roundedLg, t.flex1]}>
          {!focusAmount ? (
            <TouchableOpacity
              onPress={() => onFocusAmount()}
              style={[
                t.flex,
                t.flexRow,
                t.justifyCenter,
                t.itemsCenter,
                {height: inputHeight},
              ]}>
              <Paragraph text="$" size={14} marginRight={2} />
              <Paragraph
                text={
                  sendTokenInfo.amountUSD ? sendTokenInfo.amountUSD : 'amount'
                }
                size={14}
              />
              <Paragraph
                text={`as ${selectedToken?.symbol.toUpperCase()}`}
                size={10}
                marginLeft={3}
              />
            </TouchableOpacity>
          ) : (
            <View
              style={[
                t.flex,
                t.flexRow,
                t.justifyCenter,
                t.itemsCenter,
                {height: inputHeight},
              ]}>
              <Paragraph text="$" size={14} marginRight={2} />
              <TextInput
                autoFocus
                editable={!sendTokenInfo.isLoading && !isNotAllowedToken}
                onBlur={() => onBlurAmount()}
                placeholderTextColor={colors.white}
                value={sendTokenInfo.amountUSD}
                onChangeText={value => onChangeAmount(value)}
                textAlign="center"
                keyboardType="decimal-pad"
                style={[t.textCenter, t.textWhite, t.p0, t.m0, {fontSize}]}
              />
            </View>
          )}
        </View>
        <View style={[t.bgGray300, t.roundedLg, t.flex1, t.mL4]}>
          {!focusFarcaster ? (
            <TouchableOpacity
              onPress={() => onFocusFarcasterUserName()}
              style={[
                t.flex,
                t.flexRow,
                t.justifyCenter,
                t.itemsCenter,
                {height: inputHeight},
              ]}>
              <Paragraph text="@" size={14} marginRight={2} />
              <Paragraph
                text={farcaster ? farcaster.username : 'farcaster username'}
                size={14}
              />
            </TouchableOpacity>
          ) : (
            <View
              style={[
                t.flex,
                t.flexRow,
                t.justifyCenter,
                t.itemsCenter,
                {height: inputHeight},
              ]}>
              <Paragraph text="@" size={14} marginRight={2} />
              <TextInput
                autoFocus
                ref={farcasterRef}
                editable={!sendTokenInfo.isLoading && !isNotAllowedToken}
                placeholderTextColor={colors.white}
                onBlur={() => onBlueFarcasterSearach()}
                value={farcasterSearch}
                onChangeText={onChangeFarcasterUserName}
                textAlign="center"
                style={[t.textCenter, t.textWhite, t.p0, t.m0, {fontSize}]}
              />
            </View>
          )}
        </View>
      </View>
      {sendTokenInfo.isLoading && (
        <View
          style={[
            t.hFull,
            t.wFull,
            t.absolute,
            t.itemsCenter,
            t.justifyCenter,
          ]}>
          <ActivityIndicator color={colors.white} size="large" />
        </View>
      )}
    </View>
  );
};
