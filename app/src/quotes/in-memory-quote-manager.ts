import {QuoteManager} from './quote-manager';
import {injectable} from 'inversify';

@injectable()
export class InMemoryQuoteManager implements QuoteManager {

  private quotes:string[] = [];

  get(): string {
    return this.quotes[Math.floor(Math.random() * this.quotes.length)];
  }

  add(quote: string): boolean {
    this.quotes.push(quote);
    return true;
  }
}
