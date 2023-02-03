import React, {useMemo, useState} from 'react';
import {
  Image,
  RefreshControl,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {useDispatch, useSelector} from 'react-redux';
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import {colors} from '@app/assets/colors.config';
import {refreshWallets} from '@app/store/wallets/actions';
import {setToken} from '@app/store/coins/actions';
import {BaseCoin, StackParams} from '@app/models';
import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {
  accountCoinsSelector,
  isLoadingTokensSelector,
  sendTokenInfoSelector,
  tokenSelector,
  tokensSelector,
} from '@app/store/coins/coinsSelector';
import {normalizeNumber, showNetworkName} from '@app/utils';
import {
  networkSelector,
  selectedWalletSelector,
} from '@app/store/wallets/walletsSelector';
import {wyreSupportCoins} from '@app/constants/wyre';
import {wyreService} from '@app/services/wyreService';

export const AssetsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<StackParams>>();

  const isLoading = useSelector(isLoadingTokensSelector);
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const tokens = useSelector(tokensSelector);
  const network = useSelector(networkSelector);
  const selectedCoin = useSelector(tokenSelector);
  const selectedWallet = useSelector(selectedWalletSelector);
  const [loadingWyre, setLoadingWyre] = useState(false);
  const focused = useIsFocused();

  const allTokens = Object.values(tokens).reduce((all, current) => {
    return all.concat(current);
  }, []);
  let coins = useSelector(accountCoinsSelector);

  coins = coins
    .filter(c => c.enabled)
    .filter(c => !c.hidden)
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

  const wyreToken = useMemo<any>(() => {
    if (!selectedCoin) {
      return null;
    }

    const networkTokens = wyreSupportCoins[selectedCoin.network];

    if (!networkTokens) {
      return;
    }

    return networkTokens[selectedCoin.symbol.toUpperCase()];
  }, [selectedCoin]);

  const onPressToken = () => {
    if (!selectedCoin) {
      return;
    }

    navigation.navigate('Transaction');
  };

  const onSelectToken = (token: BaseCoin) => {
    dispatch(setToken(token));
  };

  const onOpenAddToken = () => {
    navigation.navigate('Tokens');
  };

  const onBuyToken = async () => {
    if (!selectedCoin || !wyreToken || !selectedWallet) {
      return;
    }

    const wallet = selectedWallet.wallets.find(
      w => w.network === selectedCoin.network,
    );

    if (!wallet) {
      return;
    }

    setLoadingWyre(true);

    try {
      const res = await wyreService.reserve(
        wyreToken.symbol,
        `${wyreToken.network}:${wallet.address}`,
      );

      if (res.url) {
        navigation.navigate('BuyToken', {
          url: res.url,
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message,
      });
    } finally {
      setLoadingWyre(false);
    }
  };

  return (
    <BaseScreen isLoading={loadingWyre}>
      <View style={[t.flex1]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={isLoading && focused}
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
                  disabled={sendTokenInfo.isLoading}
                  onPress={() => onSelectToken(coin)}
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
                    style={[t.w10, t.h10, t.roundedFull, t.bgWhite, t.mR2]}
                  />
                  <View style={[t.flex1]}>
                    <Paragraph text={`${coin.name}`} />
                    <Paragraph
                      size={14}
                      color={isSelected ? colors.white : colors.textGray}
                      text={showNetworkName(coin.network, network)}
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
        <View style={[t.mT2]}>
          <Button
            text="Buy"
            disabled={!wyreToken || loadingWyre}
            onPress={() => onBuyToken()}
          />
        </View>
        <View style={[t.flexRow, t.mT2]}>
          <View style={[t.flex1]}>
            <Button text="Add Token" onPress={onOpenAddToken} />
          </View>
          <View style={[t.flex1, t.mL2]}>
            <Button
              text="History"
              onPress={onPressToken}
              disabled={!selectedCoin}
            />
          </View>
        </View>
      </View>
    </BaseScreen>
  );
};
