export interface Currency {
  cc: string;
  symbol: string;
  name: string;
  type: 'crypto' | 'world' | 'popular';
}
