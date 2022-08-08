import {Paragraph} from '@app/components';
import React, {useCallback, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import * as queryString from 'query-string';

import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';
import Clipboard from '@react-native-community/clipboard';
import {RNCamera} from 'react-native-camera';
import {colors} from '@app/assets/colors.config';
import {
  sendTokenInfoSelector,
  tokenSelector,
  tokensSelector,
} from '@app/store/coins/coinsSelector';
import {
  getTransferTransaction,
  selectSendToken,
  updateSendTokenInfo,
} from '@app/store/coins/actions';
import BarcodeMask from 'react-native-barcode-mask';
import {useDebounce} from '@app/uses';
import {normalizeNumber} from '@app/utils';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';

export const Send = () => {
  const dispatch = useDispatch();
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const selectedCoin = useSelector(tokenSelector);
  const selectedWallet = useSelector(selectedWalletSelector);

  const allTokens = useSelector(tokensSelector);

  const token = ((selectedWallet && allTokens[selectedWallet.id]) || []).find(
    a => a.contractAddress === sendTokenInfo.token?.contractAddress,
  );

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [openScan, setOpenScan] = useState(false);
  const [focusSendAddress, setFocusSendAddress] = useState(false);

  const debouncedToAddress = useDebounce(toAddress, 500);
  const debouncedToAmount = useDebounce(amount, 500);

  const onBarCodeRead = (data: any) => {
    const dataArray = data.split('?');
    const addressData = dataArray[0];
    const query = dataArray[1];
    const addressArray = addressData && addressData.split(':');
    const address =
      addressArray.length === 1 ? addressArray[0] : addressArray[1];
    let sendAmount: any = null;

    if (query) {
      const params = queryString.parse(query);

      if (params.amount) {
        sendAmount = params.amount as string;
      }
    }

    if (address && sendAmount) {
      onUpdateAccountWithAmount(address, sendAmount);
    } else if (address) {
      onUpdateToAccount(address);
    } else if (sendAmount) {
      onUpdateAmount(sendAmount);
    }

    setOpenScan(false);
  };

  const onPressMax = () => {
    const value = (token?.balance || 0).toString();
    setAmount(value);
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        isSendMax: true,
        amount: value,
        transaction: undefined,
      }),
    );
  };

  const onUpdateAccountWithAmount = (account: string, amount: string) => {
    setToAddress(account);
    setAmount(amount);
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        toAccount: account,
        amount,
        isSendMax: false,
        transaction: undefined,
      }),
    );
  };

  const onUpdateToAccount = (account: string) => {
    setToAddress(account);
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        toAccount: account,
        transaction: undefined,
      }),
    );
  };

  const onUpdateAmount = (value: string) => {
    setAmount(value);
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        amount: value,
        transaction: undefined,
        isSendMax: false,
      }),
    );
  };

  const onPaste = async () => {
    const content = await Clipboard.getString();

    if (content) {
      setToAddress(content);

      dispatch(
        updateSendTokenInfo({
          ...sendTokenInfo,
          toAccount: content,
          transaction: undefined,
        }),
      );
    }
  };

  const onUpdateSendTokenInfo = useCallback(() => {
    if (
      debouncedToAddress &&
      debouncedToAmount &&
      !isNaN(Number(debouncedToAmount)) &&
      Number(debouncedToAmount) > 0
    ) {
      dispatch(getTransferTransaction());
    }
  }, [debouncedToAddress, debouncedToAmount]);

  useEffect(() => {
    onUpdateSendTokenInfo();
  }, [onUpdateSendTokenInfo]);

  useEffect(() => {
    if (selectedCoin) {
      dispatch(selectSendToken(selectedCoin));
    }
  }, [selectedCoin]);

  return (
    <View>
      <View style={[t.pT1, t.pB4]}>
        <Paragraph text={'Send a Transaction'} align="center" type="bold" />
      </View>
      <View style={[t.flexRow]}>
        <View style={[t.flex1, t.mL4, t.itemsCenter]}>
          <Paragraph text="Send To" align="center" marginBottom={10} />
          {focusSendAddress ? (
            <View style={[{height: 30}, t.justifyCenter]}>
              <TextInput
                placeholder="Send to address"
                autoFocus
                editable={!sendTokenInfo.isLoading}
                onBlur={() => setFocusSendAddress(false)}
                placeholderTextColor={colors.textGray}
                value={sendTokenInfo.toAccount}
                onChangeText={value => onUpdateToAccount(value)}
                style={[t.flex1, t.textWhite, {fontSize: 16}]}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[{height: 30}, t.justifyCenter]}
              onPress={() => setFocusSendAddress(true)}>
              <Paragraph
                text={sendTokenInfo.toAccount || 'Send to address'}
                numberOfLines={1}
                color={sendTokenInfo.toAccount ? colors.white : colors.textGray}
                ellipsizeMode="middle"
              />
            </TouchableOpacity>
          )}
          <View style={[t.flexRow, t.mT4, t.justifyAround, t.wFull]}>
            <TouchableOpacity style={[t.itemsCenter]} onPress={onPaste}>
              <Paragraph text="Paste" size={13} />
              <Icon name="content-paste" size={22} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[t.itemsCenter, t.mL4]}
              onPress={() => setOpenScan(true)}>
              <Paragraph text="Scan" size={13} />
              <Icon name="scan-helper" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[t.flex1, t.mL4, t.itemsCenter, t.wFull]}>
          <Paragraph text="Send Amount" align="center" marginBottom={10} />
          <View
            style={[
              t.wFull,
              t.bgGray300,
              t.mL4,
              t.mR4,
              t.roundedLg,
              t.itemsCenter,
              t.justifyCenter,
              {height: 30},
            ]}>
            <TextInput
              value={sendTokenInfo.amount}
              onChangeText={value => onUpdateAmount(value)}
              placeholder={token?.symbol.toUpperCase()}
              keyboardType="decimal-pad"
              editable={!sendTokenInfo.isLoading}
              placeholderTextColor={colors.textGray}
              style={[
                t.flex1,
                t.p0,
                t.m0,
                t.textWhite,
                t.wFull,
                t.textCenter,
                {fontSize: 16},
              ]}
            />
          </View>
          <View style={[t.mT4]}>
            <TouchableOpacity onPress={onPressMax}>
              <Paragraph
                text={`Max ${token?.symbol.toUpperCase()}`}
                size={13}
                align="center"
              />
              <Paragraph
                text={normalizeNumber(token?.balance).toString()}
                numberOfLines={1}
                align="center"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal visible={openScan} animationType="slide">
        <View style={t.flex1}>
          <RNCamera
            style={[t.flex1]}
            onBarCodeRead={e => onBarCodeRead(e.data)}
            captureAudio={false}
            barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}>
            <BarcodeMask showAnimatedLine={false} />
            <SafeAreaView>
              <TouchableOpacity
                onPress={() => setOpenScan(false)}
                style={[t.selfEnd, t.mR4]}>
                <Icon name="close" color={colors.white} size={30} />
              </TouchableOpacity>
            </SafeAreaView>
          </RNCamera>
        </View>
      </Modal>
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
