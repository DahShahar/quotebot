import { QuoteFormatter } from './quote-formatter';
import { Quote } from './quote';
import { injectable } from 'inversify';

@injectable()
export class BasicQuoteFormatter implements QuoteFormatter {
  formatQuote(quote: Quote): string {
    return quote.quote;
  }
}
