import { Quote } from './quote';

export class QuoteBuilder {
  private readonly quote: Quote;

  constructor() {
    this.quote = {
      author: '',
      blamer: '',
      quote: '',
    };
  }

  withAuthor(author: string): QuoteBuilder {
    this.quote.author = author;
    return this;
  }

  withBlamer(blamer: string): QuoteBuilder {
    this.quote.blamer = blamer;
    return this;
  }

  withQuote(quote: string): QuoteBuilder {
    this.quote.quote = quote;
    return this;
  }

  build(): Quote {
    return this.quote;
  }
}
