import React, {useEffect} from 'react';
import {Dimensions, Image, View} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {BaseScreen} from '@app/components';
import {useDispatch} from 'react-redux';
import {getBaseCoins} from '@app/store/coins/actions';

const logo = require('@app/assets/images/logo.png');
const {width, height} = Dimensions.get('screen');

export const SplashScreen = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getBaseCoins());
  }, []);
  return (
    <BaseScreen>
      <View style={[t.flex1, t.itemsCenter, t.justifyCenter]}>
        <Image
          source={logo}
          style={[
            {width: width * 0.7, height: width * 0.7, marginTop: height * 0.1},
          ]}
          resizeMode="contain"
        />
      </View>
    </BaseScreen>
  );
};
