import React from 'react';
import {FlatList, Image, TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {BaseScreen, Card, Paragraph} from '@app/components';
import {useSelector} from 'react-redux';
import {walletsSelector} from '@app/store/wallets/walletsSelector';
import {Wallet, WalletStackParamList} from '@app/models';
import {colors} from '@app/assets/colors.config';
import {NavigationProp, useNavigation} from '@react-navigation/native';

const logo = require('@app/assets/images/logo.png');

export const WalletsScreen = () => {
  const wallets = useSelector(walletsSelector);
  const navigation = useNavigation<NavigationProp<WalletStackParamList>>();

  const renderWallet = ({item}: {item: Wallet}) => {
    return (
      <Card>
        <Paragraph text={item.name} align="center" type="bold" />
        <View style={[t.flexRow, t.mT4, t.itemsCenter]}>
          <Image
            source={logo}
            style={[t.w16, t.h16, t.selfCenter, t.flex1]}
            resizeMode="contain"
          />
          <View
            style={[
              t.bgGray200,
              t.roundedLg,
              t.flex1,
              t.itemsCenter,
              t.justifyCenter,
              t.h8,
            ]}>
            <Paragraph text="0.02 BTC" />
          </View>
        </View>
        <View style={[t.flexRow, t.mT4, t.justifyAround]}>
          <View style={[t.flexRow, t.itemsCenter]}>
            <Paragraph text="Seed" type="bold" align="center" marginRight={5} />
            <Icon name="ios-copy-outline" size={20} color={colors.white} />
          </View>
          <View>
            <Paragraph text="Assets" type="bold" align="center" />
            <Paragraph text="8" type="bold" align="center" />
          </View>
          <View style={[t.itemsCenter]}>
            <Paragraph text="dApp" type="bold" align="center" />
            <View style={[t.flexRow, t.itemsCenter]}>
              <Paragraph text="8" type="bold" align="center" />
              <Icon name="git-pull-request" size={20} color={colors.white} />
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <BaseScreen>
      <FlatList
        data={wallets}
        keyExtractor={item => `${item.id}`}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        renderItem={renderWallet}
        ListFooterComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddWallet')}
            style={[t.flexRow, t.p2, t.itemsCenter, t.justifyCenter]}>
            <MIcon name="plus" size={20} color={colors.white} />
            <Paragraph text="new wallet" />
          </TouchableOpacity>
        }
      />
    </BaseScreen>
  );
};
