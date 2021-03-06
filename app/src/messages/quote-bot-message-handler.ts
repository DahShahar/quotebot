import { Message, MessageReaction } from 'discord.js';
import { MessageHandler } from './message-handler';
import { CompoundMessageHandler } from './compound-message-handler';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

@injectable()
export class QuoteBotMessageHandler implements CompoundMessageHandler {
  private qualifierToHandlerMapping: Map<string, MessageHandler>;
  private messageHandlers: MessageHandler[];
  private qualifier: string;

  private usage: string[];

  constructor(
    @inject(TYPES.MessageHandlers) messageHandlers: MessageHandler[],
    @inject(TYPES.Qualifier) qualifier: string
  ) {
    this.messageHandlers = messageHandlers;
    this.qualifier = qualifier;

    this.qualifierToHandlerMapping = new Map<string, MessageHandler>();
    this.usage = [
      `To send the bot a command prefix your command with ${this.qualifier}.`,
      "Send a message such as '!echo hello world' to see what happens. A failure will react with a 👎",
      '-------------------------------------------------------------------------',
      'usage or help: display this message',
    ];
    for (const handler of messageHandlers) {
      this.qualifierToHandlerMapping.set(handler.getIdentifier(), handler);
      this.usage.push(handler.getUsage());
    }
  }

  /**
   * Routes messages to the correct handler to handle them.
   */
  handleMessage(message: Message): Promise<Message | Message[] | MessageReaction> {
    if (this.shouldIgnoreMessage(message)) {
      return Promise.reject();
    }

    console.log('Handling message:', message.content);

    // as part of checking if we should ignore this message,
    // we verified it started with the qualifier
    const content = message.content.substring(this.qualifier.length);
    const [qualifier, commandMessagePart] = content.split(/ (.*)/, 2);
    let commandMessage = commandMessagePart;

    if (qualifier === 'usage' || qualifier === 'help') {
      return message.author.send(this.usage);
    }

    const handler = this.qualifierToHandlerMapping.get(qualifier);
    if (handler === undefined) {
      return Promise.reject();
    }

    if (commandMessage === undefined) {
      commandMessage = '';
    }

    return handler.handle(commandMessage, message);
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
