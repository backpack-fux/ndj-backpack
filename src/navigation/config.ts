import {colors} from '@app/assets/colors.config';
import {t} from 'react-native-tailwindcss';

export const screenOptions: any = {
  headerShown: false,
  headerTitleAlign: 'center',
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: colors.transparent,
  },
  contentStyle: {
    backgroundColor: colors.transparent,
  },
};

export const stackOptions = {
  headerShown: true,
  headerTintColor: colors.white,
  title: 'Backpack',
  headerTitle: 'Backpack',
  headerBackTitle: '',
  headerTitleStyle: [t.textWhite, {fontFamily: 'Montserrat'}],
};
