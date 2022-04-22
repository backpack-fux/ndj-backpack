import React, {useState} from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {BaseScreen, Card, Paragraph} from '@app/components';
import {useDispatch, useSelector} from 'react-redux';
import {
  currencySelector,
  walletsSelector,
} from '@app/store/wallets/walletsSelector';
import {Wallet, WalletStackParamList} from '@app/models';
import {colors} from '@app/assets/colors.config';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {
  isLoadingTokensSelector,
  tokensSelector,
} from '@app/store/coins/coinsSelector';
import {refreshTokens} from '@app/store/coins/actions';
import {formatCurrency} from '@app/utils';
import {borderWidth, NetworkName} from '@app/constants';

const logo = require('@app/assets/images/logo.png');

export const WalletsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<WalletStackParamList>>();
  const wallets = useSelector(walletsSelector);
  const isLoading = useSelector(isLoadingTokensSelector);

  return (
    <BaseScreen>
      <FlatList
        data={wallets}
        keyExtractor={item => `${item.id}`}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => <WalletItem wallet={item} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => dispatch(refreshTokens())}
            tintColor={colors.white}
            titleColor={colors.white}
          />
        }
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

const WalletItem = ({wallet}: {wallet: Wallet}) => {
  const tokens = useSelector(tokensSelector);
  const currency = useSelector(currencySelector);
  const [showSeed, setShowSeed] = useState(false);

  const tokenList = tokens[wallet.id] || [];
  const totalBalance = tokenList.reduce(
    (total, token) => total + (token.price || 0) * (token.balance || 0),
    0,
  );

  const ethAddress = wallet.wallets.find(
    w => w.network === NetworkName.ethereum,
  )?.address;

  return (
    <Card>
      <Paragraph text={wallet.name} align="center" type="bold" />
      <View style={[t.flexRow, t.mT4, t.itemsCenter]}>
        <View style={[t.w40, t.pL8, t.pR8]}>
          <Image
            source={logo}
            style={[t.w16, t.h16, t.selfCenter, t.flex1]}
            resizeMode="contain"
          />
          <Paragraph
            text={ethAddress}
            numberOfLines={1}
            ellipsizeMode="middle"
          />
        </View>
        <View style={[t.flex1]}>
          <View
            style={[
              t.bgGray300,
              t.roundedLg,
              t.flex1,
              t.itemsCenter,
              t.justifyCenter,
              t.h8,
            ]}>
            <Paragraph text={formatCurrency(totalBalance, currency)} />
          </View>
          <View style={[t.flexRow, t.mT4, t.justifyAround]}>
            <TouchableOpacity
              style={[t.itemsCenter]}
              onPress={() => setShowSeed(!showSeed)}>
              <Paragraph text="Seed" align="center" marginRight={5} />
              <Paragraph
                text={`${wallet.mnemonic.split(' ').length} W`}
                type="bold"
              />
            </TouchableOpacity>
            <View style={[t.itemsCenter]}>
              <Paragraph text="dApps" align="center" />
              <View style={[t.flexRow, t.itemsCenter]}>
                <Paragraph text="0" type="bold" align="center" />
              </View>
            </View>
          </View>
        </View>
      </View>
      {showSeed && (
        <TouchableOpacity
          style={[t.mT4]}
          onPress={() => setShowSeed(!showSeed)}>
          <View style={[t.p2, t.roundedLg, t.borderYellow200, {borderWidth}]}>
            <Paragraph
              text="Seeds are private use them wisely, like you would with any other personal data"
              align="center"
              marginBottom={5}
            />
            <View style={[t.flexRow, t.justifyCenter]}>
              <Paragraph text="tap" type="bold" marginRight={5} />
              <Paragraph text="to close seed" />
            </View>
            <View style={[t.flexRow, t.justifyCenter]}>
              <Paragraph text="long press" type="bold" />
              <Paragraph text="to copy your seed phrase" />
            </View>
          </View>
          <View
            style={[t.p2, t.mT2, t.roundedLg, t.borderPink500, {borderWidth}]}>
            <Paragraph text={wallet.mnemonic} align="center" lineHeight={24} />
          </View>
        </TouchableOpacity>
      )}
    </Card>
  );
};
