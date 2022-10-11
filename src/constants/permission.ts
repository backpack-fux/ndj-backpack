import {PERMISSIONS} from 'react-native-permissions';

export const permissionName: {[key: string]: string} = {
  [PERMISSIONS.ANDROID.CAMERA]: 'camera',
  [PERMISSIONS.IOS.CAMERA]: 'camera',
  [PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]: 'photos',
  [PERMISSIONS.IOS.PHOTO_LIBRARY]: 'photos',
};
