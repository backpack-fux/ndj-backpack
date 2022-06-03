import {BaseScreen, Paragraph, PasscodeField} from '@app/components';
import {useKeychain} from '@app/context/keychain';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {KeyboardAvoidingView, TouchableOpacity, View} from 'react-native';
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
    <BaseScreen noBottom>
      <View style={[t.flexRow, t.mB4]}>
        <TouchableOpacity
          style={[t.absolute, t.left0, t.z10, t.p2]}
          onPress={() => navigation.goBack()}>
          <Paragraph text="Cancel" type="bold" />
        </TouchableOpacity>
        <View style={[t.flex1, t.mT2]}>
          <Paragraph text="Set Passcode" size={18} type="bold" align="center" />
        </View>
      </View>
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
