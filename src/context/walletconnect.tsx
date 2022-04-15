import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletConnectClient, {CLIENT_EVENTS} from '@walletconnect/client';
import {SessionTypes} from '@walletconnect/types';
import {MainStackParamList} from '@app/models';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {showSnackbar} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/constants/EIP155Data';

export interface WalletConnectContextProps {
  client?: WalletConnectClient;
  sessions: SessionTypes.Settled[];
  onAcceptSessionProposal: (
    proposal: SessionTypes.Proposal,
    accounts: string[],
  ) => void;
  onRejectSessionProposal: (
    proposal: SessionTypes.Proposal,
    message?: string,
  ) => void;
  onDisconnect: (topic: string) => void;
}

export const WalletConnectContext = createContext<WalletConnectContextProps>({
  sessions: [],
  onAcceptSessionProposal: () => {},
  onRejectSessionProposal: () => {},
  onDisconnect: () => {},
});

export const useWalletConnect = () => {
  const context = useContext(WalletConnectContext);

  return context;
};

export const WalletConnectProvider = (props: {
  children: React.ReactChild[] | React.ReactChild;
}) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const [client, setClient] = useState<WalletConnectClient>();
  const [sessions, setSessions] = useState<SessionTypes.Settled[]>([]);

  const initClient = async () => {
    const wClient = await WalletConnectClient.init({
      controller: true,
      projectId: 'f17194a7efd15ee24623a532ccff7c77',
      relayUrl: 'wss://relay.walletconnect.com',
      metadata: {
        name: 'NDJ Wallet',
        description: 'NDJ Wallet',
        url: '#',
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
      },
      storageOptions: {
        asyncStorage: AsyncStorage as any,
      },
    });

    setClient(wClient);
  };

  const onAcceptSessionProposal = async (
    proposal: SessionTypes.Proposal,
    accounts: string[],
  ) => {
    const {proposer} = proposal;
    const {metadata} = proposer;
    const response = {
      state: {
        accounts,
      },
      metadata,
    };

    await client?.approve({proposal, response});
  };

  const onRejectSessionProposal = async (
    proposal: SessionTypes.Proposal,
    errorMessage?: string,
  ) => {
    const reason = {
      code: errorMessage ? 0 : 1601,
      message: errorMessage || 'Session proposal not approved',
    };
    await client?.reject({proposal, reason});
  };

  const onDisconnect = (topic: string) => {
    const reason = {
      code: 0,
      message: 'Owner ended session',
    };
    client?.disconnect({topic, reason});
  };

  const onSyncSessions = () => {
    const values = client?.session.values || [];

    setSessions(values);
  };

  const onSessionApproval = useCallback((proposal: SessionTypes.Proposal) => {
    navigation?.navigate('SessionApprovalModal', {proposal});
  }, []);

  const onSessionCreated = useCallback((session: SessionTypes.Created) => {
    showSnackbar(`Connected ${session.self.metadata.name} successfully`);
  }, []);

  /******************************************************************************
   * 3. Open request handling modal based on method that was used
   *****************************************************************************/
  const onSessionRequest = useCallback(
    async (event: SessionTypes.RequestEvent) => {
      const {topic, request} = event;
      const {method} = request;
      const session = await client?.session?.get(topic);

      switch (method) {
        case EIP155_SIGNING_METHODS.ETH_SIGN:
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
          return navigation.navigate('SessionSignModal', {
            event,
            session,
          });

        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
          return navigation.navigate('SessionSignTypedDataModal', {
            event,
            session,
          });

        case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
          return navigation.navigate('SessionSendTransactionModal', {
            event,
            session,
          });

        default:
          return navigation.navigate('SessionUnsuportedMethodModal', {
            event,
            session,
          });
      }
    },
    [client],
  );

  useEffect(() => {
    setSessions(client?.session.values || []);
  }, [client]);

  useEffect(() => {
    client?.on(CLIENT_EVENTS.session.proposal, onSessionApproval);
    client?.on(CLIENT_EVENTS.session.created, onSessionCreated);
    client?.on(CLIENT_EVENTS.session.request, onSessionRequest);
    client?.on(CLIENT_EVENTS.session.sync, onSyncSessions);

    return () => {
      client?.removeListener(CLIENT_EVENTS.session.proposal, onSessionApproval);
      client?.removeListener(CLIENT_EVENTS.session.created, onSessionCreated);
      client?.removeListener(CLIENT_EVENTS.session.request, onSessionRequest);
      client?.removeListener(CLIENT_EVENTS.session.sync, onSyncSessions);
    };
  }, [client, onSessionApproval, onSessionCreated, onSessionRequest]);

  useEffect(() => {
    initClient();
  }, []);

  return (
    <WalletConnectContext.Provider
      value={{
        client,
        sessions,
        onRejectSessionProposal,
        onAcceptSessionProposal,
        onDisconnect,
      }}>
      {props.children}
    </WalletConnectContext.Provider>
  );
};
