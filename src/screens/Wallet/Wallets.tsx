import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Alert, FlatList, RefreshControl, View, Animated} from 'react-native';
import {t} from 'react-native-tailwindcss';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import * as _ from 'lodash';
import {BaseScreen, Button} from '@app/components';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectedWalletSelector,
  walletsSelector,
} from '@app/store/wallets/walletsSelector';
import {StackParams, Wallet} from '@app/models';
import {colors} from '@app/assets/colors.config';
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {
  accountCoinsSelector,
  isLoadingTokensSelector,
  sendTokenInfoSelector,
  tokenSelector,
} from '@app/store/coins/coinsSelector';
import {deleteWallet, refreshWallets} from '@app/store/wallets/actions';

import {sleep} from '@app/utils';
import {selectWallet} from '@app/store/wallets/actions';
import {
  setToken,
  transferTokenRequest,
  updateSendTokenInfo,
} from '@app/store/coins/actions';
import {useKeychain} from '@app/context/keychain';
import {VerifyPasscodeModal} from '@app/components/verifyPasscodeModal';
import {WalletItem} from './WalletItem';

export const WalletsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const {enabled, toggleIsActive} = useKeychain();
  const wallets = useSelector(walletsSelector);
  const selectedWallet = useSelector(selectedWalletSelector);
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const isLoading = useSelector(isLoadingTokensSelector);
  const tokens = useSelector(accountCoinsSelector);
  const selectedCoin = useSelector(tokenSelector);
  const [backScreen, setBackScreen] = useState<'send' | 'receive'>('send');
  const [openVerify, setOpenVerify] = useState(false);
  const focused = useIsFocused();
  const listRef = useRef<any>();
  const buttonContainerHeight = useRef(new Animated.Value(100)).current;

  const [isBack, setIsBack] = useState(false);
  const [showSeed, setShowSeed] = useState<string | null>(null);
  const [isChangedSelectedWallet, setIsChangedSelectedWallet] = useState(false);

  let selectedCard: any;

  const walletList = useMemo(
    () =>
      _.cloneDeep(wallets).sort(a => (a.id === selectedWallet?.id ? 1 : -1)),
    [wallets, selectedWallet],
  );

  const onDelete = () => {
    if (!selectedWallet) {
      return;
    }

    Alert.alert(
      'Delete Wallet',
      'Are you sure you want to delete the selected wallet?',
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
    scrollToEnd();
    selectedCard?.flip();
    setIsBack(true);
    setShowSeed(null);
  };

  const onPressSend = () => {
    setBackScreen('send');
    if (!selectedCard) {
      return;
    }
    selectedCard?.flip();
    setIsBack(true);
    setShowSeed(null);
    scrollToEnd();
  };

  const onCancelBack = () => {
    if (!selectedCard) {
      return;
    }

    scrollToEnd(400);
    dispatch(
      updateSendTokenInfo({
        token: sendTokenInfo.token,
        transaction: undefined,
        toAccount: undefined,
        amount: undefined,
        isSendMax: false,
      }),
    );

    selectedCard?.flip();
    setIsBack(false);
  };

  const onSelectWallet = (w: Wallet) => {
    if (isBack) {
      onCancelBack();
    }

    ReactNativeHapticFeedback.trigger('impactHeavy');
    dispatch(selectWallet(w));
    scrollToEnd();
  };

  const onOpenSelectScreen = () => {
    navigation.navigate('SelectToken');
  };

  const onSendToken = () => {
    if (enabled) {
      toggleIsActive(false);
      setOpenVerify(true);
      return;
    }

    Alert.alert(
      'Send a Token',
      `Are you sure you want to send ${
        sendTokenInfo.amount
      } ${sendTokenInfo.token?.symbol?.toUpperCase()}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Send',
          onPress: () => sendToken(),
        },
      ],
    );
  };

  const onCancelSendToken = () => {
    toggleIsActive(true);
    setOpenVerify(false);
  };

  const sendToken = () => {
    toggleIsActive(true);
    setOpenVerify(false);
    dispatch(transferTokenRequest());
  };

  const onShowSeed = (walletId: string | null) => {
    setShowSeed(walletId);
    if (
      (showSeed === selectedWallet?.id && walletId === null) ||
      walletId === selectedWallet?.id
    ) {
      setIsChangedSelectedWallet(true);
    } else {
      setIsChangedSelectedWallet(false);
    }
  };

  const scrollToEnd = async (timeout: number = 0) => {
    if (!listRef?.current?.scrollToEnd) {
      return;
    }

    console.log('scroll end', timeout);

    await sleep(timeout);
    listRef.current.scrollToEnd({animating: true});
  };

  useEffect(() => {
    if (tokens.length && !selectedCoin) {
      dispatch(setToken(tokens[0]));
    }
  }, [tokens, selectedCoin]);

  useEffect(() => {
    if (focused) {
      scrollToEnd(100);
    }
  }, [focused]);

  useEffect(() => {
    scrollToEnd(200);
  }, []);

  useEffect(() => {
    Animated.timing(buttonContainerHeight, {
      toValue: isBack && backScreen === 'receive' ? 50 : 100,
      duration: isBack && backScreen === 'receive' ? 300 : 0,
      useNativeDriver: false,
    }).start();
  }, [isBack, backScreen]);

  return (
    <>
      <BaseScreen>
        <View style={[t.flex1]}>
          <FlatList
            data={walletList}
            ref={listRef}
            listKey="wallet"
            keyExtractor={item => `${item.id}`}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            renderItem={({item}) => (
              <WalletItem
                wallet={item}
                showSeed={showSeed === item.id}
                onSelectWallet={onSelectWallet}
                onShowSeed={onShowSeed}
                cardRef={ref => {
                  if (selectedWallet?.id === item.id) {
                    selectedCard = ref;
                  }
                }}
                backScreen={backScreen}
              />
            )}
            onContentSizeChange={() => {
              if (isChangedSelectedWallet) {
                listRef.current.scrollToEnd({animated: false});
              }
            }}
            refreshControl={
              <RefreshControl
                refreshing={isLoading && focused}
                onRefresh={() => !isLoading && dispatch(refreshWallets())}
                tintColor={colors.white}
                titleColor={colors.white}
              />
            }
          />
        </View>
        <Animated.View
          style={{
            height: buttonContainerHeight,
          }}>
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
                <View style={[t.mT2]}>
                  <Button
                    text="Change Token"
                    onPress={onOpenSelectScreen}
                    disabled={!selectedWallet || sendTokenInfo.isLoading}
                  />
                </View>
              )}
              <View style={[t.flexRow, t.mT2]}>
                <View style={[t.flex1]}>
                  <Button
                    text="Cancel"
                    onPress={onCancelBack}
                    disabled={
                      backScreen === 'send'
                        ? !selectedWallet || sendTokenInfo.isLoading
                        : !selectedWallet
                    }
                  />
                </View>
                <View style={[t.flex1, t.mL2]}>
                  {backScreen === 'send' ? (
                    <Button
                      text="Submit"
                      onPress={onSendToken}
                      disabled={
                        !sendTokenInfo.transaction || sendTokenInfo.isLoading
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
        </Animated.View>
      </BaseScreen>
      <VerifyPasscodeModal
        open={openVerify}
        showVerify={true}
        onCancel={() => onCancelSendToken()}
        onVerified={() => sendToken()}
      />
    </>
  );
};
