import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {SplashScreen} from '@app/screens';
import {screenOptions, stackOptions} from './config';
const Stack = createNativeStackNavigator();
export const RootStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName={'Splash'} screenOptions={screenOptions}>
      <Stack.Screen
        name="Splash"
        options={{
          ...stackOptions,
          headerTitle: 'NDJ Backpack',
        }}
        component={SplashScreen}
      />
    </Stack.Navigator>
  );
};
