import {Message} from 'discord.js';
import {MessageHandler} from './message-handler';
import {QuoteManager} from '../quotes/quote-manager';
import {injectable, inject} from 'inversify';
import {TYPES} from '../types';

@injectable()
export class GetQuoteHandler implements MessageHandler {

  private quoteManager: QuoteManager;

  constructor(
    @inject(TYPES.QuoteManager) quoteManager: QuoteManager
  ) {
    this.quoteManager = quoteManager;
  }

  getIdentifier(): string {
    return 'quote';
  }

  handle(message: Message): Promise<Message | Message[]>  {
    return message.channel.send(this.quoteManager.get());
  }
}
