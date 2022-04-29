import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {AssetStackParamList} from '@app/models';
import {selectedWalletSelector} from '@app/store/wallets/walletsSelector';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {useSelector} from 'react-redux';
import {QRCode} from 'react-native-custom-qr-codes';
import {Image, ScrollView, TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {colors} from '@app/assets/colors.config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-community/clipboard';
import {showSnackbar} from '@app/utils';

const icon = require('@app/assets/images/icon.png');

export const SendScreen = () => {
  const navigation = useNavigation();
  const selectedWallet = useSelector(selectedWalletSelector);
  const route = useRoute<RouteProp<AssetStackParamList, 'Receive'>>();
  const {coin} = route.params;
  const wallet = selectedWallet?.wallets.find(w => w.network === coin?.network);

  const onCopy = () => {
    if (!wallet) {
      return;
    }

    Clipboard.setString(wallet.address);
    showSnackbar('Copied Address!');
  };

  return (
    <BaseScreen>
      <View style={[t.flex1]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card padding={10}>
            <Paragraph text="Send" align="center" marginBottom={10} />
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="Asset" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={`${coin?.name.toUpperCase()} (${coin?.symbol.toUpperCase()})`}
                  align="right"
                />
              </View>
            </View>
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="From" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={wallet?.address}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  align="right"
                />
              </View>
            </View>
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="To" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={'-'}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  align="right"
                />
              </View>
            </View>
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="Send Amount" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={'-'}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  align="right"
                />
              </View>
            </View>
          </Card>
          <Card padding={10}>
            <Paragraph text="Receiver" align="center" marginBottom={10} />
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="Gets" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={'-'}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  align="right"
                />
              </View>
            </View>
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="Network Fee" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={'-'}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  align="right"
                />
              </View>
            </View>
          </Card>
          <Card padding={10}>
            <Paragraph text="Total" align="center" marginBottom={10} />
            <View style={[t.flexRow, t.p2, t.itemsCenter]}>
              <Image style={[t.w6, t.h6]} source={icon} />
              <Paragraph text="Max Total" marginLeft={10} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={'-'}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  align="right"
                />
              </View>
            </View>
          </Card>
        </ScrollView>
      </View>
      <View>
        <Button text="Confirm" onPress={() => navigation.goBack()} />
      </View>
    </BaseScreen>
  );
};
