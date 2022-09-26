import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Paragraph, PasscodeField} from '@app/components';
import {useKeychain} from '@app/context/keychain';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {colors} from '@app/assets/colors.config';

const background = require('@app/assets/images/bg.png');
const logo = require('@app/assets/images/logo.png');
const {width, height} = Dimensions.get('screen');

export const VerifyPasscodeModal = ({
  onVerified,
  open,
  showVerify,
  onCancel,
}: {
  onCancel?: () => void;
  onVerified: () => void;
  open: boolean;
  showVerify: boolean;
}) => {
  const {passcode, enabled, enabledBiometry, authorizeDeviceBiometry} =
    useKeychain();
  const [value, setValue] = useState('');
  const [isFailed, setIsFailed] = useState(false);

  const verifyBiometry = async () => {
    const res = await authorizeDeviceBiometry();

    if (res) {
      onVerified();
    }
  };

  const onChangeValue = (val: string) => {
    setValue(val);
    setIsFailed(false);
  };

  useEffect(() => {
    if (!showVerify || !open) {
      return;
    }

    if (!enabled) {
      onVerified();
      setValue('');
      return;
    }

    ReactNativeHapticFeedback.trigger('impactHeavy');

    if (enabledBiometry) {
      verifyBiometry();
    }
  }, [enabled, enabledBiometry, open, showVerify]);

  useEffect(() => {
    if (value === passcode) {
      onVerified();
      setValue('');
    } else if (value && value.length === passcode?.length) {
      ReactNativeHapticFeedback.trigger('impactHeavy');
      setValue('');
      setIsFailed(true);
    }
  }, [passcode, value]);

  if (!open) {
    return <></>;
  }

  return (
    <ImageBackground
      source={background}
      style={[
        t.flex1,
        t.bgPurple500,
        t.absolute,
        t.hFull,
        t.wFull,
        t.top0,
        t.z10,
      ]}>
      <KeyboardAvoidingView
        style={[t.flex1, t.itemsCenter, t.justifyCenter]}
        behavior="padding">
        {showVerify ? (
          <>
            {!!onCancel && (
              <TouchableOpacity
                onPress={onCancel}
                style={[t.absolute, {top: 20, right: 20}]}>
                <Icon name="close" color={colors.white} size={30} />
              </TouchableOpacity>
            )}
            <Paragraph text="Enter your passcode" marginBottom={10} />
            <PasscodeField
              autoFocus
              value={value}
              setValue={onChangeValue}
              editable
            />
            <View style={[t.h8]}>
              {isFailed && (
                <Paragraph
                  text="Incorrect passcode, please try again"
                  marginTop={10}
                  color={colors.secondary}
                />
              )}
            </View>
          </>
        ) : (
          <>
            <Paragraph
              marginTop={30}
              marginBottom={20}
              text="Backpack"
              font={Platform.OS === 'android' ? 'Nicomoji' : 'NicoMoji+'}
              align="center"
            />
            <View style={[t.flex1, t.itemsCenter, t.justifyCenter]}>
              <Image
                source={logo}
                style={[
                  {
                    width: width * 0.7,
                    height: width * 0.7,
                    marginBottom: height * 0.05,
                  },
                ]}
                resizeMode="contain"
              />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};
