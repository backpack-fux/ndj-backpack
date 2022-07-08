import React from 'react';
import {RouteProp, useRoute} from '@react-navigation/native';
import Webview from 'react-native-webview';

import {MainStackParamList} from '@app/models';

export const BuyTokenScreen = () => {
  const route = useRoute<RouteProp<MainStackParamList, 'BuyToken'>>();
  const {url} = route.params;

  return <Webview source={{uri: url}} />;
};
