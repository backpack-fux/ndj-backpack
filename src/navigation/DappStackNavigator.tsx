import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {screenOptions, stackOptions} from './config';
import {DappsScreen} from '@app/screens/Dapps/DappsScreen';
import {DappDetailScreen} from '@app/screens/Dapps/DappDetails';

const Stack = createNativeStackNavigator();

export const DappStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName={'Dapps'} screenOptions={screenOptions}>
      <Stack.Screen
        name="Dapps"
        options={{
          ...stackOptions,
          headerTitle: 'App Management',
        }}
        component={DappsScreen}
      />
      <Stack.Screen
        name="DappDetails"
        options={{
          ...stackOptions,
          headerTitle: 'App Management',
        }}
        component={DappDetailScreen}
      />
    </Stack.Navigator>
  );
};
