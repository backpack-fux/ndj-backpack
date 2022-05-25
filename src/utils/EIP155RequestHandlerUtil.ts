import {EIP155_SIGNING_METHODS} from '@app/constants/EIP155Data';
import {Wallet} from '@app/models';
import {WalletService} from '@app/services';
import {formatJsonRpcError, formatJsonRpcResult} from '@json-rpc-tools/utils';
import {RequestEvent} from '@walletconnect/types';
import {ERROR} from '@walletconnect/utils';
import {getNetworkByChain} from './index';
import {
  getPrivateKeyByParams,
  getSignParamsMessage,
  getSignTypedDataParamsData,
} from './HelperUtil';

export async function approveEIP155Request(
  event: RequestEvent,
  wallets: Wallet[],
  network: string,
): Promise<any> {
  const {method, params, id} = event.request;
  const {chainId} = event;
  const networkName = chainId && getNetworkByChain(chainId, network);
  const privateKey = getPrivateKeyByParams(wallets, params);
  const service = networkName && WalletService.getServiceByNetwork(networkName);

  if (!service || !privateKey) {
    throw new Error(ERROR.MISSING_OR_INVALID.format().message);
  }

  switch (method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      const message = getSignParamsMessage(params);
      const signedMessage = await service.sign(privateKey, message);
      return formatJsonRpcResult(id, signedMessage);
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      console.log('params', params);
      const data = getSignTypedDataParamsData(params);
      const signedData = await service.sign(privateKey, JSON.stringify(data));
      return formatJsonRpcResult(id, signedData);
    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      const hash = await service.sendTransaction(privateKey, params[0]);
      return formatJsonRpcResult(id, hash);
    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      const signature = await service.signTransaction(privateKey, params[0]);
      return formatJsonRpcResult(id, signature);
    default:
      throw new Error(ERROR.UNKNOWN_JSONRPC_METHOD.format().message);
  }
}

export function rejectEIP155Request(request: RequestEvent['request']) {
  const {id} = request;

  return formatJsonRpcError(
    id,
    ERROR.JSONRPC_REQUEST_METHOD_REJECTED.format().message,
  );
}
