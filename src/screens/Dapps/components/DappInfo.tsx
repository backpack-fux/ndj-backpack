import {Paragraph} from '@app/components';
import {AppMetadata} from '@walletconnect/types';
import React from 'react';
import {Image, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {Card} from './Card';

export const DappInfo = ({metadata}: {metadata: AppMetadata}) => {
  const icon = metadata.icons[0];

  return (
    <Card>
      <View style={[t.flexRow, t.itemsCenter]}>
        {icon && (
          <Image
            source={{uri: icon}}
            style={[t.w10, t.h10, t.selfCenter, t.mR2]}
          />
        )}
        <View>
          <Paragraph text={metadata.name} />
          <Paragraph text={metadata.url} />
        </View>
      </View>
    </Card>
  );
};
