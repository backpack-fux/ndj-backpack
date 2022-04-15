import {colors} from '@app/assets/colors.config';
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {t} from 'react-native-tailwindcss';

export const LoadingBar = ({isLoading = false}: {isLoading?: boolean}) => {
  if (!isLoading) {
    return <></>;
  }
  return (
    <View
      style={[
        t.wFull,
        t.hFull,
        t.absolute,
        t.alignCenter,
        t.justifyCenter,
        t.z100,
      ]}>
      <ActivityIndicator style={[t.selfCenter]} color={colors.white} />
    </View>
  );
};
