import React from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {TouchableOpacity} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {colors} from '@app/assets/colors.config';
import {shadow} from '@app/constants';
import {Paragraph} from './text';

export const Button = ({
  disabled,
  text,
  onPress = () => {},
}: {
  text: string;
  disabled?: boolean;
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
        {backgroundColor: colors.button},
        disabled ? {} : shadow,
        t.h10,
        t.alignCenter,
        t.justifyCenter,
        t.roundedLg,
      ]}>
      <Paragraph text={text} align="center" color={colors.white} size={16} />
    </TouchableOpacity>
  );
};
