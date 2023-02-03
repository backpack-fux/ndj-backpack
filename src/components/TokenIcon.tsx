import React from 'react';
import {Image, View} from 'react-native';
import {SvgUri} from 'react-native-svg';
import {t} from 'react-native-tailwindcss';

export const TokenIcon = ({
  uri,
  width,
  height,
}: {
  uri?: string;
  width: number;
  height: number;
}) => {
  const isSvg = uri?.endsWith('.svg');

  return (
    <View
      style={[t.roundedFull, t.bgWhite, t.border4, t.borderWhite, t.shadow]}>
      <View style={[t.overflowHidden, t.roundedFull, {width, height}]}>
        {isSvg ? (
          <SvgUri uri={uri as string} width={width} height={height} />
        ) : (
          <Image source={{uri}} style={{width, height}} />
        )}
      </View>
    </View>
  );
};
