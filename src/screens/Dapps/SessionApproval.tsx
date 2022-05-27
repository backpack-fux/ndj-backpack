import React, {useEffect, useState} from 'react';
import {Image, ScrollView, TouchableOpacity, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '@app/assets/colors.config';
import {useWalletConnect} from '@app/context/walletconnect';
import {MainStackParamList} from '@app/models';
import {BaseScreen, Button, Paragraph} from '@app/components';
import {useSelector} from 'react-redux';
import {
  networkSelector,
  walletsSelector,
} from '@app/store/wallets/walletsSelector';
import {getNetworkByChain, showNetworkName, showSnackbar} from '@app/utils';
import {NetworkName, networkName} from '@app/constants';
import * as _ from 'lodash';
import {Card} from './components';

export const SessionApproval = () => {
  const {onAcceptSessionProposal, onRejectSessionProposal} = useWalletConnect();
  const route =
    useRoute<RouteProp<MainStackParamList, 'SessionApprovalModal'>>();
  const wallets = useSelector(walletsSelector);
  const network = useSelector(networkSelector);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);

  const navigation = useNavigation();
  const {proposal} = route.params;
  const {proposer, permissions} = proposal;
  const {metadata} = proposer;
  const icon = metadata.icons[0];
  const {blockchain, jsonrpc} = permissions;
  const availableChains = blockchain.chains
    .map(c => ({
      network: getNetworkByChain(c, network),
      chain: c,
    }))
    .filter(c => c.network);
  const availableNetworks = availableChains.map(
    c => c.network,
  ) as NetworkName[];

  const availableWallets = wallets.filter(
    w =>
      w.wallets.filter(c => availableNetworks.includes(c.network)).length > 0,
  );

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

  useEffect(() => {
    if (!availableWallets.length) {
      onRejectSessionProposal(proposal, 'No available accounts');
      showSnackbar('No available accounts');

      navigation.goBack();
    }
  }, [availableWallets]);

  return (
    <BaseScreen noBottom>
      <View style={[t.flexRow, t.mB4]}>
        <TouchableOpacity
          style={[t.absolute, t.left0, t.z10, t.p2]}
          onPress={onReject}>
          <Paragraph text="Cancel" type="bold" />
        </TouchableOpacity>
        <View style={[t.flex1, t.mT2]}>
          <Paragraph text="Confirm" size={18} type="bold" align="center" />
        </View>
      </View>
      <ScrollView>
        {icon && (
          <Image
            source={{uri: icon}}
            style={[t.w10, t.h10, t.selfCenter, t.mB4]}
          />
        )}
        <Paragraph
          text={`${metadata.name} wants to connect to your wallets`}
          type="bold"
          marginLeft={20}
          marginRight={20}
          size={20}
          lineHeight={25}
          align="center"
          marginBottom={10}
        />
        <Paragraph text={metadata.url} align="center" color={colors.textGray} />
        <Card>
          <Paragraph text="Chains:" color={colors.textGray} />
          <Paragraph
            text={availableNetworks.map(n => networkName[n]).join(', ')}
          />
        </Card>
        <Card>
          <Paragraph text="Chains:" color={colors.textGray} />
          <Paragraph text={jsonrpc.methods.join(', ')} />
        </Card>

        {availableWallets.map(wallet => (
          <Card key={wallet.id}>
            <Paragraph text={wallet.name} color={colors.textGray} />
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
                  key={`${chain}:${w.address}`}
                  style={[t.flexRow, t.alignCenter]}
                  onPress={() => onSelectAddress(`${chain}:${w.address}`)}>
                  <MIcon
                    name={
                      isChecked
                        ? 'checkbox-intermediate'
                        : 'checkbox-blank-outline'
                    }
                    size={35}
                    color={isChecked ? colors.secondary : colors.textGray}
                  />
                  <View style={[t.flex1, t.flexRow, t.mL2, t.selfCenter]}>
                    <Paragraph
                      text={`${networkName[w.network]}${showNetworkName(
                        w.network,
                        network,
                      )}: `}
                      type="bold"
                    />
                    <View style={[t.flex1]}>
                      <Paragraph text={w.address} numberOfLines={1} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Card>
        ))}

        <View style={[t.pL4, t.pR4, t.mT4, t.mB4]}>
          <View style={[t.flexRow, t.alignCenter]}>
            <Icon name="md-wallet-outline" size={20} color={colors.white} />
            <Paragraph
              marginLeft={10}
              text="View your wallet balance an activity"
            />
          </View>
          <View style={[t.flexRow, t.alignCenter]}>
            <Icon
              name="shield-checkmark-outline"
              size={20}
              color={colors.white}
            />
            <Paragraph
              marginLeft={10}
              text="Request approval for transactions"
            />
          </View>
        </View>
      </ScrollView>
      <View style={[t.mB4, t.mT2]}>
        <Button
          disabled={!selectedAddresses.length}
          text="Connect"
          onPress={onConnect}
        />
      </View>
    </BaseScreen>
  );
};
