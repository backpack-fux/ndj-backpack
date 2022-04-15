export interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  platforms: {
    [network: string]: string;
  };
}

export interface CoinGeckoCoinDetail {
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  circulating_supply: number;
  current_price: number;
  fully_diluted_valuation: null;
  high_24h: number;
  id: string;
  image: string;
  last_updated: string;
  low_24h: number;
  market_cap: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  market_cap_rank: number;
  max_supply: any;
  name: string;
  price_change_24h: number;
  price_change_percentage_24h: number;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  };
  symbol: string;
  total_supply: any;
  total_volume: number;
}
