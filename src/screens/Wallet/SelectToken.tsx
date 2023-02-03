import React from 'react';
import {Image, View, ScrollView, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {t} from 'react-native-tailwindcss';

import {colors} from '@app/assets/colors.config';
import {BaseScreen, Card, Paragraph} from '@app/components';
import {
  sendTokenInfoSelector,
  tokensSelector,
} from '@app/store/coins/coinsSelector';
import {Token} from '@app/models';
import {setToken, updateSendTokenInfo} from '@app/store/coins/actions';
import {networkName} from '@app/constants';
import {useNavigation} from '@react-navigation/native';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';
import {normalizeNumber} from '@app/utils';

const borderBottomWidth = 0.3;
export const SelectTokenScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const selectedWallet = useSelector(selectedWalletSelector);
  const allTokens = useSelector(tokensSelector);
  const tokens = (selectedWallet?.id && allTokens[selectedWallet?.id]) || [];
  const sendTokenInfo = useSelector(sendTokenInfoSelector);

  const onSelectToken = (token: Token) => {
    dispatch(
      updateSendTokenInfo({
        token: sendTokenInfo.token,
        farcaster: undefined,
        isSentSuccessFully: false,
        transaction: undefined,
        toAccount: undefined,
        amount: undefined,
        amountUSD: undefined,
        isSendMax: false,
      }),
    );
    dispatch(setToken(token));
    navigation.goBack();
  };

  return (
    <BaseScreen
      noPadding
      title="Change a Token"
      noBottom
      showToast
      onBack={() => navigation.goBack()}>
      <ScrollView
        contentContainerStyle={[t.pL4, t.pR4]}
        keyboardDismissMode="on-drag">
        <Card>
          {tokens.map(token => (
            <TouchableOpacity
              key={token.id + token.network}
              onPress={() => onSelectToken(token)}
              style={[t.flexRow, t.p2, {borderBottomWidth}]}>
              <Image
                source={{uri: token.image}}
                style={[t.w10, t.h10, t.roundedFull, t.bgWhite, t.mR4]}
              />
              <View style={[t.flex1, t.selfCenter]}>
                <Paragraph
                  text={`${token.name} (${token.symbol.toUpperCase()})`}
                />
                <Paragraph
                  text={networkName[token.network] || token.network}
                  color={colors.textGray}
                />
              </View>
              <View>
                <Paragraph
                  text={normalizeNumber(token.balance || 0)}
                  align="right"
                />
                <Paragraph
                  text={token.symbol.toUpperCase()}
                  color={colors.textGray}
                  align="right"
                />
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    </BaseScreen>
  );
};
