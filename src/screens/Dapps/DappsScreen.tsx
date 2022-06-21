import {colors} from '@app/assets/colors.config';
import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {shadow} from '@app/constants';
import {useWalletConnect} from '@app/context/walletconnect';
import {DappStackParamList} from '@app/models';
import {showSnackbar} from '@app/utils';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Image, Modal, SafeAreaView, ScrollView, View} from 'react-native';
import BarcodeMask from 'react-native-barcode-mask';
import {RNCamera} from 'react-native-camera';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {t} from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const DappsScreen = () => {
  const navigation = useNavigation<NavigationProp<DappStackParamList>>();
  const {sessions, onDisconnect, onPairing} = useWalletConnect();
  const [openScan, setOpenScan] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>();

  const onBarCodeRead = async (uri: string) => {
    if (!uri.startsWith('wc:')) {
      return showSnackbar('WalletConnect: invalid QR code');
    }

    showSnackbar('WalletConnect: connecting may take a few seconds');
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

  return (
    <BaseScreen>
      <View style={[t.flex1]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card>
            {sessions.length ? (
              <>
                {sessions.map(session => {
                  const title = session.peer.metadata.name;
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
                        isSelected ? {backgroundColor: colors.button} : {},
                        isSelected ? shadow : {},
                      ]}>
                      <Image
                        source={{uri: icon}}
                        style={[t.selfCenter, t.w8, t.h8, t.mR2]}
                      />
                      <Paragraph text={title} />
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : (
              <Paragraph
                text="Active Connections will appear here"
                color={colors.textGray}
                align="center"
              />
            )}
          </Card>
        </ScrollView>
      </View>
      <View>
        <Button text="New Connection" onPress={() => setOpenScan(true)} />
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
