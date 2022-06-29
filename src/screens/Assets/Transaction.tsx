import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {BaseScreen, Paragraph} from '@app/components';
import {
  isLoadingTransactionsSelector,
  isTransactionReachedSelector,
  tokenSelector,
  transactionsSelector,
} from '@app/store/coins/coinsSelector';
import {getTransactions} from '@app/store/coins/actions';
import {ActivityIndicator, FlatList, RefreshControl, View} from 'react-native';
import {colors} from '@app/assets/colors.config';
import {BaseCoin, ITransaction} from '@app/models';
import {normalizeNumber} from '@app/utils';
import {t} from 'react-native-tailwindcss';
import moment from 'moment-timezone';

export const TransactionScreen = () => {
  const dispatch = useDispatch();
  const token = useSelector(tokenSelector);
  const transactions = useSelector(transactionsSelector);
  const isReached = useSelector(isTransactionReachedSelector);
  const isLoading = useSelector(isLoadingTransactionsSelector);

  const [limit] = useState(10);
  const [page, setPage] = useState(1);

  const onLoad = useCallback(() => {
    if (!token) {
      return;
    }

    dispatch(
      getTransactions({
        token,
        page,
        limit,
      }),
    );
  }, [token, page, limit]);

  const onLoadMore = () => {
    if (isLoading) {
      return;
    }

    if (isReached) {
      return;
    }

    setPage(page + 1);
  };

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  return (
    <BaseScreen>
      <FlatList
        data={transactions}
        renderItem={({item}) => <Transaction item={item} token={token} />}
        keyExtractor={item => item.hash + item.timeStamp + item.index}
        showsHorizontalScrollIndicator={false}
        ListFooterComponent={() =>
          isLoading ? (
            <ActivityIndicator
              color={colors.white}
              size="large"
              style={[t.mT2]}
            />
          ) : (
            <></>
          )
        }
        showsVerticalScrollIndicator={false}
        onEndReached={onLoadMore}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => setPage(1)}
            tintColor={colors.white}
            titleColor={colors.white}
          />
        }
      />
    </BaseScreen>
  );
};

const Transaction = ({item, token}: {item: ITransaction; token?: BaseCoin}) => {
  const borderColor =
    item.type === 'in'
      ? colors.green
      : item.type === 'out'
      ? colors.secondary
      : colors.blue;
  return (
    <View
      key={item.hash + item.timeStamp + item.index}
      style={[
        shadow,
        t.bgPurple500,
        t.roundedXl,
        t.mT2,
        t.mB2,
        t.pT4,
        t.pB4,
        t.pL8,
        t.pR8,
        item.type === 'in' && t.mR20,
        item.type === 'out' && t.mL20,
        t.border2,
        {borderColor},
      ]}>
      <Paragraph
        text={`${
          item.label ? item.label : item.type === 'in' ? 'Received' : 'Sent'
        }: ${normalizeNumber(item.value)} ${token?.symbol.toUpperCase()}`}
        size={16}
        align={
          item.type === 'in' ? 'left' : item.type === 'out' ? 'right' : 'center'
        }
      />
      <View>
        {item.type === 'in' ? (
          <View style={[t.flexRow, t.mT2]}>
            <Paragraph text="From:" />
            <View style={[t.flex1]}>
              <Paragraph
                text={item.from}
                marginLeft={7}
                ellipsizeMode="middle"
                numberOfLines={1}
              />
            </View>
          </View>
        ) : item.type === 'out' ? (
          <View style={[t.flexRow, t.mT2]}>
            <Paragraph text="To:" align="right" />
            <View style={[t.flex1]}>
              <Paragraph
                text={item.to}
                marginLeft={7}
                align="right"
                ellipsizeMode="middle"
                numberOfLines={1}
              />
            </View>
          </View>
        ) : (
          <>
            {!!item.from && (
              <View style={[t.flexRow, t.mT2]}>
                <Paragraph text="From: " align="center" />
                <View style={[t.flex1]}>
                  <Paragraph
                    align="center"
                    text={item.from}
                    marginLeft={7}
                    ellipsizeMode="middle"
                    numberOfLines={1}
                  />
                </View>
              </View>
            )}
            {!!item.to && (
              <View style={[t.flexRow, t.mT2]}>
                <Paragraph text="To: " align="center" />
                <View style={[t.flex1]}>
                  <Paragraph
                    align="center"
                    text={item.to}
                    marginLeft={7}
                    ellipsizeMode="middle"
                    numberOfLines={1}
                  />
                </View>
              </View>
            )}
          </>
        )}
      </View>
      <Paragraph
        text={moment.unix(Number(item.timeStamp)).format('DD MMM yyyy hh:mm A')}
        size={12}
        marginTop={5}
        color={colors.textGray}
        align={
          item.type === 'in' ? 'left' : item.type === 'out' ? 'right' : 'center'
        }
      />
    </View>
  );
};

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
