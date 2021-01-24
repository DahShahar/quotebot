import {QuoteManager} from './quote-manager';
import {Quote} from './quote';
import {injectable} from 'inversify';

@injectable()
export class InMemoryQuoteManager implements QuoteManager {

  private quotes:Quote[] = [];

  get(): string {
    const randomQuote: Quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    return `${randomQuote.quote} -- written by ${randomQuote.author}`;
  }

  add(quote: Quote): boolean {
    this.quotes.push(quote);
    return true;
  }
}
