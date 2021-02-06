import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { QuoteManager } from './quote-manager';
import { Quote } from './quote';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

@injectable()
export class InMemoryQuoteManager implements QuoteManager {
  private quotes: Map<number, Quote>;
  private s3Client: S3Client;

  constructor(@inject(TYPES.QuoteMapping) quotes?: Map<number, Quote>) {
    if (quotes) {
      this.quotes = quotes;
    } else {
      this.quotes = new Map<number, Quote>();
    }
    this.s3Client = new S3Client({});
  }

  get(): Quote | undefined {
    const quoteNumber = 1 + Math.floor(Math.random() * this.quotes.size);
    const randomQuote = this.quotes.get(quoteNumber);
    return randomQuote;
  }

  getByIndex(num: number): Quote | undefined {
    return this.quotes.get(num);
  }

  getBySearch(search: string): Map<number, Quote> {
    const quotesMap: Map<number, Quote> = new Map<number, Quote>();
    this.quotes.forEach((value, key) => {
      if (
        value.quote.toLowerCase().includes(search.toLowerCase()) ||
        value.author.toLowerCase() === search.toLowerCase()
      ) {
        quotesMap.set(key, value);
      }
    });
    return quotesMap;
  }

  add(quote: Quote): boolean {
    this.quotes.set(this.quotes.size + 1, quote);
    return true;
  }

  async getQuotesFromS3(path: string): Promise<void> {
    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
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
    try {
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
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
