import {AxiosInstance} from '@app/apis/axios';
import {NetworkName} from '@app/constants/enums';
import {ITransaction} from '@app/models/transaction';
import {ERC20_ABI} from '@app/constants/abis';
import {SNOWTRACEAPI} from '@app/constants/scanApis';
import Web3 from 'web3';
import EthereumBaseService from './ethereumBaseService';
import BigNumber from 'bignumber.js';

const provider =
  'https://avalanche-mainnet.infura.io/v3/cd5b0778994b4e34b166f2569a1166c0';
const testnetProvider =
  'https://avalanche-fuji.infura.io/v3/cd5b0778994b4e34b166f2569a1166c0';

const snowtraceApiKey = 'Y2ZPMDCC4URW9A4CCBZIRTVII159HEQG2H';

export default class AvalancheService extends EthereumBaseService {
  snowtraceApi = SNOWTRACEAPI.mainnet;
  constructor() {
    super(NetworkName.avalanche, provider);
  }

  switchNetwork(chain: 'mainnet' | 'testnet') {
    this.snowtraceApi =
      chain === 'mainnet' ? SNOWTRACEAPI.mainnet : SNOWTRACEAPI.testnet;
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
      apiKey: snowtraceApiKey,
    };

    let decimals = 18;

    if (contractAddress) {
      // fetch ERC-20 transactions
      params.contractaddress = contractAddress;
      params.action = 'tokentx';

      const contract = new this.web3.eth.Contract(ERC20_ABI, contractAddress);

      const decimalsString = await contract.methods.decimals().call();
      if (decimalsString) {
        decimals = Number(decimalsString);
      }
    }

    const {data} = await AxiosInstance.get(`${this.snowtraceApi}`, {
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
        value: new BigNumber(item.value).div(Math.pow(10, decimals)).toNumber(),
        timeStamp: item.timeStamp,
        nonce: item.nonce,
        index: item.transactionIndex,
        type: item.from.toLowerCase() === address.toLowerCase() ? 'out' : 'in',
        status: item.status,
        url: `https://${
          this.chain === 'testnet' ? 'testnet.' : ''
        }bscscan.com/tx/${item.hash}`,
      });
    });

    return transactions;
  }
}
