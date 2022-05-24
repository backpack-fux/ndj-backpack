import {AxiosInstance} from '@app/apis/axios';
import {NetworkName, POLYGONSCAN} from '@app/constants';
import {ITransaction} from '@app/models';
import Web3 from 'web3';
import EthereumBaseService from './ethereumBaseService';

const provider =
  'https://matic.getblock.io/mainnet/?api_key=16ffb800-e93c-43f4-be85-5946f8072ca3';

const polygonScanApiKey = 'RZ1XJFWNRYS1I89VDZFEFD8DHM32YS273X';

export default class PolygonService extends EthereumBaseService {
  polygonScanApi = POLYGONSCAN.mainnet;
  constructor() {
    super(NetworkName.polygon, provider);
  }

  switchNetwork(chain: 'mainnet' | 'testnet') {
    this.polygonScanApi =
      chain === 'mainnet' ? POLYGONSCAN.mainnet : POLYGONSCAN.testnet;
    const web3Provider = `https://matic.getblock.io/${chain}/?api_key=16ffb800-e93c-43f4-be85-5946f8072ca3`;

    this.chain = chain;
    this.web3 = new Web3(web3Provider);
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
      apiKey: polygonScanApiKey,
    };

    if (contractAddress) {
      // fetch ERC20 transactions
      params.contractaddress = contractAddress;
      params.action = 'tokentx';
    }

    const res = await AxiosInstance.get(`${this.polygonScanApi}`, {
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
        url: `https://${
          this.chain === 'testnet' ? 'mumbai.' : ''
        }polygonscan.com/tx/${item.hash}`,
      });
    });

    return transactions;
  }
}
