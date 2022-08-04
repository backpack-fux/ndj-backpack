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
          style={[t.mB8, {width: width * 0.8, height: width * 0.8}]}
          resizeMode="contain"
        />
      </View>
    </BaseScreen>
  );
};
