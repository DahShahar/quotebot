import { Quote } from './quote';

export interface QuoteManager {
  /**
   * @return {Quote | undefined} a random quote if there is any, or undefined if there are none.
   */
  get(): Quote | undefined;

  /**
   * @param {number} the Nth quote to get, 1-indexed
   * @return {Quote | undefined} the Nth quote, 1-indexed, unless that quote does not exist
   */
  getByIndex(num: number): Quote | undefined;

  /**
   * @param {string} the string to search for
   * @return {Map<number, Quote>} the quotes matching the string, can be empty
   */
  getBySearch(search: string): Map<number, Quote>;

  /**
   * @return {boolean} whether the add was successful or not
   */
  add(quote: Quote): boolean;
}
