import {SessionTypes} from '@walletconnect/types';
import {Network} from '.';

export type RootStackParamList = {
  AuthStack: undefined;
  MainStack: undefined;
  Splash: undefined;
};

export type MainStackParamList = {
  MainBottom: undefined;
  SessionApprovalModal: SessionApprovalParams;
  SessionSignModal: {
    event: SessionTypes.RequestEvent;
    session?: SessionTypes.Settled;
  };
  SessionSignTypedDataModal: {
    event: SessionTypes.RequestEvent;
    session?: SessionTypes.Settled;
  };
  SessionSendTransactionModal: {
    event: SessionTypes.RequestEvent;
    session?: SessionTypes.Settled;
  };
  SessionUnsuportedMethodModal: {
    event: SessionTypes.RequestEvent;
    session?: SessionTypes.Settled;
  };
  TokenDetails: undefined;
  TokenExplorer: undefined;
  WebView: {
    url: string;
    title?: string;
  };
};

export type AuthStackParamList = {
  Welcome: undefined;
  RecoveryPhrase: undefined;
  VerifyRecoveryPhrase: undefined;
  Network: undefined;
  RestoreWallet?: {network: Network};
};

export type MainBottomParamList = {
  WalletStack: undefined;
  Discover: undefined;
  SettingsStack: undefined;
};

export type SendTokenStackParamList = {
  SelectSendToken: undefined;
  SendToken: undefined;
  SendTokenConfirm: undefined;
};

export type ReceiveTokenStackParamList = {
  SelectReceiveToken: undefined;
  ReceiveToken: undefined;
};

export type WalletStackParamList = {
  Wallet: undefined;
  Tokens: undefined;
  SendTokenStack: undefined;
  ReceiveTokenStack: undefined;
};

export type SettingsParamList = {
  Settings: undefined;
  WalletList: undefined;
  WalletRegiser: undefined;
  WalletConnect: undefined;
  About: undefined;
  Security: undefined;
  General: undefined;
  Currency: undefined;
  SetPasscode: undefined;
  VerifyPasscode: {onVerified?: () => void};
  AutoLock: undefined;
};

export type StackParams = RootStackParamList &
  AuthStackParamList &
  MainStackParamList &
  MainBottomParamList &
  SettingsParamList &
  WalletStackParamList;

export interface SessionApprovalParams {
  proposal: SessionTypes.Proposal;
}
