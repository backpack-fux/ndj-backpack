import {CoinsActionType} from './coinTypes';
import {WalletsActionType} from './walletsTypes';
export interface Action<T> {
  type: IActionType;
  payload: T;
}

export type IActionType = WalletsActionType | CoinsActionType;

export const ActionType = {
  ...WalletsActionType,
  ...CoinsActionType,
};
