import {AxiosInstance} from '@app/apis/axios';
import {BSCSCAN, ERC20_ABI, NetworkName} from '@app/constants';
import {ITransaction} from '@app/models';
import Web3 from 'web3';
import EthereumBaseService from './ethereumBaseService';
import BigNumber from 'bignumber.js';

const provider =
  'https://bsc.getblock.io/mainnet/?api_key=16ffb800-e93c-43f4-be85-5946f8072ca3';

const bscScanApiKey = 'SCSVGE76D5BYC94RI6F6AA3B8FPR5371RN';

export default class SmartChainService extends EthereumBaseService {
  bscScanApi = BSCSCAN.mainnet;
  constructor() {
    super(NetworkName.binanceSmartChain, provider);
  }

  switchNetwork(chain: 'mainnet' | 'testnet') {
    this.bscScanApi = chain === 'mainnet' ? BSCSCAN.mainnet : BSCSCAN.testnet;
    const web3Provider = `https://bsc.getblock.io/${chain}/?api_key=16ffb800-e93c-43f4-be85-5946f8072ca3`;

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
      apiKey: bscScanApiKey,
    };

    let decimals = 18;

    if (contractAddress) {
      // fetch BEP-20 transactions
      params.contractaddress = contractAddress;
      params.action = 'tokentx';

      const contract = new this.web3.eth.Contract(ERC20_ABI, contractAddress);

      const decimalsString = await contract.methods.decimals().call();
      if (decimalsString) {
        decimals = Number(decimalsString);
      }
    }

    const {data} = await AxiosInstance.get(`${this.bscScanApi}`, {
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
