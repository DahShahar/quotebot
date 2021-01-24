import {Message} from 'discord.js';
import {MessageHandler} from './message-handler';
import {injectable} from 'inversify';

@injectable()
export class EchoHandler implements MessageHandler {

  getIdentifier(): string {
    return 'echo';
  }

  identify(message: Message): boolean {
    return message.content.startsWith(this.getIdentifier());
  }

  handle(message: Message): Promise<Message | Message[]> {
    return message.reply(message.content);
  }

}
