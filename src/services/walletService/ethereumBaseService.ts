import {ERC20_ABI, NetworkName} from '@app/constants';
import * as ethers from 'ethers';
import * as bip39 from 'bip39';
import {hdkey} from 'ethereumjs-wallet';
import WalletService from './walletService';
import Web3 from 'web3';
import {TransactionConfig, TransactionReceipt} from 'web3-core';
import {ENSInfo, ITransaction, Token} from '@app/models';
import {JsonRpcProvider} from '@ethersproject/providers';
import BigNumber from 'bignumber.js';
import {getNativeToken} from '@app/utils';

const generatedKeys: any = {};

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
    if (generatedKeys[mnemonic]) {
      return generatedKeys[mnemonic];
    }

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const hdNode = hdkey.fromMasterSeed(seed);
    const node = hdNode.derivePath("m/44'/60'/0'");
    // m/44'/60'/0'/0
    const change = node.deriveChild(0);
    // m/44'/60'/0'/0/{N}
    const childNode = change.deriveChild(0);
    const childWallet = childNode.getWallet();
    const wallet = new ethers.Wallet(
      childWallet.getPrivateKey().toString('hex'),
    );

    const data = {
      testAddress: wallet.address,
      liveAddress: wallet.address,
      privateKey: wallet.privateKey,
    };

    generatedKeys[mnemonic] = data;

    return data;
  }

  async getBalance(account: string, address?: string) {
    let balance = '0';
    let decimals = 18;

    if (address) {
      const contract = new this.web3.eth.Contract(ERC20_ABI, address);
      balance = await contract.methods.balanceOf(account).call();
      try {
        const decimalsString = await contract.methods.decimals().call();
        if (decimalsString) {
          decimals = Number(decimalsString);
        }
      } catch (err) {}
    } else {
      balance = await this.web3.eth.getBalance(account);
    }

    return new BigNumber(balance).div(Math.pow(10, decimals)).toNumber();
  }

  async getAllowance() {}

  async transfer(
    privateKey: string,
    toAccount: string,
    amount: number,
    token: Token,
    sendMax?: boolean,
  ): Promise<{transaction: any; fee: number}> {
    if (!this.web3.utils.isAddress(toAccount)) {
      throw new Error('Invalid address');
    }

    if (token.contractAddress) {
      return this.transferERC20(privateKey, toAccount, amount, token);
    }

    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    let qty = this.web3.utils.toWei(amount.toString(), 'ether');
    const nonce = await this.web3.eth.getTransactionCount(account.address);
    let hexNonce = this.web3.utils.toHex(nonce);
    const gasPrice = await this.web3.eth.getGasPrice();

    const gasLimit = this.web3.utils.toBN('100000');
    const estimatedFee = this.web3.utils
      .toBN(gasPrice)
      .mul(gasLimit)
      .mul(this.web3.utils.toBN(2));

    if (sendMax) {
      qty = this.web3.utils.toBN(qty).sub(estimatedFee).toString();
    }

    const total = this.web3.utils.toBN(qty).add(estimatedFee);
    const balance = await this.web3.eth.getBalance(account.address);

    if (total.gt(this.web3.utils.toBN(balance))) {
      throw new Error(
        `Insufficient funds. You need at least ${this.web3.utils.fromWei(
          total,
        )} ${token.symbol.toUpperCase()} to make this transaction. You have ${this.web3.utils.fromWei(
          balance,
        )} ${token.symbol.toUpperCase()} on your account.`,
      );
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

  async transferERC20(
    privateKey: string,
    toAccount: string,
    amount: number,
    token: Token,
  ) {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    const contract = new this.web3.eth.Contract(
      ERC20_ABI,
      token.contractAddress,
    );

    const gasPrice = await this.web3.eth.getGasPrice();
    const nonce = await this.web3.eth.getTransactionCount(account.address);
    let hexNonce = this.web3.utils.toHex(nonce);

    const decimalsString = await contract.methods.decimals().call();
    const decimals = Number(decimalsString);

    let qty = new BigNumber(amount).times(Math.pow(10, decimals)).toString();
    const tokenBalance = await contract.methods
      .balanceOf(account.address)
      .call();

    if (this.web3.utils.toBN(qty).gt(this.web3.utils.toBN(tokenBalance))) {
      throw new Error(
        `Insufficient funds. You need at least ${new BigNumber(qty)
          .div(Math.pow(10, decimals))
          .toString()} ${token.symbol.toUpperCase()} to make this transaction. You have ${new BigNumber(
          tokenBalance,
        )
          .div(Math.pow(10, decimals))
          .toString()} ${token.symbol.toUpperCase()} on your account.`,
      );
    }

    const transferFunc = contract.methods.transfer(
      toAccount,
      this.web3.utils.toHex(qty),
    );

    const estimatedGas = await transferFunc.estimateGas({
      from: account.address,
    });

    const estimatedFee = this.web3.utils
      .toBN(gasPrice)
      .mul(this.web3.utils.toBN(estimatedGas))
      .mul(this.web3.utils.toBN(2))
      .toString();

    const nativeTokenBalance = await this.web3.eth.getBalance(account.address);
    const nativeToken = getNativeToken(token);

    if (
      this.web3.utils
        .toBN(estimatedFee)
        .gt(this.web3.utils.toBN(nativeTokenBalance))
    ) {
      throw new Error(
        `Insufficient funds for fee. You need at least ${this.web3.utils.fromWei(
          estimatedFee,
        )} ${nativeToken?.symbol.toUpperCase()} to make this transaction. You have ${this.web3.utils.fromWei(
          nativeTokenBalance,
        )} ${nativeToken?.symbol.toUpperCase()} on your account.`,
      );
    }

    const data = transferFunc.encodeABI();
    const tx = {
      from: account.address,
      nonce: hexNonce,
      to: token.contractAddress,
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

  async sendTransaction(
    privateKey: string,
    tx: any,
    waitReceipt?: boolean,
  ): Promise<string> {
    const rawTransaction = await this.signTransaction(privateKey, tx);

    if (!rawTransaction) {
      throw new Error('Can not sign transaction');
    }

    const transactionHash: string = await new Promise((resolve, reject) => {
      this.web3.eth
        .sendSignedTransaction(rawTransaction)
        .on('transactionHash', function (txHash) {
          console.log('transactionHash', txHash);
          if (!waitReceipt) {
            resolve(txHash);
          }
          console.log(txHash);
        })
        .on('receipt', function (res) {
          console.log('receipt:' + res);
          if (waitReceipt) {
            resolve(res.transactionHash);
          }
        })
        .on('error', function (error) {
          console.log('err', error);
          reject(error);
        });
    });

    return transactionHash;
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
