import { QuoteFormatter } from './quote-formatter';
import { Quote } from './quote';
import { injectable } from 'inversify';

@injectable()
export class BlameQuoteFormatter implements QuoteFormatter {
  formatQuote(quote: Quote): string {
    return quote.blamer;
  }
}
