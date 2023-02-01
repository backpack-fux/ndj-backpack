import {Button} from '@app/components';
import {VerifyPasscodeModal} from '@app/components/verifyPasscodeModal';
import {useKeychain} from '@app/context/keychain';
import {StackParams, Wallet} from '@app/models';
import {
  setToken,
  transferTokenRequest,
  updateSendTokenInfo,
} from '@app/store/coins/actions';
import {
  sendTokenInfoSelector,
  tokenSelector,
  tokensSelector,
} from '@app/store/coins/coinsSelector';
import {selectWallet} from '@app/store/wallets/actions';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';
import {formatCurrency, sleep} from '@app/utils';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Animated, View, Alert} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {useDispatch, useSelector} from 'react-redux';
import {User} from '@standard-crypto/farcaster-js';
import {useDebounce} from '@app/uses';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import * as _ from 'lodash';

type WalletCardType = 'wallet' | 'send' | 'receive' | 'farcaster';

interface WalletsConnect {
  selectedFacarster?: User | null;
  farcasters: User[];
  isSearchingFarcasters: boolean;
  farcasterSearch: string;
  cardType: WalletCardType;
  showSeed: string | null;
  isChangedSelectedWallet: boolean;
  listRef: any;
  onSetListRef: (ref: any) => void;
  onSetCardRef: (ref: any) => void;
  onSelectWallet: (wallet: Wallet) => void;
  onShowSeed: (walletId: string | null) => void;
  onChangeFarcasterSearch: (value: string) => void;
  onSelectFarcaster: (value: User | null) => void;
  scrollToEnd: (timeout?: number) => void;
}

export const WalletsContext = createContext<WalletsConnect>({
  selectedFacarster: null,
  showSeed: '',
  cardType: 'wallet',
  farcasterSearch: '',
  isChangedSelectedWallet: false,
  listRef: null,
  farcasters: [],
  isSearchingFarcasters: false,
  onSetListRef: () => {},
  onSetCardRef: () => {},
  onSelectWallet: () => {},
  onShowSeed: () => {},
  scrollToEnd: () => {},
  onChangeFarcasterSearch: () => {},
  onSelectFarcaster: () => {},
});

export const useWallets = () => {
  const context = useContext(WalletsContext);

  return context;
};

export const WalletsProvider = (props: {
  children: React.ReactChild[] | React.ReactChild;
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const {enabled, toggleIsActive} = useKeychain();

  const wallet = useSelector(selectedWalletSelector);
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const allTokens = useSelector(tokensSelector);
  const selectedToken = useSelector(tokenSelector);

  const [farcasterSearch, setFarcasterSearch] = useState('');
  const [farcasters, setFarcasters] = useState<User[]>([]);
  const [searchedFarcasters, setSearchedFarcasters] = useState<User[]>([]);
  const [isSearchingFarcasters, setIsSearchingFarcasters] = useState(false);
  const [selectedFacarster, setSelectedFarcaster] = useState<User | null>();
  const [openVerify, setOpenVerify] = useState(false);
  const [listRef, setListRef] = useState<any>();
  const [cardRef, setCardRef] = useState<any>();
  const [showSeed, setShowSeed] = useState<string | null>(null);
  const [isChangedSelectedWallet, setIsChangedSelectedWallet] = useState(false);
  const [cardType, setCardType] = useState<
    'wallet' | 'send' | 'receive' | 'farcaster'
  >('wallet');

  const debouncedFarcasterSearch = useDebounce(farcasterSearch, 500);
  const amountUSD = useMemo(
    () =>
      _.isNaN(sendTokenInfo.amountUSD) ? 0 : Number(sendTokenInfo.amountUSD),
    [sendTokenInfo],
  );
  const buttonContainerHeight = useRef(new Animated.Value(50)).current;

  const onSetListRef = (ref: any) => {
    setListRef(ref);
  };

  const onSetCardRef = useCallback((ref: any) => {
    setCardRef(ref);
  }, []);

  const scrollToEnd = async (timeout: number = 0) => {
    if (!listRef?.scrollToEnd) {
      return;
    }

    await sleep(timeout);
    listRef.scrollToEnd({animating: true});
  };

  const onChangeCardType = (type: WalletCardType) => {
    setCardType(type);
    cardRef?.flip();
    setShowSeed(null);
    scrollToEnd(300);
  };

  const onOpenSelectScreen = () => {
    navigation.navigate('SelectToken');
  };

  const onSelectFarcaster = (value: User | null) => {
    setSelectedFarcaster(value);
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

  const onShowSeed = (walletId: string | null) => {
    setShowSeed(walletId);
    if (
      (showSeed === wallet?.id && walletId === null) ||
      walletId === wallet?.id
    ) {
      setIsChangedSelectedWallet(true);
    } else {
      setIsChangedSelectedWallet(false);
    }
  };

  const sendToken = () => {
    toggleIsActive(true);
    setOpenVerify(false);
    dispatch(transferTokenRequest());
  };

  const onCancelBack = () => {
    if (!cardRef) {
      return;
    }

    scrollToEnd(400);
    dispatch(
      updateSendTokenInfo({
        token: sendTokenInfo.token,
        transaction: undefined,
        toAccount: undefined,
        isSentSuccessFully: false,
        amount: undefined,
        amountUSD: undefined,
        isSendMax: false,
      }),
    );

    cardRef?.flip();
    setCardType('wallet');
  };

  const onSelectWallet = (w: Wallet) => {
    if (cardType !== 'wallet') {
      onCancelBack();
    }

    ReactNativeHapticFeedback.trigger('impactHeavy');
    dispatch(selectWallet(w));
    scrollToEnd(200);
  };

  const onCancelSendToken = () => {
    toggleIsActive(true);
    setOpenVerify(false);
  };

  const onChangeFarcasterSearch = (value: string) => {
    setFarcasterSearch(value);
  };

  const onSendFarcasterRequest = async () => {
    if (!amountUSD || !selectedFacarster || !wallet?.farcaster?.user) {
      return;
    }

    try {
      await wallet.farcaster.publishCast(
        ` @${wallet.farcaster.user.username} just requested ${formatCurrency(
          amountUSD,
          'USD',
        )} from @${selectedFacarster.username} #paycaster by #backpack`,
      );

      Toast.show({
        type: 'success',
        text1: `Sent request to @${selectedFacarster.username} successfully.`,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message,
      });
    }
  };

  const onSearchFarcasters = useCallback(async () => {
    if (!debouncedFarcasterSearch) {
      setSearchedFarcasters([]);
      return;
    }

    let followers = farcasters;
    setIsSearchingFarcasters(true);

    try {
      if (!farcasters.length && wallet?.farcaster) {
        followers = await wallet.farcaster.getFollowers();

        setFarcasters(followers);
      }

      const filtered = followers
        .filter(item =>
          item.username
            ?.toLowerCase()
            .includes(debouncedFarcasterSearch.toLowerCase()),
        )
        .slice(0, 5);

      setSearchedFarcasters(filtered);
    } catch {
    } finally {
      setIsSearchingFarcasters(false);
    }
  }, [farcasters, debouncedFarcasterSearch]);

  useEffect(() => {
    onSearchFarcasters();
  }, [onSearchFarcasters]);

  useEffect(() => {
    let height = 100;

    if (
      cardType === 'receive' ||
      (cardType === 'wallet' && !wallet?.farcaster?.user)
    ) {
      height = 50;
    }

    Animated.timing(buttonContainerHeight, {
      toValue: height,
      duration: height === 50 ? 300 : 0,
      useNativeDriver: false,
    }).start();
  }, [cardType, wallet]);

  useEffect(() => {
    if (cardType === 'wallet') {
      dispatch(
        updateSendTokenInfo({
          token: sendTokenInfo.token,
          transaction: undefined,
          toAccount: undefined,
          amount: undefined,
          amountUSD: undefined,
          isSentSuccessFully: false,
          isSendMax: false,
        }),
      );
    }
  }, [dispatch, cardType]);

  useEffect(() => {
    setFarcasterSearch('');
    setFarcasters([]);
  }, [wallet]);

  useEffect(() => {
    if (cardType !== 'farcaster') {
      setFarcasterSearch('');
      setSelectedFarcaster(undefined);
    }
  }, [cardType]);

  useEffect(() => {
    const tokens = (wallet?.id && allTokens[wallet?.id]) || [];

    const newPriceToken = tokens.find(item => item.id === selectedToken?.id);

    if (newPriceToken && newPriceToken.price !== selectedToken?.price) {
      dispatch(setToken(newPriceToken));
    }
  }, [wallet, allTokens, selectedToken]);

  useEffect(() => {
    setFarcasterSearch('');
    setSelectedFarcaster(undefined);
  }, [selectedToken]);

  return (
    <WalletsContext.Provider
      value={{
        onSetListRef,
        onSetCardRef,
        onShowSeed,
        onSelectWallet,
        scrollToEnd,
        onChangeFarcasterSearch,
        onSelectFarcaster,
        listRef,
        isChangedSelectedWallet,
        showSeed,
        cardType,
        farcasterSearch,
        farcasters: searchedFarcasters,
        isSearchingFarcasters,
        selectedFacarster,
      }}>
      {props.children}
      <Animated.View
        style={{
          height: buttonContainerHeight,
        }}>
        {cardType === 'wallet' && (
          <>
            {wallet?.farcaster?.user && (
              <View style={[t.flexRow, t.mT2]}>
                <View style={[t.flex1]}>
                  <Button
                    text="Paycaster"
                    onPress={() => onChangeCardType('farcaster')}
                  />
                </View>
              </View>
            )}
            {/* <View style={[t.flexRow, t.mT2]}>
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
              </View> */}
            <View style={[t.flexRow, t.mT2]}>
              <View style={[t.flex1]}>
                <Button
                  text="Receive"
                  onPress={() => onChangeCardType('receive')}
                  disabled={!wallet}
                />
              </View>
              <View style={[t.flex1, t.mL2]}>
                <Button
                  text="Send"
                  onPress={() => onChangeCardType('send')}
                  disabled={!wallet}
                />
              </View>
            </View>
          </>
        )}
        {cardType === 'receive' && (
          <View style={[t.flexRow, t.mT2]}>
            <View style={[t.flex1]}>
              <Button
                text="Cancel"
                onPress={() => onChangeCardType('wallet')}
                disabled={!wallet}
              />
            </View>
            <View style={[t.flex1, t.mL2]}>
              <Button
                text="Change Token"
                onPress={onOpenSelectScreen}
                disabled={!wallet}
              />
            </View>
          </View>
        )}
        {cardType === 'send' && (
          <>
            <View style={[t.mT2]}>
              <Button
                text="Change Token"
                onPress={onOpenSelectScreen}
                disabled={!wallet || sendTokenInfo.isLoading}
              />
            </View>
            <View style={[t.flexRow, t.mT2]}>
              <View style={[t.flex1]}>
                <Button
                  text="Cancel"
                  onPress={() => onChangeCardType('wallet')}
                  disabled={!wallet || sendTokenInfo.isLoading}
                />
              </View>
              <View style={[t.flex1, t.mL2]}>
                <Button
                  text="Submit"
                  onPress={onSendToken}
                  disabled={
                    !sendTokenInfo.transaction || sendTokenInfo.isLoading
                  }
                />
              </View>
            </View>
          </>
        )}
        {cardType === 'farcaster' && (
          <>
            <View style={[t.flexRow, t.mT2]}>
              <View style={[t.flex1]}>
                <Button
                  text="Cancel"
                  onPress={() => onChangeCardType('wallet')}
                  disabled={!wallet || sendTokenInfo.isLoading}
                />
              </View>
              <View style={[t.flex1, t.mL2]}>
                <Button
                  text="Change Token"
                  onPress={onOpenSelectScreen}
                  disabled={!wallet || sendTokenInfo.isLoading}
                />
              </View>
            </View>
            <View style={[t.flexRow, t.mT2]}>
              <View style={[t.flex1]}>
                <Button
                  text="Request"
                  onPress={() => onSendFarcasterRequest()}
                  disabled={
                    !wallet ||
                    sendTokenInfo.isLoading ||
                    !amountUSD ||
                    !selectedFacarster
                  }
                />
              </View>
              <View style={[t.flex1, t.mL2]}>
                <Button
                  text="Pay"
                  onPress={onSendToken}
                  disabled={
                    !sendTokenInfo.transaction || sendTokenInfo.isLoading
                  }
                />
              </View>
            </View>
          </>
        )}
      </Animated.View>
      <VerifyPasscodeModal
        open={openVerify}
        showVerify={true}
        onCancel={() => onCancelSendToken()}
        onVerified={() => sendToken()}
      />
    </WalletsContext.Provider>
  );
};
