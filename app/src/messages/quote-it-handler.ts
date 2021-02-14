import { Message, MessageReaction } from 'discord.js';
import { MessageHandler } from './message-handler';
import { QuoteBuilder, QuoteManager } from '../quotes';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

@injectable()
export class QuoteItHandler implements MessageHandler {
  private quoteManager: QuoteManager;

  constructor(@inject(TYPES.QuoteManager) quoteManager: QuoteManager) {
    this.quoteManager = quoteManager;
  }

  getIdentifier(): string {
    return 'quoteit';
  }

  getUsage(): string {
    return `${this.getIdentifier()} : Reply to a message with this command to add it as a quote`;
  }

  handle(message: Message): Promise<Message | Message[] | MessageReaction> {
    const repliedToReference = message.reference;
    if (repliedToReference === null || typeof repliedToReference === 'undefined') {
      return message.react('👎');
    }

    const repliedToMessageId = repliedToReference.messageID;
    if (repliedToMessageId === null || typeof repliedToMessageId === 'undefined') {
      return message.react('👎');
    }

    return message.channel.messages.fetch(repliedToMessageId).then((repliedToMessage) => {
      const quote = new QuoteBuilder()
        .withQuote(repliedToMessage.content)
        .withAuthor(repliedToMessage.author.username)
        .withBlamer(message.author.username)
        .build();

      this.quoteManager.add(quote).catch((err) => {
        console.error(err);
      });
      return message.react('👍');
    });
  }
}
