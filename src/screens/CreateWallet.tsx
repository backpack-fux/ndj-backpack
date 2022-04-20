import React, {useCallback, useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {walletsLoadingSelector} from '@app/store/wallets/walletsSelector';
import {useDispatch, useSelector} from 'react-redux';
import {createWallet} from '@app/store/wallets/actions';
import * as _ from 'lodash';
//@ts-ignore
import bip39 from 'react-native-bip39';
import {colors} from '@app/assets/colors.config';

const logo = require('@app/assets/images/logo.png');
const {width} = Dimensions.get('screen');

export const CreateWalletScreen = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(walletsLoadingSelector);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [newMnemonic, setNewMnemonic] = useState<string>('');

  const onChangeMnemonic = (text: string) => {
    setMnemonic(text);
  };

  const onImport = () => {
    dispatch(createWallet({mnemonic}));
  };

  const onCreate = () => {
    dispatch(createWallet({mnemonic: newMnemonic}));
  };

  const generateMnemonicPhrase = useCallback(async () => {
    const mnemonicString: string = await bip39.generateMnemonic(128);
    const words = mnemonicString.split(' ');
    if (words.length !== _.uniq(words).length) {
      generateMnemonicPhrase();
      return;
    }

    setNewMnemonic(mnemonicString);
  }, []);

  useEffect(() => {
    generateMnemonicPhrase();
  }, [generateMnemonicPhrase]);

  return (
    <BaseScreen isLoading={isLoading}>
      <View style={[t.flex1]}>
        <ScrollView>
          <View style={[t.justifyCenter, t.itemsCenter, t.mB4]}>
            <Image
              source={logo}
              style={[{width: width * 0.5, height: width * 0.5}]}
              resizeMode="contain"
            />
            <Text style={[t.text2xl, t.mT4, t.textWhite, t.fontMono]}>
              New Dao Jones
            </Text>
          </View>
          <Card>
            <Paragraph text="Import existing wallet" align="center" />
            <TextInput
              autoCapitalize="none"
              value={mnemonic}
              onChangeText={onChangeMnemonic}
              style={[
                t.roundedLg,
                t.textWhite,
                t.textCenter,
                t.h20,
                t.pT4,
                t.mB4,
                t.pL2,
                t.pR2,
                t.mT4,
                {backgroundColor: colors.cardBlack},
                {fontSize: 16},
              ]}
              multiline={true}
            />
          </Card>
        </ScrollView>
      </View>
      <View style={[t.flexRow]}>
        {!mnemonic ? (
          <Button text="Create" onPress={onCreate} />
        ) : (
          <Button text="Import" disabled={!mnemonic} onPress={onImport} />
        )}
      </View>
    </BaseScreen>
  );
};
