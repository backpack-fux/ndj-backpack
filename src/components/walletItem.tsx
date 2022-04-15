import React from 'react';
import {TouchableOpacity, View, Image} from 'react-native';
import {colors} from '@app/assets/colors.config';
import {t} from 'react-native-tailwindcss';

import {Paragraph} from './text';
import {SwipeableItem} from './swipable';
import {Wallet} from '@app/models';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {networkList} from '@app/constants';

const logo = require('@app/assets/images/logo.png');

export const WalletItem = ({
  onPress,
  onPressRight,
  onPressLeft,
  rightText,
  leftText,
  swipeWidth,
  wallet,
  border = 0,
  selected = false,
}: {
  onPress?: () => void;
  onPressLeft?: () => void;
  onPressRight?: () => void;
  rightText?: string;
  leftText?: string;
  swipeWidth?: number;
  wallet: Wallet;
  selected?: boolean;
  border?: number;
}) => {
  const isMultiCoinWallet = !wallet.network;
  const WalletIcon = networkList.find(
    item => item.network === wallet.network,
  )?.Icon;
  return (
    <SwipeableItem
      width={swipeWidth}
      rightText={rightText}
      leftText={leftText}
      onPressRight={onPressRight}
      onPressLeft={onPressLeft}>
      <TouchableOpacity
        onPress={() => onPress && onPress()}
        activeOpacity={1}
        style={[
          t.flexRow,
          t.alignCenter,
          t.p2,
          t.bgPurple200,
          t.borderPurple500,
          {borderBottomWidth: border},
        ]}>
        <View
          style={[
            t.justifyCenter,
            t.alignCenter,
            t.mR2,
            t.w10,
            t.h10,
            isMultiCoinWallet ? t.bgPurple500 : t.bgWhite,
            t.roundedFull,
          ]}>
          {isMultiCoinWallet && (
            <Image
              source={logo}
              style={[t.selfCenter, {width: 30, height: 30, marginTop: -2}]}
              resizeMode="contain"
            />
          )}
          {WalletIcon && (
            <WalletIcon style={[t.selfCenter]} width={30} height={30} />
          )}
          {selected && (
            <View
              style={[
                t.absolute,
                t.top0,
                t.right0,
                t.bgPink500,
                t.roundedFull,
              ]}>
              <Icon name="check" color={colors.white} />
            </View>
          )}
        </View>
        <View style={[t.flex1, t.justifyCenter]}>
          <Paragraph text={wallet.name} />
          {isMultiCoinWallet && (
            <Paragraph
              text="Multi-Coin Wallet"
              size={10}
              lineHeight={10}
              color={colors.textGray}
            />
          )}
        </View>
        {onPress && (
          <View style={[t.justifyCenter]}>
            <Icon name="arrow-forward-ios" color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
    </SwipeableItem>
  );
};
