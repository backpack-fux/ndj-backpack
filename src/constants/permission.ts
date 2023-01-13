import {Alert} from 'react-native';
import {
  check,
  openSettings,
  Permission,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

export const permissionName: {[key: string]: string} = {
  [PERMISSIONS.ANDROID.CAMERA]: 'camera',
  [PERMISSIONS.IOS.CAMERA]: 'camera',
  [PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]: 'photos',
  [PERMISSIONS.IOS.PHOTO_LIBRARY]: 'photos',
};

export const checkPermission = async (permission: Permission) => {
  try {
    let result = await check(permission);

    if (result === RESULTS.GRANTED) {
      return true;
    } else if (result === RESULTS.DENIED) {
      result = await request(permission);

      if (result === RESULTS.GRANTED) {
        return true;
      }
    }

    Alert.alert(
      'Permission Denied',
      `Go to the settings and allow ${permissionName[permission]} access?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: () => openSettings(),
        },
      ],
    );

    return false;
  } catch (err: any) {
    console.log(err);
    Toast.show({
      type: 'error',
      text1: err.message,
    });
    return false;
  }
};
