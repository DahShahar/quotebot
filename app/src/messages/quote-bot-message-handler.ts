import {Message} from 'discord.js';
import {MessageHandler} from './message-handler';
import {CompoundMessageHandler} from './compound-message-handler';
import {injectable, inject} from 'inversify';
import {TYPES} from '../types';

@injectable()
export class QuoteBotMessageHandler implements CompoundMessageHandler {
  private qualifierToHandlerMapping: Map<string, MessageHandler>;
  private messageHandlers: MessageHandler[];
  private qualifier: string;

  constructor(
    @inject(TYPES.MessageHandlers) messageHandlers: MessageHandler[],
    @inject(TYPES.Qualifier) qualifier: string
  ) {
    this.messageHandlers = messageHandlers;
    this.qualifier = qualifier;

    this.qualifierToHandlerMapping = new Map<string, MessageHandler>();
    for (const handler of messageHandlers) {
      this.qualifierToHandlerMapping.set(handler.getIdentifier(), handler);
    }
  }

  handleMessage(message: Message): Promise<Message | Message[]> {
    if (this.shouldIgnoreMessage(message)) {
      return Promise.reject();
    }

    // as part of checking if we should ignore this message,
    // we verified it started with the qualifier
    message.content = message.content.substring(this.qualifier.length);
    const [qualifier, restOfTheMessage] = message.content.split(/ (.*)/, 2);

    const handler = this.qualifierToHandlerMapping.get(qualifier);
    if (handler === undefined) {
      return Promise.reject();
    }

    message.content = restOfTheMessage;
    return handler.handle(message);
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
