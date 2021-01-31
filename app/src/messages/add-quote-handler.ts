import { Message } from 'discord.js';
import { MessageHandler } from './message-handler';
import { QuoteManager } from '../quotes/quote-manager';
import { QuoteBuilder } from '../quotes/quote-builder';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

@injectable()
export class AddQuoteHandler implements MessageHandler {
  private quoteManager: QuoteManager;

  constructor(@inject(TYPES.QuoteManager) quoteManager: QuoteManager) {
    this.quoteManager = quoteManager;
  }

  getIdentifier(): string {
    return 'addquote';
  }

  getUsage(): string {
    return `${this.getIdentifier()} [quote]: adds [quote] from this channel. Must be verbatim. It looks back in the history to see who authored it. Will fail if can't find anything (it's too old, or there's a typo)`;
  }

  handle(message: Message): Promise<Message | Message[]> {
    const origContent = message.content;
    return message.channel.messages.fetch().then((fetchedMessages) => {
      const originalMessage: Message | undefined = fetchedMessages.find((m) => {
        return m.id !== message.id && m.content === origContent;
      });

      if (originalMessage === undefined) {
        return message.author.send("Couldn't find who or what you're trying to quote :(");
      }

      const quote = new QuoteBuilder()
        .withQuote(origContent)
        .withBlamer(message.author.username)
        .withAuthor(originalMessage.author.username)
        .build();

      this.quoteManager.add(quote);
      return message.channel.send(`Added quote! Original by: ${quote.author}, added by: ${quote.blamer}`);
    });
  }
}
