export interface ITransaction {
  blockNumber?: string;
  blockHash?: string;
  hash: string;
  from: string;
  to: string;
  by?: string;
  fee: number;
  value: number;
  timeStamp: string;
  nonce: string;
  index?: string;
  type: 'in' | 'out' | 'by';
  label?: string;
  status: string;
  url: string;
}
