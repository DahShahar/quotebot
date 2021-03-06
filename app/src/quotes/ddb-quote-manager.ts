import { inject, injectable } from 'inversify';
import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';

import { IndexedQuote } from './indexed-quote';
import { Quote } from './quote';
import { QuoteManager } from './quote-manager';
import { TYPES } from '../types';

@injectable()
export class DdbQuoteManager implements QuoteManager {
  private ddbClient: DynamoDBClient;
  private numItems: number;
  private tableName: string;

  constructor(@inject(TYPES.DynamoDBClient) ddbClient: DynamoDBClient) {
    this.ddbClient = ddbClient;
    this.numItems = 0;
    this.tableName = '';
  }

  get(): Promise<IndexedQuote | undefined> {
    const quoteNumber = 1 + Math.floor(Math.random() * this.numItems);
    return this.getByIndex(quoteNumber);
  }

  async getByIndex(index: number): Promise<IndexedQuote | undefined> {
    const getItemCommand = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        quoteIndex: { N: `${index}` },
      },
    });
    const getItemResult = await this.ddbClient.send(getItemCommand);
    if (
      getItemResult &&
      getItemResult.Item &&
      getItemResult.Item.Quote &&
      getItemResult.Item.Quote.S &&
      getItemResult.Item.quoteIndex &&
      getItemResult.Item.quoteIndex.N
    ) {
      const quoteString = getItemResult.Item.Quote.S;
      const jsonParsed = JSON.parse(quoteString) as Quote;
      if (this.isQuote(jsonParsed)) {
        return {
          quote: jsonParsed,
          index,
        };
      } else {
        console.error('Parsed JSON was not a Quote');
        console.error(jsonParsed);
        return undefined;
      }
    }
    return undefined;
  }

  async getBySearch(search: string): Promise<IndexedQuote[]> {
    const quotesList: IndexedQuote[] = [];
    const scanCommand = new ScanCommand({
      TableName: this.tableName,
    });
    const scanResult = await this.ddbClient.send(scanCommand);
    if (scanResult.Items) {
      for (const item of scanResult.Items) {
        if (item.quoteIndex.N && item.Quote.S) {
          const quoteIndex = parseInt(item.quoteIndex.N);
          const quote = JSON.parse(item.Quote.S) as Quote;
          if (!this.isQuote(quote)) {
            continue;
          }
          if (
            quote.quote.toLowerCase().includes(search.toLowerCase()) ||
            quote.author.toLowerCase() === search.toLowerCase()
          ) {
            quotesList.push({
              index: quoteIndex,
              quote,
            });
          }
        }
      }
    }
    return Promise.resolve(quotesList);
  }

  add(quote: Quote): Promise<boolean> {
    const putItemCommand = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        quoteIndex: { N: `${this.numItems + 1}` },
        Quote: { S: JSON.stringify(quote) },
      },
    });

    return this.ddbClient
      .send(putItemCommand)
      .then(() => {
        this.numItems++;
        return true;
      })
      .catch((err) => {
        console.error(err);
        return false;
      });
  }

  async determineNumberOfQuotes(): Promise<void> {
    const scanCommand = new ScanCommand({
      TableName: this.tableName,
      Select: 'COUNT',
    });
    const scanResult = await this.ddbClient.send(scanCommand);
    if (scanResult && scanResult.Count !== undefined) {
      this.numItems = scanResult.Count;
    } else {
      throw new Error('Could not determine item count');
    }
  }

  async determineTableName(cfn: CloudFormationClient): Promise<void> {
    const describeStacksCommand = new DescribeStacksCommand({ StackName: 'QuoteBotStack' });
    const describeStacksOutput = await cfn.send(describeStacksCommand);
    const stacks = describeStacksOutput.Stacks;
    if (stacks && stacks.length === 1) {
      const stack = stacks[0];
      if (stack && stack.Outputs) {
        const tableOutput = stack.Outputs.find((elem) => elem.OutputKey === 'DynamoDBTable');
        if (tableOutput && tableOutput.OutputValue) {
          this.tableName = tableOutput.OutputValue;
          return;
        }
      }
    }
    throw new Error('Could not determine table name');
  }

  isQuote(obj: Quote): obj is Quote {
    return obj.quote.trim().length !== 0 && obj.author.trim().length !== 0 && obj.blamer.trim().length !== 0;
  }
}
