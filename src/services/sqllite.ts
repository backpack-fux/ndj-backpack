import {BaseCoin} from '@app/models';
import SQLite from 'react-native-sqlite-storage';

class SqliteService {
  database?: SQLite.SQLiteDatabase;
  constructor() {
    SQLite.enablePromise(true);
    this.init();
  }

  async init() {
    try {
      this.database = await SQLite.openDatabase({
        name: 'backpack.db',
      });
    } catch (err) {
      console.log(err);
    }
  }

  async setBaseCoins(baseCoins: BaseCoin[]) {
    try {
      if (!this.database) {
        return;
      }

      await this.database.executeSql(`CREATE TABLE IF NOT EXISTS baseCoins (
        id varchar(255) NOT NULL,
        name varchar(255) NOT NULL,
        symbol varchar(255) NOT NULL,
        contractAddress varchar(255) DEFAULT NULL,
        network varchar(255) NOT NULL,
        PRIMARY KEY ('id', 'network')
     ) WITHOUT ROWID;`);

      await this.database.executeSql(
        'CREATE INDEX IF NOT EXISTS baseCoins_symbol_idx ON baseCoins (symbol);',
      );

      await this.database.executeSql(
        'CREATE INDEX IF NOT EXISTS baseCoins_name_idx ON baseCoins (name);',
      );

      await this.database.executeSql(
        'CREATE INDEX IF NOT EXISTS baseCoins_symbol_name_idx ON baseCoins (symbol, name);',
      );
      await this.database?.executeSql('DELETE FROM baseCoins');
      let page = 0;
      let limit = 1000;

      while (true) {
        const data = baseCoins.slice(page * limit, (page + 1) * limit);
        const values = data.reduce((total: any[], item: BaseCoin) => {
          return [
            ...total,
            item.id,
            item.name,
            item.symbol,
            item.contractAddress,
            item.network,
          ];
        }, []);

        const fileds = data.map(() => '(?, ?, ?, ?, ?)').join(', ');

        await this.database?.executeSql(
          `INSERT INTO baseCoins (id, name, symbol, contractAddress, network) VALUES ${fileds};`,
          values,
        );

        page += 1;

        if (data.length < limit) {
          break;
        }
      }
    } catch (err) {
      console.log('errorr=======================');
      console.log(err);
    }
  }

  async getBaseCoins(): Promise<BaseCoin[]> {
    try {
      if (!this.database) {
        return [];
      }

      const res = await this.database?.executeSql('SELECT * FROM baseCoins');
      return res ? res[0].rows.raw() : [];
    } catch (err) {
      return [];
    }
  }

  async searchBaseCoins(search: string): Promise<BaseCoin[]> {
    try {
      if (!this.database) {
        return [];
      }

      const res = await this.database?.executeSql(
        'SELECT * FROM baseCoins WHERE symbol like ? or name like ? limit ?',
        [`%${search}%`, `%${search}%`, 100],
      );
      return res ? res[0].rows.raw() : [];
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

export const sqliteService = new SqliteService();
