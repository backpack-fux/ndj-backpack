import React from 'react';
import {View} from 'react-native';
import {t} from 'react-native-tailwindcss';

export const Card = ({children}: {children: React.ReactNode}) => (
  <View
    style={[
      t.pT2,
      t.pB2,
      t.pL4,
      t.pR4,
      t.roundedLg,
      t.overflowHidden,
      t.bgPurple200,
      t.mT4,
    ]}>
    {children}
  </View>
);
