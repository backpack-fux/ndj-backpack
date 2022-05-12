import {colors} from '@app/assets/colors.config';
import React from 'react';
import {Text} from 'react-native';

interface Props {
  text?: string;
  size?: number;
  type?: 'normal' | 'bold';
  color?: string;
  lineHeight?: number;
  align?: 'left' | 'center' | 'right';
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  numberOfLines?: number;
  letterSpacing?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  font?: string;
}

export const Paragraph = ({
  text = '',
  size = 16,
  type = 'normal',
  color = colors.white,
  lineHeight = 22,
  align = 'left',
  marginLeft = 0,
  marginRight = 0,
  marginTop = 0,
  marginBottom = 0,
  letterSpacing,
  numberOfLines,
  ellipsizeMode,
  font,
}: Props) => {
  return (
    <Text
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={{
        fontWeight: type,
        fontSize: size,
        fontFamily: font,
        textAlign: align,
        letterSpacing,
        color,
        lineHeight,
        marginLeft,
        marginRight,
        marginTop,
        marginBottom,
      }}>
      {text}
    </Text>
  );
};
