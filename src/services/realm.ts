import {BaseCoin} from '@app/models';
import Realm from 'realm';

const baseCoinSchema = {
  name: 'baseCoins',
  properties: {
    key: 'string',
    id: 'string',
    name: 'string',
    symbol: 'string',
    contractAddress: 'string',
    network: 'string',
  },
  primaryKey: 'key',
};

class RealmService {
  realm?: any;

  baseCoins: any;

  constructor() {
    this.init();
  }

  async init() {
    try {
      this.realm = await Realm.open({
        schema: [baseCoinSchema],
      });
      this.baseCoins = this.realm.objects('baseCoins');
    } catch (err) {
      console.log('init error', err);
    }
  }

  async setBaseCoins(baseCoins: BaseCoin[]) {
    try {
      if (!this.realm) {
        await this.init();
      }

      this.realm.write(() => {
        for (const baseCoin of baseCoins) {
          const record = this.baseCoins.filtered(
            `key == '${baseCoin.id}_${baseCoin.network}'`,
          )[0];

          if (record) {
            record.name = baseCoin.name;
            record.symbol = baseCoin.symbol;
            record.contractAddress = baseCoin.contractAddress;
          } else {
            this.realm.create('baseCoins', {
              key: `${baseCoin.id}_${baseCoin.network}`,
              id: baseCoin.id,
              name: baseCoin.name,
              symbol: baseCoin.symbol,
              contractAddress: baseCoin.contractAddress,
              network: baseCoin.network,
            });
          }
        }
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getBaseCoins(): Promise<BaseCoin[]> {
    try {
      const cats = this.realm.objects('baseCoins');

      return cats;
    } catch (err) {
      return [];
    }
  }

  async searchBaseCoins(search: string): Promise<BaseCoin[]> {
    try {
      if (!this.realm) {
        await this.init();
      }

      const results: BaseCoin[] = [];

      for (let i = 0; i < this.baseCoins.length; i += 1) {
        const baseCoin = this.baseCoins[i];

        if (
          baseCoin.symbol.indexOf(search) === -1 &&
          baseCoin.name.indexOf(search) === -1
        ) {
          continue;
        }

        results.push({
          id: this.baseCoins[i].id,
          name: this.baseCoins[i].name,
          symbol: this.baseCoins[i].symbol,
          contractAddress: this.baseCoins[i].contractAddress,
          network: this.baseCoins[i].network,
        });
      }

      return results;
    } catch (err) {
      return [];
    }
  }
}

export const realmService = new RealmService();
