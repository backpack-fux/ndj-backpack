import React, {useEffect} from 'react';
import {FlatList, RefreshControl} from 'react-native';
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

import {setToken} from '@app/store/coins/actions';
import {WalletItem} from './WalletItem';
import {useWallets} from './WalletsContext';

export const WalletList = () => {
  const dispatch = useDispatch();
  const wallets = useSelector(walletsSelector);
  const selectedWallet = useSelector(selectedWalletSelector);
  const isLoading = useSelector(isLoadingTokensSelector);
  const tokens = useSelector(accountCoinsSelector);
  const selectedCoin = useSelector(tokenSelector);
  const {isChangedSelectedWallet, listRef, onSetListRef, scrollToEnd} =
    useWallets();
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

  return (
    <FlatList
      data={walletList}
      ref={ref => onSetListRef(ref)}
      listKey="wallet"
      keyExtractor={item => `${item.id}`}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      removeClippedSubviews={false}
      renderItem={({item}) => <WalletItem wallet={item} />}
      onContentSizeChange={() => {
        if (isChangedSelectedWallet) {
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
