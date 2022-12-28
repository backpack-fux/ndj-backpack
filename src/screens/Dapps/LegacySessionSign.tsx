import {BaseScreen, Button, Paragraph} from '@app/components';
import {StackParams} from '@app/models';
import {
  networkSelector,
  walletsSelector,
} from '@app/store/wallets/walletsSelector';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '@app/utils/EIP155RequestHandlerUtil';
import {
  getSignParamsAddress,
  getSignParamsMessage,
} from '@app/utils/HelperUtil';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {ScrollView, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {useSelector} from 'react-redux';
import {Card, DappInfo, RequestDetail} from './components';
import {colors} from '@app/assets/colors.config';

export const LegacySessionSign = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<StackParams, 'LegacySessionSignModal'>>();
  const wallets = useSelector(walletsSelector);
  const network = useSelector(networkSelector);

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

        console.log(res);

        const {result} = res;
        console.log(result);
        await client.approveRequest(res);
      } catch (err) {
        console.log('------------');
        console.log(err);
        const {error} = rejectEIP155Request({
          id,
          topic: '',
          params: {request: {method, params}, chainId: `eip155:${chainId}`},
        });
        client?.rejectRequest({
          id,
          error,
        });
      }
    }

    navigation.goBack();
  };

  useEffect(() => {
    if (!client.session) {
      onReject();
    }
  }, [wallets, client]);

  // Get required request data
  const message = getSignParamsMessage(params);
  const address = getSignParamsAddress(params);

  return (
    <BaseScreen noBottom showToast title="Sign Message" onBack={onReject}>
      <ScrollView keyboardDismissMode="on-drag">
        <DappInfo metadata={client.session?.peerMeta} />
        <RequestDetail
          address={address}
          chainId={'1'}
          protocol={client.protocol}
        />
        <Card>
          <Paragraph text="Message:" color={colors.textGray} />
          <Paragraph text={message} />
        </Card>
      </ScrollView>
      <View style={[t.mB4, t.mT2]}>
        <Button text="Confirm" onPress={onConfirm} />
      </View>
    </BaseScreen>
  );
};
