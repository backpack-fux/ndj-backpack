import {colors} from '@app/assets/colors.config';
import {t} from 'react-native-tailwindcss';

export const screenOptions = {
  headerShown: false,
  headerStyle: {
    backgroundColor: colors.transparent,
  },
  contentStyle: {backgroundColor: colors.transparent},
};

export const stackOptions = {
  headerShown: true,
  headerTintColor: colors.white,
  headerTitle: 'NDJ Backpack',
  headerBackTitle: '',
  headerTitleStyle: [t.textWhite, t.fontMono],
};
