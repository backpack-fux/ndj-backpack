import {BaseScreen, Button, Paragraph} from '@app/components';
import {useWalletConnect} from '@app/context/walletconnect';
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

export const SessionSignTypedData = () => {
  const {client} = useWalletConnect();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<StackParams, 'SessionSignModal'>>();
  const wallets = useSelector(walletsSelector);
  const network = useSelector(networkSelector);

  const {event, session} = route.params;

  const onReject = () => {
    if (client && event) {
      const response = rejectEIP155Request(event);
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
        const response = await approveEIP155Request(event, wallets, network);

        if (!client) {
          throw new Error('WalletConnect client is not initialized');
        }

        await client.respond({
          topic: event.topic,
          response,
        });
      } catch (err) {
        const response = rejectEIP155Request(event);
        client?.respond({
          topic: event.topic,
          response,
        });
      }
    }

    navigation.goBack();
  };

  useEffect(() => {
    if (!session) {
      onReject();
    }
  }, [wallets, session]);

  if (!session || !event) {
    return <></>;
  }

  // Get required request data
  const {params} = event;
  const {request, chainId} = params;
  const message = getSignParamsMessage(request.params);
  const address = getSignParamsAddress(request.params);

  return (
    <BaseScreen noBottom showToast title="Sign Typed Data" onBack={onReject}>
      <ScrollView keyboardDismissMode="on-drag">
        <DappInfo metadata={session?.peer.metadata} />
        <RequestDetail
          address={address}
          chainId={chainId}
          protocol={session.relay.protocol}
        />
        <Card>
          <Paragraph text="Data:" color={colors.textGray} />
          <Paragraph text={message} />
        </Card>
      </ScrollView>
      <View style={[t.mB4, t.mT2]}>
        <Button text="Confirm" onPress={onConfirm} />
      </View>
    </BaseScreen>
  );
};
