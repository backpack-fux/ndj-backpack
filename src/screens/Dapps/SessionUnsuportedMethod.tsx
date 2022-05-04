import {BaseScreen, Paragraph} from '@app/components';
import {useWalletConnect} from '@app/context/walletconnect';
import {MainStackParamList} from '@app/models';
import {walletsSelector} from '@app/store/wallets/walletsSelector';
import {rejectEIP155Request} from '@app/utils/EIP155RequestHandlerUtil';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {useSelector} from 'react-redux';
import {Card, DappInfo, RequestDetail} from './components';
import {colors} from '@app/assets/colors.config';

export const SessionUnsuportedMethod = () => {
  const {client} = useWalletConnect();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MainStackParamList, 'SessionSignModal'>>();
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

  useEffect(() => {
    if (!session) {
      onReject();
    }
  }, [wallets, session]);

  if (!session || !event) {
    return <></>;
  }

  const {method} = event.request;

  return (
    <BaseScreen noBottom>
      <View style={[t.flexRow, t.mB4]}>
        <TouchableOpacity
          style={[t.absolute, t.left0, t.z10, t.p2]}
          onPress={onReject}>
          <Paragraph text="Cancel" type="bold" />
        </TouchableOpacity>
        <View style={[t.flex1, t.mT2]}>
          <Paragraph
            text="Unsupported Method"
            size={18}
            type="bold"
            align="center"
          />
        </View>
      </View>
      <ScrollView>
        <DappInfo metadata={session?.peer.metadata} />
        <RequestDetail
          chainId={event.chainId}
          protocol={session.relay.protocol}
        />
        <Card>
          <Paragraph text="Method:" color={colors.textGray} />
          <Paragraph text={method} />
        </Card>
      </ScrollView>
    </BaseScreen>
  );
};
