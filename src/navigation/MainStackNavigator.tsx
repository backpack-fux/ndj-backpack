import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {screenOptions} from './config';
import {WalletStackNavigator} from './WalletStackNavigator';
import {AssetStackNavigator} from './AssetStackNavigator';
import {DappStackNavigator} from './DappStackNavigator';
const Stack = createNativeStackNavigator();

export const MainStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={'WalletStack'}
      screenOptions={screenOptions}>
      <Stack.Screen name="WalletStack" component={WalletStackNavigator} />
      <Stack.Screen name="AssetStack" component={AssetStackNavigator} />
      <Stack.Screen name="DappStack" component={DappStackNavigator} />
    </Stack.Navigator>
  );
};
