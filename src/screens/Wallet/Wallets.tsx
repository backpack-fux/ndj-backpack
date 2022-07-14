import React, {useEffect, useMemo, useState} from 'react';
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
import CardFlip from 'react-native-card-flip';

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
  sendTokenInfoSelector,
  tokensSelector,
} from '@app/store/coins/coinsSelector';
import {
  deleteWallet,
  refreshWallets,
  renameWallet,
} from '@app/store/wallets/actions';

import {formatCurrency, showSnackbar} from '@app/utils';
import {borderWidth, networkList, NetworkName} from '@app/constants';
import {selectWallet} from '@app/store/wallets/actions';
import {useWalletConnect} from '@app/context/walletconnect';
import {Send} from './Send';
import {Receive} from './Receive';
import {
  selectSendToken,
  setToken,
  transferTokenRequest,
} from '@app/store/coins/actions';

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
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const isLoading = useSelector(isLoadingTokensSelector);
  const [backScreen, setBackScreen] = useState<'send' | 'receive'>('send');

  const [isBack, setIsBack] = useState(false);
  const allTokens = useSelector(tokensSelector);
  const [showSeed, setShowSeed] = useState(false);

  const tokens = (selectedWallet?.id && allTokens[selectedWallet?.id]) || [];

  const insufficientBalance =
    Number(sendTokenInfo.amount || 0) > (sendTokenInfo.balance || 0);

  let selectedCard: any;

  const walletList = useMemo(
    () => wallets.sort(a => (a.id === selectedWallet?.id ? -1 : 1)),
    [wallets, selectedWallet],
  );

  const onDelete = () => {
    if (!selectedWallet) {
      return;
    }

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
    navigation.navigate('AddWallet');
  };

  const onPressReceive = () => {
    setBackScreen('receive');

    if (!selectedCard) {
      return;
    }

    selectedCard?.flip();
    setIsBack(true);
    setShowSeed(false);
  };

  const onPressSend = () => {
    setBackScreen('send');
    if (!selectedCard) {
      return;
    }

    selectedCard?.flip();
    setIsBack(true);
    setShowSeed(false);
  };

  const onCancelBack = () => {
    if (!selectedCard) {
      return;
    }

    selectedCard?.flip();
    setIsBack(false);
  };

  const onSelectWallet = (w: Wallet) => {
    if (isBack) {
      onCancelBack();
    }

    ReactNativeHapticFeedback.trigger('impactHeavy');
    dispatch(selectWallet(w));
  };

  const onOpenSelectScreen = () => {
    navigation.navigate('SelectToken');
  };

  const onSendToken = () => {
    dispatch(transferTokenRequest());
  };

  useEffect(() => {
    if (tokens.length) {
      dispatch(selectSendToken(tokens[0]));
      dispatch(setToken(tokens[0]));
    }
  }, [tokens]);

  useEffect(() => {
    if (
      insufficientBalance &&
      isBack &&
      backScreen === 'send' &&
      sendTokenInfo.transaction &&
      !sendTokenInfo.isLoading
    ) {
      showSnackbar(
        `Insufficient ${
          sendTokenInfo?.token?.name
        }(${sendTokenInfo?.token?.symbol.toUpperCase()}) balance`,
      );
    }
  }, [insufficientBalance, isBack, backScreen, sendTokenInfo]);

  return (
    <BaseScreen>
      <View style={[t.flex1]}>
        <FlatList
          data={walletList}
          keyExtractor={item => `${item.id}`}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <WalletItem
              wallet={item}
              showSeed={showSeed}
              onSelectWallet={onSelectWallet}
              onShowSeed={(value: boolean) => setShowSeed(value)}
              cardRef={ref => {
                if (selectedWallet?.id === item.id) {
                  selectedCard = ref;
                }
              }}
              backScreen={backScreen}
            />
          )}
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
      {!isBack ? (
        <>
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
          <View style={[t.flexRow, t.mT2]}>
            <View style={[t.flex1]}>
              <Button
                text="Receive"
                onPress={onPressReceive}
                disabled={!selectedWallet}
              />
            </View>
            <View style={[t.flex1, t.mL2]}>
              <Button
                text="Send"
                onPress={onPressSend}
                disabled={!selectedWallet}
              />
            </View>
          </View>
        </>
      ) : (
        <>
          {backScreen === 'send' && (
            <Button
              text="Change Token"
              onPress={onOpenSelectScreen}
              disabled={!selectedWallet}
            />
          )}
          <View style={[t.flexRow, t.mT2]}>
            <View style={[t.flex1]}>
              <Button
                text="Cancel"
                onPress={onCancelBack}
                disabled={!selectedWallet}
              />
            </View>
            <View style={[t.flex1, t.mL2]}>
              {backScreen === 'send' ? (
                <Button
                  text="Submit"
                  onPress={onSendToken}
                  disabled={
                    !sendTokenInfo.transaction ||
                    insufficientBalance ||
                    sendTokenInfo.isTransferred ||
                    sendTokenInfo.isLoading
                  }
                />
              ) : (
                <Button
                  text="Change Token"
                  onPress={onOpenSelectScreen}
                  disabled={!selectedWallet}
                />
              )}
            </View>
          </View>
        </>
      )}
    </BaseScreen>
  );
};

const WalletItem = ({
  wallet,
  backScreen,
  cardRef,
  showSeed,
  onShowSeed,
  onSelectWallet,
}: {
  wallet: Wallet;
  showSeed: boolean;
  onShowSeed: (value: boolean) => void;
  backScreen: 'send' | 'receive';
  cardRef?: (ref: any) => void;
  onSelectWallet: (wallet: Wallet) => void;
}) => {
  const {sessions} = useWalletConnect();
  const dispatch = useDispatch();
  const selectedWallet = useSelector(selectedWalletSelector);
  const tokens = useSelector(tokensSelector);
  const currency = useSelector(currencySelector);
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
          item?.chainId && item.chainId[network]
            ? `:${item?.chainId[network]}`
            : ''
        }:${w.address}`;
      }),
    [wallet],
  );

  const walletSessions = useMemo(
    () =>
      sessions.filter((session: any) => {
        const sessionAccounts = (Object.values(session.namespaces) as any)
          .reduce((a: string, p: any) => {
            return [...a, ...p.accounts];
          }, [])
          .filter((d: string) => accounts.includes(d));
        return sessionAccounts?.length > 0;
      }),
    [sessions],
  );

  const onCopySeed = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy');
    Clipboard.setString(wallet.mnemonic);
    showSnackbar('Copied Seed!');
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

  return (
    <CardFlip
      style={{height: showSeed ? 470 : 220}}
      ref={ref => cardRef && cardRef(ref)}>
      <Card borderColor={isSelected ? colors.secondary : colors.primaryLight}>
        <TouchableOpacity onLongPress={onRenameWallet} style={[t.pT1, t.pB2]}>
          <Paragraph
            text={`${wallet.name}${network === 'testnet' ? ' (Testnet)' : ''}`}
            align="center"
            type="bold"
          />
        </TouchableOpacity>
        <View style={[t.flexRow, t.mT2, t.itemsCenter]}>
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
                <View
                  style={[t.h16, {width: 64 + (topTokens.length - 1) * 25}]}>
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
              onPress={() => onSelectWallet(wallet)}
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
                onPress={() => onShowSeed(!showSeed)}>
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
                    text={walletSessions.length.toString()}
                    type="bold"
                    align="center"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
        {isSelected && showSeed && (
          <TouchableOpacity
            style={[t.mT4]}
            onPress={() => onShowSeed(!showSeed)}
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
                {borderWidth},
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
        )}
      </Card>
      <Card borderColor={isSelected ? colors.secondary : colors.primaryLight}>
        {isSelected ? (
          <>{backScreen === 'send' ? <Send /> : <Receive />}</>
        ) : (
          <View style={{height: 160}} />
        )}
      </Card>
    </CardFlip>
  );
};
