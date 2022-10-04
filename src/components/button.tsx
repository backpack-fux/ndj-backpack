import React from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {ActivityIndicator, TouchableOpacity} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {colors} from '@app/assets/colors.config';
import {borderWidth} from '@app/constants';
import {Paragraph} from './text';

export const Button = ({
  disabled,
  text,
  color,
  onPress = () => {},
  loading,
}: {
  text: string;
  disabled?: boolean;
  loading?: boolean;
  color?: string;
  onPress?: () => void;
}) => {
  const onPressButton = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy');
    onPress();
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={onPressButton}
      style={[
        {
          backgroundColor:
            disabled || loading ? colors.transparent : color || colors.gray,
        },
        (disabled || loading) && {
          borderWidth,
          borderColor: color || colors.gray,
        },
        t.h10,
        t.flexRow,
        t.alignCenter,
        t.itemsCenter,
        t.justifyCenter,
        t.roundedLg,
      ]}>
      <Paragraph
        text={text}
        align="center"
        color={loading || disabled ? colors.textGray : colors.white}
        size={16}
      />
      {loading && (
        <ActivityIndicator style={[t.mL1, t.mT1]} color={colors.white} />
      )}
    </TouchableOpacity>
  );
};
