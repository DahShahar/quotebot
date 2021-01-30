import {QuoteManager} from './quote-manager';
import {Quote} from './quote';
import {injectable} from 'inversify';

@injectable()
export class InMemoryQuoteManager implements QuoteManager {

  private quotes: Map<number, Quote>;

  constructor() {
    this.quotes = new Map<number, Quote>();
  }

  get(): string {
    const quoteNumber = 1 + Math.floor(Math.random() * this.quotes.size);
    const randomQuote = this.quotes.get(quoteNumber);
    if (randomQuote === undefined) {
      return `Could not find a quote, there are ${this.quotes.size} available`;
    }
    return `<${randomQuote.author}>: ${quoteNumber}. ${randomQuote.quote}`;
  }

  add(quote: Quote): boolean {
    this.quotes.set(this.quotes.size + 1, quote);
    return true;
  }
}
