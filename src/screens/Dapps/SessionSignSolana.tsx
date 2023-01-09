import {BaseScreen, Button, Paragraph} from '@app/components';
import {useWalletConnect} from '@app/context/walletconnect';
import {StackParams} from '@app/models';
import {walletsSelector} from '@app/store/wallets/walletsSelector';
import {getAddressByParams} from '@app/utils/HelperUtil';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {ScrollView, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {useSelector} from 'react-redux';
import {Card, DappInfo, RequestDetail} from './components';
import {colors} from '@app/assets/colors.config';
import {
  approveSolanaRequest,
  rejectSolanaRequest,
} from '@app/utils/SolanaRequestHandlerUtil';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

export const SessionSignSolana = () => {
  const {client} = useWalletConnect();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<StackParams, 'SessionSignModal'>>();
  const wallets = useSelector(walletsSelector);

  const {event, session} = route.params;

  const onReject = () => {
    if (client && event) {
      const response = rejectSolanaRequest(event);
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
        const response = await approveSolanaRequest(event, wallets);

        if (!client) {
          throw new Error('WalletConnect client is not initialized');
        }

        await client.respond({
          topic: event.topic,
          response,
        });
        navigation.goBack();
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: err.message,
        });
      }
    }
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
  const {chainId} = params;
  const address = getAddressByParams(wallets, params);

  return (
    <BaseScreen noBottom showToast title="Sign Message" onBack={onReject}>
      <ScrollView keyboardDismissMode="on-drag">
        <DappInfo metadata={session?.peer.metadata} />
        <RequestDetail
          chainId={chainId}
          address={address || ''}
          protocol={session.relay.protocol}
        />
        <Card>
          <Paragraph text="Message:" color={colors.textGray} />
          <Paragraph text={JSON.stringify(params)} />
        </Card>
      </ScrollView>
      <View style={[t.mB4, t.mT2]}>
        <Button text="Confirm" onPress={onConfirm} />
      </View>
    </BaseScreen>
  );
};
