import {Zilliqa} from '@zilliqa-js/zilliqa';
import * as zilUntils from '@zilliqa-js/util';
import * as zcrypto from '@zilliqa-js/crypto';
import {RPCMethod} from '@zilliqa-js/core';
import NP from 'number-precision';

import {NetworkName} from '@app/constants';
import WalletService from './walletService';
import BigNumber from 'bignumber.js';
import {TxStatus} from '@zilliqa-js/account';
import {ENSInfo, ITransaction} from '@app/models';
import {AxiosInstance} from '@app/apis/axios';

const MINIMUM_GAS_PRICE = '50';
const CHAIN_ID = 1; // 1 for Main Net, 333 for Test Net
const MSG_VERSION = 1; // current msgVersion

const viewblockUrl = 'https://api.viewblock.io/v2/zilliqa';
const viewblockKey =
  '501e39bde52f73754f62189ac6bab347881a392878d4855c9a9d0cdc1562cfd1';

export default class ZilliqaService extends WalletService {
  chain: 'mainnet' | 'testnet' = 'mainnet';
  zilApi: number;
  zilliqa: Zilliqa;
  constructor() {
    super(NetworkName.zilliqa);
    WalletService.add(this);
    this.zilApi = zilUntils.bytes.pack(CHAIN_ID, MSG_VERSION);
    this.zilliqa = new Zilliqa('https://api.zilliqa.com/');
  }

  switchNetwork(chain: 'mainnet' | 'testnet') {
    this.chain = chain;
    this.zilApi = zilUntils.bytes.pack(
      chain === 'mainnet' ? 1 : 333,
      MSG_VERSION,
    );
    this.zilliqa = new Zilliqa(
      chain === 'mainnet'
        ? 'https://api.zilliqa.com/'
        : 'https://dev-api.zilliqa.com',
    );
  }

  initWallet(privateKey: string): void {
    const address = zcrypto.getAddressFromPrivateKey(privateKey);
    const account = this.zilliqa.wallet.accounts[address];

    if (!account) {
      this.zilliqa.wallet.addByPrivateKey(privateKey);
    }

    this.zilliqa.wallet.setDefault(address);
  }

  async generateKeys(mnemonic: string) {
    const address = this.zilliqa.wallet.addByMnemonic(mnemonic, 0);
    this.zilliqa.wallet.setDefault(address);

    const account = this.zilliqa.wallet.defaultAccount;

    if (!account) {
      throw new Error('Can not register an zilliqa account');
    }

    return {
      testAddress: account.bech32Address,
      liveAddress: account.bech32Address,
      privateKey: account.privateKey,
    };
  }

  async getBalance(account: string, address?: string) {
    let balance = 0;
    try {
      const balanceObj = await this.zilliqa.blockchain.getBalance(
        zcrypto.fromBech32Address(address || account),
      );
      const qnBalance = balanceObj?.result?.balance ?? 0;
      balance = parseFloat(this.fromQa(qnBalance));
    } catch (e) {
      console.log('Error at getZilBalance', e);
    }

    return balance;
  }

  fromQa(amount: number | string = 0) {
    return zilUntils.units.fromQa(
      new zilUntils.BN(amount),
      zilUntils.units.Units.Zil,
    );
  }

  toQaFromZil(amount: number | string) {
    return zilUntils.units.toQa(amount, zilUntils.units.Units.Zil);
  }

  parseUnits(val: string, unit: number) {
    return new BigNumber(val).shiftedBy(unit).toString();
  }

  async transfer(
    privateKey: string,
    toAccount: string,
    amount: number,
    address?: string,
    sendMax?: boolean,
  ): Promise<{transaction: any; fee: number}> {
    await this.initWallet(privateKey);

    if (!address) {
      return this.transferZil(toAccount, amount, sendMax);
    }

    return this.transferZrc2(toAccount, amount, address, 18, sendMax);
  }

  async transferZil(toAccount: string, amount: number, sendMax?: boolean) {
    if (!this.zilliqa.wallet.defaultAccount?.address) {
      throw new Error('Please init your wallet');
    }

    const fromAddress = zcrypto.toBech32Address(
      this.zilliqa.wallet.defaultAccount.address,
    );
    const {gasLimit, gasPrice} = await this.getMinimumGasPrice();
    const fee = gasLimit * gasPrice;

    const zilBalance = await this.getBalance(fromAddress);

    let transferAmount = amount;
    if (sendMax) {
      transferAmount = NP.strip(NP.minus(zilBalance, fee));
    } else {
      const total = +fee + +amount;

      if (total > zilBalance) {
        throw new Error(
          `Insufficient funds. You need at least ${total} ZIL to make this transaction. You have ${zilBalance} ZIL on your account.`,
        );
      }
    }

    const transaction = this.zilliqa.transactions.new(
      {
        version: this.zilApi,
        toAddr: zcrypto.fromBech32Address(toAccount),
        amount: new zilUntils.BN(
          zilUntils.units.toQa(
            String(transferAmount),
            zilUntils.units.Units.Zil,
          ),
        ), // Sending an amount in Zil (1) and converting the amount to Qa
        gasPrice: new zilUntils.BN(
          zilUntils.units.toQa(gasPrice * 1000000, zilUntils.units.Units.Li),
        ),
        gasLimit: zilUntils.Long.fromNumber(gasLimit),
      },
      false,
    );

    return {
      transaction,
      fee: gasPrice,
    };
  }

  async transferZrc2(
    toAccount: string,
    amount: number,
    contractAddress: string,
    decimals: number = 18,
    sendMax?: boolean,
  ) {
    const {gasPrice, gasLimit} = await this.getZRC2MinimumGasPrice();
    const fee = gasLimit * gasPrice;
    const sendAmount = sendMax ? NP.strip(NP.minus(amount, fee)) : amount;
    const tokenAmount = this.parseUnits(sendAmount.toString(), +decimals);
    try {
      const data = {
        _tag: 'Transfer',
        params: [
          {
            vname: 'to',
            type: 'ByStr20',
            value: zcrypto.normaliseAddress(toAccount),
          },
          {
            vname: 'amount',
            type: 'Uint128',
            value: tokenAmount,
          },
        ],
      };

      const txPayload = {
        version: this.zilApi,
        amount: '0',
        gasPrice: this.toQaFromZil(gasPrice).toString(), // Minimum gasPrice varies. Check the `GetMinimumGasPrice` on the blockchain
        gasLimit: gasLimit.toString(),
        toAddr: contractAddress,
        data: JSON.stringify(data),
        toDs: false, //txParams.toDs || false,
      };

      const transaction = await this.createTransaction(txPayload);

      return {
        transaction,
        fee: gasPrice,
      };
    } catch (e) {
      console.log('Error at transferZrc2Token:', e);
      throw e;
    }
  }

  async createTransaction(txPayload: any) {
    const txParams: any = {
      ...txPayload,
      toAddr: zcrypto.normaliseAddress(txPayload.toAddr),
      version: this.zilApi,
      amount: new zilUntils.BN(txPayload.amount),
      gasPrice: new zilUntils.BN(txPayload.gasPrice),
      gasLimit: zilUntils.Long.fromValue(txPayload.gasLimit),
    };

    return this.zilliqa.transactions.new(txParams, txPayload.toDs, false);
  }

  async sendTransaction(privateKey: string, tx: any): Promise<void> {
    this.initWallet(privateKey);
    const signedTx = await this.zilliqa.wallet.sign(tx, false);

    const response = await this.zilliqa.provider.send(
      RPCMethod.CreateTransaction,
      {
        ...signedTx.txParams,
        priority: signedTx.toDS,
      },
    );

    if (response.error || !response.result) {
      throw response.error;
    }

    signedTx.id = response.result.TranID;
    signedTx.setStatus(TxStatus.Pending);

    const result: any = signedTx.payload;
    if (response.result.ContractAddress) {
      result.ContractAddress = response.result.ContractAddress;
    }

    result.id = response.result.TranID;
    return result;
  }

  async getMinimumGasPrice() {
    const gasprice = await this.zilliqa.blockchain.getMinimumGasPrice();
    return {
      gasPrice: Number(this.fromQa(gasprice.result)),
      gasLimit: Number(MINIMUM_GAS_PRICE),
      gasPriceRates: {
        average: Number(this.fromQa(gasprice.result)),
        fast: Number(this.fromQa(gasprice.result)) * 2,
        fantastic: Number(this.fromQa(gasprice.result)) * 3,
      },
    };
  }

  async getZRC2MinimumGasPrice() {
    const gasprice = await this.zilliqa.blockchain.getMinimumGasPrice();
    return {
      gasPrice: Number(this.fromQa(gasprice.result)),
      gasLimit: 9000,
      gasPriceRates: {
        average: Number(this.fromQa(gasprice.result)),
        fast: Number(this.fromQa(gasprice.result)) * 2,
        fantastic: Number(this.fromQa(gasprice.result)) * 3,
      },
    };
  }

  async sign(privateKey: string, message: string): Promise<any> {
    this.initWallet(privateKey);
    console.log(message);
  }

  async signTypedData(
    privateKey: string,
    domain: any,
    types: any,
    data: any,
  ): Promise<any> {
    this.initWallet(privateKey);
    console.log(domain, types, data);
  }

  async signTransaction(privateKey: string, data: any): Promise<any> {
    this.initWallet(privateKey);
    console.log(data);
  }

  async getTransactions(
    address: string,
    contractAddress: string | undefined,
    page: number,
  ): Promise<ITransaction[]> {
    const params: any = {
      network: this.chain,
      page,
      type: 'normal',
    };

    if (contractAddress) {
      params.type = 'tokens';
      params.token = contractAddress;
    }

    const {data} = await AxiosInstance.get(
      `${viewblockUrl}/addresses/${address}/txs`,
      {
        params: params,
        headers: {
          'X-APIKEY': viewblockKey,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!data.docs.length || typeof data.docs === 'string') {
      return [];
    }

    const transactions: ITransaction[] = [];

    data.docs.forEach((item: any) => {
      transactions.push({
        to: item.to,
        from: item.from,
        type: item.from.toLowerCase() === address.toLowerCase() ? 'out' : 'in',
        fee: +this.fromQa(item.fee),
        timeStamp: item.timestamp,
        status: item.receiptSuccess,
        value: +this.fromQa(item.value),
        hash: item.hash,
        nonce: item.nonce,
        url: `https://viewblock.io/zilliqa/tx/${item.hash}?network=${this.chain}`,
      });
    });

    return transactions;
  }

  async getENSInfo(address: string): Promise<ENSInfo | null | undefined> {
    return {
      name: address,
    };
  }
}
