import React from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  SafeAreaView,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {useHeaderHeight} from '@react-navigation/elements';

import {colors} from '@app/assets/colors.config';
import {menuHeight} from '@app/constants';
const background = require('@app/assets/images/bg.png');

export const BaseScreen = ({
  children,
  isLoading = false,
  noPadding = false,
  noBottom = false,
}: {
  children?: React.ReactNode;
  isLoading?: boolean;
  noPadding?: boolean;
  noBottom?: boolean;
}) => {
  const headerHeight = useHeaderHeight();

  return (
    <ImageBackground
      source={background}
      style={[
        t.flex1,
        t.bgPurple500,
        {marginTop: -headerHeight, paddingTop: headerHeight},
      ]}>
      <View
        style={[
          t.wFull,
          t.flex1,
          {paddingBottom: noBottom ? 0 : menuHeight * 0.55},
        ]}>
        {isLoading && (
          <View
            style={[
              t.flex1,
              t.hFull,
              t.wFull,
              t.flex1,
              t.absolute,
              t.top0,
              t.left0,
              t.alignCenter,
              t.justifyCenter,
              t.z10,
            ]}>
            <ActivityIndicator color={colors.white} size="large" />
          </View>
        )}
        <SafeAreaView style={[t.flex1]}>
          <KeyboardAvoidingView
            style={
              noPadding ? [t.flex1] : [t.flex1, t.pT4, t.pL4, t.pR4, t.pB0]
            }>
            {children}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};
