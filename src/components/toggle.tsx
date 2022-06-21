import {colors} from '@app/assets/colors.config';
import {shadow} from '@app/constants';
import React, {useEffect, useRef} from 'react';
import {Animated, Image, TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {Paragraph} from './text';
const toggle = require('@app/assets/images/toggle.png');

const border = 1;
const width = 40;
const toggleSize = 22;

export const Toggle = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => {
  const left = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.timing(left, {
      toValue: value ? width - toggleSize + 1 : -1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, left]);

  return (
    <View style={[t.flexRow, t.itemsCenter]}>
      <View style={[t.flex1, t.mR4]}>
        <Paragraph text={label} numberOfLines={1} />
      </View>
      <TouchableOpacity
        style={[t.justifyCenter, t.pT2, t.pB2]}
        onPress={() => onChange(!value)}>
        <View
          style={[
            {backgroundColor: colors.gray},
            !value ? {} : shadow,
            {borderWidth: border},
            value ? t.borderWhite : t.borderGray200,
            {width},
            t.h3,
            t.roundedLg,
          ]}
        />
        <Animated.View
          style={[
            t.absolute,
            t.bgPurple500,
            t.roundedFull,
            {left, width: toggleSize, height: toggleSize},
          ]}>
          <Image
            source={toggle}
            style={[
              {width: toggleSize, height: toggleSize},
              t.selfCenter,
              t.flex1,
            ]}
            resizeMode="contain"
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};
