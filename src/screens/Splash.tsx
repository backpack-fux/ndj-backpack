import React from 'react';
import {Dimensions, Image, Text, View} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {BaseScreen} from '@app/components';

const logo = require('@app/assets/images/logo.png');
const {width} = Dimensions.get('screen');
export const SplashScreen = () => {
  return (
    <BaseScreen>
      <View style={[t.flex1, t.itemsCenter, t.justifyCenter]}>
        <Image
          source={logo}
          style={[{width: width * 0.8, height: width * 0.8}]}
          resizeMode="contain"
        />
        <Text style={[t.text4xl, t.mT4, t.textWhite, t.fontMono]}>
          New Dao Jones
        </Text>
      </View>
    </BaseScreen>
  );
};
