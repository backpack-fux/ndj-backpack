import React, {useEffect, useRef} from 'react';
import {FlatList, KeyboardAvoidingView, RefreshControl} from 'react-native';
import * as _ from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectedWalletSelector,
  walletsSelector,
} from '@app/store/wallets/walletsSelector';
import {colors} from '@app/assets/colors.config';
import {useIsFocused} from '@react-navigation/native';
import {
  accountCoinsSelector,
  isLoadingTokensSelector,
  tokenSelector,
} from '@app/store/coins/coinsSelector';
import {refreshWallets} from '@app/store/wallets/actions';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';

import {setToken} from '@app/store/coins/actions';
import {WalletItem} from './WalletItem';
import {useWallets} from './WalletsContext';
import {sleep} from '@zilliqa-js/account/dist/util';
import {menuHeight} from '@app/constants/dimension';

export const WalletList = () => {
  const dispatch = useDispatch();
  const wallets = useSelector(walletsSelector);
  const selectedWallet = useSelector(selectedWalletSelector);
  const isLoading = useSelector(isLoadingTokensSelector);
  const tokens = useSelector(accountCoinsSelector);
  const selectedCoin = useSelector(tokenSelector);
  const {listRef, onSetListRef, scrollToEnd} = useWallets();
  const focused = useIsFocused();

  const walletList = _.cloneDeep(wallets).sort(a =>
    a.id === selectedWallet?.id ? 1 : -1,
  );

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

  const onRef = async (ref: any) => {
    onSetListRef(ref);
    await sleep(100);
    ref && ref.scrollToEnd({animated: false});
  };

  return (
    <KeyboardAwareFlatList
      data={walletList}
      ref={ref => onRef(ref)}
      listKey="wallet"
      extraScrollHeight={-(menuHeight * 0.5 + 80)}
      enableResetScrollToCoords={false}
      onKeyboardDidHide={() => listRef.scrollToEnd({animated: false})}
      keyExtractor={item => `${item.id}`}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      removeClippedSubviews={false}
      renderItem={({item}) => <WalletItem wallet={item} />}
      onContentSizeChange={() => listRef.scrollToEnd({animated: false})}
      onLayout={() => listRef.scrollToEnd({animated: false})}
      refreshControl={
        <RefreshControl
          refreshing={isLoading && focused}
          onRefresh={() => !isLoading && dispatch(refreshWallets())}
          tintColor={colors.white}
          titleColor={colors.white}
        />
      }
    />
  );
};
