import {ERC20_ABI, NetworkName} from '@app/constants';
import * as ethers from 'ethers';
import WalletService from './walletService';
import Web3 from 'web3';
import {TransactionConfig, TransactionReceipt} from 'web3-core';
import {ENSInfo, ITransaction} from '@app/models';
import {JsonRpcProvider} from '@ethersproject/providers';

export default class EthereumBaseService extends WalletService {
  chain: 'mainnet' | 'testnet' = 'mainnet';
  web3: Web3;
  ethers: JsonRpcProvider;
  ens: any;

  constructor(network: NetworkName, provider: string) {
    super(network);
    WalletService.add(this);
    this.web3 = new Web3(provider);
    this.ethers = new ethers.providers.InfuraProvider(
      'homestead',
      'cd5b0778994b4e34b166f2569a1166c0',
    );
  }

  switchNetwork(chain: 'mainnet' | 'testnet'): void {
    console.log(chain);
  }

  async generateKeys(mnemonic: string) {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    const {_signingKey} = wallet;
    const res = _signingKey();
    const ensInfo = await this.getENSInfo(wallet.address);

    return {
      testAddress: wallet.address,
      liveAddress: wallet.address,
      privateKey: res.privateKey,
      ensInfo,
    };
  }

  async getBalance(account: string, address?: string) {
    let balance = '0';
    if (address) {
      const contract = new this.web3.eth.Contract(ERC20_ABI, address);
      balance = await contract.methods.balanceOf(account).call();
    } else {
      balance = await this.web3.eth.getBalance(account);
    }

    return Number(this.web3.utils.fromWei(balance, 'ether'));
  }

  async getAllowance() {}

  async transfer(
    privateKey: string,
    toAccount: string,
    amount: number,
    contractAddress?: string,
    sendMax?: boolean,
  ): Promise<{transaction: any; fee: number}> {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);

    let qty = this.web3.utils.toWei(amount.toString(), 'ether');
    const nonce = await this.web3.eth.getTransactionCount(account.address);
    let hexNonce = this.web3.utils.toHex(nonce);
    const gasPrice = await this.web3.eth.getGasPrice();

    if (!contractAddress) {
      const gasLimit = this.web3.utils.toBN('100000');
      const estimatedFee = this.web3.utils.toBN(gasPrice).mul(gasLimit);

      if (sendMax) {
        qty = this.web3.utils
          .toBN(qty)
          .sub(estimatedFee.mul(this.web3.utils.toBN(2)))
          .toString();
      }
      const tx = {
        from: account.address,
        to: toAccount,
        value: qty,
        nonce: hexNonce,
        gasLimit: this.web3.utils.toHex(gasLimit),
        gasPrice: this.web3.utils.toHex(gasPrice),
      };
      return {
        transaction: tx,
        fee: Number(this.web3.utils.fromWei(estimatedFee)),
      };
    }

    const contract = new this.web3.eth.Contract(ERC20_ABI, contractAddress);

    let transferFunc = contract.methods.transfer(
      toAccount,
      this.web3.utils.toHex(qty),
    );
    let estimatedGas = await transferFunc.estimateGas({
      from: account.address,
    });
    let estimatedFee = this.web3.utils
      .toBN(gasPrice)
      .mul(this.web3.utils.toBN(estimatedGas));

    if (sendMax) {
      qty = this.web3.utils
        .toBN(qty)
        .sub(estimatedFee.mul(this.web3.utils.toBN(2)))
        .toString();

      transferFunc = contract.methods.transfer(
        toAccount,
        this.web3.utils.toHex(qty),
      );
      estimatedGas = await transferFunc.estimateGas({
        from: account.address,
      });

      estimatedFee = this.web3.utils
        .toBN(gasPrice)
        .mul(this.web3.utils.toBN(estimatedGas));
    }

    const data = transferFunc.encodeABI();
    const tx = {
      from: account.address,
      nonce: hexNonce,
      to: contractAddress,
      gasPrice: this.web3.utils.toHex(gasPrice),
      gasLimit: this.web3.utils.toHex(estimatedGas),
      value: '0x0',
      data,
    };

    return {
      transaction: tx,
      fee: Number(this.web3.utils.fromWei(estimatedFee)),
    };
  }
  async sendTransaction(privateKey: string, tx: any): Promise<string> {
    const rawTransaction = await this.signTransaction(privateKey, tx);

    if (!rawTransaction) {
      throw new Error('Can not sign transaction');
    }

    const receipt: TransactionReceipt = await new Promise((resolve, reject) => {
      this.web3.eth
        .sendSignedTransaction(rawTransaction)
        .on('transactionHash', function (txHash) {
          console.log(txHash);
        })
        .on('receipt', function (res) {
          console.log('receipt:' + res);
          resolve(res);
        })
        .on('error', function (error) {
          console.log('err', error);
          reject(error);
        });
    });

    return receipt.transactionHash;
  }

  async sign(privateKey: string, message: string) {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);

    const res = await account.sign(message);

    return res.signature;
  }

  async signTypedData(
    privateKey: string,
    domain: any,
    types: any,
    data: any,
  ): Promise<any> {
    const wallet = new ethers.Wallet(privateKey);

    return wallet._signTypedData(domain, types, data);
  }

  async signTransaction(privateKey: string, data: TransactionConfig) {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);

    const res = await account.signTransaction(data);

    return res.rawTransaction;
  }

  async getTransactions(
    account: string,
    contractAddress: string | undefined,
    page: number,
    limit: number,
  ): Promise<ITransaction[]> {
    console.log(account, contractAddress, page, limit);
    return [];
  }

  async getENSInfo(address: string): Promise<ENSInfo | null | undefined> {
    return {
      name: address,
    };
  }
}
