import React from 'react';
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

import {screenOptions} from './config';
import {WalletStackNavigator} from './WalletStackNavigator';
import {AssetStackNavigator} from './AssetStackNavigator';
import {DappStackNavigator} from './DappStackNavigator';
import {RotateMenu} from '@app/components';
import {colors} from '@app/assets/colors.config';
import {MainStackParamList} from '@app/models';

const Stack = createNativeStackNavigator();

export const MainStackNavigator = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const onSelectMenu = (name: any) => {
    navigation.dispatch(StackActions.replace(name));
  };

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
      </Stack.Navigator>
      <View style={styles.rotateMenu}>
        <RotateMenu
          girthAngle={140}
          icons={[
            <MaterialCommunityIcons
              id="AssetStack"
              name="close-box"
              color={colors.white}
              size={30}
            />,
            <Ionicons
              id="WalletStack"
              name="ios-wallet"
              color={colors.white}
              size={30}
            />,
            <Ionicons
              id="DappStack"
              name="md-cube"
              color={colors.white}
              size={30}
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
