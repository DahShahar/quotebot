import {Message} from 'discord.js';
import {MessageHandler} from './message-handler';
import {injectable, inject} from 'inversify';
import {TYPES} from '../types';

@injectable()
export class EchoHandler implements MessageHandler {

  getIdentifier() {
    return 'echo';
  }

  identify(message: Message): boolean {
    return message.content.startsWith(this.getIdentifier());
  }

  handle(message: Message): Promise<Message | Message[]> {
    return message.reply(message.content);
  }

}
