import {colors} from '@app/assets/colors.config';
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
      disabled ? t.bgGray200 : t.bgPink500,
      t.h12,
      t.alignCenter,
      t.justifyCenter,
      t.rounded,
    ]}>
    <Paragraph
      text={text}
      align="center"
      color={colors.white}
      type="bold"
      size={18}
    />
  </TouchableOpacity>
);
