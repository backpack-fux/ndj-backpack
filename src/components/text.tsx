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
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
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
  numberOfLines,
  ellipsizeMode,
}: Props) => {
  return (
    <Text
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={{
        fontWeight: type,
        fontSize: size,
        textAlign: align,
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
