import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';
import Clipboard from '@react-native-community/clipboard';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {useDispatch, useSelector} from 'react-redux';
import {
  currencySelector,
  networkSelector,
  selectedWalletSelector,
  walletsSelector,
} from '@app/store/wallets/walletsSelector';
import {Wallet, WalletStackParamList} from '@app/models';
import {colors} from '@app/assets/colors.config';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {
  isLoadingTokensSelector,
  tokensSelector,
} from '@app/store/coins/coinsSelector';
import {deleteWallet, refreshWallets} from '@app/store/wallets/actions';

import {formatCurrency, showSnackbar} from '@app/utils';
import {borderWidth, networkList, NetworkName} from '@app/constants';
import {selectWallet} from '@app/store/wallets/actions';
import {useWalletConnect} from '@app/context/walletconnect';

const logo = require('@app/assets/images/logo.png');
const toggle = require('@app/assets/images/toggle.png');

const boxShadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,

  elevation: 5,
};

export const WalletsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<WalletStackParamList>>();
  const wallets = useSelector(walletsSelector);
  const selectedWallet = useSelector(selectedWalletSelector);
  const isLoading = useSelector(isLoadingTokensSelector);

  const walletList = useMemo(
    () => wallets.sort(a => (a.id === selectedWallet?.id ? -1 : 1)),
    [wallets, selectedWallet],
  );

  const onDelete = () => {
    if (!selectedWallet) {
      return;
    }

    ReactNativeHapticFeedback.trigger('impactHeavy');

    Alert.alert(
      'Delete Wallet',
      'Are you sure to delete the selected wallet?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Delete',
          onPress: () => dispatch(deleteWallet(selectedWallet)),
        },
      ],
    );
  };

  const onAddWallet = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy');
    navigation.navigate('AddWallet');
  };

  return (
    <BaseScreen>
      <View style={[t.flex1]}>
        <FlatList
          data={walletList}
          keyExtractor={item => `${item.id}`}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => <WalletItem wallet={item} />}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => dispatch(refreshWallets())}
              tintColor={colors.white}
              titleColor={colors.white}
            />
          }
        />
      </View>
      <View style={[t.flexRow, t.mT2]}>
        <View style={[t.flex1]}>
          <Button text="Add Wallet" onPress={onAddWallet} />
        </View>
        <View style={[t.flex1, t.mL2]}>
          <Button
            text="Delete Wallet"
            onPress={onDelete}
            disabled={!selectedWallet}
          />
        </View>
      </View>
    </BaseScreen>
  );
};

const WalletItem = ({wallet}: {wallet: Wallet}) => {
  const {sessions} = useWalletConnect();
  const dispatch = useDispatch();
  const selectedWallet = useSelector(selectedWalletSelector);
  const tokens = useSelector(tokensSelector);
  const currency = useSelector(currencySelector);
  const [showSeed, setShowSeed] = useState(false);
  const network = useSelector(networkSelector);

  const tokenList = tokens[wallet.id] || [];

  const totalBalance = tokenList.reduce(
    (total, token) => total + (token.price || 0) * (token.balance || 0),
    0,
  );

  const ethAddress = useMemo(
    () => wallet.wallets.find(w => w.network === NetworkName.ethereum)?.address,
    [wallet],
  );

  const isSelected = useMemo(
    () => selectedWallet?.id === wallet.id,
    [selectedWallet, wallet],
  );

  const topTokens = useMemo(
    () =>
      tokenList
        .filter(a => a.balance && a.balance > 0)
        .sort((a, b) =>
          (a.balance || 0) * (a.price || 0) > (b.balance || 0) * (b.price || 0)
            ? -1
            : 1,
        )
        .slice(0, 3),
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
          item?.chainId && item.chainId[network] ? `:${item?.chainId}` : ''
        }:${w.address}`;
      }),
    [wallet],
  );

  const walletSessions = useMemo(
    () =>
      sessions.filter(session => {
        const sessionAccounts = session.state.accounts.filter(d =>
          accounts.includes(d),
        );
        return sessionAccounts.length > 0;
      }),
    [sessions],
  );

  const onCopySeed = () => {
    Clipboard.setString(wallet.mnemonic);
    showSnackbar('Copied Seed!');
  };

  return (
    <Card borderColor={isSelected ? colors.secondary : colors.primaryLight}>
      <Paragraph
        text={`${wallet.name}${network === 'testnet' ? ' (Testnet)' : ''}`}
        align="center"
        type="bold"
      />
      <View style={[t.flexRow, t.mT4, t.itemsCenter]}>
        <View style={[t.mR10, t.itemsCenter]}>
          <View
            style={[t.h16, t.flexRow, t.mB1, t.itemsCenter, t.justifyCenter]}>
            {ensAvatar ? (
              <Image
                source={{uri: ensAvatar}}
                style={[t.w16, t.h16, t.selfCenter, t.flex1]}
                resizeMode="contain"
              />
            ) : topTokens.length ? (
              <View style={[t.h16, {width: 64 + (topTokens.length - 1) * 25}]}>
                {topTokens.map((token, index) => (
                  <Image
                    key={token.id}
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
                      boxShadow,
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
            onPress={() => dispatch(selectWallet(wallet))}
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
              t.roundedLg,
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
                <Paragraph
                  text={walletSessions.length.toString()}
                  type="bold"
                  align="center"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
      {showSeed && (
        <TouchableOpacity
          style={[t.mT4]}
          onPress={() => setShowSeed(!showSeed)}
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
            style={[t.p2, t.mT2, t.roundedLg, t.borderPink500, {borderWidth}]}>
            <Paragraph
              text={wallet.mnemonic}
              font="Montserrat"
              letterSpacing={3.5}
              align="center"
              lineHeight={24}
            />
          </View>
        </TouchableOpacity>
      )}
    </Card>
  );
};
