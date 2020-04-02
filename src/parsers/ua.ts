import {UAParser} from 'ua-parser-js';
import { UAResult } from '../types';

export function parse(ua: string): UAResult {
  return {
    parsed: new UAParser(ua).getResult(),
    raw: ua
  };
}