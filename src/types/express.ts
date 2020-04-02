import { ParseResult } from '.';

/// <reference types="express" />
declare global {
  namespace Express {
    interface Request {
      meta: ParseResult | null;
    }
  }
}
