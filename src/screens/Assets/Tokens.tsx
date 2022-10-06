import React, {useEffect, useState} from 'react';
import {
  Image,
  View,
  Switch,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {t} from 'react-native-tailwindcss';

import {colors} from '@app/assets/colors.config';
import {BaseScreen, Card, Paragraph} from '@app/components';
import {
  accountCoinsSelector,
  isSearchingCoinsSelector,
  searchedCoinsSelector,
} from '@app/store/coins/coinsSelector';
import {BaseCoin} from '@app/models';
import {searchCoinsRequest, toggleAccountCoin} from '@app/store/coins/actions';
import {useDebounce} from '@app/uses';
import {refreshWallets} from '@app/store/wallets/actions';
import {useNavigation} from '@react-navigation/native';
import {showNetworkName} from '@app/utils';
import {networkSelector} from '@app/store/wallets/walletsSelector';

const borderBottomWidth = 0.3;
export const TokensScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const userCoins = useSelector(accountCoinsSelector);
  const searchedCoins = useSelector(searchedCoinsSelector);
  const isSearchingCoins = useSelector(isSearchingCoinsSelector);
  const network = useSelector(networkSelector);

  const enabledCoins = userCoins.filter(c => !c.hidden);

  const debouncedSearchText = useDebounce(searchText, 1000);

  const coins = debouncedSearchText
    ? searchedCoins.map(
        s =>
          enabledCoins.find(w => w.contractAddress === s.contractAddress) || s,
      )
    : enabledCoins;

  const onToggleCoin = (coin: BaseCoin, value: boolean) => {
    dispatch(
      toggleAccountCoin({
        coin,
        enabled: value,
      }),
    );
  };

  useEffect(() => {
    return () => {
      dispatch(refreshWallets());
    };
  }, []);

  useEffect(() => {
    dispatch(searchCoinsRequest(debouncedSearchText));
  }, [debouncedSearchText]);

  return (
    <BaseScreen
      noPadding
      title="Add Custom Token"
      noBottom
      showToast
      onBack={() => navigation.goBack()}>
      <View
        style={[
          t.bgPurple200,
          t.mT2,
          t.mL4,
          t.mR4,
          t.pL2,
          t.pR2,
          t.roundedLg,
          t.mB4,
        ]}>
        <TextInput
          style={[t.textWhite, t.wFull, t.h10, {fontSize: 16}]}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={colors.textGray}
        />
      </View>
      <ScrollView
        contentContainerStyle={[t.pL4, t.pR4]}
        keyboardDismissMode="on-drag">
        <Card>
          {isSearchingCoins ? (
            <ActivityIndicator color={colors.white} size="large" />
          ) : (
            <>
              {coins.length ? (
                coins.map(coin => (
                  <View
                    key={coin.id + coin.network}
                    style={[t.flexRow, t.p2, {borderBottomWidth}]}>
                    <Image
                      source={{uri: coin.image}}
                      style={[t.w10, t.h10, t.roundedFull, t.bgWhite, t.mR4]}
                    />
                    <View style={[t.flex1, t.selfCenter]}>
                      <Paragraph
                        text={`${coin.name} (${coin.symbol.toUpperCase()})`}
                      />
                      <Paragraph
                        text={showNetworkName(coin.network, network)}
                        size={14}
                        color={colors.textGray}
                      />
                    </View>
                    <Switch
                      style={[t.selfCenter]}
                      value={coin.enabled}
                      onChange={() => onToggleCoin(coin, !coin.enabled)}
                    />
                  </View>
                ))
              ) : (
                <Paragraph text="No Result" size={14} align="center" />
              )}
            </>
          )}
        </Card>
      </ScrollView>
    </BaseScreen>
  );
};
