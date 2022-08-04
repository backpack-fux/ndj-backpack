import React, {useEffect, useState} from 'react';
import {
  AppState,
  AppStateStatus,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Text,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {Paragraph, PasscodeField} from '@app/components';
import {useKeychain} from '@app/context/keychain';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {colors} from '@app/assets/colors.config';

const background = require('@app/assets/images/bg.png');
const logo = require('@app/assets/images/logo.png');
const {width} = Dimensions.get('screen');

export const VerifyPasscodeModal = ({onVerified}: {onVerified: () => void}) => {
  const {passcode, enabled, enabledBiometry, authorizeDeviceBiometry} =
    useKeychain();
  const [value, setValue] = useState('');
  const [isFailed, setIsFailed] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [isVerifyingBiometry, setIsVerifyingBiometry] = useState(false);

  const verifyBiometry = async () => {
    setIsVerifyingBiometry(true);
    const res = await authorizeDeviceBiometry();

    if (res) {
      onVerified();
    }
    setIsVerifyingBiometry(false);
  };

  const onChangeValue = (val: string) => {
    setValue(val);
    setIsFailed(false);
  };

  const onChangeAppStatus = async (appState: AppStateStatus) => {
    if (appState === 'active') {
      if (enabled) {
        setShowVerify(true);
      } else {
        onVerified();
      }
    } else if (!isVerifyingBiometry) {
      setShowVerify(false);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onChangeAppStatus);

    return () => {
      subscription.remove();
    };
  }, [isVerifyingBiometry, enabled]);

  useEffect(() => {
    if (AppState.currentState === 'active') {
      if (enabled) {
        setShowVerify(true);
      } else {
        onVerified();
      }
    }
  }, [AppState]);

  useEffect(() => {
    if (!showVerify) {
      return;
    }

    if (!enabled) {
      onVerified();
      return;
    }

    ReactNativeHapticFeedback.trigger('impactHeavy');

    if (enabledBiometry) {
      verifyBiometry();
    }
  }, [enabled, enabledBiometry, showVerify]);

  useEffect(() => {
    if (value === passcode) {
      onVerified();
    } else if (value && value.length === passcode?.length) {
      ReactNativeHapticFeedback.trigger('impactHeavy');
      setValue('');
      setIsFailed(true);
    }
  }, [passcode, value]);

  return (
    <Modal visible={true} animationType="fade">
      <ImageBackground source={background} style={[t.flex1, t.bgPurple500]}>
        <KeyboardAvoidingView
          style={[t.flex1, t.itemsCenter, t.justifyCenter]}
          behavior="padding">
          {showVerify ? (
            <>
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
                font="Montserrat"
                align="center"
                type="bold"
              />
              <View style={[t.flex1, t.itemsCenter, t.justifyCenter]}>
                <Image
                  source={logo}
                  style={[t.mB8, {width: width * 0.8, height: width * 0.8}]}
                  resizeMode="contain"
                />
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </ImageBackground>
    </Modal>
  );
};
