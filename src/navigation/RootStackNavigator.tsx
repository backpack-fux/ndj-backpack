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
import {WalletStackNavigator} from './WalletStackNavigator';
const Stack = createNativeStackNavigator();

export const RootStackNavigator = () => {
  const wallets = useSelector(walletsSelector);
  const navigation: any = useNavigation<NavigationProp<RootStackParamList>>();
  const onLoadedWallets = async () => {
    const route = navigation.getCurrentRoute();
    if (route?.name === 'Splash') {
      await sleep(1500);
    }

    if (wallets.length) {
      navigation.dispatch(StackActions.replace('WalletStack'));
    } else {
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
        options={stackOptions}
        component={SplashScreen}
      />
      <Stack.Screen
        name="CreateWallet"
        options={stackOptions}
        component={CreateWalletScreen}
      />
      <Stack.Screen name="WalletStack" component={WalletStackNavigator} />
    </Stack.Navigator>
  );
};
