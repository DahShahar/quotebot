import {Message} from 'discord.js';
import {MessageHandler} from './message-handler';
import {CompoundMessageHandler} from './compound-message-handler';
import {injectable, inject} from 'inversify';
import {TYPES} from '../types';

@injectable()
export class QuoteBotMessageHandler implements CompoundMessageHandler {
  private messageHandlers: MessageHandler[];
  private qualifier: string;

  constructor(
    @inject(TYPES.MessageHandlers) messageHandlers: MessageHandler[],
    @inject(TYPES.Qualifier) qualifier: string
  ) {
    this.messageHandlers = messageHandlers;
    this.qualifier = qualifier;
  }

  handleMessage(message: Message): Promise<Message | Message[]> {
    if (this.shouldIgnoreMessage(message)) {
      return Promise.reject();
    }

    // as part of checking if we should ignore this message,
    // we verified it started with the qualifier
    message.content = message.content.substring(this.qualifier.length);

    for (let handler of this.messageHandlers) {
      if (handler.identify(message)) {
        message.content = message.content.substring(handler.getIdentifier().length);
        return handler.handle(message);
      }
    }

    return Promise.reject();
  }

  shouldIgnoreMessage(message: Message): boolean {
    if (!message.content.startsWith(this.qualifier)) {
      return true;
    } else if (message.author.bot) {
      return true;
    }
    return false;
  }
}
