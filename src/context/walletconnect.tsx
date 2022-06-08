import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MainStackParamList} from '@app/models';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {showSnackbar} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/constants/EIP155Data';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import SignClient from '@walletconnect/sign-client';
import {SessionTypes, SignClientTypes} from '@walletconnect/types';
import {COSMOS_SIGNING_METHODS} from '@app/constants/COSMOSData';
import {SOLANA_SIGNING_METHODS} from '@app/constants/SolanaData';

const ENABLED_TRANSACTION_TOPICS = 'ENABLED_TRANSACTION_TOPICS';

export interface WalletConnectContextProps {
  client?: SignClient;
  sessions: any[];
  enabledTransactionTopics: {[topic: string]: boolean};
  onAcceptSessionProposal: (proposal: any, accounts: string[]) => void;
  onRejectSessionProposal: (proposal: any, message?: string) => void;
  onDisconnect: (topic: string) => void;
  onToggleTransactionEnable: (topic: string, value: boolean) => void;
}

export const WalletConnectContext = createContext<WalletConnectContextProps>({
  sessions: [],
  enabledTransactionTopics: {},
  onAcceptSessionProposal: () => {},
  onRejectSessionProposal: () => {},
  onDisconnect: () => {},
  onToggleTransactionEnable: () => {},
});

export const useWalletConnect = () => {
  const context = useContext(WalletConnectContext);

  return context;
};

export const WalletConnectProvider = (props: {
  children: React.ReactChild[] | React.ReactChild;
}) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const [client, setClient] = useState<SignClient>();
  const [sessions, setSessions] = useState<any[]>([]);
  const [enabledTransactionTopics, setEnabledTransactionTopics] = useState<{
    [topic: string]: boolean;
  }>({});

  const initClient = async () => {
    const wClient = await SignClient.init({
      projectId: 'f17194a7efd15ee24623a532ccff7c77',
      relayUrl: 'wss://relay.walletconnect.com',
      metadata: {
        name: 'NDJ Wallet',
        description: 'NDJ Wallet',
        url: '#',
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
      },
      // storageOptions: {
      //   asyncStorage: AsyncStorage as any,
      // },
    });

    setClient(wClient);
  };

  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      ReactNativeHapticFeedback.trigger('impactHeavy');
      navigation?.navigate('SessionApprovalModal', {proposal});
    },
    [],
  );

  const onAcceptSessionProposal = async (
    proposal: SignClientTypes.EventArguments['session_proposal'],
    accounts: string[],
  ) => {
    const {id, params} = proposal;
    const {requiredNamespaces, relays} = params;

    const namespaces: SessionTypes.Namespaces = {};
    Object.keys(requiredNamespaces).forEach(key => {
      namespaces[key] = {
        accounts: accounts.filter(account => account.startsWith(key)),
        methods: requiredNamespaces[key].methods,
        events: requiredNamespaces[key].events,
      };
    });

    const res = await client?.approve({
      id,
      relayProtocol: relays[0].protocol,
      namespaces,
    });
    await res?.acknowledged();

    setSessions(client?.session.values || []);
  };

  const onRejectSessionProposal = async (
    proposal: SignClientTypes.EventArguments['session_proposal'],
    errorMessage?: string,
  ) => {
    const reason = {
      code: errorMessage ? 0 : 1601,
      message: errorMessage || 'Session proposal not approved',
    };
    await client?.reject({id: proposal.id, reason});
  };

  const onDisconnect = (topic: string) => {
    const reason = {
      code: 0,
      message: 'Owner ended session',
    };
    client?.disconnect({topic, reason});
  };

  const onToggleTransactionEnable = (topic: string, value: boolean) => {
    const data = {
      ...enabledTransactionTopics,
      [topic]: value,
    };
    AsyncStorage.setItem(ENABLED_TRANSACTION_TOPICS, JSON.stringify(data));
    setEnabledTransactionTopics(data);
  };

  const syncTransactionEnableTopics = async () => {
    const res = await AsyncStorage.getItem(ENABLED_TRANSACTION_TOPICS);
    const data = res ? JSON.parse(res) : {};
    const result: any = {};

    for (const session of sessions) {
      result[session.topic] = data[session.topic] || false;
    }

    AsyncStorage.setItem(ENABLED_TRANSACTION_TOPICS, JSON.stringify(data));
    setEnabledTransactionTopics(result);
  };

  const onSyncSessions = () => {
    const values = client?.session.values || [];

    setSessions(values);
  };

  const onSessionCreated = useCallback((session: any) => {
    showSnackbar(`Connected ${session.self.metadata.name} successfully`);
  }, []);

  const onSessionRequest = useCallback(
    async (event: SignClientTypes.EventArguments['session_request']) => {
      const {topic, params} = event;
      const {request} = params;
      const session = client?.session.get(topic);

      switch (request.method) {
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

        case COSMOS_SIGNING_METHODS.COSMOS_SIGN_DIRECT:
        case COSMOS_SIGNING_METHODS.COSMOS_SIGN_AMINO:
          break; // Todo

        case SOLANA_SIGNING_METHODS.SOLANA_SIGN_MESSAGE:
        case SOLANA_SIGNING_METHODS.SOLANA_SIGN_TRANSACTION:
          break; // Todo

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
    syncTransactionEnableTopics();
  }, [sessions]);

  useEffect(() => {
    client?.on('session_proposal', onSessionProposal);
    client?.on('session_request', onSessionRequest);
    client?.on('session_event', (data: any) => {
      console.log('session_event============================');
      console.log(data);
    });
    client?.on('session_delete', () => {
      setSessions(client?.session.values || []);
    });

    return () => {
      client?.removeListener('session_proposal', onSessionProposal);
      client?.removeListener('session_request', onSessionRequest);
      client?.removeListener('session_event', (data: any) => {
        console.log('session_event============================');
        console.log(data);
      });
      client?.removeListener('session_delete', () => {
        setSessions(client?.session.values || []);
      });
    };
  }, [client, onSessionProposal, onSessionCreated, onSessionRequest]);

  useEffect(() => {
    initClient();
  }, []);

  return (
    <WalletConnectContext.Provider
      value={{
        client,
        sessions,
        enabledTransactionTopics,
        onRejectSessionProposal,
        onAcceptSessionProposal,
        onDisconnect,
        onToggleTransactionEnable,
      }}>
      {props.children}
    </WalletConnectContext.Provider>
  );
};
