import {colors} from '@app/assets/colors.config';
import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {useWalletConnect} from '@app/context/walletconnect';
import {StackParams} from '@app/models';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import BarcodeMask from 'react-native-barcode-mask';
import {RNCamera} from 'react-native-camera';
import Toast from 'react-native-toast-message';
import {t} from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {checkPermission} from '@app/utils';
import {PERMISSIONS} from 'react-native-permissions';

const logo = require('@app/assets/images/logo.png');

export const DappsScreen = () => {
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const {
    isInitializingWc,
    client,
    sessions,
    legacyClients,
    onDisconnect,
    onPairing,
  } = useWalletConnect();
  const [openScan, setOpenScan] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>();
  const {onOpenDeepLink} = useWalletConnect();

  const onBarCodeRead = async (uri: string) => {
    if (!uri.startsWith('wc:')) {
      return Toast.show({
        type: 'error',
        text1: 'WalletConnect: invalid QR code',
      });
    }

    Toast.show({
      type: 'success',
      text1: 'WalletConnect: connecting may take a few seconds',
    });
    setOpenScan(false);
    onPairing(uri);
  };

  const onDisconnectSession = () => {
    if (!selectedTopic) {
      return;
    }

    const legacyClient = legacyClients.find(
      l => l.session.key === selectedTopic,
    );

    if (legacyClient) {
      legacyClient.killSession();
    } else {
      onDisconnect(selectedTopic);
    }

    setSelectedTopic(undefined);
  };

  const onDetails = () => {
    if (!selectedTopic) {
      return;
    }

    const session = sessions.find(s => s.topic === selectedTopic);

    if (session) {
      navigation.navigate('DappDetails', {session});

      return;
    }

    const legacyClient = legacyClients.find(
      l => l.session.key === selectedTopic,
    );

    if (legacyClient) {
      navigation.navigate('DappDetails', {legacyClient});
    }
  };

  const onOpenScan = async () => {
    const res = await checkPermission(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA,
    );

    if (res) {
      setOpenScan(true);
    }
  };

  const onOpenPaste = () => {
    Alert.prompt(
      'WalletConnect',
      'Please input WalletConnect URI',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Connect',
          onPress: (value: any) => {
            if (value) {
              onOpenDeepLink(value);
            }
          },
        },
      ],
      'plain-text',
      '',
    );
  };

  return (
    <BaseScreen>
      <View style={[t.flex1]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag">
          <Card>
            {isInitializingWc && <ActivityIndicator size={'large'} />}
            {sessions.length || legacyClients.length ? (
              <>
                {sessions.map(session => {
                  const title =
                    session.peer.metadata.name || session.peer.metadata.url;
                  const icon = session.peer.metadata.icons[0];
                  const isSelected = session.topic === selectedTopic;
                  return (
                    <TouchableOpacity
                      key={session.topic}
                      onPress={() => setSelectedTopic(session.topic)}
                      style={[
                        t.flexRow,
                        t.itemsCenter,
                        t.mT1,
                        t.mB1,
                        t.p1,
                        t.pL2,
                        t.pR2,
                        t.roundedLg,
                        isSelected ? {backgroundColor: colors.secondary} : {},
                      ]}>
                      <Image
                        source={icon ? {uri: icon} : logo}
                        style={[t.selfCenter, t.w8, t.h8, t.mR2]}
                      />
                      <View style={[t.flex1]}>
                        <Paragraph text={title} numberOfLines={1} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {legacyClients.map(legacyClient => {
                  const title =
                    legacyClient.session.peerMeta?.name ||
                    legacyClient.session.peerMeta?.url;
                  const icon = legacyClient.session.peerMeta?.icons[0];
                  const isSelected = legacyClient.session.key === selectedTopic;

                  return (
                    <TouchableOpacity
                      key={legacyClient.session.key}
                      onPress={() => setSelectedTopic(legacyClient.session.key)}
                      style={[
                        t.flexRow,
                        t.itemsCenter,
                        t.mT1,
                        t.mB1,
                        t.p1,
                        t.pL2,
                        t.pR2,
                        t.roundedLg,
                        isSelected ? {backgroundColor: colors.secondary} : {},
                      ]}>
                      <Image
                        source={icon ? {uri: icon} : logo}
                        style={[t.selfCenter, t.w8, t.h8, t.mR2]}
                      />
                      <View style={[t.flex1]}>
                        <Paragraph
                          text={`${title} (v1/legacy)`}
                          numberOfLines={2}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : (
              <Paragraph
                text="Active connections will appear here"
                color={colors.textGray}
                align="center"
              />
            )}
          </Card>
        </ScrollView>
      </View>
      <View>
        <View style={[t.flexRow, t.mT2]}>
          <View style={[t.flex1]}>
            <Button
              text="Disconnect"
              onPress={() => selectedTopic && onDisconnectSession()}
              disabled={!selectedTopic || !client}
            />
          </View>
          <View style={[t.flex1, t.mL2]}>
            <Button
              text="Details"
              onPress={onDetails}
              disabled={!selectedTopic || !client}
            />
          </View>
        </View>
        <View style={[t.flexRow, t.mT2]}>
          <View style={[t.flex1]}>
            <Button
              disabled={!client}
              text="Paste"
              onPress={() => onOpenPaste()}
            />
          </View>
          <View style={[t.flex1, t.mL2]}>
            <Button
              disabled={!client}
              text="Scan"
              onPress={() => onOpenScan()}
            />
          </View>
        </View>
      </View>
      <Modal visible={openScan} animationType="slide">
        <View style={t.flex1}>
          <RNCamera
            style={[t.flex1]}
            onBarCodeRead={e => onBarCodeRead(e.data)}
            captureAudio={false}
            barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}>
            <BarcodeMask showAnimatedLine={false} />
            <SafeAreaView>
              <TouchableOpacity
                onPress={() => setOpenScan(false)}
                style={[t.mL4]}>
                <Icon name="close" color={colors.white} size={30} />
              </TouchableOpacity>
            </SafeAreaView>
          </RNCamera>
        </View>
      </Modal>
    </BaseScreen>
  );
};
