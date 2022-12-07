import {AxiosInstance} from '@app/apis/axios';
import {ERC20_ABI, NetworkName, POLYGONSCAN} from '@app/constants';
import {ITransaction} from '@app/models';
import Web3 from 'web3';
import EthereumBaseService from './ethereumBaseService';
import BigNumber from 'bignumber.js';

const provider =
  'https://polygon-mainnet.g.alchemy.com/v2/x1H0fwRdSlnzqXHcio6LF3zQP6kK1fk5';
const testnetProvider =
  'https://polygon-mumbai.g.alchemy.com/v2/ZvYDLoMGpRw9OVSL7-xYVj-0nMWF4_dk';

const polygonScanApiKey = 'RZ1XJFWNRYS1I89VDZFEFD8DHM32YS273X';

export default class PolygonService extends EthereumBaseService {
  polygonScanApi = POLYGONSCAN.mainnet;
  constructor() {
    super(NetworkName.polygon, provider);
  }

  switchNetwork(chain: 'mainnet' | 'testnet') {
    this.polygonScanApi =
      chain === 'mainnet' ? POLYGONSCAN.mainnet : POLYGONSCAN.testnet;
    const web3Provider = chain === 'mainnet' ? provider : testnetProvider;

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

    let decimals = 18;

    if (contractAddress) {
      // fetch ERC20 transactions
      params.contractaddress = contractAddress;
      params.action = 'tokentx';

      const contract = new this.web3.eth.Contract(ERC20_ABI, contractAddress);

      const decimalsString = await contract.methods.decimals().call();
      if (decimalsString) {
        decimals = Number(decimalsString);
      }
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
        value: new BigNumber(item.value).div(Math.pow(10, decimals)).toNumber(),
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
