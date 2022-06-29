import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {CreateWalletScreen, WalletsScreen} from '@app/screens';
import {screenOptions, stackOptions} from './config';
import {SelectTokenScreen} from '@app/screens/Wallet/SelectToken';

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
      <Stack.Screen
        name="AddWallet"
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
        }}
        component={CreateWalletScreen}
      />
      <Stack.Screen
        name="SelectToken"
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
        }}
        component={SelectTokenScreen}
      />
    </Stack.Navigator>
  );
};
