import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {AssetStackParamList} from '@app/models';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {useSelector} from 'react-redux';
import {QRCode} from 'react-native-custom-qr-codes';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {colors} from '@app/assets/colors.config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-community/clipboard';
import {showSnackbar} from '@app/utils';

const logo = require('@app/assets/images/logo.png');

export const ReceiveScreen = () => {
  const navigation = useNavigation();
  const selectedWallet = useSelector(selectedWalletSelector);
  const route = useRoute<RouteProp<AssetStackParamList, 'Receive'>>();
  const {coin} = route.params;
  const wallet = selectedWallet?.wallets.find(w => w.network === coin?.network);

  const onCopy = () => {
    if (!wallet) {
      return;
    }

    Clipboard.setString(wallet.address);
    showSnackbar('Copied Address!');
  };

  return (
    <BaseScreen>
      <View style={[t.flex1, t.itemsCenter, t.justifyCenter]}>
        <View
          style={[
            t.bgPurple500,
            t.itemsCenter,
            t.justifyCenter,
            t.p2,
            t.roundedXl,
          ]}>
          <QRCode
            content={wallet?.address}
            outerEyeStyle="square"
            innerEyeStyle="circle"
            codeStyle="circle"
            logo={logo}
            logoSize={50}
            backgroundColor={colors.primary}
            linearGradient={['rgb(0,255,255)', colors.primaryLight]}
            gradientDirection={[0, 300, 100, 0]}
          />
        </View>
        <View
          style={[
            t.flexRow,
            shadow,
            t.bgPurple500,
            t.pT2,
            t.pB2,
            t.pL4,
            t.pR4,
            {borderRadius: 20},
            t.mT2,
            t.mB4,
            t.border2,
            t.borderPurple200,
            t.itemsCenter,
          ]}>
          <Paragraph text={`${coin?.symbol.toUpperCase()} Address: `} />
          <View style={[t.flex1]}>
            <Paragraph
              text={wallet?.address}
              numberOfLines={1}
              ellipsizeMode="middle"
            />
          </View>
          <TouchableOpacity onPress={onCopy}>
            <Icon name="content-copy" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </BaseScreen>
  );
};

const shadow = {
  shadowColor: '#fff',
  shadowOffset: {
    width: 0,
    height: 5,
  },
  shadowOpacity: 0.6,
  shadowRadius: 1,

  elevation: 5,
};
