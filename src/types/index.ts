import geoip from 'geoip-lite';
import url from 'url';

export interface ReferralDataItem {
  domains: string[];
  parameters: string[];
}

export interface ReferralItem {
  medium: string;
  name: string;
  parameters: string[];
}

export interface ReferralData {
  [medium: string]: {[name: string]: ReferralDataItem};
}

export interface ReferralDict {
  [domain: string]: ReferralItem;
}

export interface RefParserOptions {
  internalDomains?: string[];
  skipIP?: boolean;
  webReferralDB?: boolean;
  updateSchedule?: string;
}

export interface QueryItem {
  key: string;
  value: string | string[];
}

export interface ReferrerResult {
  medium: string;
  siteName: string;
  params: QueryItem[];
}

export interface UAResult {
  raw: string;
  parsed: IUAParser.IResult;
}

export interface UTMResult {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  valid: boolean;
}

export interface IPResult {
  ip: string;
  geo?: geoip.Lookup;
}

export interface ParseResult {
  ip: IPResult | null;
  referrer: ReferrerResult;
  referrerUrl: url.UrlWithParsedQuery;
  ua: UAResult | null;
  url: url.UrlWithParsedQuery;
  utm: UTMResult;
}