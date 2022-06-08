import React, {useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {Alert, Image, View, Dimensions} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import Share from 'react-native-share';
import {t} from 'react-native-tailwindcss';
import Clipboard from '@react-native-community/clipboard';

import {BaseScreen, QRCode, Paragraph, Button} from '@app/components';
import {AssetStackParamList} from '@app/models';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';
import {colors} from '@app/assets/colors.config';
import {showSnackbar} from '@app/utils';

const logo = require('@app/assets/images/logo.png');
let width = Dimensions.get('window').width;

const shadowQrCode = {
  shadowColor: '#fff',
  shadowOffset: {
    width: 0,
    height: 9,
  },
  shadowOpacity: 0.5,
  shadowRadius: 12.35,

  elevation: 19,
};

export const ReceiveScreen = () => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const route = useRoute<RouteProp<AssetStackParamList, 'Receive'>>();
  const [amount, setAmount] = useState(0);
  const {coin} = route.params;
  const wallet = selectedWallet?.wallets.find(w => w.network === coin?.network);
  const content = useMemo(
    () => `${wallet?.address}${amount ? `?amount=${amount}` : ''}`,
    [wallet, amount],
  );
  const onCopy = () => {
    if (!wallet) {
      return;
    }

    Clipboard.setString(wallet.address);
    showSnackbar('Copied Address!');
  };

  const onSetAmount = () => {
    Alert.prompt(
      'Enter Amount',
      '',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (value: any) => {
            if (value) {
              setAmount(value);
            }
          },
        },
      ],
      'plain-text',
      '',
      'decimal-pad',
    );
  };

  const onShare = () => {
    const title = `My Public Address to Receive${
      amount ? ` ${amount}` : ''
    } ${coin?.symbol?.toUpperCase()}`;
    Share.open({
      title,
      message: content,
    });
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
            shadowQrCode,
          ]}>
          <QRCode
            content={content}
            outerEyeStyle="rounded"
            innerEyeStyle="circle"
            codeStyle="circle"
            // logo={logo}
            logoSize={50}
            size={width * 0.6}
            backgroundColor={colors.primary}
            outerEyeColor="rgb(255,0,196)"
            innerEyeColor="rgb(0,255,139)"
            linearGradient={['rgb(115,44,249)', 'rgb(88,207,252)']}
            gradientDirection={[160, 70, 50, 220]}
          />
          <Image source={logo} style={[t.w12, t.h12, t.absolute, t.z10]} />
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
            t.mT8,
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
        </View>
      </View>
      <View style={[t.mT4]}>
        <Button
          text={
            amount
              ? `Receive ${amount} ${coin?.symbol.toUpperCase()}`
              : 'Set Amount'
          }
          onPress={onSetAmount}
        />
        <View style={[t.flexRow, t.mT2]}>
          <View style={[t.flex1]}>
            <Button text="Copy" onPress={() => onCopy} />
          </View>
          <View style={[t.flex1, t.mL2]}>
            <Button text="Share" onPress={onShare} />
          </View>
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
