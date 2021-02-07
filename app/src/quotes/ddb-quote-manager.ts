import { inject, injectable } from 'inversify';
import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';

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

  get(): Promise<Quote | undefined> {
    const quoteNumber = 1 + Math.floor(Math.random() * this.numItems);
    return this.getByIndex(quoteNumber);
  }

  async getByIndex(index: number): Promise<Quote | undefined> {
    const getItemCommand = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        quoteIndex: { N: `${index}` },
      },
    });
    const getItemResult = await this.ddbClient.send(getItemCommand);
    if (getItemResult && getItemResult.Item && getItemResult.Item.Quote && getItemResult.Item.Quote.S) {
      const quoteString = getItemResult.Item.Quote.S;
      const jsonParsed = JSON.parse(quoteString) as Quote;
      if (this.isQuote(jsonParsed)) {
        return jsonParsed;
      } else {
        console.error('Parsed JSON was not a Quote');
        console.error(jsonParsed);
        return undefined;
      }
    }
    return undefined;
  }

  getBySearch(): Map<number, Quote> {
    return new Map<number, Quote>();
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
    console.log(this.numItems);
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
