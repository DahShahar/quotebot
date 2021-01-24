import {Message} from 'discord.js';
import {MessageHandler} from './message-handler';
import {QuoteManager} from '../quotes/quote-manager';
import {injectable, inject} from 'inversify';
import {TYPES} from '../types';

@injectable()
export class AddQuoteHandler implements MessageHandler {

  private quoteManager: QuoteManager;

  constructor(
    @inject(TYPES.QuoteManager) quoteManager: QuoteManager
  ) {
    this.quoteManager = quoteManager;
  }

  getIdentifier(): string {
    return 'addquote';
  }

  identify(message: Message): boolean {
    return message.content.startsWith(this.getIdentifier());
  }

  handle(message: Message): Promise<Message | Message[]>  {
    this.quoteManager.add(message.content);
    return message.reply('Added Quote!');
  }
}
