import { IndexedQuote } from './indexed-quote';

export interface QuoteFormatter {
  formatQuote(quotes: IndexedQuote | IndexedQuote[]): string;
}
