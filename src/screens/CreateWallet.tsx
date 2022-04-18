import React, {useCallback, useEffect, useState} from 'react';
import {Image, ScrollView, TextInput, View} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {BaseScreen, Button, Card, Paragraph} from '@app/components';
import {walletsLoadingSelector} from '@app/store/wallets/walletsSelector';
import {useDispatch, useSelector} from 'react-redux';
import {createWallet} from '@app/store/wallets/actions';
import * as _ from 'lodash';
//@ts-ignore
import bip39 from 'react-native-bip39';

const logo = require('@app/assets/images/logo.png');

export const CreateWalletScreen = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(walletsLoadingSelector);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [newMnemonic, setNewMnemonic] = useState<string>('');
  const [isCreate, setIsCreate] = useState(false);

  const onChangeMnemonic = (text: string) => {
    setIsCreate(false);
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
        <ScrollView contentContainerStyle={[t.p2]}>
          <Card onPress={() => setIsCreate(!isCreate)}>
            <Paragraph text="Create a new multi asset wallet" align="center" />
            <Image
              source={logo}
              style={[t.w20, t.h20, t.selfCenter, t.mT6]}
              resizeMode="contain"
            />
          </Card>
          <Card>
            <Paragraph text="Import existing wallet" align="center" />
            <TextInput
              autoCapitalize="none"
              value={mnemonic}
              onChangeText={onChangeMnemonic}
              style={[
                t.bgGray200,
                t.roundedLg,
                t.textWhite,
                t.textCenter,
                t.h20,
                t.pT4,
                t.mB4,
                t.pL2,
                t.pR2,
                t.mT4,
                {fontSize: 16},
              ]}
              multiline={true}
            />
          </Card>
        </ScrollView>
      </View>
      <View style={[t.flexRow]}>
        <Button text="Create" disabled={!isCreate} onPress={onCreate} />
        <View style={[t.mL4, t.flexRow, t.flex1]}>
          <Button text="Import" disabled={!mnemonic} onPress={onImport} />
        </View>
      </View>
    </BaseScreen>
  );
};
