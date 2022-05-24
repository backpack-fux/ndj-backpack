import {AxiosInstance} from '@app/apis/axios';
import {ETHERSCAN, NetworkName} from '@app/constants';
import {ENSInfo, ITransaction} from '@app/models';
import Web3 from 'web3';
import EthereumBaseService from './ethereumBaseService';

const provider =
  'https://eth.getblock.io/mainnet/?api_key=16ffb800-e93c-43f4-be85-5946f8072ca3';

const testnetProvider =
  'https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';

const etherscanApiKey = 'I39JN6BK9Q2FDWZIG3U5EDF2XDI12X97M4';

export default class EthereumService extends EthereumBaseService {
  etherScanApi = ETHERSCAN.mainnet;

  constructor() {
    super(NetworkName.ethereum, provider);
  }

  switchNetwork(chain: 'mainnet' | 'testnet') {
    this.etherScanApi =
      chain === 'mainnet' ? ETHERSCAN.mainnet : ETHERSCAN.kovan;
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

    if (contractAddress) {
      // fetch ERC20 transactions
      params.contractaddress = contractAddress;
      params.action = 'tokentx';
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
        value: Number(this.web3.utils.fromWei(item.value, 'ether')),
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
