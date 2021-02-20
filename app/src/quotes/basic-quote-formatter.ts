import { Quote } from './quote';
import { QuoteFormatter } from './quote-formatter';
import { IndexedQuote } from './indexed-quote';
import { injectable } from 'inversify';

@injectable()
export class BasicQuoteFormatter implements QuoteFormatter {
  formatQuote(indexedQuotes: IndexedQuote | IndexedQuote[]): string {
    let quote: Quote;
    let indexedQuote: IndexedQuote;
    const additionalQuoteIndexes: number[] = [];
    if (Array.isArray(indexedQuotes)) {
      const quoteToQuote = Math.floor(Math.random() * indexedQuotes.length);
      indexedQuote = indexedQuotes[quoteToQuote];
      quote = indexedQuote.quote;
      for (const otherQuote of indexedQuotes) {
        if (otherQuote === indexedQuote) {
          continue;
        }
        additionalQuoteIndexes.push(otherQuote.index);
      }
    } else {
      indexedQuote = indexedQuotes;
      quote = indexedQuote.quote;
    }
    const additionalMessage =
      additionalQuoteIndexes.length === 0
        ? ''
        : `
Other quotes include ${additionalQuoteIndexes.join(' ')}`;
    return `${indexedQuote.index}: ${quote.author} said: ${quote.quote}${additionalMessage}`;
  }
}
