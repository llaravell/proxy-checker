export enum Protocol {
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
  SOCKS4 = 'SOCKS4',
  SOCKS5 = 'SOCKS5',
}

export enum CheckStatus {
  IDLE = 'IDLE',
  CHECKING = 'CHECKING',
  WORKING = 'WORKING',
  DEAD = 'DEAD',
}

export interface ProxyItem {
  id: string;
  ip: string;
  port: number;
  protocol: Protocol;
  status: CheckStatus;
  latency?: number;
  country?: string;
  city?: string;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface AnalysisResult {
  countries: { country: string; count: number }[];
  summary: string;
}