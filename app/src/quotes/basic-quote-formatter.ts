import { QuoteFormatter } from './quote-formatter';
import { IndexedQuote } from './indexed-quote';
import { injectable } from 'inversify';

@injectable()
export class BasicQuoteFormatter implements QuoteFormatter {
  formatQuote(indexedQuote: IndexedQuote): string {
    const quote = indexedQuote.quote;
    return `${indexedQuote.index}: ${quote.author} said: ${quote.quote}`;
  }
}
