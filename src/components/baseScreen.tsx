import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {colors} from '@app/assets/colors.config';
import {menuHeight} from '@app/constants';

export const BaseScreen = ({
  children,
  isLoading = false,
  noPadding = false,
}: {
  children?: React.ReactNode;
  isLoading?: boolean;
  noPadding?: boolean;
}) => {
  return (
    <>
      <View style={[t.wFull, t.flex1, {paddingBottom: menuHeight * 0.65}]}>
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
    </>
  );
};
