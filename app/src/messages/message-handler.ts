import { Message, MessageReaction } from 'discord.js';

export interface MessageHandler {
  /**
   * Return a usage string so that we know how to invoke this handler and what it does.
   */
  getUsage(): string;
  /**
   * The keyword to tell the bot to know to invoke this. Should line up with getUsage()
   */
  getIdentifier(): string;
  /**
   * Handle the message. Content is the altered content, without any qualifier or identifier, but you can get the full original message
   * as passed in as well.
   */
  handle(content: string, message: Message): Promise<Message | Message[] | MessageReaction>;
}
