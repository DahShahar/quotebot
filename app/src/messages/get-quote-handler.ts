import { Message, MessageReaction } from 'discord.js';
import { MessageHandler } from './message-handler';
import { QuoteFormatter } from '../quotes/quote-formatter';
import { QuoteManager } from '../quotes/quote-manager';
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

  handle(message: Message): Promise<Message | Message[] | MessageReaction> {
    let quote;
    const content = message.content;
    if (message.content.trim() === '') {
      quote = this.quoteManager.get();
    } else if (this.checkInt(content) === true) {
      quote = this.quoteManager.getByIndex(parseInt(content));
    }

    // try to match against the word
    if (quote === undefined) {
      const quoteMap = this.quoteManager.getBySearch(content);
      for (const entry of quoteMap.entries()) {
        const [, value] = entry;
        if (quote === undefined) {
          quote = value;
        }
      }
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
