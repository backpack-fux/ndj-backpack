import {SessionTypes, SignClientTypes} from '@walletconnect/types';
import {BaseCoin} from './coinTypes';
import LegacySignClient from '@walletconnect/client';

export type RootStackParamList = {
  Splash: undefined;
  CreateWallet: undefined;
  MainStack: undefined;
  FieldGuide: {
    allowGoBack?: boolean;
  };
  Tokens: undefined;
  SetPasscode: undefined;
  ImportWallet: undefined;
  BuyToken: {
    url: string;
  };
  SessionApprovalModal: {
    proposal: SignClientTypes.EventArguments['session_proposal'];
  };
  LegacySessionProposalModal: {
    proposal: any;
    client: LegacySignClient;
  };
  LegacySessionSignModal: {
    event: any;
    client: LegacySignClient;
  };
  SessionSignModal: {
    event: SignClientTypes.EventArguments['session_request'];
    session?: SessionTypes.Struct;
  };
  SessionSignTypedDataModal: {
    event: SignClientTypes.EventArguments['session_request'];
    session?: SessionTypes.Struct;
  };
  SessionSendTransactionModal: {
    event: SignClientTypes.EventArguments['session_request'];
    session?: SessionTypes.Struct;
  };
  SessionUnsuportedMethodModal: {
    event: SignClientTypes.EventArguments['session_request'];
    session?: SessionTypes.Struct;
  };
  SessionSignSolanaModal: {
    event: SignClientTypes.EventArguments['session_request'];
    session?: SessionTypes.Struct;
  };
  AddWallet: undefined;
  SelectToken: undefined;
  Webwiew: {
    url: string;
    title?: string;
  };
};

export type MainStackParamList = {
  WalletStack: undefined;
  AssetStack: undefined;
  DappStack: undefined;
};

export type DappStackParamList = {
  DappDetails: {session: SessionTypes.Struct};
};

export type WalletStackParamList = {
  Wallets: undefined;
};

export type AssetStackParamList = {
  Assets: undefined;
  Receive: {coin?: BaseCoin};
  Send: undefined;
  Transaction: undefined;
};
export type StackParams = RootStackParamList &
  MainStackParamList &
  WalletStackParamList &
  AssetStackParamList &
  DappStackParamList;
