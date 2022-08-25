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
} from 'react-native';
import BarcodeMask from 'react-native-barcode-mask';
import {RNCamera} from 'react-native-camera';
import Toast from 'react-native-toast-message';
import {t} from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {checkCameraPermission} from '@app/utils';

const logo = require('@app/assets/images/logo.png');

export const DappsScreen = () => {
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const {sessions, onDisconnect, onPairing} = useWalletConnect();
  const [openScan, setOpenScan] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>();

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

  const onDetails = async () => {
    if (!selectedTopic) {
      return;
    }

    const session = sessions.find(s => s.topic === selectedTopic);

    if (!session) {
      return;
    }

    navigation.navigate('DappDetails', {session});
  };

  const onOpenScan = async () => {
    const res = await checkCameraPermission();

    if (res) {
      setOpenScan(true);
    }
  };

  return (
    <BaseScreen>
      <View style={[t.flex1]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag">
          <Card>
            {sessions.length ? (
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
        <Button text="New Connection" onPress={() => onOpenScan()} />
        <View style={[t.flexRow, t.mT2]}>
          <View style={[t.flex1]}>
            <Button
              text="Disconnect"
              onPress={() => selectedTopic && onDisconnect(selectedTopic)}
              disabled={!selectedTopic}
            />
          </View>
          <View style={[t.flex1, t.mL2]}>
            <Button
              text="Details"
              onPress={onDetails}
              disabled={!selectedTopic}
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
                style={[t.selfEnd, t.mR4]}>
                <Icon name="close" color={colors.white} size={30} />
              </TouchableOpacity>
            </SafeAreaView>
          </RNCamera>
        </View>
      </Modal>
    </BaseScreen>
  );
};
