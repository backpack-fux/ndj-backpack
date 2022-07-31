import {colors} from '@app/assets/colors.config';
import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {useKeychain} from '@app/context/keychain';
import {switchNetwork} from '@app/store/wallets/actions';
import {networkSelector} from '@app/store/wallets/walletsSelector';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';

import BookIcon from '@app/assets/icons/book.svg';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const network = useSelector(networkSelector);
  const [selectedSetting, setSelectedSetting] = useState<string>('network');
  const {enabled, toggleKeychain, setNewPasscord} = useKeychain();

  const onChangeNetwork = (payload: 'mainnet' | 'testnet') => {
    dispatch(switchNetwork(payload));
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
        {selectedSetting === 'network' && (
          <View style={[t.flexRow]}>
            <View style={[t.flex1]}>
              <Button
                text="Fake Money"
                onPress={() => onChangeNetwork('testnet')}
                color={network === 'testnet' ? colors.secondary : colors.gray}
              />
            </View>
            <View style={[t.flex1, t.mL2]}>
              <Button
                text="Real Money"
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
