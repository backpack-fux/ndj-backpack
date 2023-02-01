import {Paragraph} from '@app/components';
import React, {useCallback, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';
import RNQRGenerator from 'rn-qr-generator';
import {useDispatch, useSelector} from 'react-redux';
import * as queryString from 'query-string';
import Toast from 'react-native-toast-message';
import {
  ActivityIndicator,
  Modal,
  Platform,
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
  updateSendTokenInfo,
} from '@app/store/coins/actions';
import BarcodeMask from 'react-native-barcode-mask';
import {useDebounce} from '@app/uses';
import {getNativeToken, normalizeNumber} from '@app/utils';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';
import {PERMISSIONS} from 'react-native-permissions';
import {ToastContainer} from '@app/components/toast';
import {checkPermission} from '@app/constants/permission';

const fontSize = 16;
const inputHeight = 30;

export const Send = () => {
  const dispatch = useDispatch();
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const selectedCoin = useSelector(tokenSelector);
  const selectedWallet = useSelector(selectedWalletSelector);

  const allTokens = useSelector(tokensSelector);
  const wallet = selectedWallet?.wallets.find(
    e => e.network === selectedCoin?.network,
  );
  const token = ((selectedWallet && allTokens[selectedWallet.id]) || []).find(
    a => a.contractAddress === selectedCoin?.contractAddress,
  );
  const nativeToken = token && getNativeToken(token);
  const [openScan, setOpenScan] = useState(false);
  const [focusSendAddress, setFocusSendAddress] = useState(false);
  const [isDetectingQrCode, setIsDetectingQrCode] = useState(false);

  const debouncedToAddress = useDebounce(sendTokenInfo.toAccount, 500);
  const debouncedToAmount = useDebounce(sendTokenInfo.amount, 500);

  const onBarCodeRead = (data: string) => {
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

    onUpdateAccountWithAmount(address, sendAmount);

    setOpenScan(false);
  };

  const onPressMax = () => {
    const value = (token?.balance || 0).toString();
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        isSendMax: true,
        amount: value,
        isSentSuccessFully: false,
        transaction: undefined,
      }),
    );
  };

  const onUpdateAccountWithAmount = (account: string, amountValue: string) => {
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        toAccount: account,
        amount: amountValue,
        isSentSuccessFully: false,
        isSendMax: false,
        transaction: undefined,
      }),
    );
  };

  const onUpdateToAccount = (account: string) => {
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        toAccount: account,
        isSentSuccessFully: false,
        transaction: undefined,
      }),
    );
  };

  const onUpdateAmount = (value: string) => {
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        amount: value,
        isSentSuccessFully: false,
        transaction: undefined,
        isSendMax: false,
      }),
    );
  };

  const onPaste = async () => {
    const content = await Clipboard.getString();

    if (content) {
      dispatch(
        updateSendTokenInfo({
          ...sendTokenInfo,
          toAccount: content,
          isSentSuccessFully: false,
          transaction: undefined,
        }),
      );
    }
  };

  const onOpenScan = async () => {
    const res = await checkPermission(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA,
    );

    if (res) {
      setOpenScan(true);
    }
  };

  const onOpenPhotos = async () => {
    try {
      const access = await checkPermission(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
          : PERMISSIONS.IOS.PHOTO_LIBRARY,
      );

      if (!access) {
        return;
      }

      const res = await ImagePicker.openPicker({
        multiple: false,
      }).catch(() => {
        //
      });

      if (!res) {
        return;
      }

      setIsDetectingQrCode(true);

      const qrcode = await RNQRGenerator.detect({
        uri: res?.sourceURL,
      })
        .then(response => response.values[0])
        .catch(() => {
          throw new Error("Can't detect QR code in image");
        });

      if (!qrcode) {
        throw new Error("Can't detect QR code in image");
      }

      onBarCodeRead(qrcode);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message,
      });
    } finally {
      setIsDetectingQrCode(false);
    }
  };

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

  return (
    <View>
      <View style={[t.pT1, t.pB4]}>
        <Paragraph text={'Send a Transaction'} align="center" type="bold" />
      </View>
      <View style={[t.flexRow]}>
        <View style={[t.flex1, t.mL4, t.itemsCenter]}>
          <Paragraph text="Send To" align="center" marginBottom={10} />
          {focusSendAddress ? (
            <View style={[{height: inputHeight}, t.justifyCenter]}>
              <TextInput
                placeholder="Send to address"
                autoFocus
                editable={!sendTokenInfo.isLoading}
                onBlur={() => setFocusSendAddress(false)}
                placeholderTextColor={colors.textGray}
                value={sendTokenInfo.toAccount}
                onChangeText={value => onUpdateToAccount(value)}
                style={[
                  t.flex1,
                  t.textCenter,
                  t.textWhite,
                  t.p0,
                  t.m0,
                  {fontSize},
                ]}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[{height: inputHeight}, t.flex1, t.justifyCenter]}
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
              onPress={() => onOpenScan()}>
              <Paragraph text="Scan" size={13} />
              <Icon name="scan-helper" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[t.flex1, t.mL4, t.itemsCenter, t.wFull]}>
          <Paragraph text="Send Amount" align="center" marginBottom={10} />
          <View style={[t.flexRow, t.itemsCenter, t.justifyCenter]}>
            <View
              style={[
                t.flex1,
                t.bgGray300,
                t.mL4,
                t.mR4,
                t.pL2,
                t.pR2,
                t.roundedLg,
                t.itemsCenter,
                t.justifyCenter,
                {height: inputHeight},
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
                  {
                    fontSize,
                    color:
                      Number(sendTokenInfo.amount || 0) > (token?.balance || 0)
                        ? colors.secondary
                        : colors.white,
                  },
                ]}
              />
            </View>
            <TouchableOpacity onPress={onPressMax}>
              <Paragraph text="Max" />
            </TouchableOpacity>
          </View>

          <View style={[t.mT4]}>
            <View>
              <Paragraph text={'Fee'} size={13} align="center" />
              <Paragraph
                text={
                  sendTokenInfo?.fee === undefined
                    ? '-'
                    : `${normalizeNumber(sendTokenInfo?.fee)} ${
                        nativeToken ? nativeToken?.symbol.toUpperCase() : ''
                      }`
                }
                numberOfLines={1}
                align="center"
              />
            </View>
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
            <SafeAreaView style={[t.flex1]}>
              <View style={[t.flex1]}>
                <TouchableOpacity
                  onPress={() => setOpenScan(false)}
                  style={[t.mL4]}>
                  <Icon name="close" color={colors.white} size={30} />
                </TouchableOpacity>
              </View>
              {isDetectingQrCode && (
                <View style={[t.mT4]}>
                  <ActivityIndicator size="large" color={colors.white} />
                </View>
              )}
              <TouchableOpacity
                style={[t.selfEnd, t.mR4, t.mB4]}
                onPress={() => onOpenPhotos()}>
                <Icon
                  name="image-multiple-outline"
                  color={colors.white}
                  size={30}
                />
              </TouchableOpacity>
            </SafeAreaView>
          </RNCamera>
        </View>
        <ToastContainer />
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
