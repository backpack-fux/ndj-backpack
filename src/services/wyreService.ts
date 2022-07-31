import axios, {AxiosInstance} from 'axios';

class WyreService {
  public accountId = 'AC_UFU3PMH3CJM';
  public network: 'testnet' | 'mainnet' = 'mainnet';
  public testAxiosInstance: AxiosInstance;
  public liveAxiosInstance: AxiosInstance;

  get axiosInstance() {
    return this.network === 'mainnet'
      ? this.liveAxiosInstance
      : this.testAxiosInstance;
  }

  constructor() {
    this.testAxiosInstance = axios.create({
      baseURL: 'https://api.testwyre.com',
      headers: {
        Authorization: 'Bearer TEST-SK-ANDHRMAN-MERGW863-YVYDGYJQ-XNCYQJ73',
      },
    });

    this.liveAxiosInstance = axios.create({
      baseURL: 'https://api.sendwyre.com',
      headers: {
        Authorization: 'Bearer SK-JDU478CL-7DFVHG66-EPWGT7EJ-TUM8ARME',
      },
    });
  }

  setNetwork(value: 'testnet' | 'mainnet') {
    this.network = value;
  }

  async reserve(destCurrency: string, dest: string, amount: number = 100) {
    const res = await this.axiosInstance.post('/v3/orders/reserve', {
      destCurrency,
      dest: `ethereum:${dest}`,
      amount: amount || 100,
      referrerAccountId: this.accountId,
      paymentMethod: 'debit-card',
    });

    return res.data;
  }
}

export const wyreService = new WyreService();
