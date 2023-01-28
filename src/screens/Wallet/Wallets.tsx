import {BaseScreen} from '@app/components';
import React from 'react';
import {WalletList} from './WalletList';
import {WalletsProvider} from './WalletsContext';

export const WalletsScreen = () => {
  return (
    <BaseScreen>
      <WalletsProvider>
        <WalletList />
      </WalletsProvider>
    </BaseScreen>
  );
};
