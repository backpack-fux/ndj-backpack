import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {WalletsScreen} from '@app/screens';
import {screenOptions, stackOptions} from './config';
const Stack = createNativeStackNavigator();

export const WalletStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName={'Wallets'} screenOptions={screenOptions}>
      <Stack.Screen
        name="Wallets"
        options={{
          ...stackOptions,
          headerTitle: 'Wallet Management',
        }}
        component={WalletsScreen}
      />
    </Stack.Navigator>
  );
};
