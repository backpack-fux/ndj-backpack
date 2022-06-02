import React, {useEffect, useState} from 'react';
import {ImageBackground, Modal, View} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {Paragraph, PasscodeField} from '@app/components';
import {useKeychain} from '@app/context/keychain';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {colors} from '@app/assets/colors.config';

const background = require('@app/assets/images/bg.png');

export const VerifyPasscodeModal = ({
  show,
  onVerified,
}: {
  show: boolean;
  onVerified: () => void;
}) => {
  const {passcode, enabledBiometry, authorizeDeviceBiometry} = useKeychain();
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
    ReactNativeHapticFeedback.trigger('impactHeavy');
  }, []);

  useEffect(() => {
    if (enabledBiometry) {
      verifyBiometry();
    }
  }, [enabledBiometry]);

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
    <Modal visible={show} animationType="fade">
      <ImageBackground
        source={background}
        style={[t.flex1, t.bgPurple500, t.itemsCenter, t.justifyCenter]}>
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
      </ImageBackground>
    </Modal>
  );
};
