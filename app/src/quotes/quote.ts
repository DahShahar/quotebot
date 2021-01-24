export interface Quote {
  /**
   * The person who said the quote
   */
  author: string,
  /**
   * The person who added the quote to our context
   */
  blamer: string,
  /**
   * The actual content of the quote
   */
  quote: string,
}
