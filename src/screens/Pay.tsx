import React from 'react';
import {Image, ScrollView, TouchableOpacity} from 'react-native';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {t} from 'react-native-tailwindcss';
import {useSelector} from 'react-redux';

import {BaseScreen, Paragraph} from '@app/components';
import {networkSelector} from '@app/store/wallets/walletsSelector';
import {StackParams} from '@app/models';
import {storefrontUrl} from '@app/constants/storefront';

const logo = require('@app/assets/images/logo.png');

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

export const PayScreen = () => {
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const network = useSelector(networkSelector);

  return (
    <BaseScreen>
      <ScrollView>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Webwiew', {
              title: 'Storefront',
              url: storefrontUrl[network],
            })
          }
          style={[
            t.bgPurple500,
            t.pT2,
            t.pB2,
            t.pL4,
            t.pR4,
            t.border2,
            t.borderPurple200,
            t.roundedXl,
            t.flexRow,
            t.itemsCenter,
            shadow,
          ]}>
          <Image source={logo} style={[t.w8, t.h8, t.mR4]} />
          <Paragraph text="Storefront" />
        </TouchableOpacity>
      </ScrollView>
    </BaseScreen>
  );
};
