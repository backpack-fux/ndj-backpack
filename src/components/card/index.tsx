import React from 'react';
import {View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {Paragraph} from '../text';

export const Card = ({
  children,
  title,
}: {
  children?: React.ReactNode;
  title?: string;
}) => {
  return (
    <View
      style={[t.roundedXl, t.bgWhite, t.mB2, t.mT2, t.mL3, t.mR3, t.shadow]}>
      {!!title && (
        <View style={[t.p4, t.borderB2, t.borderGray300]}>
          <Paragraph text={title} size={20} />
        </View>
      )}
      {children}
    </View>
  );
};
