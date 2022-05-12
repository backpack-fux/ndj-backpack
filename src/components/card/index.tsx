import {colors} from '@app/assets/colors.config';
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {Paragraph} from '../text';

const shadow = {
  shadowColor: '#fff',
  shadowOffset: {
    width: 0,
    height: 5,
  },
  shadowOpacity: 0.6,
  shadowRadius: 1,

  elevation: 5,
};

export const Card = ({
  children,
  borderColor = colors.primaryLight,
  onPress = () => {},
  padding,
}: {
  children?: React.ReactNode;
  onPress?: () => void;
  padding?: number;
  borderColor?: string;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[
        t.bgPurple500,
        padding ? {padding} : t.p4,
        t.roundedXl,
        t.border2,
        {borderColor},
        t.mB4,
        shadow,
      ]}>
      {children}
    </TouchableOpacity>
  );
};
