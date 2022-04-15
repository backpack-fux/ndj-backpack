import {colors} from '@app/assets/colors.config';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import {t} from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const IconButton = ({
  name,
  size = 48,
  iconSize = 30,
  onPress = () => {},
}: {
  name: string;
  size?: number;
  iconSize?: number;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        t.bgPink500,
        t.roundedFull,
        t.itemsCenter,
        t.justifyCenter,
        {width: size, height: size},
      ]}>
      <Icon name={name} color={colors.white} size={iconSize} />
    </TouchableOpacity>
  );
};
