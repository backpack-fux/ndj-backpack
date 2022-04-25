import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {screenOptions, stackOptions} from './config';
import {DappsScreen} from '@app/screens/Dapps/DappsScreen';
const Stack = createNativeStackNavigator();

export const DappStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName={'Dapps'} screenOptions={screenOptions}>
      <Stack.Screen
        name="Dapps"
        options={{
          ...stackOptions,
          headerTitle: 'dApp Management',
        }}
        component={DappsScreen}
      />
    </Stack.Navigator>
  );
};
