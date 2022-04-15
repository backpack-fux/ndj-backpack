import {CoinsReducerType} from '@app/store/coins/coinsReducer';
import {WalletsReducerType} from '@app/store/wallets/walletsReducer';

export interface RootState {
  wallets: WalletsReducerType;
  coins: CoinsReducerType;
}
