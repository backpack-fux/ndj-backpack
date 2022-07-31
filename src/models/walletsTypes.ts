import {NetworkName} from '@app/constants';

export enum WalletsActionType {
  INIT_STORE = 'persist/REHYDRATE',
  RELOAD = 'RELOAD',
  LOADING = 'LOADING',
  READY = 'READY',
  SET_IS_READ_FIELD_GUIDE = 'wallets/SET_IS_READ_FIELD_GUIDE',
  SET_MNEMONIC = 'wallets/MNEMONIC',
  CREATE_WALLET = 'wallets/CREATE_WALLET',
  CREATE_DEFAULT_WALLETS = 'wallets/CREATE_DEFAULT_WALLETS',
  ADD_WALLET = 'wallets/ADD_WALLET',
  DELETE_WALLET = 'wallets/DELETE_WALLET',
  SET_WALLETS = 'wallets/SET_WALLETS',
  SELECT_WALLET = 'WALLETS/SELECT_WALLET',
  SET_WALLET_SESSIONS = 'WALLETS/SET_WALLET_SESSIONS',
  SET_CURRENCY = 'WALLETS/SET_CURRENCY',
  REFRESH_WALLETS = 'WALLETS/REFRESH_WALLETS',
  SWITCH_NETWORK = 'WALLETS/SWITCH_NETWORK',
  RENAME_WALLET = 'WALLETS/RENAME_WALLET',
}

export interface Wallet {
  id: string;
  name: string;
  mnemonic: string;
  wallets: WalletItem[];
  network?: NetworkName;
}

export class WalletItem {
  public isTestNet: boolean = false;
  constructor(
    public network: NetworkName,
    public liveAddress: string,
    public testAddress: string,
    public privateKey: string,
    public ensInfo?: ENSInfo | null,
  ) {}

  get address() {
    return this.isTestNet ? this.testAddress : this.liveAddress;
  }

  setIsTestNet(value: boolean) {
    this.isTestNet = value;
  }
}

export interface ENSInfo {
  name: string;
  avatar?: string | null;
}
