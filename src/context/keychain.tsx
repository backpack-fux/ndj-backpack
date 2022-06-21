import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ACCESS_CONTROL,
  BIOMETRY_TYPE,
  getGenericPassword,
  getSupportedBiometryType,
  resetGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState, AppStateStatus} from 'react-native';
import {VerifyPasscodeModal} from '@app/components/verifyPasscodeModal';
import {MainStackParamList} from '@app/models';

const NDJ_PASSCODE = 'NDJ_PASSCODE';
const NDJ_BIOMETRY = 'NDJ_BIOMETRY';
const NDJ_AUTO_LOCK_TIME = 'NDJ_AUTO_LOCK_TIME';
export interface KeychainContextProps {
  enabledBiometry: boolean;
  passcode?: string;
  biometryType?: string;
  enabled: boolean;
  toggleKeychain: () => void;
  onSetPasscode: (value: string) => void;
  authorizeDeviceBiometry: () => Promise<boolean>;
  autoLockTime: number;
  onSetAutoLockTime: (value: number) => void;
  verifyPasscode: (callback?: string) => void;
  setNewPasscord: () => void;
}

export const KeychainContext = createContext<KeychainContextProps>(
  {} as KeychainContextProps,
);

export const useKeychain = () => {
  const context = useContext(KeychainContext);

  return context;
};

export const KeychainProvider = (props: {
  children: React.ReactChild[] | React.ReactChild;
}) => {
  const appState = useRef(AppState.currentState);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const [enabled, setEnabled] = useState(false);
  const [enabledBiometry, setEnabledBiometry] = useState(false);
  const [passcode, setPasscode] = useState<string>();
  const [autoLockTime, setAutoLockTime] = useState(0);
  const [biometryType, setBiometryType] = useState<BIOMETRY_TYPE>();
  const [showVerify, setShowVerify] = useState(false);
  const [verifyCallback, setVerifyCallback] = useState<string>();

  const toggleKeychain = useCallback(() => {
    if (enabled) {
      verifyPasscode('disable');
    } else {
      navigation.navigate('SetPasscode');
    }
  }, [enabled]);

  const onSetPasscode = useCallback(
    async (value: string) => {
      setPasscode(value);
      setEnabled(true);

      await resetGenericPassword({
        accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
      });

      if (biometryType) {
        await setDeviceBiometry(value);
      }
    },
    [biometryType],
  );

  const turnOffKeychain = () => {
    setEnabled(false);
    setPasscode(undefined);
    setAutoLockTime(0);
    clearDeviceBiometry();
  };

  const authorizeDeviceBiometry = async () => {
    try {
      const res = await getGenericPassword({
        accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
      });
      return !!res;
    } catch (error) {
      return false;
    }
  };

  const clearDeviceBiometry = async () => {
    await resetGenericPassword({
      accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
    });
    await AsyncStorage.removeItem(NDJ_PASSCODE);
    await AsyncStorage.removeItem(NDJ_BIOMETRY);
    await AsyncStorage.removeItem(NDJ_AUTO_LOCK_TIME);
  };

  const setDeviceBiometry = async (code: string) => {
    await setGenericPassword(NDJ_PASSCODE, code, {
      accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
    });
    setEnabledBiometry(true);
    await AsyncStorage.setItem(NDJ_PASSCODE, code);
    await AsyncStorage.setItem(NDJ_BIOMETRY, 'true');
  };

  const setNewPasscord = () => {
    verifyPasscode('newPasscode');
  };

  const checkDeviceAvailability = async () => {
    const passcodeRes = await AsyncStorage.getItem(NDJ_PASSCODE);
    const biometryRes = await AsyncStorage.getItem(NDJ_BIOMETRY);
    const autoLock = await AsyncStorage.getItem(NDJ_AUTO_LOCK_TIME);
    const res = await getSupportedBiometryType();

    if (passcodeRes) {
      setEnabled(true);
      setPasscode(passcodeRes);
      setEnabledBiometry(biometryRes === 'true');
      setAutoLockTime(autoLock ? Number(autoLock) : 0);
    }

    setBiometryType(res);
  };

  const onChangeAppStatus = async (nextAppState: AppStateStatus) => {
    if (
      nextAppState.match(/background|inactive/) &&
      appState.current.match(/active/) &&
      !showVerify
    ) {
      setShowVerify(true);
      setVerifyCallback(undefined);
    }

    appState.current = nextAppState;
  };

  const onSetAutoLockTime = (value: number) => {
    setAutoLockTime(value);
    AsyncStorage.setItem(NDJ_AUTO_LOCK_TIME, value.toString());
  };

  const verifyPasscode = (callback?: string) => {
    setShowVerify(true);
    setVerifyCallback(callback);
  };

  const onVerifiedPasscord = () => {
    setShowVerify(false);
    console.log('verifyCallback', verifyCallback);
    switch (verifyCallback) {
      case 'disable':
        turnOffKeychain();
        break;
      case 'newPasscode':
        navigation.navigate('SetPasscode');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    checkDeviceAvailability();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onChangeAppStatus);

    return () => {
      subscription.remove();
    };
  }, [appState, showVerify]);

  return (
    <KeychainContext.Provider
      value={{
        enabled,
        passcode,
        autoLockTime,
        enabledBiometry,
        biometryType,
        toggleKeychain,
        onSetPasscode,
        setNewPasscord,
        authorizeDeviceBiometry,
        onSetAutoLockTime,
        verifyPasscode,
      }}>
      {showVerify && (
        <VerifyPasscodeModal onVerified={() => onVerifiedPasscord()} />
      )}
      {props.children}
    </KeychainContext.Provider>
  );
};
