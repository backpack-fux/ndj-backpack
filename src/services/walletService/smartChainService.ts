import {AxiosInstance} from '@app/apis/axios';
import {BSCSCAN, NetworkName} from '@app/constants';
import {ITransaction} from '@app/models';
import EthereumBaseService from './ethereumBaseService';

const provider =
  'https://bsc.getblock.io/mainnet/?api_key=16ffb800-e93c-43f4-be85-5946f8072ca3';

// const providerTest =
//   'https://bsc.getblock.io/testnet/?api_key=16ffb800-e93c-43f4-be85-5946f8072ca3';

const bscScanApiKey = 'SCSVGE76D5BYC94RI6F6AA3B8FPR5371RN';
const bscScanApi = BSCSCAN.mainnet;

export default class SmartChainService extends EthereumBaseService {
  constructor() {
    super(NetworkName.binanceSmartChain, provider);
  }

  async getTransactions(address: string, contractAddress?: string) {
    const params: any = {
      module: 'account',
      action: 'txlist',
      address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 10,
      sort: 'desc',
      apiKey: bscScanApiKey,
    };

    if (contractAddress) {
      // fetch BEP-20 transactions
      params.contractaddress = contractAddress;
      params.action = 'tokentx';
    }

    const {data} = await AxiosInstance.get(`${bscScanApi}`, {
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
        url: `https://bscscan.com/tx/${item.hash}`,
      });
    });

    return transactions;
  }
}
