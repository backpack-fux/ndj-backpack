import {SessionTypes, SignClientTypes} from '@walletconnect/types';
import {BaseCoin} from './coinTypes';

export type RootStackParamList = {
  Splash: undefined;
  CreateWallet: undefined;
  MainStack: undefined;
};

export type MainStackParamList = {
  WalletStack: undefined;
  AssetStack: undefined;
  DappStack: undefined;
  SetPasscode: undefined;
  SessionApprovalModal: {
    proposal: SignClientTypes.EventArguments['session_proposal'];
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
  WebView: {
    url: string;
    title?: string;
  };
};

export type DappStackParamList = {
  DappDetails: {session: SessionTypes.Struct};
};

export type WalletStackParamList = {
  Wallets: undefined;
  AddWallet: undefined;
};

export type AssetStackParamList = {
  Assets: undefined;
  Tokens: undefined;
  Receive: {coin?: BaseCoin};
  Send: undefined;
  Transaction: undefined;
};

export type StackParams = RootStackParamList &
  MainStackParamList &
  WalletStackParamList &
  AssetStackParamList &
  DappStackParamList;
