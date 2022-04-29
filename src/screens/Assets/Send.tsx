import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {AssetStackParamList} from '@app/models';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  Image,
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '@app/assets/colors.config';
import {sendTokenInfoSelector} from '@app/store/coins/coinsSelector';
import {updateSendTokenInfo} from '@app/store/coins/actions';
import BarcodeMask from 'react-native-barcode-mask';

const icon = require('@app/assets/images/icon.png');

export const SendScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const selectedWallet = useSelector(selectedWalletSelector);
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const route = useRoute<RouteProp<AssetStackParamList, 'Receive'>>();
  const {coin} = route.params;
  const wallet = selectedWallet?.wallets.find(w => w.network === coin?.network);

  const [openScan, setOpenScan] = useState(false);

  const onBarCodeRead = (data: any) => {
    const address = data.replace(/\ethereum:/g, '');
    onUpdateToAccount(address);
    setOpenScan(false);
  };

  const onPressMax = () => {
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        amount: (sendTokenInfo?.balance || 0).toString(),
      }),
    );
  };

  const onUpdateToAccount = (account: string) => {
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        toAccount: account,
      }),
    );
  };

  const onUpdateAmount = (amount: string) => {
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        amount,
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
        }),
      );
    }
  };

  return (
    <BaseScreen>
      <View style={[t.flex1]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card padding={10}>
            <Paragraph text="Send" align="center" marginBottom={10} />
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="Asset" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={`${coin?.name.toUpperCase()} (${coin?.symbol.toUpperCase()})`}
                  align="right"
                />
              </View>
            </View>
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="From" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={wallet?.address}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  align="right"
                />
              </View>
            </View>
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="To" marginLeft={10} marginRight={10} />
              <View style={[t.flex1, t.flexRow]}>
                <TextInput
                  placeholder=""
                  placeholderTextColor={colors.textGray}
                  value={sendTokenInfo.toAccount}
                  onChangeText={value => onUpdateToAccount(value)}
                  style={[t.flex1, t.textWhite, {fontSize: 16}]}
                />
                <TouchableOpacity onPress={onPaste} style={[t.pL2, t.pR2]}>
                  <Paragraph text="Paste" type="bold" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setOpenScan(true)}
                  style={[t.pL2, t.itemsCenter, t.justifyCenter]}>
                  <Icon name="scan-helper" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="Send Amount" marginLeft={10} marginRight={10} />
              <View style={[t.flex1, t.flexRow, t.itemsCenter]}>
                <TextInput
                  value={sendTokenInfo.amount}
                  onChangeText={value => onUpdateAmount(value)}
                  placeholder={sendTokenInfo?.token?.symbol.toUpperCase()}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textGray}
                  style={[t.flex1, t.textWhite, t.textRight]}
                />
                <TouchableOpacity onPress={onPressMax} style={[t.pL2]}>
                  <Paragraph text="Max" type="bold" />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
          <Card padding={10}>
            <Paragraph text="Receiver" align="center" marginBottom={10} />
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="Gets" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={'-'}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  align="right"
                />
              </View>
            </View>
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="Network Fee" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={'-'}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  align="right"
                />
              </View>
            </View>
          </Card>
          <Card padding={10}>
            <Paragraph text="Total" align="center" marginBottom={10} />
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="Max Total" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={'-'}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  align="right"
                />
              </View>
            </View>
          </Card>
        </ScrollView>
      </View>
      <View>
        <Button text="Confirm" onPress={() => navigation.goBack()} />
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
