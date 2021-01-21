import {Message} from 'discord.js';
import {MessageHandler} from './message-handler';
import {injectable} from 'inversify';

@injectable()
export class EchoHandler implements MessageHandler {

  constructor() {}

  identify(message: Message): boolean {
    return message.content.startsWith('!echo');
  }

  handle(message: Message): Promise<Message | Message[]> {
    return message.reply(message.content);
  }

}
