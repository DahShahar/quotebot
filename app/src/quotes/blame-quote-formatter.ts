import { Quote } from './quote';
import { QuoteFormatter } from './quote-formatter';
import { IndexedQuote } from './indexed-quote';
import { injectable } from 'inversify';

@injectable()
export class BlameQuoteFormatter implements QuoteFormatter {
  formatQuote(indexedQuotes: IndexedQuote | IndexedQuote[]): string {
    let quote: Quote;
    if (Array.isArray(indexedQuotes)) {
      console.error('Received an array of indexedQuotes for a blamequote; should never happen. Using the first one');
      quote = indexedQuotes[0].quote;
    } else {
      quote = indexedQuotes.quote;
    }
    return `${quote.blamer} added in '${quote.quote}'`;
  }
}
