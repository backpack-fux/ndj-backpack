import {colors} from '@app/assets/colors.config';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {Paragraph} from './text';

const shadow = {
  shadowColor: colors.secondary,
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowOpacity: 1,
  shadowRadius: 6,

  elevation: 6,
};

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
      t.flex1,
      t.h12,
      t.alignCenter,
      t.justifyCenter,
      t.roundedLg,
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
