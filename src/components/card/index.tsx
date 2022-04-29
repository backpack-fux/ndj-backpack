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
  onPress = () => {},
  padding,
}: {
  children?: React.ReactNode;
  onPress?: () => void;
  padding?: number;
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
        t.borderPurple200,
        t.mB4,
        shadow,
      ]}>
      {children}
    </TouchableOpacity>
  );
};
