import {EIP155_SIGNING_METHODS} from '@app/constants/EIP155Data';
import {Wallet} from '@app/models';
import {WalletService} from '@app/services';
import {formatJsonRpcError, formatJsonRpcResult} from '@json-rpc-tools/utils';
import {SignClientTypes} from '@walletconnect/types';
import {ERROR} from '@walletconnect/utils';
import {getNetworkByChain} from './index';
import {
  getPrivateKeyByParams,
  getSignParamsMessage,
  getSignTypedDataParamsData,
} from './HelperUtil';

export async function approveEIP155Request(
  event: SignClientTypes.EventArguments['session_request'],
  wallets: Wallet[],
  network: string,
): Promise<any> {
  const {params, id} = event;
  const {request, chainId} = params;
  const networkName = chainId && getNetworkByChain(chainId, network);
  const privateKey = getPrivateKeyByParams(wallets, request.params);
  const service = networkName && WalletService.getServiceByNetwork(networkName);

  if (!service || !privateKey) {
    throw new Error(ERROR.MISSING_OR_INVALID.format().message);
  }

  switch (request.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      const message = getSignParamsMessage(request.params);
      const signedMessage = await service.sign(privateKey, message);
      return formatJsonRpcResult(id, signedMessage);
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      const {
        domain,
        types,
        message: data,
      } = getSignTypedDataParamsData(request.params);
      // https://github.com/ethers-io/ethers.js/issues/687#issuecomment-714069471
      delete types.EIP712Domain;
      const signedData = await service.signTypedData(
        privateKey,
        domain,
        types,
        data,
      );
      return formatJsonRpcResult(id, signedData);
    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      const hash = await service.sendTransaction(privateKey, request.params[0]);
      return formatJsonRpcResult(id, hash);
    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      const signature = await service.signTransaction(
        privateKey,
        request.params[0],
      );
      return formatJsonRpcResult(id, signature);
    default:
      throw new Error(ERROR.UNKNOWN_JSONRPC_METHOD.format().message);
  }
}

export function rejectEIP155Request(
  request: SignClientTypes.EventArguments['session_request'],
) {
  const {id} = request;

  return formatJsonRpcError(
    id,
    ERROR.JSONRPC_REQUEST_METHOD_REJECTED.format().message,
  );
}
