import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import {StackParams} from '@app/models';
import {EIP155_SIGNING_METHODS} from '@app/constants/EIP155Data';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import SignClient from '@walletconnect/sign-client';
import {SessionTypes, SignClientTypes} from '@walletconnect/types';
import {COSMOS_SIGNING_METHODS} from '@app/constants/COSMOSData';
import {SOLANA_SIGNING_METHODS} from '@app/constants/SolanaData';
import {getSdkError} from '@walletconnect/utils';
import {getDeepLink} from '@app/utils';
import {whiteListedDapps} from '@app/constants/whitelistedDapps';

const ENABLED_TRANSACTION_TOPICS = 'ENABLED_TRANSACTION_TOPICS';

export interface WalletConnectContextProps {
  isInitializingWc: boolean;
  client?: SignClient;
  sessions: any[];
  enabledTransactionTopics: {[topic: string]: boolean};
  onAcceptSessionProposal: (proposal: any, accounts: string[]) => void;
  onRejectSessionProposal: (proposal: any, message?: string) => void;
  onDisconnect: (topic: string) => void;
  onToggleTransactionEnable: (topic: string, value: boolean) => void;
  onPairing: (uri: string) => void;
  onClearPairingTopic: () => void;
  onOpenDeepLink: (url: string) => void;
}

export const WalletConnectContext = createContext<WalletConnectContextProps>({
  isInitializingWc: false,
  sessions: [],
  enabledTransactionTopics: {},
  onAcceptSessionProposal: () => {},
  onRejectSessionProposal: () => {},
  onDisconnect: () => {},
  onToggleTransactionEnable: () => {},
  onPairing: () => {},
  onClearPairingTopic: () => {},
  onOpenDeepLink: () => {},
});

export const useWalletConnect = () => {
  const context = useContext(WalletConnectContext);

  return context;
};

export const WalletConnectProvider = (props: {
  children: React.ReactChild[] | React.ReactChild;
}) => {
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const [client, setClient] = useState<SignClient>();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isInitializingWc, setIsInitializingWc] = useState(false);
  const [enabledTransactionTopics, setEnabledTransactionTopics] = useState<{
    [topic: string]: boolean;
  }>({});
  const [deepLinkUri, setDeepLinkUri] = useState<string>();
  const [pairingTopic, setParingTopic] = useState<string>();

  const initClient = async () => {
    setIsInitializingWc(true);
    try {
      console.log('----------333');
      const wClient = await SignClient.init({
        projectId: '6deff5a02e50ce1ec41397b27b372189',
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'NDJ Wallet',
          description: 'NDJ Wallet',
          url: 'https://jxndao.com',
          icons: ['https://walletconnect.com/walletconnect-logo.png'],
        },
      });
      console.log('----------');
      setClient(wClient);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message,
      });
    } finally {
      setIsInitializingWc(false);
    }
  };

  useEffect(() => {
    const getUrlAsync = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        onOpenDeepLink(url);
      }
    };

    Linking.addEventListener('url', ({url}: {url: string}) =>
      onOpenDeepLink(url),
    );
    getUrlAsync();
  }, []);

  const onOpenDeepLink = (url: string) => {
    const deepLink = getDeepLink(url);

    if (!deepLink?.startsWith('wc:')) {
      Toast.show({
        type: 'error',
        text1: 'WalletConnect: invalid QR code',
      });

      return;
    }

    if (deepLink) {
      setDeepLinkUri(deepLink);
    }
  };

  useEffect(() => {
    if (!deepLinkUri) {
      return;
    }

    if (!client) {
      return;
    }

    if (!deepLinkUri.startsWith('wc:')) {
      Toast.show({
        type: 'error',
        text1: 'WalletConnect: invalid QR code',
      });
    } else {
      client?.pair({uri: deepLinkUri});
      setDeepLinkUri('');
    }
  }, [deepLinkUri, client]);

  const onPairing = useCallback(
    async (uri: string) => {
      const res = await client?.pair({uri});
      setParingTopic(res?.topic);
    },
    [client],
  );

  const onClearPairingTopic = () => {
    setParingTopic('');
  };

  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      if (proposal.params.pairingTopic === pairingTopic) {
        setParingTopic('');
      }
      ReactNativeHapticFeedback.trigger('impactHeavy');
      navigation?.navigate('SessionApprovalModal', {proposal});
    },
    [pairingTopic, navigation],
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

    const whiteList = whiteListedDapps.find(url =>
      url.startsWith(proposal.params?.proposer?.metadata?.url),
    );

    if (res && whiteList) {
      onToggleTransactionEnable(res?.topic as string, true);
    }

    setSessions(client?.session.values || []);
  };

  const onRejectSessionProposal = useCallback(() => {
    async (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      await client?.reject({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED_METHODS'),
      });
    };
  }, []);

  const onDisconnect = async (topic: string) => {
    await client?.disconnect({topic, reason: getSdkError('USER_DISCONNECTED')});

    setSessions(client?.session.values || []);
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
          return navigation.navigate('SessionSignSolanaModal', {
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
    [client, navigation],
  );

  useEffect(() => {
    let timeout: any;
    if (pairingTopic) {
      timeout = setTimeout(() => {
        Toast.show({
          type: 'error',
          text1: 'WalletConnect: connection timed out',
        });
        setParingTopic('');
      }, 15000);
    }

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [pairingTopic]);

  useEffect(() => {
    setSessions(client?.session.values || []);
  }, [client]);

  useEffect(() => {
    syncTransactionEnableTopics();
  }, [sessions]);

  useEffect(() => {
    client?.on('session_proposal', onSessionProposal);

    return () => {
      client?.removeListener('session_proposal', onSessionProposal);
    };
  }, [client, onSessionProposal]);

  useEffect(() => {
    client?.on('session_request', onSessionRequest);

    return () => {
      client?.removeListener('session_request', onSessionRequest);
    };
  }, [client, onSessionRequest]);

  useEffect(() => {
    client?.on('session_delete', () => {
      setSessions(client?.session.values || []);
    });

    return () => {
      client?.removeListener('session_delete', () => {
        setSessions(client?.session.values || []);
      });
    };
  }, [client]);

  useEffect(() => {
    initClient();
  }, []);

  return (
    <WalletConnectContext.Provider
      value={{
        isInitializingWc,
        client,
        sessions,
        enabledTransactionTopics,
        onPairing,
        onRejectSessionProposal,
        onAcceptSessionProposal,
        onDisconnect,
        onToggleTransactionEnable,
        onClearPairingTopic,
        onOpenDeepLink,
      }}>
      {props.children}
    </WalletConnectContext.Provider>
  );
};
