import React, {useCallback, useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';

import {BaseScreen, Button, Card, Paragraph, RotateMenu} from '@app/components';
import {
  walletsLoadingSelector,
  walletsSelector,
} from '@app/store/wallets/walletsSelector';
import {useDispatch, useSelector} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {createWallet} from '@app/store/wallets/actions';
import * as _ from 'lodash';
//@ts-ignore
import bip39 from 'react-native-bip39';
import {useNavigation, useRoute} from '@react-navigation/native';
import {colors} from '@app/assets/colors.config';
import {Wallet} from '@app/models';

const logo = require('@app/assets/images/logo.png');
const {width} = Dimensions.get('screen');

export const CreateWalletScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const isAddWalletModal = route.name === 'AddWallet';
  const wallets = useSelector(walletsSelector);
  const [tempWallets, setTempWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    if (
      isAddWalletModal &&
      tempWallets.length &&
      wallets.length !== tempWallets.length
    ) {
      navigation.goBack();
    }

    setTempWallets(wallets);
  }, [isAddWalletModal, wallets]);

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
    <>
      <BaseScreen
        isLoading={isLoading}
        noBottom={isAddWalletModal}
        title={isAddWalletModal ? 'Add Wallet' : ''}>
        <View style={[t.flex1]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <KeyboardAvoidingView
              style={[t.flex1]}
              behavior="position"
              keyboardVerticalOffset={100}>
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
                    t.bgGray300,
                    {fontSize: 16},
                  ]}
                  multiline={true}
                />
              </Card>
              <View style={[t.flexRow, t.mT2, t.wFull]}>
                {!mnemonic ? (
                  <View style={[t.wFull]}>
                    <Button text="Create" onPress={onCreate} />
                  </View>
                ) : (
                  <View style={[t.wFull]}>
                    <Button
                      text="Import"
                      disabled={!mnemonic}
                      onPress={onImport}
                    />
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </ScrollView>
        </View>
      </BaseScreen>
      {!isAddWalletModal && (
        <View style={styles.rotateMenu}>
          <RotateMenu
            girthAngle={100}
            icons={[
              <MaterialIcons
                id={'Home'}
                name="home"
                color={colors.white}
                size={30}
              />,
            ]}
            onSelect={() => {}}
            defaultIconColor={'gray'}
            styleIconText={[t.bgTransparent]}
            iconHideOnTheBackDuration={100}
            isExpDistCorrection={false}
            noExpDistCorrectionDegree={20}
          />
        </View>
      )}
    </>
  );
};

export const styles = StyleSheet.create({
  rotateMenu: {
    shadowRadius: 2,
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowColor: colors.primary,
    shadowOpacity: 0.9,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
  },
});
