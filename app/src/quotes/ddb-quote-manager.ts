import { inject, injectable } from 'inversify';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
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

  get(): Quote | undefined {
    return undefined;
  }

  getByIndex(index: number): Quote | undefined {
    index++; // not used yet
    return undefined;
  }

  getBySearch(): Map<number, Quote> {
    return new Map<number, Quote>();
  }

  add(): boolean {
    this.numItems++;
    return false;
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
}
