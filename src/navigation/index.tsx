import {colors} from '@app/assets/colors.config';
import {RotateMenu} from '@app/components';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {RootStackNavigator} from './RootStackNavigator';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export const AppNavigator = () => {
  const onSelectMenu = () => {};

  return (
    <View style={[t.flex1]}>
      <RootStackNavigator />
      <View>
        <View style={styles.rotateMenu}>
          <RotateMenu
            girthAngle={100}
            icons={[
              <MaterialIcons
                id={'Home'}
                name="home"
                color={colors.white}
                size={30}
              />,
            ]}
            onSelect={onSelectMenu}
            defaultIconColor={'gray'}
            styleIconText={[t.bgTransparent]}
            iconHideOnTheBackDuration={100}
            isExpDistCorrection={true}
            noExpDistCorrectionDegree={20}
          />
        </View>
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
