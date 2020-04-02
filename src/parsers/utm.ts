import { UTMResult } from '../types';
import { ParsedUrlQuery } from 'querystring';

export function parse(query: ParsedUrlQuery): UTMResult {
  let utm = {
    campaign: (query?.utm_campaign as string) ?? undefined,
    source: (query?.utm_source as string) ?? undefined,
    medium: (query?.utm_medium as string) ?? undefined,
    term: (query?.utm_term as string) ?? undefined,
    content: (query?.utm_content as string) ?? undefined,
    valid: false
  };
  utm.valid = (utm.campaign !== undefined) && (utm.source !== undefined) && (utm.medium !== undefined);
  return utm;
}