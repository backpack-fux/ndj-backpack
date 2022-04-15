import React from 'react';
import {StyleProp, TextStyle, View} from 'react-native';
import {Icon} from './Icon';

interface Props {
  icons: any[];
  onPress: (id: any) => void;
  styleIconText?: StyleProp<TextStyle>;
}

export const Icons = ({icons, onPress, styleIconText = {}}: Props) => (
  <View>
    {icons.map(icon => (
      <Icon
        key={icon.index}
        icon={icon}
        onPress={onPress}
        styleIconText={styleIconText}
      />
    ))}
  </View>
);
