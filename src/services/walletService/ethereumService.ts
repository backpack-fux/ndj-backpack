import {AxiosInstance} from '@app/apis/axios';
import {NetworkName} from '@app/constants/enums';
import {ENSInfo} from '@app/models/ensInfo';
import {ITransaction} from '@app/models/transaction';
import {ERC20_ABI} from '@app/constants/abis';
import {ETHERSCAN} from '@app/constants/scanApis';

import Web3 from 'web3';
import EthereumBaseService from './ethereumBaseService';
import BigNumber from 'bignumber.js';

const provider =
  'https://eth-mainnet.g.alchemy.com/v2/kBcC8Z-BvucnXj214rdY6L8FCzBZf_Y0';
const testnetProvider =
  'https://eth-goerli.g.alchemy.com/v2/CLAjd7FD3JAHPZwBfVDHrGc6lF_czNWu';

const etherscanApiKey = 'I39JN6BK9Q2FDWZIG3U5EDF2XDI12X97M4';

export default class EthereumService extends EthereumBaseService {
  etherScanApi = ETHERSCAN.mainnet;

  constructor() {
    super(NetworkName.ethereum, provider);
  }

  switchNetwork(chain: 'mainnet' | 'testnet') {
    this.etherScanApi =
      chain === 'mainnet' ? ETHERSCAN.mainnet : ETHERSCAN.goerli;
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
      apiKey: etherscanApiKey,
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

    const {data} = await AxiosInstance.get(`${this.etherScanApi}`, {
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
          this.chain === 'testnet' ? 'kovan.' : ''
        }etherscan.io/tx/${item.hash}`,
      });
    });

    return transactions;
  }

  async getENSInfo(address: string): Promise<ENSInfo | null | undefined> {
    const name = await this.ethers.lookupAddress(address);

    if (!name) {
      return {
        name: address,
      };
    }

    const avatar = await this.ethers.getAvatar(address);

    return {
      name,
      avatar,
    };
  }
}
