import React from 'react';
import {Image, View} from 'react-native';
import {SvgUri} from 'react-native-svg';
import {t} from 'react-native-tailwindcss';

export const FarcasterIcon = ({uri, size}: {uri?: string; size: number}) => {
  const isSvg = uri?.endsWith('.svg');

  return (
    <View
      style={[
        t.overflowHidden,
        t.roundedFull,
        t.bgGray300,
        {width: size, height: size},
      ]}>
      {isSvg ? (
        <SvgUri uri={uri as string} width={size} height={size} />
      ) : (
        <Image source={{uri}} style={{width: size, height: size}} />
      )}
    </View>
  );
};
