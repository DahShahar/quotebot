import { Message, MessageReaction } from 'discord.js';

export interface CompoundMessageHandler {
  handleMessage(message: Message): Promise<Message | Message[] | MessageReaction>;
}
