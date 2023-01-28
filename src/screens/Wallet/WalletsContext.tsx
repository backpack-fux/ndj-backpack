import {Button} from '@app/components';
import {VerifyPasscodeModal} from '@app/components/verifyPasscodeModal';
import {useKeychain} from '@app/context/keychain';
import {StackParams, Wallet} from '@app/models';
import {
  transferTokenRequest,
  updateSendTokenInfo,
} from '@app/store/coins/actions';
import {sendTokenInfoSelector} from '@app/store/coins/coinsSelector';
import {selectWallet} from '@app/store/wallets/actions';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';
import {sleep} from '@app/utils';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Animated, View, Alert} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {useDispatch, useSelector} from 'react-redux';
import {User} from '@standard-crypto/farcaster-js';
import {useDebounce} from '@app/uses';

type WalletCardType = 'wallet' | 'send' | 'receive' | 'farcaster';

interface WalletsConnect {
  farcasters: User[];
  isSearchFarcasters: boolean;
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
  scrollToEnd: (timeout: number) => void;
}

export const WalletsContext = createContext<WalletsConnect>({
  showSeed: '',
  cardType: 'wallet',
  farcasterSearch: '',
  isChangedSelectedWallet: false,
  listRef: null,
  farcasters: [],
  isSearchFarcasters: false,
  onSetListRef: () => {},
  onSetCardRef: () => {},
  onSelectWallet: () => {},
  onShowSeed: () => {},
  scrollToEnd: () => {},
  onChangeFarcasterSearch: () => {},
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

  const [farcasterSearch, setFarcasterSearch] = useState('');
  const [farcasters, setFarcasters] = useState<User[]>([]);
  const [searchedFarcasters, setSearchedFarcasters] = useState<User[]>([]);
  const [openVerify, setOpenVerify] = useState(false);
  const [listRef, setListRef] = useState<any>();
  const [cardRef, setCardRef] = useState<any>();
  const [showSeed, setShowSeed] = useState<string | null>(null);
  const [isChangedSelectedWallet, setIsChangedSelectedWallet] = useState(false);
  const [cardType, setCardType] = useState<
    'wallet' | 'send' | 'receive' | 'farcaster'
  >('wallet');

  const debouncedFarcasterSearch = useDebounce(farcasterSearch, 500);

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

  // const onDelete = () => {
  //   if (!wallet) {
  //     return;
  //   }

  //   Alert.alert(
  //     'Delete Wallet',
  //     'Are you sure you want to delete the selected wallet?',
  //     [
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //       {
  //         text: 'Yes, Delete',
  //         onPress: () => dispatch(deleteWallet(wallet)),
  //       },
  //     ],
  //   );
  // };

  // const onAddWallet = () => {
  //   navigation.navigate('AddWallet');
  // };

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
        amount: undefined,
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
    scrollToEnd();
  };

  const onCancelSendToken = () => {
    toggleIsActive(true);
    setOpenVerify(false);
  };

  const onChangeFarcasterSearch = (value: string) => {
    setFarcasterSearch(value);
  };

  const onSearchFarcasters = useCallback(async () => {
    if (!debouncedFarcasterSearch) {
      return [];
    }

    let followers = farcasters;
    if (!farcasters.length && wallet?.farcaster) {
      followers = await wallet.farcaster.getFollowers();
      setFarcasters(followers);
    }

    setSearchedFarcasters(
      followers.filter(item =>
        item.username
          ?.toLowerCase()
          .includes(debouncedFarcasterSearch.toLowerCase()),
      ),
    );
  }, [farcasters, debouncedFarcasterSearch]);

  useEffect(() => {
    Animated.timing(buttonContainerHeight, {
      toValue: cardType === 'receive' ? 50 : 100,
      duration: cardType === 'receive' ? 300 : 0,
      useNativeDriver: false,
    }).start();
  }, [cardType]);

  useEffect(() => {
    scrollToEnd(400);
  }, [listRef]);

  useEffect(() => {
    setFarcasters([]);
  }, [wallet]);

  return (
    <WalletsContext.Provider
      value={{
        onSetListRef,
        onSetCardRef,
        onShowSeed,
        onSelectWallet,
        scrollToEnd,
        onChangeFarcasterSearch,
        listRef,
        isChangedSelectedWallet,
        showSeed,
        cardType,
        farcasterSearch,
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
            <View style={[t.flexRow, t.mT2]}>
              <View style={[t.flex1]}>
                <Button
                  text="Request"
                  onPress={() => onChangeCardType('wallet')}
                  disabled={!wallet}
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
