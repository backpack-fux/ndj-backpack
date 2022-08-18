import React from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Webview from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {StackParams} from '@app/models';
import {TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {colors} from '@app/assets/colors.config';
import {Paragraph} from '@app/components';

export const BuyTokenScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<StackParams, 'BuyToken'>>();
  const {url} = route.params;

  return (
    <View style={[t.flex1, t.bgWhite]}>
      <View style={[t.flexRow, t.mT1, t.mB1, t.itemsCenter]}>
        <TouchableOpacity
          style={[t.p1, t.mL2]}
          onPress={() => navigation.goBack()}>
          <Icon name="keyboard-arrow-down" color={colors.primary} size={40} />
        </TouchableOpacity>
        <View style={[t.flex1, t.mR10]}>
          <Paragraph
            text="Buy a Token"
            font="Montserrat"
            color={colors.primary}
            align="center"
            type="bold"
          />
        </View>
      </View>
      <Webview source={{uri: url}} />
    </View>
  );
};
