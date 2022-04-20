import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {screenOptions} from './config';
import {WalletStackNavigator} from './WalletStackNavigator';
const Stack = createNativeStackNavigator();

export const MainStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={'WalletStack'}
      screenOptions={screenOptions}>
      <Stack.Screen name="WalletStack" component={WalletStackNavigator} />
      <Stack.Screen name="AssetStack" component={WalletStackNavigator} />
      <Stack.Screen name="DappStack" component={WalletStackNavigator} />
    </Stack.Navigator>
  );
};
