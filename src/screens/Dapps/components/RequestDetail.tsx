import {Paragraph} from '@app/components';
import React from 'react';
import {View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {Card} from './Card';
import {networkName} from '@app/constants';
import {getNetworkByChain} from '@app/utils';
import {useSelector} from 'react-redux';
import {walletsSelector} from '@app/store/wallets/walletsSelector';

const borderBottomWidth = 0.3;

export const RequestDetail = ({
  address,
  chainId,
  protocol,
}: {
  address?: string;
  chainId?: string;
  protocol: string;
}) => {
  const network = chainId && getNetworkByChain(chainId);
  const wallets = useSelector(walletsSelector);

  const availableWallets = network
    ? wallets.filter(
        account =>
          account.wallets.filter(
            wallet => wallet.network === network && wallet.address === address,
          ).length > 0,
      )
    : [];
  const accountNames = availableWallets.map(account => account.name).join(', ');
  return (
    <Card>
      {!!network && (
        <View
          style={[
            t.flexRow,
            t.pB2,
            t.pT2,
            t.borderGray200,
            {borderBottomWidth},
          ]}>
          <View style={[t.flex1]}>
            <Paragraph text="Blockchain:" marginRight={10} />
          </View>
          <Paragraph align="right" text={networkName[network]} />
        </View>
      )}
      {address && (
        <View
          style={[
            t.flexRow,
            t.pB2,
            t.pT2,
            t.borderGray200,
            {borderBottomWidth},
          ]}>
          <View style={[t.w20]}>
            <Paragraph text="Address:" marginRight={10} />
          </View>
          <View style={[t.flex1]}>
            <Paragraph align="right" text={address} numberOfLines={1} />
          </View>
        </View>
      )}
      {!!accountNames && (
        <View
          style={[
            t.flexRow,
            t.pB2,
            t.pT2,
            t.borderGray200,
            {borderBottomWidth},
          ]}>
          <View style={[t.w22]}>
            <Paragraph text="Accounts:" marginRight={10} />
          </View>
          <View style={[t.flex1]}>
            <Paragraph align="right" text={accountNames} numberOfLines={1} />
          </View>
        </View>
      )}
      <View style={[t.flexRow, t.pB2, t.pT2, t.borderGray200]}>
        <View style={[t.flex1]}>
          <Paragraph text="Protocol:" marginRight={10} />
        </View>
        <Paragraph align="right" text={protocol} />
      </View>
    </Card>
  );
};
