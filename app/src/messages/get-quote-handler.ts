import { Message, MessageReaction } from 'discord.js';
import { MessageHandler } from './message-handler';
import { IndexedQuote, QuoteManager, QuoteFormatter } from '../quotes';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

@injectable()
export class GetQuoteHandler implements MessageHandler {
  private quoteFormatter: QuoteFormatter;
  private quoteManager: QuoteManager;

  constructor(
    @inject(TYPES.QuoteManager) quoteManager: QuoteManager,
    @inject(TYPES.BasicQuoteFormatter) quoteFormatter: QuoteFormatter
  ) {
    this.quoteManager = quoteManager;
    this.quoteFormatter = quoteFormatter;
  }

  getIdentifier(): string {
    return 'quote';
  }

  getUsage(): string {
    return `${this.getIdentifier()} [number?] [word?] : if you provide nothing, returns a random quote. If you provide a number, it'll provide the corresponding quote. If you provide a word, we'll search for the best quote that matches`;
  }

  async handle(content: string, message: Message): Promise<Message | Message[] | MessageReaction> {
    let quote: IndexedQuote | IndexedQuote[] | undefined;
    if (content.trim() === '') {
      quote = await this.quoteManager.get();
    } else if (this.checkInt(content)) {
      quote = await this.quoteManager.getByIndex(parseInt(content));
    }

    // try to match against the word
    if (quote === undefined) {
      quote = await this.quoteManager.getBySearch(content);
    }

    // still have nothing, oh well
    if (quote === undefined) {
      return message.react('👎');
    }

    return message.channel.send(this.quoteFormatter.formatQuote(quote));
  }

  private checkInt(value: string): boolean {
    return !isNaN(parseInt(value));
  }
}
