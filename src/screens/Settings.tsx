import {colors} from '@app/assets/colors.config';
import {BaseScreen, Card, Paragraph} from '@app/components';
import {shadow} from '@app/constants';
import {switchNetwork} from '@app/store/wallets/actions';
import {networkSelector} from '@app/store/wallets/walletsSelector';
import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';

export const SettingsScreen = () => {
  const dispatch = useDispatch();
  const network = useSelector(networkSelector);
  const [selectedSetting, setSelectedSetting] = useState<string>('network');

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
                ? {backgroundColor: colors.button}
                : {},
              selectedSetting === 'network' ? shadow : {},
            ]}>
            <Icon name="sync" size={30} color={colors.white} />
            <Paragraph marginLeft={10} text="Switch Networks" />
          </TouchableOpacity>
        </Card>
      </View>
      <View style={[t.mT10]}>
        {selectedSetting === 'network' && (
          <View style={[t.flexRow]}>
            <TouchableOpacity
              onPress={() => onChangeNetwork('testnet')}
              style={[
                {backgroundColor: colors.button},
                network === 'testnet' ? shadow : {},
                t.flex1,
                t.h10,
                t.alignCenter,
                t.justifyCenter,
                t.roundedLg,
              ]}>
              <Paragraph
                text="Testnets"
                align="center"
                color={colors.white}
                size={16}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onChangeNetwork('mainnet')}
              style={[
                {backgroundColor: colors.button},
                t.mL2,
                network === 'mainnet' ? shadow : {},
                t.flex1,
                t.h10,
                t.alignCenter,
                t.justifyCenter,
                t.roundedLg,
              ]}>
              <Paragraph
                text="Mainnets"
                align="center"
                color={colors.white}
                size={16}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BaseScreen>
  );
};
