import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {CreateWalletScreen, SplashScreen} from '@app/screens';
import {screenOptions, stackOptions} from './config';
import {useSelector} from 'react-redux';
import {walletsSelector} from '@app/store/wallets/walletsSelector';
import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList} from '@app/models';
import {sleep} from '@app/utils';
import {MainStackNavigator} from './MainStackNavigator';
const Stack = createNativeStackNavigator();

export const RootStackNavigator = () => {
  const wallets = useSelector(walletsSelector);
  const navigation: any = useNavigation<NavigationProp<RootStackParamList>>();
  const onLoadedWallets = async () => {
    const route = navigation.getCurrentRoute();
    if (route?.name === 'Splash') {
      await sleep(1500);
    }

    if (wallets.length && route?.name !== 'Wallets') {
      navigation.dispatch(StackActions.replace('MainStack'));
    } else if (!wallets.length && route?.name !== 'CreateWallet') {
      navigation.dispatch(StackActions.replace('CreateWallet'));
    }
  };

  useEffect(() => {
    onLoadedWallets();
  }, [wallets]);

  return (
    <Stack.Navigator initialRouteName={'Splash'} screenOptions={screenOptions}>
      <Stack.Screen
        name="Splash"
        options={{
          ...stackOptions,
          animation: 'fade',
        }}
        component={SplashScreen}
      />
      <Stack.Screen
        name="CreateWallet"
        options={{
          ...stackOptions,
          animation: 'fade',
        }}
        component={CreateWalletScreen}
      />
      <Stack.Screen
        name="MainStack"
        options={{
          animation: 'fade',
        }}
        component={MainStackNavigator}
      />
    </Stack.Navigator>
  );
};
