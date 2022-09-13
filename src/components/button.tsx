import React from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {TouchableOpacity} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {colors} from '@app/assets/colors.config';
import {borderWidth} from '@app/constants';
import {Paragraph} from './text';

export const Button = ({
  disabled,
  text,
  color,
  onPress = () => {},
}: {
  text: string;
  disabled?: boolean;
  color?: string;
  onPress?: () => void;
}) => {
  const onPressButton = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy');
    onPress();
  };

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPressButton}
      style={[
        {
          backgroundColor: disabled ? colors.transparent : color || colors.gray,
        },
        disabled && {borderWidth, borderColor: color || colors.gray},
        t.h10,
        t.alignCenter,
        t.justifyCenter,
        t.roundedLg,
      ]}>
      <Paragraph text={text} align="center" color={colors.white} size={16} />
    </TouchableOpacity>
  );
};
