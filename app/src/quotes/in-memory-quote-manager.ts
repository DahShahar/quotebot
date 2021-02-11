import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { QuoteManager } from './quote-manager';
import { Quote } from './quote';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

@injectable()
export class InMemoryQuoteManager implements QuoteManager {
  private quotes: Map<number, Quote>;
  private s3Client: S3Client;
  private bucketName: string;

  constructor(@inject(TYPES.QuoteMapping) quotes?: Map<number, Quote>, bucketName?: string) {
    if (quotes) {
      this.quotes = quotes;
    } else {
      this.quotes = new Map<number, Quote>();
    }
    this.s3Client = new S3Client({});
    this.bucketName = bucketName || '';
  }

  get(): Promise<Quote | undefined> {
    const quoteNumber = 1 + Math.floor(Math.random() * this.quotes.size);
    return this.getByIndex(quoteNumber);
  }

  getByIndex(num: number): Promise<Quote | undefined> {
    return Promise.resolve(this.quotes.get(num));
  }

  getBySearch(search: string): Promise<Map<number, Quote>> {
    const quotesMap: Map<number, Quote> = new Map<number, Quote>();
    this.quotes.forEach((value, key) => {
      if (
        value.quote.toLowerCase().includes(search.toLowerCase()) ||
        value.author.toLowerCase() === search.toLowerCase()
      ) {
        quotesMap.set(key, value);
      }
    });
    return Promise.resolve(quotesMap);
  }

  add(quote: Quote): Promise<boolean> {
    this.quotes.set(this.quotes.size + 1, quote);
    return Promise.resolve(true);
  }

  async getBucketName(cfn: CloudFormationClient): Promise<void> {
    const describeStacksCommand = new DescribeStacksCommand({ StackName: 'QuoteBotStack' });
    const describeStacksOutput = await cfn.send(describeStacksCommand);
    const stacks = describeStacksOutput.Stacks;
    if (stacks && stacks.length === 1) {
      const stack = stacks[0];
      if (stack && stack.Outputs) {
        const bucketOutput = stack.Outputs.find((elem) => elem.OutputKey === 'S3Bucket');
        if (bucketOutput && bucketOutput.OutputValue) {
          this.bucketName = bucketOutput.OutputValue;
          return;
        }
      }
    }
    throw new Error('Could not determine bucket name');
  }

  async getQuotesFromS3(path: string): Promise<void> {
    if (!this.bucketName) {
      console.warn('No bucket to grab from found');
      this.quotes = new Map<number, Quote>();
      return;
    }

    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: path,
      });
      const getObjectResult = await this.s3Client.send(getObjectCommand);
      const chunks = [];
      for await (const chunk of getObjectResult.Body) {
        chunks.push(chunk);
      }
      const chunkString = Buffer.concat(chunks).toString('utf-8');
      const jsonMap = new Map<string, Quote>(Object.entries(JSON.parse(chunkString)));
      const mapping = new Map<number, Quote>();
      jsonMap.forEach((value, key) => {
        mapping.set(parseInt(key), value);
      });
      console.log('Loaded mapping from file!');
      console.log(mapping);
      this.quotes = mapping;
    } catch (err) {
      console.error(err);
      this.quotes = new Map<number, Quote>();
    }
  }

  async flushJson(path: string): Promise<void> {
    if (!this.bucketName) {
      console.warn('No bucket name to flush to found');
      return;
    }

    try {
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: path,
        Body: JSON.stringify(Object.fromEntries(this.quotes)),
      });
      await this.s3Client.send(putObjectCommand);
    } catch (err) {
      console.error(err);
    }
  }

  addExitHook(path: string): void {
    [
      'beforeExit',
      'uncaughtException',
      'unhandledRejection',
      'SIGHUP',
      'SIGINT',
      'SIGQUIT',
      'SIGILL',
      'SIGTRAP',
      'SIGABRT',
      'SIGBUS',
      'SIGFPE',
      'SIGUSR1',
      'SIGSEGV',
      'SIGUSR2',
      'SIGTERM',
    ].forEach((event) =>
      process.on(event, () => {
        (async () => {
          await this.flushJson(path);
          console.log('Flushed Json to S3');
          process.exit();
        })().catch(() => {
          console.log('Failed to flush');
        });
      })
    );
  }
}
