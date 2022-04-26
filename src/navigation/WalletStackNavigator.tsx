import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {CreateWalletScreen, WalletsScreen} from '@app/screens';
import {screenOptions, stackOptions} from './config';
import {colors} from '@app/assets/colors.config';
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
          headerShown: true,
          headerTitle: 'Add Wallet',
          presentation: 'formSheet',
          headerStyle: {
            backgroundColor: colors.primary,
          },
        }}
        component={CreateWalletScreen}
      />
    </Stack.Navigator>
  );
};
