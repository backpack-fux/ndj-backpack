import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, Dimensions, Image, TouchableOpacity} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import {t} from 'react-native-tailwindcss';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {Thread} from 'react-native-threads';
import Toast from 'react-native-toast-message';

import {BaseScreen, Button, Paragraph} from '@app/components';
import {colors} from '@app/assets/colors.config';

import ProfileIcon from '@app/assets/icons/profile.svg';
import PlusIcon from '@app/assets/icons/plus.svg';
import UsdIcon from '@app/assets/icons/usd.svg';
import EqualIcon from '@app/assets/icons/equal.svg';
import WalletIcon from '@app/assets/icons/wallets.svg';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {StackParams, Wallet, WalletItem} from '@app/models';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectedWalletSelector,
  spendWalletSelector,
} from '@app/store/wallets/walletsSelector';
import {addWallet, setIsReadFieldGuide} from '@app/store/wallets/actions';
import {NetworkName} from '@app/constants';
import {wyreService} from '@app/services/wyreService';
import {generateMnemonicPhrase} from '@app/utils';

const thread = new Thread('./wallet.thread.js');
const logo = require('@app/assets/images/logo.png');
const bankIcon = require('@app/assets/images/bank.png');
const walletIcon = require('@app/assets/images/wall.png');
const screenHeight = Dimensions.get('screen').height;
const screenWidth = Dimensions.get('screen').width;
const borderWidth = 1;
const shadow = {
  shadowColor: '#fff',
  shadowOffset: {
    width: 0,
    height: 5,
  },
  shadowOpacity: 0.6,
  shadowRadius: 1,

  elevation: 5,
};

const Card = ({children}: {children?: React.ReactNode}) => (
  <View
    style={[
      t.bgPurple500,
      t.roundedXl,
      t.border2,
      t.borderPurple200,
      t.mB4,
      shadow,
      t.flex1,
    ]}>
    <View style={[t.flex1, t.pL4, t.pR4, t.pB2, t.pT2]}>{children}</View>
  </View>
);

const FirstCard = () => (
  <Card>
    <View style={[t.flex1, t.justifyEvenly]}>
      <View style={[t.flexRow, t.itemsCenter, t.justifyCenter]}>
        <Paragraph text="Welcome To" />
        <Image
          source={logo}
          style={[
            t.mT10,
            {width: screenWidth * 0.3, height: screenWidth * 0.3},
          ]}
          resizeMode="contain"
        />
      </View>
      <Paragraph
        text="The following Field Guide will help you set up your Backpack for the first time and get a sense of how to use it."
        align="center"
      />
      <Paragraph
        text={
          'We’ve worked hard to bring you this new modern financial tool and are excited to get you onboarded, so LFG!'
        }
        align="center"
      />
    </View>
  </Card>
);

const SecondCard = () => (
  <Card>
    <View style={[t.flex1, t.justifyEvenly]}>
      <Paragraph
        text="At its most basic, personal finance is composed of accounts that keep track of value-in and value-out. "
        align="center"
      />
      <View style={[t.flexRow, t.mL4, t.mR4]}>
        <Image source={bankIcon} style={[t.flex1]} resizeMode="contain" />
        <Image
          source={walletIcon}
          style={[t.flex1, t.mL8]}
          resizeMode="contain"
        />
      </View>
      <View>
        <Paragraph text="A bank will normally set you up" align="center" />
        <View style={[t.flexRow, t.itemsCenter, t.justifyCenter]}>
          <Paragraph text=" with a" />
          <Paragraph
            text="Checking"
            color={colors.secondary}
            marginLeft={5}
            marginRight={5}
          />
          <Paragraph text="," />
          <Paragraph
            text="Savings"
            color={colors.green}
            marginLeft={5}
            marginRight={5}
          />
          <Paragraph text=", and" />
        </View>
        <Paragraph text=" Credit Line of some sort." align="center" />
      </View>
      <Paragraph
        text="We recommend setting up Backpack accounts, called wallets, similarly."
        align="center"
      />
      <View style={[t.flexRow, t.itemsCenter, t.justifyCenter, t.mT8]}>
        <ProfileIcon />
        <PlusIcon style={[t.mL2]} />
        <UsdIcon style={[t.mL2]} />
        <EqualIcon style={[t.mL2]} />
        <WalletIcon style={[t.mL2]} />
      </View>
    </View>
  </Card>
);

const ThirdCard = () => (
  <Card>
    <View style={[t.flex1, t.justifyAround]}>
      <Paragraph
        text="These wallets are built with web3 technology and will take about 1 minute to generate."
        align="center"
      />
      <View style={[t.justifyCenter]}>
        <View style={[t.flexRow]}>
          <View style={[t.flex1, t.justifyCenter, t.mR4]}>
            <Paragraph
              text="Spend wallets will get products like cashback on spending"
              size={10}
              align="center"
            />
          </View>
          <View
            style={[
              t.flex1,
              t.bgPurple500,
              t.roundedXl,
              t.border2,
              t.borderPurple200,
              shadow,
              t.h16,
              t.itemsCenter,
              t.justifyCenter,
            ]}>
            <Paragraph text="Spend" color={colors.secondary} />
          </View>
        </View>
        <View style={[t.flexRow, t.mT2]}>
          <View style={[t.flex1, t.justifyCenter, t.mR4]}>
            <Paragraph
              text="Save wallets will get yield products. like gig work for your money"
              size={10}
              align="center"
            />
          </View>
          <View
            style={[
              t.flex1,
              t.bgPurple500,
              t.roundedXl,
              t.border2,
              t.borderPurple200,
              shadow,
              t.h16,
              t.itemsCenter,
              t.justifyCenter,
            ]}>
            <Paragraph text="Save" color={colors.green} />
          </View>
        </View>
        <View style={[t.flexRow, t.mT2]}>
          <View style={[t.flex1, t.justifyCenter, t.mR4]}>
            <Paragraph
              text="Invest wallets will get risk and return based products, like wealthfront but more dynamic"
              size={10}
              align="center"
            />
          </View>
          <View
            style={[
              t.flex1,
              t.bgPurple500,
              t.roundedXl,
              t.border2,
              t.borderPurple200,
              shadow,
              t.h16,
              t.itemsCenter,
              t.justifyCenter,
            ]}>
            <Paragraph text="Invest" color={colors.blue} />
          </View>
        </View>
      </View>
    </View>
  </Card>
);

const FourthCard = ({
  amount,
  onChangeAmount,
}: {
  amount: number;
  onChangeAmount: (val: number) => void;
}) => (
  <Card>
    <View style={[t.flex1, t.justifyEvenly]}>
      <Paragraph
        text="With your wallets created, the next step will be to fund your Spend wallet."
        align="center"
      />
      <Paragraph
        text="We currently accept credit, debit or crypto with more options soon."
        align="center"
      />
      <View>
        <View
          style={[
            t.bgPurple500,
            t.roundedXl,
            t.border2,
            t.borderPurple200,
            shadow,
            t.mL8,
            t.mR8,
            t.p4,
          ]}>
          <View style={[t.flexRow, t.justifyBetween, t.itemsEnd]}>
            <View
              style={[{width: screenWidth * 0.2, height: screenWidth * 0.2}]}>
              <Image
                source={logo}
                style={[{width: screenWidth * 0.2, height: screenWidth * 0.2}]}
                resizeMode="contain"
              />
            </View>
            <View style={[t.bgGray300, t.w4, t.h4, t.rounded]} />
          </View>
          <View style={[t.flexRow, t.justifyBetween, t.itemsEnd, t.mT2]}>
            <Paragraph text="1234 5678 9012 3456" size={10} />
            <Paragraph
              text="VISA"
              size={18}
              type="bold"
              color={colors.primaryLight}
            />
          </View>
        </View>
        <View style={[t.flexRow, t.justifyCenter, t.mT4]}>
          <TouchableOpacity
            onPress={() => onChangeAmount(20)}
            style={[
              amount === 20 ? t.bgPink500 : t.bgGray300,
              t.rounded,
              t.pL1,
              t.pR1,
            ]}>
            <Paragraph text="$20" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onChangeAmount(50)}
            style={[
              amount === 50 ? t.bgPink500 : t.bgGray300,
              t.rounded,
              t.mL2,
              t.pL1,
              t.pR1,
            ]}>
            <Paragraph text="$50" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onChangeAmount(100)}
            style={[
              amount === 100 ? t.bgPink500 : t.bgGray300,
              t.rounded,
              t.mL2,
              t.pL1,
              t.pR1,
            ]}>
            <Paragraph text="$100" />
          </TouchableOpacity>
        </View>
        <View style={[t.flexRow, t.itemsCenter, t.justifyCenter, t.mT2]}>
          <View style={[t.selfCenter, t.bgGray300, t.rounded, t.pL1, t.pR1]}>
            <Paragraph text="Daily max of $500" align="center" />
          </View>
        </View>
        <Paragraph
          marginTop={20}
          text="Card processing is provided by Wyre.io"
          align="center"
        />
      </View>
    </View>
  </Card>
);

const FivethCard = () => (
  <Card>
    <View style={[t.justifyCenter, t.flex1]}>
      <Paragraph
        text="Dope! Your spend wallet is now funded and initial setup is done!"
        align="center"
        marginBottom={30}
      />
      <View>
        <View style={[t.flexRow, t.justifyCenter]}>
          <Paragraph text="F" color={colors.secondary} />
          <Paragraph text="i" color={colors.yellow} />
          <Paragraph text="n" color={colors.blue} />
          <Paragraph text="a" color={colors.primaryLight} />
          <Paragraph text="l" color={colors.green} />

          <Paragraph text="N" color={colors.secondary} marginLeft={5} />
          <Paragraph text="o" color={colors.yellow} />
          <Paragraph text="t" color={colors.blue} />
          <Paragraph text="e" color={colors.primaryLight} />
          <Paragraph text="s" color={colors.green} />
        </View>
        <View style={[t.flexRow, t.justifyCenter]}>
          <Paragraph text="1. As for your" />
          <Paragraph
            text="Save"
            marginLeft={5}
            marginRight={5}
            color={colors.green}
          />
          <Paragraph text="And" />
          <Paragraph text="Invest" marginLeft={5} color={colors.blue} />
        </View>
        <Paragraph
          text="wallets,let’s set those aside for now. Their features are right around the corner and we’ll bring back the Field Guide for release events."
          align="center"
        />
        <Paragraph
          marginTop={5}
          text="2. If you were brought to Backpack through a Storefront experience you can complete your checkout by tapping the Send button followed by the Scan icon from the Wallet Management view."
          align="center"
        />
      </View>
      <Paragraph text="Praise be." align="center" marginTop={20} />
    </View>
  </Card>
);

const slider = [0, 1, 2, 3, 4];
export const FieldGuideScreen = () => {
  const route = useRoute<RouteProp<StackParams, 'FieldGuide'>>();

  const navigation = useNavigation<NavigationProp<StackParams>>();
  const dispatch = useDispatch();
  const [active, setActive] = useState(0);
  const carouselRef = useRef<any>();
  const [amount, setAmount] = useState(100);
  const [isImportingWallet, setIsImportingWallet] = useState(false);
  const [isCreatingWallet, setIsCreateingWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wallet = useSelector(selectedWalletSelector);
  const spendWallet = useSelector(spendWalletSelector);
  const allowGoBack = route?.params?.allowGoBack;

  const fields = useMemo(() => {
    if (!wallet) {
      return [<FirstCard />, <SecondCard />, <ThirdCard />];
    }

    return [
      <FirstCard />,
      <SecondCard />,
      <ThirdCard />,
      <FourthCard amount={amount} onChangeAmount={val => setAmount(val)} />,
      <FivethCard />,
    ];
  }, [amount, wallet]);

  const onImportWallet = () => {
    setIsImportingWallet(true);
    navigation.navigate('ImportWallet');
  };

  const onCreateDefaultWallets = async () => {
    setIsCreateingWallet(true);

    await onCreateSpendWallet();
    await onCreateSaveWallet();
    await onCreateInvestWallet();
  };

  const onCreateSpendWallet = async () => {
    try {
      const spendMnemonic = await generateMnemonicPhrase();

      const res = await createWallet(spendMnemonic);

      const newWallet: Wallet = {
        id: 'spend',
        name: 'Spend',
        mnemonic: spendMnemonic,
        wallets: res,
      };
      dispatch(addWallet(newWallet));
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message,
      });
    }
  };

  const onCreateSaveWallet = async () => {
    try {
      const saveMnemonic = await generateMnemonicPhrase();

      const res = await createWallet(saveMnemonic);

      const newWallet: Wallet = {
        id: 'save',
        name: 'Save',
        mnemonic: saveMnemonic,
        wallets: res,
      };
      dispatch(addWallet(newWallet));
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message,
      });
    }
  };

  const onCreateInvestWallet = async () => {
    try {
      const investMnemonic = await generateMnemonicPhrase();

      const res = await createWallet(investMnemonic);

      const newWallet: Wallet = {
        id: 'invest',
        name: 'Invest',
        mnemonic: investMnemonic,
        wallets: res,
      };
      dispatch(addWallet(newWallet));
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message,
      });
    }
  };

  const createWallet = async (mnemonic: string): Promise<WalletItem[]> => {
    return new Promise((resolve, reject) => {
      thread.postMessage(mnemonic);

      thread.onmessage = (message: string) => {
        if (message.startsWith('Error:')) {
          reject(message);
        } else {
          resolve(JSON.parse(message));
        }
      };
    });
  };

  const onAddFunds = async () => {
    const spendEthWallet = spendWallet?.wallets.find(
      w => w.network === NetworkName.ethereum,
    );

    if (!spendEthWallet) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await wyreService.reserve(
        'ETH',
        spendEthWallet.address,
        amount,
      );
      if (res.url) {
        navigation.navigate('BuyToken', {
          url: res.url,
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDone = () => {
    if (allowGoBack) {
      navigation.goBack();
    } else {
      dispatch(setIsReadFieldGuide());
    }
  };

  useEffect(() => {
    if (isCreatingWallet && spendWallet) {
      setIsCreateingWallet(false);
      setTimeout(() => {
        ReactNativeHapticFeedback.trigger('impactHeavy');
        carouselRef?.current?.snapToItem(3);
      }, 500);
    }
  }, [isCreatingWallet, spendWallet]);

  useEffect(() => {
    if (isImportingWallet && wallet) {
      setIsImportingWallet(false);
      setTimeout(() => {
        ReactNativeHapticFeedback.trigger('impactHeavy');
        carouselRef?.current?.snapToItem(3);
      }, 500);
    }
  }, [isImportingWallet, wallet]);

  return (
    <BaseScreen noBottom isLoading={isCreatingWallet || isLoading}>
      <View style={[t.flex1]}>
        <Carousel
          ref={carouselRef}
          data={fields}
          keyExtractor={(item, index) => `wallet_${index}`}
          renderItem={({item}) => item}
          windowSize={screenHeight}
          itemWidth={screenWidth - 60}
          sliderWidth={screenWidth - 30}
          onSnapToItem={index => {
            setActive(index);
          }}
        />
        <View style={[t.flexRow, t.itemsCenter, t.justifyCenter, t.mT2]}>
          {slider.map((item, index) => (
            <View
              key={index}
              style={[
                index <= active ? t.bgPink500 : t.bgTransparent,
                t.w3,
                t.h3,
                t.mL2,
                t.mR2,
                t.roundedFull,
                t.borderPink500,
                {borderWidth},
              ]}
            />
          ))}
        </View>
        <Paragraph
          text="est time to onboard: 90 seconds"
          size={10}
          align="center"
        />
      </View>
      <View style={[t.h16, t.justifyEnd, t.mB4]}>
        <View />
        {active === 2 && (
          <View style={[t.flexRow]}>
            <View style={[t.flex1]}>
              <Button
                text="Manual"
                onPress={onImportWallet}
                disabled={!!wallet}
              />
            </View>
            <View style={[t.mL2, t.flex1]}>
              <Button
                text="3 Wallets"
                onPress={onCreateDefaultWallets}
                disabled={!!spendWallet}
              />
            </View>
          </View>
        )}
        {active === 3 && (
          <Button
            text="Fund Spend Wallet"
            disabled={!spendWallet}
            onPress={onAddFunds}
          />
        )}
        {active === 4 && <Button text="Close" onPress={onDone} />}
      </View>
    </BaseScreen>
  );
};
