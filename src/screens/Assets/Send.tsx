import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';
import React, {useCallback, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import queryString from 'querystring';

import {
  Modal,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';
import Clipboard from '@react-native-community/clipboard';
import {RNCamera} from 'react-native-camera';
import {colors} from '@app/assets/colors.config';
import {sendTokenInfoSelector} from '@app/store/coins/coinsSelector';
import {
  getTransferTransaction,
  setToken,
  transferTokenRequest,
  updateSendTokenInfo,
} from '@app/store/coins/actions';
import BarcodeMask from 'react-native-barcode-mask';
import {useDebounce} from '@app/uses';
import {checkCameraPermission, normalizeNumber} from '@app/utils';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {StackParams} from '@app/models';
import moment from 'moment-timezone';

export const SendScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const selectedWallet = useSelector(selectedWalletSelector);
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const token = sendTokenInfo?.token;

  const insufficientBalance =
    Number(sendTokenInfo.amount || 0) > (sendTokenInfo.balance || 0);

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
    const value = (sendTokenInfo?.balance || 0).toString();
    setAmount(value);
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        amount: value,
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
      }),
    );
  };

  const onUpdateToAccount = (account: string) => {
    setToAddress(account);
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        toAccount: account,
      }),
    );
  };

  const onUpdateAmount = (value: string) => {
    setAmount(value);
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        amount: value,
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
        }),
      );
    }
  };

  const onSendToken = () => {
    dispatch(transferTokenRequest());
  };

  const onTransaction = () => {
    if (!token) {
      return;
    }

    dispatch(setToken(token));
    navigation.navigate('Transaction');
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

  const onOpenScan = async () => {
    const res = await checkCameraPermission();

    if (res) {
      setOpenScan(true);
    }
  };

  useEffect(() => {
    onUpdateSendTokenInfo();
  }, [onUpdateSendTokenInfo]);

  return (
    <BaseScreen isLoading={sendTokenInfo.isLoading}>
      <View style={[t.flex1]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag">
          <Card padding={10}>
            <Paragraph
              text={selectedWallet?.name}
              color={colors.blue}
              align="center"
              marginBottom={10}
            />
            <View style={[t.flexRow]}>
              <View style={[t.flex1, t.mL4, t.itemsCenter]}>
                <Paragraph text="Send To" align="center" marginBottom={5} />
                {focusSendAddress ? (
                  <View style={[t.h5, t.justifyCenter]}>
                    <TextInput
                      placeholder="Send to address"
                      autoFocus
                      onBlur={() => setFocusSendAddress(false)}
                      placeholderTextColor={colors.textGray}
                      value={sendTokenInfo.toAccount}
                      onChangeText={value => onUpdateToAccount(value)}
                      style={[t.flex1, t.textWhite, {fontSize: 16}]}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[t.h5, t.justifyCenter]}
                    onPress={() => setFocusSendAddress(true)}>
                    <Paragraph
                      text={sendTokenInfo.toAccount || 'Send to address'}
                      numberOfLines={1}
                      color={
                        sendTokenInfo.toAccount ? colors.white : colors.textGray
                      }
                      ellipsizeMode="middle"
                    />
                  </TouchableOpacity>
                )}
                <View style={[t.flexRow, t.mT2]}>
                  <TouchableOpacity style={[t.itemsCenter]} onPress={onPaste}>
                    <Paragraph text="Paste" size={13} />
                    <Icon name="content-paste" size={22} color={colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[t.itemsCenter, t.mL4]}
                    onPress={() => onOpenScan()}>
                    <Paragraph text="Scan" size={13} />
                    <Icon name="scan-helper" size={20} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[t.flex1, t.mL4, t.itemsCenter]}>
                <Paragraph text="Send Amount" align="center" marginBottom={5} />
                <View
                  style={[
                    t.h5,
                    t.justifyCenter,
                    t.itemsCenter,
                    t.bgGray300,
                    t.p1,
                    t.rounded,
                    t.w20,
                  ]}>
                  <TextInput
                    value={sendTokenInfo.amount}
                    onChangeText={value => onUpdateAmount(value)}
                    placeholder={sendTokenInfo?.token?.symbol.toUpperCase()}
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.textGray}
                    style={[t.flex1, t.textWhite, {fontSize: 16}]}
                  />
                </View>
                <View style={[t.mT2]}>
                  <TouchableOpacity onPress={onPressMax}>
                    <Paragraph
                      text={`Max ${sendTokenInfo?.token?.symbol.toUpperCase()}`}
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
          </Card>
          <Card borderColor={colors.secondary} padding={10}>
            <Paragraph
              text="Status of Transaction"
              align="center"
              marginBottom={10}
            />
            <View style={[t.flexRow]}>
              <Paragraph text="Status:" marginRight={10} />
              <Paragraph text={sendTokenInfo.status || '-'} />
            </View>
            <View style={[t.flexRow, t.mT2]}>
              <Paragraph text="Time of send:" marginRight={10} />
              <Paragraph
                text={
                  sendTokenInfo.date
                    ? moment(sendTokenInfo.date).format('DD MMM yyyy hh:mm A')
                    : '-'
                }
              />
            </View>
          </Card>
        </ScrollView>
      </View>
      <View>
        {insufficientBalance && (
          <Paragraph
            color={colors.secondary}
            size={12}
            align="center"
            text={`Insufficient ${
              sendTokenInfo?.token?.name
            }(${token?.symbol.toUpperCase()}) balance`}
          />
        )}
        <Button text="Tx Details" onPress={onTransaction} />
        <View style={[t.flexRow, t.mT2]}>
          <View style={[t.flex1]}>
            <Button text="Cancel" onPress={() => navigation.goBack()} />
          </View>
          <View style={[t.flex1, t.mL2]}>
            <Button
              text="Confirm"
              disabled={!sendTokenInfo.transaction || insufficientBalance}
              onPress={onSendToken}
            />
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
    </BaseScreen>
  );
};
