import { inject, injectable } from 'inversify';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { Quote } from './quote';
import { QuoteManager } from './quote-manager';
import { TYPES } from '../types';

@injectable()
export class DdbQuoteManager implements QuoteManager {
  private ddbClient: DynamoDBClient;

  constructor(@inject(TYPES.DynamoDBClient) ddbClient: DynamoDBClient) {
    this.ddbClient = ddbClient;
  }

  get(): Quote | undefined {
    return undefined;
  }

  getByIndex(): Quote | undefined {
    return undefined;
  }

  getBySearch(): Map<number, Quote> {
    return new Map<number, Quote>();
  }

  add(): boolean {
    return false;
  }
}
