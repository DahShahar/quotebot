import { QuoteFormatter } from './quote-formatter';
import { IndexedQuote } from './indexed-quote';
import { injectable } from 'inversify';

@injectable()
export class BlameQuoteFormatter implements QuoteFormatter {
  formatQuote(indexedQuote: IndexedQuote): string {
    const quote = indexedQuote.quote;
    return `${quote.blamer} added in '${quote.quote}'`;
  }
}
