import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {
  accountCoinsSelector,
  isLoadingTokensSelector,
  tokensSelector,
} from '@app/store/coins/coinsSelector';
import {normalizeNumber} from '@app/utils';
import React, {useState} from 'react';
import {Image, RefreshControl, TouchableOpacity, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {t} from 'react-native-tailwindcss';
import {useDispatch, useSelector} from 'react-redux';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '@app/assets/colors.config';
import {refreshWallets} from '@app/store/wallets/actions';
import {BaseCoin} from '@app/models';

const shadow = {
  shadowColor: colors.secondary,
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowOpacity: 1,
  shadowRadius: 6,

  elevation: 6,
};

export const AssetsScreen = () => {
  const isLoading = useSelector(isLoadingTokensSelector);
  const dispatch = useDispatch();
  const tokens = useSelector(tokensSelector);
  const allTokens = Object.values(tokens).reduce((all, current) => {
    return all.concat(current);
  }, []);
  let coins = useSelector(accountCoinsSelector);
  coins = coins.map(coin => {
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
                    t.p1,
                    t.pL2,
                    t.pR2,
                    t.roundedLg,
                    isSelected ? {backgroundColor: colors.button} : {},
                    isSelected ? shadow : {},
                  ]}>
                  <Image
                    source={{uri: coin.image}}
                    style={[t.w8, t.h8, t.roundedFull, t.bgWhite, t.mR2]}
                  />
                  <View style={[t.flex1]}>
                    <Paragraph text={coin.name} />
                  </View>
                  <Paragraph
                    text={`${normalizeNumber(
                      coin.balance || 0,
                    )} ${coin.symbol.toUpperCase()}`}
                  />
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[t.mT3, t.flexRow, t.justifyCenter, t.itemsCenter]}>
              <MIcon name="plus" size={20} color={colors.white} />
              <Paragraph
                text="Add a custom token"
                type="bold"
                align="center"
                marginLeft={10}
              />
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </View>
      <View>
        <Button text="Tx Details" disabled={!selectedCoin} />
        <View style={[t.flexRow, t.mT2]}>
          <View style={[t.flex1]}>
            <Button text="Receive" disabled={!selectedCoin} />
          </View>
          <View style={[t.flex1, t.mL2]}>
            <Button text="Send" disabled={!selectedCoin} />
          </View>
        </View>
      </View>
    </BaseScreen>
  );
};
