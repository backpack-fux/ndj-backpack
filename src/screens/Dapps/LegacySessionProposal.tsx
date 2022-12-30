import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import {t} from 'react-native-tailwindcss';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import CardFlip from 'react-native-card-flip';
import Toast from 'react-native-toast-message';

import {EIP155_SIGNING_METHODS} from '@app/constants/EIP155Data';
import {colors} from '@app/assets/colors.config';
import {StackParams, Wallet} from '@app/models';
import {BaseScreen, Button, Paragraph} from '@app/components';
import _ from 'lodash';
import {
  networkSelector,
  walletsSelector,
} from '@app/store/wallets/walletsSelector';
import {getNetworkByChain, showNetworkName} from '@app/utils';
import {networkList, NetworkName, networkName} from '@app/constants';
import {getSdkError} from '@walletconnect/utils';
import {useWalletConnect} from '@app/context/walletconnect';

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

export const LegacySessionProposal = () => {
  const {onRejectLegacySessionProposal, onAcceptLegacySessionProposal} =
    useWalletConnect();
  const route =
    useRoute<RouteProp<StackParams, 'LegacySessionProposalModal'>>();
  const wallets = useSelector(walletsSelector);
  const network = useSelector(networkSelector);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [techMode, setTechMode] = useState(false);
  const defaultChainId = network === 'mainnet' ? 1 : 5;
  const card = useRef<any>();

  const toggleMode = () => {
    setTechMode(!techMode);
    card.current?.flip();
  };

  const navigation = useNavigation();
  const {proposal, client} = route.params;
  const {params} = proposal;

  const {chainId, peerMeta} = params[0];
  let methods: string[] = Object.values(EIP155_SIGNING_METHODS);
  const availableChains = [`eip155:${chainId || defaultChainId}`]
    .map(c => ({
      network: getNetworkByChain(c, network),
      chain: c,
    }))
    .filter(c => c.network);
  const availableNetworks = useMemo(
    () => availableChains.map(c => c.network) as NetworkName[],
    [availableChains],
  );

  const availableLayers = useMemo(
    () =>
      _.groupBy(
        networkList
          .filter(item => availableNetworks.includes(item.network))
          .map(item => ({network: item.network, layer: item.layer})),
        'layer',
      ),
    [availableNetworks],
  );

  const availableWallets = useMemo(
    () =>
      wallets.filter(
        w =>
          w.wallets.filter(c => availableNetworks.includes(c.network)).length >
          0,
      ),
    [wallets],
  );

  const availableAddresses = useMemo(
    () =>
      availableWallets.reduce((ids: string[], wallet: Wallet) => {
        const items: string[] = wallet.wallets
          .map(w => {
            const chain = availableChains.find(
              c => c.network === w.network,
            )?.chain;
            if (!chain) {
              return '';
            }
            return w.address;
          })
          .filter(w => w);

        return [...ids, ...items];
      }, []),
    [availableWallets, availableChains],
  );

  const isSelectedAll = useMemo(
    () => _.isEqual(selectedAddresses, availableAddresses),
    [selectedAddresses, availableAddresses],
  );

  const isDisabled = useMemo(() => {
    return selectedAddresses.length === 0;
  }, [selectedAddresses]);

  const onConnect = async () => {
    onAcceptLegacySessionProposal(
      client,
      selectedAddresses,
      chainId || defaultChainId,
    );
    navigation.goBack();
  };

  const onReject = async () => {
    onRejectLegacySessionProposal(client);
    navigation.goBack();
  };

  const onSelectAddress = (address: string) => {
    const addresses = _.cloneDeep(selectedAddresses);
    const index = addresses.findIndex(s => s === address);

    if (index > -1) {
      addresses.splice(index, 1);
    } else {
      addresses.push(address);
    }

    setSelectedAddresses(addresses);
  };

  const onSelectAll = () => {
    setSelectedAddresses(isSelectedAll ? [] : availableAddresses);
  };

  useEffect(() => {
    if (!availableWallets.length) {
      client.rejectSession(getSdkError('USER_REJECTED_METHODS'));
      navigation.goBack();
      setTimeout(() => {
        Toast.show({
          type: 'error',
          text1: 'No available accounts',
        });
      }, 500);
    }
  }, [availableWallets]);

  return (
    <BaseScreen noBottom showToast title="Social Contract" onBack={onReject}>
      <CardFlip style={[t.flex1]} ref={card}>
        <View
          style={[
            t.bgPurple500,
            t.p4,
            t.roundedXl,
            t.border2,
            t.mB4,
            shadow,
            t.borderPurple200,
          ]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag">
            <Paragraph text="Why" align="center" marginBottom={15} size={18} />
            <Paragraph
              text="This is like the sign outside a store telling you No Shoes No Shirt No Service, this is a social agreement to kick off commerce"
              marginBottom={10}
            />
            <Paragraph text="Where" align="center" marginBottom={15} />
            <View style={[t.flexRow]}>
              <Paragraph text="UI from" marginRight={5} />
              <View style={[t.flex1, t.justifyCenter]}>
                <Paragraph
                  text={peerMeta?.url}
                  color={colors.blue}
                  numberOfLines={1}
                />
              </View>
            </View>
            <Paragraph
              text="How"
              align="center"
              marginTop={10}
              marginBottom={15}
            />
            <Paragraph
              text="Choosing a wallet is like choosing which card to pay with. So choose which wallet(s) to connect with"
              marginBottom={10}
            />
            <View>
              <TouchableOpacity
                style={[t.flexRow, t.alignCenter, t.mB2]}
                onPress={() => onSelectAll()}>
                <MIcon
                  name={
                    isSelectedAll
                      ? 'checkbox-intermediate'
                      : 'checkbox-blank-outline'
                  }
                  size={35}
                  color={isSelectedAll ? colors.secondary : colors.textGray}
                />
                <View style={[t.flex1, t.mL2, t.flexRow, t.selfCenter]}>
                  <Paragraph text="Select All" type="bold" />
                </View>
              </TouchableOpacity>
              {availableWallets.map(wallet => (
                <>
                  {wallet.wallets.map(w => {
                    const chain = availableChains.find(
                      c => c.network === w.network,
                    )?.chain;

                    if (!chain) {
                      return <></>;
                    }

                    const isChecked = selectedAddresses.includes(w.address);

                    return (
                      <TouchableOpacity
                        key={`${chain}:${w.address}${wallet.network}`}
                        style={[t.flexRow, t.alignCenter]}
                        onPress={() => onSelectAddress(w.address)}>
                        <MIcon
                          name={
                            isChecked
                              ? 'checkbox-intermediate'
                              : 'checkbox-blank-outline'
                          }
                          size={35}
                          color={isChecked ? colors.secondary : colors.textGray}
                        />
                        <View style={[t.flex1, t.mL2, t.flexRow, t.selfCenter]}>
                          <Paragraph
                            text={`${wallet.name} using ${showNetworkName(
                              w.network,
                              network,
                            )}`}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              ))}
            </View>
            <Paragraph
              text="What"
              align="center"
              marginTop={10}
              marginBottom={15}
              size={18}
            />
            <Paragraph text="Sign | Approve | Confirm" />
            <View style={[t.flexRow]}>
              <Paragraph text="•" marginLeft={5} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={
                    'like signing into an account or agreeing to potentially transact'
                  }
                />
              </View>
            </View>

            <Paragraph text="Send Messages" marginTop={10} />
            <View style={[t.flexRow]}>
              <Paragraph text="•" marginLeft={5} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph
                  text={
                    'like discussing a purchase, you can now send info but not yet spend'
                  }
                />
              </View>
            </View>
            <Paragraph text="Spend | Transact | Tx" marginTop={10} />
            <View style={[t.flexRow]}>
              <Paragraph text="•" marginLeft={5} marginRight={10} />
              <View style={[t.flex1]}>
                <Paragraph text={'buy the thing'} />
              </View>
            </View>
          </ScrollView>
        </View>
        <View
          style={[
            t.bgPurple500,
            t.p4,
            t.roundedXl,
            t.border2,
            t.mB4,
            shadow,
            t.borderPurple200,
          ]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag">
            <Paragraph
              text="Connection"
              align="center"
              marginBottom={15}
              size={18}
            />
            <View style={[t.flexRow]}>
              <Paragraph text="Connect To" marginRight={5} />
              <View style={[t.flex1, t.justifyCenter]}>
                <Paragraph
                  text={peerMeta?.url}
                  color={colors.blue}
                  numberOfLines={1}
                />
              </View>
            </View>
            <Paragraph
              text="Chains"
              align="center"
              marginTop={10}
              marginBottom={15}
              size={18}
            />
            <View style={[t.flexRow, t.justifyAround]}>
              {Object.keys(availableLayers).map(layer => (
                <View key={layer} style={[t.flex1, t.itemsCenter]}>
                  <View>
                    <Paragraph text={`Layer ${layer}`} />
                    {availableLayers[layer].map(item => (
                      <Paragraph
                        key={item.network}
                        text={`• ${networkName[item.network]}`}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
            <Paragraph
              text="Chain Methods"
              align="center"
              marginTop={10}
              marginBottom={15}
              size={18}
            />
            <View style={[t.flexRow, t.flexWrap]}>
              {methods.map(method => (
                <Paragraph key={method} text={`${method}, `} />
              ))}
            </View>
            <Paragraph
              text="Wallets"
              align="center"
              marginTop={10}
              marginBottom={15}
              size={18}
            />
            <View>
              <TouchableOpacity
                style={[t.flexRow, t.alignCenter, t.mB2]}
                onPress={() => onSelectAll()}>
                <MIcon
                  name={
                    isSelectedAll
                      ? 'checkbox-intermediate'
                      : 'checkbox-blank-outline'
                  }
                  size={35}
                  color={isSelectedAll ? colors.secondary : colors.textGray}
                />
                <View style={[t.flex1, t.mL2, t.flexRow, t.selfCenter]}>
                  <Paragraph text="Select All" type="bold" />
                </View>
              </TouchableOpacity>
              {availableWallets.map(wallet => (
                <>
                  {wallet.wallets.map(w => {
                    const chain = availableChains.find(
                      c => c.network === w.network,
                    )?.chain;

                    if (!chain) {
                      return <></>;
                    }

                    const isChecked = selectedAddresses.includes(w.address);

                    const networkItem = networkList.find(
                      item => item.network === w.network,
                    );

                    return (
                      <TouchableOpacity
                        key={`${chain}:${w.address}${wallet.network}`}
                        style={[t.flexRow, t.alignCenter]}
                        onPress={() => onSelectAddress(w.address)}>
                        <MIcon
                          name={
                            isChecked
                              ? 'checkbox-intermediate'
                              : 'checkbox-blank-outline'
                          }
                          size={35}
                          color={isChecked ? colors.secondary : colors.textGray}
                        />
                        <View style={[t.flex1, t.mL2, t.flexRow, t.selfCenter]}>
                          <View style={[t.w24]}>
                            <Paragraph
                              text={w.address}
                              numberOfLines={1}
                              ellipsizeMode="middle"
                            />
                          </View>
                          <Paragraph
                            marginLeft={5}
                            text={networkItem?.currency.toUpperCase()}
                          />
                          <Paragraph
                            text="via"
                            marginLeft={5}
                            marginRight={5}
                          />
                          <Paragraph
                            text={`${showNetworkName(w.network, network)}`}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              ))}
            </View>
          </ScrollView>
        </View>
      </CardFlip>
      <View style={[t.mB4, t.mT2, t.flexRow]}>
        <View style={[t.flex1]}>
          <Button
            color={techMode ? colors.secondary : colors.gray}
            text={techMode ? 'View Normal' : 'View Technicals'}
            onPress={toggleMode}
          />
        </View>
        <View style={[t.flex1, t.mL2]}>
          <Button disabled={isDisabled} text="Connect" onPress={onConnect} />
        </View>
      </View>
    </BaseScreen>
  );
};
