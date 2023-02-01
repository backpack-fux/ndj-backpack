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
import * as _ from 'lodash';
import {
  currencySelector,
  selectedWalletSelector,
} from '@app/store/wallets/walletsSelector';
import {useDebounce} from '@app/uses';
import {formatCurrency} from '@app/utils';
import {NetworkName} from '@app/constants';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {useDispatch, useSelector} from 'react-redux';
import {useWallets} from './WalletsContext';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

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
  const wallet = selectedWallet?.wallets.find(
    e => e.network === selectedToken?.network,
  );
  const {
    farcasterSearch,
    selectedFacarster,
    onChangeFarcasterSearch,
    scrollToEnd,
    onSelectFarcaster,
  } = useWallets();
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

  const debouncedToAddress = useDebounce(sendTokenInfo.toAccount, 500);
  const debouncedToAmount = useDebounce(sendTokenInfo.amount, 500);

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
    onChangeFarcasterSearch(selectedFacarster?.username || '');
    setFocusFarcaster(true);
  };

  const onFocusAmount = () => {
    setFocusAmount(true);
    setFocusFarcaster(false);
    onChangeFarcasterSearch('');
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
    if (selectedFacarster && selectedWallet?.farcaster) {
      toAccount = await selectedWallet?.farcaster?.getAddressForUser(
        selectedFacarster,
      );
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
  }, [selectedFacarster]);

  const onUpdateSendTokenInfo = useCallback(() => {
    if (
      debouncedToAddress &&
      debouncedToAmount &&
      !isNaN(Number(debouncedToAmount)) &&
      Number(debouncedToAmount) > 0
    ) {
      if (debouncedToAddress === wallet?.address) {
        return Toast.show({
          type: 'error',
          text1: 'You cannot pay yourself',
        });
      }

      dispatch(getTransferTransaction());
    }
  }, [debouncedToAddress, debouncedToAmount]);

  useEffect(() => {
    getFarcasterAddress();
  }, [getFarcasterAddress]);

  useEffect(() => {
    onUpdateSendTokenInfo();
  }, [onUpdateSendTokenInfo]);

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
    if (selectedFacarster) {
      setFocusFarcaster(false);
      onChangeFarcasterSearch('');
    }
  }, [farcasterRef, selectedFacarster]);

  useEffect(() => {
    if (isNotAllowedToken) {
      Toast.show({
        type: 'error',
        text1: `It's not support to sending ${selectedToken?.name} token on ${selectedToken?.network} network`,
      });
    }
  }, [isNotAllowedToken]);

  useEffect(() => {
    if (sendTokenInfo.isSentSuccessFully && selectedFacarster) {
      onSelectFarcaster(null);
    }
  }, [sendTokenInfo, selectedFacarster]);

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
        <View
          style={[t.w12, t.h12, t.bgGray300, t.roundedFull, t.overflowHidden]}>
          {selectedWallet?.farcaster?.user?.pfp?.url && (
            <Image
              source={{uri: selectedWallet?.farcaster?.user?.pfp?.url || ''}}
              style={[t.w12, t.h12]}
              resizeMode="cover"
            />
          )}
        </View>
        <View>
          <Paragraph text="->" />
        </View>
        <View
          style={[t.w12, t.h12, t.bgGray300, t.roundedFull, t.overflowHidden]}>
          {!!selectedFacarster?.pfp?.url && (
            <Image
              source={{uri: selectedFacarster?.pfp?.url || ''}}
              style={[t.w12, t.h12]}
              resizeMode="cover"
            />
          )}
        </View>
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
                onBlur={() => setFocusAmount(false)}
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
                text={
                  selectedFacarster
                    ? selectedFacarster.username
                    : 'farcaster username'
                }
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
