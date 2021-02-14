import { Quote } from './quote';

export interface IndexedQuote {
  /**
   * The index associated with the quote.
   */
  index: number;
  /**
   * The quote itself
   */
  quote: Quote;
}
