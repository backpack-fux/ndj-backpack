import React from 'react';
import {Dimensions, Image, Text, View} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {BaseScreen} from '@app/components';

const logo = require('@app/assets/images/logo.png');
const {width, height} = Dimensions.get('screen');

export const SplashScreen = () => {
  return (
    <BaseScreen>
      <View style={[t.flex1, t.itemsCenter, t.justifyCenter]}>
        <Image
          source={logo}
          style={[{width: width * 0.7, height: width * 0.7, marginTop: height * 0.1}]}
          resizeMode="contain"
        />
      </View>
    </BaseScreen>
  );
};
