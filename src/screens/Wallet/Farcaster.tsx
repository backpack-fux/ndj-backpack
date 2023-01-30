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
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
  const selectedCoin = useSelector(tokenSelector);
  const [focusAmount, setFocusAmount] = useState(false);
  const [focusFarcaster, setFocusFarcaster] = useState(false);
  const [amount, setAmount] = useState('');
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const wallet = selectedWallet?.wallets.find(
    e => e.network === selectedCoin?.network,
  );
  const {farcasterSearch, selectedFacarster, onChangeFarcasterSearch} =
    useWallets();

  const debouncedToUSDAmount = useDebounce(amount, 500);
  const debouncedToAddress = useDebounce(sendTokenInfo.toAccount, 500);
  const debouncedToAmount = useDebounce(sendTokenInfo.amount, 500);

  const tokenList = (selectedWallet && tokens[selectedWallet.id]) || [];

  const totalBalance = tokenList
    .filter(token => token.id === selectedCoin?.id)
    .reduce(
      (total, token) => total + (token.price || 0) * (token.balance || 0),
      0,
    );

  const onChangeFarcasterUserName = (value: string) => {
    onChangeFarcasterSearch(value);
  };

  const onBlurFarcasterUserName = () => {
    setFocusFarcaster(false);
    onChangeFarcasterSearch('');
  };

  const onFocusFarcasterUserName = () => {
    onChangeFarcasterSearch(selectedFacarster?.username || '');
    setFocusFarcaster(true);
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
        isSendMax: false,
      }),
    );
  }, [selectedFacarster]);

  useEffect(() => {
    const tokenAmountUSD = !_.isNaN(Number(debouncedToUSDAmount))
      ? Number(debouncedToUSDAmount)
      : 0;
    const tokenAmount = selectedCoin?.price
      ? (tokenAmountUSD / selectedCoin.price).toFixed(3)
      : '';

    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        amount: tokenAmount,
        transaction: undefined,
        isSendMax: false,
      }),
    );
  }, [debouncedToUSDAmount, selectedCoin]);

  const onUpdateSendTokenInfo = useCallback(() => {
    console.log(debouncedToAddress, 'debouncedToAmount', debouncedToAmount);
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
    if (!sendTokenInfo.token && selectedCoin) {
      dispatch(
        updateSendTokenInfo({
          token: selectedCoin,
        }),
      );
    }
  }, [sendTokenInfo, selectedCoin]);

  useEffect(() => {
    if (farcasterRef.current && selectedFacarster) {
      farcasterRef.current.blur();
    }
  }, [farcasterRef, selectedFacarster]);

  useEffect(() => {
    return () => {
      setAmount('');
    };
  }, []);

  useEffect(() => {
    setAmount('');
  }, [selectedCoin]);

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
              onPress={() => setFocusAmount(true)}
              style={[
                t.flex,
                t.flexRow,
                t.justifyCenter,
                t.itemsCenter,
                {height: inputHeight},
              ]}>
              <Paragraph text="$" size={14} marginRight={2} />
              <Paragraph text={amount ? amount : 'amount'} size={14} />
              <Paragraph
                text={`as ${selectedCoin?.symbol.toUpperCase()}`}
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
                editable={!sendTokenInfo.isLoading}
                onBlur={() => setFocusAmount(false)}
                placeholderTextColor={colors.white}
                value={amount}
                onChangeText={value => setAmount(value)}
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
                editable={!sendTokenInfo.isLoading}
                onBlur={onBlurFarcasterUserName}
                placeholderTextColor={colors.white}
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
