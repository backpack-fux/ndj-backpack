import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {
  createContext,
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
import moment from 'moment-timezone';

const NDJ_PASSCODE = 'NDJ_PASSCODE';
const NDJ_BIOMETRY = 'NDJ_BIOMETRY';
const NDJ_LOCKED_TIME = 'NDJ_LOCKED_TIME';
const NDJ_AUTO_LOCK_TIME = 'NDJ_AUTO_LOCK_TIME';
export interface KeychainContextProps {
  enabledBiometry: boolean;
  passcode?: string;
  biometryType?: string;
  enabled: boolean;
  toggleKeychain: (value: boolean) => void;
  onSetPasscode: (value: string) => void;
  authorizeDeviceBiometry: () => Promise<boolean>;
  autoLockTime: number;
  onSetAutoLockTime: (value: number) => void;
  verifyPasscode: (callback?: () => void) => void;
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
  const navigation = useNavigation<NavigationProp<SettingsParamList>>();
  const [enabled, setEnabled] = useState(false);
  const [enabledBiometry, setEnabledBiometry] = useState(false);
  const [passcode, setPasscode] = useState<string>();
  const [autoLockTime, setAutoLockTime] = useState(0);
  const [biometryType, setBiometryType] = useState<BIOMETRY_TYPE>();

  const toggleKeychain = (value: boolean) => {
    if (value) {
      navigation.navigate('SetPasscode');
    } else {
      setEnabled(false);
      setPasscode(undefined);
      setAutoLockTime(0);
      clearDeviceBiometry();
    }
  };

  const onSetPasscode = async (value: string) => {
    setPasscode(value);
    setEnabled(true);

    await resetGenericPassword({
      accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
    });
    if (biometryType) {
      await setDeviceBiometry(value);
    }
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
    await AsyncStorage.setItem(NDJ_PASSCODE, code);
    await AsyncStorage.setItem(NDJ_BIOMETRY, 'true');
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
    if (!enabled) {
      return;
    }

    if (appState.current.match(/background/) && nextAppState.match(/active/)) {
      const lockedTimeString = await AsyncStorage.getItem(NDJ_LOCKED_TIME);
      const now = moment();
      const lockedTimeMoment = lockedTimeString
        ? moment.unix(Number(lockedTimeString))
        : moment();
      const minutes = moment.duration(now.diff(lockedTimeMoment)).asMinutes();
      console.log('minutes', minutes);
      if (minutes >= autoLockTime) {
        verifyPasscode();
      }
    } else if (
      nextAppState.match(/background/) &&
      appState.current.match(/active/)
    ) {
      const now = moment().unix();
      await AsyncStorage.setItem(NDJ_LOCKED_TIME, now.toString());
    } else if (nextAppState.match(/inactive/)) {
      // navigation && navigation.navigate('SplashScreen');
    }

    appState.current = nextAppState;
  };

  const onSetAutoLockTime = (value: number) => {
    setAutoLockTime(value);
    AsyncStorage.setItem(NDJ_AUTO_LOCK_TIME, value.toString());
  };

  const verifyPasscode = (callback?: () => void) => {
    navigation.navigate('VerifyPasscode', {
      onVerified: callback,
    });
  };

  useEffect(() => {
    checkDeviceAvailability();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onChangeAppStatus);

    return () => {
      subscription.remove();
    };
  }, [enabled, autoLockTime, appState]);

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
        authorizeDeviceBiometry,
        onSetAutoLockTime,
        verifyPasscode,
      }}>
      {props.children}
    </KeychainContext.Provider>
  );
};
