import {SignClientTypes} from '@walletconnect/types';
import {SOLANA_SIGNING_METHODS} from '@app/constants/SolanaData';
import {getPrivateKeyByParams} from './HelperUtil';
import {Wallet} from '@app/models';
import {formatJsonRpcError, formatJsonRpcResult} from '@json-rpc-tools/utils';
import {getInternalError, getSdkError} from '@walletconnect/utils';
import {WalletService} from '@app/services';
import {NetworkName} from '@app/constants';

export async function approveSolanaRequest(
  requestEvent: SignClientTypes.EventArguments['session_request'],
  wallets: Wallet[],
) {
  const {params, id} = requestEvent;
  const {request} = params;
  const privateKey = getPrivateKeyByParams(wallets, params);
  const service = WalletService.getServiceByNetwork(NetworkName.solana);

  if (!service || !privateKey) {
    throw new Error(getInternalError('MISSING_OR_INVALID').message);
  }
  console.log('request.method', request.method);
  switch (request.method) {
    case SOLANA_SIGNING_METHODS.SOLANA_SIGN_MESSAGE:
      const signedMessage = await service.sign(
        privateKey,
        request.params.message,
      );
      return formatJsonRpcResult(id, signedMessage);

    case SOLANA_SIGNING_METHODS.SOLANA_SIGN_TRANSACTION:
      const signature = await service.signTransaction(privateKey, {
        feePayer: request.params.feePayer,
        recentBlockhash: request.params.recentBlockhash,
        instructions: request.params.instructions,
      });

      return formatJsonRpcResult(id, {signature});

    default:
      throw new Error(getSdkError('INVALID_METHOD').message);
  }
}

export function rejectSolanaRequest(
  request: SignClientTypes.EventArguments['session_request'],
) {
  const {id} = request;

  return formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message);
}
