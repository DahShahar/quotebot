import { QuoteManager } from './quote-manager';
import { Quote } from './quote';
import { injectable } from 'inversify';

@injectable()
export class InMemoryQuoteManager implements QuoteManager {
  private quotes: Map<number, Quote>;

  constructor() {
    this.quotes = new Map<number, Quote>();
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
      console.log(value.quote);
      console.log(search);
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
}
