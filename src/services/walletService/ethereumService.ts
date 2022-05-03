import {AxiosInstance} from '@app/apis/axios';
import {ETHERSCAN, NetworkName} from '@app/constants';
import {ITransaction} from '@app/models';
import EthereumBaseService from './ethereumBaseService';

const provider =
  'https://eth.getblock.io/mainnet/?api_key=16ffb800-e93c-43f4-be85-5946f8072ca3';

const etherscanApiKey = 'I39JN6BK9Q2FDWZIG3U5EDF2XDI12X97M4';
const etherScanApi = ETHERSCAN.mainnet;

export default class EthereumService extends EthereumBaseService {
  constructor() {
    super(NetworkName.ethereum, provider);
  }

  async getTransactions(
    address: string,
    contractAddress: string | undefined,
    page: number,
    limit: number,
  ) {
    const params: any = {
      module: 'account',
      action: 'txlist',
      address,
      startblock: 0,
      endblock: 99999999,
      page,
      offset: limit,
      sort: 'desc',
      apiKey: etherscanApiKey,
    };

    if (contractAddress) {
      // fetch ERC20 transactions
      params.contractaddress = contractAddress;
      params.action = 'tokentx';
    }

    const {data} = await AxiosInstance.get(`${etherScanApi}`, {
      params,
    });

    const result = data?.result;
    if (!result || !result.length || typeof result === 'string') {
      return [];
    }

    const transactions: ITransaction[] = [];

    result.forEach((item: any) => {
      transactions.push({
        blockNumber: item.blockNumber,
        blockHash: item.blockHash,
        hash: item.hash,
        from: item.from,
        to: item.to,
        fee: Number(this.web3.utils.fromWei(item.gasUsed, 'ether')),
        value: Number(this.web3.utils.fromWei(item.value, 'ether')),
        timeStamp: item.timeStamp,
        nonce: item.nonce,
        index: item.transactionIndex,
        type: item.from.toLowerCase() === address.toLowerCase() ? 'out' : 'in',
        status: item.status,
        url: `https://etherscan.io/tx/${item.hash}`,
      });
    });

    return transactions;
  }
}
