import {BaseScreen, Paragraph, PasscodeField} from '@app/components';
import {useKeychain} from '@app/context/keychain';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {t} from 'react-native-tailwindcss';

export const SetPasscodeScreen = () => {
  const navigation = useNavigation();
  const {onSetPasscode} = useKeychain();
  const [value, setValue] = useState('');
  const [verifyValue, setVerifyValue] = useState('');
  const [isVerify, setIsVerify] = useState(false);

  useEffect(() => {
    ReactNativeHapticFeedback.trigger('impactHeavy');
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Paragraph text="Cancel" type="bold" />
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    if (value.length === 6) {
      setIsVerify(true);
    }
  }, [value]);

  useEffect(() => {
    if (verifyValue.length !== 6) {
      return;
    }

    if (verifyValue === value) {
      onSetPasscode(value);
      navigation.goBack();
      ReactNativeHapticFeedback.trigger('impactHeavy');
    } else {
      setVerifyValue('');
      setValue('');
      setIsVerify(false);
      ReactNativeHapticFeedback.trigger('impactHeavy');
    }
  }, [verifyValue, value, onSetPasscode]);

  return (
    <BaseScreen
      noBottom
      showToast
      title="Set Passcode"
      onBack={() => navigation.goBack()}>
      <KeyboardAvoidingView
        style={[t.flex1, t.itemsCenter, t.justifyCenter]}
        behavior="position">
        {isVerify ? (
          <>
            <Paragraph
              text="Please re-enter your passcode"
              align="center"
              marginBottom={10}
              marginTop={50}
            />
            <PasscodeField
              value={verifyValue}
              autoFocus
              setValue={setVerifyValue}
              editable
            />
          </>
        ) : (
          <>
            <Paragraph
              text="Enter a new passcode"
              align="center"
              marginBottom={10}
              marginTop={50}
            />
            <PasscodeField
              value={value}
              autoFocus
              setValue={setValue}
              editable
            />
          </>
        )}
      </KeyboardAvoidingView>
    </BaseScreen>
  );
};
