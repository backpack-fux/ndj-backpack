import {BaseScreen, Button, Paragraph} from '@app/components';
import {useWalletConnect} from '@app/context/walletconnect';
import Toast from 'react-native-toast-message';
import {StackParams} from '@app/models';

import {
  networkSelector,
  walletsSelector,
} from '@app/store/wallets/walletsSelector';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '@app/utils/EIP155RequestHandlerUtil';
import {convertHexToUtf8} from '@app/utils/HelperUtil';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {useSelector} from 'react-redux';
import {Card, DappInfo, RequestDetail} from './components';
import {colors} from '@app/assets/colors.config';
import Web3 from 'web3';

const borderBottomWidth = 0.3;

export const LegacySessionSendTransaction = () => {
  const {enabledTransactionTopics} = useWalletConnect();
  const network = useSelector(networkSelector);
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<StackParams, 'LegacySessionSendTransactionModal'>>();
  const wallets = useSelector(walletsSelector);
  const [isLoading, setIsLoading] = useState(false);
  const chainId = network === 'mainnet' ? 1 : 5;

  const {event, client} = route.params;
  const {id, method, params} = event;

  const onReject = () => {
    if (client && event) {
      const {error} = rejectEIP155Request({
        id,
        topic: '',
        params: {request: {method, params}, chainId: chainId.toString()},
      });
      client.rejectRequest({
        id,
        error,
      });
    }
    navigation.goBack();
  };

  const onConfirm = async () => {
    if (event) {
      try {
        setIsLoading(true);
        const res = await approveEIP155Request(
          {
            id,
            topic: '',
            params: {request: {method, params}, chainId: `eip155:${chainId}`},
          },
          wallets,
          network,
        );

        if (!client) {
          throw new Error('WalletConnect client is not initialized');
        }

        await client.approveRequest(res);
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: err.message,
        });

        const {error} = rejectEIP155Request({
          id,
          topic: '',
          params: {request: {method, params}, chainId: `eip155:${chainId}`},
        });
        client?.rejectRequest({
          id,
          error,
        });
      } finally {
        setIsLoading(true);
      }
    }

    navigation.goBack();
  };

  useEffect(() => {
    if (!client?.session) {
      onReject();

      return;
    }

    // if (!enabledTransactionTopics[client?.session.key]) {
    //   onReject();
    // }
  }, [wallets, client, enabledTransactionTopics]);

  if (!client || !event) {
    return <></>;
  }

  // Get required request data

  const transaction = params[0];
  const fee = Web3.utils
    .toBN(transaction.gasPrice)
    .mul(Web3.utils.toBN(transaction.gasLimit || transaction.gas));
  const feeEther = Web3.utils.fromWei(fee);
  const value = Web3.utils.toBN(transaction.value);
  const total = fee.add(value);
  const totalEther = Web3.utils.fromWei(total);
  const valueEther = Web3.utils.fromWei(value);
  const data = convertHexToUtf8(transaction.data);

  return (
    <>
      <BaseScreen
        isLoading={isLoading}
        noBottom
        showToast
        title="Sign / Send Transaction"
        onBack={() => onReject()}>
        <ScrollView keyboardDismissMode="on-drag">
          <DappInfo metadata={client.session.peerMeta} />
          <RequestDetail
            address={transaction.from}
            chainId={chainId.toString()}
            protocol={client.protocol}
          />
          <Card>
            <View
              style={[
                t.flexRow,
                t.pB2,
                t.pT2,
                t.borderGray200,
                {borderBottomWidth},
              ]}>
              <View style={[t.w16]}>
                <Paragraph text="To:" marginRight={10} />
              </View>
              <View style={[t.flex1]}>
                <Paragraph
                  align="right"
                  numberOfLines={1}
                  text={transaction.to}
                />
              </View>
            </View>
            <View
              style={[
                t.flexRow,
                t.pB2,
                t.pT2,
                t.borderGray200,
                {borderBottomWidth},
              ]}>
              <View style={[t.w16]}>
                <Paragraph text="Nonce:" marginRight={10} />
              </View>
              <View style={[t.flex1]}>
                <Paragraph
                  align="right"
                  numberOfLines={1}
                  text={transaction.nonce}
                />
              </View>
            </View>
            <View
              style={[
                t.flexRow,
                t.pB2,
                t.pT2,
                t.borderGray200,
                {borderBottomWidth},
              ]}>
              <View style={[t.flex1]}>
                <Paragraph text="Value:" marginRight={10} />
              </View>
              <Paragraph align="right" text={valueEther} />
            </View>
            <View
              style={[
                t.flexRow,
                t.pB2,
                t.pT2,
                t.borderGray200,
                {borderBottomWidth},
              ]}>
              <View style={[t.flex1]}>
                <Paragraph text="Network Fee:" marginRight={10} />
              </View>
              <Paragraph align="right" text={feeEther} />
            </View>
            <View style={[t.flexRow, t.pT2]}>
              <View style={[t.flex1]}>
                <Paragraph text="Max Total:" marginRight={10} />
              </View>
              <Paragraph align="right" text={totalEther} />
            </View>
          </Card>
          {!!data && (
            <Card>
              <Paragraph text="Data:" color={colors.textGray} />
              <Paragraph text={data} />
            </Card>
          )}
        </ScrollView>
        <View style={[t.mB4, t.mT2]}>
          <Button text="Confirm" onPress={onConfirm} disabled={isLoading} />
        </View>
      </BaseScreen>
    </>
  );
};
