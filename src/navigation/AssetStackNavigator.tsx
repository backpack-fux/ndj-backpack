import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {screenOptions, stackOptions} from './config';
import {AssetsScreen} from '@app/screens/Assets/Assets';
import {ReceiveScreen} from '@app/screens/Assets/Receive';
import {SendScreen} from '@app/screens/Assets/Send';
import {TransactionScreen} from '@app/screens/Assets/Transaction';
const Stack = createNativeStackNavigator();

export const AssetStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName={'Assets'} screenOptions={screenOptions}>
      <Stack.Screen
        name="Assets"
        options={{
          ...stackOptions,
          headerBackVisible: false,
          title: 'Asset Management',
          headerTitle: 'Asset Management',
        }}
        component={AssetsScreen}
      />
      <Stack.Screen
        name="Receive"
        options={{
          ...stackOptions,
          title: 'Asset Management',
          headerTitle: 'Asset Management',
        }}
        component={ReceiveScreen}
      />
      <Stack.Screen
        name="Send"
        options={{
          ...stackOptions,
          title: 'Asset Management',
          headerTitle: 'Asset Management',
        }}
        component={SendScreen}
      />
      <Stack.Screen
        name="Transaction"
        options={{
          ...stackOptions,
          title: 'Asset Management',
          headerTitle: 'Asset Management',
        }}
        component={TransactionScreen}
      />
    </Stack.Navigator>
  );
};
