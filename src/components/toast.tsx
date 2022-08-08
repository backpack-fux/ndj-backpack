import React from 'react';
import {Text, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {colors} from '@app/assets/colors.config';

import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from 'react-native-toast-message';

const toastConfig: ToastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={[t.overflowHidden, {borderLeftColor: colors.green}]}
      contentContainerStyle={[{backgroundColor: colors.toast}]}
      text1Style={[t.textWhite]}
      text2Style={[t.textWhite]}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={[t.overflowHidden, {borderLeftColor: colors.tomato}]}
      contentContainerStyle={[{backgroundColor: colors.toast}]}
      text1Style={[t.textWhite]}
      text2Style={[t.textWhite]}
    />
  ),
  tomatoToast: ({text1, props}) => (
    <View style={[t.wFull, t.h10, {backgroundColor: colors.tomato}]}>
      <Text>{text1}</Text>
      <Text>{props.uuid}</Text>
    </View>
  ),
};

export const ToastContainer = () => <Toast config={toastConfig} />;
