import {AxiosInstance} from '@app/apis/axios';
import {NetworkName, POLYGONSCAN} from '@app/constants';
import {ITransaction} from '@app/models';
import EthereumBaseService from './ethereumBaseService';

const provider =
  'https://matic.getblock.io/mainnet/?api_key=16ffb800-e93c-43f4-be85-5946f8072ca3';

const polygonScanApiKey = 'RZ1XJFWNRYS1I89VDZFEFD8DHM32YS273X';
const polygonScanApi = POLYGONSCAN.mainnet;

export default class PolygonService extends EthereumBaseService {
  constructor() {
    super(NetworkName.polygon, provider);
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
      apiKey: polygonScanApiKey,
    };

    if (contractAddress) {
      // fetch ERC20 transactions
      params.contractaddress = contractAddress;
      params.action = 'tokentx';
    }

    const res = await AxiosInstance.get(`${polygonScanApi}`, {
      params,
    });

    const data = res.data;
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
        url: `https://polygonscan.com/tx/${item.hash}`,
      });
    });

    return transactions;
  }
}
