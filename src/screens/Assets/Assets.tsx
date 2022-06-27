import React, {useState} from 'react';
import {Image, RefreshControl, TouchableOpacity, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {t} from 'react-native-tailwindcss';
import {useDispatch, useSelector} from 'react-redux';
import {NavigationProp, useNavigation} from '@react-navigation/native';

import {colors} from '@app/assets/colors.config';
import {refreshWallets} from '@app/store/wallets/actions';
import {selectSendToken, setToken} from '@app/store/coins/actions';
import {AssetStackParamList, BaseCoin} from '@app/models';
import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {
  accountCoinsSelector,
  isLoadingTokensSelector,
  tokensSelector,
} from '@app/store/coins/coinsSelector';
import {normalizeNumber, showNetworkName} from '@app/utils';
import {networkSelector} from '@app/store/wallets/walletsSelector';

export const AssetsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<AssetStackParamList>>();

  const isLoading = useSelector(isLoadingTokensSelector);
  const tokens = useSelector(tokensSelector);
  const network = useSelector(networkSelector);

  const allTokens = Object.values(tokens).reduce((all, current) => {
    return all.concat(current);
  }, []);
  let coins = useSelector(accountCoinsSelector);

  coins = coins
    .filter(c => c.enabled)
    .map(coin => {
      const balance = allTokens
        .filter(
          a =>
            a.id === coin.id &&
            a.symbol === coin.symbol &&
            a.network === coin.network,
        )
        .map(a => a.balance || 0)
        .reduce((total, current) => total + current, 0);
      return {
        ...coin,
        balance,
      };
    });

  const [selectedCoin, setSelectedCoin] = useState<BaseCoin>();

  const onSend = () => {
    if (!selectedCoin) {
      return;
    }

    dispatch(selectSendToken(selectedCoin));
    navigation.navigate('Send');
  };

  const onPressToken = () => {
    if (!selectedCoin) {
      return;
    }

    dispatch(setToken(selectedCoin));
    navigation.navigate('Transaction');
  };

  const onOpenAddToken = () => {
    navigation.navigate('Tokens');
  };

  return (
    <BaseScreen>
      <View style={[t.flex1]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => dispatch(refreshWallets())}
              tintColor={colors.white}
              titleColor={colors.white}
            />
          }>
          <Card>
            {coins.map(coin => {
              const isSelected =
                selectedCoin?.id === coin.id &&
                selectedCoin.network === coin.network;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedCoin(coin)}
                  key={coin.id + coin.network}
                  style={[
                    t.flexRow,
                    t.itemsCenter,
                    t.mT1,
                    t.mT1,
                    t.p1,
                    t.pL2,
                    t.pR2,
                    t.roundedLg,
                    isSelected ? {backgroundColor: colors.secondary} : {},
                  ]}>
                  <Image
                    source={{uri: coin.image}}
                    style={[t.w8, t.h8, t.roundedFull, t.bgWhite, t.mR2]}
                  />
                  <View style={[t.flex1]}>
                    <Paragraph
                      text={`${coin.name}${showNetworkName(
                        coin.network,
                        network,
                      )}`}
                    />
                  </View>
                  <Paragraph
                    text={`${normalizeNumber(
                      coin.balance || 0,
                    )} ${coin.symbol.toUpperCase()}`}
                  />
                </TouchableOpacity>
              );
            })}
          </Card>
        </ScrollView>
      </View>
      <View>
        <View style={[t.flexRow, t.mT2]}>
          <View style={[t.flex1]}>
            <Button text="Add a Token" onPress={onOpenAddToken} />
          </View>
          <View style={[t.flex1, t.mL2]}>
            <Button
              text="Tx Details"
              onPress={onPressToken}
              disabled={!selectedCoin}
            />
          </View>
        </View>
        <View style={[t.flexRow, t.mT2]}>
          <View style={[t.flex1]}>
            <Button
              text="Receive"
              onPress={() =>
                navigation.navigate('Receive', {coin: selectedCoin})
              }
              disabled={!selectedCoin}
            />
          </View>
          <View style={[t.flex1, t.mL2]}>
            <Button text="Send" disabled={!selectedCoin} onPress={onSend} />
          </View>
        </View>
      </View>
    </BaseScreen>
  );
};
