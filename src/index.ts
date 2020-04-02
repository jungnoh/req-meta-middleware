import './types/express';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import url from 'url';
import { RefParserOptions, ParseResult } from './types';
import Parsers from './parsers';

let _options: RefParserOptions | null = null;

function parseRequest(req: Request): ParseResult {
  const skipIP = _options?.skipIP ?? false;
  const parsedUrl = url.parse(req.header('referrer') ?? '', true);
  const uaString = (req.header('user-agent') ?? '').trim();

  const referrer = Parsers.Referrer.parse(parsedUrl, _options);
  const utm = Parsers.UTM.parse(parsedUrl.query);
  const ip = skipIP ? null : Parsers.IP.parse(req);
  const ua = (uaString === '') ? null : Parsers.UserAgent.parse(uaString);

  return {
    ip, referrer, ua, utm, url: parsedUrl
  };
}

async function init() {
  await Parsers.Referrer.init(_options);
}

export default async function build(options?: RefParserOptions): Promise<RequestHandler> {
  _options = options ?? null;
  await init();
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      const result = parseRequest(req);
      req.meta = result;
      next();
    } catch (err) {
      req.meta = null;
      next();
    }
  };
}

export async function later(callback: (meta: ParseResult) => void, options?: RefParserOptions): Promise<RequestHandler> {
  _options = options ?? null;
  await init();
  return (req: Request, _: Response, next: NextFunction) => {
    next();
    try {
      callback(parseRequest(req));
    // eslint-disable-next-line no-empty
    } catch {}
  };
}
