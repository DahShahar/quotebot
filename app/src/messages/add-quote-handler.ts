import {Message} from 'discord.js';
import {MessageHandler} from './message-handler';
import {injectable} from 'inversify';

@injectable()
export class AddQuoteHandler implements MessageHandler {

  private quotes: string[] = [];

  getIdentifier() {
    return 'addquote';
  }

  identify(message: Message): boolean {
    return message.content.startsWith(this.getIdentifier());
  }

  handle(message: Message)  {
    this.quotes.push(message.content);
    console.log(this.quotes);
    return message.reply('Added Quote!');
  }
}
