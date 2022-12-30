import {Paragraph} from '@app/components';
import React from 'react';
import {Image, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {Card} from './Card';

export const DappInfo = ({metadata}: {metadata: any}) => {
  const icon = metadata?.icons[0];

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
          {!!metadata?.name && <Paragraph text={metadata?.name} />}
          {!!metadata?.uri && <Paragraph text={metadata?.url} />}
        </View>
      </View>
    </Card>
  );
};
