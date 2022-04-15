import React from 'react';
import {
  Animated,
  StyleProp,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {styles} from '../styles';

interface Props {
  icon: any;
  onPress: (id: any) => void;
  styleIconText?: StyleProp<TextStyle>;
}

export const Icon = ({icon, onPress, styleIconText}: Props) => {
  return (
    <TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.icon,
          icon.styles,
          icon.position.getLayout(),
          // getIconsTransformDynamicStyles(),
        ]}>
        {icon.isShown && (
          <View style={styles.iconContainer}>
            {icon.el}
            {/* <Text style={[styles.iconText, styleIconText]}>{icon.title}</Text> */}
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
