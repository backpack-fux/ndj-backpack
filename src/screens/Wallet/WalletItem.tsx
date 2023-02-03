import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Image,
  TouchableOpacity,
  View,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {t} from 'react-native-tailwindcss';
import Clipboard from '@react-native-community/clipboard';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import CardFlip from 'react-native-card-flip';
import * as _ from 'lodash';
import {Paragraph} from '@app/components';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import {
  currencySelector,
  networkSelector,
  selectedWalletSelector,
} from '@app/store/wallets/walletsSelector';
import {Wallet} from '@app/models';
import {
  sendTokenInfoSelector,
  tokensSelector,
} from '@app/store/coins/coinsSelector';
import {renameWallet} from '@app/store/wallets/actions';
import {colors} from '@app/assets/colors.config';

import {formatCurrency} from '@app/utils';
import {borderWidth, networkList, NetworkName} from '@app/constants';
import {useWalletConnect} from '@app/context/walletconnect';
import {Send} from './Send';
import {Receive} from './Receive';
import {Farcaster} from './Farcaster';
import {useWallets} from './WalletsContext';
import {FarcasterIcon} from './FarcasterIcon';
import {User} from '@standard-crypto/farcaster-js';
import {updateSendTokenInfo} from '@app/store/coins/actions';

const logo = require('@app/assets/images/logo.png');
const toggle = require('@app/assets/images/toggle.png');

const shadow = {
  shadowColor: '#fff',
  shadowOffset: {
    width: 0,
    height: 5,
  },
  shadowOpacity: 0.6,
  shadowRadius: 1,

  elevation: 5,
};

const cardContainerHeight = 200;
const farcasterItemHeight = 40;

export const WalletItem = ({wallet}: {wallet: Wallet}) => {
  const {sessions, legacyClients} = useWalletConnect();
  const {
    cardType,
    showSeed,
    onShowSeed,
    onSelectWallet,
    onSetCardRef,
    isSearchingFarcasters,
    farcasters,
    selectedFacarster,
  } = useWallets();
  const dispatch = useDispatch();
  const selectedWallet = useSelector(selectedWalletSelector);
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const tokens = useSelector(tokensSelector);
  const currency = useSelector(currencySelector);
  const network = useSelector(networkSelector);
  const [seedHeight, setSeedHeight] = useState(0);
  const farcastersHeight = useMemo(
    () =>
      isSearchingFarcasters
        ? farcasterItemHeight
        : farcasterItemHeight * farcasters.length,
    [farcasters, isSearchingFarcasters],
  );
  const isShowSeed = useMemo(() => wallet.id === showSeed, [wallet, showSeed]);
  const isSelected = useMemo(
    () => selectedWallet?.id === wallet.id,
    [selectedWallet, wallet],
  );

  const isShowFarcasters = useMemo(
    () =>
      isSelected &&
      cardType === 'farcaster' &&
      (isSearchingFarcasters || farcasters.length > 0),
    [cardType, isSelected, farcasters, isSearchingFarcasters],
  );

  const cardHeight = useRef(new Animated.Value(cardContainerHeight)).current;

  const flipHeight = useMemo(() => {
    if (isShowSeed) {
      return cardContainerHeight + seedHeight;
    }

    if (isShowFarcasters) {
      return cardContainerHeight + farcastersHeight;
    }

    return cardContainerHeight;
  }, [isShowSeed, seedHeight, isShowFarcasters, farcastersHeight]);

  const tokenList = tokens[wallet.id] || [];

  const totalBalance = tokenList.reduce(
    (total, token) => total + (token.price || 0) * (token.balance || 0),
    0,
  );

  const ethAddress = useMemo(
    () => wallet.wallets.find(w => w.network === NetworkName.ethereum)?.address,
    [wallet],
  );

  const topTokens = useMemo(
    () =>
      _.cloneDeep(tokenList)
        .slice()
        .filter(a => a.balance && a.balance > 0)
        .sort((a, b) =>
          (a.balance || 0) * (a.price || 0) > (b.balance || 0) * (b.price || 0)
            ? -1
            : 1,
        )
        .splice(0, 3)
        .reverse(),
    [tokenList],
  );

  const ethWallet = useMemo(
    () => wallet.wallets.find(w => w.network === NetworkName.ethereum),
    [wallet],
  );
  const ensName = useMemo(
    () =>
      ethWallet?.ensInfo?.name && ethWallet?.ensInfo?.name !== ethWallet.address
        ? ethWallet?.ensInfo?.name
        : null,
    [ethWallet],
  );

  const ensAvatar = useMemo(() => ethWallet?.ensInfo?.avatar, [ethWallet]);

  const accounts = useMemo(
    () =>
      wallet.wallets.map(w => {
        const item = networkList.find(n => n.network === w.network);
        return `${item?.chain}${
          item?.chainId && item.chainId[network]
            ? `:${item?.chainId[network]}`
            : ''
        }:${w.address}`;
      }),
    [wallet],
  );

  const walletSessions = sessions.filter((session: any) => {
    const sessionAccounts = (Object.values(session.namespaces) as any)
      .reduce((a: string, p: any) => {
        return [...a, ...p.accounts];
      }, [])
      .filter((d: string) => accounts.includes(d));
    return sessionAccounts?.length > 0;
  });

  const legacySessions = legacyClients.filter(legacyClient => {
    const sessionAccounts = legacyClient.accounts
      .map(address => `eip155:${legacyClient.chainId}:${address}`)
      .filter(address => accounts.includes(address));
    return sessionAccounts?.length > 0;
  });

  const dappCount = walletSessions.length + legacySessions.length;

  const onCopySeed = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy');
    Clipboard.setString(wallet.mnemonic);
    Toast.show({
      type: 'success',
      text1: 'Copied Seed!',
    });
  };

  const onRenameWallet = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy');

    Alert.prompt(
      'Rename Wallet',
      '',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Rename',
          onPress: (value: any) => {
            if (value) {
              dispatch(renameWallet({id: wallet.id, name: value}));
            }
          },
        },
      ],
      'plain-text',
      wallet.name,
    );
  };

  const onSelectFarcaster = (user: User) => {
    dispatch(
      updateSendTokenInfo({
        ...sendTokenInfo,
        farcaster: user,
      }),
    );
  };

  useEffect(() => {
    Animated.timing(cardHeight, {
      toValue: flipHeight,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [flipHeight]);

  return (
    <Animated.View style={[t.mB5, {height: cardHeight}]}>
      <CardFlip
        style={{height: flipHeight}}
        ref={ref => isSelected && onSetCardRef(ref)}>
        <View
          style={[
            t.bgPurple500,
            t.border2,
            t.roundedXl,
            shadow,
            isSelected ? t.borderPink500 : t.borderPurple200,
          ]}>
          <Animated.View style={[t.overflowHidden, {height: cardHeight}]}>
            <View style={[{height: cardContainerHeight}, t.p4]}>
              <TouchableOpacity
                onLongPress={onRenameWallet}
                style={[t.pT1, t.pB2]}>
                <Paragraph
                  text={`${wallet.name}${
                    network === 'testnet' ? ' (Test Money)' : ''
                  }`}
                  align="center"
                  type="bold"
                />
              </TouchableOpacity>
              <View style={[t.flexRow, t.mT2, t.itemsCenter]}>
                <View style={[t.mR10, t.itemsCenter]}>
                  <View
                    style={[
                      t.h16,
                      t.flexRow,
                      t.mB1,
                      t.itemsCenter,
                      t.justifyCenter,
                    ]}>
                    {ensAvatar ? (
                      <Image
                        source={{uri: ensAvatar}}
                        style={[t.w16, t.h16, t.selfCenter, t.flex1]}
                        resizeMode="contain"
                      />
                    ) : topTokens.length ? (
                      <View
                        style={[
                          t.h16,
                          {width: 64 + (topTokens.length - 1) * 25},
                        ]}>
                        {topTokens.map((token, index) => (
                          <Image
                            key={token.id + token.network}
                            source={{uri: token.image}}
                            style={[
                              {right: index * 25},
                              t.absolute,
                              t.w16,
                              t.h16,
                              t.selfCenter,
                              t.flex1,
                              t.roundedFull,
                              t.bgWhite,
                            ]}
                            resizeMode="contain"
                          />
                        ))}
                      </View>
                    ) : (
                      <Image
                        source={logo}
                        style={[t.w16, t.h16]}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <View style={[{width: 100}, t.selfCenter]}>
                    <Paragraph
                      text={ensName || ethAddress}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => onSelectWallet(wallet)}
                    disabled={sendTokenInfo.isLoading}
                    style={[t.flexRow, t.itemsCenter, t.justifyCenter, t.mT2]}>
                    {isSelected && (
                      <View style={[t.w4, t.h4]}>
                        <Image
                          source={toggle}
                          style={[
                            t.w4,
                            t.h4,
                            t.selfCenter,
                            t.flex1,
                            isSelected ? t.opacity100 : t.opacity50,
                          ]}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                    <Paragraph
                      text={isSelected ? 'default' : 'set default'}
                      size={12}
                      marginLeft={10}
                    />
                  </TouchableOpacity>
                </View>
                <View style={[t.flex1, t.justifyBetween]}>
                  <View
                    style={[
                      t.bgGray300,
                      t.mL4,
                      t.mR4,
                      t.roundedLg,
                      t.itemsCenter,
                      t.justifyCenter,
                      {height: 30},
                    ]}>
                    <Paragraph text={formatCurrency(totalBalance, currency)} />
                  </View>
                  <View style={[t.flexRow, t.mT4, t.justifyAround]}>
                    <TouchableOpacity
                      style={[t.itemsCenter]}
                      onPress={() => onShowSeed(isShowSeed ? null : wallet.id)}>
                      <Paragraph text="Seed" align="center" marginRight={5} />
                      <Paragraph
                        text={`${wallet.mnemonic.split(' ').length} W`}
                        type="bold"
                      />
                    </TouchableOpacity>
                    <View style={[t.itemsCenter]}>
                      <Paragraph text="Apps" align="center" />
                      <View style={[t.flexRow, t.itemsCenter]}>
                        <Paragraph
                          text={dappCount.toString()}
                          type="bold"
                          align="center"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onLayout={e => {
                setSeedHeight(e.nativeEvent.layout.height);
              }}
              style={[t.p4]}
              onPress={() => onShowSeed(isShowSeed ? null : wallet.id)}
              onLongPress={onCopySeed}>
              <View
                style={[
                  t.p2,
                  t.roundedLg,
                  t.borderYellow200,
                  t.bgGray300,
                  {borderWidth},
                ]}>
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
                  <Paragraph text="long press" type="bold" marginRight={5} />
                  <Paragraph text="to copy your seed phrase" />
                </View>
              </View>
              <View
                style={[
                  t.p2,
                  t.mT2,
                  t.roundedLg,
                  t.borderPink500,
                  t.itemsCenter,
                  t.justifyCenter,
                  {borderWidth},
                  {height: 120},
                ]}>
                <Paragraph
                  text={wallet.mnemonic}
                  font="Montserrat"
                  letterSpacing={3.5}
                  align="center"
                  lineHeight={24}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View>
          <View
            style={[
              t.bgPurple500,
              t.border2,
              t.p4,
              t.roundedXl,
              shadow,
              isSelected ? t.borderPink500 : t.borderPurple200,
              {height: cardContainerHeight, zIndex: 1},
            ]}>
            {isSelected ? (
              <>
                {cardType === 'send' && <Send />}
                {cardType === 'receive' && <Receive />}
                {cardType === 'farcaster' && <Farcaster />}
              </>
            ) : (
              <View style={{height: 160}} />
            )}
          </View>
          {isShowFarcasters && (
            <View
              style={[
                t.overflowHidden,
                t.bgGray300,
                t.roundedBLg,
                t.pL2,
                t.pR2,
                {marginTop: -10, zIndex: 0, paddingTop: 20, paddingBottom: 5},
              ]}>
              {isSearchingFarcasters && (
                <ActivityIndicator color={colors.white} />
              )}
              {farcasters.map(item => (
                <TouchableOpacity
                  onPress={() => onSelectFarcaster(item)}
                  key={item.fid}
                  style={[
                    t.flex,
                    t.flexRow,
                    t.itemsCenter,
                    t.p2,
                    t.pT1,
                    t.pB1,
                    t.roundedLg,
                    item.fid === selectedFacarster?.fid
                      ? {backgroundColor: colors.secondary}
                      : {},
                    {height: farcasterItemHeight},
                  ]}>
                  <FarcasterIcon uri={item?.pfp?.url} size={30} />
                  <Paragraph marginLeft={10} text={`@${item.username}`} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </CardFlip>
    </Animated.View>
  );
};
