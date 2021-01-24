import {Quote} from './quote';

export interface QuoteManager {
  /**
   * @return {string} a random quote
   */
  get(): string;
  /**
   * @return {boolean} whether the add was successful or not
   */
  add(quote: Quote): boolean;
}
