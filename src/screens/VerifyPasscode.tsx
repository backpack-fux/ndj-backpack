import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {BaseScreen, Paragraph, PasscodeField} from '@app/components';
import {useKeychain} from '@app/context/keychain';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {colors} from '@app/assets/colors.config';
import {MainStackParamList} from '@app/models';

export const VerifyPasscodeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MainStackParamList, 'VerifyPasscode'>>();
  const onVerified = route.params?.onVerified;

  const {enabled, passcode, enabledBiometry, authorizeDeviceBiometry} =
    useKeychain();
  const [value, setValue] = useState('');
  const [isFailed, setIsFailed] = useState(false);

  const onSuccess = () => {
    if (onVerified) {
      onVerified();
    } else {
      navigation.goBack();
    }
  };

  const verifyBiometry = async () => {
    const res = await authorizeDeviceBiometry();

    if (res) {
      onSuccess();
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
    if (!enabled) {
      navigation.goBack();
    }
  }, [enabled]);

  useEffect(() => {
    if (enabledBiometry) {
      verifyBiometry();
    }
  }, [enabledBiometry]);

  useEffect(() => {
    if (value === passcode) {
      onSuccess();
    } else if (value && value.length === passcode?.length) {
      ReactNativeHapticFeedback.trigger('impactHeavy');
      setValue('');
      setIsFailed(true);
    }
  }, [passcode, value]);

  return (
    <BaseScreen>
      <View style={[t.flex1, t.itemsCenter, t.justifyCenter]}>
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
      </View>
    </BaseScreen>
  );
};
