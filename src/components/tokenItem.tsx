import {colors} from '@app/assets/colors.config';
import {networkName} from '@app/constants';
import {Token} from '@app/models';
import {formatCurrency, normalizeNumber} from '@app/utils';
import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {Paragraph} from './text';

export const TokenItem = ({
  token,
  currency,
  showBalance,
  showNetwork,
  border = 0.2,
  onPress = () => {},
}: {
  token: Token;
  currency: string;
  showBalance?: boolean;
  showNetwork?: boolean;
  border?: number;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[t.flexRow, t.p2, {borderBottomWidth: border}]}>
      <Image
        source={{uri: token.image}}
        style={[t.w10, t.h10, t.roundedFull, t.bgWhite, t.mR4]}
      />
      <View style={[t.flex1]}>
        <Paragraph text={token.name} />
        <View style={[t.flexRow, t.itemsCenter]}>
          {showNetwork && (
            <Paragraph
              text={networkName[token.network] || token.network}
              color={colors.textGray}
              size={12}
              marginRight={10}
            />
          )}
          <Paragraph
            text={token.price ? formatCurrency(token.price, currency) : ''}
            color={colors.textGray}
            marginRight={10}
            size={10}
          />
          <Paragraph
            text={
              token.priceChangePercent
                ? `${token.priceChangePercent.toFixed(2)}%`
                : ''
            }
            size={10}
            color={
              token.priceChangePercent && token.priceChangePercent > 0
                ? colors.green
                : colors.secondary
            }
          />
        </View>
      </View>
      {showBalance && (
        <View style={[t.selfCenter]}>
          <Paragraph
            text={`${normalizeNumber(
              token.balance,
            )} ${token.symbol.toUpperCase()}`}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};
