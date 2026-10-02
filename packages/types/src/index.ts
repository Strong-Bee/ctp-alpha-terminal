export type AlphaRegime="BULLISH"|"BEARISH"|"NEUTRAL";
export interface AlphaScore{narrative:number;onchain:number;smartMoney:number;liquidity:number;momentum:number;catalyst:number;risk:number;total:number;confidence:number;regime:AlphaRegime}
export interface MarketSnapshot{symbol:string;price:number;change24h:number;volume24h:number;timestamp:string}