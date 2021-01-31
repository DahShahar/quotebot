import { Message, MessageReaction } from 'discord.js';

export interface MessageHandler {
  getUsage(): string;
  getIdentifier(): string;
  handle(message: Message): Promise<Message | Message[] | MessageReaction>;
}
