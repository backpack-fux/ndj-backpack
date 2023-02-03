import {colors} from '@app/assets/colors.config';
import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {useKeychain} from '@app/context/keychain';
import {deleteWallet, switchNetwork} from '@app/store/wallets/actions';
import {
  networkSelector,
  selectedWalletSelector,
} from '@app/store/wallets/walletsSelector';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Alert, TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {StackParams} from '@app/models';

import BookIcon from '@app/assets/icons/book.svg';
import {
  isLoadingTokensSelector,
  sendTokenInfoSelector,
} from '@app/store/coins/coinsSelector';

export const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const dispatch = useDispatch();
  const isLoading = useSelector(isLoadingTokensSelector);
  const sendTokenInfo = useSelector(sendTokenInfoSelector);
  const wallet = useSelector(selectedWalletSelector);
  const network = useSelector(networkSelector);
  const [selectedSetting, setSelectedSetting] = useState<string>('network');
  const {enabled, toggleKeychain, setNewPasscord} = useKeychain();

  const onChangeNetwork = (payload: 'mainnet' | 'testnet') => {
    dispatch(switchNetwork(payload));
  };

  const onDelete = () => {
    if (!wallet) {
      return;
    }

    Alert.alert(
      'Delete Wallet',
      'Are you sure you want to delete the selected wallet?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Delete',
          onPress: () => dispatch(deleteWallet(wallet)),
        },
      ],
    );
  };

  const onAddWallet = () => {
    navigation.navigate('AddWallet');
  };

  return (
    <BaseScreen>
      <View style={[t.flex1]}>
        <Card full>
          <TouchableOpacity
            onPress={() => setSelectedSetting('network')}
            style={[
              t.flexRow,
              t.itemsCenter,
              t.mT1,
              t.mT1,
              t.p1,
              t.pL2,
              t.pR2,
              t.roundedLg,
              selectedSetting === 'network'
                ? {backgroundColor: colors.secondary}
                : {},
            ]}>
            <Icon name="sync" size={30} color={colors.white} />
            <Paragraph marginLeft={10} text="Switch Networks" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedSetting('fingerprint')}
            style={[
              t.flexRow,
              t.itemsCenter,
              t.mT1,
              t.mT1,
              t.p1,
              t.pL2,
              t.pR2,
              t.roundedLg,
              selectedSetting === 'fingerprint'
                ? {backgroundColor: colors.secondary}
                : {},
            ]}>
            <Icon name="fingerprint" size={30} color={colors.white} />
            <Paragraph marginLeft={10} text="PIN & Biometrics" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('FieldGuide', {allowGoBack: true})
            }
            style={[
              t.flexRow,
              t.itemsCenter,
              t.mT1,
              t.mT1,
              t.p1,
              t.pL2,
              t.pR2,
              t.roundedLg,
            ]}>
            <BookIcon />
            <Paragraph marginLeft={12} text="Field Guide" />
          </TouchableOpacity>
        </Card>
      </View>
      <View style={[t.mT10]}>
        <View style={[t.flexRow, t.mB2]}>
          <View style={[t.flex1]}>
            <Button text="Add Wallet" onPress={onAddWallet} />
          </View>
          <View style={[t.flex1, t.mL2]}>
            <Button
              text="Delete Wallet"
              onPress={onDelete}
              disabled={!wallet}
            />
          </View>
        </View>
        {selectedSetting === 'network' && (
          <View style={[t.flexRow]}>
            <View style={[t.flex1]}>
              <Button
                text="Test Money"
                onPress={() => onChangeNetwork('testnet')}
                disabled={
                  (network === 'testnet' && isLoading) ||
                  sendTokenInfo.isLoading
                }
                loading={
                  network === 'testnet' &&
                  (isLoading || sendTokenInfo.isLoading)
                }
                color={network === 'testnet' ? colors.secondary : colors.gray}
              />
            </View>
            <View style={[t.flex1, t.mL2]}>
              <Button
                text="Real Money"
                disabled={
                  network === 'mainnet' || isLoading || sendTokenInfo.isLoading
                }
                loading={
                  network === 'mainnet' &&
                  (isLoading || sendTokenInfo.isLoading)
                }
                onPress={() => onChangeNetwork('mainnet')}
                color={network === 'mainnet' ? colors.secondary : colors.gray}
              />
            </View>
          </View>
        )}
        {selectedSetting === 'fingerprint' && (
          <View style={[t.flexRow]}>
            <View style={[t.flex1]}>
              <Button
                onPress={() => toggleKeychain()}
                text={enabled ? 'Turn off' : 'Turn on'}
                color={enabled ? colors.secondary : colors.gray}
              />
            </View>
            <View style={[t.flex1, t.mL2]}>
              <Button
                onPress={() => setNewPasscord()}
                text="Set New PIN"
                disabled={!enabled}
              />
            </View>
          </View>
        )}
      </View>
    </BaseScreen>
  );
};
