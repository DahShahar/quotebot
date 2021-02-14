import { IndexedQuote } from './indexed-quote';

export interface QuoteFormatter {
  formatQuote(quote: IndexedQuote): string;
}
