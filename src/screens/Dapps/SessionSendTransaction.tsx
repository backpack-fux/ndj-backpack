import {BaseScreen, Button, Paragraph} from '@app/components';
import {useWalletConnect} from '@app/context/walletconnect';
import {MainStackParamList} from '@app/models';
import {walletsSelector} from '@app/store/wallets/walletsSelector';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '@app/utils/EIP155RequestHandlerUtil';
import {convertHexToUtf8} from '@app/utils/HelperUtil';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {useSelector} from 'react-redux';
import {Card, DappInfo, RequestDetail} from './components';
import {colors} from '@app/assets/colors.config';
import Web3 from 'web3';

const borderBottomWidth = 0.3;

export const SessionSendTransaction = () => {
  const {client, enabledTransactionTopics} = useWalletConnect();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const route =
    useRoute<RouteProp<MainStackParamList, 'SessionSendTransactionModal'>>();
  const wallets = useSelector(walletsSelector);
  const {event, session} = route.params;

  const onReject = () => {
    if (client && event) {
      const response = rejectEIP155Request(event.request);
      client.respond({
        topic: event.topic,
        response,
      });
    }
    navigation.goBack();
  };

  const onConfirm = async () => {
    if (event) {
      try {
        setIsLoading(true);
        const response = await approveEIP155Request(event, wallets);
        await client?.respond({
          topic: event.topic,
          response,
        });
      } catch (err) {
        console.log(err);
        const response = rejectEIP155Request(event.request);
        client?.respond({
          topic: event.topic,
          response,
        });
      } finally {
        setIsLoading(false);
      }
    }

    navigation.goBack();
  };

  useEffect(() => {
    if (!session) {
      onReject();

      return;
    }

    if (!enabledTransactionTopics[session.topic]) {
      onReject();
    }
  }, [wallets, session, enabledTransactionTopics]);

  if (!session || !event) {
    return <></>;
  }

  const {params} = event.request;
  const transaction = params[0];

  const fee = Web3.utils
    .toBN(Web3.utils.hexToNumber(transaction.gasPrice))
    .mul(Web3.utils.toBN(Web3.utils.hexToNumber(transaction.gasLimit)));
  const feeEther = Web3.utils.fromWei(fee);
  const value = Web3.utils.toBN(Web3.utils.hexToNumber(transaction.value));
  const total = fee.add(value);
  const totalEther = Web3.utils.fromWei(total);
  const data = convertHexToUtf8(transaction.data);

  return (
    <BaseScreen isLoading={isLoading} noBottom>
      <View style={[t.flexRow, t.mB4]}>
        <TouchableOpacity
          style={[t.absolute, t.left0, t.z10, t.p2]}
          onPress={onReject}>
          <Paragraph text="Cancel" type="bold" />
        </TouchableOpacity>
        <View style={[t.flex1, t.mT2]}>
          <Paragraph
            text="Sign / Send Transaction"
            size={18}
            type="bold"
            align="center"
          />
        </View>
      </View>
      <ScrollView>
        <DappInfo metadata={session?.peer.metadata} />
        <RequestDetail
          address={transaction.from}
          chainId={event.chainId}
          protocol={session.relay.protocol}
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
  );
};