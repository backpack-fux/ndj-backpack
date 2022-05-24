import React from 'react';
import {StyleProp, TextStyle, View} from 'react-native';
import {Icon} from './Icon';

interface Props {
  icons: any[];
  onPress: (id: any) => void;
  styleIconText?: StyleProp<TextStyle>;
  current?: string;
}

export const Icons = ({icons, onPress, styleIconText = {}, current}: Props) => (
  <View>
    {icons.map(icon => (
      <Icon
        key={icon.index}
        icon={icon}
        current={current}
        onPress={onPress}
        styleIconText={styleIconText}
      />
    ))}
  </View>
);
