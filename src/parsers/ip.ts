import geoip from 'geoip-lite';
import requestIp from 'request-ip';
import { Request } from 'express';
import { IPResult } from '../types';

export function parse(req: Request): IPResult | null {
  const ip = requestIp.getClientIp(req);
  if (ip !== null) {
    const geo = geoip.lookup(ip);
    if (geo) {
      return {ip, geo};
    } else {
      return {ip};
    }
  }
  return null;
}
