import React from 'react';
import {Animated} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {t} from 'react-native-tailwindcss';

export const SwipeableItem = ({
  leftText,
  rightText,
  children,
  width = 50,
  onPressLeft = () => {},
  onPressRight = () => {},
}: {
  children: React.ReactNode;
  leftText?: string;
  rightText?: string;
  onPressLeft?: () => void;
  onPressRight?: () => void;
  width?: number;
}) => {
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation,
    dragX: Animated.AnimatedInterpolation,
  ) => {
    const trans = dragX.interpolate({
      inputRange: [0, width, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    return (
      <RectButton
        style={[t.alignCenter, t.justifyCenter, t.p2, t.bgPink500]}
        onPress={onPressLeft}>
        <Animated.Text
          style={[
            t.textWhite,
            {
              transform: [{translateX: trans}],
            },
          ]}>
          {leftText}
        </Animated.Text>
      </RectButton>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation,
    dragX: Animated.AnimatedInterpolation,
  ) => {
    const trans = dragX.interpolate({
      inputRange: [0, width, 100, 101],
      outputRange: [10, 20, 20, 20],
    });
    return (
      <RectButton
        style={[t.alignCenter, t.justifyCenter, t.p2, t.bgPink500]}
        onPress={onPressRight}>
        <Animated.Text
          style={[
            t.textWhite,
            {
              transform: [{translateX: trans}],
            },
          ]}>
          {rightText}
        </Animated.Text>
      </RectButton>
    );
  };

  return (
    <Swipeable
      containerStyle={[t.bgPink500]}
      renderLeftActions={leftText ? renderLeftActions : undefined}
      renderRightActions={rightText ? renderRightActions : undefined}>
      {children}
    </Swipeable>
  );
};
