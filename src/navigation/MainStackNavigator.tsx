import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StyleSheet, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';

import {screenOptions, stackOptions} from './config';
import {WalletStackNavigator} from './WalletStackNavigator';
import {AssetStackNavigator} from './AssetStackNavigator';
import {DappStackNavigator} from './DappStackNavigator';
import {RotateMenu} from '@app/components';
import {colors} from '@app/assets/colors.config';
import {MainStackParamList} from '@app/models';
import {
  SessionApproval,
  SessionSendTransaction,
  SessionSign,
  SessionSignTypedData,
  SessionUnsuportedMethod,
} from '@app/screens/Dapps';
import {SettingsScreen} from '@app/screens/Settings';
import {useKeychain} from '@app/context/keychain';
import {SetPasscodeScreen} from '@app/screens/SetPasscode';
import {VerifyPasscodeScreen} from '@app/screens/VerifyPasscode';

const Stack = createNativeStackNavigator();

export const MainStackNavigator = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {enabled} = useKeychain();

  const onSelectMenu = (name: any) => {
    navigation.dispatch(StackActions.replace(name));
  };

  useEffect(() => {
    if (enabled) {
      navigation.navigate('VerifyPasscode', {});
    }
  }, []);

  return (
    <View style={[t.flex1]}>
      <Stack.Navigator
        initialRouteName={'WalletStack'}
        screenOptions={screenOptions}>
        <Stack.Screen
          name="WalletStack"
          options={{animation: 'fade'}}
          component={WalletStackNavigator}
        />
        <Stack.Screen
          name="AssetStack"
          options={{animation: 'fade'}}
          component={AssetStackNavigator}
        />
        <Stack.Screen
          name="DappStack"
          options={{animation: 'fade'}}
          component={DappStackNavigator}
        />
        <Stack.Screen
          name="Settings"
          options={{
            animation: 'fade',
            ...stackOptions,
            headerTitle: 'Backpack Settings',
          }}
          component={SettingsScreen}
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
          name="SetPasscode"
          options={{
            ...stackOptions,
            presentation: 'formSheet',
            headerShown: false,
          }}
          component={SetPasscodeScreen}
        />
        <Stack.Screen
          name="VerifyPasscode"
          component={VerifyPasscodeScreen}
          options={{
            presentation: 'fullScreenModal',
            gestureEnabled: false,
            fullScreenGestureEnabled: false,
            animation: 'none',
          }}
        />
      </Stack.Navigator>
      <View style={styles.rotateMenu}>
        <RotateMenu
          girthAngle={140}
          icons={[
            <Ionicons
              id="Settings"
              name="settings-outline"
              color={colors.white}
              size={30}
            />,
            <MaterialCommunityIcons
              id="AssetStack"
              name="close-box"
              color={colors.white}
              style={{marginLeft: 0.1}}
              size={30}
            />,
            <Ionicons
              id="WalletStack"
              name="ios-wallet"
              color={colors.white}
              size={30}
              style={{marginLeft: 2}}
            />,
            <Ionicons
              id="DappStack"
              name="md-cube"
              color={colors.white}
              size={30}
              style={{marginLeft: 1.2}}
            />,
          ]}
          onSelect={onSelectMenu}
          defaultIconColor={'gray'}
          styleIconText={[t.bgTransparent]}
          iconHideOnTheBackDuration={100}
          isExpDistCorrection={false}
        />
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  rotateMenu: {
    shadowRadius: 2,
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowColor: colors.primary,
    shadowOpacity: 0.9,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
  },
});
