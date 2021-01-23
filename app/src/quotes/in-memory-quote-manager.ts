import {QuoteManager} from './quote-manager';
import {injectable} from 'inversify';

@injectable()
export class InMemoryQuoteManager implements QuoteManager {

  private quotes:string[] = [];

  get() {
    return this.quotes[Math.floor(Math.random() * this.quotes.length)];
  }

  add(quote: string) {
    this.quotes.push(quote);
    return true;
  }
}
