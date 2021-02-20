import { Message } from 'discord.js';
import { MessageHandler } from './message-handler';
import { QuoteManager, QuoteFormatter } from '../quotes';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

@injectable()
export class BlameQuoteHandler implements MessageHandler {
  private quoteManager: QuoteManager;
  private quoteFormatter: QuoteFormatter;

  constructor(
    @inject(TYPES.QuoteManager) quoteManager: QuoteManager,
    @inject(TYPES.BlameQuoteFormatter) quoteFormatter: QuoteFormatter
  ) {
    this.quoteManager = quoteManager;
    this.quoteFormatter = quoteFormatter;
  }

  getIdentifier(): string {
    return 'blamequote';
  }

  getUsage(): string {
    return `${this.getIdentifier()} [number]: prints who added the [number]th quote`;
  }

  async handle(content: string, message: Message): Promise<Message | Message[]> {
    if (this.checkInt(content) === true) {
      const quote = await this.quoteManager.getByIndex(parseInt(content));
      if (quote !== undefined) {
        return message.channel.send(this.quoteFormatter.formatQuote(quote));
      }
    }
    return Promise.reject();
  }

  private checkInt(value: string): boolean {
    return !isNaN(parseInt(value));
  }
}
