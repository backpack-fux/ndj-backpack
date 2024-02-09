import { colors } from '@app/assets/colors.config';
import {
  accountCoinsSelector,
  isLoadingTokensSelector,
  tokenSelector,
} from '@app/store/coins/coinsSelector';
import { refreshWallets } from '@app/store/wallets/actions';
import {
  selectedWalletSelector,
  walletsSelector,
} from '@app/store/wallets/walletsSelector';
import { useIsFocused } from '@react-navigation/native';
import * as _ from 'lodash';
import React, { useEffect } from 'react';
import { RefreshControl } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';

import { menuHeight } from '@app/constants/dimension';
import { setToken } from '@app/store/coins/actions';
import { sleep } from '@app/utils';
import { WalletItem } from './WalletItem';
import { useWallets } from './WalletsContext';

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

    if (!listRef) {
      await sleep(100);
      ref && ref.scrollToEnd({animated: false});
    }
  };

  return (
    <KeyboardAwareFlatList
      data={walletList}
      ref={ref => onRef(ref)}
      listKey="wallet"
      extraScrollHeight={-(menuHeight * 0.5 + 80)}
      enableResetScrollToCoords={false}
      onKeyboardDidHide={() => {
        if (listRef && listRef.scrollToEnd) {
          listRef.scrollToEnd({animated: false});
        }
      }}
      keyExtractor={item => `${item.id}`}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      removeClippedSubviews={false}
      renderItem={({item}) => <WalletItem wallet={item} />}
      onContentSizeChange={() => {
        if (listRef && listRef.scrollToEnd) {
          listRef?.scrollToEnd && listRef.scrollToEnd({animated: false});
        }
      }}
      onLayout={() => {
        if (listRef && listRef.scrollToEnd) {
          listRef.scrollToEnd({animated: false});
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
  );
};
