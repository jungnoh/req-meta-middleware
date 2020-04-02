import axios from 'axios';
import fs from 'fs';
import cron from 'node-cron';
import path from 'path';
import url from 'url';
import { RefParserOptions, ReferralData, ReferralDict, ReferrerResult, QueryItem } from '../types';

let _dict: ReferralDict | null = null;

const DATA_SOURCE_URL = 'https://s3-eu-west-1.amazonaws.com/snowplow-hosted-assets/third-party/referer-parser/referers-latest.json';

async function updateDict() {
  try {
    const resp = await axios.get(DATA_SOURCE_URL, {transformResponse: []});
    _dict = parseData(resp.data);
  } catch (err) {
    console.error('Failed to update referral data!');
    console.error(err);
    throw err;
  }
}

function parseData(data: string): ReferralDict {
  const ret: ReferralDict = {};
  const dataObj: ReferralData = JSON.parse(data);
  for (const medium of Object.keys(dataObj)) {
    for (const name of Object.keys(dataObj[medium])) {
      for (const domain of dataObj[medium][name].domains) {
        ret[domain] = {
          medium,
          name,
          parameters: dataObj[medium][name].parameters
        };
      }
    }
  }
  return ret;
}

function parseDataFromFile(path: string): Promise<ReferralDict> {
  return new Promise((res, rej) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        rej(err);
        return;
      }
      try {
        res(parseData(data.toString('utf-8')));
      } catch (err) {
        rej(err);
      }
    });
  });
}

export async function init(options: RefParserOptions | null) {
  if ((options?.webReferralDB) ?? true) {
    try {
      await updateDict();
      cron.schedule((options?.updateSchedule ?? '0 0 0 * * * *'), updateDict);
    } catch (err) {
      _dict = await parseDataFromFile(path.join(__dirname, '../../data/referers.json'));
    }
  } else {
    _dict = await parseDataFromFile(path.join(__dirname, '../../data/referers.json'));
  }
}

export function parse(url: url.UrlWithParsedQuery, options: RefParserOptions | null): ReferrerResult {
  const host = url.hostname;
  // Parse Referrers
  if (host === null) {
    return {
      medium: 'unknown',
      siteName: 'unknown',
      params: []
    };
  }
  if ((options?.internalDomains ?? []).includes(host)) {
    return {
      medium: 'internal',
      siteName: 'internal',
      params: []
    };
  }
  if (_dict?.hasOwnProperty(host)) {
    const dictMatch = _dict[host];
    const params = dictMatch.parameters.map((v: string) => ({
      value: url.query[v],
      key: v
    })).filter((x: QueryItem) => (x.value !== undefined));
    return {
      medium: dictMatch.medium,
      siteName: dictMatch.name,
      params
    };
  }
  return {
    medium: 'link',
    siteName: host,
    params: []
  };
}