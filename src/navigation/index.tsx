import {colors} from '@app/assets/colors.config';
import {RotateMenu} from '@app/components';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {RootStackNavigator} from './RootStackNavigator';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {useSelector} from 'react-redux';
import {walletsSelector} from '@app/store/wallets/walletsSelector';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '@app/models';

export const AppNavigator = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const wallets = useSelector(walletsSelector);

  const onSelectMenu = (name: any) => {
    navigation.navigate(name);
  };

  return (
    <View style={[t.flex1]}>
      <RootStackNavigator />
      <View style={styles.rotateMenu}>
        <RotateMenu
          girthAngle={100}
          icons={
            wallets.length
              ? [
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
                ]
              : [
                  <MaterialIcons
                    id={'Home'}
                    name="home"
                    color={colors.white}
                    size={30}
                  />,
                ]
          }
          onSelect={onSelectMenu}
          defaultIconColor={'gray'}
          styleIconText={[t.bgTransparent]}
          iconHideOnTheBackDuration={100}
          isExpDistCorrection={true}
          noExpDistCorrectionDegree={20}
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
