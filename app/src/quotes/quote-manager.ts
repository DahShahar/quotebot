import { Quote } from './quote';
import { IndexedQuote } from './indexed-quote';

export interface QuoteManager {
  /**
   * @return {Quote | undefined} a random quote if there is any, or undefined if there are none.
   */
  get(): Promise<IndexedQuote | undefined>;

  /**
   * @param {number} the Nth quote to get, 1-indexed
   * @return {Quote | undefined} the Nth quote, 1-indexed, unless that quote does not exist
   */
  getByIndex(num: number): Promise<IndexedQuote | undefined>;

  /**
   * @param {string} the string to search for
   * @return {Map<number, Quote>} the quotes matching the string, can be empty
   */
  getBySearch(search: string): Promise<IndexedQuote[]>;

  /**
   * @return {Promise<boolean>} whether the add was successful or not
   */
  add(quote: Quote): Promise<boolean>;
}
