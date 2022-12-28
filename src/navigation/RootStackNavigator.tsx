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
import {TokensScreen} from '@app/screens/Assets/Tokens';
import {SetPasscodeScreen} from '@app/screens/SetPasscode';
import {
  LegacySessionProposal,
  SessionApproval,
  SessionSendTransaction,
  SessionSign,
  SessionSignTypedData,
  SessionUnsuportedMethod,
} from '@app/screens/Dapps';
import {SessionSignSolana} from '@app/screens/Dapps/SessionSignSolana';
import {BuyTokenScreen} from '@app/screens/BuyToken';
import {SelectTokenScreen} from '@app/screens/Wallet/SelectToken';
import {Platform} from 'react-native';
import {WebviewScreen} from '@app/screens/Webview';
import {LegacySessionSign} from '@app/screens/Dapps/LegacySessionSign';

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
          headerTitleStyle: [
            t.textWhite,
            {fontFamily: Platform.OS === 'android' ? 'Nicomoji' : 'NicoMoji+'},
          ],
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
        name="Tokens"
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
        }}
        component={TokensScreen}
      />
      <Stack.Screen
        name="SessionApprovalModal"
        component={SessionApproval}
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SessionSignModal"
        component={SessionSign}
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SessionSignTypedDataModal"
        component={SessionSignTypedData}
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SessionSendTransactionModal"
        component={SessionSendTransaction}
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SessionSignSolanaModal"
        component={SessionSignSolana}
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SessionUnsuportedMethodModal"
        component={SessionUnsuportedMethod}
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="LegacySessionProposalModal"
        component={LegacySessionProposal}
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="LegacySessionSignModal"
        component={LegacySessionSign}
        options={{
          ...stackOptions,
          headerShown: false,
          presentation: 'formSheet',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SetPasscode"
        options={{
          ...stackOptions,
          presentation: 'formSheet',
          headerShown: false,
        }}
        component={SetPasscodeScreen}
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
      <Stack.Screen
        name="Webwiew"
        options={{
          ...stackOptions,
        }}
        component={WebviewScreen}
      />
    </Stack.Navigator>
  );
};
