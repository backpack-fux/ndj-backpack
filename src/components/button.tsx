import {colors} from '@app/assets/colors.config';
import {shadow} from '@app/constants';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {Paragraph} from './text';

export const Button = ({
  disabled,
  text,
  onPress = () => {},
}: {
  text: string;
  disabled?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    disabled={disabled}
    onPress={onPress}
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
