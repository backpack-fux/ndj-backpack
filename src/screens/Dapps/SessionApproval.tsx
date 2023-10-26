import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import {t} from 'react-native-tailwindcss';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import CardFlip from 'react-native-card-flip';
import Toast from 'react-native-toast-message';

import {colors} from '@app/assets/colors.config';
import {useWalletConnect} from '@app/context/walletconnect';
import {StackParams, Wallet} from '@app/models';
import {BaseScreen, Button, Paragraph} from '@app/components';
import _ from 'lodash';
import {
  networkSelector,
  walletsSelector,
} from '@app/store/wallets/walletsSelector';
import {getChainId, getChains, getMethods, showNetworkName} from '@app/utils';
import {networkList, NetworkName, networkName} from '@app/constants';

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

export const SessionApproval = () => {
  const {
    onAcceptSessionProposal,
    onRejectSessionProposal,
    onClearPairingTopic,
  } = useWalletConnect();
  const route = useRoute<RouteProp<StackParams, 'SessionApprovalModal'>>();
  const wallets = useSelector(walletsSelector);
  const network = useSelector(networkSelector);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [techMode, setTechMode] = useState(false);

  const card = useRef<any>();

  const toggleMode = () => {
    setTechMode(!techMode);
    card.current?.flip();
  };

  const navigation = useNavigation();
  const proposal = useMemo(() => route.params.proposal, [route]);
  const {proposer, requiredNamespaces, optionalNamespaces} = useMemo(
    () => proposal.params,
    [proposal],
  );
  const metadata = useMemo(() => proposer.metadata, [proposer]);

  const requiredChains = useMemo(
    () => getChains(requiredNamespaces, network),
    [requiredNamespaces, network],
  );
  const requiredMethods = useMemo(
    () => getMethods(requiredNamespaces),
    [requiredNamespaces],
  );
  const optionalChains = useMemo(
    () => getChains(optionalNamespaces, network),
    [optionalNamespaces, network],
  );
  const optionalMethods = useMemo(
    () => getMethods(optionalNamespaces),
    [optionalNamespaces],
  );
  const methods = useMemo(
    () => _.uniq([...requiredMethods, optionalMethods]),
    [requiredMethods, optionalMethods],
  );
  const availableChains = useMemo(
    () => _.uniqBy([...requiredChains, ...optionalChains], 'chain'),
    [requiredChains, optionalChains],
  );

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
            return `${chain}:${w.address}`;
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
    const allChains = Object.values(requiredNamespaces).reduce(
      (c: string[], item: any) => {
        return [...c, ...item.chains];
      },
      [],
    );

    const unselectedChains = allChains.filter(
      chain =>
        selectedAddresses.filter(address => getChainId(address) === chain)
          .length === 0,
    );

    return unselectedChains.length > 0;
  }, [selectedAddresses, requiredNamespaces]);

  const onConnect = async () => {
    onAcceptSessionProposal(proposal, selectedAddresses);
    navigation.goBack();
  };

  const onReject = () => {
    onRejectSessionProposal(proposal);
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
      onRejectSessionProposal(proposal, 'No available accounts');
      navigation.goBack();
      setTimeout(() => {
        Toast.show({
          type: 'error',
          text1: 'No available accounts',
        });
      }, 500);
    }
  }, [availableWallets]);

  useEffect(() => {
    onClearPairingTopic();
  }, []);

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
                  text={metadata.url}
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

                    const isChecked = selectedAddresses.includes(
                      `${chain}:${w.address}`,
                    );

                    return (
                      <TouchableOpacity
                        key={`${chain}:${w.address}${wallet.network}`}
                        style={[t.flexRow, t.alignCenter]}
                        onPress={() =>
                          onSelectAddress(`${chain}:${w.address}`)
                        }>
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
                  text={metadata.url}
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

                    const isChecked = selectedAddresses.includes(
                      `${chain}:${w.address}`,
                    );

                    const networkItem = networkList.find(
                      item => item.network === w.network,
                    );

                    return (
                      <TouchableOpacity
                        key={`${chain}:${w.address}${wallet.network}`}
                        style={[t.flexRow, t.alignCenter]}
                        onPress={() =>
                          onSelectAddress(`${chain}:${w.address}`)
                        }>
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
                            text={`${networkName[w.network]}${showNetworkName(
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
