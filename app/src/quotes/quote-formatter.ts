import { Quote } from './quote';

export interface QuoteFormatter {
  formatQuote(quote: Quote): string;
}
