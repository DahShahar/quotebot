import { Message, MessageReaction } from 'discord.js';
import { MessageHandler } from './message-handler';
import { QuoteBuilder, QuoteManager } from '../quotes';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

@injectable()
export class AddQuoteHandler implements MessageHandler {
  private quoteManager: QuoteManager;

  constructor(@inject(TYPES.QuoteManager) quoteManager: QuoteManager) {
    this.quoteManager = quoteManager;
  }

  getIdentifier(): string {
    return 'addquote';
  }

  getUsage(): string {
    return `${this.getIdentifier()} [author] "quote": adds "quote" and attributes it to the author of your choice. Note that the quote must be in double quotes.`;
  }

  /**
   * The content of the message when it arrives at this point should look like
   * this is the author "and this is the quote"
   *
   * This would mean: author="this is the author" and quote="and this is the quote"
   */
  handle(content: string, message: Message): Promise<Message | Message[] | MessageReaction> {
    // the string should end with double quotes
    if (content.slice(-1) !== '"') {
      return this.failMessage(message);
    }

    const indexOfFirstQuote = content.indexOf('"');
    if (indexOfFirstQuote === -1 || indexOfFirstQuote === content.length - 1) {
      return this.failMessage(message);
    }

    // we want everything inside the quote, but not the quotation marks
    const quote = content.substring(indexOfFirstQuote + 1, content.length - 1).trim();
    if (!quote) {
      return this.failMessage(message);
    }

    const author = content.substring(0, indexOfFirstQuote).trim();
    if (!author) {
      return this.failMessage(message);
    }

    const toAddQuote = new QuoteBuilder()
      .withQuote(quote)
      .withBlamer(message.author.username)
      .withAuthor(author)
      .build();

    this.quoteManager.add(toAddQuote).catch((err) => {
      console.error(err);
    });

    return message.react('👍');
  }

  failMessage(message: Message): Promise<MessageReaction> {
    return message.react('👎');
  }
}
