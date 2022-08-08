import {NetworkName} from '@app/constants';
import axios, {AxiosInstance} from 'axios';
import {BncClient} from '@binance-chain/javascript-sdk';
import NP from 'number-precision';

import WalletService from './walletService';
import {ENSInfo, ITransaction} from '@app/models';
import moment from 'moment-timezone';

export default class BinanceService extends WalletService {
  baseURL = 'https://dex.binance.org';
  chain: 'testnet' | 'mainnet' = 'mainnet';
  testBaseURL = 'https://testnet-dex.binance.org';
  // net = 'mainnet';
  httpClientLive: AxiosInstance;
  httpClientTest: AxiosInstance;
  bnbClientLive: BncClient;
  bnbClientTest: BncClient;

  get httpClient() {
    return this.chain === 'mainnet' ? this.httpClientLive : this.httpClientTest;
  }

  get client() {
    return this.chain === 'mainnet' ? this.bnbClientLive : this.bnbClientTest;
  }

  constructor() {
    super(NetworkName.binance);
    WalletService.add(this);

    this.bnbClientTest = new BncClient(this.testBaseURL);
    this.bnbClientLive = new BncClient(this.baseURL);
    this.bnbClientLive.chooseNetwork('mainnet');
    this.bnbClientTest.chooseNetwork('testnet');
    this.httpClientLive = axios.create({
      baseURL: this.baseURL + '/api/v1',
    });
    this.httpClientTest = axios.create({
      baseURL: this.testBaseURL + '/api/v1',
    });
    this.bnbClientLive.initChain();
    this.bnbClientTest.initChain();
  }

  switchNetwork(chain: 'mainnet' | 'testnet') {
    this.chain = chain;
  }

  async generateKeys(mnemonic: string) {
    const live = this.bnbClientLive.recoverAccountFromMnemonic(mnemonic);

    const test = this.bnbClientTest.recoverAccountFromMnemonic(mnemonic);

    return {
      privateKey: live.privateKey,
      liveAddress: live.address,
      testAddress: test.address,
    };
  }

  async getBalance(account: string, address?: string) {
    // Todo: need to get it by once
    const res = await this.client.getBalance(account);
    const symbol = address || 'BNB';
    console.log(res);
    const data = res.find((item: any) => item.symbol === symbol);

    if (!data) {
      return 0;
    }

    return this.balance(data);
  }

  async balance(data: {
    free: string;
    frozen: string;
    locked: string;
    symbol: string;
  }) {
    return (
      Number(data.free || 0) +
      Number(data.frozen || 0) +
      Number(data.locked || 0)
    );
  }

  async transfer(
    privateKey: string,
    toAccount: string,
    amount: number,
    asset?: string,
    sendMax?: boolean,
  ): Promise<{transaction: any; fee: number}> {
    this.client.setPrivateKey(privateKey);
    const fromAddress = this.client.getClientKeyAddress(); // sender address string (e.g. bnb1...)

    if (!fromAddress) {
      throw new Error('Please init wallet');
    }

    const fee = 0.000075;

    let sendAmount = sendMax ? NP.strip(NP.minus(amount, fee)) : amount;
    const res = await this.httpClient.get(`/account/${fromAddress}/sequence`);
    const sequence = res.data.sequence || 0;

    const transaction = {
      fromAddress: fromAddress,
      toAddress: toAccount,
      amount: sendAmount,
      sequence,
      asset: asset || 'BNB',
      memo: '',
    };

    return {
      transaction,
      fee,
    };
  }

  async sendTransaction(privateKey: string, tx: any): Promise<void> {
    this.client.setPrivateKey(privateKey);

    const res = await this.client.transfer(
      tx.fromAddress,
      tx.toAddress,
      tx.amount,
      tx.asset,
      tx.memo,
      tx.sequence,
    );
    if (res.status !== 200) {
      throw new Error('Failed send transaction');
    }
  }

  async sign(privateKey: string, message: any) {
    this.client.setPrivateKey(privateKey);
    console.log(message);
  }

  async signTypedData(
    privateKey: string,
    domain: any,
    types: any,
    data: any,
  ): Promise<any> {
    this.client.setPrivateKey(privateKey);
    console.log(domain, types, data);
  }

  async signTransaction(privateKey: string, data: any): Promise<any> {
    this.client.setPrivateKey(privateKey);
    console.log(data);
  }

  async getTransactions(
    account: string,
    contractAddress: string,
    page: number,
    limit: number,
  ): Promise<ITransaction[]> {
    const endTime = new Date().getTime();
    const startTime = endTime - 90 * 24 * 60 * 60 * 1000; // 3 months is the max range
    const params = {
      address: account,
      txAsset: contractAddress,
      startTime: startTime,
      endTime: endTime,
      offset: (page - 1) * limit,
      limit,
      txType: 'TRANSFER',
    };
    const {data} = await this.httpClient.get('/transactions', {
      params,
    });

    const result = data?.tx || [];

    if (!result || typeof result === 'string' || !result.length) {
      return [];
    }

    const transactions: ITransaction[] = [];

    result.forEach((item: any) => {
      transactions.push({
        to: item.toAddr,
        from: item.fromAddr,
        type:
          item.fromAddr.toLowerCase() === account.toLowerCase() ? 'out' : 'in',
        fee: +item.txFee,
        timeStamp: moment(item.timeStamp).unix().toString(),
        status: 'success',
        value: +item.value,
        hash: item.txHash,
        nonce: item.nonce,
        url: `https://explorer.binance.org/tx/${item.txHash}`,
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
