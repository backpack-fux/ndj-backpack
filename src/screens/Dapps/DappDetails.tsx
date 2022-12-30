import {BaseScreen, Button, Card, Paragraph, Toggle} from '@app/components';
import {useWalletConnect} from '@app/context/walletconnect';
import {DappStackParamList} from '@app/models';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {ScrollView, View} from 'react-native';
import {t} from 'react-native-tailwindcss';

export const DappDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<DappStackParamList, 'DappDetails'>>();
  const {onDisconnect, enabledTransactionTopics, onToggleTransactionEnable} =
    useWalletConnect();

  const {session, legacyClient} = route.params;

  const disconnect = async () => {
    if (session) {
      onDisconnect(session.topic);
    }

    if (legacyClient) {
      try {
        await legacyClient.killSession();
      } catch (err) {
        console.log(err);
      }
    }

    navigation.goBack();
  };

  const metaData = session?.peer.metadata || legacyClient?.peerMeta;

  return (
    <BaseScreen>
      <View style={[t.flex1]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag">
          <Card>
            <Paragraph
              text={`${metaData?.name}${legacyClient ? '(v1/legacy)' : ''}`}
              align="center"
              size={17}
            />
            <Paragraph
              text={metaData?.url}
              align="center"
              size={14}
              marginTop={20}
              marginBottom={30}
            />
            <Toggle
              label="sign transactions enabled"
              value={
                !!enabledTransactionTopics[
                  (session?.topic || legacyClient?.session.key) as string
                ]
              }
              onChange={value =>
                onToggleTransactionEnable(
                  (session?.topic || legacyClient?.session.key) as string,
                  value,
                )
              }
            />
            <Paragraph
              text="web3 events in NDJ require MFA confirmation here"
              marginTop={20}
            />
            <Paragraph
              text="a notification will be sent to make confirmation snappy"
              marginTop={20}
            />
            <Paragraph
              text="sessions inactive for 15 min will be disconnected to protect your assets"
              marginTop={20}
            />
          </Card>
        </ScrollView>
      </View>
      <View style={[t.flexRow, t.mT2]}>
        <View style={[t.flex1]}>
          <Button text="Disconnect" onPress={disconnect} />
        </View>
      </View>
    </BaseScreen>
  );
};
