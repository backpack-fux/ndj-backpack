import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {t} from 'react-native-tailwindcss';

import {CreateWalletScreen, SplashScreen} from '@app/screens';
import {screenOptions, stackOptions} from './config';
import {useSelector} from 'react-redux';
import {
  isReadFieldGuideSelector,
  isReadySelector,
  selectedWalletSelector,
} from '@app/store/wallets/walletsSelector';
import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList} from '@app/models';
import {sleep} from '@app/utils';
import {MainStackNavigator} from './MainStackNavigator';
import {FieldGuideScreen} from '@app/screens/FieldGuide';
import {BuyTokenScreen} from '@app/screens/BuyToken';
const Stack = createNativeStackNavigator();

export const RootStackNavigator = () => {
  const wallet = useSelector(selectedWalletSelector);
  const isReady = useSelector(isReadySelector);
  const isReadFieldGuide = useSelector(isReadFieldGuideSelector);
  const navigation: any = useNavigation<NavigationProp<RootStackParamList>>();
  const onLoadedWallets = async () => {
    if (!isReady) {
      return;
    }

    const route = navigation.getCurrentRoute();
    if (route?.name === 'Splash') {
      await sleep(1500);
    }

    if (!isReadFieldGuide) {
      if (route?.name !== 'FieldGuide') {
        navigation.dispatch(StackActions.replace('FieldGuide'));
      }

      return;
    }

    if (wallet && route?.name !== 'Wallets') {
      navigation.dispatch(StackActions.replace('MainStack'));
    } else if (!wallet && route?.name !== 'CreateWallet') {
      navigation.dispatch(StackActions.replace('CreateWallet'));
    }
  };

  useEffect(() => {
    onLoadedWallets();
  }, [isReady, isReadFieldGuide, wallet]);

  return (
    <Stack.Navigator initialRouteName={'Splash'} screenOptions={screenOptions}>
      <Stack.Screen
        name="Splash"
        options={{
          ...stackOptions,
          title: 'Backpack',
          headerTitle: 'Backpack',
          headerTitleStyle: [t.textWhite, {fontFamily: 'NicoMoji+'}],
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
        name="ImportWallet"
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
        }}
        component={CreateWalletScreen}
      />
      <Stack.Screen
        name="FieldGuide"
        options={{
          ...stackOptions,
          title: 'Field Guide Basic',
          headerTitle: 'Field Guide Basic',
          animation: 'fade',
        }}
        component={FieldGuideScreen}
      />
      <Stack.Screen
        name="MainStack"
        options={{
          animation: 'fade',
        }}
        component={MainStackNavigator}
      />
      <Stack.Screen
        name="BuyToken"
        options={{
          ...stackOptions,
          presentation: 'formSheet',
          headerShown: false,
          gestureEnabled: false,
        }}
        component={BuyTokenScreen}
      />
    </Stack.Navigator>
  );
};
